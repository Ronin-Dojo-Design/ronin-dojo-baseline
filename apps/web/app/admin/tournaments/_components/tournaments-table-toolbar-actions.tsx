"use client"

import type { Table } from "@tanstack/react-table"
import { TrashIcon } from "lucide-react"
import type { TournamentRow } from "~/app/admin/tournaments/_components/tournaments-table-columns"
import { TournamentsDeleteDialog } from "~/app/admin/tournaments/_components/tournaments-delete-dialog"
import { Button } from "~/components/common/button"

interface TournamentsTableToolbarActionsProps {
  table: Table<TournamentRow>
}

export function TournamentsTableToolbarActions({ table }: TournamentsTableToolbarActionsProps) {
  const { rows } = table.getFilteredSelectedRowModel()

  if (!rows.length) {
    return null
  }

  return (
    <TournamentsDeleteDialog tournaments={rows.map(row => row.original)}>
      <Button variant="secondary" size="md" prefix={<TrashIcon />}>
        Delete ({rows.length})
      </Button>
    </TournamentsDeleteDialog>
  )
}
