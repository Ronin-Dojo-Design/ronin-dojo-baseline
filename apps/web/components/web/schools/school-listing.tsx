"use client"

import { useTranslations } from "next-intl"
import type { PropsWithChildren } from "react"
import { Input } from "~/components/common/input"
import { Pagination, type PaginationProps } from "~/components/web/pagination"
import { SchoolListSkeleton } from "~/components/web/schools/school-list"
import { SchoolSearch, type SchoolSearchProps } from "~/components/web/schools/school-search"
import { FiltersProvider, type FiltersProviderProps } from "~/contexts/filter-context"
import { schoolFilterParams } from "~/server/web/directory/school-schema"

type SchoolListingProps = PropsWithChildren & {
  pagination: PaginationProps
  search?: SchoolSearchProps
  options?: Omit<FiltersProviderProps, "schema">
}

const SchoolListing = ({ children, pagination, options, search }: SchoolListingProps) => {
  return (
    <FiltersProvider schema={schoolFilterParams} {...options}>
      <div className="space-y-5" id="schools">
        <SchoolSearch {...search} />
        {children}
      </div>

      <Pagination {...pagination} />
    </FiltersProvider>
  )
}

const SchoolListingSkeleton = () => {
  const t = useTranslations("common")

  return (
    <div className="space-y-5">
      <Input size="lg" placeholder={t("loading")} disabled />
      <SchoolListSkeleton />
    </div>
  )
}

export { SchoolListing, SchoolListingSkeleton, type SchoolListingProps }
