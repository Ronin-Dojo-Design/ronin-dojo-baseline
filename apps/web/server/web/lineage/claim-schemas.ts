import { z } from "zod"
import { databaseIdSchema } from "~/lib/validation/id"

/**
 * Zod schemas for lineage claim actions.
 *
 * Author: Cody / SESSION_0182 TASK_01.
 * @updated SESSION_0432 FI-006 — added claimedRankId (optional rank picker).
 */

export const lineageClaimRelationship = z.enum(["SELF", "STUDENT_OF", "FAMILY", "ARCHIVIST"])

export type LineageClaimRelationship = z.infer<typeof lineageClaimRelationship>

const lineageClaimEvidenceItemSchema = z.object({
  label: z.string().max(200).optional(),
  url: z.string().url().optional(),
  text: z.string().max(5000).optional(),
})

export const submitLineageClaimSchema = z.object({
  treeId: databaseIdSchema,
  nodeId: databaseIdSchema,
  relationship: lineageClaimRelationship,
  claimantNote: z.string().max(2000).optional(),
  // FI-006: optional rank asserted by the claimant. Stored as PENDING on the claim record;
  // admin-verify promotes it to an awarded RankAward (ADR 0035 §4).
  claimedRankId: databaseIdSchema.optional(),
  evidence: z.array(lineageClaimEvidenceItemSchema).max(10).optional(),
})

export type SubmitLineageClaimInput = z.infer<typeof submitLineageClaimSchema>
