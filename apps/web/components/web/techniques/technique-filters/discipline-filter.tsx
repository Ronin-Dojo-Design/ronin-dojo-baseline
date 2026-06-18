"use client"

import { DataSelect } from "~/components/common/data-select"
import {
  filterTriggerClassName,
  useTechniqueDisciplineOptions,
  useTechniqueFilters,
} from "./use-technique-filters"

/** Discipline facet — loads brand-scoped options from the server; hides when none exist. */
export function DisciplineFilter() {
  const { filters, updateFilters } = useTechniqueFilters()
  const disciplineOptions = useTechniqueDisciplineOptions()

  if (disciplineOptions.length === 0) {
    return null
  }

  return (
    <DataSelect
      value={filters.discipline}
      onValueChange={value => updateFilters({ discipline: value as string })}
      options={disciplineOptions}
      placeholder="All disciplines"
      size="lg"
      triggerClassName={filterTriggerClassName}
      align="end"
    />
  )
}
