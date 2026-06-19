"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { type DirectoryFilterControlProps, useDirectoryFilters } from "./use-directory-filters"

/** Rank — People only, and only once a discipline scopes the available ranks. */
export function RankFilter({ options }: DirectoryFilterControlProps) {
  const { filters, updateFilters, tab } = useDirectoryFilters()

  // Rank options narrow to the chosen discipline (a `Rank` only has meaning within a
  // discipline's rank system). Rank shows on People only, and only once a discipline is picked.
  const rankOptions = filters.discipline
    ? options.ranks.filter(r => r.disciplineSlug === filters.discipline)
    : []
  if (tab !== "people" || rankOptions.length === 0) {
    return null
  }

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
