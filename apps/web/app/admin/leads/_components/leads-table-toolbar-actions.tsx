"use client"

import type { Table } from "@tanstack/react-table"
import { TrashIcon } from "lucide-react"
import { LeadsDeleteDialog } from "~/app/admin/leads/_components/leads-delete-dialog"
import { Button } from "~/components/common/button"
import type { LeadRow } from "~/server/admin/leads/queries"

interface LeadsTableToolbarActionsProps {
  table: Table<LeadRow>
}

export function LeadsTableToolbarActions({ table }: LeadsTableToolbarActionsProps) {
  const { rows } = table.getFilteredSelectedRowModel()

  if (!rows.length) {
    return null
  }

  return (
    <LeadsDeleteDialog leads={rows.map(row => row.original)}>
      <Button variant="secondary" size="md" prefix={<TrashIcon />}>
        Delete ({rows.length})
      </Button>
    </LeadsDeleteDialog>
  )
}
