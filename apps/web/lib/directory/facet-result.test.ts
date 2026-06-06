// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  type DirectoryFacetResult,
  initialsOf,
  mapLineageTreeToFacet,
  mapOrganizationToFacet,
  mapPersonToFacet,
  organizationHref,
} from "~/lib/directory/facet-result"

const FACET_RESULT_KEYS = [
  "badges",
  "claimStatus",
  "href",
  "id",
  "imageUrl",
  "initials",
  "subtitle",
  "tags",
  "title",
  "trustStatus",
  "type",
].sort()

function expectFacetShape(result: DirectoryFacetResult) {
  // No-leak proof: the normalized card exposes EXACTLY these keys. Any private
  // field passed in a source row cannot reach the rendered card.
  expect(Object.keys(result).sort()).toEqual(FACET_RESULT_KEYS)
}

describe("mapPersonToFacet", () => {
  it("normalizes a person, keeps trust + top rank + paid tier, and links to /directory", () => {
    const result = mapPersonToFacet({
      id: "u1",
      slug: "brian-scott",
      name: "Brian Scott",
      image: "https://cdn/avatar.png",
      profileTier: "elite",
      trustStatus: "verified",
      claimBadgeStatus: "claimable",
      locationCity: "Boulder",
      locationRegion: "CO",
      ranks: [{ rank: { id: "r1", name: "BJJ Black Belt" } }],
      // @ts-expect-error — private fields must be ignored by the mapper, not surfaced.
      email: "secret@example.com",
    })

    expect(result.type).toBe("person")
    expect(result.href).toBe("/directory/brian-scott")
    expect(result.subtitle).toBe("Boulder, CO")
    expect(result.trustStatus).toBe("verified")
    expect(result.claimStatus).toBe("claimable")
    expect(result.tags).toEqual(["BJJ Black Belt"])
    expect(result.badges).toEqual([{ label: "Elite", variant: "outline" }])
    expectFacetShape(result)
    expect(JSON.stringify(result)).not.toContain("secret@example.com")
  })

  it("falls back to Anonymous, drops the tier badge for free, and nulls empty location", () => {
    const result = mapPersonToFacet({
      id: "u2",
      slug: "anon",
      name: null,
      image: null,
      profileTier: "free",
      trustStatus: "unverified",
      claimBadgeStatus: null,
      locationCity: null,
      locationRegion: null,
      ranks: [],
    })

    expect(result.title).toBe("Anonymous")
    expect(result.subtitle).toBeNull()
    expect(result.badges).toEqual([])
    expect(result.tags).toEqual([])
    expectFacetShape(result)
  })
})

describe("mapOrganizationToFacet", () => {
  it("routes schools/dojos to /schools and shows type + disciplines, no trust", () => {
    const result = mapOrganizationToFacet({
      slug: "gracie-barra-boulder",
      name: "Gracie Barra Boulder",
      city: "Boulder",
      region: "CO",
      type: "SCHOOL",
      disciplines: [{ discipline: { name: "BJJ" } }, { discipline: { name: "Judo" } }],
    })

    expect(result.type).toBe("organization")
    expect(result.href).toBe("/schools/gracie-barra-boulder")
    expect(result.badges).toEqual([{ label: "SCHOOL", variant: "outline" }])
    expect(result.tags).toEqual(["BJJ", "Judo"])
    expect(result.trustStatus).toBeNull()
    expect(result.claimStatus).toBeNull()
    expectFacetShape(result)
  })

  it("routes leagues/federations to /organizations", () => {
    expect(organizationHref("LEAGUE", "wekaf")).toBe("/organizations/wekaf")
    expect(organizationHref("DOJO", "x")).toBe("/schools/x")
    expect(organizationHref("CLUB", "x")).toBe("/schools/x")
    expect(organizationHref(null, "x")).toBe("/schools/x")

    const result = mapOrganizationToFacet({
      slug: "wekaf",
      name: "WEKAF",
      city: null,
      region: null,
      type: "LEAGUE",
    })
    expect(result.href).toBe("/organizations/wekaf")
    expectFacetShape(result)
  })
})

describe("mapLineageTreeToFacet", () => {
  it("links to /lineage, shows discipline + owning org, claimable→claim badge", () => {
    const result = mapLineageTreeToFacet({
      id: "t1",
      slug: "rigan-machado-bjj-lineage",
      name: "Rigan Machado BJJ Lineage",
      discipline: { name: "BJJ" },
      organization: { name: "Gracie Barra", slug: "gracie-barra" },
      isClaimable: true,
    })

    expect(result.type).toBe("lineageTree")
    expect(result.href).toBe("/lineage/rigan-machado-bjj-lineage")
    expect(result.subtitle).toBe("Gracie Barra")
    expect(result.tags).toEqual(["BJJ"])
    expect(result.trustStatus).toBeNull()
    expect(result.claimStatus).toBe("claimable")
    expectFacetShape(result)
  })

  it("non-claimable tree has no claim badge and tolerates missing org/discipline", () => {
    const result = mapLineageTreeToFacet({
      id: "t2",
      slug: "orphan-tree",
      name: "Orphan Tree",
      discipline: null,
      organization: null,
      isClaimable: false,
    })

    expect(result.subtitle).toBeNull()
    expect(result.tags).toEqual([])
    expect(result.claimStatus).toBeNull()
    expectFacetShape(result)
  })
})

describe("initialsOf", () => {
  it("derives 1–2 initials and falls back to ?", () => {
    expect(initialsOf("Brian Scott")).toBe("BS")
    expect(initialsOf("Cher")).toBe("C")
    expect(initialsOf("  Gracie   Barra  Boulder ")).toBe("GB")
    expect(initialsOf(null)).toBe("?")
    expect(initialsOf("   ")).toBe("?")
  })
})
