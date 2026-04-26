import { z } from "zod"

/**
 * The schema for the content generator.
 */
export const contentSchema = z.object({
  tagline: z
    .string()
    .max(60)
    .describe(
      "A compelling tagline (max 60 chars) that captures the tool's unique value proposition. Avoid tool name, focus on benefits.",
    ),
  description: z
    .string()
    .max(160)
    .describe(
      "A concise meta description (max 160 chars) highlighting key features and benefits. Use active voice, avoid tool name.",
    ),
  content: z
    .string()
    .describe(
      "A detailed and engaging longer description with key benefits (up to 1000 characters). Can be Markdown formatted, but should start with paragraph and not use headings. Highlight important points with bold text. Make sure the lists use correct Markdown syntax.",
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
