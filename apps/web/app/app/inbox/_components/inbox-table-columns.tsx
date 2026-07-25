"use client"

import { formatDate } from "@dirstack/utils"
import type { ColumnDef } from "@tanstack/react-table"
import type { ComponentProps } from "react"
import { Badge } from "~/components/common/badge"
import { Note } from "~/components/common/note"
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header"
import { INBOX_BRAND_LABELS, type InboxBrand, type InboxEmailRow } from "~/server/inbox/schema"
import { InboxStatusSelect } from "./inbox-status-select"

type BadgeVariant = NonNullable<ComponentProps<typeof Badge>["variant"]>

const BRAND_BADGE_VARIANT: Record<InboxBrand, BadgeVariant> = {
  BBL: "info",
  RONIN_DOJO_DESIGN: "primary",
  BASELINE_MARTIAL_ARTS: "soft",
  WEKAF: "soft",
}

const brandBadge = (brand: string | null) => {
  if (!brand || !(brand in INBOX_BRAND_LABELS)) {
    return <Note>—</Note>
  }
  const known = brand as InboxBrand
  return <Badge variant={BRAND_BADGE_VARIANT[known]}>{INBOX_BRAND_LABELS[known]}</Badge>
}

/**
 * Columns for the `/app/inbox` AdminCollection (G-033 slice 1, SESSION_0639): from, subject,
 * brand, receivedAt, triageStatus — the pinned five. Triage happens inline via the Status
 * select (the planning-intake idiom); no `[id]` detail route exists in this slice.
 */
export const getColumns = (): ColumnDef<InboxEmailRow>[] => {
  return [
    {
      accessorKey: "fromAddress",
      enableHiding: false,
      size: 220,
      header: ({ column }) => <DataTableColumnHeader column={column} title="From" />,
      cell: ({ row }) => (
        <span className="truncate font-medium" title={row.original.fromAddress}>
          {row.original.fromAddress}
        </span>
      ),
    },
    {
      accessorKey: "subject",
      size: 320,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Subject" />,
      cell: ({ row }) => <Note className="truncate">{row.original.subject || "(no subject)"}</Note>,
    },
    {
      accessorKey: "brand",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Brand" />,
      cell: ({ row }) => brandBadge(row.original.brand),
    },
    {
      accessorKey: "receivedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Received" />,
      cell: ({ row }) => <Note>{formatDate(row.original.receivedAt)}</Note>,
    },
    {
      accessorKey: "triageStatus",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <InboxStatusSelect id={row.original.id} status={row.original.triageStatus} />
      ),
    },
  ]
}
