"use client"

import type { ComponentProps } from "react"
import type { Stack } from "~/components/common/stack"
import { Filters } from "~/components/web/filters/filters"
import { Sort } from "~/components/web/filters/sort"
import { useFilters } from "~/contexts/filter-context"
import type { LineageFilterSchema } from "~/server/web/lineage/schema"

export type LineageSearchProps = ComponentProps<typeof Stack> & {
  placeholder?: string
}

export const LineageSearch = ({
  placeholder = "Search lineage trees",
  ...props
}: LineageSearchProps) => {
  const { enableSort } = useFilters<LineageFilterSchema>()

  const sortOptions = [
    { value: "name.asc", label: "Name A-Z" },
    { value: "name.desc", label: "Name Z-A" },
    { value: "updatedAt.desc", label: "Recently updated" },
  ]

  return (
    <Filters placeholder={placeholder} {...props}>
      {enableSort && <Sort options={sortOptions} />}
    </Filters>
  )
}
