"use server"

import { adminActionClient } from "~/lib/safe-actions"
import { reviewLineageClaimSchema } from "~/server/admin/lineage/claim-review-schemas"

/**
 * Admin lineage claim review server action.
 *
 * State machine: PENDING | NEEDS_INFO → APPROVED | DENIED | NEEDS_INFO.
 * Terminal states (APPROVED, DENIED, CANCELLED) cannot be re-reviewed.
 *
 * Author: Cody / SESSION_0183 TASK_01.
 */

const REVIEWABLE_STATUSES = ["PENDING", "NEEDS_INFO"] as const

export const CLAIM_REVIEW_ERROR = {
  NOT_FOUND: "Claim not found or does not belong to this brand.",
  NOT_REVIEWABLE: "Claim is not in a reviewable status.",
} as const

export const reviewLineageClaim = adminActionClient
  .inputSchema(reviewLineageClaimSchema)
  .action(async ({ parsedInput, ctx: { user, db, brand } }) => {
    // 1. Load claim and verify brand match via tree.
    const claim = await db.lineageClaimRequest.findFirst({
      where: {
        id: parsedInput.claimId,
        tree: { brand },
      },
      select: { id: true, status: true },
    })

    if (!claim) {
      throw new Error(CLAIM_REVIEW_ERROR.NOT_FOUND)
    }

    // 2. Guard: must be in a reviewable state.
    if (!REVIEWABLE_STATUSES.includes(claim.status as (typeof REVIEWABLE_STATUSES)[number])) {
      throw new Error(CLAIM_REVIEW_ERROR.NOT_REVIEWABLE)
    }

    // 3. Apply decision.
    const updated = await db.lineageClaimRequest.update({
      where: { id: claim.id },
      data: {
        status: parsedInput.decision,
        reviewerNote: parsedInput.reviewerNote ?? null,
        reviewedById: user.id,
        reviewedAt: new Date(),
      },
      select: { id: true, status: true },
    })

    return { claimId: updated.id, status: updated.status }
  })
