"use server"

import type { ReactNode } from "react"
import { actionClient } from "~/lib/safe-actions"
import { findCategories } from "~/server/web/categories/queries"
import type { ToolFilterParams } from "~/server/web/tools/schema"

type FilterOption = {
  slug: string
  name: ReactNode
  count: number
}

type FilterOptions = Array<{
  type: Exclude<keyof ToolFilterParams, "q" | "sort" | "page" | "perPage">
  options: FilterOption[]
}>

export const findFilterOptions = actionClient.action(async () => {
  const [categories] = await Promise.all([findCategories({})])

  const filterOptions: FilterOptions = [
    {
      type: "category",
      options: categories.map(({ slug, name, _count }) => ({
        slug,
        name,
        count: _count.tools,
      })),
    },
  ]

  return filterOptions.filter(({ options }) => options.length)
})
