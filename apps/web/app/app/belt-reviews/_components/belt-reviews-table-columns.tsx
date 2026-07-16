"use client"

import { formatDate } from "@dirstack/utils"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "~/components/common/badge"
import { Note } from "~/components/common/note"
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header"
import type { RankReviewAdminRow } from "~/server/admin/rank-reviews/queries"
import { BeltReviewActions } from "./belt-review-actions"

/**
 * Columns for the belt-review queue (G-010). Read-only context a reviewing instructor needs —
 * member, belt, and the CHANGED promoter the member now claims (FK'd promoter name, else the
 * freetext note) — plus the Approve / Dismiss row actions (this queue is a moderation surface,
 * not a row→detail→editor flow). Every cell is resolved off the linked entry inside the
 * `belt.admin`-gated route, so a placeholder promoter's name never leaks to a public surface.
 */
export const getColumns = (): ColumnDef<RankReviewAdminRow>[] => {
  return [
    {
      id: "member",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Member" />,
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.rankEntry.passport.displayName ?? "Unnamed member"}
        </span>
      ),
    },
    {
      id: "belt",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Belt" />,
      cell: ({ row }) => <Note>{row.original.rankEntry.rank.name}</Note>,
    },
    {
      id: "promoter",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Changed promoter" />,
      cell: ({ row }) => {
        const award = row.original.rankEntry.rankAward
        const promoter = award.awardedByPassport?.displayName ?? award.notes
        return <Note>{promoter ?? "—"}</Note>
      },
    },
    {
      id: "reason",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Reason" />,
      cell: () => <Badge variant="warning">Promoter changed</Badge>,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Requested" />,
      cell: ({ row }) => <Note>{formatDate(row.original.createdAt)}</Note>,
    },
    {
      id: "actions",
      enableHiding: false,
      enableSorting: false,
      header: () => null,
      cell: ({ row }) => <BeltReviewActions reviewId={row.original.id} />,
    },
  ]
}
