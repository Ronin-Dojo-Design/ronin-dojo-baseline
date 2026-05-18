"use client"

import { PlusIcon } from "lucide-react"
import { useQueryStates } from "nuqs"
import { use, useMemo } from "react"
import { getColumns } from "~/app/admin/tournaments/roles/_components/tournament-roles-table-columns"
import { TournamentRolesTableToolbarActions } from "~/app/admin/tournaments/roles/_components/tournament-roles-table-toolbar-actions"
import { DateRangePicker } from "~/components/admin/date-range-picker"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { DataTable } from "~/components/data-table/data-table"
import { DataTableHeader } from "~/components/data-table/data-table-header"
import { DataTableToolbar } from "~/components/data-table/data-table-toolbar"
import { DataTableViewOptions } from "~/components/data-table/data-table-view-options"
import { useDataTable } from "~/hooks/use-data-table"
import type { findTournamentRolesPaginated } from "~/server/admin/tournaments/queries"
import { tournamentRolesTableParamsSchema } from "~/server/admin/tournaments/schema"
import type { DataTableFilterField } from "~/types"

type TournamentRoleWithCount = Awaited<
  ReturnType<typeof findTournamentRolesPaginated>
>["roles"][number]

type TournamentRolesTableProps = {
  rolesPromise: ReturnType<typeof findTournamentRolesPaginated>
}

export function TournamentRolesTable({ rolesPromise }: TournamentRolesTableProps) {
  const { roles, total, pageCount } = use(rolesPromise)
  const [{ perPage, sort }] = useQueryStates(tournamentRolesTableParamsSchema)

  const columns = useMemo(() => getColumns(), [])

  const filterFields: DataTableFilterField<TournamentRoleWithCount>[] = [
    {
      id: "name",
      label: "Name",
      placeholder: "Filter by name...",
    },
  ]

  const { table } = useDataTable({
    data: roles,
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
        title="Tournament Roles"
        total={total}
        callToAction={
          <Button variant="primary" size="md" prefix={<PlusIcon />} asChild>
            <Link href="/admin/tournaments/roles/new">
              <div className="max-sm:sr-only">New role</div>
            </Link>
          </Button>
        }
      >
        <DataTableToolbar table={table} filterFields={filterFields}>
          <TournamentRolesTableToolbarActions table={table} />
          <DateRangePicker align="end" />
          <DataTableViewOptions table={table} />
        </DataTableToolbar>
      </DataTableHeader>
    </DataTable>
  )
}
