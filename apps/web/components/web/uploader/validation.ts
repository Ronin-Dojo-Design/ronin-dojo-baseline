/**
 * Client-side pick validation shared by the uploader family (AvatarUploader,
 * ImageFieldUploader). This is a UX pre-gate only — the server seams
 * (`sniffUploadBuffer`) remain the byte-level authority.
 *
 * @added   SESSION_0499 (2026-07-05)
 * @why     One shared client pick-guard (extracted from AvatarUploader so both variants share one source)
 * @wired   index.tsx (AvatarUploader), image-field-uploader.tsx, use-image-field-upload.ts
 */
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
export const MAX_BYTES = 10 * 1024 * 1024

function formatBytes(n: number) {
  if (n === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB"]
  const i = Math.floor(Math.log(n) / Math.log(k))
  return `${(n / k ** i).toFixed(1)} ${sizes[i]}`
}

/** Returns a user-facing error for an invalid pick, or null when the file is acceptable. */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Only JPEG, PNG, WebP, or GIF images are allowed."
  }
  if (file.size > MAX_BYTES) {
    return `File must be under ${formatBytes(MAX_BYTES)}.`
  }
  return null
}
