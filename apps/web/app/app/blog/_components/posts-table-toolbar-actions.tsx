"use client"

import type { Table } from "@tanstack/react-table"
import { TrashIcon } from "lucide-react"
import { PostsDeleteDialog } from "~/app/app/blog/_components/posts-delete-dialog"
import { Button } from "~/components/common/button"
import type { PostAdminRow } from "~/server/admin/posts/queries"

interface PostsTableToolbarActionsProps {
  table: Table<PostAdminRow>
}

export function PostsTableToolbarActions({ table }: PostsTableToolbarActionsProps) {
  const { rows } = table.getFilteredSelectedRowModel()

  if (!rows.length) {
    return null
  }

  return (
    <PostsDeleteDialog posts={rows.map(row => row.original)}>
      <Button variant="secondary" size="md" prefix={<TrashIcon />}>
        Delete ({rows.length})
      </Button>
    </PostsDeleteDialog>
  )
}
