import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"
import { withPlausibleProxy } from "next-plausible"
import {
  buildMigratedAdminAppRedirects,
  buildMigratedDashboardAppRedirects,
} from "./config/app-redirects"
import { buildSecurityHeadersConfig } from "./config/security-headers"

const withNextIntl = createNextIntlPlugin("./lib/i18n.ts")
const withPlausible = withPlausibleProxy({ customDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_URL })

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactStrictMode: false,
  allowedDevOrigins: ["bbl.local", "baseline.local", "wekaf.local"],
  // @ronin-dojo/ui-kit ships raw TS/TSX source (no build step; main → src/index.ts),
  // so Next must transpile it like first-party code (ADR 0033 D1 — shared kernel).
  transpilePackages: ["@ronin-dojo/ui-kit"],
  images: {
    // #118 introduced next/image on the BBL landing (member photos, brand media).
    // Those assets live on Cloudflare R2 public buckets whose subdomain rotates
    // (pub-<id>.r2.dev), so allow any R2 host rather than pinning one bucket.
    // Without this, next/image throws "Invalid src prop … not configured" → 500.
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      // SESSION_0493: community-feed video posts render the YouTube-provided
      // thumbnail (lib/video-embed.ts `toVideoThumbnailUrl`) as card media.
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
  async redirects() {
    return [
      ...buildMigratedAdminAppRedirects(),
      ...buildMigratedDashboardAppRedirects(),
      {
        source: "/members",
        destination: "/directory",
        permanent: false,
      },
      {
        source: "/members/:slug",
        destination: "/directory/:slug",
        permanent: false,
      },
      // SESSION_0493 (ADR 0042 Amendment 1): the SESSION_0485 `/posts` → `/blog` 301s are
      // deleted — `/posts` revives as the member community feed (`CommunityPost`), a
      // permanent sibling of the editorial `/blog` (`Post`).
    ]
  },

  // Global security-header / CSP baseline (RISK #2, P0). Hardening headers are
  // enforced; the CSP ships Report-Only first (flip CSP_ENFORCE=1 to enforce).
  // App-agnostic builder in config/security-headers.ts so each product app
  // (apps/baseline, …) replicates the same posture (SESSION_0465).
  async headers() {
    return buildSecurityHeadersConfig()
  },

  cacheLife: {
    infinite: {
      stale: Number.POSITIVE_INFINITY,
      revalidate: Number.POSITIVE_INFINITY,
      expire: Number.POSITIVE_INFINITY,
    },
  },

  turbopack: {
    root: "../../",
  },

  experimental: {
    useCache: true,
    turbopackFileSystemCacheForDev: true,

    // SESSION_0031 gate 3 — Server Actions CSRF/Origin contract on multi-domain.
    // Each request enters from a single brand origin (e.g. baseline.local or
    // baselinemartialarts.com), and Server Actions are POSTed back to that
    // same origin. Single-origin per request is therefore safe under Next's
    // default same-origin policy. Cross-brand action POSTs are not supported
    // and would be blocked by Next before our code runs.
    //
    // Once the four production apex domains land (MB-014 / ADR 0006), uncomment
    // and fill `serverActions.allowedOrigins` here. Until then, dev hosts use
    // the implicit same-origin allow.
    //
    // serverActions: {
    //   allowedOrigins: [
    //     "ronindojodesign.com",
    //     "baselinemartialarts.com",
    //     "blackbeltlegacy.com",
    //     "wekafusa.com",
    //   ],
    // },
  },
}

export default withNextIntl(withPlausible(nextConfig))
