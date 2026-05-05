"use client"

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
  const { enableSort, enableFilters } = useFilters<SchoolFilterSchema>()

  const sortOptions = [
    { value: "name.asc", label: "Name A–Z" },
    { value: "name.desc", label: "Name Z–A" },
  ]

  return (
    <Filters placeholder={placeholder || "Search schools…"} {...props}>
      {enableFilters && <SchoolFilters />}
      {enableSort && <Sort options={sortOptions} />}
    </Filters>
  )
}
