import { z } from "zod"

/**
 * Zod schemas for admin lineage claim review actions.
 *
 * Author: Cody / SESSION_0183 TASK_01.
 */

export const lineageClaimDecision = z.enum(["APPROVED", "DENIED", "NEEDS_INFO"])

export type LineageClaimDecision = z.infer<typeof lineageClaimDecision>

export const reviewLineageClaimSchema = z.object({
  claimId: z.string().cuid(),
  decision: lineageClaimDecision,
  reviewerNote: z.string().max(2000).optional(),
})

export type ReviewLineageClaimInput = z.infer<typeof reviewLineageClaimSchema>
