"use client"

import { ChevronDownIcon } from "lucide-react"
import { BeltSwatch } from "~/components/common/belt-swatch"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/common/dropdown-menu"
import { Stack } from "~/components/common/stack"
import { facetKey, type FilterDimension, type FilterFacet } from "~/lib/lineage/filter-facets"
import { cx } from "~/lib/utils"
import { SOLID_PILL } from "./chrome"

// Filter dimensions render as one labeled dropdown each (Apple-clean bar,
// SESSION_0401) — order + display labels for the bar.
const DIMENSION_ORDER: FilterDimension[] = ["group", "belt", "school", "year"]
const DIMENSION_LABEL: Record<FilterDimension, string> = {
  group: "Group",
  belt: "Belt",
  school: "School",
  year: "Year",
}

/**
 * One dimension's multi-select dropdown for the filter bar. Composes the L1
 * `DropdownMenu` + `DropdownMenuCheckboxItem` primitives (checkbox items keep
 * the menu open for multi-toggle) — never a hand-rolled menu (FS-0001). The
 * trigger surfaces active state via a count badge so a closed filter still
 * reads as "on".
 */
function FilterDropdown({
  label,
  facets,
  activeFilters,
  onToggle,
  onClear,
}: {
  label: string
  facets: FilterFacet[]
  activeFilters: Set<string>
  onToggle: (key: string) => void
  onClear: () => void
}) {
  const activeCount = facets.reduce(
    (count, facet) => (activeFilters.has(facetKey(facet)) ? count + 1 : count),
    0,
  )
  const active = activeCount > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cx(
          "inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-white/70 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring max-sm:flex-1 max-sm:basis-[calc(50%-0.25rem)]",
          active ? "border border-primary/40 bg-primary/15 text-white" : SOLID_PILL,
        )}
      >
        <span className="text-[0.62rem] font-bold uppercase tracking-[0.16em]">{label}</span>
        {active && (
          <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[0.6rem] font-black text-white">
            {activeCount}
          </span>
        )}
        <ChevronDownIcon className="ml-auto size-3.5 opacity-60 sm:ml-0" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="max-h-80 min-w-52 overflow-y-auto">
        {facets.map(facet => {
          const key = facetKey(facet)
          return (
            <DropdownMenuCheckboxItem
              key={key}
              checked={activeFilters.has(key)}
              onCheckedChange={() => onToggle(key)}
            >
              <span className="flex min-w-0 items-center gap-2">
                {facet.dimension === "belt" && facet.belt && (
                  <BeltSwatch variant="belt" size="sm" {...facet.belt} />
                )}
                <span className="max-w-[12rem] truncate">{facet.label}</span>
              </span>
            </DropdownMenuCheckboxItem>
          )
        })}

        {active && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onClear}>Clear {label.toLowerCase()}</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * The explorer's filter bar — one labeled dropdown per dimension; dim
 * non-matches (not hide). Matching is AND-across / OR-within
 * (lib/lineage/filter-facets). Renders nothing when there are no facets.
 */
export function FilterBar({
  facets,
  facetsByDimension,
  activeFilters,
  onToggle,
  onClearDimension,
  onClearAll,
}: {
  facets: FilterFacet[]
  facetsByDimension: Map<FilterDimension, FilterFacet[]>
  activeFilters: Set<string>
  onToggle: (key: string) => void
  onClearDimension: (dimension: FilterDimension) => void
  onClearAll: () => void
}) {
  if (facets.length === 0) return null

  return (
    <Stack direction="row" wrap size="sm" className="mb-3 max-sm:gap-2">
      {DIMENSION_ORDER.map(dimension => {
        const dimensionFacets = facetsByDimension.get(dimension)
        if (!dimensionFacets || dimensionFacets.length === 0) return null
        return (
          <FilterDropdown
            key={dimension}
            label={DIMENSION_LABEL[dimension]}
            facets={dimensionFacets}
            activeFilters={activeFilters}
            onToggle={onToggle}
            onClear={() => onClearDimension(dimension)}
          />
        )
      })}
      {activeFilters.size > 0 && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-[0.68rem] font-semibold text-white/45 underline-offset-2 transition hover:text-white hover:underline max-sm:ml-auto"
        >
          Clear all
        </button>
      )}
    </Stack>
  )
}
