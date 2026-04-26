"use client"

import { useTranslations } from "next-intl"
import type { ComponentProps } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { useFilters } from "~/contexts/filter-context"

export type SortProps = ComponentProps<typeof Select> & {
  options: { value: string; label: string }[]
}

export const Sort = ({ options, ...props }: SortProps) => {
  const t = useTranslations("common")
  const { filters, updateFilters } = useFilters()

  return (
    <Select value={filters.sort} onValueChange={sort => updateFilters({ sort })} {...props}>
      <SelectTrigger size="lg" className="w-auto min-w-36 max-sm:flex-1">
        <SelectValue placeholder={t("order_by")} />
      </SelectTrigger>

      <SelectContent align="end">
        {options.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
