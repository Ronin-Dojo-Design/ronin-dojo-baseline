// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { POST } from "./route"

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
