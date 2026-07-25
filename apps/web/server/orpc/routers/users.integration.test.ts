/**
 * Admin users oRPC procedures — authz + behavior + cache-contract integration test
 * (WL-P2-43, SESSION_0697; mirrors `server/lineage/storyboard-router.integration.test.ts`).
 *
 * Carries forward the proofs of the retired safe-action tests
 * (`server/admin/users/{role-change,create-person,delete-users}.safe-action.test.ts`) against
 * the migrated `users` router, invoked through the live oRPC pipeline (`createRouterClient`
 * with an injected session context, `source: "rsc"` → rate-limit skipped):
 *
 *   1. ADVERSARIAL AUTHZ — an anonymous caller gets UNAUTHORIZED and a plain signed-in
 *      member gets FORBIDDEN on EVERY mutation (`meta.permission = "users.manage"`,
 *      deny-by-default), with no phantom write.
 *   2. ROLE CHANGE (WL-P2-20 / risk-register #11) — self-role-change is FORBIDDEN (via both
 *      `updateRole` and the generic `update`) and leaves the role unchanged; a legitimate
 *      change writes the before/after audit row keyed to the acting admin.
 *   3. CREATE PERSON (SESSION_0519 regression) — the add-person transaction creates the
 *      UNVERIFIED RankAward AND its canonical RankEntry twin.
 *   4. DELETE — a referenced coach Passport fails closed (CONFLICT) preserving award/review
 *      history; an unreferenced non-admin cascades while admins are always excluded.
 *   5. CACHE CONTRACT (the WL-P2-43 point) — every subtree-affecting mutation issues the
 *      LAYOUT-typed `/app/users` revalidation from INSIDE the procedure (the third
 *      revalidation idiom died with the safe-action seam bypass), and `remove` keeps the
 *      plain-path revalidate it always had.
 *
 * Run: cd apps/web && bun run test server/orpc/routers/users.integration.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep.
import { afterAll, beforeAll, beforeEach, describe, expect, it, mock } from "bun:test"
import { createRouterClient, ORPCError } from "@orpc/server"

// The root app router joins the belt proposal core, whose transaction-only modules are marked
// `server-only`. Bun does not provide Next's poison-package shim in its test runtime.
mock.module("server-only", () => ({}))

// Recording seams: layout-typed revalidation is the WL-P2-43 contract, so capture the
// (path, type) PAIR — a plain-path call must not satisfy a layout assertion.
const recordedPaths: Array<{ path: string; type: string | undefined }> = []
const recordedTags: string[] = []

mock.module("next/cache", () => ({
  revalidatePath: (path: string, type?: string) => {
    recordedPaths.push({ path, type })
  },
  updateTag: (tag: string) => {
    recordedTags.push(tag)
  },
  revalidateTag: (tag: string) => {
    recordedTags.push(tag)
  },
  cacheLife: () => {},
  cacheTag: () => {},
}))

// `after()` runs outside a request scope in bun tests — track + flush (the
// `lib/test/safe-action-env.ts` idiom) so deferred work stays deterministic.
const afterTasks: Array<Promise<unknown>> = []
mock.module("next/server", () => ({
  after: (fn: () => void | Promise<void>) => {
    afterTasks.push(Promise.resolve().then(() => fn()))
  },
}))

// `remove` defers S3 directory cleanup into `after()` — never touch real storage from a
// unit test. Other exports get inert stubs (the appRouter chain imports them; the tests
// here never exercise those paths).
mock.module("~/lib/media", () => ({
  removeS3Directories: async () => {},
  removeS3Directory: async () => {},
  removeS3File: async () => {},
  uploadToS3Storage: async () => "",
  resolveDisplayAvatar: (image: string | null) => image ?? null,
  resolvePublicMediaUrl: (path: string) => path,
  getS3KeyFromUrl: () => null,
  getFaviconFetchUrl: (url: string) => url,
  getScreenshotFetchUrl: (url: string) => url,
}))

// The ANONYMOUS case must reach the permission gate as a real null user: without
// this seam `withSession` falls through to the live `getServerSession()`, whose
// `headers()` call explodes outside a request scope.
mock.module("~/lib/auth", () => ({
  getServerSession: async () => null,
  auth: {},
}))

import { Brand } from "~/.generated/prisma/client"
import { db } from "~/services/db"

const { appRouter } = await import("~/server/router")

const TS = Date.now()
const TAG_PREFIX = "users-router-test-"
const tag = (name: string) => `${TAG_PREFIX}${TS}-${name}`

type SessionUser = { id: string; role: string | null } | null

/** Invoke the users router as a given session (rsc source → no rate limit). */
const asUser = (user: SessionUser) =>
  createRouterClient(appRouter, {
    context: { user: user as never, source: "rsc" as const, brand: Brand.BBL },
  }).users

