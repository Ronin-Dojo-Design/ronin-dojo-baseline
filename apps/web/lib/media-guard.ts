import { fileTypeFromBuffer } from "file-type"

/**
 * Server-side byte-sniff guard for user file uploads. The declared MIME (`File.type`)
 * and `File.size` are client-controlled, so neither is trusted for an upload that
 * becomes a public URL. We read the actual bytes:
 *
 * - reject empty / oversized payloads against `buffer.byteLength` (a non-browser caller
 *   can under-report `File.size`);
 * - require `file-type` to sniff the bytes to an allowed `image/*` (or `video/*`) type.
 *
 * Critically this rejects **SVG**: `file-type` returns `undefined` for SVG (XML, no magic
 * bytes), so it can never match `image/*` here. An accepted SVG served from its public R2
 * URL is a stored-XSS vector (inline `<script>` runs when the URL is opened directly).
 * Mirrors the guest evidence-upload guard (`server/web/lead/public-actions.ts`).
 */
export async function sniffUploadBuffer(
  file: File,
  opts: { maxBytes: number; allowVideo?: boolean },
): Promise<{ buffer: Buffer; mime: string; kind: "IMAGE" | "VIDEO" }> {
  const buffer = Buffer.from(await file.arrayBuffer())
  if (buffer.byteLength === 0) {
    throw new Error("File is empty.")
  }
  if (buffer.byteLength > opts.maxBytes) {
    throw new Error("File exceeds the size limit.")
  }

  const sniffed = await fileTypeFromBuffer(buffer)
  const mime = sniffed?.mime ?? ""
  const isImage = mime.startsWith("image/") // SVG → undefined → "" → rejected (stored-XSS guard)
  const isVideo = opts.allowVideo === true && mime.startsWith("video/")
  if (!isImage && !isVideo) {
    throw new Error(
      opts.allowVideo
        ? "Upload a valid image or video file (SVG and non-media files are rejected)."
        : "Upload a valid image file (SVG and non-image files are rejected).",
    )
  }

  return { buffer, mime, kind: isVideo ? "VIDEO" : "IMAGE" }
}
