/**
 * CSP violation report sink (RISK #2, SESSION_0536).
 *
 * Public and unauthenticated **by design** — browsers POST CSP violation reports
 * without credentials, so there is no session to check. Accepts both report shapes:
 *  - Modern Reporting API v1 (`application/reports+json`): a batch array of report
 *    objects, each `{ type, body: { blockedURL, effectiveDirective, documentURL, … } }`.
 *  - Legacy (`application/csp-report`): a single `{ "csp-report": { "blocked-uri", … } }`.
 *
 * Log-only (no DB / no Redis — locked, SESSION_0536): each violation is emitted as one
 * compact `console.warn` line so it lands in Vercel logs for the Report-Only observation
 * window before the `CSP_ENFORCE` flip. Nothing sensitive is logged.
 *
 * Hardened against abuse: caps the body at ~64KB and applies a cheap per-instance
 * in-memory throttle so a flood cannot spam the logs. NEVER throws to the client —
 * every path returns 204.
 */

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

const noContent = (): Response => new Response(null, { status: 204 })

export async function POST(req: Request): Promise<Response> {
  try {
    // Reject oversized bodies cheaply via the declared length before reading.
    const declaredLength = Number(req.headers.get("content-length") ?? "0")
    if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) return noContent()

    const raw = await req.text()
    if (raw.length === 0 || raw.length > MAX_BODY_BYTES) return noContent()

    const contentType = req.headers.get("content-type") ?? ""
    for (const violation of parseReports(raw, contentType)) {
      if (throttled()) break
      logViolation(violation)
    }
  } catch {
    // Malformed body / parse error — swallow. Browsers must never see a non-204 from
    // an unauthenticated report POST.
  }
  return noContent()
}
