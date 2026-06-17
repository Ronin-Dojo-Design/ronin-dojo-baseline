"use client"

import { ComboboxSelector } from "~/components/common/combobox-selector"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { Stack } from "~/components/common/stack"
import { useFilters } from "~/contexts/filter-context"
import type { DirectoryFacetTab } from "~/lib/directory/facet-result"
import type { DirectoryFilterOptions } from "~/server/web/directory/filter-options"
import type { DirectoryFilterSchema } from "~/server/web/directory/schema"

type DirectoryFiltersProps = {
  options: DirectoryFilterOptions
}

/** Mirror of `normalizeDirectoryFacetTab` kept client-side to avoid importing the server facets module. */
function activeFacetTab(type: string): DirectoryFacetTab {
  return type === "organizations" || type === "trees" ? type : "people"
}

/** Shared hook: the live filter state + which facet tab is active. */
function useDirectoryFilters() {
  const { filters, updateFilters } = useFilters<DirectoryFilterSchema>()
  return { filters, updateFilters, tab: activeFacetTab(filters.type) }
}

/**
 * Shared `/directory` filter bar (SESSION_0352 discipline → SESSION_0353 +location/+org →
 * SESSION_0400 +rank).
 *
 * Each filter is its own context-driven sub-component that renders only on the facets where it
 * applies (operator decision, SESSION_0353 grill): discipline on all; org/school on People +
 * Trees; rank on People only and only once a discipline is chosen (a `Rank` only has meaning
 * within a discipline's rank system); location (Region + City) on People + Organizations.
 * Clearing is handled by the global `Filters` reset; changing Region resets City and changing
 * Discipline resets Rank.
 */
export function DirectoryFilters({ options }: DirectoryFiltersProps) {
  return (
    <Stack size="sm" direction="row" className="flex-wrap">
      <DisciplineFilter options={options} />
      <OrgFilter options={options} />
      <RankFilter options={options} />
      <RegionFilter options={options} />
      <CityFilter options={options} />
    </Stack>
  )
}

function DisciplineFilter({ options }: DirectoryFiltersProps) {
  const { filters, updateFilters } = useDirectoryFilters()
  if (options.disciplines.length === 0) return null

  return (
    <Select
      value={filters.discipline}
      onValueChange={value => updateFilters({ discipline: value as string, rank: "" })}
      items={Object.fromEntries(options.disciplines.map(d => [d.slug, d.name]))}
    >
      <SelectTrigger size="lg" className="w-auto min-w-40 max-sm:flex-1">
        <SelectValue placeholder="All disciplines" />
      </SelectTrigger>
      <SelectContent align="end">
        {options.disciplines.map(({ slug, name }) => (
          <SelectItem key={slug} value={slug}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function OrgFilter({ options }: DirectoryFiltersProps) {
  const { filters, updateFilters, tab } = useDirectoryFilters()
  const show = (tab === "people" || tab === "trees") && options.organizations.length > 0
  if (!show) return null

  return (
    <div className="w-auto min-w-44 max-sm:flex-1 sm:w-56">
      <ComboboxSelector
        options={options.organizations.map(o => ({ id: o.slug, name: o.name }))}
        value={filters.org}
        onValueChange={value => updateFilters({ org: value })}
        placeholder="All schools"
        searchPlaceholder="Search schools…"
        emptyMessage="No schools found."
        clearLabel="Clear school filter"
        size="lg"
        clearable
      />
    </div>
  )
}

function RankFilter({ options }: DirectoryFiltersProps) {
  const { filters, updateFilters, tab } = useDirectoryFilters()

  // Rank options narrow to the chosen discipline (a `Rank` only has meaning within a
  // discipline's rank system). Rank shows on People only, and only once a discipline is picked.
  const rankOptions = filters.discipline
    ? options.ranks.filter(r => r.disciplineSlug === filters.discipline)
    : []
  if (tab !== "people" || rankOptions.length === 0) return null

  return (
    <Select value={filters.rank} onValueChange={value => updateFilters({ rank: value as string })}>
      <SelectTrigger size="lg" className="w-auto min-w-40 max-sm:flex-1">
        <SelectValue placeholder="All ranks" />
      </SelectTrigger>
      <SelectContent align="end">
        {rankOptions.map(({ id, name }) => (
          <SelectItem key={id} value={id}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** Location (Region + City) shows on People + Organizations. */
function locationApplies(tab: DirectoryFacetTab) {
  return tab === "people" || tab === "organizations"
}

function RegionFilter({ options }: DirectoryFiltersProps) {
  const { filters, updateFilters, tab } = useDirectoryFilters()
  if (!locationApplies(tab) || options.regions.length === 0) return null

  return (
    <Select
      value={filters.region}
      onValueChange={value => updateFilters({ region: value as string, city: "" })}
    >
      <SelectTrigger size="lg" className="w-auto min-w-36 max-sm:flex-1">
        <SelectValue placeholder="All regions" />
      </SelectTrigger>
      <SelectContent align="end">
        {options.regions.map(region => (
          <SelectItem key={region} value={region}>
            {region}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function CityFilter({ options }: DirectoryFiltersProps) {
  const { filters, updateFilters, tab } = useDirectoryFilters()

  // City options narrow to the chosen region.
  const cityOptions = filters.region
    ? options.cities.filter(c => c.region.toLowerCase() === filters.region.toLowerCase())
    : options.cities
  if (!locationApplies(tab) || cityOptions.length === 0) return null

  return (
    <Select value={filters.city} onValueChange={value => updateFilters({ city: value as string })}>
      <SelectTrigger size="lg" className="w-auto min-w-36 max-sm:flex-1">
        <SelectValue placeholder="All cities" />
      </SelectTrigger>
      <SelectContent align="end">
        {cityOptions.map(({ region, city }) => (
          <SelectItem key={`${region}::${city}`} value={city}>
            {city}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