let adminUserId = ""
let memberUserId = ""
let targetUserId = ""
let rankId = ""
let disciplineId = ""
const createdPassportIds: string[] = []

beforeAll(async () => {
  const [admin, member, target, rank] = await Promise.all([
    db.user.create({
      data: { name: tag("admin"), email: `${tag("admin")}@test.local`, role: "admin" },
      select: { id: true },
    }),
    db.user.create({
      data: { name: tag("member"), email: `${tag("member")}@test.local`, role: "user" },
      select: { id: true },
    }),
    db.user.create({
      data: { name: tag("target"), email: `${tag("target")}@test.local`, role: "user" },
      select: { id: true },
    }),
    db.rank.findFirstOrThrow({
      select: { id: true, rankSystem: { select: { disciplineId: true } } },
    }),
  ])
  adminUserId = admin.id
  memberUserId = member.id
  targetUserId = target.id
  rankId = rank.id
  disciplineId = rank.rankSystem?.disciplineId as string
})

afterAll(async () => {
  const userIds = [adminUserId, memberUserId, targetUserId].filter(Boolean)
  await db.auditLog.deleteMany({ where: { userId: { in: userIds } } })
  if (createdPassportIds.length) {
    await db.rankEntry.deleteMany({ where: { passportId: { in: createdPassportIds } } })
    await db.rankAward.deleteMany({ where: { passportId: { in: createdPassportIds } } })
    await db.affiliation.deleteMany({ where: { passportId: { in: createdPassportIds } } })
    await db.passport.deleteMany({ where: { id: { in: createdPassportIds } } })
  }
  await db.session.deleteMany({ where: { userId: { in: userIds } } })
  await db.user.deleteMany({ where: { id: { in: userIds } } })
  // Zombie sweep for crashed prior runs (tag-scoped).
  await db.user.deleteMany({ where: { email: { startsWith: TAG_PREFIX } } })
  await db.passport.deleteMany({ where: { displayName: { startsWith: TAG_PREFIX } } })
})

beforeEach(() => {
  recordedPaths.length = 0
  recordedTags.length = 0
  afterTasks.length = 0
})

const anonymous = () => asUser(null)
const member = () => asUser({ id: memberUserId, role: "user" })
const admin = () => asUser({ id: adminUserId, role: "admin" })

const expectCode = async (
  promise: Promise<unknown>,
  code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "BAD_REQUEST" | "CONFLICT",
) => {
  try {
    await promise
    throw new Error(`expected the call to reject with ${code}`)
  } catch (error) {
    expect(error).toBeInstanceOf(ORPCError)
    expect((error as ORPCError<string, unknown>).code).toBe(code)
  }
}

/** The WL-P2-43 contract: the procedure issued the LAYOUT-typed /app/users revalidation. */
const expectUsersLayoutRevalidated = () => {
  expect(recordedPaths).toContainEqual({ path: "/app/users", type: "layout" })
}

const latestRoleAudit = (entityId: string) =>
  db.auditLog.findFirst({
    where: { action: "user.role.changed", entityId },
    // `id` tiebreak so two audit rows sharing a `now()` tick resolve deterministically.
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  })

// ---------------------------------------------------------------------------
// 1. ADVERSARIAL AUTHZ FIRST — deny-by-default on every mutation.
// ---------------------------------------------------------------------------

