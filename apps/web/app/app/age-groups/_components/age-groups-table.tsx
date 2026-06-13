"use client"

import { PlusIcon } from "lucide-react"
import { useQueryStates } from "nuqs"
import { use, useMemo } from "react"
import type { AgeGroup } from "~/.generated/prisma/browser"
import { getColumns } from "~/app/app/age-groups/_components/age-groups-table-columns"
import { DateRangePicker } from "~/components/admin/date-range-picker"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { DataTable } from "~/components/data-table/data-table"
import { DataTableHeader } from "~/components/data-table/data-table-header"
import { DataTableToolbar } from "~/components/data-table/data-table-toolbar"
import { DataTableViewOptions } from "~/components/data-table/data-table-view-options"
import { useDataTable } from "~/hooks/use-data-table"
import type { findAgeGroups } from "~/server/admin/age-groups/queries"
import { ageGroupsTableParamsSchema } from "~/server/admin/age-groups/schema"
import type { DataTableFilterField } from "~/types"

type AgeGroupsTableProps = {
  ageGroupsPromise: ReturnType<typeof findAgeGroups>
}

export function AgeGroupsTable({ ageGroupsPromise }: AgeGroupsTableProps) {
  const { ageGroups, ageGroupsTotal, pageCount } = use(ageGroupsPromise)
  const [{ perPage, sort }] = useQueryStates(ageGroupsTableParamsSchema)

  const columns = useMemo(() => getColumns(), [])

  const filterFields: DataTableFilterField<AgeGroup>[] = [
    {
      id: "name",
      label: "Name",
      placeholder: "Filter by name...",
    },
  ]

  const { table } = useDataTable({
    data: ageGroups,
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
        title="Age Groups"
        total={ageGroupsTotal}
        callToAction={
          <Button
            variant="primary"
            size="md"
            prefix={<PlusIcon />}
            render={<Link href="/app/age-groups/new" />}
          >
            <div className="max-sm:sr-only">New age group</div>
          </Button>
        }
      >
        <DataTableToolbar table={table} filterFields={filterFields}>
          <DateRangePicker align="end" />
          <DataTableViewOptions table={table} />
        </DataTableToolbar>
      </DataTableHeader>
    </DataTable>
  )
}
