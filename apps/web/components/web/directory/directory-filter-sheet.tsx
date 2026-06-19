"use client"

import { SlidersHorizontalIcon } from "lucide-react"
import dynamic from "next/dynamic"
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
import { useFilters } from "~/contexts/filter-context"
import type { DirectoryFilterOptions } from "~/server/web/directory/filter-options"

/**
 * The 6 Select/Combobox filter controls only render once the sheet opens — the Base UI Dialog
 * portal (sheet.tsx → DialogPrimitive.Portal, no `keepMounted`) unmounts its content while closed,
 * so `next/dynamic` genuinely defers their JS (incl. the Combobox/Command chunk) out of the initial
 * `/directory` payload until the visitor opens Filters. This is the lazy boundary the folder-module
 * decomposition enables — recipe step 3: lazy only pays off when the inactive branch unmounts.
 */
const DirectoryFilters = dynamic(
  () => import("./directory-filters").then(m => m.DirectoryFilters),
  { ssr: false },
)

type DirectoryFilterSheetProps = {
  options: DirectoryFilterOptions
}

/**
 * Left slide-in filter panel for `/directory` (contextual per-surface panel,
 * SESSION_0361 §Q4 measured spec). Hosts the existing DirectoryFilters — same
 * nuqs query state, so the panel and the listing stay in sync.
 *
 * The panel content portals into `document.body` (Base UI Dialog), escaping the page wrapper. The
 * directory is a multi-brand, non-BBL-font-wrapped surface, so the only font in play is the app
 * `--font-sans` defined on the root `<html>` — which portals inherit — so there is no BBL font to
 * thread here (forcing BBL `.variable` would regress the non-BBL brands; see recipe gotcha). Width
 * is left to the Sheet primitive's `w-80` default rather than a hardcoded `w-[320px]`.
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

      <SheetContent side="left">
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
