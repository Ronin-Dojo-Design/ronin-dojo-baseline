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

/** Region (location) — People + Organizations; changing it resets the city filter. */
export function RegionFilter({ options }: DirectoryFilterControlProps) {
  const { filters, updateFilters, tab } = useDirectoryFilters()
  if (!locationApplies(tab) || options.regions.length === 0) {
    return null
  }

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
