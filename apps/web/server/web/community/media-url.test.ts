/**
 * bun test server/web/community/media-url.test.ts
 *
 * SESSION_0493 — pure unit tests for the community post image-URL guard: only URLs on OUR media
 * bucket's origin pass (foreign hosts would 500 under next/image remotePatterns and are a
 * hotlink/abuse surface). No mocks — `media-url.ts` is a dependency-free pure module.
 */

// @ts-expect-error — bun:test is a Bun runtime module
import { describe, expect, it } from "bun:test"

import {
  expectedMediaOrigin,
  expectedMediaPrefix,
  isAllowedCommunityImageUrl,
} from "~/server/web/community/media-url"

const r2Config = { bucket: "bbl-media", region: "auto", publicUrl: "https://pub-abc.r2.dev" }
const awsConfig = { bucket: "platform", region: "us-east-1", publicUrl: undefined }
const emptyConfig = { bucket: undefined, region: undefined, publicUrl: undefined }
// Local MinIO exposes a PATH-STYLE base (bucket is a path segment, not a subdomain). The uploader
// then writes `http://localhost:9000/ronindojo-dev/community-posts/<uuid>` — the case that the old
// root-anchored `/community-posts/` guard wrongly rejected on dev.
const minioConfig = {
  bucket: "ronindojo-dev",
  region: "us-east-1",
  publicUrl: "http://localhost:9000/ronindojo-dev",
}

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

  it("keeps the origin only (drops the base path) for a path-style base", () => {
    expect(expectedMediaOrigin(minioConfig)).toBe("http://localhost:9000")
  })
})

describe("expectedMediaPrefix", () => {
  it("is root-anchored for an origin-only base (R2)", () => {
    expect(expectedMediaPrefix(r2Config)).toBe("/community-posts/")
  })

  it("includes the bucket path segment for a path-style base (MinIO)", () => {
    expect(expectedMediaPrefix(minioConfig)).toBe("/ronindojo-dev/community-posts/")
  })

  it("returns null when nothing is configured", () => {
    expect(expectedMediaPrefix(emptyConfig)).toBeNull()
  })
})

describe("isAllowedCommunityImageUrl", () => {
  it("accepts a URL on our media origin under the community-posts prefix", () => {
    expect(
      isAllowedCommunityImageUrl("https://pub-abc.r2.dev/community-posts/x.webp", r2Config),
    ).toBe(true)
  })

  it("rejects a right-origin URL OUTSIDE the community-posts prefix (another bucket object)", () => {
    expect(isAllowedCommunityImageUrl("https://pub-abc.r2.dev/admin-media/x.webp", r2Config)).toBe(
      false,
    )
  })

  it("accepts a PATH-STYLE (MinIO) URL under the base's community-posts prefix", () => {
    // The regression: on local dev the real uploaded URL carries the bucket path segment. The old
    // root-anchored guard rejected this valid image; the base-derived prefix accepts it.
    expect(
      isAllowedCommunityImageUrl(
        "http://localhost:9000/ronindojo-dev/community-posts/x.webp",
        minioConfig,
      ),
    ).toBe(true)
  })

  it("rejects a path-style URL that skips the bucket path segment (root-anchored prefix)", () => {
    // A URL under `/community-posts/` at the ROOT (missing the `/ronindojo-dev` base path) is NOT a
    // real object in this bucket — the prefix must include the base path.
    expect(
      isAllowedCommunityImageUrl("http://localhost:9000/community-posts/x.webp", minioConfig),
    ).toBe(false)
  })

  it("rejects a path-style URL under a DIFFERENT bucket path segment", () => {
    expect(
      isAllowedCommunityImageUrl(
        "http://localhost:9000/other-bucket/community-posts/x.webp",
        minioConfig,
      ),
    ).toBe(false)
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
