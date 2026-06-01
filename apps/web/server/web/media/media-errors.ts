/**
 * Canonical error strings for the capability-gated web media pipeline. Thrown
 * by the apply-helpers and surfaced verbatim through the safe-action handler.
 */
export const WEB_MEDIA_ERROR = {
  UPLOAD_ACCESS_REQUIRED: "Media access is required for this item.",
  TARGET_NOT_FOUND: "The item to attach media to was not found.",
  ATTACHMENT_NOT_FOUND: "Media attachment not found for this item.",
  INVALID_FILE: "Only image and video files up to 25MB are allowed.",
} as const
