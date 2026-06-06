"use client"

import type { PropsWithChildren } from "react"
import { DirectoryFilters } from "~/components/web/directory/directory-filters"
import { Filters } from "~/components/web/filters/filters"
import { Sort } from "~/components/web/filters/sort"
import { FiltersProvider, type FiltersProviderProps } from "~/contexts/filter-context"
import type { DirectoryFilterOptions } from "~/server/web/directory/filter-options"
import { directoryFilterParams } from "~/server/web/directory/schema"

type DirectoryListingProps = PropsWithChildren & {
  filterOptions?: DirectoryFilterOptions
  options?: Omit<FiltersProviderProps, "schema">
  sortOptions?: { value: string; label: string }[]
}

const DirectoryListing = ({
  children,
  filterOptions,
  options,
  sortOptions,
}: DirectoryListingProps) => {
  return (
    <FiltersProvider schema={directoryFilterParams} enableFilters {...options}>
      <div className="space-y-5" id="directory">
        <Filters placeholder="Search directory...">
          {filterOptions && <DirectoryFilters options={filterOptions} />}
          {sortOptions && <Sort options={sortOptions} />}
        </Filters>
        {children}
      </div>
    </FiltersProvider>
  )
}

export { DirectoryListing, type DirectoryListingProps }
