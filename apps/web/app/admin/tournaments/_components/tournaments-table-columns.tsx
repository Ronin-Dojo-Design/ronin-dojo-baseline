"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { EllipsisIcon } from "lucide-react"
import type { Tournament } from "~/.generated/prisma/browser"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { Badge } from "~/components/common/badge"
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header"
import { Checkbox } from "~/components/common/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/common/dropdown-menu"
import { formatDateTime } from "@primoui/utils"

type TournamentRow = Tournament & {
  host?: { name: string }
  disciplines?: { discipline: { name: string }; _count: { divisions: number } }[]
  _count?: { registrations: number }
}

export function getColumns(): ColumnDef<TournamentRow>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <Link href={`/admin/tournaments/${row.original.id}`} className="font-medium hover:underline">
          {row.getValue("name")}
        </Link>
      ),
    },
    {
      id: "host",
      header: "Host",
      cell: ({ row }) => row.original.host?.name ?? "—",
    },
    {
      accessorKey: "startDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Start" />,
      cell: ({ row }) => formatDateTime(row.getValue("startDate")),
    },
    {
      id: "disciplines",
      header: "Disciplines",
      cell: ({ row }) => {
        const discs = row.original.disciplines ?? []
        return discs.map(d => d.discipline.name).join(", ") || "—"
      },
    },
    {
      id: "divisions",
      header: "Divisions",
      cell: ({ row }) => {
        const discs = row.original.disciplines ?? []
        return discs.reduce((sum, d) => sum + d._count.divisions, 0)
      },
    },
    {
      id: "registrations",
      header: "Registrations",
      cell: ({ row }) => row.original._count?.registrations ?? 0,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        const variant = status === "PUBLISHED" ? "success" : status === "CLOSED" ? "warning" : "soft"
        return <Badge variant={variant}>{status}</Badge>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" prefix={<EllipsisIcon />} aria-label="Actions" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/tournaments/${row.original.id}`}>Edit</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}
