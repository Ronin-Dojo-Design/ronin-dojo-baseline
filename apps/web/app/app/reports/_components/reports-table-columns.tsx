"use client"

import { formatDate } from "@dirstack/utils"
import type { ColumnDef } from "@tanstack/react-table"
import type { Report, Tool } from "~/.generated/prisma/browser"
import { ReportActions } from "~/app/app/reports/_components/report-actions"
import { Badge } from "~/components/common/badge"
import { Note } from "~/components/common/note"
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header"
import { DataTableLink } from "~/components/data-table/data-table-link"
import { selectColumn } from "~/components/data-table/select-column"
import { reportsConfig } from "~/config/reports"

export const getColumns = (): ColumnDef<Report>[] => {
  return [
    selectColumn<Report>(),
    {
      accessorKey: "id",
      enableSorting: false,
      enableHiding: false,
      size: 80,
      header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
      cell: ({ row }) => (
        <DataTableLink
          href={`/app/reports/${row.original.id}`}
          title={`#${row.original.id.slice(-6).toUpperCase()}`}
        />
      ),
    },
    {
      accessorKey: "message",
      enableSorting: false,
      size: 320,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Message" />,
      cell: ({ row }) => <Note className="truncate">{row.getValue("message")}</Note>,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Reported At" />,
      cell: ({ row }) => <Note>{formatDate(row.getValue<Date>("createdAt"))}</Note>,
    },
    {
      accessorKey: "type",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => {
        const type = row.getValue<keyof typeof reportsConfig.reportTypeLabels>("type")
        return <Badge variant="outline">{reportsConfig.reportTypeLabels[type] ?? type}</Badge>
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => <Note>{row.getValue("email")}</Note>,
    },
    {
      accessorKey: "tool",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tool" />,
      cell: ({ row }) => {
        const tool = row.getValue<Pick<Tool, "slug" | "name">>("tool")

        return (
          <DataTableLink href={`/app/tools/${tool?.slug}`} title={tool?.name} isOverlay={false} />
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <ReportActions report={row.original} className="float-right" />,
    },
  ]
}
