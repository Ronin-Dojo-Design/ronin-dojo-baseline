/**
 * Storyboard oRPC procedures — authz + id-space + cache-contract integration test
 * (Epic A1 — SESSION_0498 TASK_03; mirrors `server/belt/router.integration.test.ts`).
 *
 * Procedures are invoked through the live oRPC pipeline (`createRouterClient` with
 * an injected session context, `source: "rsc"` → rate-limit skipped). Proves, in
 * priority order (the belt-verification lesson — the GAINER's adversarial test first):
 *
 *   1. ADVERSARIAL AUTHZ — an anonymous caller gets UNAUTHORIZED and a plain
 *      signed-in member gets FORBIDDEN on EVERY mutation (`meta.permission =
 *      "lineage.manage"`, deny-by-default), with no phantom write.
 *   2. ID-SPACE (WL-P1-8, the SESSION_0497 P2003) — a NODE id fed into the
 *      passport-keyed input is refused with a clean BAD_REQUEST, never a raw P2003;
 *      the unique 1:1 conflict surfaces as CONFLICT.
 *   3. CACHE CONTRACT (Giddy A0 P3-4) — every mutation revalidates the `"lineage"`
 *      tag AND `lineage-ancestry-${passportId}` for the affected passport (asserted
 *      via a recording `next/cache` mock on the `revalidate` seam).
 *   4. Behavior — create/update/toggle round-trip, duplicate copies copy/media and
 *      lands DISABLED on the target, delete removes the row.
 *
 * Run: cd apps/web && bun run test server/lineage/storyboard-router.integration.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep.
import { afterAll, beforeAll, beforeEach, describe, expect, it, mock } from "bun:test"
import { createRouterClient, ORPCError } from "@orpc/server"

// Recording seams: `server/orpc/revalidate.ts` maps `tags` → `updateTag` and
// `paths` → `revalidatePath`, so capturing these proves the mutation's cache contract.
const recordedTags: string[] = []
const recordedPaths: string[] = []

mock.module("next/cache", () => ({
  revalidatePath: (path: string) => {
    recordedPaths.push(path)
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

// The ANONYMOUS case must reach the permission gate as a real null user: without
// this seam `withSession` falls through to the live `getServerSession()`, whose
// `headers()` call explodes outside a request scope (SOP §3c). Injected-user
// contexts short-circuit (`context.user ?? …`) and never hit the mock.
mock.module("~/lib/auth", () => ({
  getServerSession: async () => null,
  auth: {},
}))

import { Brand } from "~/.generated/prisma/client"
import { appRouter } from "~/server/router"
import { db } from "~/services/db"

const TS = Date.now()
const TAG_PREFIX = "storyboard-router-test-"
const tag = (name: string) => `${TAG_PREFIX}${TS}-${name}`

type SessionUser = { id: string; role: string | null } | null

/** Invoke the storyboard router as a given session (rsc source → no rate limit). */
const asUser = (user: SessionUser) =>
  createRouterClient(appRouter, {
    context: { user: user as never, source: "rsc" as const, brand: Brand.BBL },
  }).lineage.storyboard

type Fixtures = {
  personAPassportId: string
  personANodeId: string
  personBPassportId: string
  memberUserId: string
}

let fx: Fixtures

beforeAll(async () => {
  // Placeholder Passports (BBL roster idiom — no User needed) + one lineage node
  // for person A so the WL-P1-8 test can feed a REAL node id into the passport input.
  const personA = await db.passport.create({
    data: { displayName: tag("person-a") },
    select: { id: true },
  })
  const personB = await db.passport.create({
    data: { displayName: tag("person-b") },
    select: { id: true },
  })
  const nodeA = await db.lineageNode.create({
    data: { passportId: personA.id, visibility: "PUBLIC" },
    select: { id: true },
  })
  // A real signed-in member (role "user") — the authz GAINER boundary.
  const memberUser = await db.user.create({
    data: { name: tag("member"), email: `${tag("member")}@test.local` },
    select: { id: true },
  })

  fx = {
    personAPassportId: personA.id,
    personANodeId: nodeA.id,
    personBPassportId: personB.id,
    memberUserId: memberUser.id,
  }
})

afterAll(async () => {
  if (!fx) return
  const passportIds = [fx.personAPassportId, fx.personBPassportId]
  await db.lineageStoryScene.deleteMany({ where: { passportId: { in: passportIds } } })
  await db.lineageNode.deleteMany({ where: { passportId: { in: passportIds } } })
  await db.passport.deleteMany({ where: { id: { in: passportIds } } })
  await db.user.deleteMany({ where: { id: fx.memberUserId } })
  // Zombie sweep for crashed prior runs (tag-scoped).
  await db.lineageStoryScene.deleteMany({
    where: { passport: { displayName: { startsWith: TAG_PREFIX } } },
  })
  await db.lineageNode.deleteMany({
    where: { passport: { displayName: { startsWith: TAG_PREFIX } } },
  })
  await db.passport.deleteMany({ where: { displayName: { startsWith: TAG_PREFIX } } })
  await db.user.deleteMany({ where: { name: { startsWith: TAG_PREFIX } } })
})

