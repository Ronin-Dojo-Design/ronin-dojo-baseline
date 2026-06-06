"use client"

import type { ComponentProps } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { Stack } from "~/components/common/stack"
import { useFilters } from "~/contexts/filter-context"
import type { DirectoryFilterOptions } from "~/server/web/directory/filter-options"
import type { DirectoryFilterSchema } from "~/server/web/directory/schema"

type DirectoryFiltersProps = ComponentProps<typeof Select> & {
  options: DirectoryFilterOptions
}

export function DirectoryFilters({ options, ...props }: DirectoryFiltersProps) {
  const { filters, updateFilters } = useFilters<DirectoryFilterSchema>()

  if (options.disciplines.length === 0) {
    return null
  }

  return (
    <Stack size="sm" direction="row" className="flex-wrap">
      <Select
        value={filters.discipline}
        onValueChange={value => updateFilters({ discipline: value as string })}
        {...props}
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
    </Stack>
  )
}
