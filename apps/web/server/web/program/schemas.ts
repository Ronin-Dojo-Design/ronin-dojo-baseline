import { z } from "zod"

const ProgramStatus = z.enum(["DRAFT", "ACTIVE", "ARCHIVED"])

const optionalCuid = z.union([z.literal(""), z.literal("none"), z.string().cuid()]).optional()

export const saveProgramSchema = z.object({
  id: optionalCuid,
  organizationId: z.string().cuid(),
  disciplineId: optionalCuid,
  name: z.string().trim().min(1, "Name is required").max(200),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().trim().max(1000).optional(),
  status: ProgramStatus.default("ACTIVE"),
})

export const archiveProgramSchema = z.object({
  id: z.string().cuid(),
})
