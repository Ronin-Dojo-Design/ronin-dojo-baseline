"use client"

import { DataSelect, type DataSelectOption } from "~/components/common/data-select"
import { BeltSwatch } from "~/components/web/techniques/technique-belt-badge"
import {
  filterTriggerClassName,
  useTechniqueBeltOptions,
  useTechniqueFilters,
} from "./use-technique-filters"

/**
 * Belt facet (Stream D1) — loads the belt options for the brand's technique disciplines
 * and filters by EXACT match on the tagged belt (`beltLevelMinId`, the operator's KISS
 * scalar-belt model). Hides itself when no belts exist. Each dropdown row carries a
 * `Rank.colorHex` swatch; the collapsed trigger stays the plain belt name (DataSelect).
 */
export function BeltFilter() {
  const { filters, updateFilters } = useTechniqueFilters()
  const belts = useTechniqueBeltOptions()

  if (belts.length === 0) {
    return null
  }

  const beltOptions: DataSelectOption[] = belts.map(belt => ({
    value: belt.id,
    label: belt.name,
    content: (
      <span className="flex items-center gap-2">
        <BeltSwatch colorHex={belt.colorHex} />
        {belt.name}
      </span>
    ),
  }))

  return (
    <DataSelect
      value={filters.belt}
      onValueChange={value => updateFilters({ belt: value as string })}
      options={beltOptions}
      placeholder="All belts"
      size="lg"
      triggerClassName={filterTriggerClassName}
      align="end"
    />
  )
}
