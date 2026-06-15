"use client"

import type { Table } from "@tanstack/react-table"
import { TrashIcon } from "lucide-react"
import { SubscriptionTiersDeleteDialog } from "~/app/app/subscription-tiers/_components/subscription-tiers-delete-dialog"
import type { SubscriptionTierRow } from "~/app/app/subscription-tiers/_components/subscription-tiers-table-columns"
import { Button } from "~/components/common/button"

interface SubscriptionTiersTableToolbarActionsProps {
  table: Table<SubscriptionTierRow>
}

export function SubscriptionTiersTableToolbarActions({
  table,
}: SubscriptionTiersTableToolbarActionsProps) {
  const { rows } = table.getFilteredSelectedRowModel()

  if (!rows.length) {
    return null
  }

  return (
    <SubscriptionTiersDeleteDialog tiers={rows.map(row => row.original)}>
      <Button variant="secondary" size="md" prefix={<TrashIcon />}>
        Delete ({rows.length})
      </Button>
    </SubscriptionTiersDeleteDialog>
  )
}
