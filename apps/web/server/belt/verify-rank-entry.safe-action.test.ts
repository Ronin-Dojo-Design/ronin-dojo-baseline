/**
 * SESSION_0523 A3 — `verifyRankEntry` integration coverage for the standalone path
 * that flips an unreviewed self-submit belt UNVERIFIED → VERIFIED.
 *
 * `verifyRankEntry` is a next-safe-action `adminActionClient` that opens its OWN
 * `db.$transaction`, so it is invoked end-to-end through the wrapped export with the
 * shared safe-action mock harness (session + next/cache + next/headers), NOT the
 * rolled-back-tx pattern. Fixtures are real rows created in `beforeAll` and swept in
 * `afterAll` (tag-scoped), mirroring the `.safe-action` siblings. Awards + their synced
 * `RankEntry` are minted via `syncRankEntryFromAward` — the SAME helper the code uses.
 *
 * Coverage:
 *   - a platform admin verifies an UNVERIFIED STATED entry → award VERIFIED, entry
 *     VERIFIED, return `{ rankEntryId, passportId, rankId }`;
 *   - authz: a non-admin (and an unauthenticated caller) is rejected, entry untouched;
 *   - idempotent re-verify of an already-VERIFIED entry is a no-op end-state;
 *   - an IMPORTED-backed award keeps its IMPORTED provenance while its entry stays VERIFIED
 *     (the code only promotes non-IMPORTED / non-VERIFIED awards).
 *   - an open promoter-change review rejects standalone verification without mutating the review,
 *     award, entry, or audit history.
 *
 * `verifyRankEntry` sends no email, so no notify seam is stubbed.
 *
 * Run: cd apps/web && bun run test server/belt/verify-rank-entry.safe-action.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test"

// IMPORTANT: install safe-action mocks BEFORE any module that touches `~/server`,
// `~/lib/auth`, `next/headers`, or `next/cache` is imported.
import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

installSafeActionMocks({ brand: "BBL" })
// The production core is correctly marked `server-only`; Bun's test resolver does not
// install that marker package, so stub it before dynamically importing the action.
mock.module("server-only", () => ({}))

import { syncRankEntryFromAward } from "~/server/belt/rank-entry-compatibility"
import { db } from "~/services/db"

const { verifyRankEntry } = await import("~/server/belt/verify-rank-entry")

const TS = Date.now()
const PREFIX = `verify-rank-entry-${TS}`
const tag = (name: string) => `${PREFIX}-${name}`

/** Resolve a seeded BJJ rank id by exact name (the ladder the app rides — never a fork). */
async function bjjRankId(name: string): Promise<string> {
  const rank = await db.rank.findFirstOrThrow({
    where: { name, rankSystem: { discipline: { code: "bjj" } } },
    select: { id: true },
  })
  return rank.id
}

type Fixture = {
  adminUserId: string
  memberUserId: string
  memberPassportId: string
  // one entry per case (distinct ranks — RankAward is @@unique([passportId, rankId]))
  verifyEntryId: string // UNVERIFIED → the admin flips it
  rejectEntryId: string // UNVERIFIED → the authz-rejection target (stays UNVERIFIED)
  importedAwardId: string
  importedEntryId: string // derived VERIFIED off an IMPORTED award
  openReviewAwardId: string
  openReviewEntryId: string
  openReviewId: string
  promoterUserIds: string[]
  promoterPassportIds: string[]
}

let fx: Fixture | null = null

/** Create a STATED award for `rankId` + its synced RankEntry; return `{ awardId, entryId }`. */
async function makeAwardWithEntry(
  passportId: string,
  rankId: string,
  verificationStatus: "UNVERIFIED" | "IMPORTED",
  awardedByPassportId?: string,
): Promise<{ awardId: string; entryId: string }> {
  const award = await db.rankAward.create({
    data: {
      passportId,
      rankId,
      source: "STATED",
      verificationStatus,
      ...(awardedByPassportId ? { awardedByPassportId } : {}),
    },
    select: { id: true },
  })
  await syncRankEntryFromAward(db, award.id)
  const entry = await db.rankEntry.findUniqueOrThrow({
    where: { rankAwardId: award.id },
    select: { id: true },
  })
  return { awardId: award.id, entryId: entry.id }
}

