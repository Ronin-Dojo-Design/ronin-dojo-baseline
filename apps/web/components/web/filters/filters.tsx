"use client"

import { LoaderIcon, SearchIcon, XIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import type { ComponentProps } from "react"
import { Button } from "~/components/common/button"
import { Input } from "~/components/common/input"
import { Stack } from "~/components/common/stack"
import { useFilters } from "~/contexts/filter-context"
import { cx } from "~/lib/utils"

export type FiltersProps = ComponentProps<typeof Stack> & {
  placeholder: string
}

export const Filters = ({ children, className, placeholder, ...props }: FiltersProps) => {
  const t = useTranslations("common")
  const { filters, isLoading, isDefault, updateFilters } = useFilters()

  return (
    <Stack className={cx("w-full gap-2", className)} {...props}>
      <div className="relative grow min-w-0">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none">
          {isLoading ? <LoaderIcon className="animate-spin" /> : <SearchIcon />}
        </div>

        <Input
          size="lg"
          value={filters.q || ""}
          onChange={e => updateFilters({ q: e.target.value })}
          placeholder={isLoading ? t("loading") : placeholder}
          className={cx("w-full truncate pl-10", !isDefault && "pr-12 sm:pr-20")}
        />

        {!isDefault && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 inset-y-2"
            onClick={() => updateFilters(null)}
            prefix={<XIcon />}
          >
            <span className="max-md:sr-only">{t("reset")}</span>
          </Button>
        )}
      </div>

      {children}
    </Stack>
  )
}
