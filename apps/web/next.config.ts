import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"
import { withPlausibleProxy } from "next-plausible"

const withNextIntl = createNextIntlPlugin("./lib/i18n.ts")
const withPlausible = withPlausibleProxy({ customDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_URL })

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactStrictMode: false,
  allowedDevOrigins: ["bbl.local", "baseline.local", "wekaf.local"],

  cacheLife: {
    infinite: {
      stale: Number.POSITIVE_INFINITY,
      revalidate: Number.POSITIVE_INFINITY,
      expire: Number.POSITIVE_INFINITY,
    },
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
