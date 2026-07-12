"use client"

import { formatDate } from "@dirstack/utils"
import type { ColumnDef } from "@tanstack/react-table"
import type { ComponentProps } from "react"
import { PostStatus } from "~/.generated/prisma/browser"
import { PostActions } from "~/app/app/blog/_components/post-actions"
import { RowCheckbox } from "~/components/admin/row-checkbox"
import { Badge } from "~/components/common/badge"
import { Note } from "~/components/common/note"
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header"
import { DataTableLink } from "~/components/data-table/data-table-link"
import type { PostAdminRow } from "~/server/admin/posts/queries"

export const getColumns = (): ColumnDef<PostAdminRow>[] => {
  const statusBadges: Record<PostStatus, ComponentProps<typeof Badge>> = {
    [PostStatus.Draft]: { variant: "soft" },
    [PostStatus.Scheduled]: { variant: "info" },
    [PostStatus.Published]: { variant: "success" },
  }

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
      accessorKey: "title",
      enableHiding: false,
      size: 240,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
      cell: ({ row }) => {
        const { title, id } = row.original
        return <DataTableLink href={`/app/blog/${id}`} title={title} />
      },
    },
    {
      id: "author",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Author" />,
      cell: ({ row }) => <Note>{row.original.author.name ?? "—"}</Note>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge {...statusBadges[row.original.status]}>{row.original.status}</Badge>
      ),
    },
    {
      accessorKey: "publishedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Published" />,
      cell: ({ row }) =>
        row.original.publishedAt ? (
          <Note>{formatDate(row.getValue<Date>("publishedAt"))}</Note>
        ) : (
          <Note>—</Note>
        ),
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
      cell: ({ row }) => <Note>{formatDate(row.getValue<Date>("updatedAt"))}</Note>,
    },
    {
      id: "actions",
      cell: ({ row }) => <PostActions post={row.original} className="float-right" />,
    },
  ]
}
