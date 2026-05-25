"use client"

import type { PropsWithChildren } from "react"
import { LineageSearch, type LineageSearchProps } from "~/components/web/lineage/lineage-search"
import { Pagination, type PaginationProps } from "~/components/web/pagination"
import { FiltersProvider, type FiltersProviderProps } from "~/contexts/filter-context"
import { lineageFilterParams } from "~/server/web/lineage/schema"

type LineageListingProps = PropsWithChildren & {
  pagination: PaginationProps
  search?: LineageSearchProps
  options?: Omit<FiltersProviderProps, "schema">
}

const LineageListing = ({ children, pagination, options, search }: LineageListingProps) => {
  return (
    <FiltersProvider schema={lineageFilterParams} {...options}>
      <div className="space-y-5" id="lineage">
        <LineageSearch {...search} />
        {children}
      </div>

      <Pagination {...pagination} />
    </FiltersProvider>
  )
}

export { LineageListing, type LineageListingProps }
