"use client"

import { DataSelect } from "~/components/common/data-select"
import {
  type FilterOption,
  filterTriggerClassName,
  useTechniqueFilters,
} from "./use-technique-filters"

// Enum values inlined (see category-filter for why the Prisma client can't be imported
// client-side); the where-builder validates the value against the real enum server-side.
const TECHNIQUE_POSITIONS = [
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

const positionOptions: FilterOption[] = TECHNIQUE_POSITIONS.map(value => ({
  value,
  label: value.replace(/_/g, " "),
}))

/** Technique position facet (static enum). */
export function PositionFilter() {
  const { filters, updateFilters } = useTechniqueFilters()

  return (
    <DataSelect
      value={filters.position}
      onValueChange={value => updateFilters({ position: value as string })}
      options={positionOptions}
      placeholder="All positions"
      size="lg"
      triggerClassName={filterTriggerClassName}
      align="end"
    />
  )
}
