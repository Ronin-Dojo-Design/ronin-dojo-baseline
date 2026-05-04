"use client"

import type { Table } from "@tanstack/react-table"
import { TrashIcon } from "lucide-react"
import type { EntitlementRow } from "~/app/admin/entitlements/_components/entitlements-table-columns"
import { EntitlementsDeleteDialog } from "~/app/admin/entitlements/_components/entitlements-delete-dialog"
import { Button } from "~/components/common/button"

interface EntitlementsTableToolbarActionsProps {
  table: Table<EntitlementRow>
}

export function EntitlementsTableToolbarActions({
  table,
}: EntitlementsTableToolbarActionsProps) {
  const { rows } = table.getFilteredSelectedRowModel()

  if (!rows.length) {
    return null
  }

  return (
    <EntitlementsDeleteDialog entitlements={rows.map(row => row.original)}>
      <Button variant="secondary" size="md" prefix={<TrashIcon />}>
        Delete ({rows.length})
      </Button>
    </EntitlementsDeleteDialog>
  )
}
