// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { MAX_BYTES, validateImageFile } from "./validation"

/**
 * Pins the uploader family's shared client pick-guard (SESSION_0499 — the
 * guard moved out of AvatarUploader so ImageFieldUploader shares one source).
 * This is a UX pre-gate only; the server seams' byte-sniff stays authoritative.
 */
describe("validateImageFile", () => {
  const file = (type: string, size = 1024) => new File([new Uint8Array(size)], "pick.bin", { type })

  it("accepts the allowed image types", () => {
    for (const type of ["image/jpeg", "image/png", "image/webp", "image/gif"]) {
      expect(validateImageFile(file(type))).toBeNull()
    }
  })

  it("rejects non-image and unlisted types with a user-facing message", () => {
    for (const type of ["application/pdf", "image/svg+xml", "video/mp4", ""]) {
      expect(validateImageFile(file(type))).toMatch(/JPEG, PNG, WebP, or GIF/)
    }
  })

  it("rejects files over the size ceiling and accepts files at it", () => {
    expect(validateImageFile(file("image/png", MAX_BYTES + 1))).toMatch(/under/)
    expect(validateImageFile(file("image/png", MAX_BYTES))).toBeNull()
  })
})
