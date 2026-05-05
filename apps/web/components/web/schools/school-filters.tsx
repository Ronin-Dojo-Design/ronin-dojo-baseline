"use client"

import { useAction } from "next-safe-action/hooks"
import { type ComponentProps, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { Stack } from "~/components/common/stack"
import { useFilters } from "~/contexts/filter-context"
import { findSchoolFilterOptions } from "~/server/web/directory/filter-actions"
import type { SchoolFilterSchema } from "~/server/web/directory/school-schema"

const orgTypeOptions = [
  { value: "DOJO", label: "Dojo" },
  { value: "GYM", label: "Gym" },
  { value: "ACADEMY", label: "Academy" },
  { value: "CLUB", label: "Club" },
  { value: "ASSOCIATION", label: "Association" },
]

export const SchoolFilters = ({ ...props }: ComponentProps<typeof Select>) => {
  const { filters, updateFilters } = useFilters<SchoolFilterSchema>()
  const { result, execute } = useAction(findSchoolFilterOptions)

  useEffect(execute, [execute])

  return (
    <Stack size="sm" direction="row" className="flex-wrap">
      <Select
        value={filters.type}
        onValueChange={value => updateFilters({ type: value })}
        {...props}
      >
        <SelectTrigger size="lg" className="w-auto min-w-40 max-sm:flex-1">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent align="end">
          {orgTypeOptions.map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.discipline}
        onValueChange={value => updateFilters({ discipline: value })}
        {...props}
      >
        <SelectTrigger size="lg" className="w-auto min-w-40 max-sm:flex-1">
          <SelectValue placeholder="All disciplines" />
        </SelectTrigger>
        <SelectContent align="end">
          {result.data?.disciplines?.map(({ slug, name }) => (
            <SelectItem key={slug} value={slug}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Stack>
  )
}
