// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { Brand } from "~/.generated/prisma/client"
import {
  BRAND_FEATURES,
  type BrandFeature,
  brandHasFeature,
  FEATURE_ROUTE_PREFIXES,
} from "~/config/brand-features"

describe("brandHasFeature", () => {
  it("BBL ships the lineage-first launch set", () => {
    const kept: BrandFeature[] = [
      "lineage",
      "directory",
      "members",
      "schools",
      "organizations",
      "events",
      "certificates",
      "posts",
      "blog",
    ]
    for (const feature of kept) {
      expect(brandHasFeature(Brand.BBL, feature)).toBe(true)
    }
  })

  it("BBL gates everything outside the launch set", () => {
    const gated: BrandFeature[] = [
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
    ]
    for (const feature of gated) {
      expect(brandHasFeature(Brand.BBL, feature)).toBe(false)
    }
  })

  it("brands without an allowlist entry get every feature", () => {
    for (const feature of BRAND_FEATURES) {
      expect(brandHasFeature(Brand.BASELINE_MARTIAL_ARTS, feature)).toBe(true)
      expect(brandHasFeature(Brand.RONIN_DOJO_DESIGN, feature)).toBe(true)
      expect(brandHasFeature(Brand.WEKAF, feature)).toBe(true)
    }
  })
})

describe("FEATURE_ROUTE_PREFIXES", () => {
  it("has unique route prefixes", () => {
    const routes = FEATURE_ROUTE_PREFIXES.map(([route]) => route)
    expect(new Set(routes).size).toBe(routes.length)
  })

  it("covers every gated BBL feature with a route or a documented in-page gate", () => {
    const prefixFeatures = new Set(FEATURE_ROUTE_PREFIXES.map(([, feature]) => feature))
    for (const feature of BRAND_FEATURES) {
      // "listings" detail is gated in-page at app/(web)/[slug]/page.tsx;
      // its taxonomy routes (/categories, /tags) are prefix-gated.
      expect(prefixFeatures.has(feature)).toBe(true)
    }
  })
})
