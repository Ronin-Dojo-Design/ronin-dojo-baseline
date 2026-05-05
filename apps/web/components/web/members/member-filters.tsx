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
import { Input } from "~/components/common/input"
import { Stack } from "~/components/common/stack"
import { useFilters } from "~/contexts/filter-context"
import { findMemberFilterOptions } from "~/server/web/directory/filter-actions"
import type { MemberFilterSchema } from "~/server/web/directory/member-schema"

export const MemberFilters = ({ ...props }: ComponentProps<typeof Select>) => {
  const { filters, updateFilters } = useFilters<MemberFilterSchema>()
  const { result, execute } = useAction(findMemberFilterOptions)

  useEffect(execute, [execute])

  return (
    <Stack size="sm" direction="row" className="flex-wrap">
      <Select
        value={filters.discipline}
        onValueChange={value => updateFilters({ discipline: value })}
        {...props}
      >
        <SelectTrigger size="lg" className="w-auto min-w-40 max-sm:flex-1">
          <SelectValue placeholder="All disciplines" />
        </SelectTrigger>
        <SelectContent align="end">
          {result.data?.disciplines?.map(({ slug, name }) => (
            <SelectItem key={slug} value={slug}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Stack>
  )
}
