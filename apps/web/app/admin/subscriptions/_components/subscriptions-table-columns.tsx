"use client"

import { formatDate } from "@primoui/utils"
import type { ColumnDef } from "@tanstack/react-table"
import type { SubscriptionStatus, UserBrandSubscription } from "~/.generated/prisma/browser"
import { SubscriptionActions } from "~/app/admin/subscriptions/_components/subscription-actions"
import { RowCheckbox } from "~/components/admin/row-checkbox"
import { Badge } from "~/components/common/badge"
import { Note } from "~/components/common/note"
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header"
import { DataTableLink } from "~/components/data-table/data-table-link"

export type SubscriptionRow = UserBrandSubscription & {
  user: { id: string; name: string | null; email: string }
  tier: { id: string; name: string; code: string; level: number }
}

const statusVariant: Record<SubscriptionStatus, "default" | "outline" | "destructive"> = {
  ACTIVE: "default",
  EXPIRED: "outline",
  CANCELLED: "destructive",
  PAST_DUE: "destructive",
}

export const getColumns = (): ColumnDef<SubscriptionRow>[] => {
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
      accessorKey: "user.name",
      enableHiding: false,
      size: 180,
      header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
      cell: ({ row }) => (
        <DataTableLink
          href={`/admin/subscriptions/${row.original.id}`}
          title={row.original.user.name || row.original.user.email}
        />
      ),
    },
    {
      accessorKey: "tier.name",
      size: 140,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tier" />,
      cell: ({ row }) => <Badge>{row.original.tier.name}</Badge>,
    },
    {
      accessorKey: "status",
      size: 100,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge variant={statusVariant[row.original.status]}>{row.original.status}</Badge>
      ),
    },
    {
      accessorKey: "startsAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Starts" />,
      cell: ({ row }) => <Note>{formatDate(row.original.startsAt)}</Note>,
    },
    {
      accessorKey: "expiresAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Expires" />,
      cell: ({ row }) => (
        <Note>{row.original.expiresAt ? formatDate(row.original.expiresAt) : "—"}</Note>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => <Note>{formatDate(row.original.createdAt)}</Note>,
    },
    {
      id: "actions",
      cell: ({ row }) => <SubscriptionActions subscription={row.original} />,
    },
  ]
}
