import { z } from "zod"

// @added SESSION_0397 — polymorphic Save subject. Literals mirror the Prisma `BookmarkSubjectType`
// enum (kept as literals, not a value-import of the generated enum, so this stays safe to pull into
// client components via the action types — see the Prisma-in-browser 500 gotcha).
const bookmarkSubjectTypeSchema = z.enum([
  "TOOL",
  "PERSON",
  "ORGANIZATION",
  "TECHNIQUE",
  "POST",
  "TREE",
])

export const bookmarkSubjectInputSchema = z.object({
  subjectType: bookmarkSubjectTypeSchema,
  subjectId: z.string().min(1),
})

export const setBookmarkSubjectInputSchema = bookmarkSubjectInputSchema.extend({
  bookmarked: z.boolean(),
})

/** The subject-type union — consumed by `ListingSaveButton`. */
export type BookmarkSubjectTypeInput = z.infer<typeof bookmarkSubjectTypeSchema>