describe("users authz — the GAINER's adversarial cases first", () => {
  it("DENIES every mutation for an ANONYMOUS caller (UNAUTHORIZED)", async () => {
    await expectCode(anonymous().update({ id: targetUserId, name: "x" }), "UNAUTHORIZED")
    await expectCode(anonymous().updateRole({ id: targetUserId, role: "admin" }), "UNAUTHORIZED")
    await expectCode(anonymous().remove({ ids: [targetUserId] }), "UNAUTHORIZED")
    await expectCode(
      anonymous().createPerson({ name: tag("anon-person"), disciplineId, rankId }),
      "UNAUTHORIZED",
    )
  })

  it("DENIES every mutation for a plain signed-in MEMBER (FORBIDDEN — users.manage gate)", async () => {
    await expectCode(member().update({ id: targetUserId, name: "x" }), "FORBIDDEN")
    await expectCode(member().updateRole({ id: memberUserId, role: "admin" }), "FORBIDDEN")
    await expectCode(member().remove({ ids: [targetUserId] }), "FORBIDDEN")
    await expectCode(
      member().createPerson({ name: tag("member-person"), disciplineId, rankId }),
      "FORBIDDEN",
    )
  })

  it("writes NO phantom changes and revalidates NOTHING on a denied call", async () => {
    // The denied call happens INSIDE this test (beforeEach clears the recorders), so the
    // zero-revalidation assert is against THIS rejection, not an empty array by default.
    await expectCode(member().updateRole({ id: targetUserId, role: "admin" }), "FORBIDDEN")

    const [target, wouldBeAdmin] = await Promise.all([
      db.user.findUnique({ where: { id: targetUserId }, select: { role: true } }),
      db.user.findUnique({ where: { id: memberUserId }, select: { role: true } }),
    ])
    expect(target?.role).toBe("user")
    expect(wouldBeAdmin?.role).toBe("user")
    expect(recordedPaths).toHaveLength(0)
    expect(recordedTags).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// 2. Role change — gate + self-guard + audit (WL-P2-20 / risk-register #11).
// ---------------------------------------------------------------------------

describe("updateRole — self-guard + audit", () => {
  it("blocks an admin changing their OWN role and leaves it unchanged", async () => {
    await expectCode(admin().updateRole({ id: adminUserId, role: "user" }), "FORBIDDEN")
    const still = await db.user.findUnique({ where: { id: adminUserId }, select: { role: true } })
    expect(still?.role).toBe("admin")
  })

  it("changes another user's role, writes the audit row, and layout-revalidates /app/users", async () => {
    const updated = await admin().updateRole({ id: targetUserId, role: "tournament_director" })
    expect(updated.role).toBe("tournament_director")

    const audit = await latestRoleAudit(targetUserId)
    expect(audit?.userId).toBe(adminUserId)
    expect((audit?.before as { role?: string } | null)?.role).toBe("user")
    expect((audit?.after as { role?: string } | null)?.role).toBe("tournament_director")

    expectUsersLayoutRevalidated()
  })
})

describe("update — role change through the generic edit is audited + self-guarded", () => {
  it("audits a role change made via update and layout-revalidates /app/users", async () => {
    // Seed the precondition explicitly so this case stands alone: a same-role update
    // would be a no-op and write no audit row.
    await db.user.update({ where: { id: targetUserId }, data: { role: "tournament_director" } })

    const updated = await admin().update({ id: targetUserId, role: "user" })
    expect(updated.role).toBe("user")

    const audit = await latestRoleAudit(targetUserId)
    expect((audit?.before as { role?: string } | null)?.role).toBe("tournament_director")
    expect((audit?.after as { role?: string } | null)?.role).toBe("user")

    expectUsersLayoutRevalidated()
  })

  it("blocks a self role-change via update", async () => {
    await expectCode(admin().update({ id: adminUserId, role: "user" }), "FORBIDDEN")
    const still = await db.user.findUnique({ where: { id: adminUserId }, select: { role: true } })
    expect(still?.role).toBe("admin")
  })

  it("rejects a missing id with BAD_REQUEST", async () => {
    await expectCode(admin().update({ name: "no-id" }), "BAD_REQUEST")
  })
})

// ---------------------------------------------------------------------------
// 3. createPerson — RankEntry compatibility (SESSION_0519 regression).
// ---------------------------------------------------------------------------

describe("createPerson — RankEntry compatibility", () => {
  it("creates the UNVERIFIED RankAward and matching RankEntry in the add-person transaction", async () => {
    const result = await admin().createPerson({
      name: tag("person"),
      displayName: tag("display"),
      disciplineId,
      rankId,
      affiliationRole: "TRAINS_AT",
    })

    expect(result.rankAwardId).toBeDefined()
    createdPassportIds.push(result.id)

    const [award, entry] = await Promise.all([
      db.rankAward.findUnique({
        where: { id: result.rankAwardId },
        select: { passportId: true, rankId: true, verificationStatus: true },
      }),
      db.rankEntry.findUnique({
        where: { rankAwardId: result.rankAwardId },
        select: { passportId: true, rankId: true, status: true },
      }),
    ])

    expect(award).toEqual({ passportId: result.id, rankId, verificationStatus: "UNVERIFIED" })
    expect(entry).toEqual({ passportId: result.id, rankId, status: "UNVERIFIED" })

    expectUsersLayoutRevalidated()
  })
})

// ---------------------------------------------------------------------------
// 4. remove — referenced promoter identity fails closed; cascade preserved.
// ---------------------------------------------------------------------------

describe("remove — referenced promoter identity", () => {
  let coachUserId = ""
  let coachPassportId = ""
  let subjectPassportId = ""
  let awardId = ""
  let entryId = ""

  beforeAll(async () => {
    const coach = await db.user.create({
      data: { name: tag("coach"), email: `${tag("coach")}@test.local`, role: "user" },
      select: { id: true },
    })
    coachUserId = coach.id

    const [coachPassport, subjectPassport] = await Promise.all([
      db.passport.create({ data: { displayName: tag("coach-passport"), userId: coach.id } }),
      db.passport.create({ data: { displayName: tag("subject-passport") } }),
    ])
    coachPassportId = coachPassport.id
    subjectPassportId = subjectPassport.id
    createdPassportIds.push(subjectPassportId)

    const award = await db.rankAward.create({
      data: {
        passportId: subjectPassport.id,
        rankId,
        source: "STATED",
        verificationStatus: "VERIFIED",
        awardedByPassportId: coachPassport.id,
      },
      select: { id: true },
    })
    awardId = award.id
    const entry = await db.rankEntry.create({
      data: {
        passportId: subjectPassport.id,
        rankId,
        rankAwardId: award.id,
        status: "VERIFIED",
      },
      select: { id: true },
    })
    entryId = entry.id
  })

  afterAll(async () => {
    if (entryId) await db.rankEntryReview.deleteMany({ where: { rankEntryId: entryId } })
    if (entryId) await db.rankEntry.deleteMany({ where: { id: entryId } })
    if (awardId) await db.rankAward.deleteMany({ where: { id: awardId } })
    await db.passport.deleteMany({ where: { id: { in: [coachPassportId].filter(Boolean) } } })
    await db.user.deleteMany({ where: { id: { in: [coachUserId].filter(Boolean) } } })
  })

  it("fails closed (CONFLICT) when a non-admin coach Passport is referenced by promotion history", async () => {
    await expectCode(admin().remove({ ids: [coachUserId, adminUserId] }), "CONFLICT")

    // Nothing was deleted or detached — the identity graph survives intact.
    expect(await db.user.findUnique({ where: { id: coachUserId } })).not.toBeNull()
    expect(
      await db.passport.findUnique({ where: { id: coachPassportId }, select: { userId: true } }),
    ).toEqual({ userId: coachUserId })
    expect(
      await db.rankAward.findUnique({
        where: { id: awardId },
        select: { awardedByPassportId: true },
      }),
    ).toEqual({ awardedByPassportId: coachPassportId })

    // The same bulk command still excludes the admin identity from deletion.
    expect(await db.user.findUnique({ where: { id: adminUserId } })).not.toBeNull()
  })

  it("preserves the cascade for an unreferenced non-admin while excluding admins, and path-revalidates", async () => {
    const user = await db.user.create({
      data: { name: tag("unreferenced"), email: `${tag("unreferenced")}@test.local`, role: "user" },
      select: { id: true },
    })
    const passport = await db.passport.create({
      data: { displayName: tag("unreferenced-passport"), userId: user.id },
      select: { id: true },
    })

    try {
      const result = await admin().remove({ ids: [user.id, adminUserId] })
      expect(result).toBe(true)

      expect(await db.user.findUnique({ where: { id: user.id } })).toBeNull()
      expect(await db.passport.findUnique({ where: { id: passport.id } })).toBeNull()
      expect(await db.user.findUnique({ where: { id: adminUserId } })).not.toBeNull()

      // remove keeps its original PLAIN-path revalidate (list-only surface).
      expect(recordedPaths).toContainEqual({ path: "/app/users", type: undefined })
    } finally {
      await db.passport.deleteMany({ where: { id: passport.id } })
      await db.user.deleteMany({ where: { id: user.id } })
    }
  })
})
