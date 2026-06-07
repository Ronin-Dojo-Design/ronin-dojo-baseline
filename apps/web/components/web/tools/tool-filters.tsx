"use client"

import { useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import plur from "plur"
import { useEffect } from "react"
import { DataSelect } from "~/components/common/data-select"
import { useFilters } from "~/contexts/filter-context"
import { findFilterOptions } from "~/server/web/actions/filters"
import type { ToolFilterSchema } from "~/server/web/tools/schema"

// Moved back onto DataSelect (SESSION_0355): the prior inline-`items` exception
// existed only because `FilterOption.name` is typed `ReactNode` (Dirstarter
// boilerplate shape) and wasn't assignable to DataSelect's string-only `label`.
// DataSelect now accepts an optional ReactNode row `content`, so the name renders
// in the dropdown row while a coerced string drives the trigger/typeahead/a11y.
export const ToolFilters = () => {
  const t = useTranslations("tools.filters")
  const { filters, updateFilters } = useFilters<ToolFilterSchema>()
  const { result, execute } = useAction(findFilterOptions)

  useEffect(execute, [execute])

  return (
    <>
      {result.data?.map(({ type, options }) => (
        <DataSelect
          key={type}
          value={filters[type]}
          onValueChange={value => updateFilters({ [type]: value as string })}
          options={options.map(({ slug, name }) => ({
            value: slug,
            // `name` is a plain string at runtime; coerce for the string-only
            // trigger/typeahead label and pass the original node as the row content.
            label: String(name),
            content: name,
          }))}
          placeholder={t(`all_${plur(type)}`)}
          size="lg"
          triggerClassName="w-auto min-w-40 max-sm:flex-1"
          align="end"
        />
      ))}
    </>
  )
}
