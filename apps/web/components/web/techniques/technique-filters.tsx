"use client"

import { useAction } from "next-safe-action/hooks"
import { type ComponentProps, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { useFilters } from "~/contexts/filter-context"
import { TechniqueCategory, TechniquePosition } from "~/.generated/prisma/client"
import type { TechniqueFilterSchema } from "~/server/web/techniques/schema"
import { findTechniqueFilterOptions } from "~/server/web/techniques/actions"

const categoryOptions = Object.values(TechniqueCategory).map(v => ({
  value: v,
  label: v.replace(/_/g, " "),
}))

const positionOptions = Object.values(TechniquePosition).map(v => ({
  value: v,
  label: v.replace(/_/g, " "),
}))

export const TechniqueFilters = ({ ...props }: ComponentProps<typeof Select>) => {
  const { filters, updateFilters } = useFilters<TechniqueFilterSchema>()
  const { result, execute } = useAction(findTechniqueFilterOptions)

  useEffect(execute, [execute])

  return (
    <>
      <Select
        value={filters.category}
        onValueChange={value => updateFilters({ category: value })}
        {...props}
      >
        <SelectTrigger size="lg" className="w-auto min-w-40 max-sm:flex-1">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent align="end">
          {categoryOptions.map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.position}
        onValueChange={value => updateFilters({ position: value })}
        {...props}
      >
        <SelectTrigger size="lg" className="w-auto min-w-40 max-sm:flex-1">
          <SelectValue placeholder="All positions" />
        </SelectTrigger>
        <SelectContent align="end">
          {positionOptions.map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {result.data?.disciplines && result.data.disciplines.length > 0 && (
        <Select
          value={filters.discipline}
          onValueChange={value => updateFilters({ discipline: value })}
          {...props}
        >
          <SelectTrigger size="lg" className="w-auto min-w-40 max-sm:flex-1">
            <SelectValue placeholder="All disciplines" />
          </SelectTrigger>
          <SelectContent align="end">
            {result.data.disciplines.map(({ slug, name }) => (
              <SelectItem key={slug} value={slug}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </>
  )
}
