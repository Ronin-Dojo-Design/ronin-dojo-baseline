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

/**
 * Shared `/directory` filter bar (SESSION_0352 discipline → SESSION_0353 +location/+org).
 *
 * Filters are shown only on the facets where they apply (operator decision,
 * SESSION_0353 grill): discipline on all; org/school on People + Trees; location
 * (Region + City) on People + Organizations. Clearing is handled by the global
 * `Filters` reset; changing Region resets City.
 */
export function DirectoryFilters({ options }: DirectoryFiltersProps) {
  const { filters, updateFilters } = useFilters<DirectoryFilterSchema>()
  const tab = activeFacetTab(filters.type)

  const showDiscipline = options.disciplines.length > 0
  const showOrg = (tab === "people" || tab === "trees") && options.organizations.length > 0
  const showLocation =
    (tab === "people" || tab === "organizations") &&
    (options.regions.length > 0 || options.cities.length > 0)

  // City options narrow to the chosen region.
  const cityOptions = filters.region
    ? options.cities.filter(c => c.region.toLowerCase() === filters.region.toLowerCase())
    : options.cities

  if (!showDiscipline && !showOrg && !showLocation) {
    return null
  }

  return (
    <Stack size="sm" direction="row" className="flex-wrap">
      {showDiscipline && (
        <Select
          value={filters.discipline}
          onValueChange={value => updateFilters({ discipline: value as string })}
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
      )}

      {showOrg && (
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
      )}

      {showLocation && (
        <>
          {options.regions.length > 0 && (
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
          )}

          {cityOptions.length > 0 && (
            <Select
              value={filters.city}
              onValueChange={value => updateFilters({ city: value as string })}
            >
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
          )}
        </>
      )}
    </Stack>
  )
}
