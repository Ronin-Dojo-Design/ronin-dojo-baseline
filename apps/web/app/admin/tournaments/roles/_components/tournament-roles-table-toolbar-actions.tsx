"use client"

import type { Table } from "@tanstack/react-table"
import { TrashIcon } from "lucide-react"
import { TournamentRolesDeleteDialog } from "~/app/admin/tournaments/roles/_components/tournament-roles-delete-dialog"
import { Button } from "~/components/common/button"
import type { findTournamentRolesPaginated } from "~/server/admin/tournaments/queries"

type TournamentRoleWithCount = Awaited<ReturnType<typeof findTournamentRolesPaginated>>["roles"][number]

interface TournamentRolesTableToolbarActionsProps {
  table: Table<TournamentRoleWithCount>
}

export function TournamentRolesTableToolbarActions({ table }: TournamentRolesTableToolbarActionsProps) {
  const { rows } = table.getFilteredSelectedRowModel()

  if (!rows.length) {
    return null
  }

  // Filter out system roles — they can't be deleted
  const deletableRoles = rows.map(row => row.original).filter(r => !r.isSystem)

  if (!deletableRoles.length) {
    return null
  }

  return (
    <TournamentRolesDeleteDialog roles={deletableRoles}>
      <Button variant="secondary" size="md" prefix={<TrashIcon />}>
        Delete ({deletableRoles.length})
      </Button>
    </TournamentRolesDeleteDialog>
  )
}
