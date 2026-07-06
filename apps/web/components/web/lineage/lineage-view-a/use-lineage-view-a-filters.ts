"use client"

import { useCallback, useMemo, useState } from "react"
import {
  deriveFacets,
  facetKey,
  matchMemberIds,
  type FilterDimension,
  type FilterFacet,
} from "~/lib/lineage/filter-facets"
import type { LineageVisualNode } from "~/lib/lineage/to-lineage-visual"

/**
 * The derived multi-select filter model for the cinematic lineage explorer.
 *
 * Facets (cohort group / belt / school / year) are derived from the existing
 * `LineageVisualNode` DTO data — no schema (SESSION_0395 grill Q7). Matching is
 * AND-across / OR-within (see `lib/lineage/filter-facets`). Call sites into that
 * pure lib are IDENTICAL to the prior inline island logic — this hook only owns
 * the `activeFilters` Set + the memos.
 *
 * `matchedMemberIds` preserves the lib's **null passthrough**: `matchMemberIds`
 * returns `null` when nothing is active, and the caller must forward that `null`
 * straight to `<LineageCohortTimeline>` ("all lit"). Never coerce to an empty Set.
 */
export function useLineageViewAFilters(nodes: LineageVisualNode[]) {
  // Empty set = no active filter (all shown).
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set())

  // Derive filter facets from existing DTO data (no schema): cohort group (e.g.
  // the Dirty Dozen), belt, school, and promotion year — one labeled dropdown
  // each. Matching is AND-across / OR-within (see `lib/lineage/filter-facets`).
  const facets = useMemo(() => deriveFacets(nodes), [nodes])

  const facetByKey = useMemo(() => new Map(facets.map(facet => [facetKey(facet), facet])), [facets])

  // Group facets by dimension so the bar renders one dropdown per dimension.
  const facetsByDimension = useMemo(() => {
    const map = new Map<FilterDimension, FilterFacet[]>()
    for (const facet of facets) {
      const list = map.get(facet.dimension)
      if (list) list.push(facet)
      else map.set(facet.dimension, [facet])
    }
    return map
  }, [facets])

  const matchedMemberIds = useMemo(() => {
    const activeFacets = [...activeFilters]
      .map(key => facetByKey.get(key))
      .filter((facet): facet is FilterFacet => facet != null)
    return matchMemberIds(nodes, activeFacets)
  }, [activeFilters, facetByKey, nodes])

  const toggleFilter = useCallback((key: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  // Per-dimension clear — drop only this dimension's active keys.
  const clearDimension = useCallback((dimension: FilterDimension) => {
    setActiveFilters(prev => {
      const next = new Set(prev)
      for (const key of next) {
        if (key.startsWith(`${dimension}:`)) next.delete(key)
      }
      return next
    })
  }, [])

  const clearAll = useCallback(() => setActiveFilters(new Set()), [])

  return {
    activeFilters,
    facets,
    facetsByDimension,
    matchedMemberIds,
    toggleFilter,
    clearDimension,
    clearAll,
  }
}
