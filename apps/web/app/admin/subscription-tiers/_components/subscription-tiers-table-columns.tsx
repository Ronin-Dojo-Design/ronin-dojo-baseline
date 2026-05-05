"use client"

import { formatDate } from "@primoui/utils"
import type { ColumnDef } from "@tanstack/react-table"
import { HashIcon, KeyIcon } from "lucide-react"
import type { SubscriptionTier } from "~/.generated/prisma/browser"
import { SubscriptionTierActions } from "~/app/admin/subscription-tiers/_components/subscription-tier-actions"
import { RowCheckbox } from "~/components/admin/row-checkbox"
import { Badge } from "~/components/common/badge"
import { Note } from "~/components/common/note"
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header"
import { DataTableLink } from "~/components/data-table/data-table-link"

export type SubscriptionTierRow = SubscriptionTier & {
  _count?: { subscriptions: number }
}

export const getColumns = (): ColumnDef<SubscriptionTierRow>[] => {
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
          href={`/admin/subscription-tiers/${row.original.id}`}
          title={row.original.name}
        />
      ),
    },
    {
      accessorKey: "code",
      size: 140,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
      cell: ({ row }) => (
        <Badge prefix={<KeyIcon className="opacity-50 size-3!" />} className="font-mono text-xs">
          {row.original.code}
        </Badge>
      ),
    },
    {
      accessorKey: "level",
      size: 80,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Level" />,
      cell: ({ row }) => (
        <Badge prefix={<HashIcon className="opacity-50 size-3!" />} className="tabular-nums">
          {row.original.level}
        </Badge>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
      cell: ({ row }) => <Note className="max-w-96 truncate">{row.original.description}</Note>,
    },
    {
      accessorKey: "_count.subscriptions",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Subscribers" />,
      cell: ({ row }) => (
        <Badge prefix={<HashIcon className="opacity-50 size-3!" />} className="tabular-nums">
          {row.original._count?.subscriptions || 0}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => <Note>{formatDate(row.original.createdAt)}</Note>,
    },
    {
      id: "actions",
      cell: ({ row }) => <SubscriptionTierActions tier={row.original} />,
    },
  ]
}
