"use client"

import { formatDate } from "@dirstack/utils"
import type { ColumnDef } from "@tanstack/react-table"
import { HashIcon } from "lucide-react"
import type { Category } from "~/.generated/prisma/browser"
import { CategoryActions } from "~/app/app/categories/_components/category-actions"
import { Badge } from "~/components/common/badge"
import { Note } from "~/components/common/note"
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header"
import { DataTableLink } from "~/components/data-table/data-table-link"
import { selectColumn } from "~/components/data-table/select-column"

export const getColumns = (): ColumnDef<Category & { _count?: { tools: number } }>[] => {
  return [
    selectColumn<Category & { _count?: { tools: number } }>(),
    {
      accessorKey: "name",
      enableHiding: false,
      size: 160,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <DataTableLink href={`/app/categories/${row.original.slug}`} title={row.original.name} />
      ),
    },
    {
      accessorKey: "label",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Label" />,
      cell: ({ row }) => <Note className="max-w-96 truncate">{row.original.label}</Note>,
    },
    {
      accessorKey: "_count.tools",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tools" />,
      cell: ({ row }) => (
        <Badge prefix={<HashIcon className="opacity-50 size-3!" />} className="tabular-nums">
          {row.original._count?.tools || 0}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
      cell: ({ cell }) => <Note>{formatDate(cell.getValue() as Date)}</Note>,
    },
    {
      id: "actions",
      cell: ({ row }) => <CategoryActions category={row.original} className="float-right" />,
    },
  ]
}
