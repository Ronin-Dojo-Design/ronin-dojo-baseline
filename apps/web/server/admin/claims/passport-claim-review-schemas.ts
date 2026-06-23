import { z } from "zod"
import { lineageCompGrantSpecSchema } from "~/lib/entitlements/lineage-comp"
import { databaseIdSchema } from "~/lib/validation/id"

/**
 * Zod schema for the unified Passport-claim admin review (ADR 0036, SESSION_0437 P2).
 * Mirrors `reviewLineageClaimSchema` — one review surface for every person claim.
 */

export const passportClaimDecision = z.enum(["APPROVED", "DENIED", "NEEDS_INFO"])

export type PassportClaimDecision = z.infer<typeof passportClaimDecision>

export const reviewPassportClaimSchema = z.object({
  claimId: databaseIdSchema,
  decision: passportClaimDecision,
  reviewerNote: z.string().max(2000).optional(),
  comp: lineageCompGrantSpecSchema.optional(),
})

export type ReviewPassportClaimInput = z.infer<typeof reviewPassportClaimSchema>
