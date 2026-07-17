/**
 * @added   SESSION_0542 (2026-07-16)
 * @why     Enforce immutable promoter proposals and steward decisions under one transaction lock law
 * @wired   server/belt/router.ts, server/admin/rank-reviews/actions.ts
 */
import "server-only"

import { ORPCError } from "@orpc/server"
import {
  Brand,
  type RankAwardVerificationStatus,
  RankEntryReviewReason,
  RankEntryReviewStatus,
} from "~/.generated/prisma/client"
import { OPEN_RANK_ENTRY_REVIEW_STATUSES } from "~/lib/belt/review-state"
import { decideBackfillPromoterTransition } from "~/server/belt/belt-gate"
import { getMemberAwards, resolveAnchorAward } from "~/server/belt/queries"
import { syncRankEntryFromAward } from "~/server/belt/rank-entry-compatibility"
import { verifyRankEntryInTransaction } from "~/server/belt/verify-rank-entry-core"
import { isRecruitedCoachIdentity } from "~/server/identity/promoter-classification"
import type { db } from "~/services/db"

/** The transaction surface shared by member proposals, admin decisions, override, and delete. */
export type PromoterProposalTx = Pick<
  typeof db,
  | "$queryRaw"
  | "auditLog"
  | "discipline"
  | "passport"
  | "rankAward"
  | "rankEntry"
  | "rankEntryReview"
>

export type PromoterFactData = {
  awardedByPassportId?: string | null
  notes?: string | null
}

type LockedPromoterAward = {
  id: string
  passportId: string
  verificationStatus: RankAwardVerificationStatus
  awardedByPassportId: string | null
  notes: string | null
}

const CAPTURED_REVIEW_SELECT = {
  id: true,
  status: true,
  reason: true,
  rankEntryId: true,
  proposalCapturedAt: true,
  expectedPromoterPassportId: true,
  expectedPromoterName: true,
  proposedPromoterPassportId: true,
} as const

/** Canonical first lock for award-local promoter workflows: RankAward → RankEntryReview. */
export async function lockRankAward(tx: PromoterProposalTx, rankAwardId: string): Promise<void> {
  await tx.$queryRaw`SELECT "id" FROM "RankAward" WHERE "id" = ${rankAwardId} FOR UPDATE`
}

async function lockRankEntryReview(tx: PromoterProposalTx, reviewId: string): Promise<void> {
  await tx.$queryRaw`SELECT "id" FROM "RankEntryReview" WHERE "id" = ${reviewId} FOR UPDATE`
}

async function readPromoterWorkflowReferences(tx: PromoterProposalTx, rankAwardId: string) {
  const award = await tx.rankAward.findUnique({
    where: { id: rankAwardId },
    select: { id: true, passportId: true, awardedByPassportId: true },
  })
  if (!award) return null

  const reviews = await tx.rankEntryReview.findMany({
    where: {
      rankEntry: { rankAwardId },
      status: { in: [...OPEN_RANK_ENTRY_REVIEW_STATUSES] },
      reason: RankEntryReviewReason.PROMOTER_CHANGED,
    },
    select: {
      id: true,
      expectedPromoterPassportId: true,
      proposedPromoterPassportId: true,
    },
    orderBy: { id: "asc" },
  })
  return { award, reviews }
}

type PromoterWorkflowReferences = Awaited<ReturnType<typeof readPromoterWorkflowReferences>>

/** Flatten one workflow snapshot into the Passport tier its locks depend on. */
function promoterReferencePassportIds(references: PromoterWorkflowReferences): string[] {
  if (!references) return []
  return [
    references.award.passportId,
    references.award.awardedByPassportId,
    ...references.reviews.flatMap(review => [
      review.expectedPromoterPassportId,
      review.proposedPromoterPassportId,
    ]),
  ].filter((id): id is string => Boolean(id))
}

/**
 * Global promoter-workflow lock law: every referenced Passport, then Award, then Review.
 *
 * Identity merge follows the same sorted tiers before repointing promoter FKs. Locking the full
 * Passport union first prevents a workflow from holding an Award while its FK write waits for a
 * coach Passport that merge already owns. Member decisions lock every award for the earner so the
 * authority anchor and the no-higher-award phantom barrier remain stable; award-local admin paths
 * lock only their target. A graph change that won before the Passport tier fails closed rather than
 * acquiring a newly discovered Passport out of order.
 */
