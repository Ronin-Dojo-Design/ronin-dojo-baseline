"use client"

import type { Column } from "@tanstack/react-table"
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon, EyeOffIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import type { ComponentProps } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/common/dropdown-menu"
import { cva, cx } from "~/lib/utils"

const dataTableColumnHeaderVariants = cva({
  base: "text-start font-medium text-muted-foreground whitespace-nowrap",

  variants: {
    toggleable: {
      true: "flex items-center gap-1 hover:text-foreground data-[state=open]:text-foreground",
    },
  },
})

type DataTableColumnHeaderProps<TData, TValue> = ComponentProps<typeof DropdownMenuTrigger> & {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  ...props
}: DataTableColumnHeaderProps<TData, TValue>) {
  const t = useTranslations("components.data_table.column_header")

  if (!column.getCanSort() && !column.getCanHide()) {
    return <div className={cx(dataTableColumnHeaderVariants({ className }))}>{title}</div>
  }

  const buttonLabel =
    column.getCanSort() && column.getIsSorted() === "desc"
      ? t("sorted_desc")
      : column.getIsSorted() === "asc"
        ? t("sorted_asc")
        : t("not_sorted")

  const buttonSuffix =
    column.getCanSort() && column.getIsSorted() === "desc" ? (
      <ArrowDownIcon />
    ) : column.getIsSorted() === "asc" ? (
      <ArrowUpIcon />
    ) : (
      <ChevronsUpDownIcon />
    )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cx(dataTableColumnHeaderVariants({ toggleable: true, className }))}
        aria-label={buttonLabel}
        {...props}
      >
        {title}
        {buttonSuffix}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        {column.getCanSort() && (
          <>
            <DropdownMenuItem
              aria-label={t("sort_asc")}
              onClick={() => column.toggleSorting(false)}
            >
              <ArrowUpIcon className="mr-2 text-muted-foreground/70" aria-hidden="true" />
              {t("asc")}
            </DropdownMenuItem>

            <DropdownMenuItem
              aria-label={t("sort_desc")}
              onClick={() => column.toggleSorting(true)}
            >
              <ArrowDownIcon className="mr-2 text-muted-foreground/70" aria-hidden="true" />
              {t("desc")}
            </DropdownMenuItem>
          </>
        )}
        {column.getCanSort() && column.getCanHide() && <DropdownMenuSeparator />}
        {column.getCanHide() && (
          <DropdownMenuItem
            aria-label={t("hide_column")}
            onClick={() => column.toggleVisibility(false)}
          >
            <EyeOffIcon className="mr-2 text-muted-foreground/70" aria-hidden="true" />
            {t("hide")}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
