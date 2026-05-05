"use client"

import type { ComponentProps } from "react"
import type { Stack } from "~/components/common/stack"
import { Filters } from "~/components/web/filters/filters"
import { Sort } from "~/components/web/filters/sort"
import { MemberFilters } from "~/components/web/members/member-filters"
import { useFilters } from "~/contexts/filter-context"
import type { MemberFilterSchema } from "~/server/web/directory/member-schema"

export type MemberSearchProps = ComponentProps<typeof Stack> & {
  placeholder?: string
}

export const MemberSearch = ({ placeholder, ...props }: MemberSearchProps) => {
  const { enableSort, enableFilters } = useFilters<MemberFilterSchema>()

  const sortOptions = [
    { value: "name.asc", label: "Name A–Z" },
    { value: "name.desc", label: "Name Z–A" },
  ]

  return (
    <Filters placeholder={placeholder || "Search members…"} {...props}>
      {enableFilters && <MemberFilters />}
      {enableSort && <Sort options={sortOptions} />}
    </Filters>
  )
}
