"use client"

import { useFilters } from "~/contexts/filter-context"
import type { DirectoryFacetTab } from "~/lib/directory/facet-result"
import { cx } from "~/lib/utils"

const TABS: { value: DirectoryFacetTab; label: string }[] = [
  { value: "people", label: "People" },
  { value: "organizations", label: "Schools & Orgs" },
  { value: "trees", label: "Lineage Trees" },
]

/**
 * Result-type segmented control for the faceted `/directory` (SESSION_0350).
 * Writes the `type` param through the shared nuqs filter context; `activeTab`
 * comes from the server-parsed param so SSR and the URL stay authoritative.
 */
export function DirectoryFacetTabs({ activeTab }: { activeTab: DirectoryFacetTab }) {
  const { updateFilters } = useFilters()

  return (
    <div
      role="tablist"
      aria-label="Directory result type"
      className="inline-flex flex-wrap gap-1 rounded-md border border-border bg-card p-1"
    >
      {TABS.map(tab => {
        const isActive = tab.value === activeTab
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() =>
              updateFilters({ type: tab.value === "people" ? null : tab.value, page: null })
            }
            className={cx(
              "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
