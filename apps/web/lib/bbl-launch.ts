/**
 * bbl-launch.ts — Black Belt Legacy pre-launch "coming soon" gate.
 *
 * Edge-safe (no `next/headers`, no heavy imports) so it can be used by both
 * `proxy.ts` (Next.js middleware) and the client countdown component.
 *
 * The gate is **fail-open**: it is only active when `NEXT_PUBLIC_BBL_LAUNCH_AT`
 * is set to a future ISO timestamp. Unset (or in the past) ⇒ no gating, the real
 * site renders. It only ever affects the BBL brand, and never the operator /
 * system surfaces (`/app`, `/admin`, `/api`, `/auth`, …) so work continues with
 * the DNS already flipped. A `?preview` query (persisted as the `bbl_preview`
 * cookie) bypasses the gate so the operator can browse the real public site.
 *
 * @see docs/product/black-belt-legacy/BBL_LAUNCH_GATE.md
 */

export const BBL_LAUNCH_AT_ENV = "NEXT_PUBLIC_BBL_LAUNCH_AT"
export const BBL_PREVIEW_COOKIE = "bbl_preview"
export const BBL_PREVIEW_QUERY = "preview"

/**
 * The configured launch instant, or null if unset/invalid.
 *
 * Read straight from `process.env` (not the `env` wrapper) so this stays
 * edge-safe; Next inlines `NEXT_PUBLIC_*` into the client bundle and exposes it
 * at runtime in the edge middleware.
 */
export const getBblLaunchTarget = (): Date | null => {
  const raw = process.env.NEXT_PUBLIC_BBL_LAUNCH_AT
  if (!raw) {
    return null
  }
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? null : date
}

/** True while a valid launch target exists and `now` is before it. */
export const isBeforeBblLaunch = (now: Date = new Date()): boolean => {
  const target = getBblLaunchTarget()
  return target !== null && now.getTime() < target.getTime()
}

// Operator / system surfaces that must stay reachable while the public site
// shows the countdown — so the team keeps building with the DNS flipped.
const NEVER_GATED_PREFIXES = [
  "/app",
  "/admin",
  "/dashboard",
  "/me",
  "/auth",
  "/api",
  "/coming-soon",
  "/_gated",
  "/monitoring",
]

/** Whether a public BBL path should be replaced by the coming-soon page. */
export const isGatedBblPath = (pathname: string): boolean => {
  return !NEVER_GATED_PREFIXES.some(
    prefix => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}
