import { z } from "zod"

/**
 * The schema for the content generator.
 */
export const contentSchema = z.object({
  tagline: z
    .string()
    .max(60)
    .describe(
      "A concrete tagline (max 60 chars) that captures the listing's value. Avoid the listing name and unsupported claims.",
    ),
  description: z
    .string()
    .max(160)
    .describe(
      "A concise meta description (max 160 chars) highlighting the audience, discipline, location, or value when present. Use active voice.",
    ),
  content: z
    .string()
    .describe(
      "A detailed longer description with factual benefits (up to 1000 characters). Can be Markdown formatted, but should start with a paragraph and not use headings. Highlight important points with bold text. Make sure lists use correct Markdown syntax.",
    ),
})

/**
 * The schema for the description generator.
 */
export const descriptionSchema = contentSchema.pick({ description: true })

/**
 * The schema for the ID validation.
 */
export const idSchema = z.object({
  id: z.string(),
})

/**
 * The schema for the IDs validation.
 */
export const idsSchema = z.object({
  ids: z.array(z.string()),
})
