import { z } from "zod"
import { normalizeCountryCode } from "~/lib/countries"

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

// ISO 3166-1 alpha-2 (SESSION_0496 TASK_06). "" is the form's "not set" → null (clears);
// undefined must SURVIVE as undefined so the action can skip the DirectoryProfile upsert
// entirely when the field wasn't sent. Uppercased — readers key off the uppercase code.
const nullableCountryCode = z
  .string()
  .trim()
  .regex(/^[A-Za-z]{2}$/, "Use a 2-letter country code")
  .refine(value => normalizeCountryCode(value) !== undefined, "Use a supported country code")
  .or(z.literal(""))
  .nullish()
  .transform(v => (v ? normalizeCountryCode(v) : v === "" ? null : v))
  // The trailing .optional() marks the KEY optional in the inferred type (same as
  // promotionDate) — callers that don't carry the field must not be forced to send it.
  .optional()

export const updateLineageNodeProfileSchema = z.object({
  treeId: z.string().min(1).max(191),
  nodeId: z.string().min(1).max(191),
  displayName: nullableText(100),
  bio: nullableText(2000),
  avatarUrl: nullableUrl,
  promotionDate: nullableDate.optional(),
  locationCountry: nullableCountryCode,
})

export type UpdateLineageNodeProfileInput = z.infer<typeof updateLineageNodeProfileSchema>