export async function lockPromoterWorkflowScope({
  tx,
  rankAwardId,
  candidatePromoterPassportId,
  lockMemberAuthorityAwards,
}: {
  tx: PromoterProposalTx
  rankAwardId: string
  candidatePromoterPassportId?: string | null
  lockMemberAuthorityAwards: boolean
}): Promise<void> {
  const initial = await readPromoterWorkflowReferences(tx, rankAwardId)
  if (!initial) throw new Error("Rank award not found.")

  const lockedPassportIds = [
    ...new Set([
      ...promoterReferencePassportIds(initial),
      ...(candidatePromoterPassportId ? [candidatePromoterPassportId] : []),
    ]),
  ].sort()

  for (const passportId of lockedPassportIds) {
    const rows = await tx.$queryRaw<
      Array<{ id: string }>
    >`SELECT "id" FROM "Passport" WHERE "id" = ${passportId} FOR UPDATE`
    if (rows.length !== 1) {
      throw new Error("Promoter identity changed during this operation. Retry the operation.")
    }
  }

  if (lockMemberAuthorityAwards) {
    await tx.$queryRaw`SELECT "id" FROM "RankAward" WHERE "passportId" = ${initial.award.passportId} ORDER BY "id" FOR UPDATE`
  } else {
    await lockRankAward(tx, rankAwardId)
  }

  const lockedPassportIdSet = new Set(lockedPassportIds)
  const referencesAfterAwardLock = await readPromoterWorkflowReferences(tx, rankAwardId)
  const referencePassportIds = promoterReferencePassportIds(referencesAfterAwardLock)
  if (
    !referencesAfterAwardLock ||
    referencesAfterAwardLock.award.passportId !== initial.award.passportId ||
    referencePassportIds.some(id => !lockedPassportIdSet.has(id))
  ) {
    throw new Error("Promoter identity changed during this operation. Retry the operation.")
  }

  // A same-target workflow may have committed a review while this transaction waited for the
  // Passport tier. Its promoter refs are already in our locked union, and the earner Passport now
  // prevents any further graph change, so adopt the current Review set in deterministic order.
  const lockedReviewIds = referencesAfterAwardLock.reviews.map(review => review.id).sort()
  for (const reviewId of lockedReviewIds) await lockRankEntryReview(tx, reviewId)

  const current = await readPromoterWorkflowReferences(tx, rankAwardId)
  const lockedReviewIdSet = new Set(lockedReviewIds)
  const finalReferencePassportIds = promoterReferencePassportIds(current)
  if (
    !current ||
    current.award.passportId !== initial.award.passportId ||
    finalReferencePassportIds.some(id => !lockedPassportIdSet.has(id)) ||
    current.reviews.some(review => !lockedReviewIdSet.has(review.id))
  ) {
    throw new Error("Promoter identity changed during this operation. Retry the operation.")
  }
}

/** Stateless classification: accountless + no public identity satellite is the recruited exception. */
async function isRecruitedCoachPlaceholder(
  tx: PromoterProposalTx,
  promoterPassportId: string | null,
): Promise<boolean> {
  if (!promoterPassportId) return false
  const promoter = await tx.passport.findUnique({
    where: { id: promoterPassportId },
    select: {
      userId: true,
      lineageNode: { select: { id: true } },
      directoryProfile: { select: { id: true } },
    },
  })
  return isRecruitedCoachIdentity(promoter)
}

/**
 * Resolve and lock until the authority anchor is stable. A concurrent authority write can replace
 * anchor X with a newly authoritative higher award Y while this transaction waits for X; returning
 * after one re-read would leave Y unlocked. Tracking every acquired lock makes that turnover finite
 * and guarantees that the returned anchor is either the target or a row this transaction owns.
 */
export async function lockUntilStableAuthorityAnchor<T extends { id: string }>({
  targetAwardId,
  resolve,
  lock,
}: {
  targetAwardId: string
  resolve: () => Promise<T | null>
  lock: (rankAwardId: string) => Promise<void>
}): Promise<T | null> {
  const lockedAwardIds = new Set([targetAwardId])

  while (true) {
    const anchor = await resolve()
    if (!anchor || lockedAwardIds.has(anchor.id)) return anchor

    await lock(anchor.id)
    lockedAwardIds.add(anchor.id)
  }
}

