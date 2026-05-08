// @ts-expect-error - bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { describe, expect, it } from "bun:test"
import { resolvePublicMediaUrl } from "~/lib/public-media-url"

describe("resolvePublicMediaUrl", () => {
  it("leaves root-relative local paths unchanged when no public media base is configured", () => {
    expect(resolvePublicMediaUrl("/images/merch/gi.jpg", { baseUrl: "" })).toBe(
      "/images/merch/gi.jpg",
    )
  })

  it("prefixes root-relative public paths with the configured media base", () => {
    expect(
      resolvePublicMediaUrl("/images/merch/gi.jpg", {
        baseUrl: "https://media.example.com/public",
      }),
    ).toBe("https://media.example.com/public/images/merch/gi.jpg")
  })

  it("normalizes duplicate slashes between base and path", () => {
    expect(
      resolvePublicMediaUrl("images/merch/gi.jpg", {
        baseUrl: "https://media.example.com/public/",
      }),
    ).toBe("https://media.example.com/public/images/merch/gi.jpg")
  })

  it("passes through absolute URLs and data URLs", () => {
    expect(
      resolvePublicMediaUrl("https://cdn.example.com/images/gi.jpg", {
        baseUrl: "https://media.example.com/public",
      }),
    ).toBe("https://cdn.example.com/images/gi.jpg")
    expect(
      resolvePublicMediaUrl("data:image/svg+xml;base64,abc", { baseUrl: "https://x.test" }),
    ).toBe("data:image/svg+xml;base64,abc")
  })
})
