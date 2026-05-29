// @ts-expect-error - bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { describe, expect, it } from "bun:test"
import { getS3KeyFromUrl } from "~/lib/media"

describe("getS3KeyFromUrl", () => {
  it("extracts the key from an AWS virtual-hosted URL", () => {
    expect(
      getS3KeyFromUrl("https://my-bucket.s3.us-east-2.amazonaws.com/media/abc.png", "my-bucket"),
    ).toBe("media/abc.png")
  })

  it("drops the ?v= cache-buster appended by uploadToS3Storage", () => {
    expect(
      getS3KeyFromUrl(
        "https://my-bucket.s3.us-east-2.amazonaws.com/media/abc.png?v=1700000000000",
        "my-bucket",
      ),
    ).toBe("media/abc.png")
  })

  it("strips the leading bucket segment for path-style endpoints (MinIO)", () => {
    expect(
      getS3KeyFromUrl("http://localhost:9000/ronindojo-dev/media/abc.png?v=123", "ronindojo-dev"),
    ).toBe("media/abc.png")
  })

  it("leaves the path intact when the bucket is not the first segment", () => {
    expect(getS3KeyFromUrl("https://cdn.example.com/media/abc.png", "ronindojo-dev")).toBe(
      "media/abc.png",
    )
  })

  it("returns null for a non-parseable URL", () => {
    expect(getS3KeyFromUrl("not a url", "my-bucket")).toBeNull()
  })

  it("returns null when the URL has no object path", () => {
    expect(getS3KeyFromUrl("https://my-bucket.s3.us-east-2.amazonaws.com/", "my-bucket")).toBeNull()
  })
})
