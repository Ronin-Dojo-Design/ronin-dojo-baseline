// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { toVideoEmbedUrl } from "./video-embed"

// FI-007 / WL-P2-15: directory profile video-intro embed URL normalization.

describe("toVideoEmbedUrl", () => {
  it("converts a youtube.com/watch URL", () => {
    expect(toVideoEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    )
  })

  it("converts a youtu.be short URL", () => {
    expect(toVideoEmbedUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    )
  })

  it("normalizes an already-embed youtube URL", () => {
    expect(toVideoEmbedUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    )
  })

  it("converts a youtube shorts URL", () => {
    expect(toVideoEmbedUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    )
  })

  it("converts a vimeo.com URL", () => {
    expect(toVideoEmbedUrl("https://vimeo.com/123456789")).toBe(
      "https://player.vimeo.com/video/123456789",
    )
  })

  it("normalizes an already-player vimeo URL", () => {
    expect(toVideoEmbedUrl("https://player.vimeo.com/video/123456789")).toBe(
      "https://player.vimeo.com/video/123456789",
    )
  })

  it("returns null for null / empty input", () => {
    expect(toVideoEmbedUrl(null)).toBeNull()
    expect(toVideoEmbedUrl(undefined)).toBeNull()
    expect(toVideoEmbedUrl("")).toBeNull()
  })

  it("returns null for a non-video URL", () => {
    expect(toVideoEmbedUrl("https://example.com/watch?v=abc")).toBeNull()
  })

  it("returns null for unparseable input", () => {
    expect(toVideoEmbedUrl("not a url")).toBeNull()
  })

  it("returns null for a youtube URL missing the id", () => {
    expect(toVideoEmbedUrl("https://www.youtube.com/watch?list=xyz")).toBeNull()
  })
})
