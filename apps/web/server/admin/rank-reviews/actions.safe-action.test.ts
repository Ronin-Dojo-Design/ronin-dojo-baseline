/**
 * D-046 — rank-review decision integration contract.
 *
 * These tests invoke the wrapped safe actions against disposable real Postgres rows. A captured
 * PROMOTER_CHANGED proposal is an immutable compare-and-swap snapshot: the accepted promoter stays
 * active until an admin approves, approval applies the proposal and verifies atomically, and denial
 * leaves the accepted provenance untouched. Every invalid or raced decision fails closed.
 *
 * Run with the canonical DB-backed Bun target:
 *   bun --env-file=.env test server/admin/rank-reviews/actions.safe-action.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test"
import { createRouterClient } from "@orpc/server"
import { Brand } from "~/.generated/prisma/client"

// IMPORTANT: install safe-action mocks before dynamically importing the action module.
import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

const revalidatedPaths: string[] = []

installSafeActionMocks({ brand: "BBL" })
mock.module("next/cache", () => ({
  revalidatePath: (path: string) => revalidatedPaths.push(path),
  revalidateTag: () => {},
  updateTag: () => {},
  cacheLife: () => {},
  cacheTag: () => {},
}))
mock.module("server-only", () => ({}))

import { syncRankEntryFromAward } from "~/server/belt/rank-entry-compatibility"
import { db } from "~/services/db"

const { approveRankEntryReview, denyRankEntryReview } =
  await import("~/server/admin/rank-reviews/actions")
const { approveCapturedPromoterReview } = await import("~/server/belt/promoter-proposal-core")
const { appRouter } = await import("~/server/router")
const { findPendingPromoterReviews, findPromoterReviewById } =
  await import("~/server/admin/rank-reviews/queries")

const TS = Date.now()
const PREFIX = `rank-review-decisions-${TS}`
const tag = (name: string) => `${PREFIX}-${name}`
const CAPTURED_AT = new Date("2026-07-15T12:00:00.000Z")
const ACCEPTED_PROMOTER_NAME = "Accepted Coach A"

type AwardStatus = "UNVERIFIED" | "VERIFIED" | "DISPUTED"
type ReviewStatus = "PENDING" | "APPROVED" | "DENIED" | "PROPOSAL_PENDING"
type ReviewReason = "NEW_RANK" | "PROMOTER_CHANGED" | "SCHOOL_CHANGED" | "DISPUTE"

type ReviewFixture = {
  awardId: string
  entryId: string
  memberPassportId: string
  reviewId: string
}

type FixtureSet = {
  adminUserId: string
  memberUserId: string
  promoterAId: string
  promoterBId: string
  promoterCId: string
  unauthenticated: ReviewFixture
  nonAdmin: ReviewFixture
  approve: ReviewFixture
  deny: ReviewFixture
  wrongReason: ReviewFixture
  alreadyDecided: ReviewFixture
  stale: ReviewFixture
  oldWriterBarrier: ReviewFixture
  concurrent: ReviewFixture
  approveVsOverride: ReviewFixture
  mergeVsApprove: ReviewFixture
  mergeVsOverride: ReviewFixture
  rollback: ReviewFixture
}

let fx: FixtureSet | null = null

type CreateReviewFixtureOptions = {
  key: string
  rankId: string
  activePromoterPassportId: string | null
  activePromoterName?: string | null
  awardStatus?: AwardStatus
  reviewStatus?: ReviewStatus
  reason?: ReviewReason
  proposalCapturedAt?: Date | null
  expectedPromoterPassportId?: string | null
  expectedPromoterName?: string | null
  proposedPromoterPassportId?: string | null
}

async function createReviewFixture({
  key,
  rankId,
  activePromoterPassportId,
  activePromoterName = ACCEPTED_PROMOTER_NAME,
  awardStatus = "UNVERIFIED",
  reviewStatus = "PROPOSAL_PENDING",
  reason = "PROMOTER_CHANGED",
  proposalCapturedAt = CAPTURED_AT,
  expectedPromoterPassportId = activePromoterPassportId,
  expectedPromoterName = activePromoterName,
  proposedPromoterPassportId,
}: CreateReviewFixtureOptions): Promise<ReviewFixture> {
  const member = await db.user.create({
    data: {
      id: tag(`${key}-user`),
      name: tag(`${key}-member`),
      email: `${tag(`${key}-member`)}@test.local`,
      role: "user",
    },
    select: { id: true },
  })
  const passport = await db.passport.create({
    data: {
      id: tag(`${key}-passport`),
      displayName: tag(`${key}-member`),
      userId: member.id,
    },
    select: { id: true },
  })
  const award = await db.rankAward.create({
    data: {
      passportId: passport.id,
      rankId,
      source: "STATED",
      verificationStatus: awardStatus,
      awardedByPassportId: activePromoterPassportId,
      notes: activePromoterName,
    },
    select: { id: true },
  })

  await syncRankEntryFromAward(db, award.id)
  const entry = await db.rankEntry.findUniqueOrThrow({
    where: { rankAwardId: award.id },
    select: { id: true },
  })
  const review = await db.rankEntryReview.create({
    data: {
      rankEntryId: entry.id,
      status: reviewStatus,
      reason,
      proposalCapturedAt,
      expectedPromoterPassportId,
      expectedPromoterName,
      proposedPromoterPassportId,
    },
    select: { id: true },
  })

  return {
    awardId: award.id,
    entryId: entry.id,
    memberPassportId: passport.id,
    reviewId: review.id,
  }
}

async function provenanceState(fixture: ReviewFixture) {
  // PrismaPg's current adapter cannot safely overlap client.query calls on one checked-out client.
  // Keep fixture inspection sequential; the dedicated race tests below still exercise concurrency.
  const award = await db.rankAward.findUniqueOrThrow({
    where: { id: fixture.awardId },
    select: {
      awardedByPassportId: true,
      notes: true,
      verificationStatus: true,
    },
  })
  const entry = await db.rankEntry.findUniqueOrThrow({
    where: { id: fixture.entryId },
    select: { status: true },
  })
  const review = await db.rankEntryReview.findUniqueOrThrow({
    where: { id: fixture.reviewId },
    select: {
      status: true,
      reason: true,
      proposalCapturedAt: true,
      expectedPromoterPassportId: true,
      expectedPromoterName: true,
      proposedPromoterPassportId: true,
    },
  })
  const audits = await db.auditLog.findMany({
    where: {
      OR: [
        { entityType: "RankEntry", entityId: fixture.entryId },
        { entityType: "RankEntryReview", entityId: fixture.reviewId },
        { entityType: "RankAward", entityId: fixture.awardId },
      ],
    },
    select: {
      action: true,
      entityType: true,
      entityId: true,
      userId: true,
      before: true,
      after: true,
    },
    orderBy: { createdAt: "asc" },
  })

  return { award, entry, review, audits }
}

async function expectFailClosed(
  fixture: ReviewFixture,
  decide: () => Promise<{ serverError?: string; data?: unknown } | undefined>,
) {
  const before = await provenanceState(fixture)
  const result = await decide()

  expect(result?.serverError).toBeTruthy()
  expect(result?.data).toBeUndefined()
  expect(await provenanceState(fixture)).toEqual(before)
}

async function holdPassportForMerge(passportId: string) {
  let announce!: (pid: number) => void
  const ready = new Promise<number>(resolve => {
    announce = resolve
  })
  let release!: () => void
  const released = new Promise<void>(resolve => {
    release = resolve
  })
  const done = db.$transaction(
    async tx => {
      const [backend] = await tx.$queryRaw<Array<{ pid: number }>>`
        SELECT pg_backend_pid() AS "pid"
      `
      await tx.$queryRaw`SELECT "id" FROM "Passport" WHERE "id" = ${passportId} FOR UPDATE`
      if (!backend) throw new Error("Could not resolve the merge blocker backend")
      announce(backend.pid)
      await released
    },
    { timeout: 10000 },
  )
  return { pid: await ready, release, done }
}

async function waitUntilBlockedBy(blockerPid: number): Promise<boolean> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const [state] = await db.$queryRaw<Array<{ waiting: boolean }>>`
      SELECT EXISTS (
        SELECT 1
        FROM pg_stat_activity activity
        WHERE ${blockerPid} = ANY(pg_blocking_pids(activity.pid))
      ) AS "waiting"
    `
    if (state?.waiting) return true
    await new Promise(resolve => setTimeout(resolve, 20))
  }
  return false
}

async function proveAwardTierIsStillUnlocked(rankAwardId: string) {
  return db.$transaction(async tx => {
    await tx.$executeRawUnsafe("SET LOCAL lock_timeout = '300ms'")
    return tx.$queryRaw`SELECT "id" FROM "RankAward" WHERE "id" = ${rankAwardId} FOR UPDATE`
  })
}

beforeAll(async () => {
  const admin = await db.user.create({
    data: {
      id: tag("admin"),
      name: tag("admin"),
      email: `${tag("admin")}@test.local`,
      role: "admin",
    },
    select: { id: true },
  })
  const member = await db.user.create({
    data: {
      id: tag("ordinary-user"),
      name: tag("ordinary-user"),
      email: `${tag("ordinary-user")}@test.local`,
      role: "user",
    },
    select: { id: true },
  })
  const promoterA = await db.passport.create({
    data: { id: tag("promoter-a"), displayName: ACCEPTED_PROMOTER_NAME },
    select: { id: true },
  })
  const promoterB = await db.passport.create({
    data: { id: tag("promoter-b"), displayName: "Proposed Coach B" },
    select: { id: true },
  })
  const promoterC = await db.passport.create({
    data: { id: tag("promoter-c"), displayName: "Unexpected Active Coach C" },
    select: { id: true },
  })
  const rank = await db.rank.findFirstOrThrow({
    where: { name: "White Belt", rankSystem: { discipline: { code: "bjj" } } },
    select: { id: true },
  })

  const common = {
    rankId: rank.id,
    activePromoterPassportId: promoterA.id,
    proposedPromoterPassportId: promoterB.id,
  }

  const unauthenticated = await createReviewFixture({ key: "unauthenticated", ...common })
  const nonAdmin = await createReviewFixture({ key: "non-admin", ...common })
  const approve = await createReviewFixture({ key: "approve", ...common })
  const deny = await createReviewFixture({ key: "deny", ...common, awardStatus: "VERIFIED" })
  const wrongReason = await createReviewFixture({
    key: "wrong-reason",
    ...common,
    reason: "SCHOOL_CHANGED",
  })
  const alreadyDecided = await createReviewFixture({
    key: "already-decided",
    ...common,
    reviewStatus: "DENIED",
  })
  const stale = await createReviewFixture({
    key: "stale",
    ...common,
    activePromoterPassportId: promoterC.id,
    activePromoterName: "Unexpected Active Coach C",
    expectedPromoterPassportId: promoterA.id,
    expectedPromoterName: ACCEPTED_PROMOTER_NAME,
  })
  const oldWriterBarrier = await createReviewFixture({ key: "old-writer-barrier", ...common })
  const concurrent = await createReviewFixture({ key: "concurrent", ...common })
  const approveVsOverride = await createReviewFixture({ key: "approve-vs-override", ...common })
  const mergeVsApprove = await createReviewFixture({ key: "merge-vs-approve", ...common })
  const mergeVsOverride = await createReviewFixture({ key: "merge-vs-override", ...common })
  const rollback = await createReviewFixture({ key: "rollback", ...common })

  fx = {
    adminUserId: admin.id,
    memberUserId: member.id,
    promoterAId: promoterA.id,
    promoterBId: promoterB.id,
    promoterCId: promoterC.id,
    unauthenticated,
    nonAdmin,
    approve,
    deny,
    wrongReason,
    alreadyDecided,
    stale,
    oldWriterBarrier,
    concurrent,
    approveVsOverride,
    mergeVsApprove,
    mergeVsOverride,
    rollback,
  }
}, 90_000)

afterAll(async () => {
  await db.auditLog.deleteMany({ where: { userId: { startsWith: PREFIX } } })
  await db.rankEntryReview.deleteMany({
    where: { rankEntry: { passportId: { startsWith: PREFIX } } },
  })
  await db.rankAward.deleteMany({ where: { passportId: { startsWith: PREFIX } } })
  await db.passport.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await db.user.deleteMany({ where: { id: { startsWith: PREFIX } } })
}, 90_000)

describe("rank-review decisions — captured PROMOTER_CHANGED proposal", () => {
  it("lists the immutable proposed promoter and keeps terminal details addressable", async () => {
    if (!fx) throw new Error("fixture not initialized")

    const queue = await findPendingPromoterReviews({
      page: 1,
      perPage: 100,
      sort: [{ id: "createdAt", desc: false }],
    })
    const row = queue.rows.find(review => review.id === fx!.approve.reviewId)
    expect(row?.proposedPromoterPassportId).toBe(fx.promoterBId)
    expect(row?.proposedPromoter?.id).toBe(fx.promoterBId)

    const terminal = await findPromoterReviewById(fx.alreadyDecided.reviewId)
    expect(terminal?.status).toBe("DENIED")
    expect(terminal?.proposedPromoterPassportId).toBe(fx.promoterBId)
  })

  it("rejects an unauthenticated approve and leaves provenance untouched", async () => {
    if (!fx) throw new Error("fixture not initialized")
    setTestSession(null)
    const before = await provenanceState(fx.unauthenticated)

    const result = await approveRankEntryReview({ reviewId: fx.unauthenticated.reviewId })

    expect(result?.serverError).toBe("User not authenticated")
    expect(result?.data).toBeUndefined()
    expect(await provenanceState(fx.unauthenticated)).toEqual(before)
  })

  it("rejects a non-admin denial and leaves provenance untouched", async () => {
    if (!fx) throw new Error("fixture not initialized")
    setTestSession({ id: fx.memberUserId, role: "user" })
    const before = await provenanceState(fx.nonAdmin)

    const result = await denyRankEntryReview({ reviewId: fx.nonAdmin.reviewId })

    expect(result?.serverError).toBe("User not authorized")
    expect(result?.data).toBeUndefined()
    expect(await provenanceState(fx.nonAdmin)).toEqual(before)
  })

  it("approves atomically: conditionally applies B, verifies award+entry, closes review, and audits both decisions", async () => {
    if (!fx) throw new Error("fixture not initialized")
    setTestSession({ id: fx.adminUserId, role: "admin" })

    const result = await approveRankEntryReview({ reviewId: fx.approve.reviewId })

    expect(result?.serverError).toBeUndefined()
    expect(result?.validationErrors).toBeUndefined()
    expect(result?.data?.reviewId).toBe(fx.approve.reviewId)

    const state = await provenanceState(fx.approve)
    expect(state.award).toEqual({
      awardedByPassportId: fx.promoterBId,
      notes: null,
      verificationStatus: "VERIFIED",
    })
    expect(state.entry.status).toBe("VERIFIED")
    expect(state.review).toEqual({
      status: "APPROVED",
      reason: "PROMOTER_CHANGED",
      proposalCapturedAt: CAPTURED_AT,
      expectedPromoterPassportId: fx.promoterAId,
      expectedPromoterName: ACCEPTED_PROMOTER_NAME,
      proposedPromoterPassportId: fx.promoterBId,
    })
    expect(state.audits.map(audit => audit.action).sort()).toEqual([
      "belt.entry.verified",
      "belt.fact.promoter_applied",
      "belt.review.approved",
    ])
    expect(state.audits.find(audit => audit.action === "belt.review.approved")).toMatchObject({
      userId: fx.adminUserId,
      before: {
        status: "PROPOSAL_PENDING",
        expectedPromoterPassportId: fx.promoterAId,
        expectedPromoterName: ACCEPTED_PROMOTER_NAME,
        proposedPromoterPassportId: fx.promoterBId,
      },
      after: {
        status: "APPROVED",
        appliedPromoterPassportId: fx.promoterBId,
      },
    })
    expect(state.audits.find(audit => audit.action === "belt.fact.promoter_applied")).toMatchObject(
      {
        userId: fx.adminUserId,
        before: {
          awardedByPassportId: fx.promoterAId,
          promoterName: ACCEPTED_PROMOTER_NAME,
        },
        after: { awardedByPassportId: fx.promoterBId, promoterName: null },
      },
    )
    expect((await findPromoterReviewById(fx.approve.reviewId))?.status).toBe("APPROVED")
  })

  it("denies without changing accepted A or prior award/entry status, and audits belt.review.denied", async () => {
    if (!fx) throw new Error("fixture not initialized")
    setTestSession({ id: fx.adminUserId, role: "admin" })
    const before = await provenanceState(fx.deny)
    revalidatedPaths.length = 0

    const result = await denyRankEntryReview({ reviewId: fx.deny.reviewId })

    expect(result?.serverError).toBeUndefined()
    expect(result?.validationErrors).toBeUndefined()
    expect(result?.data?.reviewId).toBe(fx.deny.reviewId)

    const after = await provenanceState(fx.deny)
    expect(after.award).toEqual(before.award)
    expect(after.entry).toEqual(before.entry)
    expect(after.review).toEqual({ ...before.review, status: "DENIED" })
    expect(after.audits.map(audit => audit.action)).toEqual(["belt.review.denied"])
    expect(after.audits[0]).toMatchObject({
      userId: fx.adminUserId,
      before: {
        status: "PROPOSAL_PENDING",
        expectedPromoterPassportId: fx.promoterAId,
        expectedPromoterName: ACCEPTED_PROMOTER_NAME,
        proposedPromoterPassportId: fx.promoterBId,
      },
      after: { status: "DENIED" },
    })
    expect(revalidatedPaths).toContain("/app/profile")
  })

  it("fails closed for the wrong review reason", async () => {
    if (!fx) throw new Error("fixture not initialized")
    setTestSession({ id: fx.adminUserId, role: "admin" })
    await expectFailClosed(fx.wrongReason, () =>
      approveRankEntryReview({ reviewId: fx!.wrongReason.reviewId }),
    )
  })

  it("accepts a rolling-window legacy review in the expand schema but refuses to decide it", async () => {
    if (!fx) throw new Error("fixture not initialized")
    setTestSession({ id: fx.adminUserId, role: "admin" })

    // Expand/contract rollout: the first migration must remain compatible with an old instance
    // that writes a payload-less review after migrations run but before the new app is active.
    // Runtime decisions fail closed; the later contract migration adds the DB CHECK after the
    // old writer has drained and operators have resolved any rows from that window.
    const legacy = await db.rankEntryReview.create({
      data: {
        rankEntryId: fx.alreadyDecided.entryId,
        status: "PENDING",
        reason: "PROMOTER_CHANGED",
      },
      select: { id: true },
    })
    const legacyFixture = { ...fx.alreadyDecided, reviewId: legacy.id }

    try {
      const queue = await findPendingPromoterReviews({ page: 1, perPage: 100, sort: [] })
      expect(queue.rows.some(review => review.id === legacy.id)).toBe(true)
      await expectFailClosed(legacyFixture, () => approveRankEntryReview({ reviewId: legacy.id }))
    } finally {
      await db.rankEntryReview.delete({ where: { id: legacy.id } })
    }
  })

  it("keeps a captured proposal non-actionable to the previous-release PENDING approver", async () => {
    if (!fx) throw new Error("fixture not initialized")
    const before = await provenanceState(fx.oldWriterBarrier)

    // Compatibility executable: the immediately previous release loaded by id, required the
    // exact legacy PENDING value, then verified the entry and marked the review APPROVED. The new
    // discriminator must stop that code before either mutation, even for a guessed/direct id.
    const previousReleaseApprove = (reviewId: string) =>
      db.$transaction(async tx => {
        const review = await tx.rankEntryReview.findUniqueOrThrow({
          where: { id: reviewId },
          select: { id: true, status: true, rankEntryId: true },
        })
        if (review.status !== "PENDING") throw new Error("This review has already been actioned.")
        await tx.rankEntry.update({
          where: { id: review.rankEntryId },
          data: { status: "VERIFIED" },
        })
        await tx.rankEntryReview.update({
          where: { id: review.id },
          data: { status: "APPROVED" },
        })
      })

    await expect(previousReleaseApprove(fx.oldWriterBarrier.reviewId)).rejects.toThrow(
      "already been actioned",
    )
    expect(await provenanceState(fx.oldWriterBarrier)).toEqual(before)
  })

  it("rolls back review, promoter, trust, and audits when the approval transaction aborts", async () => {
    if (!fx) throw new Error("fixture not initialized")
    const before = await provenanceState(fx.rollback)

    await expect(
      db.$transaction(async tx => {
        await approveCapturedPromoterReview(tx, fx!.rollback.reviewId, {
          brand: Brand.BBL,
          userId: fx!.adminUserId,
        })
        throw new Error("forced rollback after approval mutations")
      }),
    ).rejects.toThrow("forced rollback")

    expect(await provenanceState(fx.rollback)).toEqual(before)
  })

  it("fails closed for an already-decided review", async () => {
    if (!fx) throw new Error("fixture not initialized")
    setTestSession({ id: fx.adminUserId, role: "admin" })
    await expectFailClosed(fx.alreadyDecided, () =>
      approveRankEntryReview({ reviewId: fx!.alreadyDecided.reviewId }),
    )
  })

  it("fails closed when accepted provenance no longer matches the captured expectation", async () => {
    if (!fx) throw new Error("fixture not initialized")
    setTestSession({ id: fx.adminUserId, role: "admin" })
    await expectFailClosed(fx.stale, () => approveRankEntryReview({ reviewId: fx!.stale.reviewId }))
  })

  it("waits for a merge-owned proposed Passport before locking the approval Award or Review", async () => {
    if (!fx) throw new Error("fixture not initialized")
    setTestSession({ id: fx.adminUserId, role: "admin" })
    const held = await holdPassportForMerge(fx.promoterBId)
    const approval = approveRankEntryReview({ reviewId: fx.mergeVsApprove.reviewId })
    let outcomes: PromiseSettledResult<unknown>[] = []

    try {
      expect(await waitUntilBlockedBy(held.pid)).toBe(true)

      // The former Award→Review→Passport path already owned this Award while waiting for B,
      // completing the merge cycle. The fixed path must still be in its Passport tier.
      await expect(proveAwardTierIsStillUnlocked(fx.mergeVsApprove.awardId)).resolves.toBeDefined()
    } finally {
      held.release()
      outcomes = await Promise.allSettled([held.done, approval])
    }

    expect(outcomes[0]?.status).toBe("fulfilled")
    expect(outcomes[1]?.status).toBe("fulfilled")
    if (outcomes[1]?.status !== "fulfilled") throw outcomes[1]?.reason
    const result = outcomes[1].value as Awaited<ReturnType<typeof approveRankEntryReview>>
    expect(result?.data?.reviewId).toBe(fx.mergeVsApprove.reviewId)
    expect((await provenanceState(fx.mergeVsApprove)).review.status).toBe("APPROVED")
  }, 30_000)

  it("waits for a merge-owned replacement Passport before locking the override Award or Review", async () => {
    if (!fx) throw new Error("fixture not initialized")
    const adminBelt = createRouterClient(appRouter, {
      context: {
        user: { id: fx.adminUserId, role: "admin" } as never,
        source: "rsc" as const,
        brand: Brand.BBL,
      },
    }).belt
    const held = await holdPassportForMerge(fx.promoterCId)
    const override = adminBelt.overrideRankAwardPromoterAsAdmin({
      rankAwardId: fx.mergeVsOverride.awardId,
      promoter: { awardedByPassportId: fx.promoterCId },
    })
    let outcomes: PromiseSettledResult<unknown>[] = []

    try {
      expect(await waitUntilBlockedBy(held.pid)).toBe(true)
      await expect(proveAwardTierIsStillUnlocked(fx.mergeVsOverride.awardId)).resolves.toBeDefined()
    } finally {
      held.release()
      outcomes = await Promise.allSettled([held.done, override])
    }

    expect(outcomes.map(outcome => outcome.status)).toEqual(["fulfilled", "fulfilled"])
    const state = await provenanceState(fx.mergeVsOverride)
    expect(state.review.status).toBe("DENIED")
    expect(state.award.awardedByPassportId).toBe(fx.promoterCId)
    expect(state.audits.map(audit => audit.action).sort()).toEqual([
      "belt.fact.promoter_overridden",
      "belt.review.denied_by_override",
    ])
  }, 30_000)

  it("allows exactly one of two concurrent approvals, with no partial or duplicate decision state", async () => {
    if (!fx) throw new Error("fixture not initialized")
    setTestSession({ id: fx.adminUserId, role: "admin" })

    const results = await Promise.all([
      approveRankEntryReview({ reviewId: fx.concurrent.reviewId }),
      approveRankEntryReview({ reviewId: fx.concurrent.reviewId }),
    ])
    const successes = results.filter(result => result?.data?.reviewId === fx!.concurrent.reviewId)
    const failures = results.filter(result => Boolean(result?.serverError))

    expect(successes).toHaveLength(1)
    expect(failures).toHaveLength(1)
    expect(failures[0]?.serverError).toBeTruthy()

    const state = await provenanceState(fx.concurrent)
    expect(state.award).toEqual({
      awardedByPassportId: fx.promoterBId,
      notes: null,
      verificationStatus: "VERIFIED",
    })
    expect(state.entry.status).toBe("VERIFIED")
    expect(state.review.status).toBe("APPROVED")
    expect(state.audits.map(audit => audit.action).sort()).toEqual([
      "belt.entry.verified",
      "belt.fact.promoter_applied",
      "belt.review.approved",
    ])
  }, 30_000)

  it("serializes approve versus explicit override without a partial or split decision", async () => {
    if (!fx) throw new Error("fixture not initialized")
    setTestSession({ id: fx.adminUserId, role: "admin" })
    const adminBelt = createRouterClient(appRouter, {
      context: {
        user: { id: fx.adminUserId, role: "admin" } as never,
        source: "rsc" as const,
        brand: Brand.BBL,
      },
    }).belt

    const [approval, override] = await Promise.allSettled([
      approveRankEntryReview({ reviewId: fx.approveVsOverride.reviewId }),
      adminBelt.overrideRankAwardPromoterAsAdmin({
        rankAwardId: fx.approveVsOverride.awardId,
        promoter: { awardedByPassportId: fx.promoterCId },
      }),
    ])
    const approvalWon =
      approval.status === "fulfilled" &&
      approval.value?.data?.reviewId === fx.approveVsOverride.reviewId
    const overrideWon = override.status === "fulfilled"
    expect(Number(approvalWon) + Number(overrideWon)).toBe(1)

    const state = await provenanceState(fx.approveVsOverride)
    if (approvalWon) {
      expect(state.review.status).toBe("APPROVED")
      expect(state.award).toEqual({
        awardedByPassportId: fx.promoterBId,
        notes: null,
        verificationStatus: "VERIFIED",
      })
      expect(state.audits.map(audit => audit.action).sort()).toEqual([
        "belt.entry.verified",
        "belt.fact.promoter_applied",
        "belt.review.approved",
      ])
    } else {
      expect(state.review.status).toBe("DENIED")
      expect(state.award).toEqual({
        awardedByPassportId: fx.promoterCId,
        notes: null,
        verificationStatus: "UNVERIFIED",
      })
      expect(state.audits.map(audit => audit.action).sort()).toEqual([
        "belt.fact.promoter_overridden",
        "belt.review.denied_by_override",
      ])
    }
  }, 30_000)
})
