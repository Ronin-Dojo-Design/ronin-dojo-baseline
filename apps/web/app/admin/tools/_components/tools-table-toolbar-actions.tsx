"use client"

import type { Table } from "@tanstack/react-table"
import { TrashIcon } from "lucide-react"
import type { Tool } from "~/.generated/prisma/browser"
import { ToolsDeleteDialog } from "~/app/admin/tools/_components/tools-delete-dialog"
import { Button } from "~/components/common/button"

interface ToolsTableToolbarActionsProps {
  table: Table<Tool>
}

export function ToolsTableToolbarActions({ table }: ToolsTableToolbarActionsProps) {
  const { rows } = table.getFilteredSelectedRowModel()

  if (!rows.length) {
    return null
  }

  return (
    <ToolsDeleteDialog tools={rows.map(row => row.original)}>
      <Button variant="secondary" size="md" prefix={<TrashIcon />}>
        Delete ({rows.length})
      </Button>
    </ToolsDeleteDialog>
  )
}
