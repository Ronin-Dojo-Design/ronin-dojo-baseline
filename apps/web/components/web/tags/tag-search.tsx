"use client"

import { useTranslations } from "next-intl"
import type { ComponentProps } from "react"
import type { Stack } from "~/components/common/stack"
import { Filters } from "~/components/web/filters/filters"
import { Sort } from "~/components/web/filters/sort"
import { TagFilters } from "~/components/web/tags/tag-filters"
import { useFilters } from "~/contexts/filter-context"
import type { TagsFilterSchema } from "~/server/web/tags/schema"

export type TagSearchProps = ComponentProps<typeof Stack> & {
  placeholder?: string
}

export const TagSearch = ({ placeholder, ...props }: TagSearchProps) => {
  const { enableSort, enableFilters } = useFilters<TagsFilterSchema>()
  const t = useTranslations("tags.filters")

  const sortOptions = [
    { value: "name.asc", label: t("sort_name_asc") },
    { value: "name.desc", label: t("sort_name_desc") },
  ]

  return (
    <Filters placeholder={placeholder || t("search_placeholder")} {...props}>
      {enableSort && <Sort options={sortOptions} />}
      {enableFilters && <TagFilters />}
    </Filters>
  )
}
