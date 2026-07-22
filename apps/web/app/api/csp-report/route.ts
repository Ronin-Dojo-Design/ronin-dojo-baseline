/**
 * CSP violation report sink (RISK #2, SESSION_0536).
 *
 * Public and unauthenticated **by design** — browsers POST CSP violation reports
 * without credentials, so there is no session to check. Accepts both report shapes:
 *  - Modern Reporting API v1 (`application/reports+json`): a batch array of report
 *    objects, each `{ type, body: { blockedURL, effectiveDirective, documentURL, … } }`.
 *  - Legacy (`application/csp-report`): a single `{ "csp-report": { "blocked-uri", … } }`.
 *
 * Emits one compact `console.warn` line per violation (belt-and-suspenders — lands in Vercel
 * logs) AND upserts a deduplicated rollup row into `CspViolationReport` (SESSION_0617) so the
 * Report-Only stream is queryable ("clean for N days") before the `CSP_ENFORCE` flip. The upsert
 * is keyed on a stable `dedupeHash` over `(violatedDirective, blockedUri, documentUri)` — one row
 * per DISTINCT violation shape, incrementing `count` + bumping `lastSeenAt` — so the row-count is
 * immune to volume floods. Nothing sensitive is stored (query strings are scrubbed).
 *
 * Hardened against abuse: caps the body at ~64KB, applies a cheap per-instance in-memory throttle,
 * and IP-rate-limits the DB write via the `csp_report` bucket (fail-CLOSED: a limiter error just
 * SKIPS the upsert). Persistence is best-effort — a DB error is swallowed. NEVER throws to the
 * client: every path returns 204 (the browser's report POST must never see a non-204 or a 500).
 */

import { tryCatch } from "@dirstack/utils"
import { createHash } from "node:crypto"
import { getIP, isRateLimited } from "~/lib/rate-limiter"
import { db } from "~/services/db"

const MAX_BODY_BYTES = 64 * 1024

// Per-instance throttle: at most N logged violations per rolling window. Reports over
// the cap are silently dropped (still 204). This is intentionally best-effort — a
// serverless instance is short-lived, so a real DB/Redis limiter would be overkill for
// a temporary Report-Only observation sink.
const THROTTLE_WINDOW_MS = 10_000
const THROTTLE_MAX = 50
let windowStart = 0
let windowCount = 0

const throttled = (): boolean => {
  const now = Date.now()
  if (now - windowStart > THROTTLE_WINDOW_MS) {
    windowStart = now
    windowCount = 0
  }
  windowCount += 1
  return windowCount > THROTTLE_MAX
}

type NormalizedViolation = {
  blockedURI?: string
  violatedDirective?: string
  documentURI?: string
  disposition?: string
}

// A CSP report body from either shape — kebab-case (legacy) or camelCase (Reporting API).
type RawViolationBody = Record<string, unknown>

const str = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined)

const normalizeReportingApi = (body: RawViolationBody): NormalizedViolation => ({
  blockedURI: str(body.blockedURL) ?? str(body["blocked-uri"]),
  violatedDirective: str(body.effectiveDirective) ?? str(body.violatedDirective),
  documentURI: str(body.documentURL) ?? str(body.documentURI),
  disposition: str(body.disposition),
})

const normalizeLegacy = (body: RawViolationBody): NormalizedViolation => ({
  blockedURI: str(body["blocked-uri"]) ?? str(body.blockedURI),
  violatedDirective: str(body["violated-directive"]) ?? str(body["effective-directive"]),
  documentURI: str(body["document-uri"]) ?? str(body.documentURI),
  disposition: str(body.disposition),
})

const parseReports = (raw: string, contentType: string): NormalizedViolation[] => {
  const json: unknown = JSON.parse(raw)

  // Reporting API v1 batch (array of reports), sniffed by content-type or shape.
  if (contentType.includes("application/reports+json") || Array.isArray(json)) {
    const arr = Array.isArray(json) ? json : [json]
    return arr
      .filter((r): r is { body?: RawViolationBody } => typeof r === "object" && r !== null)
      .map(r => normalizeReportingApi((r.body ?? {}) as RawViolationBody))
  }

  // Legacy `application/csp-report`: single `{ "csp-report": {...} }`.
  const outer = (typeof json === "object" && json !== null ? json : {}) as RawViolationBody
  const body = (outer["csp-report"] ?? outer) as RawViolationBody
  return [normalizeLegacy(body)]
}

