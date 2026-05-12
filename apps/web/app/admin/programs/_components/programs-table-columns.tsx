"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Program } from "~/.generated/prisma/browser"
import { ProgramActions } from "~/app/admin/programs/_components/program-actions"
import { Link } from "~/components/common/link"
import { Badge } from "~/components/common/badge"
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header"
import { Checkbox } from "~/components/common/checkbox"
import { formatDateTime } from "@primoui/utils"

export type ProgramRow = Program & {
  organization: { name: string; id: string }
  discipline: { name: string; id: string } | null
  _count: { programEnrollments: number; courses: number; classSchedules: number }
}

export function getColumns(): ColumnDef<ProgramRow>[] {
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
        <Link href={`/admin/programs/${row.original.id}`} className="font-medium hover:underline">
          {row.getValue("name")}
        </Link>
      ),
    },
    {
      id: "organization",
      header: "Organization",
      cell: ({ row }) => row.original.organization?.name ?? "—",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        const variant = status === "ACTIVE" ? "success" : status === "ARCHIVED" ? "outline" : "soft"
        return <Badge variant={variant}>{status}</Badge>
      },
    },
    {
      id: "courses",
      header: "Courses",
      cell: ({ row }) => row.original._count?.courses ?? 0,
    },
    {
      id: "enrollments",
      header: "Enrollments",
      cell: ({ row }) => row.original._count?.programEnrollments ?? 0,
    },
    {
      id: "schedules",
      header: "Schedules",
      cell: ({ row }) => row.original._count?.classSchedules ?? 0,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => formatDateTime(row.getValue("createdAt")),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <ProgramActions program={row.original as Program} />
      ),
    },
  ]
}
