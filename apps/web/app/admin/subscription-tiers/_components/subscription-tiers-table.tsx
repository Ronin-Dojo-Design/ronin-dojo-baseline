"use client"

import { PlusIcon } from "lucide-react"
import { useQueryStates } from "nuqs"
import { use, useMemo } from "react"
import {
  type SubscriptionTierRow,
  getColumns,
} from "~/app/admin/subscription-tiers/_components/subscription-tiers-table-columns"
import { SubscriptionTiersTableToolbarActions } from "~/app/admin/subscription-tiers/_components/subscription-tiers-table-toolbar-actions"
import { DateRangePicker } from "~/components/admin/date-range-picker"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { DataTable } from "~/components/data-table/data-table"
import { DataTableHeader } from "~/components/data-table/data-table-header"
import { DataTableToolbar } from "~/components/data-table/data-table-toolbar"
import { DataTableViewOptions } from "~/components/data-table/data-table-view-options"
import { useDataTable } from "~/hooks/use-data-table"
import type { findSubscriptionTiers } from "~/server/admin/subscription-tiers/queries"
import { subscriptionTiersTableParamsSchema } from "~/server/admin/subscription-tiers/schema"
import type { DataTableFilterField } from "~/types"

type SubscriptionTiersTableProps = {
  tiersPromise: ReturnType<typeof findSubscriptionTiers>
}

export function SubscriptionTiersTable({ tiersPromise }: SubscriptionTiersTableProps) {
  const { tiers, tiersTotal, pageCount } = use(tiersPromise)
  const [{ perPage, sort }] = useQueryStates(subscriptionTiersTableParamsSchema)

  const columns = useMemo(() => getColumns(), [])

  const filterFields: DataTableFilterField<SubscriptionTierRow>[] = [
    {
      id: "name",
      label: "Name",
      placeholder: "Filter by name...",
    },
  ]

  const { table } = useDataTable({
    data: tiers,
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
        title="Subscription Tiers"
        total={tiersTotal}
        callToAction={
          <Button variant="primary" size="md" prefix={<PlusIcon />} asChild>
            <Link href="/admin/subscription-tiers/new">
              <div className="max-sm:sr-only">New tier</div>
            </Link>
          </Button>
        }
      >
        <DataTableToolbar table={table} filterFields={filterFields}>
          <SubscriptionTiersTableToolbarActions table={table} />
          <DateRangePicker align="end" />
          <DataTableViewOptions table={table} />
        </DataTableToolbar>
      </DataTableHeader>
    </DataTable>
  )
}
