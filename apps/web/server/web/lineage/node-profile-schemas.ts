import { z } from "zod"

/**
 * Zod schemas for approved-claim lineage node profile editing.
 *
 * Author: Cody / SESSION_0184 TASK_01.
 */

const nullableText = (max: number) =>
  z
    .preprocess(value => (typeof value === "string" ? value.trim() : value), z.string().max(max))
    .transform(value => (value === "" ? null : value))

const nullableUrl = z
  .preprocess(
    value => (typeof value === "string" ? value.trim() : value),
    z.union([z.string().url().max(2048), z.literal("")]),
  )
  .transform(value => (value === "" ? null : value))

const nullableDate = z.preprocess(value => {
  if (value === "" || value === null || value === undefined) {
    return null
  }
  return value
}, z.coerce.date().nullable())

export const updateLineageNodeProfileSchema = z.object({
  treeId: z.string().min(1).max(191),
  nodeId: z.string().min(1).max(191),
  displayName: nullableText(100),
  bio: nullableText(2000),
  avatarUrl: nullableUrl,
  promotionDate: nullableDate.optional(),
})

export type UpdateLineageNodeProfileInput = z.infer<typeof updateLineageNodeProfileSchema>
