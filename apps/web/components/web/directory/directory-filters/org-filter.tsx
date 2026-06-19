"use client"

import { ComboboxSelector } from "~/components/common/combobox-selector"
import { type DirectoryFilterControlProps, useDirectoryFilters } from "./use-directory-filters"

/** School / org combobox — shows on People + Trees. */
export function OrgFilter({ options }: DirectoryFilterControlProps) {
  const { filters, updateFilters, tab } = useDirectoryFilters()
  const show = (tab === "people" || tab === "trees") && options.organizations.length > 0
  if (!show) {
    return null
  }

  return (
    <div className="w-auto min-w-44 max-sm:flex-1 sm:w-56">
      <ComboboxSelector
        options={options.organizations.map(o => ({ id: o.slug, name: o.name }))}
        value={filters.org}
        onValueChange={value => updateFilters({ org: value })}
        placeholder="All schools"
        searchPlaceholder="Search schools…"
        emptyMessage="No schools found."
        clearLabel="Clear school filter"
        size="lg"
        clearable
      />
    </div>
  )
}
