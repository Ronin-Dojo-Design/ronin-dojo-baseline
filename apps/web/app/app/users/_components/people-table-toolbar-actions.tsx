"use client"

import type { Table } from "@tanstack/react-table"
import { TrashIcon } from "lucide-react"
import { Button } from "~/components/common/button"
import type { PersonRow } from "~/server/admin/people/queries"
import { PeopleDeleteDialog } from "./people-delete-dialog"

interface PeopleTableToolbarActionsProps {
  table: Table<PersonRow>
}

/**
 * Bulk actions for the People list. Delete is account-only, so it collects the linked
 * account ids of the selected rows — accountless placeholders can't be selected (see the
 * row-select gate in the columns), so every selected row has a `user` here.
 */
export function PeopleTableToolbarActions({ table }: PeopleTableToolbarActionsProps) {
  const { rows } = table.getFilteredSelectedRowModel()
  const userIds = rows.map(row => row.original.user?.id).filter((id): id is string => id != null)

  if (!userIds.length) {
    return null
  }

  return (
    <PeopleDeleteDialog userIds={userIds}>
      <Button variant="secondary" size="md" prefix={<TrashIcon />}>
        Delete ({userIds.length})
      </Button>
    </PeopleDeleteDialog>
  )
}
