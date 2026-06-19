"use client"

import { DataSelect } from "~/components/common/data-select"
import {
  type FilterOption,
  filterTriggerClassName,
  useTechniqueFilters,
} from "./use-technique-filters"

// Enum values inlined to avoid importing the Prisma client into a client component
// (the Prisma client bundles Node-only modules that can't run in the browser). The
// where-builder validates the value against the real enum server-side.
const TECHNIQUE_CATEGORIES = [
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

const categoryOptions: FilterOption[] = TECHNIQUE_CATEGORIES.map(value => ({
  value,
  label: value.replace(/_/g, " "),
}))

/** Technique category facet (static enum). */
export function CategoryFilter() {
  const { filters, updateFilters } = useTechniqueFilters()

  return (
    <DataSelect
      value={filters.category}
      onValueChange={value => updateFilters({ category: value as string })}
      options={categoryOptions}
      placeholder="All categories"
      size="lg"
      triggerClassName={filterTriggerClassName}
      align="end"
    />
  )
}
