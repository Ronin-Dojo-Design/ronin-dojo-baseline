import type { Brand } from "~/.generated/prisma/client"

/**
 * BBL ships all features (single-brand collapse). brandHasFeature always
 * returns true — the per-brand allowlist gate has been removed.
 *
 * FEATURE_ROUTE_PREFIXES is kept as documentation of the route→feature mapping
 * (consumed by nav/footer and the slug-page in-page gate).
 *
 * Edge- AND browser-safe: imported by client components (header/footer/NavSheet).
 * The Brand import MUST stay type-only — a value import of the generated enum
 * pulls the Prisma client runtime into the browser bundle and crashes the build.
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

export const brandHasFeature = (_brand: Brand, _feature: BrandFeature): boolean => true

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
 * Public route prefix → feature mapping. Used by nav/footer surfaces and
 * the in-page gate at app/(web)/[slug]/page.tsx.
 * The root listings detail route (`/[slug]`) cannot be expressed as a prefix —
 * it is gated in-page.
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
