"use client"

import { useMemo } from "react"
import type { RegistrationRow } from "~/components/admin/tournaments/registrations-table-columns"
import { getRegistrationColumns } from "~/components/admin/tournaments/registrations-table-columns"
import { RegistrationsTableToolbarActions } from "~/components/admin/tournaments/registrations-table-toolbar-actions"
import { DataTable } from "~/components/data-table/data-table"
import { DataTableHeader } from "~/components/data-table/data-table-header"
import { DataTableToolbar } from "~/components/data-table/data-table-toolbar"
import { DataTableViewOptions } from "~/components/data-table/data-table-view-options"
import { useDataTable } from "~/hooks/use-data-table"
import type { DataTableFilterField } from "~/types"

interface RegistrationsTableProps {
  registrations: RegistrationRow[]
  tournamentName: string
  tournamentId: string
  divisions: Array<{ id: string; name: string; roleRequiredId: string | null }>
  roles: Array<{ id: string; name: string }>
  users: Array<{ id: string; name: string | null; email: string }>
}

export function RegistrationsTable({
  registrations,
  tournamentName: _tournamentName,
  tournamentId,
  divisions,
  roles,
  users,
}: RegistrationsTableProps) {
  const columns = useMemo(() => getRegistrationColumns(), [])

  const filterFields: DataTableFilterField<RegistrationRow>[] = [
    {
      id: "user.name" as any,
      label: "Name",
      placeholder: "Filter by name...",
    },
  ]

  const { table } = useDataTable({
    data: registrations,
    columns,
    pageCount: 1,
    filterFields,
    shallow: true,
    clearOnDefault: true,
    initialState: {
      pagination: { pageIndex: 0, pageSize: registrations.length },
      sorting: [{ id: "createdAt", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: row => row.id,
  })

  return (
    <DataTable table={table}>
      <DataTableHeader title="Registrations" total={registrations.length}>
        <DataTableToolbar table={table} filterFields={filterFields}>
          <RegistrationsTableToolbarActions
            table={table}
            tournamentId={tournamentId}
            divisions={divisions}
            roles={roles}
            users={users}
          />
          <DataTableViewOptions table={table} />
        </DataTableToolbar>
      </DataTableHeader>
    </DataTable>
  )
}
