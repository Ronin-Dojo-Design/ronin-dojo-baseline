"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "~/components/common/badge"
import { Note } from "~/components/common/note"
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header"
import { DataTableLink } from "~/components/data-table/data-table-link"
import type { TechniqueAdminRow } from "~/server/admin/techniques/queries"

/**
 * Columns for the Techniques AdminCollection index (FI-027). The Name cell carries the
 * row→detail link (`/app/techniques/[id]` — the SESSION_0529 3C editor + feature toggle).
 * Author/School surface the authored-technique attribution (a null org = a profile-only
 * authored row); Premium mix is computed from `mediaAttachments.isPremium` alone — the
 * query never selects a media URL, so no premium locator reaches this cell.
 */
export const getColumns = (): ColumnDef<TechniqueAdminRow>[] => {
  return [
    {
      accessorKey: "name",
      enableHiding: false,
      size: 240,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <DataTableLink href={`/app/techniques/${row.original.id}`} title={row.original.name} />
      ),
    },
    {
      id: "author",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Author" />,
      cell: ({ row }) => <Note>{row.original.author?.displayName ?? "—"}</Note>,
    },
    {
      id: "school",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="School" />,
      cell: ({ row }) => <Note>{row.original.organization?.name ?? "—"}</Note>,
    },
    {
      accessorKey: "isFeatured",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Featured" />,
      // Promote-triage glyph rule: a colored pill is reserved for the few FEATURED rows so they pop;
      // the not-featured null-glyph is a bare Note, matching the null Author/School cells (badges
      // carry words, bare Notes carry the "—" glyph).
      cell: ({ row }) =>
        row.original.isFeatured ? <Badge variant="info">Featured</Badge> : <Note>—</Note>,
    },
    {
      accessorKey: "isPublished",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Published" />,
      cell: ({ row }) =>
        row.original.isPublished ? (
          <Badge variant="success">Published</Badge>
        ) : (
          <Badge variant="outline">Draft</Badge>
        ),
    },
    {
      id: "premiumMix",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Premium mix" />,
      cell: ({ row }) => {
        const media = row.original.mediaAttachments
        if (media.length === 0) return <Note>No media</Note>
        const premium = media.filter(item => item.isPremium).length
        const free = media.length - premium
        return (
          <Note>
            {free} free · {premium} premium
          </Note>
        )
      },
    },
  ]
}
