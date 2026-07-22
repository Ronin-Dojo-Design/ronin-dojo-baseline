/**
 * SESSION_0617 — persistence proof for the CSP report sink (`/api/csp-report`).
 *
 * Proves the route UPSERTS a deduplicated rollup row into `CspViolationReport`: a new violation
 * shape inserts (count=1), a repeat of the SAME shape increments `count` + bumps `lastSeenAt` on
 * the ONE row (dedupe), distinct shapes get distinct rows, and a rate-limited request skips the DB
 * write entirely while STILL returning 204 (the browser must never see a non-204).
 *
 * Hits the real local dev DB (mirrors `server/web/bbl/capture-email.test.ts`) — the migration
 * `20260722000000_add_csp_violation_report` must be applied locally (`prisma migrate deploy`).
 *
 * Run:  cd apps/web && bun test app/api/csp-report/route.persist.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeEach, describe, expect, it, mock } from "bun:test"

// Mock the rate limiter (no Redis in tests): `limited` is toggled per-test, getIP is stubbed so the
// route never reaches `next/headers`.
const rateLimitState = { limited: false }
mock.module("~/lib/rate-limiter", () => ({
  isRateLimited: async () => rateLimitState.limited,
  getIP: async () => "203.0.113.7",
}))

// --- real imports, after mocks ---
import { cspDedupeHash, POST, scrub } from "./route"
import { db } from "~/services/db"

// Unique sentinel so cleanup is targeted and can never collide with the sibling route.test.ts rows.
const TS = Date.now()
const DOC_PREFIX = `https://unit-test.local/csp-${TS}/`

const post = (body: unknown, contentType = "application/csp-report"): Request =>
  new Request("http://localhost/api/csp-report", {
    method: "POST",
    headers: { "content-type": contentType },
    body: JSON.stringify(body),
  })

const legacy = (over: Record<string, string>) => ({
  "csp-report": {
    "blocked-uri": "https://evil.example/x.js",
    "violated-directive": "script-src",
    "document-uri": `${DOC_PREFIX}page`,
    disposition: "report",
    ...over,
  },
})

const hashOf = (
  over: Partial<{ violatedDirective: string; blockedURI: string; documentURI: string }>,
) =>
  cspDedupeHash(
    scrub({
      violatedDirective: "script-src",
      blockedURI: "https://evil.example/x.js",
      documentURI: `${DOC_PREFIX}page`,
      ...over,
    }),
  )

const cleanup = async () => {
  await db.cspViolationReport.deleteMany({ where: { documentUri: { startsWith: DOC_PREFIX } } })
}

beforeEach(async () => {
  rateLimitState.limited = false
  await cleanup()
})

afterAll(async () => {
  await cleanup()
  await db.$disconnect()
})

describe("CSP report persistence (/api/csp-report)", () => {
  it("inserts a rollup row (count=1) for a new violation shape and returns 204", async () => {
    const res = await POST(post(legacy({})))
    expect(res.status).toBe(204)

    const row = await db.cspViolationReport.findUnique({ where: { dedupeHash: hashOf({}) } })
    expect(row).not.toBeNull()
    expect(row?.count).toBe(1)
    expect(row?.violatedDirective).toBe("script-src")
    expect(row?.blockedUri).toBe("https://evil.example/x.js")
    expect(row?.documentUri).toBe(`${DOC_PREFIX}page`)
    expect(row?.disposition).toBe("report")
  })

  it("dedupes + increments — the same shape twice keeps ONE row with count=2 and bumps lastSeenAt", async () => {
    await POST(post(legacy({})))
    const afterFirst = await db.cspViolationReport.findUnique({ where: { dedupeHash: hashOf({}) } })

    await POST(post(legacy({})))
    const afterSecond = await db.cspViolationReport.findUnique({
      where: { dedupeHash: hashOf({}) },
    })

    expect(
      await db.cspViolationReport.count({ where: { documentUri: { startsWith: DOC_PREFIX } } }),
    ).toBe(1)
    expect(afterSecond?.count).toBe(2)
    expect(afterSecond?.id).toBe(afterFirst?.id)
    expect(afterSecond!.lastSeenAt.getTime()).toBeGreaterThanOrEqual(
      afterFirst!.lastSeenAt.getTime(),
    )
    // firstSeenAt is frozen at insert.
    expect(afterSecond!.firstSeenAt.getTime()).toBe(afterFirst!.firstSeenAt.getTime())
  })

  it("query-string variations collapse onto the SAME row (query-scrub before dedupe)", async () => {
    await POST(post(legacy({})))
    await POST(
      post(
        legacy({
          "blocked-uri": "https://evil.example/x.js?token=leak",
          "document-uri": `${DOC_PREFIX}page?ref=1`,
        }),
      ),
    )

    expect(
      await db.cspViolationReport.count({ where: { documentUri: { startsWith: DOC_PREFIX } } }),
    ).toBe(1)
    const row = await db.cspViolationReport.findUnique({ where: { dedupeHash: hashOf({}) } })
    expect(row?.count).toBe(2)
    // The scrubbed (query-free) URI is what we persist — no token leaks into the store.
    expect(row?.blockedUri).toBe("https://evil.example/x.js")
  })

  it("distinct shapes get distinct rows", async () => {
    await POST(post(legacy({})))
    await POST(
      post(
        legacy({ "violated-directive": "img-src", "blocked-uri": "https://cdn.example/pic.png" }),
      ),
    )

    expect(
      await db.cspViolationReport.count({ where: { documentUri: { startsWith: DOC_PREFIX } } }),
    ).toBe(2)
  })

  it("skips the DB write when rate-limited but STILL returns 204", async () => {
    rateLimitState.limited = true
    const res = await POST(post(legacy({})))

    expect(res.status).toBe(204)
    expect(await db.cspViolationReport.findUnique({ where: { dedupeHash: hashOf({}) } })).toBeNull()
  })

  it("persists the modern Reporting API batch shape too", async () => {
    const res = await POST(
      post(
        [
          {
            type: "csp-violation",
            body: {
              blockedURL: "https://evil.example/x.js",
              effectiveDirective: "script-src-elem",
              documentURL: `${DOC_PREFIX}reporting-api`,
              disposition: "report",
            },
          },
        ],
        "application/reports+json",
      ),
    )
    expect(res.status).toBe(204)

    const hash = cspDedupeHash(
      scrub({
        violatedDirective: "script-src-elem",
        blockedURI: "https://evil.example/x.js",
        documentURI: `${DOC_PREFIX}reporting-api`,
      }),
    )
    const row = await db.cspViolationReport.findUnique({ where: { dedupeHash: hash } })
    expect(row).not.toBeNull()
    expect(row?.violatedDirective).toBe("script-src-elem")
  })
})
