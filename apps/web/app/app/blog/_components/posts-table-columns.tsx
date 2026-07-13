"use client"

import { formatDate } from "@dirstack/utils"
import type { ColumnDef } from "@tanstack/react-table"
import { PostActions } from "~/app/app/blog/_components/post-actions"
import { Badge } from "~/components/common/badge"
import { Note } from "~/components/common/note"
import { postStatusBadgeProps } from "~/components/common/post-status"
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header"
import { DataTableLink } from "~/components/data-table/data-table-link"
import { selectColumn } from "~/components/data-table/select-column"
import type { PostAdminRow } from "~/server/admin/posts/queries"

export const getColumns = (): ColumnDef<PostAdminRow>[] => {
  return [
    selectColumn<PostAdminRow>(),
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
        <Badge {...postStatusBadgeProps[row.original.status]}>{row.original.status}</Badge>
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