beforeAll(async () => {
  const adminUser = await db.user.create({
    data: {
      id: tag("admin"),
      name: tag("admin"),
      email: `${tag("admin")}@test.local`,
      role: "admin",
    },
    select: { id: true },
  })
  const memberUser = await db.user.create({
    data: { id: tag("member"), name: tag("member"), email: `${tag("member")}@test.local` },
    select: { id: true },
  })
  const memberPassport = await db.passport.create({
    data: { displayName: tag("member-pp"), userId: memberUser.id },
    select: { id: true },
  })
  const acceptedPromoterUser = await db.user.create({
    data: {
      name: tag("accepted-promoter"),
      email: `${tag("accepted-promoter")}@test.local`,
    },
    select: { id: true },
  })
  const proposedPromoterUser = await db.user.create({
    data: {
      name: tag("proposed-promoter"),
      email: `${tag("proposed-promoter")}@test.local`,
    },
    select: { id: true },
  })
  const acceptedPromoter = await db.passport.create({
    data: { displayName: tag("accepted-promoter"), userId: acceptedPromoterUser.id },
    select: { id: true },
  })
  const proposedPromoter = await db.passport.create({
    data: { displayName: tag("proposed-promoter"), userId: proposedPromoterUser.id },
    select: { id: true },
  })

  const whiteRankId = await bjjRankId("White Belt")
  const blueRankId = await bjjRankId("Blue Belt")
  const purpleRankId = await bjjRankId("Purple Belt")
  const brownRankId = await bjjRankId("Brown Belt")

  const verify = await makeAwardWithEntry(memberPassport.id, whiteRankId, "UNVERIFIED")
  const reject = await makeAwardWithEntry(memberPassport.id, purpleRankId, "UNVERIFIED")
  const imported = await makeAwardWithEntry(memberPassport.id, blueRankId, "IMPORTED")
  const openReviewTarget = await makeAwardWithEntry(
    memberPassport.id,
    brownRankId,
    "UNVERIFIED",
    acceptedPromoter.id,
  )
  const openReview = await db.rankEntryReview.create({
    data: {
      rankEntryId: openReviewTarget.entryId,
      status: "PROPOSAL_PENDING",
      reason: "PROMOTER_CHANGED",
      proposalCapturedAt: new Date(),
      expectedPromoterPassportId: acceptedPromoter.id,
      proposedPromoterPassportId: proposedPromoter.id,
    },
    select: { id: true },
  })

  fx = {
    adminUserId: adminUser.id,
    memberUserId: memberUser.id,
    memberPassportId: memberPassport.id,
    verifyEntryId: verify.entryId,
    rejectEntryId: reject.entryId,
    importedAwardId: imported.awardId,
    importedEntryId: imported.entryId,
    openReviewAwardId: openReviewTarget.awardId,
    openReviewEntryId: openReviewTarget.entryId,
    openReviewId: openReview.id,
    promoterUserIds: [acceptedPromoterUser.id, proposedPromoterUser.id],
    promoterPassportIds: [acceptedPromoter.id, proposedPromoter.id],
  }
})

afterAll(async () => {
  if (!fx) return
  await db.auditLog.deleteMany({ where: { userId: fx.adminUserId } })
  // RankEntry cascades off both RankAward and Passport; delete awards then passport.
  await db.rankAward.deleteMany({ where: { passportId: fx.memberPassportId } })
  await db.passport.deleteMany({
    where: { id: { in: [fx.memberPassportId, ...fx.promoterPassportIds] } },
  })
  await db.user.deleteMany({
    where: { id: { in: [fx.adminUserId, fx.memberUserId, ...fx.promoterUserIds] } },
  })
})

