"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { type DirectoryFilterControlProps, useDirectoryFilters } from "./use-directory-filters"

/** Discipline narrows every facet; choosing one resets the (discipline-scoped) rank filter. */
export function DisciplineFilter({ options }: DirectoryFilterControlProps) {
  const { filters, updateFilters } = useDirectoryFilters()
  if (options.disciplines.length === 0) {
    return null
  }

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
