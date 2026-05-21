"use client"

import { PlusIcon } from "lucide-react"
import { useQueryStates } from "nuqs"
import { use, useMemo } from "react"
import type { Tournament } from "~/.generated/prisma/browser"
import { getColumns } from "~/app/admin/tournaments/_components/tournaments-table-columns"
import { TournamentsTableToolbarActions } from "~/app/admin/tournaments/_components/tournaments-table-toolbar-actions"
import { DateRangePicker } from "~/components/admin/date-range-picker"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { DataTable } from "~/components/data-table/data-table"
import { DataTableHeader } from "~/components/data-table/data-table-header"
import { DataTableToolbar } from "~/components/data-table/data-table-toolbar"
import { DataTableViewOptions } from "~/components/data-table/data-table-view-options"
import { useDataTable } from "~/hooks/use-data-table"
import type { findTournaments } from "~/server/admin/tournaments/queries"
import { tournamentsTableParamsSchema } from "~/server/admin/tournaments/schema"
import type { DataTableFilterField } from "~/types"

type TournamentsTableProps = {
  tournamentsPromise: ReturnType<typeof findTournaments>
}

export function TournamentsTable({ tournamentsPromise }: TournamentsTableProps) {
  const { tournaments, total, pageCount } = use(tournamentsPromise)
  const [{ perPage, sort }] = useQueryStates(tournamentsTableParamsSchema)

  const columns = useMemo(() => getColumns(), [])

  const filterFields: DataTableFilterField<Tournament>[] = [
    {
      id: "name",
      label: "Name",
      placeholder: "Filter by name...",
    },
  ]

  const { table } = useDataTable({
    data: tournaments,
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
        title="Tournaments"
        total={total}
        callToAction={
          <Button
            variant="primary"
            size="md"
            prefix={<PlusIcon />}
            render={<Link href="/admin/tournaments/new" />}
          >
            <div className="max-sm:sr-only">New tournament</div>
          </Button>
        }
      >
        <DataTableToolbar table={table} filterFields={filterFields}>
          <TournamentsTableToolbarActions table={table} />
          <DateRangePicker align="end" />
          <DataTableViewOptions table={table} />
        </DataTableToolbar>
      </DataTableHeader>
    </DataTable>
  )
}
