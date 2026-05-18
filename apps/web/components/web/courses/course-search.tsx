"use client"

import { useTranslations } from "next-intl"
import type { ComponentProps } from "react"
import type { Stack } from "~/components/common/stack"
import { Filters } from "~/components/web/filters/filters"
import { Sort } from "~/components/web/filters/sort"
import { useFilters } from "~/contexts/filter-context"
import type { CourseFilterSchema } from "~/server/web/courses/schema"

export type CourseSearchProps = ComponentProps<typeof Stack> & {
  placeholder?: string
}

export const CourseSearch = ({ placeholder, ...props }: CourseSearchProps) => {
  const tSort = useTranslations("courses.sort")
  const tFilters = useTranslations("courses.filters")
  const { enableSort } = useFilters<CourseFilterSchema>()

  const sortOptions = [
    { value: "title.asc", label: tSort("title_asc") },
    { value: "title.desc", label: tSort("title_desc") },
  ]

  return (
    <Filters placeholder={placeholder || tFilters("search_placeholder")} {...props}>
      {enableSort && <Sort options={sortOptions} />}
    </Filters>
  )
}
