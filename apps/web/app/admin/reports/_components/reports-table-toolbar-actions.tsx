"use client"

import type { Table } from "@tanstack/react-table"
import { TrashIcon } from "lucide-react"
import type { Report } from "~/.generated/prisma/browser"
import { Button } from "~/components/common/button"
import { ReportsDeleteDialog } from "./reports-delete-dialog"

interface ReportsTableToolbarActionsProps {
  table: Table<Report>
}

export const ReportsTableToolbarActions = ({ table }: ReportsTableToolbarActionsProps) => {
  const { rows } = table.getFilteredSelectedRowModel()

  if (!rows.length) {
    return null
  }

  return (
    <ReportsDeleteDialog reports={rows.map(row => row.original)}>
      <Button variant="secondary" size="md" prefix={<TrashIcon />}>
        Delete ({rows.length})
      </Button>
    </ReportsDeleteDialog>
  )
}
