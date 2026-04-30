import { getSessionCookie } from "better-auth/cookies"
import { type NextRequest, NextResponse } from "next/server"
import { resolveBrand } from "~/lib/brand-context"

/**
 * Map a request hostname to a Brand.
 *
 * One Vercel deployment serves all brand domains. Proxy reads the host,
 * resolves the brand, and surfaces it to downstream code via:
 *   - the `x-brand` request header (server components / route handlers)
 *   - the `brand` cookie (client components without server roundtrip)
 *
 * Localhost and Vercel previews fall back to RONIN_DOJO_DESIGN (the umbrella).
 *
 * See ADR 0006 (multi-domain hosting) for the full rationale.
 * Host -> Brand map lives in `~/lib/brand-context` and is shared with server actions.
 */

export const config = {
  // Match everything except Next internals and static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/auth/).*)"],
}

export default async function (req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const sessionCookie = getSessionCookie(req)

  // If the user is logged in and tries to access the auth page, redirect to the home page
  if (sessionCookie && pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // If the user is not logged in and tries to access the authed pages, redirect to the login page
  if (!sessionCookie && (pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname.startsWith("/me"))) {
    return NextResponse.redirect(new URL(`/auth/login?next=${pathname}${search}`, req.url))
  }

  // Brand resolution — inject into headers + cookie for all requests.
  // The header is set on the *forwarded request* and overwrites any client-supplied
  // x-brand header so downstream code can trust it.
  const brand = resolveBrand(req.headers.get("host"))
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set("x-brand", brand)

  const res = NextResponse.next({
    request: { headers: requestHeaders },
  })

  res.cookies.set("brand", brand, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  })

  return res
}
