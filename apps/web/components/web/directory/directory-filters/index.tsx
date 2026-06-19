"use client"

import { Stack } from "~/components/common/stack"
import type { DirectoryFilterOptions } from "~/server/web/directory/filter-options"
import { CityFilter } from "./city-filter"
import { DisciplineFilter } from "./discipline-filter"
import { KindFilter } from "./kind-filter"
import { OrgFilter } from "./org-filter"
import { RankFilter } from "./rank-filter"
import { RegionFilter } from "./region-filter"

type DirectoryFiltersProps = {
  options: DirectoryFilterOptions
}

/**
 * Shared `/directory` filter bar (SESSION_0352 discipline → SESSION_0353 +location/+org →
 * SESSION_0400 +rank → component-launch-sweep: decomposed into a colocated folder module).
 *
 * This `index.tsx` is the thin orchestrator and the module's ONLY public export — it just composes
 * the filters and is the import boundary (`~/components/web/directory/directory-filters`). Each
 * filter is a private single-responsibility file; the shared facet/state logic lives in
 * `use-directory-filters`.
 *
 * Each filter is its own context-driven sub-component that renders only on the facets where it
 * applies (operator decision, SESSION_0353 grill): discipline on all; org/school on People +
 * Trees; rank on People only and only once a discipline is chosen (a `Rank` only has meaning
 * within a discipline's rank system); kind (tree scopeType) on Trees only; location (Region +
 * City) on People + Organizations. Clearing is handled by the global `Filters` reset; changing
 * Region resets City and changing Discipline resets Rank.
 */
export function DirectoryFilters({ options }: DirectoryFiltersProps) {
  return (
    <Stack size="sm" direction="row" className="flex-wrap">
      <DisciplineFilter options={options} />
      <OrgFilter options={options} />
      <RankFilter options={options} />
      <KindFilter />
      <RegionFilter options={options} />
      <CityFilter options={options} />
    </Stack>
  )
}
