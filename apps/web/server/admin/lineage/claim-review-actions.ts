"use server"

import { Brand, type LineageClaimStatus } from "~/.generated/prisma/client"
import { adminActionClient } from "~/lib/safe-actions"
import { finalizeLineageNodeClaim } from "~/server/admin/lineage/claim-finalize"
import { CLAIM_REVIEW_ERROR } from "~/server/admin/lineage/claim-review-errors"
import type { ReviewLineageClaimInput } from "~/server/admin/lineage/claim-review-schemas"
import { reviewLineageClaimSchema } from "~/server/admin/lineage/claim-review-schemas"
import { scheduleClaimApprovedEmail } from "~/server/web/lineage/claim-approved-email"
import { scheduleClaimRejectedEmail } from "~/server/web/lineage/claim-rejected-email"
import type { db as appDb } from "~/services/db"

/**
 * Admin lineage claim review server action.
 *
 * State machine: PENDING | NEEDS_INFO → APPROVED | DENIED | NEEDS_INFO.
 * Terminal states (APPROVED, DENIED, CANCELLED) cannot be re-reviewed.
 *
 * Author: Cody / SESSION_0183 TASK_01.
 */

const REVIEWABLE_STATUSES = ["PENDING", "NEEDS_INFO"] as const

type AppDb = typeof appDb

export type ReviewLineageClaimResult = {
  claimId: string
  status: LineageClaimStatus
  nodeId: string
  accessGrantId: string | null
  compGrantIds: string[]
  ownershipTransferred: boolean
  // Phase 3c (SOT-ADR D1): approving a PERSON claim attaches the claimant account to the node's
  // Passport (`Passport.userId`) rather than moving the node FK or archiving a synthetic placeholder
  // User. `placeholderArchived*` are retired (the placeholder is now an accountless Passport).
  passportAccountAttached: boolean
}

export const applyLineageClaimReview = async ({
  db,
  brand,
  reviewerUserId,
  input,
}: {
  db: AppDb
  brand: Brand
  reviewerUserId: string
  input: ReviewLineageClaimInput
}): Promise<ReviewLineageClaimResult> => {
  // Captured inside the tx, fired AFTER commit (rollback-safe) — see below. Both decisions notify
  // the claimant: APPROVED → claim-approved email; DENIED → claim-rejected email (SESSION_0420).
  let approvedClaimantUserId: string | null = null
  let approvedNodeId: string | null = null
  let deniedClaimantUserId: string | null = null
  let deniedNodeId: string | null = null
  const reviewerNoteForEmail = input.reviewerNote ?? null

  const result = await db.$transaction(
    async (tx: any): Promise<ReviewLineageClaimResult> => {
      const claim = await tx.lineageClaimRequest.findFirst({
        where: {
          id: input.claimId,
          tree: { brand },
        },
        select: {
          id: true,
          status: true,
          treeId: true,
          nodeId: true,
          claimantUserId: true,
          node: {
            select: {
              passportId: true,
              passport: { select: { userId: true } },
            },
          },
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
      const reviewTimestamp = new Date()

      if (input.decision === "APPROVED") {
        approvedClaimantUserId = claim.claimantUserId
        approvedNodeId = claim.nodeId
        // The APPROVED-branch identity merge + access + comp wiring lives in the shared
        // `finalizeLineageNodeClaim` so the admin path and the BBL token-accept path can
        // never drift. The manual `input.comp` override is threaded through `compOverride`.
        const finalized = await finalizeLineageNodeClaim(tx, {
          claim,
          brand,
          actorUserId: reviewerUserId,
          compOverride: input.comp ?? null,
          now: reviewTimestamp,
        })
        accessGrantId = finalized.accessGrantId
        compGrantIds = finalized.compGrantIds
        ownershipTransferred = finalized.ownershipTransferred
        passportAccountAttached = finalized.passportAccountAttached
      } else if (input.decision === "DENIED") {
        // No grant on deny (verified: the finalize side-effects only run in the APPROVED branch);
        // capture the claimant + node so we can mail the claim-rejected notice after commit.
        deniedClaimantUserId = claim.claimantUserId
        deniedNodeId = claim.nodeId
      }

      const updated = await tx.lineageClaimRequest.update({
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
          entityType: "LineageClaimRequest",
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
          },
        },
      })

      return {
        claimId: updated.id,
        status: updated.status,
        nodeId: claim.nodeId,
        accessGrantId,
        compGrantIds,
        ownershipTransferred,
        passportAccountAttached,
      }
    },
    { isolationLevel: "Serializable", maxWait: 30000, timeout: 30000 },
  )

  // A fresh admin approval committed — fire the lifecycle "profile-claim-approved" email.
  if (approvedClaimantUserId && approvedNodeId) {
    scheduleClaimApprovedEmail({ userId: approvedClaimantUserId, brand, nodeId: approvedNodeId })
  }

  // A fresh admin denial committed — fire the lifecycle "profile-claim-rejected" notice so every
  // decision reaches the claimant (SESSION_0420 — approve already mailed, deny was silent).
  if (deniedClaimantUserId && deniedNodeId) {
    scheduleClaimRejectedEmail({
      userId: deniedClaimantUserId,
      brand,
      nodeId: deniedNodeId,
      reviewerNote: reviewerNoteForEmail,
    })
  }

  return result
}

export const reviewLineageClaim = adminActionClient
  .inputSchema(reviewLineageClaimSchema)
  .action(async ({ parsedInput, ctx: { user, db, brand } }) => {
    return applyLineageClaimReview({
      db,
      brand,
      reviewerUserId: user.id,
      input: parsedInput,
    })
  })
