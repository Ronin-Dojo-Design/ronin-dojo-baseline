"use client"

import { formatDate } from "@primoui/utils"
import type { ColumnDef } from "@tanstack/react-table"
import { HashIcon } from "lucide-react"
import { TournamentRoleActions } from "~/app/admin/tournaments/roles/_components/tournament-role-actions"
import { RowCheckbox } from "~/components/admin/row-checkbox"
import { Badge } from "~/components/common/badge"
import { Note } from "~/components/common/note"
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header"
import { DataTableLink } from "~/components/data-table/data-table-link"

import type { findTournamentRolesPaginated } from "~/server/admin/tournaments/queries"

type TournamentRoleWithCount = Awaited<ReturnType<typeof findTournamentRolesPaginated>>["roles"][number]

export const getColumns = (): ColumnDef<TournamentRoleWithCount>[] => {
  return [
    {
      id: "select",
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <RowCheckbox
          checked={table.getIsAllPageRowsSelected()}
          ref={input => {
            if (input) {
              input.indeterminate =
                table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
            }
          }}
          onChange={e => table.toggleAllPageRowsSelected(e.target.checked)}
          aria-label="Select all"
        />
      ),
      cell: ({ row, table }) => (
        <RowCheckbox
          checked={row.getIsSelected()}
          onChange={e => row.toggleSelected(e.target.checked)}
          aria-label="Select row"
          table={table}
          row={row}
        />
      ),
    },
    {
      accessorKey: "name",
      enableHiding: false,
      size: 160,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <DataTableLink
          href={`/admin/tournaments/roles/${row.original.id}`}
          title={row.original.name}
        />
      ),
    },
    {
      accessorKey: "code",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
      cell: ({ row }) => <Badge variant="outline">{row.original.code}</Badge>,
    },
    {
      accessorKey: "isSystem",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => (
        <Badge variant={row.original.isSystem ? "info" : "outline"}>
          {row.original.isSystem ? "System" : "Custom"}
        </Badge>
      ),
    },
    {
      accessorKey: "_count.staffAssignments",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Assignments" />,
      cell: ({ row }) => (
        <Badge prefix={<HashIcon className="opacity-50 size-3!" />} className="tabular-nums">
          {row.original._count?.staffAssignments || 0}
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
      cell: ({ row }) => (
        <TournamentRoleActions role={row.original} className="float-right" />
      ),
    },
  ]
}
