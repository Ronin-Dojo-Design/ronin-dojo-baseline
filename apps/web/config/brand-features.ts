import type { Brand } from "~/.generated/prisma/client"

/**
 * Per-brand public feature allowlist (SESSION_0368; SOT-ADR D8 amendment).
 *
 * Brands without an entry get EVERY feature (Baseline/RDD unchanged). A brand
 * with an entry only ships the listed features: gated routes 404 via the
 * proxy.ts gate, and nav/footer/landing surfaces consult `brandHasFeature`.
 * Re-enabling a feature later = add one string to the brand's set.
 *
 * Edge- AND browser-safe: imported by proxy.ts (middleware) and by client
 * components (header/footer/NavSheet). The Brand import MUST stay type-only —
 * a value import of the generated enum pulls the Prisma client runtime into
 * the browser bundle and crashes the build.
 */

export const BRAND_FEATURES = [
  "lineage",
  "directory",
  "members",
  "schools",
  "organizations",
  "events",
  "certificates",
  "posts",
  "blog",
  "curriculum",
  "tournaments",
  "courses",
  "programs",
  "disciplines",
  "techniques",
  "gear",
  "merch",
  "advertise",
  "submit",
  "listings",
] as const

export type BrandFeature = (typeof BRAND_FEATURES)[number]

const ALL_FEATURES: ReadonlySet<BrandFeature> = new Set(BRAND_FEATURES)

/**
 * BBL launches lineage-first (operator grill, SESSION_0368): lineage core +
 * its funnels (directory/members/schools/orgs/events/certificates) + the
 * content surfaces the operator feeds (posts/blog). Everything else returns
 * post-flip as its lane matures.
 */
const BBL_FEATURES: ReadonlySet<BrandFeature> = new Set<BrandFeature>([
  "lineage",
  "directory",
  "members",
  "schools",
  "organizations",
  "events",
  "certificates",
  "posts",
  "blog",
  "curriculum",
  "techniques",
  "courses",
])

const FEATURES_BY_BRAND: Partial<Record<Brand, ReadonlySet<BrandFeature>>> = {
  BBL: BBL_FEATURES,
}

export const brandHasFeature = (brand: Brand, feature: BrandFeature): boolean =>
  (FEATURES_BY_BRAND[brand] ?? ALL_FEATURES).has(feature)

/**
 * Minimal-chrome brands render essentials-only header/footer (SESSION_0361
 * measured legacy spec: logo left, Join CTA + hamburger right; primary nav
 * lives in the slide-in): no inline desktop nav, no footer Browse column.
 */
const MINIMAL_CHROME: Partial<Record<Brand, boolean>> = {
  BBL: true,
}

export const brandHasMinimalChrome = (brand: Brand): boolean => MINIMAL_CHROME[brand] ?? false

/**
 * Public route prefix → gating feature, consumed by the proxy.ts gate.
 * The root listings detail route (`/[slug]`) cannot be expressed as a prefix —
 * it is gated in-page (`app/(web)/[slug]/page.tsx`).
 */
export const FEATURE_ROUTE_PREFIXES: ReadonlyArray<
  readonly [route: string, feature: BrandFeature]
> = [
  ["/lineage", "lineage"],
  ["/directory", "directory"],
  ["/members", "members"],
  ["/schools", "schools"],
  ["/organizations", "organizations"],
  ["/events", "events"],
  ["/certificates", "certificates"],
  ["/posts", "posts"],
  ["/blog", "blog"],
  ["/curriculum", "curriculum"],
  ["/tournaments", "tournaments"],
  ["/courses", "courses"],
  ["/programs", "programs"],
  ["/disciplines", "disciplines"],
  ["/techniques", "techniques"],
  ["/gear", "gear"],
  ["/merch", "merch"],
  ["/advertise", "advertise"],
  ["/submit", "submit"],
  ["/categories", "listings"],
  ["/tags", "listings"],
]
