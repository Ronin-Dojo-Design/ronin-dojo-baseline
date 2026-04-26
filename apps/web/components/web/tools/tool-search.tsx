"use client"

import { useTranslations } from "next-intl"
import type { ComponentProps } from "react"
import type { Stack } from "~/components/common/stack"
import { Filters } from "~/components/web/filters/filters"
import { Sort } from "~/components/web/filters/sort"
import { ToolFilters } from "~/components/web/tools/tool-filters"
import { useFilters } from "~/contexts/filter-context"
import type { ToolFilterSchema } from "~/server/web/tools/schema"

export type ToolSearchProps = ComponentProps<typeof Stack> & {
  placeholder?: string
}

export const ToolSearch = ({ placeholder, ...props }: ToolSearchProps) => {
  const t = useTranslations("tools.filters")
  const { enableSort, enableFilters } = useFilters<ToolFilterSchema>()

  const sortOptions = [
    { value: "publishedAt.desc", label: t("sort_latest") },
    { value: "name.asc", label: t("sort_name_asc") },
    { value: "name.desc", label: t("sort_name_desc") },
  ]

  return (
    <Filters placeholder={placeholder || t("search_placeholder")} {...props}>
      {enableFilters && <ToolFilters />}
      {enableSort && <Sort options={sortOptions} />}
    </Filters>
  )
}
