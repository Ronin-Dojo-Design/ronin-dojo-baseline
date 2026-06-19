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
  "rankColorHex",
  "save",
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
      passportId: "p1",
      slug: "brian-scott",
      name: "Brian Scott",
      image: "https://cdn/avatar.png",
      profileTier: "elite",
      trustStatus: "verified",
      claimBadgeStatus: "claimable",
      locationCity: "Boulder",
      locationRegion: "CO",
      ranks: [{ rank: { id: "r1", name: "BJJ Black Belt", colorHex: "#1A1A1A" } }],
      // @ts-expect-error — private fields must be ignored by the mapper, not surfaced.
      email: "secret@example.com",
    })

    expect(result.type).toBe("person")
    expect(result.href).toBe("/directory/brian-scott")
    expect(result.subtitle).toBe("Boulder, CO")
    expect(result.trustStatus).toBe("verified")
    expect(result.claimStatus).toBe("claimable")
    expect(result.tags).toEqual(["BJJ Black Belt"])
    // Belt tint for the lead tag is sourced from `Rank.colorHex` (SESSION_0414).
    expect(result.rankColorHex).toBe("#1A1A1A")
    expect(result.badges).toEqual([{ label: "Elite", variant: "outline" }])
    expect(result.save).toEqual({ subjectType: "PERSON", subjectId: "p1" })
    expectFacetShape(result)
    expect(JSON.stringify(result)).not.toContain("secret@example.com")
  })

  it("falls back to Anonymous, drops the tier badge for free, and nulls empty location", () => {
    const result = mapPersonToFacet({
      id: "u2",
      passportId: "p2",
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
    // No rank → no belt tint.
    expect(result.rankColorHex).toBeNull()
    expectFacetShape(result)
  })
})

describe("mapOrganizationToFacet", () => {
  it("routes schools/dojos to /schools and shows type + disciplines, no trust", () => {
    const result = mapOrganizationToFacet({
      id: "o1",
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
    expect(result.save).toEqual({ subjectType: "ORGANIZATION", subjectId: "o1" })
    expect(result.trustStatus).toBeNull()
    expect(result.claimStatus).toBeNull()
    // Belt tint is people-only; orgs never carry a rank color.
    expect(result.rankColorHex).toBeNull()
    expectFacetShape(result)
  })

  it("routes leagues/federations to /organizations", () => {
    expect(organizationHref("LEAGUE", "wekaf")).toBe("/organizations/wekaf")
    expect(organizationHref("DOJO", "x")).toBe("/schools/x")
    expect(organizationHref("SCHOOL", "x")).toBe("/schools/x")
    expect(organizationHref("CLUB", "x")).toBe("/schools/x")
    // null/unknown types route to /organizations (resolves for ANY org), NOT
    // /schools (which 404s non-school types). Regression: WL link-through fix.
    expect(organizationHref(null, "x")).toBe("/organizations/x")
    expect(organizationHref("FEDERATION", "x")).toBe("/organizations/x")

    const result = mapOrganizationToFacet({
      id: "o2",
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
    expect(result.save).toEqual({ subjectType: "TREE", subjectId: "t1" })
    // Belt tint is people-only; trees never carry a rank color.
    expect(result.rankColorHex).toBeNull()
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
