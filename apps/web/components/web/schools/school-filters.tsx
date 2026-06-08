"use client"

import { useAction } from "next-safe-action/hooks"
import { useEffect } from "react"
import { DataSelect } from "~/components/common/data-select"
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

export const SchoolFilters = () => {
  const { filters, updateFilters } = useFilters<SchoolFilterSchema>()
  const { result, execute } = useAction(findSchoolFilterOptions)

  useEffect(execute, [execute])

  const disciplineOptions = (result.data?.disciplines ?? []).map(({ slug, name }) => ({
    value: slug,
    label: name,
  }))

  return (
    <Stack size="sm" direction="row" className="flex-wrap">
      <DataSelect
        value={filters.type}
        onValueChange={value => updateFilters({ type: value as string })}
        options={orgTypeOptions}
        placeholder="All types"
        size="lg"
        triggerClassName="w-auto min-w-40 max-sm:flex-1"
        align="end"
      />

      <DataSelect
        value={filters.discipline}
        onValueChange={value => updateFilters({ discipline: value as string })}
        options={disciplineOptions}
        placeholder="All disciplines"
        size="lg"
        triggerClassName="w-auto min-w-40 max-sm:flex-1"
        align="end"
      />
    </Stack>
  )
}
