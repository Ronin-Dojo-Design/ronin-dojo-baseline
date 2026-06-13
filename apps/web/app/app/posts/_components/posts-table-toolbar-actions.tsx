"use client"

import type { Table } from "@tanstack/react-table"
import { TrashIcon } from "lucide-react"
import type { Post } from "~/.generated/prisma/browser"
import { PostsDeleteDialog } from "~/app/app/posts/_components/posts-delete-dialog"
import { Button } from "~/components/common/button"

interface PostsTableToolbarActionsProps {
  table: Table<Post>
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
