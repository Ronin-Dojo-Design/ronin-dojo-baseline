"use client"

import { useTranslations } from "next-intl"
import { Input } from "~/components/common/input"
import { Pagination, type PaginationProps } from "~/components/web/pagination"
import { TagList, type TagListProps, TagListSkeleton } from "~/components/web/tags/tag-list"
import { TagSearch, type TagSearchProps } from "~/components/web/tags/tag-search"
import { FiltersProvider, type FiltersProviderProps } from "~/contexts/filter-context"
import { tagsSearchParams } from "~/server/web/tags/schema"

type TagListingProps = {
  list: TagListProps
  pagination: PaginationProps
  search?: TagSearchProps
  options?: Omit<FiltersProviderProps, "schema">
}

const TagListing = ({ list, pagination, options, search }: TagListingProps) => {
  return (
    <FiltersProvider schema={tagsSearchParams} {...options}>
      <div className="space-y-10" id="tags">
        <TagSearch {...search} />
        <TagList {...list} />
      </div>

      <Pagination {...pagination} />
    </FiltersProvider>
  )
}

const TagListingSkeleton = () => {
  const t = useTranslations("common")

  return (
    <div className="space-y-10">
      <Input size="lg" placeholder={t("loading")} disabled />
      <TagListSkeleton />
    </div>
  )
}

export { TagListing, TagListingSkeleton, type TagListingProps }
