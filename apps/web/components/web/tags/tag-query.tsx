import type { SearchParams } from "nuqs"
import type { Prisma } from "~/.generated/prisma/client"
import type { PaginationProps } from "~/components/web/pagination"
import type { TagListProps } from "~/components/web/tags/tag-list"
import { TagListing, type TagListingProps } from "~/components/web/tags/tag-listing"
import { searchTags } from "~/server/web/tags/queries"
import { type TagsFilterParams, tagsSearchParamsCache } from "~/server/web/tags/schema"

type TagQueryProps = Omit<TagListingProps, "list" | "pagination"> & {
  searchParams: Promise<SearchParams>
  overrideParams?: Partial<TagsFilterParams>
  where?: Prisma.TagWhereInput
  list?: Partial<Omit<TagListProps, "tags">>
  pagination?: Partial<Omit<PaginationProps, "total" | "pageSize">>
}

const TagQuery = async ({
  searchParams,
  overrideParams,
  where,
  list,
  pagination,
  ...props
}: TagQueryProps) => {
  const parsedParams = tagsSearchParamsCache.parse(await searchParams)
  const params = { ...parsedParams, ...overrideParams }
  const { tags, total, page, perPage } = await searchTags(params, where)

  return (
    <TagListing
      list={{ tags, ...list }}
      pagination={{ total, perPage, page, ...pagination }}
      {...props}
    />
  )
}

export { TagQuery, type TagQueryProps }
