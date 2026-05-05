"use client"

import { PlusIcon } from "lucide-react"
import { useQueryStates } from "nuqs"
import { use, useMemo } from "react"
import { getColumns } from "~/app/admin/tournaments/rule-sets/_components/rule-sets-table-columns"
import { RuleSetsTableToolbarActions } from "~/app/admin/tournaments/rule-sets/_components/rule-sets-table-toolbar-actions"
import { DateRangePicker } from "~/components/admin/date-range-picker"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { DataTable } from "~/components/data-table/data-table"
import { DataTableHeader } from "~/components/data-table/data-table-header"
import { DataTableToolbar } from "~/components/data-table/data-table-toolbar"
import { DataTableViewOptions } from "~/components/data-table/data-table-view-options"
import { useDataTable } from "~/hooks/use-data-table"
import type { findRuleSetsPaginated } from "~/server/admin/tournaments/queries"
import { ruleSetsTableParamsSchema } from "~/server/admin/tournaments/schema"
import type { DataTableFilterField } from "~/types"

type RuleSetRow = Awaited<ReturnType<typeof findRuleSetsPaginated>>["ruleSets"][number]

type RuleSetsTableProps = {
  ruleSetsPromise: ReturnType<typeof findRuleSetsPaginated>
}

export function RuleSetsTable({ ruleSetsPromise }: RuleSetsTableProps) {
  const { ruleSets, total, pageCount } = use(ruleSetsPromise)
  const [{ perPage, sort }] = useQueryStates(ruleSetsTableParamsSchema)

  const columns = useMemo(() => getColumns(), [])

  const filterFields: DataTableFilterField<RuleSetRow>[] = [
    {
      id: "name",
      label: "Name",
      placeholder: "Filter by name...",
    },
  ]

  const { table } = useDataTable({
    data: ruleSets,
    columns,
    pageCount,
    filterFields,
    shallow: false,
    clearOnDefault: true,
    initialState: {
      pagination: { pageIndex: 0, pageSize: perPage },
      sorting: sort,
      columnPinning: { right: ["actions"] },
    },
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`,
  })

  return (
    <DataTable table={table}>
      <DataTableHeader
        title="Rule Sets"
        total={total}
        callToAction={
          <Button variant="primary" size="md" prefix={<PlusIcon />} asChild>
            <Link href="/admin/tournaments/rule-sets/new">
              <div className="max-sm:sr-only">New rule set</div>
            </Link>
          </Button>
        }
      >
        <DataTableToolbar table={table} filterFields={filterFields}>
          <RuleSetsTableToolbarActions table={table} />
          <DateRangePicker align="end" />
          <DataTableViewOptions table={table} />
        </DataTableToolbar>
      </DataTableHeader>
    </DataTable>
  )
}
