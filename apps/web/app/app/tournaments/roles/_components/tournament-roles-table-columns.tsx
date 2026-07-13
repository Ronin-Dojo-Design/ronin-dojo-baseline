"use client"

import { formatDate } from "@dirstack/utils"
import type { ColumnDef } from "@tanstack/react-table"
import { HashIcon } from "lucide-react"
import { TournamentRoleActions } from "~/app/app/tournaments/roles/_components/tournament-role-actions"
import { Badge } from "~/components/common/badge"
import { Note } from "~/components/common/note"
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header"
import { DataTableLink } from "~/components/data-table/data-table-link"
import { selectColumn } from "~/components/data-table/select-column"

import type { findTournamentRolesPaginated } from "~/server/admin/tournaments/queries"

type TournamentRoleWithCount = Awaited<
  ReturnType<typeof findTournamentRolesPaginated>
>["roles"][number]

export const getColumns = (): ColumnDef<TournamentRoleWithCount>[] => {
  return [
    selectColumn<TournamentRoleWithCount>(),
    {
      accessorKey: "name",
      enableHiding: false,
      size: 160,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <DataTableLink
          href={`/app/tournaments/roles/${row.original.id}`}
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
      cell: ({ row }) => <TournamentRoleActions role={row.original} className="float-right" />,
    },
  ]
}
