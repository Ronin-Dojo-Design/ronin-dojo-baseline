"use client"

import { PlusIcon } from "lucide-react"
import { useQueryStates } from "nuqs"
import { use, useMemo } from "react"
import {
  type SubscriptionRow,
  getColumns,
} from "~/app/admin/subscriptions/_components/subscriptions-table-columns"
import { SubscriptionsTableToolbarActions } from "~/app/admin/subscriptions/_components/subscriptions-table-toolbar-actions"
import { DateRangePicker } from "~/components/admin/date-range-picker"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { DataTable } from "~/components/data-table/data-table"
import { DataTableHeader } from "~/components/data-table/data-table-header"
import { DataTableToolbar } from "~/components/data-table/data-table-toolbar"
import { DataTableViewOptions } from "~/components/data-table/data-table-view-options"
import { useDataTable } from "~/hooks/use-data-table"
import type { findSubscriptions } from "~/server/admin/subscriptions/queries"
import { subscriptionsTableParamsSchema } from "~/server/admin/subscriptions/schema"
import type { DataTableFilterField } from "~/types"

type SubscriptionsTableProps = {
  subscriptionsPromise: ReturnType<typeof findSubscriptions>
}

export function SubscriptionsTable({ subscriptionsPromise }: SubscriptionsTableProps) {
  const { subscriptions, subscriptionsTotal, pageCount } = use(subscriptionsPromise)
  const [{ perPage, sort }] = useQueryStates(subscriptionsTableParamsSchema)

  const columns = useMemo(() => getColumns(), [])

  const filterFields: DataTableFilterField<SubscriptionRow>[] = [
    {
      id: "user.name" as any,
      label: "User",
      placeholder: "Filter by user...",
    },
  ]

  const { table } = useDataTable({
    data: subscriptions,
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
        title="Subscriptions"
        total={subscriptionsTotal}
        callToAction={
          <Button variant="primary" size="md" prefix={<PlusIcon />} asChild>
            <Link href="/admin/subscriptions/new">
              <div className="max-sm:sr-only">New subscription</div>
            </Link>
          </Button>
        }
      >
        <DataTableToolbar table={table} filterFields={filterFields}>
          <SubscriptionsTableToolbarActions table={table} />
          <DateRangePicker align="end" />
          <DataTableViewOptions table={table} />
        </DataTableToolbar>
      </DataTableHeader>
    </DataTable>
  )
}
