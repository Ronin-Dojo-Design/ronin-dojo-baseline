// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { Brand } from "~/.generated/prisma/client"
import {
  BRAND_FEATURES,
  type BrandFeature,
  brandHasFeature,
  brandHasMinimalChrome,
  FEATURE_ROUTE_PREFIXES,
} from "~/config/brand-features"

describe("brandHasFeature", () => {
  it("BBL ships all features (single-brand collapse)", () => {
    for (const feature of BRAND_FEATURES) {
      expect(brandHasFeature(Brand.BBL, feature)).toBe(true)
    }
  })
})

describe("brandHasMinimalChrome", () => {
  it("BBL renders minimal chrome; other brands keep full chrome", () => {
    expect(brandHasMinimalChrome(Brand.BBL)).toBe(true)
    expect(brandHasMinimalChrome(Brand.BASELINE_MARTIAL_ARTS)).toBe(false)
    expect(brandHasMinimalChrome(Brand.RONIN_DOJO_DESIGN)).toBe(false)
    expect(brandHasMinimalChrome(Brand.WEKAF)).toBe(false)
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
