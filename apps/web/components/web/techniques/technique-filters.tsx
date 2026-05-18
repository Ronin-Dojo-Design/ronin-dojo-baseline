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
import { findTechniqueFilterOptions } from "~/server/web/techniques/actions"
import type { TechniqueFilterSchema } from "~/server/web/techniques/schema"

// Enum values inlined to avoid importing Prisma client in a client component
// (Prisma client bundles Node.js-only modules that can't run in the browser)
const TechniqueCategory = [
  "STRIKE",
  "KICK",
  "THROW",
  "SUBMISSION",
  "SWEEP",
  "ESCAPE",
  "BLOCK",
  "FORM",
  "DRILL",
  "CONDITIONING",
  "TRANSITION",
  "TAKEDOWN",
] as const

const TechniquePosition = [
  "STANDING",
  "GUARD",
  "HALF_GUARD",
  "MOUNT",
  "SIDE_CONTROL",
  "BACK",
  "TURTLE",
  "CLINCH",
  "OPEN",
] as const

const categoryOptions = TechniqueCategory.map(v => ({
  value: v,
  label: v.replace(/_/g, " "),
}))

const positionOptions = TechniquePosition.map(v => ({
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