describe("verifyRankEntry — standalone self-submit UNVERIFIED → VERIFIED path (A3)", () => {
  it("returns serverError 'User not authenticated' when no session (entry untouched)", async () => {
    if (!fx) throw new Error("fixture not initialized")
    setTestSession(null)

    const result = await verifyRankEntry({ rankEntryId: fx.rejectEntryId })

    expect(result?.serverError).toBe("User not authenticated")
    expect(result?.data).toBeUndefined()
    const entry = await db.rankEntry.findUniqueOrThrow({
      where: { id: fx.rejectEntryId },
      select: { status: true },
    })
    expect(entry.status).toBe("UNVERIFIED")
  })

  it("returns serverError 'User not authorized' for a non-admin (entry + award untouched)", async () => {
    if (!fx) throw new Error("fixture not initialized")
    setTestSession({ id: fx.memberUserId, role: "user" })

    const result = await verifyRankEntry({ rankEntryId: fx.rejectEntryId })

    expect(result?.serverError).toBe("User not authorized")
    expect(result?.data).toBeUndefined()

    const entry = await db.rankEntry.findUniqueOrThrow({
      where: { id: fx.rejectEntryId },
      select: { status: true, rankAward: { select: { verificationStatus: true } } },
    })
    expect(entry.status).toBe("UNVERIFIED")
    expect(entry.rankAward.verificationStatus).toBe("UNVERIFIED")
  })

  it("a platform admin flips an UNVERIFIED STATED entry → award VERIFIED + entry VERIFIED, returns ids", async () => {
    if (!fx) throw new Error("fixture not initialized")
    setTestSession({ id: fx.adminUserId, role: "admin" })

    const result = await verifyRankEntry({ rankEntryId: fx.verifyEntryId })

    expect(result?.serverError).toBeUndefined()
    expect(result?.validationErrors).toBeUndefined()
    expect(result?.data?.rankEntryId).toBe(fx.verifyEntryId)
    expect(result?.data?.passportId).toBe(fx.memberPassportId)
    expect(result?.data?.rankId).toBeTruthy()

    const entry = await db.rankEntry.findUniqueOrThrow({
      where: { id: fx.verifyEntryId },
      select: { status: true, rankId: true, rankAward: { select: { verificationStatus: true } } },
    })
    expect(entry.status).toBe("VERIFIED")
    expect(entry.rankAward.verificationStatus).toBe("VERIFIED")
    expect(result?.data?.rankId).toBe(entry.rankId)

    // The admin mutation is audited (established pattern).
    const audit = await db.auditLog.findFirst({
      where: { entityType: "RankEntry", entityId: fx.verifyEntryId, userId: fx.adminUserId },
      orderBy: { createdAt: "desc" },
      select: { action: true },
    })
    expect(audit?.action).toBe("belt.entry.verified")
  })

  it("is idempotent — re-verifying an already-VERIFIED entry is a no-op end-state", async () => {
    if (!fx) throw new Error("fixture not initialized")
    setTestSession({ id: fx.adminUserId, role: "admin" })

    const result = await verifyRankEntry({ rankEntryId: fx.verifyEntryId })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.rankEntryId).toBe(fx.verifyEntryId)
    const entry = await db.rankEntry.findUniqueOrThrow({
      where: { id: fx.verifyEntryId },
      select: { status: true, rankAward: { select: { verificationStatus: true } } },
    })
    expect(entry.status).toBe("VERIFIED")
    expect(entry.rankAward.verificationStatus).toBe("VERIFIED")
  })

  it("keeps an IMPORTED award's provenance while its entry derives/stays VERIFIED", async () => {
    if (!fx) throw new Error("fixture not initialized")
    setTestSession({ id: fx.adminUserId, role: "admin" })

    const result = await verifyRankEntry({ rankEntryId: fx.importedEntryId })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.rankEntryId).toBe(fx.importedEntryId)

    // The code only promotes non-IMPORTED / non-VERIFIED awards: the award STAYS IMPORTED,
    // and its member-facing entry stays VERIFIED (IMPORTED derives to VERIFIED).
    const award = await db.rankAward.findUniqueOrThrow({
      where: { id: fx.importedAwardId },
      select: { verificationStatus: true },
    })
    expect(award.verificationStatus).toBe("IMPORTED")
    const entry = await db.rankEntry.findUniqueOrThrow({
      where: { id: fx.importedEntryId },
      select: { status: true },
    })
    expect(entry.status).toBe("VERIFIED")
  })

  it("rejects an open promoter review without changing the review, award, entry, or audit", async () => {
    if (!fx) throw new Error("fixture not initialized")
    setTestSession({ id: fx.adminUserId, role: "admin" })

    const reviewBefore = await db.rankEntryReview.findUniqueOrThrow({
      where: { id: fx.openReviewId },
      select: {
        status: true,
        expectedPromoterPassportId: true,
        proposedPromoterPassportId: true,
        updatedAt: true,
      },
    })
    const entryBefore = await db.rankEntry.findUniqueOrThrow({
      where: { id: fx.openReviewEntryId },
      select: { status: true },
    })
    const awardBefore = await db.rankAward.findUniqueOrThrow({
      where: { id: fx.openReviewAwardId },
      select: { verificationStatus: true, awardedByPassportId: true },
    })
    const auditCountBefore = await db.auditLog.count({
      where: {
        action: "belt.entry.verified",
        entityType: "RankEntry",
        entityId: fx.openReviewEntryId,
        userId: fx.adminUserId,
      },
    })

    const result = await verifyRankEntry({ rankEntryId: fx.openReviewEntryId })

    expect(result?.serverError).toBe(
      "Resolve the open promoter-change review before verifying this rank.",
    )
    expect(result?.data).toBeUndefined()
    expect(
      await db.rankEntryReview.findUniqueOrThrow({
        where: { id: fx.openReviewId },
        select: {
          status: true,
          expectedPromoterPassportId: true,
          proposedPromoterPassportId: true,
          updatedAt: true,
        },
      }),
    ).toEqual(reviewBefore)
    expect(
      await db.rankEntry.findUniqueOrThrow({
        where: { id: fx.openReviewEntryId },
        select: { status: true },
      }),
    ).toEqual(entryBefore)
    expect(
      await db.rankAward.findUniqueOrThrow({
        where: { id: fx.openReviewAwardId },
        select: { verificationStatus: true, awardedByPassportId: true },
      }),
    ).toEqual(awardBefore)
    expect(
      await db.auditLog.count({
        where: {
          action: "belt.entry.verified",
          entityType: "RankEntry",
          entityId: fx.openReviewEntryId,
          userId: fx.adminUserId,
        },
      }),
    ).toBe(auditCountBefore)
  })
})
