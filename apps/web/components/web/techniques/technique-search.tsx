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
  const { enableSort, enableFilters } = useFilters<TechniqueFilterSchema>()

  const sortOptions = [
    { value: "name.asc", label: "Name A–Z" },
    { value: "name.desc", label: "Name Z–A" },
    { value: "sortOrder.asc", label: "Curriculum order" },
  ]

  return (
    <Filters placeholder={placeholder || "Search techniques…"} {...props}>
      {enableFilters && <TechniqueFilters />}
      {enableSort && <Sort options={sortOptions} />}
    </Filters>
  )
}
