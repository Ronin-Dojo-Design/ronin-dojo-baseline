"use client"

import { useTranslations } from "next-intl"
import type { PropsWithChildren } from "react"
import { Input } from "~/components/common/input"
import { Pagination, type PaginationProps } from "~/components/web/pagination"
import { TechniqueListSkeleton } from "~/components/web/techniques/technique-list"
import {
  TechniqueSearch,
  type TechniqueSearchProps,
} from "~/components/web/techniques/technique-search"
import { FiltersProvider, type FiltersProviderProps } from "~/contexts/filter-context"
import { techniqueFilterParams } from "~/server/web/techniques/schema"

type TechniqueListingProps = PropsWithChildren & {
  pagination: PaginationProps
  search?: TechniqueSearchProps
  options?: Omit<FiltersProviderProps, "schema">
}

const TechniqueListing = ({ children, pagination, options, search }: TechniqueListingProps) => {
  return (
    <FiltersProvider schema={techniqueFilterParams} {...options}>
      <div className="space-y-5" id="techniques">
        <TechniqueSearch {...search} />
        {children}
      </div>

      <Pagination {...pagination} />
    </FiltersProvider>
  )
}

const TechniqueListingSkeleton = () => {
  const t = useTranslations("common")

  return (
    <div className="space-y-5">
      <Input size="lg" placeholder={t("loading")} disabled />
      <TechniqueListSkeleton />
    </div>
  )
}

export { TechniqueListing, type TechniqueListingProps, TechniqueListingSkeleton }
