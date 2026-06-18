"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { useDirectoryFilters } from "./use-directory-filters"

/**
 * Tree `kind` = the `LineageTree.scopeType` enum, with public-facing labels. Static (no DB options
 * query needed, unlike rank), so the list lives client-side; the where-builder validates the value
 * against the real enum server-side (`tree-where.ts`).
 */
const TREE_KIND_OPTIONS = [
  { value: "BRAND", label: "Brand" },
  { value: "ORGANIZATION", label: "Organization" },
  { value: "DISCIPLINE", label: "Discipline" },
  { value: "STYLE", label: "Style" },
  { value: "PERSON", label: "Person" },
  { value: "CUSTOM", label: "Custom" },
] as const

/** Tree kind (scopeType) — shows on the Trees facet only. */
export function KindFilter() {
  const { filters, updateFilters, tab } = useDirectoryFilters()
  if (tab !== "trees") {
    return null
  }

  return (
    <Select value={filters.kind} onValueChange={value => updateFilters({ kind: value as string })}>
      <SelectTrigger size="lg" className="w-auto min-w-40 max-sm:flex-1">
        <SelectValue placeholder="All kinds" />
      </SelectTrigger>
      <SelectContent align="end">
        {TREE_KIND_OPTIONS.map(({ value, label }) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
