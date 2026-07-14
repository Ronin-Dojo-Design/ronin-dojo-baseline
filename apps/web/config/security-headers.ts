/**
 * Global security-header + CSP baseline for every product app (RISK #2, P0).
 *
 * Two emission sites (SESSION_0536):
 *  - The **static hardening headers** (HSTS, frame, content-type, referrer,
 *    permissions, COOP, DNS-prefetch, Reporting-Endpoints) are wired into
 *    `next.config.ts` `headers()` via `buildSecurityHeadersConfig()` so they apply
 *    to every route. Kept app-agnostic so each product app (`apps/baseline`, …)
 *    replicates the same baseline from its own next config — the posture lives
 *    per-app (ADR 0034), not in root `vercel.json` (locked, SESSION_0465).
 *  - The **Content-Security-Policy** now emits from `proxy.ts` middleware
 *    (`buildContentSecurityPolicy(env, nonce)` + `cspHeaderName()`) because it
 *    carries a per-request nonce, which is inherently per-request and cannot be a
 *    static header. Emitting it there (not here) keeps exactly one CSP header on
 *    the document response.
 *
 * Posture (security-risk-register #2):
 *  - The hardening headers are ENFORCED now — no app-breaking surface.
 *  - The Content-Security-Policy ships in **Report-Only** (the register's "Start
 *    report-only, observe, then enforce"). It does NOT block anything yet; browsers
 *    only report violations to `/api/csp-report`. Flip `CSP_ENFORCE` to promote the
 *    same policy to the enforcing `Content-Security-Policy` header once the report
 *    stream is clean — never enforce blind.
 *
 * script-src / style-src posture (SESSION_0536 nonce migration):
 *  - `script-src` drops `'unsafe-inline'` in favour of a per-request `'nonce-…'`
 *    (dev keeps `'unsafe-eval'` for Turbopack/React-refresh). The nonce is threaded
 *    through `proxy.ts` → `x-nonce` request header → `<ThemeProvider nonce>` and the
 *    JSON-LD `<script>`; Next auto-nonces its own bootstrap by reading the CSP off
 *    the forwarded request header.
 *  - `style-src` KEEPS `'self' 'unsafe-inline'` (locked decision): a CSP nonce
 *    covers `<style>` elements but NOT inline `style={{…}}` attributes, which are
 *    pervasive (46 files) and generated at runtime by `motion/react` (20 files).
 *    Dropping it would flood violations and break animations for a low-impact
 *    residual (CSS injection ≪ script injection). So the brand `<style>`
 *    (`app/layout.tsx`) and org `<style>` (`organizations/[slug]/layout.tsx`) need
 *    no nonce — `'unsafe-inline'` already covers them.
 */

export type HeaderEntry = { key: string; value: string }

/** The CSP report sink route — where `report-uri` / `report-to` violations land. */
const CSP_REPORT_PATH = "/api/csp-report"

/**
 * Promote the CSP from Report-Only to enforcing. Defaults to Report-Only (false).
 * Set `CSP_ENFORCE=1` (or `true`) in the environment to enforce without a code
 * change once the report stream is verified clean. Never enforce blind.
 */
export const cspEnforce = (env: NodeJS.ProcessEnv = process.env): boolean =>
  env.CSP_ENFORCE === "1" || env.CSP_ENFORCE === "true"

/**
 * The CSP response-header name for the current posture: enforcing when
 * `CSP_ENFORCE` is set, Report-Only otherwise. Used by `proxy.ts` when it attaches
 * the per-request CSP; kept here so the flip stays a single-flag change.
 */
export const cspHeaderName = (env: NodeJS.ProcessEnv = process.env): string =>
  cspEnforce(env) ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only"

const isProduction = (env: NodeJS.ProcessEnv = process.env): boolean =>
  env.NODE_ENV === "production" || env.VERCEL_ENV === "production"

/**
 * Build the Content-Security-Policy directive string.
 *
 * Allowlist provenance (verified SESSION_0465):
 *  - img: Cloudflare R2 public buckets (`**.r2.dev` / `**.r2.cloudflarestorage.com`,
 *    matching next.config images.remotePatterns) + `data:`/`blob:` for inline/OG +
 *    Google favicons (`www.google.com/s2/favicons`, directory link favicons).
 *  - script/style: `'self'` + `'unsafe-inline'` (next-themes + brand inline style +
 *    Next bootstrap). `'unsafe-eval'` is dev-only (Turbopack/React refresh).
 *  - connect: `'self'` — Plausible is served same-origin via `withPlausibleProxy`
 *    (next-plausible), so no plausible.io origin is needed. `ws:`/`wss:` dev-only (HMR).
 *  - font: `'self'` + `data:` — `next/font/google` self-hosts at build time.
 *  - frame/form: Stripe Checkout/Billing. Checkout today is a server-side full-page
 *    redirect (not an embedded iframe), but allowing the origins is harmless and
 *    future-proofs an embedded flow; `form-action` covers the redirect target.
 *  - frame-ancestors 'none' (clickjacking) · base-uri 'self' · object-src 'none'.
 */
