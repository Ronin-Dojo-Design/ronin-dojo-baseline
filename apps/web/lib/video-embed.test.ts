// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { toVideoEmbedUrl, toVideoThumbnailUrl } from "./video-embed"

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

  it("returns null for a malformed youtube id (charset/length guard, C1-11)", () => {
    // wrong length + a disallowed char — must not be interpolated into an iframe src.
    expect(toVideoEmbedUrl("https://youtu.be/short")).toBeNull()
    expect(toVideoEmbedUrl("https://www.youtube.com/watch?v=has a space!!")).toBeNull()
  })
})

// SESSION_0493 (Desi P1): community feed card media for video-first posts.

describe("toVideoThumbnailUrl", () => {
  it("builds the img.youtube.com thumbnail from a youtube.com/watch URL", () => {
    expect(toVideoThumbnailUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    )
  })

  it("builds the thumbnail from a youtu.be short URL", () => {
    expect(toVideoThumbnailUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    )
  })

  it("builds the thumbnail from an embed URL", () => {
    expect(toVideoThumbnailUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe(
      "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    )
  })

  it("builds the thumbnail from a shorts URL", () => {
    expect(toVideoThumbnailUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe(
      "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    )
  })

  it("returns null for vimeo (no static thumbnail URL — flair fallback)", () => {
    expect(toVideoThumbnailUrl("https://vimeo.com/123456789")).toBeNull()
    expect(toVideoThumbnailUrl("https://player.vimeo.com/video/123456789")).toBeNull()
  })

  it("returns null for null / empty / unparseable input", () => {
    expect(toVideoThumbnailUrl(null)).toBeNull()
    expect(toVideoThumbnailUrl(undefined)).toBeNull()
    expect(toVideoThumbnailUrl("")).toBeNull()
    expect(toVideoThumbnailUrl("not a url")).toBeNull()
  })

  it("returns null for a non-video URL", () => {
    expect(toVideoThumbnailUrl("https://example.com/watch?v=abc")).toBeNull()
  })

  it("returns null for a youtube URL missing the id", () => {
    expect(toVideoThumbnailUrl("https://www.youtube.com/watch?list=xyz")).toBeNull()
  })
})
