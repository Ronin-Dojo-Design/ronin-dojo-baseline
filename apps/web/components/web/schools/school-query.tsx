import { getTranslations } from "next-intl/server"
import type { SearchParams } from "nuqs"
import type { Brand } from "~/.generated/prisma/client"
import type { PaginationProps } from "~/components/web/pagination"
import { SchoolList, type SchoolListProps } from "~/components/web/schools/school-list"
import { SchoolListing, type SchoolListingProps } from "~/components/web/schools/school-listing"
import { ResultsCount } from "~/components/web/ui/results-count"
import {
  type SchoolFilterParams,
  schoolFilterParamsCache,
} from "~/server/web/directory/school-schema"
import { searchOrganizations } from "~/server/web/directory/search-organizations"

type SchoolQueryProps = Omit<SchoolListingProps, "list" | "pagination"> & {
  searchParams: Promise<SearchParams>
  brand: Brand
  overrideParams?: Partial<SchoolFilterParams>
  list?: Partial<Omit<SchoolListProps, "schools">>
  pagination?: Partial<Omit<PaginationProps, "total" | "pageSize">>
}

const SchoolQuery = async ({
  searchParams,
  brand,
  overrideParams,
  list,
  pagination,
  ...props
}: SchoolQueryProps) => {
  const parsedParams = schoolFilterParamsCache.parse(await searchParams)
  const params = { ...parsedParams, ...overrideParams }
  const { schools, total, page, perPage } = await searchOrganizations(params, brand)
  const t = await getTranslations("schools")

  return (
    <>
      <ResultsCount total={total} label={t("results", { count: total })} />
      <SchoolListing pagination={{ total, perPage, page, ...pagination }} {...props}>
        <SchoolList schools={schools} {...list} />
      </SchoolListing>
    </>
  )
}

export { SchoolQuery, type SchoolQueryProps }
