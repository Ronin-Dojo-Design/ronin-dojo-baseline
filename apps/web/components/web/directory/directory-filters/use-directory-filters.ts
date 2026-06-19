"use client"

import { useFilters } from "~/contexts/filter-context"
import type { DirectoryFacetTab } from "~/lib/directory/facet-result"
import type { DirectoryFilterOptions } from "~/server/web/directory/filter-options"
import type { DirectoryFilterSchema } from "~/server/web/directory/schema"

/** Shared prop for the option-driven filter sub-components. */
export type DirectoryFilterControlProps = {
  options: DirectoryFilterOptions
}

/** Mirror of `normalizeDirectoryFacetTab` kept client-side to avoid importing the server facets module. */
function activeFacetTab(type: string): DirectoryFacetTab {
  return type === "organizations" || type === "trees" ? type : "people"
}

/** Shared hook: the live filter state + which facet tab is active. */
export function useDirectoryFilters() {
  const { filters, updateFilters } = useFilters<DirectoryFilterSchema>()
  return { filters, updateFilters, tab: activeFacetTab(filters.type) }
}

/** Location (Region + City) shows on People + Organizations. */
export function locationApplies(tab: DirectoryFacetTab) {
  return tab === "people" || tab === "organizations"
}
