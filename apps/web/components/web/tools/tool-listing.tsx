"use client"

import { useTranslations } from "next-intl"
import type { PropsWithChildren } from "react"
import { Input } from "~/components/common/input"
import { Pagination, type PaginationProps } from "~/components/web/pagination"
import { ToolListSkeleton } from "~/components/web/tools/tool-list"
import { ToolSearch, type ToolSearchProps } from "~/components/web/tools/tool-search"
import { FiltersProvider, type FiltersProviderProps } from "~/contexts/filter-context"
import { toolFilterParams } from "~/server/web/tools/schema"

type ToolListingProps = PropsWithChildren & {
  pagination: PaginationProps
  search?: ToolSearchProps
  options?: Omit<FiltersProviderProps, "schema">
}

const ToolListing = ({ children, pagination, options, search }: ToolListingProps) => {
  return (
    <FiltersProvider schema={toolFilterParams} {...options}>
      <div className="space-y-5" id="tools">
        <ToolSearch {...search} />
        {children}
      </div>

      <Pagination {...pagination} />
    </FiltersProvider>
  )
}

const ToolListingSkeleton = () => {
  const t = useTranslations("common")

  return (
    <div className="space-y-5">
      <Input size="lg" placeholder={t("loading")} disabled />
      <ToolListSkeleton />
    </div>
  )
}

export { ToolListing, ToolListingSkeleton, type ToolListingProps }
