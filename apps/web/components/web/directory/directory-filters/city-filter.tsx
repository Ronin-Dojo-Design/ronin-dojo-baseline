"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import {
  type DirectoryFilterControlProps,
  locationApplies,
  useDirectoryFilters,
} from "./use-directory-filters"

/** City (location) — People + Organizations; options narrow to the chosen region. */
export function CityFilter({ options }: DirectoryFilterControlProps) {
  const { filters, updateFilters, tab } = useDirectoryFilters()

  // City options narrow to the chosen region.
  const cityOptions = filters.region
    ? options.cities.filter(c => c.region.toLowerCase() === filters.region.toLowerCase())
    : options.cities
  if (!locationApplies(tab) || cityOptions.length === 0) {
    return null
  }

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
