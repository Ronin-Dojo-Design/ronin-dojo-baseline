import { getSessionCookie } from "better-auth/cookies"
import { type NextRequest, NextResponse } from "next/server"
import { resolveAppTabRedirect, resolveMigratedAppRedirect } from "~/config/app-redirects"
import { buildContentSecurityPolicy, cspHeaderName } from "~/config/security-headers"

/**
 * Single-brand middleware (BBL only). No host-switching, no brand header
 * injection, no feature gate. Handles:
 *   1. Migrated-app and app-tab redirects (permanent 308)
 *   2. Auth guard — redirect logged-in users away from /auth, and
 *      unauthenticated users away from /dashboard, /admin
 *   3. Per-request CSP nonce (SESSION_0536) — on the page-render path only, mint a
 *      nonce, forward it to the app via the `x-nonce` request header, and attach the
 *      (Report-Only) Content-Security-Policy carrying that nonce to the response.
 *
 * `/me` is intentionally NOT guarded here (SESSION_0523): it is a retired thin
 * redirect that owns its own anon handling (`me/page.tsx` → `/auth/login?next=/app/profile`).
 * Guarding it here would shadow that target with `next=/me` and add a post-login hop
 * through the retired route.
 */

export const config = {
  // Match everything except Next internals and static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/auth/).*)"],
}

export const matchesRoute = (pathname: string, route: string) =>
  pathname === route || pathname.startsWith(`${route}/`)

export default async function (req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const sessionCookie = getSessionCookie(req)

  const migratedAppRedirect =
    resolveMigratedAppRedirect(pathname) ?? resolveAppTabRedirect(pathname)
  if (migratedAppRedirect) {
    const destination = new URL(migratedAppRedirect, req.url)
    for (const [key, value] of req.nextUrl.searchParams) {
      destination.searchParams.append(key, value)
    }
    return NextResponse.redirect(destination, 308)
  }

  // If the user is logged in and tries to access the auth page, redirect to the home page
  if (sessionCookie && matchesRoute(pathname, "/auth")) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // If the user is not logged in and tries to access the authed pages, redirect to the login page
  if (
    !sessionCookie &&
    (matchesRoute(pathname, "/dashboard") || matchesRoute(pathname, "/admin"))
  ) {
    return NextResponse.redirect(new URL(`/auth/login?next=${pathname}${search}`, req.url))
  }

  // Page-render path (SESSION_0536, RISK #2): mint a per-request nonce and thread it
  // through so `script-src` can drop `'unsafe-inline'` for `'nonce-…'` (Report-Only).
  // The redirect/auth-guard branches above return before here — they emit no HTML body,
  // so they need no nonce/CSP.
  //
  // Wrapped so a throw in nonce/CSP assembly degrades to a plain page render (CSP simply
  // absent for that one request — harmless under Report-Only) instead of a global 500.
  // This runs on EVERY page request; the calls below are total today, but the guard
  // protects the hot path against a later edit that introduces a throw.
  try {
    const nonce = Buffer.from(crypto.randomUUID()).toString("base64")
    const cspValue = buildContentSecurityPolicy(process.env, nonce)
    const cspHeader = cspHeaderName(process.env)

    // Forward BOTH `x-nonce` (read by `app/layout.tsx`) and the CSP itself on the REQUEST
    // headers. Next reads the nonce off the forwarded CSP request header to auto-nonce its
    // own bootstrap scripts — and it honours the Report-Only header name too (verified
    // against next@16 app-render.parseRequestHeaders, which falls back from
    // `content-security-policy` to `content-security-policy-report-only`).
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set("x-nonce", nonce)
    requestHeaders.set(cspHeader, cspValue)

    const res = NextResponse.next({ request: { headers: requestHeaders } })
    // The browser only receives (and reports/enforces against) the CSP as a RESPONSE header.
    res.headers.set(cspHeader, cspValue)
    return res
  } catch {
    // Never let CSP assembly take down the page — fall back to a normal render.
    return NextResponse.next()
  }
}
