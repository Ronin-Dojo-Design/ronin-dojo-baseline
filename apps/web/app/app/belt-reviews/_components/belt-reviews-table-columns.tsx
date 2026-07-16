"use client"

import { formatDate } from "@dirstack/utils"
import type { ColumnDef } from "@tanstack/react-table"
import { BeltSwatch } from "~/components/common/belt-swatch"
import { Note } from "~/components/common/note"
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header"
import { DataTableLink } from "~/components/data-table/data-table-link"
import { passportDisplayName } from "~/lib/identity/passport-display"
import type { RankReviewAdminRow } from "~/server/admin/rank-reviews/queries"

/**
 * Columns for the belt-review queue (G-010, ADR 0045): the member link opens the addressable
 * review detail, while the list stays a scan-only summary. Proposed promoter comes exclusively
 * from the immutable proposal relation — never from the mutable active RankAward.
 */
export const getColumns = (): ColumnDef<RankReviewAdminRow>[] => {
  return [
    {
      id: "member",
      enableSorting: false,
      enableHiding: false,
      size: 200,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Member" />,
      cell: ({ row }) => {
        const name = passportDisplayName(row.original.rankEntry.passport) ?? "Unnamed member"
        return <DataTableLink href={`/app/belt-reviews/${row.original.id}`} title={name} />
      },
    },
    {
      id: "belt",
      enableSorting: false,
      size: 180,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Belt" />,
      cell: ({ row }) => {
        const rank = row.original.rankEntry.rank
        return (
          <div className="flex min-w-36 items-center gap-2">
            <BeltSwatch
              variant="belt"
              size="sm"
              colorHex={rank.colorHex}
              secondaryColorHex={rank.secondaryColorHex}
              degree={rank.degree}
              beltFamily={rank.beltFamily}
            />
            <Note className="min-w-0 truncate">{rank.name}</Note>
          </div>
        )
      },
    },
    {
      id: "proposedPromoter",
      enableSorting: false,
      size: 200,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Proposed promoter" />,
      cell: ({ row }) => {
        const { proposalCapturedAt, proposedPromoterPassportId, proposedPromoter } = row.original
        const label =
          proposalCapturedAt && proposedPromoterPassportId && proposedPromoter
            ? (passportDisplayName(proposedPromoter) ?? "Unnamed promoter")
            : "Proposal unavailable"
        return <Note>{label}</Note>
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Requested" />,
      cell: ({ row }) => <Note>{formatDate(row.original.createdAt)}</Note>,
    },
  ]
}
