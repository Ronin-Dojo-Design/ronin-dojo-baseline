"use client"

import type { Table } from "@tanstack/react-table"
import { TrashIcon } from "lucide-react"
import { PricingPlansDeleteDialog } from "~/app/app/pricing-plans/_components/pricing-plans-delete-dialog"
import { Button } from "~/components/common/button"
import type { findPricingPlans } from "~/server/admin/pricing-plans/queries"

type PricingPlanRow = Awaited<ReturnType<typeof findPricingPlans>>["pricingPlans"][number]

interface PricingPlansTableToolbarActionsProps {
  table: Table<PricingPlanRow>
}

export function PricingPlansTableToolbarActions({ table }: PricingPlansTableToolbarActionsProps) {
  const { rows } = table.getFilteredSelectedRowModel()

  if (!rows.length) {
    return null
  }

  return (
    <PricingPlansDeleteDialog pricingPlans={rows.map(row => row.original)}>
      <Button variant="secondary" size="md" prefix={<TrashIcon />}>
        Delete ({rows.length})
      </Button>
    </PricingPlansDeleteDialog>
  )
}
