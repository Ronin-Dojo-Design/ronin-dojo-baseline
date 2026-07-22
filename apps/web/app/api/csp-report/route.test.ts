// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it, mock } from "bun:test"

// Force the DB-write path OFF for these tests (isRateLimited → true = fail-closed skip): they assert
// the always-204 / parse / dedupe-key contract, not persistence, so they must not touch the DB. This
// also makes the file immune to a `mock.module` leak from the sibling persistence test (FS-0027).
mock.module("~/lib/rate-limiter", () => ({
  isRateLimited: async () => true,
  getIP: async () => "203.0.113.9",
}))

import { cspDedupeHash, POST, scrub } from "./route"

const post = (body: string, contentType: string): Request =>
  new Request("http://localhost/api/csp-report", {
    method: "POST",
    headers: { "content-type": contentType },
    body,
  })

describe("CSP report sink (/api/csp-report)", () => {
  it("accepts the legacy application/csp-report shape and returns 204", async () => {
    const res = await POST(
      post(
        JSON.stringify({
          "csp-report": {
            "blocked-uri": "https://evil.example/x.js",
            "violated-directive": "script-src",
            "document-uri": "https://blackbeltlegacy.com/",
            disposition: "report",
          },
        }),
        "application/csp-report",
      ),
    )

    expect(res.status).toBe(204)
    expect(await res.text()).toBe("")
  })

  it("accepts the modern Reporting API batch (application/reports+json) and returns 204", async () => {
    const res = await POST(
      post(
        JSON.stringify([
          {
            type: "csp-violation",
            body: {
              blockedURL: "https://evil.example/x.js",
              effectiveDirective: "script-src-elem",
              documentURL: "https://blackbeltlegacy.com/",
              disposition: "report",
            },
          },
        ]),
        "application/reports+json",
      ),
    )

    expect(res.status).toBe(204)
  })

  it("never throws on a malformed body — still 204", async () => {
    const res = await POST(post("not json at all", "application/csp-report"))
    expect(res.status).toBe(204)
  })

  it("ignores an oversized declared body (content-length guard) with 204", async () => {
    const req = new Request("http://localhost/api/csp-report", {
      method: "POST",
      headers: {
        "content-type": "application/csp-report",
        "content-length": String(128 * 1024),
      },
      body: JSON.stringify({ "csp-report": {} }),
    })
    const res = await POST(req)
    expect(res.status).toBe(204)
  })

  it("returns 204 on an empty body", async () => {
    const res = await POST(post("", "application/csp-report"))
    expect(res.status).toBe(204)
  })
})

describe("CSP dedupe key (cspDedupeHash + scrub)", () => {
  const shape = {
    violatedDirective: "script-src",
    blockedURI: "https://evil.example/x.js",
    documentURI: "https://blackbeltlegacy.com/",
  }

  it("is stable — the same shape hashes identically", () => {
    expect(cspDedupeHash(scrub(shape))).toBe(cspDedupeHash(scrub({ ...shape })))
  })

  it("collapses reports that differ only by query string / fragment (scrub feeds the key)", () => {
    const withQuery = {
      ...shape,
      blockedURI: "https://evil.example/x.js?token=secret",
      documentURI: "https://blackbeltlegacy.com/?ref=abc#frag",
    }
    expect(cspDedupeHash(scrub(withQuery))).toBe(cspDedupeHash(scrub(shape)))
  })

  it("is NOT keyed on disposition — report vs enforce is the same shape", () => {
    expect(cspDedupeHash(scrub({ ...shape, disposition: "report" }))).toBe(
      cspDedupeHash(scrub({ ...shape, disposition: "enforce" })),
    )
  })

  it("differs when any dedup dimension differs", () => {
    const base = cspDedupeHash(scrub(shape))
    expect(cspDedupeHash(scrub({ ...shape, violatedDirective: "img-src" }))).not.toBe(base)
    expect(cspDedupeHash(scrub({ ...shape, blockedURI: "https://evil.example/y.js" }))).not.toBe(
      base,
    )
    expect(
      cspDedupeHash(scrub({ ...shape, documentURI: "https://blackbeltlegacy.com/other" })),
    ).not.toBe(base)
  })

  it("scrub strips query/fragment and maps camelCase → persisted fields", () => {
    expect(scrub({ ...shape, blockedURI: "https://evil.example/x.js?t=1#f" })).toEqual({
      violatedDirective: "script-src",
      blockedUri: "https://evil.example/x.js",
      documentUri: "https://blackbeltlegacy.com/",
      disposition: null,
    })
  })
})
