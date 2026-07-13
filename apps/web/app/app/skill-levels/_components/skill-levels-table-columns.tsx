"use client"

import { formatDate } from "@dirstack/utils"
import type { ColumnDef } from "@tanstack/react-table"
import { HashIcon } from "lucide-react"
import type { SkillLevel } from "~/.generated/prisma/browser"
import { Badge } from "~/components/common/badge"
import { Note } from "~/components/common/note"
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header"
import { DataTableLink } from "~/components/data-table/data-table-link"
import { selectColumn } from "~/components/data-table/select-column"

export const getColumns = (): ColumnDef<SkillLevel & { _count?: { programs: number } }>[] => {
  return [
    selectColumn<SkillLevel & { _count?: { programs: number } }>(),
    {
      accessorKey: "name",
      enableHiding: false,
      size: 160,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <DataTableLink href={`/app/skill-levels/${row.original.id}`} title={row.original.name} />
      ),
    },
    {
      accessorKey: "code",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
      cell: ({ row }) => <Badge variant="outline">{row.original.code}</Badge>,
    },
    {
      accessorKey: "description",
      header: "Description",
      size: 300,
      cell: ({ row }) => <Note className="max-w-96 truncate">{row.original.description}</Note>,
    },
    {
      accessorKey: "_count.programs",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Programs" />,
      cell: ({ row }) => (
        <Badge prefix={<HashIcon className="opacity-50 size-3!" />} className="tabular-nums">
          {row.original._count?.programs || 0}
        </Badge>
      ),
    },
    {
      accessorKey: "sortOrder",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Order" />,
      cell: ({ row }) => <Note>{row.original.sortOrder}</Note>,
    },
    {
      accessorKey: "isSystem",
      header: "System",
      cell: ({ row }) => (row.original.isSystem ? <Badge variant="outline">System</Badge> : null),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
      cell: ({ cell }) => <Note>{formatDate(cell.getValue() as Date)}</Note>,
    },
  ]
}
