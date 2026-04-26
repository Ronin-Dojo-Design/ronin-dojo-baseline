import { type NextRequest, NextResponse } from "next/server"
import { Brand } from "~/.generated/prisma/client"

/**
 * Map a request hostname to a Brand.
 *
 * One Vercel deployment serves all brand domains. Middleware reads the host,
 * resolves the brand, and surfaces it to downstream code via:
 *   - the `x-brand` request header (server components / route handlers)
 *   - the `brand` cookie (client components without server roundtrip)
 *
 * Localhost and Vercel previews fall back to RONIN_DOJO_DESIGN (the umbrella).
 *
 * See ADR 0006 (multi-domain hosting) for the full rationale.
 */

// Edit the right-hand side as real domains are registered. Until then, the
// branded subdomains under ronindojo.local are useful for local Caddy/etc setups.
const HOST_TO_BRAND: Record<string, Brand> = {
  // Production / public domains — fill in once registered.
  // "ronindojodesign.com": Brand.RONIN_DOJO_DESIGN,
  // "baselinemartialarts.com": Brand.BASELINE_MARTIAL_ARTS,
  // "blackbeltlegacy.com": Brand.BBL,
  // "wekafusa.com": Brand.WEKAF,

  // Local dev convention (optional — set up via /etc/hosts if you want
  // to exercise multi-brand routing on localhost).
  "ronindojo.local": Brand.RONIN_DOJO_DESIGN,
  "baseline.local": Brand.BASELINE_MARTIAL_ARTS,
  "bbl.local": Brand.BBL,
  "wekaf.local": Brand.WEKAF,
}

const DEFAULT_BRAND: Brand = Brand.RONIN_DOJO_DESIGN

export const resolveBrand = (host: string | null | undefined): Brand => {
  if (!host) return DEFAULT_BRAND
  const bare = host.split(":")[0].toLowerCase()
  return HOST_TO_BRAND[bare] ?? DEFAULT_BRAND
}

export function middleware(req: NextRequest) {
  const brand = resolveBrand(req.headers.get("host"))

  // Forward the brand to server components / route handlers via a request header.
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set("x-brand", brand)

  const res = NextResponse.next({
    request: { headers: requestHeaders },
  })

  // Mirror it as a cookie so client components can read it without a roundtrip.
  // Not httpOnly — intentionally readable by the brand switcher / theme code.
  res.cookies.set("brand", brand, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  })

  return res
}

export const config = {
  // Skip Next internals and static files; everything else gets brand resolution.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/auth/).*)"],
}
