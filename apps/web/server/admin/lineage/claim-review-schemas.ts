import { z } from "zod"
import { databaseIdSchema } from "~/lib/validation/id"
import { lineageCompGrantSpecSchema } from "~/lib/entitlements/lineage-comp"

/**
 * Zod schemas for admin lineage claim review actions.
 *
 * Author: Cody / SESSION_0183 TASK_01.
 */

export const lineageClaimDecision = z.enum(["APPROVED", "DENIED", "NEEDS_INFO"])

export type LineageClaimDecision = z.infer<typeof lineageClaimDecision>

export const reviewLineageClaimSchema = z.object({
  claimId: databaseIdSchema,
  decision: lineageClaimDecision,
  reviewerNote: z.string().max(2000).optional(),
  comp: lineageCompGrantSpecSchema.optional(),
})

export type ReviewLineageClaimInput = z.infer<typeof reviewLineageClaimSchema>
