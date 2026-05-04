"use client"

import { PlusIcon } from "lucide-react"
import { useQueryStates } from "nuqs"
import { use, useMemo } from "react"
import {
  type EntitlementRow,
  getColumns,
} from "~/app/admin/entitlements/_components/entitlements-table-columns"
import { EntitlementsTableToolbarActions } from "~/app/admin/entitlements/_components/entitlements-table-toolbar-actions"
import { DateRangePicker } from "~/components/admin/date-range-picker"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { DataTable } from "~/components/data-table/data-table"
import { DataTableHeader } from "~/components/data-table/data-table-header"
import { DataTableToolbar } from "~/components/data-table/data-table-toolbar"
import { DataTableViewOptions } from "~/components/data-table/data-table-view-options"
import { useDataTable } from "~/hooks/use-data-table"
import type { findEntitlements } from "~/server/admin/entitlements/queries"
import { entitlementsTableParamsSchema } from "~/server/admin/entitlements/schema"
import type { DataTableFilterField } from "~/types"

type EntitlementsTableProps = {
  entitlementsPromise: ReturnType<typeof findEntitlements>
}

export function EntitlementsTable({ entitlementsPromise }: EntitlementsTableProps) {
  const { entitlements, entitlementsTotal, pageCount } = use(entitlementsPromise)
  const [{ perPage, sort }] = useQueryStates(entitlementsTableParamsSchema)

  const columns = useMemo(() => getColumns(), [])

  const filterFields: DataTableFilterField<EntitlementRow>[] = [
    {
      id: "name",
      label: "Name",
      placeholder: "Filter by name...",
    },
  ]

  const { table } = useDataTable({
    data: entitlements,
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
        title="Entitlements"
        total={entitlementsTotal}
        callToAction={
          <Button variant="primary" size="md" prefix={<PlusIcon />} asChild>
            <Link href="/admin/entitlements/new">
              <div className="max-sm:sr-only">New entitlement</div>
            </Link>
          </Button>
        }
      >
        <DataTableToolbar table={table} filterFields={filterFields}>
          <EntitlementsTableToolbarActions table={table} />
          <DateRangePicker align="end" />
          <DataTableViewOptions table={table} />
        </DataTableToolbar>
      </DataTableHeader>
    </DataTable>
  )
}
