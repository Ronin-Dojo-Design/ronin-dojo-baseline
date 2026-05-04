"use client"

import { PlusIcon } from "lucide-react"
import { useQueryStates } from "nuqs"
import { use, useMemo } from "react"
import { getColumns } from "~/app/admin/pricing-plans/_components/pricing-plans-table-columns"
import { PricingPlansTableToolbarActions } from "~/app/admin/pricing-plans/_components/pricing-plans-table-toolbar-actions"
import { DateRangePicker } from "~/components/admin/date-range-picker"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { DataTable } from "~/components/data-table/data-table"
import { DataTableHeader } from "~/components/data-table/data-table-header"
import { DataTableToolbar } from "~/components/data-table/data-table-toolbar"
import { DataTableViewOptions } from "~/components/data-table/data-table-view-options"
import { useDataTable } from "~/hooks/use-data-table"
import type { findPricingPlans } from "~/server/admin/pricing-plans/queries"
import { pricingPlansTableParamsSchema } from "~/server/admin/pricing-plans/schema"
import type { DataTableFilterField } from "~/types"

type PricingPlansTableProps = {
  pricingPlansPromise: ReturnType<typeof findPricingPlans>
}

type PricingPlanRow = Awaited<ReturnType<typeof findPricingPlans>>["pricingPlans"][number]

export function PricingPlansTable({ pricingPlansPromise }: PricingPlansTableProps) {
  const { pricingPlans, pricingPlansTotal, pageCount } = use(pricingPlansPromise)
  const [{ perPage, sort }] = useQueryStates(pricingPlansTableParamsSchema)

  const columns = useMemo(() => getColumns(), [])

  const filterFields: DataTableFilterField<PricingPlanRow>[] = [
    {
      id: "name",
      label: "Name",
      placeholder: "Filter by name...",
    },
  ]

  const { table } = useDataTable({
    data: pricingPlans,
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
        title="Pricing Plans"
        total={pricingPlansTotal}
        callToAction={
          <Button size="md" variant="primary" prefix={<PlusIcon />} asChild>
            <Link href="/admin/pricing-plans/new">New pricing plan</Link>
          </Button>
        }
      />

      <DataTableToolbar table={table} filterFields={filterFields}>
        <PricingPlansTableToolbarActions table={table} />
        <DateRangePicker align="end" />
        <DataTableViewOptions table={table} />
      </DataTableToolbar>
    </DataTable>
  )
}
