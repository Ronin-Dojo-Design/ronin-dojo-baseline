import type { SearchParams } from "nuqs"
import type { Brand } from "~/.generated/prisma/client"
import { LineageList, type LineageListProps } from "~/components/web/lineage/lineage-list"
import { LineageListing, type LineageListingProps } from "~/components/web/lineage/lineage-listing"
import type { PaginationProps } from "~/components/web/pagination"
import { StructuredData } from "~/components/web/structured-data"
import { ResultsCount } from "~/components/web/ui/results-count"
import {
  createGraph,
  generateCollectionPageWithGenericItems,
  generateSchemaReference,
} from "~/lib/structured-data"
import { searchPublishedLineageTrees } from "~/server/web/lineage/queries"
import { type LineageFilterParams, lineageFilterParamsCache } from "~/server/web/lineage/schema"

type LineageQueryProps = Omit<LineageListingProps, "pagination"> & {
  searchParams: Promise<SearchParams>
  brand: Brand
  pageUrl: string
  pageTitle: string
  pageDescription: string
  overrideParams?: Partial<LineageFilterParams>
  list?: Partial<Omit<LineageListProps, "trees">>
  pagination?: Partial<Omit<PaginationProps, "total" | "perPage" | "page">>
}

const LineageQuery = async ({
  searchParams,
  brand,
  pageUrl,
  pageTitle,
  pageDescription,
  overrideParams,
  list,
  pagination,
  ...props
}: LineageQueryProps) => {
  const parsedParams = lineageFilterParamsCache.parse(await searchParams)
  const params = { ...parsedParams, ...overrideParams }
  const { trees, total, page, perPage } = await searchPublishedLineageTrees({
    brand,
    search: params,
  })

  const itemListItems = trees.map(tree => ({
    name: tree.name,
    url: `/lineage/${tree.slug}`,
    description: tree.description,
    id: generateSchemaReference("CreativeWork", `/lineage/${tree.slug}`, tree.name, "lineage-tree")[
      "@id"
    ],
    provider: tree.organization
      ? generateSchemaReference(
          "Organization",
          `/organizations/${tree.organization.slug}`,
          tree.organization.name,
        )
      : undefined,
    about: tree.discipline
      ? generateSchemaReference(
          "Thing",
          `/disciplines/${tree.discipline.slug}`,
          tree.discipline.name,
        )
      : undefined,
  }))

  return (
    <>
      <ResultsCount
        total={total}
        label={`${total} ${total === 1 ? "lineage tree" : "lineage trees"}`}
      />
      <LineageListing pagination={{ total, perPage, page, ...pagination }} {...props}>
        <LineageList trees={trees} {...list} />
      </LineageListing>
      <StructuredData
        data={createGraph([
          generateCollectionPageWithGenericItems(
            pageUrl,
            pageTitle,
            pageDescription,
            itemListItems,
            "CreativeWork",
          ),
        ])}
      />
    </>
  )
}

export { LineageQuery, type LineageQueryProps }
