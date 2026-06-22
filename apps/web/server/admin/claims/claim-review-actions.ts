"use server"

import { Brand } from "~/.generated/prisma/client"
import { adminActionClient } from "~/lib/safe-actions"
import { reviewProfileClaimSchema } from "~/server/admin/claims/claim-review-schemas"

/**
 * Admin profile-claim review server action (SESSION_0354).
 *
 * State machine: PENDING | NEEDS_INFO → APPROVED | DENIED | NEEDS_INFO.
 * Terminal states (APPROVED, DENIED, CANCELLED) cannot be re-reviewed.
 *
 * Approval side-effects:
 * - ORGANIZATION → grant ownership (`organization.ownerId = claimant`) when the
 *   org is still owner-less. This fulfils the claim.
 * - PERSON → no automated mutation. Merging a placeholder User into a real
 *   account is an identity operation an admin performs deliberately (same hard
 *   problem the lineage placeholder-transfer flow solves); approval here records
 *   the decision and unblocks that manual step. Flagged, not faked.
 */

const REVIEWABLE_STATUSES = ["PENDING", "NEEDS_INFO"] as const

const PROFILE_CLAIM_REVIEW_ERROR = {
  NOT_FOUND: "Claim not found for this brand.",
  NOT_REVIEWABLE: "This claim is in a terminal state and cannot be re-reviewed.",
} as const

export const reviewProfileClaim = adminActionClient
  .inputSchema(reviewProfileClaimSchema)
  .action(async ({ parsedInput, ctx: { user, db } }) => {
    return db.$transaction(async tx => {
      const claim = await tx.profileClaimRequest.findFirst({
        where: { id: parsedInput.claimId, brand: Brand.BBL },
        select: {
          id: true,
          status: true,
          subjectType: true,
          organizationId: true,
          directoryProfileId: true,
          claimantUserId: true,
        },
      })

      if (!claim) throw new Error(PROFILE_CLAIM_REVIEW_ERROR.NOT_FOUND)
      if (!REVIEWABLE_STATUSES.includes(claim.status as (typeof REVIEWABLE_STATUSES)[number])) {
        throw new Error(PROFILE_CLAIM_REVIEW_ERROR.NOT_REVIEWABLE)
      }

      let ownershipGranted = false

      if (parsedInput.decision === "APPROVED" && claim.subjectType === "ORGANIZATION") {
        const org = await tx.organization.findFirst({
          where: { id: claim.organizationId ?? "", brand: Brand.BBL },
          select: { id: true, ownerId: true },
        })
        // Only grant if still owner-less (avoid clobbering an owner set meanwhile).
        if (org && !org.ownerId) {
          await tx.organization.update({
            where: { id: org.id },
            data: { ownerId: claim.claimantUserId },
          })
          ownershipGranted = true
        }
      }

      await tx.profileClaimRequest.update({
        where: { id: claim.id },
        data: {
          status: parsedInput.decision,
          reviewerNote: parsedInput.reviewerNote ?? null,
          reviewedById: user.id,
          reviewedAt: new Date(),
        },
      })

      return {
        claimId: claim.id,
        status: parsedInput.decision,
        subjectType: claim.subjectType,
        ownershipGranted,
        // PERSON approvals need a manual placeholder→account merge by an admin.
        personMergePending: parsedInput.decision === "APPROVED" && claim.subjectType === "PERSON",
      }
    })
  })
