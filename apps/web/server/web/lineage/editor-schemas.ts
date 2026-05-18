import { z } from "zod"

const optionalId = z
  .union([z.string().min(1).max(191), z.literal(""), z.null()])
  .transform(value => (value ? value : null))

const auditNote = z.preprocess(
  value => (typeof value === "string" ? value.trim() : value),
  z.string().min(10).max(1000),
)

export const updateLineageMemberPlacementSchema = z.object({
  treeId: z.string().min(1).max(191),
  memberId: z.string().min(1).max(191),
  parentMemberId: optionalId,
  visualGroupId: optionalId,
  visualSortOrder: z.coerce.number().int().min(0).max(100000),
  auditNote,
})

export const updateLineagePromotionRelationshipSchema = z.object({
  treeId: z.string().min(1).max(191),
  memberId: z.string().min(1).max(191),
  promoterMemberId: optionalId,
  auditNote,
})

export type UpdateLineageMemberPlacementInput = z.infer<typeof updateLineageMemberPlacementSchema>

export type UpdateLineagePromotionRelationshipInput = z.infer<
  typeof updateLineagePromotionRelationshipSchema
>
