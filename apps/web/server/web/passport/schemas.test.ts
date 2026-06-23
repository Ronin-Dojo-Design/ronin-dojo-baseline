// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { updateDirectoryProfileSchema, updatePassportSchema } from "./schemas"

// FI-007: empty optional URL fields must not produce "Invalid URL" errors.
// The form coerces null → "" via str(); the schema must accept "" and convert it to null.
// SESSION_0439: FormMedia (cover photo / video upload) clears to *null*, not "" — the
// schema must accept null too, or save blocks with the union's "Invalid input" (dogfooded
// on the live directory-profile edit screen).

describe("updatePassportSchema — avatarUrl", () => {
  it("accepts a valid URL", () => {
    const r = updatePassportSchema.safeParse({ avatarUrl: "https://cdn.example.com/a.jpg" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.avatarUrl).toBe("https://cdn.example.com/a.jpg")
  })

  it("accepts empty string and transforms to null", () => {
    const r = updatePassportSchema.safeParse({ avatarUrl: "" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.avatarUrl).toBeNull()
  })

  it("accepts null and transforms to null", () => {
    const r = updatePassportSchema.safeParse({ avatarUrl: null })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.avatarUrl).toBeNull()
  })

  it("accepts undefined (field absent)", () => {
    const r = updatePassportSchema.safeParse({})
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.avatarUrl).toBeUndefined()
  })

  it("rejects an invalid URL", () => {
    const r = updatePassportSchema.safeParse({ avatarUrl: "not-a-url" })
    expect(r.success).toBe(false)
  })
})

describe("updateDirectoryProfileSchema — coverPhotoUrl / videoIntroUrl", () => {
  it("accepts valid URLs for both fields", () => {
    const r = updateDirectoryProfileSchema.safeParse({
      coverPhotoUrl: "https://cdn.example.com/cover.jpg",
      videoIntroUrl: "https://www.youtube.com/watch?v=abc",
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.coverPhotoUrl).toBe("https://cdn.example.com/cover.jpg")
      expect(r.data.videoIntroUrl).toBe("https://www.youtube.com/watch?v=abc")
    }
  })

  it("accepts empty string for coverPhotoUrl and transforms to null", () => {
    const r = updateDirectoryProfileSchema.safeParse({ coverPhotoUrl: "" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.coverPhotoUrl).toBeNull()
  })

  it("accepts empty string for videoIntroUrl and transforms to null", () => {
    const r = updateDirectoryProfileSchema.safeParse({ videoIntroUrl: "" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.videoIntroUrl).toBeNull()
  })

  it("accepts null for both fields and transforms to null (FormMedia clears to null)", () => {
    const r = updateDirectoryProfileSchema.safeParse({ coverPhotoUrl: null, videoIntroUrl: null })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.coverPhotoUrl).toBeNull()
      expect(r.data.videoIntroUrl).toBeNull()
    }
  })

  it("accepts both fields absent (fully optional)", () => {
    const r = updateDirectoryProfileSchema.safeParse({})
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.coverPhotoUrl).toBeUndefined()
      expect(r.data.videoIntroUrl).toBeUndefined()
    }
  })

  it("rejects invalid URL for coverPhotoUrl", () => {
    const r = updateDirectoryProfileSchema.safeParse({ coverPhotoUrl: "not-a-url" })
    expect(r.success).toBe(false)
  })

  it("rejects invalid URL for videoIntroUrl", () => {
    const r = updateDirectoryProfileSchema.safeParse({ videoIntroUrl: "not-a-url" })
    expect(r.success).toBe(false)
  })
})
