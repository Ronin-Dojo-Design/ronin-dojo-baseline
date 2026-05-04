"use client"

import { useMemo, useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { updateRegistrationStatus, bulkUpdateRegistrationStatus } from "~/server/admin/tournaments/actions"
import type { RegistrationStatus } from "~/.generated/prisma/browser"
import { DataTable } from "~/components/data-table/data-table"
import { DataTableHeader } from "~/components/data-table/data-table-header"
import { Button } from "~/components/common/button"
import { getRegistrationColumns, type RegistrationRow } from "~/components/admin/tournaments/registrations-table-columns"

interface RegistrationsTableProps {
  registrations: RegistrationRow[]
  tournamentName: string
}

export function RegistrationsTable({ registrations, tournamentName }: RegistrationsTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleStatusUpdate = (registrationId: string, status: string) => {
    setError(null)
    startTransition(async () => {
      try {
        await updateRegistrationStatus({ registrationId, status: status as RegistrationStatus })
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to update status")
      }
    })
  }

  const columns = useMemo(() => getRegistrationColumns({ onStatusUpdate: handleStatusUpdate, isPending }), [isPending])

  const table = useReactTable({
    data: registrations,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    enableRowSelection: true,
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedIds = selectedRows.map((r) => r.original.id)

  const handleBulkUpdate = (status: string) => {
    if (selectedIds.length === 0) return
    setError(null)
    startTransition(async () => {
      try {
        await bulkUpdateRegistrationStatus({
          registrationIds: selectedIds,
          status: status as RegistrationStatus,
        })
        table.resetRowSelection()
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to bulk update")
      }
    })
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <DataTable
        table={table}
        floatingBar={
          selectedIds.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{selectedIds.length} selected</span>
              <Button size="sm" variant="primary" onClick={() => handleBulkUpdate("APPROVED")} disabled={isPending}>
                Approve
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleBulkUpdate("WAITLISTED")} disabled={isPending}>
                Waitlist
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleBulkUpdate("CANCELLED")} disabled={isPending}>
                Cancel
              </Button>
            </div>
          ) : null
        }
      >
        <DataTableHeader title="Registrations" total={registrations.length} />
      </DataTable>
    </div>
  )
}
