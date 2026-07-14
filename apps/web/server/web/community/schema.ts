import { z } from "zod"

// @added SESSION_0493 — member community feed (`/posts`, ADR 0042 Amendment 1). Literals mirror
// the Prisma `CommunityPostType` enum (kept as literals, not a value-import of the generated enum,
// so this stays safe to pull into client components via the action types — the Prisma-in-browser
// 500 gotcha, same rule as `server/web/bookmarks/schema.ts`).
export const communityPostTypeSchema = z.enum(["TECHNIQUE", "TIP", "SEMINAR", "QA"])

/** The post-type union — consumed by the feed tabs / create dialog. */
export type CommunityPostTypeInput = z.infer<typeof communityPostTypeSchema>

export const createCommunityPostSchema = z.object({
  type: communityPostTypeSchema,
  title: z
    .string()
    .trim()
    .min(3, "Give your post a title.")
    .max(100, "Keep the title under 100 characters."),
  content: z
    .string()
    .trim()
    .min(10, "Tell the community a bit more.")
    .max(2000, "Keep the post under 2,000 characters."),
  videoUrl: z
    .union([
      z.literal(""),
      z
        .string()
        .trim()
        .url("Enter a valid link.")
        .max(500)
        .startsWith("https://", "Video links must be https."),
    ])
    .optional(),
  // Set by the member-safe `uploadCommunityPostImage` action — the create action additionally
  // verifies the URL points at OUR media bucket (see `isAllowedCommunityImageUrl`).
  imageUrl: z.union([z.literal(""), z.string().trim().url().max(500)]).optional(),
  styleId: z.union([z.literal(""), z.string().trim().max(64)]).optional(),
  // @added SESSION_0537 (FI-028b) — the author self-serve premium toggle (default off). A premium post
  // is visible-but-locked to free/anon readers (excerpt teaser only); the create action persists this.
  isPremium: z.boolean().optional(),
})

export const setCommunityPostStatusSchema = z.object({
  id: z.string().min(1),
  hidden: z.boolean(),
})

export const communityPostImageSchema = z.object({
  file: z
    .instanceof(File)
    .refine(f => f.size > 0, "The image is empty.")
    .refine(f => f.size <= 8 * 1024 * 1024, "Image must be under 8MB.")
    .refine(f => f.type.startsWith("image/"), "Only image files are allowed."),
})
