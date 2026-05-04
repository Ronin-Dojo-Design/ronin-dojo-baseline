"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { EllipsisIcon } from "lucide-react"
import type { RegistrationStatus, PaymentStatus } from "~/.generated/prisma/browser"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Checkbox } from "~/components/common/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/common/dropdown-menu"
import { REGISTRATION_STATUS_TRANSITIONS } from "~/server/admin/tournaments/schema"
import { formatDateTime } from "@primoui/utils"

export type RegistrationRow = {
  id: string
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

type ColumnOptions = {
  onStatusUpdate: (registrationId: string, status: string) => void
  isPending: boolean
}

export function getRegistrationColumns({ onStatusUpdate, isPending }: ColumnOptions): ColumnDef<RegistrationRow>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "name",
      header: "Name",
      cell: ({ row }) => row.original.user.name ?? "—",
    },
    {
      id: "email",
      header: "Email",
      cell: ({ row }) => row.original.user.email,
    },
    {
      id: "divisions",
      header: "Divisions",
      cell: ({ row }) =>
        row.original.entries.map((e) => e.division.name).join(", ") || "—",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        return <Badge variant={STATUS_VARIANT[status] ?? "soft"}>{status}</Badge>
      },
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => row.original.paymentStatus,
    },
    {
      id: "total",
      header: "Total",
      cell: ({ row }) =>
        row.original.totalFeeCents > 0
          ? `$${(row.original.totalFeeCents / 100).toFixed(2)}`
          : "Free",
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => formatDateTime(row.original.createdAt),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const reg = row.original
        const allowed = REGISTRATION_STATUS_TRANSITIONS[reg.status] ?? []

        if (allowed.length === 0) return null

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" prefix={<EllipsisIcon />} aria-label="Actions" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {allowed.includes("APPROVED") && (
                <DropdownMenuItem onClick={() => onStatusUpdate(reg.id, "APPROVED")} disabled={isPending}>
                  Approve
                </DropdownMenuItem>
              )}
              {allowed.includes("WAITLISTED") && (
                <DropdownMenuItem onClick={() => onStatusUpdate(reg.id, "WAITLISTED")} disabled={isPending}>
                  Waitlist
                </DropdownMenuItem>
              )}
              {allowed.includes("CANCELLED") && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onStatusUpdate(reg.id, "CANCELLED")}
                    disabled={isPending}
                    className="text-red-600"
                  >
                    Cancel
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
