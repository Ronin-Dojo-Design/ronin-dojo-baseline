/**
 * Canonical error strings for the capability-gated web media pipeline. Thrown
 * by the apply-helpers and surfaced verbatim through the safe-action handler.
 */
export const WEB_MEDIA_ERROR = {
  UPLOAD_ACCESS_REQUIRED: "Media access is required for this item.",
  TARGET_NOT_FOUND: "The item to attach media to was not found.",
  ATTACHMENT_NOT_FOUND: "Media attachment not found for this item.",
  INVALID_FILE: "Only image and video files up to 25MB are allowed.",
  AVATAR_IMAGE_REQUIRED: "Only image attachments can be used as a Passport avatar.",
  // SESSION_0529 Slice 3B — the member URL-paste video path accepts YouTube links only (the one
  // provider we can derive a static poster for + embed safely; matches `type: YOUTUBE` Media).
  VIDEO_URL_UNSUPPORTED: "Paste a YouTube video link (watch, share, or Shorts URL).",
  // SESSION_0529 review fix (Doug P2-1) — R2 FILE upload stays capability-gated for technique
  // targets (member video = URL-paste only); author media MANAGEMENT is intentionally open.
  FILE_UPLOAD_CAPABILITY_REQUIRED:
    "File upload requires a staff role or an upload grant — paste a video link instead.",
  // SESSION_0529 review fix (P3) — a reorder must cover the target's FULL attachment set, or a
  // partial write would leave duplicate sort positions server-side.
  REORDER_SET_INCOMPLETE: "The new order must include every attached clip.",
} as const
