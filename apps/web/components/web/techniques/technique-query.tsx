import { getTranslations } from "next-intl/server"
import type { SearchParams } from "nuqs"
import type { Brand, Prisma } from "~/.generated/prisma/client"
import type { PaginationProps } from "~/components/web/pagination"
import { TechniqueList, type TechniqueListProps } from "~/components/web/techniques/technique-list"
import {
  TechniqueListing,
  type TechniqueListingProps,
} from "~/components/web/techniques/technique-listing"
import { ResultsCount } from "~/components/web/ui/results-count"
import { searchTechniques } from "~/server/web/techniques/queries"
import {
  type TechniqueFilterParams,
  techniqueFilterParamsCache,
} from "~/server/web/techniques/schema"

type TechniqueQueryProps = Omit<TechniqueListingProps, "list" | "pagination"> & {
  searchParams: Promise<SearchParams>
  brand: Brand
  overrideParams?: Partial<TechniqueFilterParams>
  where?: Prisma.TechniqueWhereInput
  list?: Partial<Omit<TechniqueListProps, "techniques">>
  pagination?: Partial<Omit<PaginationProps, "total" | "pageSize">>
}

const TechniqueQuery = async ({
  searchParams,
  brand,
  overrideParams,
  where,
  list,
  pagination,
  ...props
}: TechniqueQueryProps) => {
  const parsedParams = techniqueFilterParamsCache.parse(await searchParams)
  const params = { ...parsedParams, ...overrideParams }
  const { techniques, total, page, perPage } = await searchTechniques(params, brand, where)
  const t = await getTranslations("techniques")

  return (
    <>
      <ResultsCount total={total} label={t("results", { count: total })} />
      <TechniqueListing pagination={{ total, perPage, page, ...pagination }} {...props}>
        <TechniqueList techniques={techniques} {...list} />
      </TechniqueListing>
    </>
  )
}

export { TechniqueQuery, type TechniqueQueryProps }
