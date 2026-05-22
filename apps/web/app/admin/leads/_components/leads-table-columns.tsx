"use client"

import { formatDate } from "@dirstack/utils"
import type { ColumnDef } from "@tanstack/react-table"
import type { ComponentProps } from "react"
import { LeadStatus } from "~/.generated/prisma/browser"
import { LeadActions } from "~/app/admin/leads/_components/lead-actions"
import { RowCheckbox } from "~/components/admin/row-checkbox"
import { Badge } from "~/components/common/badge"
import { Note } from "~/components/common/note"
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header"
import { DataTableLink } from "~/components/data-table/data-table-link"
import type { LeadRow } from "~/server/admin/leads/queries"

export const getColumns = (): ColumnDef<LeadRow>[] => {
  const statusBadges: Record<LeadStatus, ComponentProps<typeof Badge>> = {
    [LeadStatus.NEW]: { variant: "info" },
    [LeadStatus.CONTACTED]: { variant: "info" },
    [LeadStatus.TRIAL_BOOKED]: { variant: "warning" },
    [LeadStatus.TRIAL_COMPLETED]: { variant: "warning" },
    [LeadStatus.CONVERTED]: { variant: "success" },
    [LeadStatus.LOST]: { variant: "soft" },
    [LeadStatus.NURTURE]: { variant: "warning" },
  }

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
      accessorKey: "firstName",
      enableHiding: false,
      size: 160,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => {
        const { firstName, lastName, id } = row.original
        const displayName = [firstName, lastName].filter(Boolean).join(" ")

        return <DataTableLink href={`/admin/leads/${id}`} title={displayName} />
      },
    },
    {
      accessorKey: "email",
      size: 200,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => <Note className="truncate">{row.original.email ?? "—"}</Note>,
    },
    {
      accessorKey: "phoneE164",
      size: 140,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
      cell: ({ row }) => <Note>{row.original.phoneE164 ?? "—"}</Note>,
    },
    {
      accessorKey: "status",
      size: 130,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge {...statusBadges[row.original.status]}>
          {row.original.status.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      accessorKey: "source",
      size: 130,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Source" />,
      cell: ({ row }) => <Note>{row.original.source.replace(/_/g, " ")}</Note>,
    },
    {
      id: "organization",
      accessorFn: row => (row as any).organization?.name,
      size: 160,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Organization" />,
      cell: ({ row }) => <Note>{(row.original as any).organization?.name ?? "—"}</Note>,
    },
    {
      accessorKey: "referredBy",
      size: 140,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Referred By" />,
      cell: ({ row }) => <Note>{row.original.referredBy ?? "—"}</Note>,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => <Note>{formatDate(row.getValue<Date>("createdAt"))}</Note>,
    },
    {
      id: "actions",
      cell: ({ row }) => <LeadActions lead={row.original} className="float-right" />,
    },
  ]
}
