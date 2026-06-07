"use client"

import { useAction } from "next-safe-action/hooks"
import { useEffect } from "react"
import { DataSelect } from "~/components/common/data-select"
import { useFilters } from "~/contexts/filter-context"
import { findTechniqueFilterOptions } from "~/server/web/techniques/actions"
import type { TechniqueFilterSchema } from "~/server/web/techniques/schema"

// Enum values inlined to avoid importing Prisma client in a client component
// (Prisma client bundles Node.js-only modules that can't run in the browser)
const TechniqueCategory = [
  "STRIKE",
  "KICK",
  "THROW",
  "SUBMISSION",
  "SWEEP",
  "ESCAPE",
  "BLOCK",
  "FORM",
  "DRILL",
  "CONDITIONING",
  "TRANSITION",
  "TAKEDOWN",
] as const

const TechniquePosition = [
  "STANDING",
  "GUARD",
  "HALF_GUARD",
  "MOUNT",
  "SIDE_CONTROL",
  "BACK",
  "TURTLE",
  "CLINCH",
  "OPEN",
] as const

const categoryOptions = TechniqueCategory.map(v => ({ value: v, label: v.replace(/_/g, " ") }))
const positionOptions = TechniquePosition.map(v => ({ value: v, label: v.replace(/_/g, " ") }))

const filterTriggerClassName = "w-auto min-w-40 max-sm:flex-1"

export const TechniqueFilters = () => {
  const { filters, updateFilters } = useFilters<TechniqueFilterSchema>()
  const { result, execute } = useAction(findTechniqueFilterOptions)

  useEffect(execute, [execute])

  const disciplineOptions = (result.data?.disciplines ?? []).map(({ slug, name }) => ({
    value: slug,
    label: name,
  }))

  return (
    <>
      <DataSelect
        value={filters.category}
        onValueChange={value => updateFilters({ category: value as string })}
        options={categoryOptions}
        placeholder="All categories"
        size="lg"
        triggerClassName={filterTriggerClassName}
        align="end"
      />

      <DataSelect
        value={filters.position}
        onValueChange={value => updateFilters({ position: value as string })}
        options={positionOptions}
        placeholder="All positions"
        size="lg"
        triggerClassName={filterTriggerClassName}
        align="end"
      />

      {disciplineOptions.length > 0 && (
        <DataSelect
          value={filters.discipline}
          onValueChange={value => updateFilters({ discipline: value as string })}
          options={disciplineOptions}
          placeholder="All disciplines"
          size="lg"
          triggerClassName={filterTriggerClassName}
          align="end"
        />
      )}
    </>
  )
}
