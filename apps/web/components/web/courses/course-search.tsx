"use client"

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
  const { enableSort } = useFilters<CourseFilterSchema>()

  const sortOptions = [
    { value: "title.asc", label: "Title A–Z" },
    { value: "title.desc", label: "Title Z–A" },
  ]

  return (
    <Filters placeholder={placeholder || "Search courses…"} {...props}>
      {enableSort && <Sort options={sortOptions} />}
    </Filters>
  )
}
