"use client"

import { useTranslations } from "next-intl"
import type { ComponentProps } from "react"
import type { Stack } from "~/components/common/stack"
import { Filters } from "~/components/web/filters/filters"
import { Sort } from "~/components/web/filters/sort"
import { SchoolFilters } from "~/components/web/schools/school-filters"
import { useFilters } from "~/contexts/filter-context"
import type { SchoolFilterSchema } from "~/server/web/directory/school-schema"

export type SchoolSearchProps = ComponentProps<typeof Stack> & {
  placeholder?: string
}

export const SchoolSearch = ({ placeholder, ...props }: SchoolSearchProps) => {
  const tSort = useTranslations("schools.sort")
  const tFilters = useTranslations("schools.filters")
  const { enableSort, enableFilters } = useFilters<SchoolFilterSchema>()

  const sortOptions = [
    { value: "name.asc", label: tSort("name_asc") },
    { value: "name.desc", label: tSort("name_desc") },
  ]

  return (
    <Filters placeholder={placeholder || tFilters("search_placeholder")} {...props}>
      {enableFilters && <SchoolFilters />}
      {enableSort && <Sort options={sortOptions} />}
    </Filters>
  )
}
