"use client"

import { SlidersHorizontalIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "~/components/common/button"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/common/sheet"
import { DirectoryFilters } from "~/components/web/directory/directory-filters"
import { useFilters } from "~/contexts/filter-context"
import type { DirectoryFilterOptions } from "~/server/web/directory/filter-options"

type DirectoryFilterSheetProps = {
  options: DirectoryFilterOptions
}

/**
 * Left slide-in filter panel for `/directory` (contextual per-surface panel,
 * SESSION_0361 §Q4 measured spec). Hosts the existing DirectoryFilters — same
 * nuqs query state, so the panel and the listing stay in sync.
 */
export function DirectoryFilterSheet({ options }: DirectoryFilterSheetProps) {
  const t = useTranslations("common")
  const { isDefault, updateFilters } = useFilters()

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            size="lg"
            variant="secondary"
            prefix={<SlidersHorizontalIcon />}
            suffix={
              isDefault ? undefined : (
                <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
              )
            }
          />
        }
      >
        {t("filters")}
      </SheetTrigger>

      <SheetContent side="left" className="w-[320px]">
        <SheetHeader>
          <SheetTitle>{t("filters")}</SheetTitle>
        </SheetHeader>

        <DirectoryFilters options={options} />

        <SheetFooter>
          <Button variant="secondary" disabled={isDefault} onClick={() => updateFilters(null)}>
            {t("reset")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
