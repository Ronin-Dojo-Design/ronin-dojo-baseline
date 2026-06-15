import { z } from "zod"
import { databaseIdSchema } from "~/lib/validation/id"

/**
 * Zod schemas for admin profile-claim review (SESSION_0354).
 * Mirrors `server/admin/lineage/claim-review-schemas.ts`.
 */

const profileClaimDecision = z.enum(["APPROVED", "DENIED", "NEEDS_INFO"])
export type ProfileClaimDecision = z.infer<typeof profileClaimDecision>

export const reviewProfileClaimSchema = z.object({
  claimId: databaseIdSchema,
  decision: profileClaimDecision,
  reviewerNote: z.string().max(2000).optional(),
})
