// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { Brand } from "~/.generated/prisma/client"
import { robotsDisallowRoutesForBrand, sitemapRoutesForBrand } from "~/config/seo"

describe("sitemapRoutesForBrand", () => {
  it("keeps BBL sitemap lineage-first", () => {
    const paths = sitemapRoutesForBrand(Brand.BBL).map(route => route.path)

    expect(paths).toContain("/")
    expect(paths).toContain("/lineage")
    expect(paths).toContain("/lineage/join")
    expect(paths).toContain("/directory")
    expect(paths).toContain("/schools")
    expect(paths).toContain("/organizations")
    expect(paths).toContain("/events")
    expect(paths).toContain("/posts")
    expect(paths).toContain("/blog")
    expect(paths).toContain("/curriculum")
    expect(paths).toContain("/techniques")
    expect(paths).toContain("/techniques/graph")
    expect(paths).not.toContain("/tournaments")
    expect(paths).not.toContain("/programs")
    expect(paths).not.toContain("/categories")
    expect(paths).not.toContain("/tags")
  })

  it("keeps ungated brands broad", () => {
    const paths = sitemapRoutesForBrand(Brand.BASELINE_MARTIAL_ARTS).map(route => route.path)

    expect(paths).toContain("/lineage")
    expect(paths).toContain("/directory")
    expect(paths).toContain("/events")
  })
})

describe("robotsDisallowRoutesForBrand", () => {
  it("disallows no feature routes now that BBL ships every feature (single-brand collapse)", () => {
    // Post-collapse brandHasFeature is always true, so no feature route is robots-gated;
    // /techniques and /curriculum are real public BBL surfaces.
    expect(robotsDisallowRoutesForBrand(Brand.BBL)).toEqual([])
  })

  it("does not disallow feature routes for ungated brands", () => {
    expect(robotsDisallowRoutesForBrand(Brand.BASELINE_MARTIAL_ARTS)).toEqual([])
  })
})