export const buildContentSecurityPolicy = (
  env: NodeJS.ProcessEnv = process.env,
  nonce?: string,
): string => {
  const prod = isProduction(env)

  // Nonce migration (SESSION_0536): when a per-request nonce is supplied (the
  // middleware path), `script-src` drops `'unsafe-inline'` for `'nonce-…'`. When it
  // is absent (any static call), behaviour is unchanged so nothing regresses.
  const scriptSrc = [
    "'self'",
    ...(nonce ? [`'nonce-${nonce}'`] : ["'unsafe-inline'"]),
    ...(prod ? [] : ["'unsafe-eval'"]),
  ]
  const connectSrc = ["'self'", ...(prod ? [] : ["ws:", "wss:"])]

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": scriptSrc,
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      "https://*.r2.dev",
      "https://*.r2.cloudflarestorage.com",
      "https://www.google.com",
    ],
    "font-src": ["'self'", "data:"],
    "connect-src": connectSrc,
    "frame-src": [
      "https://checkout.stripe.com",
      "https://billing.stripe.com",
      // SESSION_0525 — technique/reel videos embed YouTube iframes (watch + nocookie hosts).
      "https://www.youtube.com",
      "https://www.youtube-nocookie.com",
    ],
    "form-action": ["'self'", "https://checkout.stripe.com", "https://billing.stripe.com"],
    "frame-ancestors": ["'none'"],
    "base-uri": ["'self'"],
    "object-src": ["'none'"],
  }

  const parts = Object.entries(directives).map(([name, sources]) => `${name} ${sources.join(" ")}`)

  // Upgrade mixed content only in production (HTTPS); locally we serve over http.
  if (prod) parts.push("upgrade-insecure-requests")

  // Report sink (SESSION_0536): `report-uri` for legacy browsers, `report-to` for the
  // modern Reporting API (paired with the `Reporting-Endpoints: csp="…"` header). Both
  // point at the same log-only endpoint so the Report-Only stream is observable in
  // prod before the `CSP_ENFORCE` flip.
  parts.push(`report-uri ${CSP_REPORT_PATH}`)
  parts.push("report-to csp")

  return parts.join("; ")
}

/**
 * Build the ordered **static** hardening-header list for `next.config.ts`
 * `headers()`. Deliberately excludes the CSP — that carries a per-request nonce and
 * is emitted from `proxy.ts` middleware (SESSION_0536), so keeping it out here
 * guarantees a single CSP header on the document response. `Reporting-Endpoints`
 * stays here (it is static) and pairs with the CSP's `report-to csp` directive.
 */
export const buildHardeningHeaders = (env: NodeJS.ProcessEnv = process.env): HeaderEntry[] => {
  const prod = isProduction(env)
  const headers: HeaderEntry[] = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      // Deny the powerful features this app never uses; an explicit empty allowlist
      // is stricter than the browser default and silences feature probes.
      value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
    },
    { key: "X-DNS-Prefetch-Control", value: "on" },
    // COOP isolates the browsing context group (Spectre-class hardening). `same-origin`
    // is safe — the app opens no cross-origin popups that need a window handle back.
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    // Reporting API endpoint group referenced by the CSP `report-to csp` directive.
    { key: "Reporting-Endpoints", value: `csp="${CSP_REPORT_PATH}"` },
  ]

  // HSTS only in production (real HTTPS). Browsers ignore it over http, but emitting
  // it in dev is noise; gate it. 2y + preload-eligible + subdomains.
  if (prod) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    })
  }

  return headers
}

/**
 * The single `headers()` entry for `next.config.ts` — applies the static hardening
 * baseline to every route (`source: "/:path*"`). Returned as the one-element array
 * Next's `headers()` expects so the config call site is a single spread. The CSP is
 * NOT here (see `buildHardeningHeaders`) — it is emitted per-request from `proxy.ts`.
 */
export const buildSecurityHeadersConfig = (env: NodeJS.ProcessEnv = process.env) => [
  {
    source: "/:path*",
    headers: buildHardeningHeaders(env),
  },
]