async function resolveLockedAnchor(
  tx: PromoterProposalTx,
  passportId: string,
  disciplineId: string,
  targetAwardId: string,
) {
  return lockUntilStableAuthorityAnchor({
    targetAwardId,
    resolve: async () => resolveAnchorAward(await getMemberAwards(passportId, tx), disciplineId),
    lock: rankAwardId => lockRankAward(tx, rankAwardId),
  })
}

/**
 * Find and row-lock any open promoter workflow for an already-locked award. Captured proposals use
 * PROPOSAL_PENDING so the previous release's PENDING-only approver cannot corrupt them; legacy
 * PENDING rows still block a second proposal and fail closed in the captured-decision path.
 */
export async function findAndLockPendingPromoterReview(
  tx: PromoterProposalTx,
  rankAwardId: string,
) {
  const entry = await tx.rankEntry.findUnique({
    where: { rankAwardId },
    select: { id: true },
  })
  if (!entry) return null

  const identity = await tx.rankEntryReview.findFirst({
    where: {
      rankEntryId: entry.id,
      status: { in: [...OPEN_RANK_ENTRY_REVIEW_STATUSES] },
      reason: RankEntryReviewReason.PROMOTER_CHANGED,
    },
    select: { id: true },
  })
  if (!identity) return null

  await lockRankEntryReview(tx, identity.id)
  return tx.rankEntryReview.findUnique({
    where: { id: identity.id },
    select: CAPTURED_REVIEW_SELECT,
  })
}

/**
 * Lock and report every review attached to an already-locked award. The RankEntry parent must be
 * locked before inspecting its children: a rolling legacy writer creates its review in a later
 * transaction, and the FK's key-share lock then either commits before this inspection or waits
 * until deletion commits and fails. Terminal decisions are immutable history too: member deletion
 * must not cascade-erase an APPROVED or DENIED proposal.
 */
export async function hasLockedRankEntryReviewHistory(
  tx: PromoterProposalTx,
  rankAwardId: string,
): Promise<boolean> {
  const entries = await tx.$queryRaw<
    Array<{ id: string }>
  >`SELECT "id" FROM "RankEntry" WHERE "rankAwardId" = ${rankAwardId} FOR UPDATE`
  const entry = entries[0]
  if (!entry) return false

  const reviews = await tx.rankEntryReview.findMany({
    where: { rankEntryId: entry.id },
    select: { id: true },
    orderBy: { id: "asc" },
  })
  for (const review of reviews) await lockRankEntryReview(tx, review.id)
  return reviews.length > 0
}

async function writeBackfillStatusAudit(
  tx: PromoterProposalTx,
  rankAwardId: string,
  current: RankAwardVerificationStatus,
  target: "VERIFIED" | "UNVERIFIED",
  actingUserId: string,
) {
  if (current === target) return
  await tx.auditLog.create({
    data: {
      brand: Brand.BBL,
      action: "belt.backfill.auto_trust",
      entityType: "RankAward",
      entityId: rankAwardId,
      userId: actingUserId,
      before: { verificationStatus: current },
      after: { verificationStatus: target },
    },
  })
}

/** Apply non-promoter edits once without duplicating the award→entry compatibility write. */
async function applySiblingFactsIfPresent(
  tx: PromoterProposalTx,
  rankAwardId: string,
  siblingFacts: Record<string, unknown>,
): Promise<void> {
  if (Object.keys(siblingFacts).length === 0) return
  await tx.rankAward.update({ where: { id: rankAwardId }, data: siblingFacts })
  await syncRankEntryFromAward(tx, rankAwardId)
}

/**
 * Apply one member promoter edit after the target award and editability gate have been locked and
 * re-read. Capture side effects have already resolved `promoterData` inside the same transaction.
 * This function owns the active-first transition, one-pending rule, status/sync, and proposal audit.
 */
