import { getSessionCookie } from "better-auth/cookies"
import { type NextRequest, NextResponse } from "next/server"
import { resolveAppTabRedirect, resolveMigratedAppRedirect } from "~/config/app-redirects"

/**
 * Single-brand middleware (BBL only). No host-switching, no brand header
 * injection, no feature gate. Handles:
 *   1. Migrated-app and app-tab redirects (permanent 308)
 *   2. Auth guard — redirect logged-in users away from /auth, and
 *      unauthenticated users away from /dashboard, /admin
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

  return NextResponse.next()
}
