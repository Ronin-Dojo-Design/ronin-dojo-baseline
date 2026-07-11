/**
 * Global security-header + CSP baseline for every product app (RISK #2, P0).
 *
 * Wired into `next.config.ts` `headers()` so it applies to every route. Kept as a
 * standalone, app-agnostic builder so each new product app (`apps/baseline`, …)
 * replicates the same baseline by calling `buildSecurityHeaders()` from its own
 * next config — the security posture lives per-app (ADR 0034), not in root
 * `vercel.json` (locked decision, SESSION_0465).
 *
 * Posture (security-risk-register #2):
 *  - The hardening headers (HSTS, frame, content-type, referrer, permissions,
 *    COOP) are ENFORCED now — they have no app-breaking surface for this app.
 *  - The Content-Security-Policy ships in **Report-Only** first (the register's
 *    "Start report-only, observe, then enforce" + open question: which directives
 *    break Stripe/analytics/media). It does NOT block anything yet; browsers only
 *    report violations. Flip `CSP_ENFORCE` (or the env override) to promote the
 *    same policy to the enforcing `Content-Security-Policy` header once the
 *    report stream is clean.
 *
 * Why `'unsafe-inline'` for script/style today (documented, intentional, to be
 * tightened): this app renders an inline `next-themes` bootstrap `<script>` and an
 * inline brand-settings `<style>` (`app/layout.tsx`), plus Next's own inline
 * bootstrap. A nonce-based strict CSP requires threading a per-request nonce
 * through a middleware rewrite — deferred. Report-Only with `'unsafe-inline'`
 * surfaces the real external-origin violations without a false wall of inline
 * hits, which is the right first observation step. The nonce migration is the
 * documented follow-up before enforcing.
 */

export type HeaderEntry = { key: string; value: string }

/**
 * Promote the CSP from Report-Only to enforcing. Defaults to Report-Only (false).
 * Set `CSP_ENFORCE=1` (or `true`) in the environment to enforce without a code
 * change once the report stream is verified clean. Never enforce blind.
 */
const cspEnforce = (env: NodeJS.ProcessEnv = process.env): boolean =>
  env.CSP_ENFORCE === "1" || env.CSP_ENFORCE === "true"

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
export const buildContentSecurityPolicy = (env: NodeJS.ProcessEnv = process.env): string => {
  const prod = isProduction(env)

  const scriptSrc = ["'self'", "'unsafe-inline'", ...(prod ? [] : ["'unsafe-eval'"])]
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

  return parts.join("; ")
}

/**
 * Build the full ordered security-header list for `next.config.ts` `headers()`.
 *
 * The CSP is emitted under `Content-Security-Policy-Report-Only` by default and
 * under the enforcing `Content-Security-Policy` once `CSP_ENFORCE` is set — the
 * same policy string either way, so promotion is a one-flag change.
 */
export const buildSecurityHeaders = (env: NodeJS.ProcessEnv = process.env): HeaderEntry[] => {
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
  ]

  // HSTS only in production (real HTTPS). Browsers ignore it over http, but emitting
  // it in dev is noise; gate it. 2y + preload-eligible + subdomains.
  if (prod) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    })
  }

  const csp = buildContentSecurityPolicy(env)
  headers.push({
    key: cspEnforce(env) ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only",
    value: csp,
  })

  return headers
}

/**
 * The single `headers()` entry for `next.config.ts` — applies the baseline to
 * every route (`source: "/:path*"`). Returned as the one-element array Next's
 * `headers()` expects so the config call site is a single spread.
 */
export const buildSecurityHeadersConfig = (env: NodeJS.ProcessEnv = process.env) => [
  {
    source: "/:path*",
    headers: buildSecurityHeaders(env),
  },
]
