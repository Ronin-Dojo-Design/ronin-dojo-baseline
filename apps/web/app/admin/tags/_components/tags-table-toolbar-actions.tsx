"use client"

import type { Table } from "@tanstack/react-table"
import { TrashIcon } from "lucide-react"
import type { Tag } from "~/.generated/prisma/browser"
import { TagsDeleteDialog } from "~/app/admin/tags/_components/tags-delete-dialog"
import { Button } from "~/components/common/button"

interface TagsTableToolbarActionsProps {
  table: Table<Tag>
}

export const TagsTableToolbarActions = ({ table }: TagsTableToolbarActionsProps) => {
  const { rows } = table.getFilteredSelectedRowModel()

  if (!rows.length) {
    return null
  }

  return (
    <TagsDeleteDialog tags={rows.map(row => row.original)}>
      <Button variant="secondary" size="md" prefix={<TrashIcon />}>
        Delete ({rows.length})
      </Button>
    </TagsDeleteDialog>
  )
}
