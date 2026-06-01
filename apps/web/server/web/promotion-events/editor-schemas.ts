import { z } from "zod"

const optionalId = z
  .union([z.string().min(1).max(191), z.literal(""), z.null()])
  .transform(value => (value ? value : null))

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform(value => (value ? value : null))

const auditNote = z.preprocess(
  value => (typeof value === "string" ? value.trim() : value),
  z.string().min(10).max(1000),
)

const eventDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.")
  .transform(value => new Date(`${value}T00:00:00.000Z`))

export const upsertPromotionEventSchema = z.object({
  id: optionalId.optional().default(null),
  title: z.string().trim().min(3).max(200),
  eventDate,
  location: optionalText(240),
  description: optionalText(5000),
  hostOrganizationId: optionalId.optional().default(null),
  rankAwardIds: z.array(z.string().min(1).max(191)).max(50).optional().default([]),
  auditNote,
})

export type UpsertPromotionEventInput = z.output<typeof upsertPromotionEventSchema>
export type UpsertPromotionEventFormInput = z.input<typeof upsertPromotionEventSchema>
