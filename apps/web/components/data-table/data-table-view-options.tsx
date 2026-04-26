"use client"

import type { Table } from "@tanstack/react-table"
import { sentenceCase } from "change-case"
import { Check, ChevronsUpDown, Settings2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRef } from "react"
import { Button } from "~/components/common/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/common/command"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/common/popover"
import { cx } from "~/lib/utils"

type DataTableViewOptionsProps<TData> = {
  table: Table<TData>
}

export function DataTableViewOptions<TData>({ table }: DataTableViewOptionsProps<TData>) {
  const t = useTranslations("components.data_table.view_options")
  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <Popover modal>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          aria-label={t("toggle_columns")}
          variant="secondary"
          size="md"
          className="ml-auto flex gap-2 max-md:hidden"
          prefix={<Settings2 />}
          suffix={<ChevronsUpDown />}
        >
          {t("view")}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-44 p-0"
        onCloseAutoFocus={() => triggerRef.current?.focus()}
      >
        <Command>
          <CommandInput placeholder={t("search_columns")} />
          <CommandList>
            <CommandEmpty>{t("no_columns")}</CommandEmpty>
            <CommandGroup>
              {table
                .getAllColumns()
                .filter(column => typeof column.accessorFn !== "undefined" && column.getCanHide())
                .map(column => {
                  return (
                    <CommandItem
                      key={column.id}
                      onSelect={() => column.toggleVisibility(!column.getIsVisible())}
                    >
                      <span className="truncate">{sentenceCase(column.id)}</span>
                      <Check
                        className={cx(
                          "ml-auto size-4 shrink-0",
                          column.getIsVisible() ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  )
                })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
