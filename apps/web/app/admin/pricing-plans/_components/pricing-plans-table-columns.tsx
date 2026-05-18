"use client"

import { formatDate } from "@primoui/utils"
import type { ColumnDef } from "@tanstack/react-table"
import { HashIcon } from "lucide-react"
import { PricingPlanActions } from "~/app/admin/pricing-plans/_components/pricing-plan-actions"
import { RowCheckbox } from "~/components/admin/row-checkbox"
import { Badge } from "~/components/common/badge"
import { Note } from "~/components/common/note"
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header"
import { DataTableLink } from "~/components/data-table/data-table-link"
import type { findPricingPlans } from "~/server/admin/pricing-plans/queries"

type PricingPlanRow = Awaited<ReturnType<typeof findPricingPlans>>["pricingPlans"][number]

const formatCents = (cents: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100)
}

const modelLabels: Record<string, string> = {
  MONTHLY: "Monthly",
  ANNUAL: "Annual",
  DROP_IN: "Drop-in",
  CLASS_PACK: "Class Pack",
  PER_TEST: "Per Test",
  FREE_TRIAL: "Free Trial",
  INTRO_PACK: "Intro Pack",
  CUSTOM: "Custom",
}

export const getColumns = (): ColumnDef<PricingPlanRow>[] => {
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
        <DataTableLink href={`/admin/pricing-plans/${row.original.id}`} title={row.original.name} />
      ),
    },
    {
      accessorKey: "organization.name",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Organization" />,
      cell: ({ row }) => (
        <Note className="max-w-40 truncate">{row.original.organization.name}</Note>
      ),
    },
    {
      accessorKey: "program.name",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Program" />,
      cell: ({ row }) => (
        <Note className="max-w-40 truncate">{row.original.program?.name ?? "—"}</Note>
      ),
    },
    {
      accessorKey: "pricingModel",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Model" />,
      cell: ({ row }) => (
        <Badge variant="outline">
          {modelLabels[row.original.pricingModel] ?? row.original.pricingModel}
        </Badge>
      ),
    },
    {
      accessorKey: "amountCents",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
      cell: ({ row }) => (
        <Note className="tabular-nums">
          {formatCents(row.original.amountCents, row.original.currency)}
        </Note>
      ),
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "success" : "outline"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      accessorKey: "_count.entitlementGrants",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Entitlements" />,
      cell: ({ row }) => (
        <Badge prefix={<HashIcon className="opacity-50 size-3!" />} className="tabular-nums">
          {row.original._count?.entitlementGrants || 0}
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
      cell: ({ row }) => <PricingPlanActions pricingPlan={row.original} className="float-right" />,
    },
  ]
}
