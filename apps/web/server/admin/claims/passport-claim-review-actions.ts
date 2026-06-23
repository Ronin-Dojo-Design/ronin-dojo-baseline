"use server"

import { type Brand, type LineageClaimStatus } from "~/.generated/prisma/client"
import { adminActionClient } from "~/lib/safe-actions"
import {
  cancelSiblingPassportClaims,
  finalizePassportClaim,
} from "~/server/admin/lineage/claim-finalize"
import { CLAIM_REVIEW_ERROR } from "~/server/admin/lineage/claim-review-errors"
import { scheduleClaimApprovedEmail } from "~/server/web/lineage/claim-approved-email"
import { scheduleClaimRejectedEmail } from "~/server/web/lineage/claim-rejected-email"
import type { db as appDb } from "~/services/db"
import {
  type ReviewPassportClaimInput,
  reviewPassportClaimSchema,
} from "./passport-claim-review-schemas"

/**
 * Unified Passport-claim admin review (ADR 0036, SESSION_0437 P2).
 *
 * THE single review surface for every person claim — lineage-door and
 * directory-door alike, because both now write `PassportClaimRequest`. On
 * APPROVED it runs the shared `finalizePassportClaim` (account→Passport attach +
 * entitlement always; node branches only when node context is present, which is
 * what gives a directory-only person a REAL identity attach — the old PERSON
 * stub is gone), Gap-2 auto-cancels sibling open claims, then stamps status +
 * audit. State machine: PENDING | NEEDS_INFO → APPROVED | DENIED | NEEDS_INFO.
 *
 * Org claims are NOT reviewed here — they stay in `reviewProfileClaim`
 * (ProfileClaimRequest); an owner-less Organization is not a Passport.
 */

const REVIEWABLE_STATUSES = ["PENDING", "NEEDS_INFO"] as const

type AppDb = typeof appDb

export type ReviewPassportClaimResult = {
  claimId: string
  status: LineageClaimStatus
  passportId: string
  claimantUserId: string
  nodeId: string | null
  accessGrantId: string | null
  compGrantIds: string[]
  ownershipTransferred: boolean
  passportAccountAttached: boolean
  rankAwardId: string | null
  cancelledSiblingClaimIds: string[]
}

export const applyPassportClaimReview = async ({
  db,
  brand,
  reviewerUserId,
  input,
}: {
  db: AppDb
  brand: Brand
  reviewerUserId: string
  input: ReviewPassportClaimInput
}): Promise<ReviewPassportClaimResult> => {
  const reviewerNoteForEmail = input.reviewerNote ?? null

  const result = await db.$transaction(
    // biome-ignore lint/suspicious/noExplicitAny: Prisma `$transaction` tx client.
    async (tx: any): Promise<ReviewPassportClaimResult> => {
      const claim = await tx.passportClaimRequest.findFirst({
        where: { id: input.claimId, brand },
        select: {
          id: true,
          status: true,
          passportId: true,
          treeId: true,
          nodeId: true,
          claimantUserId: true,
          claimedRankId: true,
          passport: { select: { userId: true } },
          _count: { select: { evidence: true } },
        },
      })

      if (!claim) {
        throw new Error(CLAIM_REVIEW_ERROR.NOT_FOUND)
      }

      if (!REVIEWABLE_STATUSES.includes(claim.status as (typeof REVIEWABLE_STATUSES)[number])) {
        throw new Error(CLAIM_REVIEW_ERROR.NOT_REVIEWABLE)
      }

      const before = {
        claimId: claim.id,
        passportId: claim.passportId,
        treeId: claim.treeId,
        nodeId: claim.nodeId,
        claimantUserId: claim.claimantUserId,
        status: claim.status,
        evidenceCount: claim._count.evidence,
      }

      let accessGrantId: string | null = null
      let compGrantIds: string[] = []
      let ownershipTransferred = false
      let passportAccountAttached = false
      let rankAwardId: string | null = null
      let cancelledSiblingClaimIds: string[] = []
      const reviewTimestamp = new Date()

      if (input.decision === "APPROVED") {
        const finalized = await finalizePassportClaim(tx, {
          claim: {
            id: claim.id,
            claimantUserId: claim.claimantUserId,
            passportId: claim.passportId,
            passportUserId: claim.passport.userId,
            claimedRankId: claim.claimedRankId,
            treeId: claim.treeId,
            nodeId: claim.nodeId,
          },
          brand,
          actorUserId: reviewerUserId,
          compOverride: input.comp ?? null,
          now: reviewTimestamp,
        })
        accessGrantId = finalized.accessGrantId
        compGrantIds = finalized.compGrantIds
        ownershipTransferred = finalized.ownershipTransferred
        passportAccountAttached = finalized.passportAccountAttached
        rankAwardId = finalized.rankAwardId

        // Gap 2: a won Passport auto-cancels every other open claim on it.
        cancelledSiblingClaimIds = await cancelSiblingPassportClaims(tx, {
          passportId: claim.passportId,
          winnerClaimId: claim.id,
          reviewerUserId,
          now: reviewTimestamp,
        })
      }

      const updated = await tx.passportClaimRequest.update({
        where: { id: claim.id },
        data: {
          status: input.decision,
          reviewerNote: input.reviewerNote ?? null,
          reviewedById: reviewerUserId,
          reviewedAt: reviewTimestamp,
        },
        select: { id: true, status: true },
      })

      await tx.auditLog.create({
        data: {
          brand,
          action: "lineage.claim.reviewed",
          entityType: "PassportClaimRequest",
          entityId: claim.id,
          userId: reviewerUserId,
          before,
          after: {
            ...before,
            status: updated.status,
            reviewerUserId,
            accessGrantId,
            compGrantIds,
            ownershipTransferred,
            passportAccountAttached,
            rankAwardId,
            cancelledSiblingClaimIds,
          },
        },
      })

      return {
        claimId: updated.id,
        status: updated.status,
        passportId: claim.passportId,
        claimantUserId: claim.claimantUserId,
        nodeId: claim.nodeId,
        accessGrantId,
        compGrantIds,
        ownershipTransferred,
        passportAccountAttached,
        rankAwardId,
        cancelledSiblingClaimIds,
      }
    },
    { isolationLevel: "Serializable", maxWait: 30000, timeout: 30000 },
  )

  // Lineage-flavoured lifecycle emails fire AFTER commit, and only for node claims (they key +
  // link on nodeId). A directory-only person approval email is a follow-up (different copy).
  if (result.nodeId) {
    if (result.status === "APPROVED") {
      scheduleClaimApprovedEmail({ userId: result.claimantUserId, brand, nodeId: result.nodeId })
    } else if (result.status === "DENIED") {
      scheduleClaimRejectedEmail({
        userId: result.claimantUserId,
        brand,
        nodeId: result.nodeId,
        reviewerNote: reviewerNoteForEmail,
      })
    }
  }

  return result
}

export const reviewPassportClaim = adminActionClient
  .inputSchema(reviewPassportClaimSchema)
  .action(async ({ parsedInput, ctx: { user, db, brand } }) => {
    return applyPassportClaimReview({
      db,
      brand,
      reviewerUserId: user.id,
      input: parsedInput,
    })
  })
