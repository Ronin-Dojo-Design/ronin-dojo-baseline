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

// SESSION_0496 pass-2 (Giddy P1): locationCountry skip-vs-clear is load-bearing for the
// Prisma partial update — undefined must stay undefined (field skipped), "" must become
// null (column cleared). A regression here silently wipes or wedges the directory form.
describe("updateDirectoryProfileSchema — locationCountry", () => {
  it("accepts a valid alpha-2 code", () => {
    const r = updateDirectoryProfileSchema.safeParse({ locationCountry: "US" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.locationCountry).toBe("US")
  })

  it("uppercases a lowercase code (readers key off the uppercase code)", () => {
    const r = updateDirectoryProfileSchema.safeParse({ locationCountry: "br" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.locationCountry).toBe("BR")
  })

  it("transforms empty string (form 'not set') to null — clears the column", () => {
    const r = updateDirectoryProfileSchema.safeParse({ locationCountry: "" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.locationCountry).toBeNull()
  })

  it("keeps undefined as undefined — Prisma skips the field, no accidental clear", () => {
    const r = updateDirectoryProfileSchema.safeParse({})
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.locationCountry).toBeUndefined()
  })

  it("rejects a 3-letter code", () => {
    const r = updateDirectoryProfileSchema.safeParse({ locationCountry: "USA" })
    expect(r.success).toBe(false)
  })

  it("rejects non-letter input", () => {
    const r = updateDirectoryProfileSchema.safeParse({ locationCountry: "1!" })
    expect(r.success).toBe(false)
  })
})
