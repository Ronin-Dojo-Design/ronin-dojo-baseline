"use client"

import { formatDate } from "@dirstack/utils"
import type { ColumnDef } from "@tanstack/react-table"
import { OrderStatusBadge } from "~/app/app/merch/orders/_components/order-status-badge"
import { Note } from "~/components/common/note"
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header"
import { DataTableLink } from "~/components/data-table/data-table-link"
import { selectColumn } from "~/components/data-table/select-column"
import type { MerchOrderRow } from "~/server/web/merch/queries"

function formatCents(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100)
}

function countLineItems(lineItems: unknown): number {
  if (Array.isArray(lineItems)) return lineItems.length
  return 0
}

export const getColumns = (): ColumnDef<MerchOrderRow>[] => {
  return [
    selectColumn<MerchOrderRow>(),
    {
      accessorKey: "id",
      enableHiding: false,
      size: 120,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Order" />,
      cell: ({ row }) => (
        <DataTableLink
          href={`/app/merch/orders/${row.original.id}`}
          title={row.original.id.slice(-8).toUpperCase()}
        />
      ),
    },
    {
      accessorKey: "customerEmail",
      size: 200,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.customerName ?? "—"}</div>
          <Note className="truncate">{row.original.customerEmail}</Note>
        </div>
      ),
    },
    {
      id: "items",
      enableSorting: false,
      size: 80,
      header: () => <span>Items</span>,
      cell: ({ row }) => <Note>{countLineItems(row.original.lineItems)}</Note>,
    },
    {
      accessorKey: "totalCents",
      size: 100,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
      cell: ({ row }) => <Note>{formatCents(row.original.totalCents, row.original.currency)}</Note>,
    },
    {
      accessorKey: "fulfillmentStatus",
      size: 120,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <OrderStatusBadge status={row.original.fulfillmentStatus} />,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => <Note>{formatDate(row.getValue<Date>("createdAt"))}</Note>,
    },
  ]
}
