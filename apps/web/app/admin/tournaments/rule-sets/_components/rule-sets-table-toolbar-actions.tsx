"use client"

import type { Table } from "@tanstack/react-table"
import { TrashIcon } from "lucide-react"
import { RuleSetsDeleteDialog } from "~/app/admin/tournaments/rule-sets/_components/rule-sets-delete-dialog"
import { Button } from "~/components/common/button"
import type { findRuleSetsPaginated } from "~/server/admin/tournaments/queries"

type RuleSetRow = Awaited<ReturnType<typeof findRuleSetsPaginated>>["ruleSets"][number]

interface RuleSetsTableToolbarActionsProps {
  table: Table<RuleSetRow>
}

export function RuleSetsTableToolbarActions({ table }: RuleSetsTableToolbarActionsProps) {
  const { rows } = table.getFilteredSelectedRowModel()

  if (!rows.length) {
    return null
  }

  const deletableRuleSets = rows.map(row => row.original).filter(r => !r.isSystem)

  if (!deletableRuleSets.length) {
    return null
  }

  return (
    <RuleSetsDeleteDialog ruleSets={deletableRuleSets}>
      <Button variant="secondary" size="md" prefix={<TrashIcon />}>
        Delete ({deletableRuleSets.length})
      </Button>
    </RuleSetsDeleteDialog>
  )
}
