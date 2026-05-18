"use client"

import { useTranslations } from "next-intl"
import type { ComponentProps } from "react"
import type { Stack } from "~/components/common/stack"
import { Filters } from "~/components/web/filters/filters"
import { Sort } from "~/components/web/filters/sort"
import { TechniqueFilters } from "~/components/web/techniques/technique-filters"
import { useFilters } from "~/contexts/filter-context"
import type { TechniqueFilterSchema } from "~/server/web/techniques/schema"

export type TechniqueSearchProps = ComponentProps<typeof Stack> & {
  placeholder?: string
}

export const TechniqueSearch = ({ placeholder, ...props }: TechniqueSearchProps) => {
  const tSort = useTranslations("techniques.sort")
  const tFilters = useTranslations("techniques.filters")
  const { enableSort, enableFilters } = useFilters<TechniqueFilterSchema>()

  const sortOptions = [
    { value: "name.asc", label: tSort("name_asc") },
    { value: "name.desc", label: tSort("name_desc") },
    { value: "sortOrder.asc", label: tSort("curriculum_order") },
  ]

  return (
    <Filters placeholder={placeholder || tFilters("search_placeholder")} {...props}>
      {enableFilters && <TechniqueFilters />}
      {enableSort && <Sort options={sortOptions} />}
    </Filters>
  )
}
