import { getDomain } from "@dirstack/utils"
import type { Brand } from "~/.generated/prisma/client"
import { env } from "~/env"

type BrandSiteConfig = {
  name: string
  slug: string
  tagline: string
  description: string
  email: string
  url: string
  domain: string
  /** Root-relative path to the brand logo image (PNG/SVG). */
  logoSrc: string
  /** Root-relative path to the brand favicon (PNG). */
  faviconSrc: string
  /** Root-relative path to the brand OpenGraph image (PNG). */
  ogImageSrc: string
}

// Single-brand collapse (SESSION_0447): the per-brand `Record<Brand, …>` is gone —
// BBL is the only brand. The `_brand` param on getBrandSiteConfig is retained
// (every caller passes `Brand.BBL`) until the gated Stage-2 `Brand` enum drop.
const bblConfig: Pick<
  BrandSiteConfig,
  "name" | "slug" | "tagline" | "description" | "logoSrc" | "faviconSrc" | "ogImageSrc"
> = {
  name: "Black Belt Legacy",
  slug: "black-belt-legacy",
  tagline: "Honor the Lineage. Build the Future.",
  description:
    "Preserving martial arts heritage through lineage tracking, curriculum, and certifications.",
  logoSrc: "/brand/blackbeltlegacy/bbl-logo-white.png",
  faviconSrc: "/images/brands/black-belt-legacy/favicon.png",
  ogImageSrc: "/images/brands/black-belt-legacy/opengraph.png",
}

/**
 * Get brand-specific site config. Use this in server components/actions where you
 * have the brand. Single-brand collapse: always returns the BBL config; the
 * `_brand` param is retained for call-site compatibility.
 */
export const getBrandSiteConfig = (_brand: Brand): BrandSiteConfig => ({
  ...bblConfig,
  email: "welcome@blackbeltlegacy.com",
  url: env.NEXT_PUBLIC_SITE_URL,
  domain: getDomain(env.NEXT_PUBLIC_SITE_URL),
})

/**
 * Default site config — backward compatible. Falls back to Baseline Martial Arts
 * for contexts where brand isn't resolved yet (static imports, build-time).
 * NOTE (SESSION_0447): `name`/`slug` still read "Baseline" — a static metadata
 * fallback (runtime uses `getBrandSiteConfig(BBL)`); left for a follow-up metadata
 * destale, not changed here to keep this pass behavior-preserving.
 */
export const siteConfig = {
  name: "Baseline Martial Arts",
  slug: "baseline-martial-arts",
  email: "welcome@blackbeltlegacy.com",
  url: env.NEXT_PUBLIC_SITE_URL,
  domain: getDomain(env.NEXT_PUBLIC_SITE_URL),
}
