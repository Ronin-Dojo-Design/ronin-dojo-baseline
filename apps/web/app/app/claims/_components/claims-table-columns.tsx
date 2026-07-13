"use client"

import { formatDate } from "@dirstack/utils"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "~/components/common/badge"
import { Note } from "~/components/common/note"
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header"
import { DataTableLink } from "~/components/data-table/data-table-link"
import { profileClaimSubjectLabel } from "~/server/admin/claims/claim-labels"
import type { ProfileClaimRow } from "~/server/admin/claims/claim-queries"

/**
 * Columns for the profile-claim queue migrated onto `AdminCollection` (ADR 0045). The
 * former single-row layout (`claimant → subject` headline, `subtype · relationship`
 * subtitle, status badge, date) is preserved column-for-column; the row→detail link
 * (`/app/claims/[id]`) moves onto the Claimant cell.
 */
export const getColumns = (): ColumnDef<ProfileClaimRow>[] => {
  return [
    {
      id: "claimant",
      enableSorting: false,
      enableHiding: false,
      size: 200,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Claimant" />,
      cell: ({ row }) => {
        const claim = row.original
        const name = claim.claimant.name ?? claim.claimant.email
        return <DataTableLink href={`/app/claims/${claim.id}`} title={name} />
      },
    },
    {
      id: "subject",
      enableSorting: false,
      size: 200,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Subject" />,
      cell: ({ row }) => (
        <span className="block truncate font-medium">{profileClaimSubjectLabel(row.original)}</span>
      ),
    },
    {
      id: "relationship",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => {
        const claim = row.original
        const subjectLabel = claim.subjectType === "ORGANIZATION" ? "Organization" : "Member"
        return (
          <Note>
            {subjectLabel} · {claim.relationship.toLowerCase()}
          </Note>
        )
      },
    },
    {
      id: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const { status } = row.original
        return <Badge variant={status === "NEEDS_INFO" ? "outline" : "info"}>{status}</Badge>
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Requested" />,
      cell: ({ row }) => <Note>{formatDate(row.getValue<Date>("createdAt"))}</Note>,
    },
  ]
}
