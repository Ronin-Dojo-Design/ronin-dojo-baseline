// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  deriveFacets,
  facetKey,
  matchMemberIds,
  nodeMatchesFacet,
  type FilterFacet,
} from "~/lib/lineage/filter-facets"
import type { LineageVisualNode } from "~/lib/lineage/to-lineage-visual"

function node(partial: Partial<LineageVisualNode> & { id: string }): LineageVisualNode {
  return {
    nodeId: `node-${partial.id}`,
    displayName: partial.id,
    slug: null,
    avatar: null,
    colorHex: null,
    rankLabel: null,
    schoolLabel: null,
    trustStatus: "unverified",
    isFocal: false,
    claimable: false,
    primaryVisualParentMemberId: null,
    visualGroupId: null,
    promotionDate: null,
    visualGroupLabel: null,
    ...partial,
  }
}

const belt = (value: string, colorHex: string | null = null): FilterFacet => ({
  dimension: "belt",
  value,
  label: value,
  colorHex,
})
const year = (value: string): FilterFacet => ({
  dimension: "year",
  value,
  label: value,
  colorHex: null,
})
const group = (value: string): FilterFacet => ({
  dimension: "group",
  value,
  label: value,
  colorHex: null,
})

describe("filter-facets / matchMemberIds", () => {
  const nodes = [
    node({ id: "a", rankLabel: "Red Belt", promotionDate: "2024-06-08T00:00:00.000Z" }),
    node({ id: "b", rankLabel: "Black Belt", promotionDate: "2024-01-01T00:00:00.000Z" }),
    node({ id: "c", rankLabel: "Red Belt", promotionDate: "2026-03-01T00:00:00.000Z" }),
    node({ id: "d", rankLabel: "Coral Belt", visualGroupLabel: "The Dirty Dozen" }),
  ]

  it("returns null when no facet is active (all lit)", () => {
    expect(matchMemberIds(nodes, [])).toBeNull()
  })

  it("ORs within a single dimension", () => {
    const matched = matchMemberIds(nodes, [belt("Red Belt"), belt("Black Belt")])
    expect(matched).toEqual(new Set(["a", "b", "c"]))
  })

  it("ANDs across dimensions (belt AND year intersection)", () => {
    const matched = matchMemberIds(nodes, [belt("Red Belt"), year("2024")])
    expect(matched).toEqual(new Set(["a"])) // c is Red but 2026; b is 2024 but Black
  })

  it("combines OR-within and AND-across", () => {
    const matched = matchMemberIds(nodes, [belt("Red Belt"), belt("Black Belt"), year("2024")])
    expect(matched).toEqual(new Set(["a", "b"]))
  })

  it("returns an empty set when nothing matches the intersection", () => {
    const matched = matchMemberIds(nodes, [belt("Coral Belt"), year("2024")])
    expect(matched).toEqual(new Set())
  })

  it("matches a group facet on visualGroupLabel", () => {
    expect(matchMemberIds(nodes, [group("The Dirty Dozen")])).toEqual(new Set(["d"]))
  })
})

describe("filter-facets / nodeMatchesFacet year coercion", () => {
  it("matches the UTC year of the promotion date", () => {
    expect(
      nodeMatchesFacet(node({ id: "x", promotionDate: "2024-12-31T23:00:00.000Z" }), year("2024")),
    ).toBe(true)
  })

  it("does not match when the promotion date is null", () => {
    expect(nodeMatchesFacet(node({ id: "x" }), year("2024"))).toBe(false)
  })
})

describe("filter-facets / deriveFacets", () => {
  it("derives group, belt, school, and year facets, years newest-first", () => {
    const facets = deriveFacets([
      node({
        id: "a",
        rankLabel: "Red Belt",
        colorHex: "#ff0000",
        schoolLabel: "Gracie Barra",
        promotionDate: "2021-01-01T00:00:00.000Z",
      }),
      node({ id: "b", rankLabel: "Red Belt", promotionDate: "2024-01-01T00:00:00.000Z" }), // dup belt, new year
      node({ id: "c", visualGroupLabel: "The Dirty Dozen" }),
    ])
    const belts = facets.filter(f => f.dimension === "belt")
    const years = facets.filter(f => f.dimension === "year").map(f => f.value)
    expect(belts).toHaveLength(1) // de-duplicated
    expect(belts[0]?.colorHex).toBe("#ff0000")
    expect(years).toEqual(["2024", "2021"]) // newest first
    expect(facets.some(f => f.dimension === "group" && f.value === "The Dirty Dozen")).toBe(true)
    expect(facets.some(f => f.dimension === "school" && f.value === "Gracie Barra")).toBe(true)
  })

  it("ignores unparseable promotion dates", () => {
    const facets = deriveFacets([node({ id: "a", promotionDate: "not-a-date" })])
    expect(facets.filter(f => f.dimension === "year")).toHaveLength(0)
  })
})

describe("filter-facets / facetKey", () => {
  it("builds a stable dimension:value key", () => {
    expect(facetKey({ dimension: "belt", value: "Red Belt" })).toBe("belt:Red Belt")
  })
})
