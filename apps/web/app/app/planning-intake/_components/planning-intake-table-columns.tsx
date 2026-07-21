"use client"

import { formatDate } from "@dirstack/utils"
import type { ColumnDef } from "@tanstack/react-table"
import type { ComponentProps } from "react"
import { Badge } from "~/components/common/badge"
import { Note } from "~/components/common/note"
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header"
import type { PlanningIntakeAdminRow } from "~/server/admin/planning-intake/queries"
import { PlanningIntakeStatusSelect } from "./planning-intake-status-select"

type BadgeVariant = NonNullable<ComponentProps<typeof Badge>["variant"]>

const CATEGORY_BADGE_VARIANT: Record<PlanningIntakeAdminRow["category"], BadgeVariant> = {
  FEATURE: "info",
  BUG: "danger",
  DESIGN: "primary",
  NOTE: "soft",
}

/**
 * Columns for the PlanningIntake triage AdminCollection index (SESSION_0592). The Body cell is a
 * truncated `Note` (matches the `reports-table-columns.tsx` Message cell — no `[id]` detail route
 * exists for this surface, triage happens inline via the Status select).
 */
export const getColumns = (): ColumnDef<PlanningIntakeAdminRow>[] => {
  return [
    {
      accessorKey: "category",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
      cell: ({ row }) => (
        <Badge variant={CATEGORY_BADGE_VARIANT[row.original.category]}>
          {row.original.category}
        </Badge>
      ),
    },
    {
      accessorKey: "body",
      enableSorting: false,
      size: 360,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Body" />,
      cell: ({ row }) => (
        <Note className="line-clamp-2 whitespace-pre-wrap">{row.original.body}</Note>
      ),
    },
    {
      id: "images",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Images" />,
      cell: ({ row }) => {
        const count = row.original.imageUrls.length
        return <Note>{count > 0 ? `${count} image${count === 1 ? "" : "s"}` : "—"}</Note>
      },
    },
    {
      id: "submittedBy",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Submitted by" />,
      cell: ({ row }) => <Note>{row.original.createdBy?.name ?? "—"}</Note>,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Submitted at" />,
      cell: ({ row }) => <Note>{formatDate(row.original.createdAt)}</Note>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <PlanningIntakeStatusSelect id={row.original.id} status={row.original.status} />
      ),
    },
  ]
}