// Drop the query string + fragment before logging. Same-origin report URLs can carry
// query params (tokens, ids) into the Vercel logs; the origin + path is enough to
// diagnose which resource class is being blocked (log-hygiene, security-risk-register #7).
const stripQuery = (url: string | undefined): string | null => {
  if (!url) return null
  const cut = url.search(/[?#]/)
  return cut === -1 ? url : url.slice(0, cut)
}

const logViolation = (v: NormalizedViolation): void => {
  console.warn(
    `[csp-report] ${JSON.stringify({
      blockedURI: stripQuery(v.blockedURI),
      violatedDirective: v.violatedDirective ?? null,
      documentURI: stripQuery(v.documentURI),
      disposition: v.disposition ?? null,
    })}`,
  )
}

// The query-scrubbed fields we dedupe + persist on. `blockedUri`/`documentUri` are already stripped
// of query/fragment; `violatedDirective`/`disposition` are pass-through.
type ScrubbedViolation = {
  violatedDirective: string | null
  blockedUri: string | null
  documentUri: string | null
  disposition: string | null
}

export const scrub = (v: NormalizedViolation): ScrubbedViolation => ({
  violatedDirective: v.violatedDirective ?? null,
  blockedUri: stripQuery(v.blockedURI),
  documentUri: stripQuery(v.documentURI),
  disposition: v.disposition ?? null,
})

/**
 * Stable dedup key for a violation shape: sha256 hex over the three dedup dimensions
 * (`violatedDirective`, `blockedUri`, `documentUri`), each already query-scrubbed. `disposition`
 * is intentionally NOT part of the key — the same blocked resource under `report` vs `enforce`
 * is the same shape. Exported (pure) so the dedupe contract is unit-testable without a DB.
 */
export const cspDedupeHash = (v: ScrubbedViolation): string =>
  createHash("sha256")
    .update(`${v.violatedDirective ?? ""}|${v.blockedUri ?? ""}|${v.documentUri ?? ""}`)
    .digest("hex")

// Upsert the deduplicated rollup row: insert-or-increment. Best-effort — a DB error is logged and
// swallowed so persistence can never break the (always-204) report path.
const persistViolation = async (v: NormalizedViolation): Promise<void> => {
  const s = scrub(v)
  const dedupeHash = cspDedupeHash(s)
  const { error } = await tryCatch(
    db.cspViolationReport.upsert({
      where: { dedupeHash },
      create: {
        dedupeHash,
        violatedDirective: s.violatedDirective,
        blockedUri: s.blockedUri,
        documentUri: s.documentUri,
        disposition: s.disposition,
      },
      update: {
        count: { increment: 1 },
        lastSeenAt: new Date(),
        disposition: s.disposition,
      },
    }),
  )
  if (error) console.error("[csp-report] persist failed:", error)
}

const noContent = (): Response => new Response(null, { status: 204 })

export async function POST(req: Request): Promise<Response> {
  try {
    // Reject oversized bodies cheaply via the declared length before reading.
    const declaredLength = Number(req.headers.get("content-length") ?? "0")
    if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) return noContent()

    const raw = await req.text()
    if (raw.length === 0 || raw.length > MAX_BODY_BYTES) return noContent()

    const contentType = req.headers.get("content-type") ?? ""
    const violations = parseReports(raw, contentType)

    // Rate-limit the DB-write path only (IP-keyed). Any failure — no request scope (unit tests),
    // a limiter error on the fail-CLOSED `csp_report` bucket, or the cap being hit — just skips the
    // upsert; the `console.warn` still fires and we still return 204.
    const allowDbWrite = await tryCatch(
      (async () => !(await isRateLimited(`csp-report:${await getIP()}`, "csp_report")))(),
    ).then(({ data }) => data ?? false)

    for (const violation of violations) {
      if (throttled()) break
      logViolation(violation)
      if (allowDbWrite) await persistViolation(violation)
    }
  } catch {
    // Malformed body / parse error — swallow. Browsers must never see a non-204 from
    // an unauthenticated report POST.
  }
  return noContent()
}
