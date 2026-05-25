import { z } from "zod"

/**
 * Zod schemas for lineage claim actions.
 *
 * Author: Cody / SESSION_0182 TASK_01.
 */

export const lineageClaimRelationship = z.enum(["SELF", "STUDENT_OF", "FAMILY", "ARCHIVIST"])

export type LineageClaimRelationship = z.infer<typeof lineageClaimRelationship>

const lineageClaimEvidenceItemSchema = z.object({
  label: z.string().max(200).optional(),
  url: z.string().url().optional(),
  text: z.string().max(5000).optional(),
})

export const submitLineageClaimSchema = z.object({
  treeId: z.string().cuid(),
  nodeId: z.string().cuid(),
  relationship: lineageClaimRelationship,
  claimantNote: z.string().max(2000).optional(),
  evidence: z.array(lineageClaimEvidenceItemSchema).max(10).optional(),
})

export type SubmitLineageClaimInput = z.infer<typeof submitLineageClaimSchema>
