import { z } from "zod"

export const bookmarkInputSchema = z.object({
  toolId: z.string().min(1),
})

export const setBookmarkInputSchema = bookmarkInputSchema.extend({
  bookmarked: z.boolean(),
})

export type BookmarkInput = z.infer<typeof bookmarkInputSchema>
export type SetBookmarkInput = z.infer<typeof setBookmarkInputSchema>