beforeEach(() => {
  recordedTags.length = 0
  recordedPaths.length = 0
})

const anonymous = () => asUser(null)
const member = () => asUser({ id: fx.memberUserId, role: "user" })
const admin = () => asUser({ id: "storyboard-test-admin", role: "admin" })

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

const expectAncestryRevalidated = (passportId: string) => {
  expect(recordedTags).toContain("lineage")
  expect(recordedTags).toContain(`lineage-ancestry-${passportId}`)
  expect(recordedPaths).toContain("/app/lineage/storyboard")
}

// ---------------------------------------------------------------------------
// 1. ADVERSARIAL AUTHZ FIRST — deny-by-default on every mutation.
// ---------------------------------------------------------------------------

describe("storyboard authz — the GAINER's adversarial cases first", () => {
  it("DENIES every mutation for an ANONYMOUS caller (UNAUTHORIZED)", async () => {
    await expectCode(anonymous().create({ passportId: fx.personAPassportId }), "UNAUTHORIZED")
    await expectCode(anonymous().update({ sceneId: "any-scene-id" }), "UNAUTHORIZED")
    await expectCode(
      anonymous().setEnabled({ sceneId: "any-scene-id", enabled: false }),
      "UNAUTHORIZED",
    )
    await expectCode(
      anonymous().duplicate({ sceneId: "any-scene-id", targetPassportId: fx.personBPassportId }),
      "UNAUTHORIZED",
    )
    await expectCode(anonymous().remove({ sceneId: "any-scene-id" }), "UNAUTHORIZED")
  })

  it("DENIES every mutation for a plain signed-in MEMBER (FORBIDDEN — lineage.manage gate)", async () => {
    await expectCode(member().create({ passportId: fx.personAPassportId }), "FORBIDDEN")
    await expectCode(member().update({ sceneId: "any-scene-id" }), "FORBIDDEN")
    await expectCode(member().setEnabled({ sceneId: "any-scene-id", enabled: false }), "FORBIDDEN")
    await expectCode(
      member().duplicate({ sceneId: "any-scene-id", targetPassportId: fx.personBPassportId }),
      "FORBIDDEN",
    )
    await expectCode(member().remove({ sceneId: "any-scene-id" }), "FORBIDDEN")
  })

  it("writes NO phantom scene and revalidates NOTHING on a denied create", async () => {
    const leaked = await db.lineageStoryScene.findUnique({
      where: { passportId: fx.personAPassportId },
    })
    expect(leaked).toBeNull()
    expect(recordedTags).toHaveLength(0)
    expect(recordedPaths).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// 2. ID-SPACE + VALIDATION (WL-P1-8 / SESSION_0497 P2003 class).
// ---------------------------------------------------------------------------

describe("storyboard create — passport id-space + unique conflict", () => {
  it("REJECTS a NODE id fed into the passport input with BAD_REQUEST (WL-P1-8 — never a raw P2003)", async () => {
    // fx.personANodeId is a REAL LineageNode id — the exact wrong-id-space write
    // that P2003'd the belt save in SESSION_0497.
    await expectCode(admin().create({ passportId: fx.personANodeId }), "BAD_REQUEST")
    const leaked = await db.lineageStoryScene.findFirst({
      where: { passportId: fx.personANodeId },
    })
    expect(leaked).toBeNull()
  })

  it("CREATES a scene for a passport-keyed person and revalidates their ancestry cache", async () => {
    const result = await admin().create({
      passportId: fx.personAPassportId,
      quote: "  A test quote.  ",
      quoteAttribution: "Test provenance",
      sceneOrder: 7,
    })
    expect(result.sceneId).toBeTruthy()

    const row = await db.lineageStoryScene.findUniqueOrThrow({
      where: { passportId: fx.personAPassportId },
    })
    expect(row.quote).toBe("A test quote.") // trimmed
    expect(row.quoteAttribution).toBe("Test provenance")
    expect(row.sceneOrder).toBe(7)
    expect(row.enabled).toBe(true)

    expectAncestryRevalidated(fx.personAPassportId)
  })

  it("REJECTS a second scene for the same person with CONFLICT (passportId is 1:1)", async () => {
    await expectCode(admin().create({ passportId: fx.personAPassportId }), "CONFLICT")
  })
})

// ---------------------------------------------------------------------------
// 3. UPDATE / TOGGLE round-trip + cache contract.
// ---------------------------------------------------------------------------

describe("storyboard update / setEnabled — round-trip + revalidation", () => {
  it("UPDATES copy fields (undefined keeps, null clears) and revalidates the ancestry cache", async () => {
    const scene = await db.lineageStoryScene.findUniqueOrThrow({
      where: { passportId: fx.personAPassportId },
      select: { id: true },
    })

    await admin().update({
      sceneId: scene.id,
      quote: "Rewritten quote.",
      quoteAttribution: null, // explicit clear
      // storyBio undefined → untouched
      heroImageUrl: "https://example.test/hero.jpg",
    })

    const row = await db.lineageStoryScene.findUniqueOrThrow({ where: { id: scene.id } })
    expect(row.quote).toBe("Rewritten quote.")
    expect(row.quoteAttribution).toBeNull()
    expect(row.heroImageUrl).toBe("https://example.test/hero.jpg")
    expect(row.sceneOrder).toBe(7) // untouched by the partial update

    expectAncestryRevalidated(fx.personAPassportId)
  })

  it("TOGGLES enabled off and back on (round-trip), revalidating each time", async () => {
    const scene = await db.lineageStoryScene.findUniqueOrThrow({
      where: { passportId: fx.personAPassportId },
      select: { id: true },
    })

    const off = await admin().setEnabled({ sceneId: scene.id, enabled: false })
    expect(off.enabled).toBe(false)
    expect(
      (await db.lineageStoryScene.findUniqueOrThrow({ where: { id: scene.id } })).enabled,
    ).toBe(false)
    expectAncestryRevalidated(fx.personAPassportId)

    recordedTags.length = 0
    recordedPaths.length = 0

    const on = await admin().setEnabled({ sceneId: scene.id, enabled: true })
    expect(on.enabled).toBe(true)
    expect(
      (await db.lineageStoryScene.findUniqueOrThrow({ where: { id: scene.id } })).enabled,
    ).toBe(true)
    expectAncestryRevalidated(fx.personAPassportId)
  })

  it("404s an unknown scene id cleanly", async () => {
    await expectCode(admin().update({ sceneId: "scene-does-not-exist" }), "NOT_FOUND")
    await expectCode(
      admin().setEnabled({ sceneId: "scene-does-not-exist", enabled: true }),
      "NOT_FOUND",
    )
  })
})

// ---------------------------------------------------------------------------
// 4. DUPLICATE + DELETE.
// ---------------------------------------------------------------------------

describe("storyboard duplicate / remove", () => {
  it("DUPLICATES copy/media onto ANOTHER person — lands DISABLED + unordered, revalidates the TARGET", async () => {
    const source = await db.lineageStoryScene.findUniqueOrThrow({
      where: { passportId: fx.personAPassportId },
      select: { id: true },
    })

    const result = await admin().duplicate({
      sceneId: source.id,
      targetPassportId: fx.personBPassportId,
    })
    expect(result.sceneId).toBeTruthy()

    const copy = await db.lineageStoryScene.findUniqueOrThrow({
      where: { passportId: fx.personBPassportId },
    })
    expect(copy.quote).toBe("Rewritten quote.")
    expect(copy.heroImageUrl).toBe("https://example.test/hero.jpg")
    // The copied words still belong to the SOURCE person — a duplicate must never
    // auto-publish, and it takes no slot in the board order.
    expect(copy.enabled).toBe(false)
    expect(copy.sceneOrder).toBeNull()

    expectAncestryRevalidated(fx.personBPassportId)
  })

  it("REJECTS duplicating onto a person who already has a scene (CONFLICT)", async () => {
    const source = await db.lineageStoryScene.findUniqueOrThrow({
      where: { passportId: fx.personAPassportId },
      select: { id: true },
    })
    await expectCode(
      admin().duplicate({ sceneId: source.id, targetPassportId: fx.personBPassportId }),
      "CONFLICT",
    )
  })

  it("REJECTS duplicating onto a non-Passport target id with BAD_REQUEST (id-space guard)", async () => {
    const source = await db.lineageStoryScene.findUniqueOrThrow({
      where: { passportId: fx.personAPassportId },
      select: { id: true },
    })
    await expectCode(
      admin().duplicate({ sceneId: source.id, targetPassportId: fx.personANodeId }),
      "BAD_REQUEST",
    )
  })

  it("DELETES a scene (person untouched) and revalidates their ancestry cache", async () => {
    const copy = await db.lineageStoryScene.findUniqueOrThrow({
      where: { passportId: fx.personBPassportId },
      select: { id: true },
    })

    const result = await admin().remove({ sceneId: copy.id })
    expect(result.deleted).toBe(true)
    expect(await db.lineageStoryScene.findUnique({ where: { id: copy.id } })).toBeNull()
    // The person's Passport survives the scene delete.
    expect(
      await db.passport.findUnique({ where: { id: fx.personBPassportId }, select: { id: true } }),
    ).not.toBeNull()

    expectAncestryRevalidated(fx.personBPassportId)
  })
})
