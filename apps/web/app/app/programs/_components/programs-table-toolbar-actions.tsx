"use client"

import type { Table } from "@tanstack/react-table"
import { TrashIcon } from "lucide-react"
import { ProgramsDeleteDialog } from "~/app/app/programs/_components/programs-delete-dialog"
import type { ProgramRow } from "~/app/app/programs/_components/programs-table-columns"
import { Button } from "~/components/common/button"

interface ProgramsTableToolbarActionsProps {
  table: Table<ProgramRow>
}

export function ProgramsTableToolbarActions({ table }: ProgramsTableToolbarActionsProps) {
  const { rows } = table.getFilteredSelectedRowModel()

  if (!rows.length) {
    return null
  }

  return (
    <ProgramsDeleteDialog programs={rows.map(row => row.original)}>
      <Button variant="secondary" size="md" prefix={<TrashIcon />}>
        Delete ({rows.length})
      </Button>
    </ProgramsDeleteDialog>
  )
}
