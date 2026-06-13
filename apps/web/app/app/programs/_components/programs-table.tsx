"use client"

import { PlusIcon } from "lucide-react"
import { useQueryStates } from "nuqs"
import { use, useMemo } from "react"
import type { Program } from "~/.generated/prisma/browser"
import { getColumns } from "~/app/app/programs/_components/programs-table-columns"
import { ProgramsTableToolbarActions } from "~/app/app/programs/_components/programs-table-toolbar-actions"
import { DateRangePicker } from "~/components/admin/date-range-picker"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { DataTable } from "~/components/data-table/data-table"
import { DataTableHeader } from "~/components/data-table/data-table-header"
import { DataTableToolbar } from "~/components/data-table/data-table-toolbar"
import { DataTableViewOptions } from "~/components/data-table/data-table-view-options"
import { useDataTable } from "~/hooks/use-data-table"
import type { findPrograms } from "~/server/admin/programs/queries"
import { programsTableParamsSchema } from "~/server/admin/programs/schema"
import type { DataTableFilterField } from "~/types"

type ProgramsTableProps = {
  programsPromise: ReturnType<typeof findPrograms>
}

export function ProgramsTable({ programsPromise }: ProgramsTableProps) {
  const { programs, total, pageCount } = use(programsPromise)
  const [{ perPage, sort }] = useQueryStates(programsTableParamsSchema)

  const columns = useMemo(() => getColumns(), [])

  const filterFields: DataTableFilterField<Program>[] = [
    {
      id: "name",
      label: "Name",
      placeholder: "Filter by name...",
    },
  ]

  const { table } = useDataTable({
    data: programs,
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
    getRowId: originalRow => originalRow.id,
  })

  return (
    <DataTable table={table}>
      <DataTableHeader
        title="Programs"
        total={total}
        callToAction={
          <Button
            variant="primary"
            size="md"
            prefix={<PlusIcon />}
            render={<Link href="/app/programs/new" />}
          >
            <div className="max-sm:sr-only">New program</div>
          </Button>
        }
      >
        <DataTableToolbar table={table} filterFields={filterFields}>
          <ProgramsTableToolbarActions table={table} />
          <DateRangePicker align="end" />
          <DataTableViewOptions table={table} />
        </DataTableToolbar>
      </DataTableHeader>
    </DataTable>
  )
}
