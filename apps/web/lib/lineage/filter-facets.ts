import type { LineageVisualNode } from "~/lib/lineage/to-lineage-visual"

/**
 * Derived multi-select filter model for the cinematic lineage explorer.
 *
 * Facets are derived from existing `LineageVisualNode` DTO data (no schema):
 * the cohort group (e.g. "The Dirty Dozen"), belt (`rankLabel`), school, and
 * promotion year. Matching is **AND across dimensions, OR within a dimension**
 * — selecting two belts widens (either belt), but adding a year narrows
 * (that belt set *and* that year). This is the expected mental model for the
 * grouped dropdown bar (SESSION_0401), replacing the prior flat-pill
 * "OR across everything" behaviour.
 *
 * Pure module — no React. The island composes it; `filter-facets.test.ts`
 * proves it in-sandbox.
 */

export type FilterDimension = "group" | "belt" | "school" | "year"

export type FilterFacet = {
  dimension: FilterDimension
  /** Stable value matched against the node (group label / rankLabel / schoolLabel / year). */
  value: string
  /** Display label. */
  label: string
  /** Belt swatch color for belt facets (null otherwise). */
  colorHex: string | null
}

/** Stable key for a facet, used as the `activeFilters` Set member. */
export function facetKey(facet: Pick<FilterFacet, "dimension" | "value">): string {
  return `${facet.dimension}:${facet.value}`
}

/** Does a node satisfy a single facet (one value within one dimension)? */
export function nodeMatchesFacet(node: LineageVisualNode, facet: FilterFacet): boolean {
  switch (facet.dimension) {
    case "group":
      return node.visualGroupLabel === facet.value
    case "belt":
      return node.rankLabel === facet.value
    case "school":
      return node.schoolLabel === facet.value
    case "year":
      return (
        node.promotionDate != null &&
        String(new Date(node.promotionDate).getUTCFullYear()) === facet.value
      )
  }
}

/** Derive the available facets (group, belt, school, year) from the visible nodes. */
export function deriveFacets(nodes: LineageVisualNode[]): FilterFacet[] {
  const groups = new Map<string, FilterFacet>()
  const belts = new Map<string, FilterFacet>()
  const schools = new Map<string, FilterFacet>()
  const years = new Map<string, FilterFacet>()
  for (const node of nodes) {
    if (node.visualGroupLabel && !groups.has(node.visualGroupLabel)) {
      groups.set(node.visualGroupLabel, {
        dimension: "group",
        value: node.visualGroupLabel,
        label: node.visualGroupLabel,
        colorHex: null,
      })
    }
    if (node.rankLabel && !belts.has(node.rankLabel)) {
      belts.set(node.rankLabel, {
        dimension: "belt",
        value: node.rankLabel,
        label: node.rankLabel,
        colorHex: node.colorHex,
      })
    }
    if (node.schoolLabel && !schools.has(node.schoolLabel)) {
      schools.set(node.schoolLabel, {
        dimension: "school",
        value: node.schoolLabel,
        label: node.schoolLabel,
        colorHex: null,
      })
    }
    if (node.promotionDate) {
      const year = String(new Date(node.promotionDate).getUTCFullYear())
      if (year !== "NaN" && !years.has(year)) {
        years.set(year, { dimension: "year", value: year, label: year, colorHex: null })
      }
    }
  }
  return [
    ...groups.values(),
    ...belts.values(),
    ...schools.values(),
    ...[...years.values()].sort((a, b) => b.value.localeCompare(a.value)),
  ]
}

/**
 * The set of member ids that survive the active facets, or `null` when no
 * filter is active (caller treats `null` as "all lit"). A node survives when it
 * matches in **every** active dimension (AND) by matching **any** selected
 * value within that dimension (OR).
 */
export function matchMemberIds(
  nodes: LineageVisualNode[],
  activeFacets: FilterFacet[],
): Set<string> | null {
  if (activeFacets.length === 0) return null

  // Group active facets by dimension so we can AND across dimensions.
  const byDimension = new Map<FilterDimension, FilterFacet[]>()
  for (const facet of activeFacets) {
    const list = byDimension.get(facet.dimension)
    if (list) list.push(facet)
    else byDimension.set(facet.dimension, [facet])
  }
  const dimensions = [...byDimension.values()]

  const matched = new Set<string>()
  for (const node of nodes) {
    // AND across dimensions: every active dimension must have a matching value (OR within).
    if (dimensions.every(facets => facets.some(facet => nodeMatchesFacet(node, facet)))) {
      matched.add(node.id)
    }
  }
  return matched
}