export async function applyMemberPromoterTransition({
  tx,
  currentAward,
  disciplineId,
  promoterData,
  siblingFacts,
  actingUserId,
}: {
  tx: PromoterProposalTx
  currentAward: LockedPromoterAward
  disciplineId: string
  promoterData: PromoterFactData
  siblingFacts: Record<string, unknown>
  actingUserId: string
}) {
  const candidatePromoterPassportId = promoterData.awardedByPassportId
  if (!candidatePromoterPassportId) {
    throw new ORPCError("BAD_REQUEST", {
      message:
        "Choose or enter a promoter. Removing accepted promoter provenance requires admin correction.",
    })
  }

  await syncRankEntryFromAward(tx, currentAward.id)
  const entry = await tx.rankEntry.findUniqueOrThrow({
    where: { rankAwardId: currentAward.id },
    select: { id: true },
  })
  const pending = await findAndLockPendingPromoterReview(tx, currentAward.id)
  if (pending) {
    const sameCapturedTarget =
      pending.proposalCapturedAt !== null &&
      pending.proposedPromoterPassportId === candidatePromoterPassportId
    if (!sameCapturedTarget) {
      throw new ORPCError("CONFLICT", {
        message: "This belt already has a different promoter change awaiting review.",
      })
    }
    await applySiblingFactsIfPresent(tx, currentAward.id, siblingFacts)
    return { transition: "proposal_pending" as const, reviewId: pending.id }
  }

  // Interactive transaction queries stay sequential; the pg adapter does not support concurrent
  // client.query calls on the same checked-out connection.
  const currentIsRecruited = await isRecruitedCoachPlaceholder(tx, currentAward.awardedByPassportId)
  const candidateIsRecruited = await isRecruitedCoachPlaceholder(tx, candidatePromoterPassportId)
  const anchor = await resolveLockedAnchor(
    tx,
    currentAward.passportId,
    disciplineId,
    currentAward.id,
  )
  const transition = decideBackfillPromoterTransition({
    currentPromoterPassportId: currentAward.awardedByPassportId,
    currentPromoterIsRecruitedCoachPlaceholder: currentIsRecruited,
    candidatePromoterPassportId,
    candidatePromoterIsRecruitedCoachPlaceholder: candidateIsRecruited,
    anchorPromoterPassportId: anchor?.awardedByPassportId ?? null,
  })

  if (transition === "no_change") {
    await applySiblingFactsIfPresent(tx, currentAward.id, siblingFacts)
    return { transition }
  }

  if (transition === "propose") {
    await applySiblingFactsIfPresent(tx, currentAward.id, siblingFacts)
    const review = await tx.rankEntryReview.create({
      data: {
        rankEntryId: entry.id,
        status: RankEntryReviewStatus.PROPOSAL_PENDING,
        reason: RankEntryReviewReason.PROMOTER_CHANGED,
        proposalCapturedAt: new Date(),
        expectedPromoterPassportId: currentAward.awardedByPassportId,
        expectedPromoterName: currentAward.notes,
        proposedPromoterPassportId: candidatePromoterPassportId,
      },
      select: { id: true, proposalCapturedAt: true },
    })
    await tx.auditLog.create({
      data: {
        brand: Brand.BBL,
        action: "belt.review.proposed",
        entityType: "RankEntryReview",
        entityId: review.id,
        userId: actingUserId,
        before: {
          awardedByPassportId: currentAward.awardedByPassportId,
          promoterName: currentAward.notes,
          verificationStatus: currentAward.verificationStatus,
        },
        after: {
          status: RankEntryReviewStatus.PROPOSAL_PENDING,
          reason: RankEntryReviewReason.PROMOTER_CHANGED,
          proposalCapturedAt: review.proposalCapturedAt?.toISOString() ?? null,
          proposedPromoterPassportId: candidatePromoterPassportId,
        },
      },
    })
    return { transition, reviewId: review.id }
  }

  const targetStatus = transition === "verify" ? "VERIFIED" : "UNVERIFIED"
  await tx.rankAward.update({
    where: { id: currentAward.id },
    data: { ...siblingFacts, ...promoterData, verificationStatus: targetStatus },
  })
  await syncRankEntryFromAward(tx, currentAward.id)
  await writeBackfillStatusAudit(
    tx,
    currentAward.id,
    currentAward.verificationStatus,
    targetStatus,
    actingUserId,
  )
  return { transition }
}

