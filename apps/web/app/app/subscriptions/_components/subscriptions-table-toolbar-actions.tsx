"use client"

import type { Table } from "@tanstack/react-table"
import { TrashIcon } from "lucide-react"
import { SubscriptionsDeleteDialog } from "~/app/app/subscriptions/_components/subscriptions-delete-dialog"
import type { SubscriptionRow } from "~/app/app/subscriptions/_components/subscriptions-table-columns"
import { Button } from "~/components/common/button"

interface SubscriptionsTableToolbarActionsProps {
  table: Table<SubscriptionRow>
}

export function SubscriptionsTableToolbarActions({ table }: SubscriptionsTableToolbarActionsProps) {
  const { rows } = table.getFilteredSelectedRowModel()

  if (!rows.length) {
    return null
  }

  return (
    <SubscriptionsDeleteDialog subscriptions={rows.map(row => row.original)}>
      <Button variant="secondary" size="md" prefix={<TrashIcon />}>
        Delete ({rows.length})
      </Button>
    </SubscriptionsDeleteDialog>
  )
}
