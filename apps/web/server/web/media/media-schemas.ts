import { z } from "zod/v4"
import type { MediaAttachTarget } from "~/server/web/media/media-targets"

export const MAX_WEB_UPLOAD_BYTES = 25 * 1024 * 1024

/**
 * The set of owner entities a web user can attach media to. Kept in sync with
 * `MediaAttachTargetKind` via the `satisfies` check below. Module-private — only the
 * composed `uploadWebMediaSchema` / `removeWebMediaSchema` are consumed externally
 * (SESSION_0492 dead-export trim).
 */
const mediaAttachTargetSchema = z.object({
  kind: z.enum([
    "promotionEvent",
    "technique",
    "organization",
    "course",
    "passport",
    "rankMilestone",
  ]),
  id: z.string().min(1),
})

// Compile-time guard: the schema output must match the domain target type.
const _targetParity = (target: z.infer<typeof mediaAttachTargetSchema>): MediaAttachTarget => target
void _targetParity

export const webMediaFileSchema = z
  .instanceof(File)
  .refine(file => file.size > 0, "File is empty.")
  .refine(file => file.size <= MAX_WEB_UPLOAD_BYTES, "File exceeds the 25MB limit.")
  .refine(
    file => file.type.startsWith("image/") || file.type.startsWith("video/"),
    "Only image and video files are allowed.",
  )

export const uploadWebMediaSchema = z.object({
  target: mediaAttachTargetSchema,
  file: webMediaFileSchema,
  isPublic: z.boolean().default(false),
  title: z.string().max(200).optional(),
  altText: z.string().max(300).optional(),
})

export const removeWebMediaSchema = z.object({
  target: mediaAttachTargetSchema,
  attachmentId: z.string().min(1),
})

export const promotePassportAvatarMediaSchema = z.object({
  target: z.object({
    kind: z.literal("passport"),
    id: z.string().min(1),
  }),
  attachmentId: z.string().min(1),
})

// SESSION_0527 Slice 2 — per-video freemium authoring: flip one attachment's `isPremium` flag (the
// gate unit introduced in Slice 0). Re-authorized server-side for the target like every media action.
export const setWebMediaPremiumSchema = z.object({
  target: mediaAttachTargetSchema,
  attachmentId: z.string().min(1),
  isPremium: z.boolean(),
})

// SESSION_0529 Slice 3B — member URL-paste video attach (authored techniques). No file, no R2: the
// url is stored as an external `type: YOUTUBE` Media (provider-validated in the apply helper) and
// attached to the target. Re-authorized server-side for the target like every media action.
export const attachWebMediaUrlSchema = z.object({
  target: mediaAttachTargetSchema,
  url: z.string().url().max(500),
  title: z.string().max(200).optional(),
})

// SESSION_0529 Slice 3B — persist a drag-reorder of a target's attachments (`sortOrder` = array
// index). Every id must belong to the target (enforced in the apply helper), no duplicates.
export const reorderWebMediaSchema = z.object({
  target: mediaAttachTargetSchema,
  attachmentIds: z
    .array(z.string().min(1))
    .min(1)
    .max(100)
    .refine(ids => new Set(ids).size === ids.length, "Duplicate attachment ids."),
})

export type UploadWebMediaInput = z.infer<typeof uploadWebMediaSchema>
export type RemoveWebMediaInput = z.infer<typeof removeWebMediaSchema>
export type PromotePassportAvatarMediaInput = z.infer<typeof promotePassportAvatarMediaSchema>
export type SetWebMediaPremiumInput = z.infer<typeof setWebMediaPremiumSchema>
export type AttachWebMediaUrlInput = z.infer<typeof attachWebMediaUrlSchema>
export type ReorderWebMediaInput = z.infer<typeof reorderWebMediaSchema>
