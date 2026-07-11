"use client"

import { useAction } from "next-safe-action/hooks"
import { useEffect } from "react"
import { useFilters } from "~/contexts/filter-context"
import { findTechniqueFilterOptions } from "~/server/web/techniques/actions"
import type { TechniqueFilterSchema } from "~/server/web/techniques/schema"

/** Shared trigger width for every technique facet `DataSelect` (one source of truth). */
export const filterTriggerClassName = "w-auto min-w-40 max-sm:flex-1"

/** Shared option shape the static-enum filters map their values into. */
export type FilterOption = { value: string; label: string }

/** A belt option (a `Rank`) — `id` matches the technique's `beltLevelMinId` FK; `colorHex` tints the row swatch. */
export type BeltFilterOption = {
  id: string
  name: string
  shortName: string | null
  colorHex: string | null
}

/** The live filter state for the technique facet bar (component-launch-sweep step 1). */
export function useTechniqueFilters() {
  const { filters, updateFilters } = useFilters<TechniqueFilterSchema>()
  return { filters, updateFilters }
}

/**
 * Discipline facet options, loaded from the server action on mount. Kept in a hook so
 * the discipline filter stays presentational (logic OUT of JSX, recipe step 1). The
 * disciplines are brand-scoped server-side; the filter hides itself when none exist.
 */
export function useTechniqueDisciplineOptions(): FilterOption[] {
  const { result, execute } = useAction(findTechniqueFilterOptions)

  useEffect(execute, [execute])

  return (result.data?.disciplines ?? []).map(({ slug, name }) => ({ value: slug, label: name }))
}

/**
 * Belt facet options (Stream D1), loaded from the same server action on mount. Mirrors
 * {@link useTechniqueDisciplineOptions}; the belt filter hides itself when the brand's
 * technique disciplines carry no ranks. (Both hooks call the one cheap options action —
 * accepted duplicate fetch, matching the established per-facet idiom.)
 */
export function useTechniqueBeltOptions(): BeltFilterOption[] {
  const { result, execute } = useAction(findTechniqueFilterOptions)

  useEffect(execute, [execute])

  return result.data?.belts ?? []
}
