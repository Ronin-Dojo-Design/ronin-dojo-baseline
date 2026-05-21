"use client"

import { formatDate } from "@primoui/utils"
import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import type { PaymentStatus, RegistrationStatus } from "~/.generated/prisma/browser"
import { RowCheckbox } from "~/components/admin/row-checkbox"
import { RegistrationActions } from "~/components/admin/tournaments/registration-actions"
import { Badge } from "~/components/common/badge"
import { Note } from "~/components/common/note"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/common/tooltip"
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header"

export type RegistrationRow = {
  id: string
  tournamentId: string
  status: RegistrationStatus
  paymentStatus: PaymentStatus
  totalFeeCents: number
  createdAt: Date
  user: { id: string; name: string | null; email: string }
  entries: { id: string; division: { id: string; name: string } }[]
}

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "soft"> = {
  STARTED: "soft",
  SUBMITTED: "soft",
  APPROVED: "success",
  WAITLISTED: "warning",
  CANCELLED: "danger",
}

const PAYMENT_VARIANT: Record<string, "success" | "warning" | "danger" | "soft"> = {
  PAID: "success",
  PENDING: "warning",
  REFUNDED: "danger",
  WAIVED: "soft",
}

export function getRegistrationColumns(): ColumnDef<RegistrationRow>[] {
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
      size: 160,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <Link
          href={`/admin/tournaments/${row.original.tournamentId}/registrations/${row.original.id}`}
          className="font-medium text-primary hover:underline"
        >
          {row.original.user.name ?? "—"}
        </Link>
      ),
    },
    {
      id: "email",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => {
        const email = row.original.user.email

        return (
          <Note className="max-w-48 truncate">
            {email ? (
              <Tooltip>
                <TooltipTrigger render={<span>{email}</span>} />
                <TooltipContent>{email}</TooltipContent>
              </Tooltip>
            ) : (
              email
            )}
          </Note>
        )
      },
    },
    {
      id: "divisions",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Divisions" />,
      cell: ({ row }) => {
        const names = row.original.entries.map(e => e.division.name)
        if (names.length === 0) return <Note>—</Note>
        const divisionNames = names.join(", ")
        const divisionNote = <Note className="max-w-48 truncate">{divisionNames}</Note>

        if (!divisionNames) return divisionNote

        return (
          <Tooltip>
            <TooltipTrigger render={divisionNote} />
            <TooltipContent>{divisionNames}</TooltipContent>
          </Tooltip>
        )
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge variant={STATUS_VARIANT[status] ?? "soft"} size="sm">
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "paymentStatus",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Payment" />,
      cell: ({ row }) => {
        const ps = row.original.paymentStatus
        return (
          <Badge variant={PAYMENT_VARIANT[ps] ?? "soft"} size="sm">
            {ps}
          </Badge>
        )
      },
    },
    {
      id: "total",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
      cell: ({ row }) => (
        <Note className="tabular-nums">
          {row.original.totalFeeCents > 0
            ? `$${(row.original.totalFeeCents / 100).toFixed(2)}`
            : "Free"}
        </Note>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ cell }) => <Note>{formatDate(cell.getValue() as Date)}</Note>,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <RegistrationActions registration={row.original} className="float-right" />
      ),
    },
  ]
}