/** Load a captured proposal under the canonical Passport→Award→Review lock order. */
// Reviews are scoped by the belt.admin permission gate and the PROMOTER_CHANGED reason, NOT by
// rank brand: BBL ranks are brand-agnostic (`Rank.brand` is nullable and the live BJJ ranks are
// null, not BBL), so a `rank: { brand }` filter would reject every real review as "not found".
async function loadCapturedPendingReview(tx: PromoterProposalTx, reviewId: string) {
  const identity = await tx.rankEntryReview.findFirst({
    where: { id: reviewId },
    select: { rankEntry: { select: { rankAwardId: true } } },
  })
  if (!identity) throw new Error("Review not found.")

  await lockPromoterWorkflowScope({
    tx,
    rankAwardId: identity.rankEntry.rankAwardId,
    lockMemberAuthorityAwards: false,
  })

  const review = await tx.rankEntryReview.findUnique({
    where: { id: reviewId },
    select: {
      ...CAPTURED_REVIEW_SELECT,
      rankEntry: {
        select: {
          rankAward: {
            select: { id: true, awardedByPassportId: true, notes: true },
          },
        },
      },
    },
  })
  if (!review) throw new Error("Review not found.")
  if (review.status !== RankEntryReviewStatus.PROPOSAL_PENDING) {
    throw new Error("This review has already been decided.")
  }
  if (review.reason !== RankEntryReviewReason.PROMOTER_CHANGED) {
    throw new Error("This review is not a promoter-change proposal.")
  }
  if (
    !review.proposalCapturedAt ||
    !review.expectedPromoterPassportId ||
    !review.proposedPromoterPassportId
  ) {
    throw new Error("This legacy review has no captured proposal and cannot be decided here.")
  }
  return review
}

export async function approveCapturedPromoterReview(
  tx: PromoterProposalTx,
  reviewId: string,
  { brand, userId }: { brand: Brand; userId: string },
) {
  const review = await loadCapturedPendingReview(tx, reviewId)
  const active = review.rankEntry.rankAward
  if (
    active.awardedByPassportId !== review.expectedPromoterPassportId ||
    active.notes !== review.expectedPromoterName
  ) {
    throw new Error("Accepted promoter changed after this proposal was captured.")
  }

  const claimed = await tx.rankEntryReview.updateMany({
    where: {
      id: review.id,
      status: RankEntryReviewStatus.PROPOSAL_PENDING,
      reason: RankEntryReviewReason.PROMOTER_CHANGED,
    },
    data: { status: RankEntryReviewStatus.APPROVED },
  })
  if (claimed.count !== 1) throw new Error("This review has already been decided.")

  await tx.rankAward.update({
    where: { id: active.id },
    data: { awardedByPassportId: review.proposedPromoterPassportId, notes: null },
  })
  await verifyRankEntryInTransaction(tx, review.rankEntryId, { brand, userId })
  await tx.auditLog.createMany({
    data: [
      {
        brand,
        action: "belt.review.approved",
        entityType: "RankEntryReview",
        entityId: review.id,
        userId,
        before: {
          status: review.status,
          expectedPromoterPassportId: review.expectedPromoterPassportId,
          expectedPromoterName: review.expectedPromoterName,
          proposedPromoterPassportId: review.proposedPromoterPassportId,
        },
        after: {
          status: RankEntryReviewStatus.APPROVED,
          appliedPromoterPassportId: review.proposedPromoterPassportId,
        },
      },
      {
        brand,
        action: "belt.fact.promoter_applied",
        entityType: "RankAward",
        entityId: active.id,
        userId,
        before: {
          awardedByPassportId: active.awardedByPassportId,
          promoterName: active.notes,
        },
        after: {
          awardedByPassportId: review.proposedPromoterPassportId,
          promoterName: null,
        },
      },
    ],
  })
  return { reviewId: review.id }
}

