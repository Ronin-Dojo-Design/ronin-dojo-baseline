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
  promoterMemberId: optionalId.optional().default(null),
  rankAwardId: optionalId.optional().default(null),
  verificationStatus: z.enum(["PENDING", "VERIFIED", "DISPUTED"]).optional().default("PENDING"),
  auditNote,
})

export const updateLineageVisualGroupSchema = z
  .object({
    treeId: z.string().min(1).max(191),
    groupId: z.string().min(1).max(191),
    label: z.string().trim().min(1).max(120).optional(),
    showPublicLabel: z.boolean().optional(),
    collapseByDefault: z.boolean().optional(),
    auditNote,
  })
  .refine(
    input =>
      input.label !== undefined ||
      input.showPublicLabel !== undefined ||
      input.collapseByDefault !== undefined,
    {
      message: "At least one visual group field must be updated.",
    },
  )

export type UpdateLineageMemberPlacementInput = z.infer<typeof updateLineageMemberPlacementSchema>

export type UpdateLineagePromotionRelationshipInput = z.input<
  typeof updateLineagePromotionRelationshipSchema
>

export type UpdateLineageVisualGroupInput = z.input<typeof updateLineageVisualGroupSchema>
