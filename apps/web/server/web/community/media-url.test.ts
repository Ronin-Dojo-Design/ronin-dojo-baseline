/**
 * bun test server/web/community/media-url.test.ts
 *
 * SESSION_0493 — pure unit tests for the community post image-URL guard: only URLs on OUR media
 * bucket's origin pass (foreign hosts would 500 under next/image remotePatterns and are a
 * hotlink/abuse surface). No mocks — `media-url.ts` is a dependency-free pure module.
 */

// @ts-expect-error — bun:test is a Bun runtime module
import { describe, expect, it } from "bun:test"

import { expectedMediaOrigin, isAllowedCommunityImageUrl } from "~/server/web/community/media-url"

const r2Config = { bucket: "bbl-media", region: "auto", publicUrl: "https://pub-abc.r2.dev" }
const awsConfig = { bucket: "platform", region: "us-east-1", publicUrl: undefined }
const emptyConfig = { bucket: undefined, region: undefined, publicUrl: undefined }

describe("expectedMediaOrigin", () => {
  it("prefers the configured public URL origin", () => {
    expect(expectedMediaOrigin(r2Config)).toBe("https://pub-abc.r2.dev")
  })

  it("falls back to the AWS bucket URL when no public URL is set", () => {
    expect(expectedMediaOrigin(awsConfig)).toBe("https://platform.s3.us-east-1.amazonaws.com")
  })

  it("returns null when nothing is configured", () => {
    expect(expectedMediaOrigin(emptyConfig)).toBeNull()
  })
})

describe("isAllowedCommunityImageUrl", () => {
  it("accepts a URL on our media origin", () => {
    expect(
      isAllowedCommunityImageUrl("https://pub-abc.r2.dev/community-posts/x.webp", r2Config),
    ).toBe(true)
  })

  it("rejects a foreign host — even one that mimics the path", () => {
    expect(
      isAllowedCommunityImageUrl("https://evil.example.com/community-posts/x.webp", r2Config),
    ).toBe(false)
  })

  it("rejects a lookalike subdomain (origin match is exact, not suffix)", () => {
    expect(
      isAllowedCommunityImageUrl("https://pub-abc.r2.dev.evil.example.com/x.webp", r2Config),
    ).toBe(false)
  })

  it("rejects a scheme downgrade of the right host", () => {
    expect(isAllowedCommunityImageUrl("http://pub-abc.r2.dev/x.webp", r2Config)).toBe(false)
  })

  it("rejects garbage that does not parse as a URL", () => {
    expect(isAllowedCommunityImageUrl("not a url", r2Config)).toBe(false)
  })

  it("fails closed when no media origin is configured", () => {
    expect(isAllowedCommunityImageUrl("https://anywhere.test/x.webp", emptyConfig)).toBe(false)
  })
})