export async function denyCapturedPromoterReview(
  tx: PromoterProposalTx,
  reviewId: string,
  { brand, userId }: { brand: Brand; userId: string },
) {
  const review = await loadCapturedPendingReview(tx, reviewId)
  const claimed = await tx.rankEntryReview.updateMany({
    where: {
      id: review.id,
      status: RankEntryReviewStatus.PROPOSAL_PENDING,
      reason: RankEntryReviewReason.PROMOTER_CHANGED,
    },
    data: { status: RankEntryReviewStatus.DENIED },
  })
  if (claimed.count !== 1) throw new Error("This review has already been decided.")

  await tx.auditLog.create({
    data: {
      brand,
      action: "belt.review.denied",
      entityType: "RankEntryReview",
      entityId: review.id,
      userId,
      before: {
        status: review.status,
        expectedPromoterPassportId: review.expectedPromoterPassportId,
        expectedPromoterName: review.expectedPromoterName,
        proposedPromoterPassportId: review.proposedPromoterPassportId,
      },
      after: { status: RankEntryReviewStatus.DENIED },
    },
  })
  return { reviewId: review.id }
}

/** Explicit admin correction: claim DENIED first, then apply + sync + audit in the same tx. */
export async function overrideCapturedPromoterReview({
  tx,
  rankAwardId,
  actingUserId,
  resolvePromoterData,
}: {
  tx: PromoterProposalTx
  rankAwardId: string
  actingUserId: string
  resolvePromoterData: () => Promise<PromoterFactData>
}) {
  // Resolve first so a reused candidate identity joins the sorted Passport tier before Award. A
  // newly-created freetext placeholder is private to this transaction; every failure below rolls it
  // and its lead capture back.
  const promoterData = await resolvePromoterData()
  await lockPromoterWorkflowScope({
    tx,
    rankAwardId,
    candidatePromoterPassportId: promoterData.awardedByPassportId,
    lockMemberAuthorityAwards: false,
  })
  const before = await tx.rankAward.findUniqueOrThrow({
    where: { id: rankAwardId },
    select: {
      id: true,
      passportId: true,
      awardedAt: true,
      awardedByPassportId: true,
      notes: true,
      organizationId: true,
      location: true,
    },
  })
  const pending = await findAndLockPendingPromoterReview(tx, rankAwardId)
  if (
    !pending?.proposalCapturedAt ||
    !pending.expectedPromoterPassportId ||
    !pending.proposedPromoterPassportId
  ) {
    throw new ORPCError("CONFLICT", {
      message: "There is no captured promoter proposal available to override.",
    })
  }

  const claimed = await tx.rankEntryReview.updateMany({
    where: {
      id: pending.id,
      status: RankEntryReviewStatus.PROPOSAL_PENDING,
      reason: RankEntryReviewReason.PROMOTER_CHANGED,
    },
    data: { status: RankEntryReviewStatus.DENIED },
  })
  if (claimed.count !== 1) {
    throw new ORPCError("CONFLICT", { message: "This promoter proposal was already resolved." })
  }

  const updated = await tx.rankAward.update({
    where: { id: rankAwardId },
    data: promoterData,
    select: {
      awardedAt: true,
      awardedByPassportId: true,
      notes: true,
      organizationId: true,
      location: true,
    },
  })
  await syncRankEntryFromAward(tx, rankAwardId)
  await tx.auditLog.createMany({
    data: [
      {
        brand: Brand.BBL,
        action: "belt.review.denied_by_override",
        entityType: "RankEntryReview",
        entityId: pending.id,
        userId: actingUserId,
        before: {
          status: pending.status,
          reason: pending.reason,
          proposalCapturedAt: pending.proposalCapturedAt.toISOString(),
          expectedPromoterPassportId: pending.expectedPromoterPassportId,
          expectedPromoterName: pending.expectedPromoterName,
          proposedPromoterPassportId: pending.proposedPromoterPassportId,
        },
        after: { status: RankEntryReviewStatus.DENIED, resolution: "ADMIN_OVERRIDE" },
      },
      {
        brand: Brand.BBL,
        action: "belt.fact.promoter_overridden",
        entityType: "RankAward",
        entityId: rankAwardId,
        userId: actingUserId,
        before: {
          awardedAt: before.awardedAt?.toISOString() ?? null,
          awardedByPassportId: before.awardedByPassportId,
          notes: before.notes,
          organizationId: before.organizationId,
          location: before.location,
        },
        after: {
          awardedAt: updated.awardedAt?.toISOString() ?? null,
          awardedByPassportId: updated.awardedByPassportId,
          notes: updated.notes,
          organizationId: updated.organizationId,
          location: updated.location,
        },
      },
    ],
  })
  return { reviewId: pending.id, passportId: before.passportId }
}
