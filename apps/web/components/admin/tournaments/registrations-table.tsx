"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { updateRegistrationStatus, bulkUpdateRegistrationStatus } from "~/server/admin/tournaments/actions"
import type { RegistrationStatus } from "~/.generated/prisma/browser"
import { DataTable } from "~/components/data-table/data-table"
import { DataTableHeader } from "~/components/data-table/data-table-header"
import { Button } from "~/components/common/button"
import { Stack } from "~/components/common/stack"
import { getRegistrationColumns, type RegistrationRow } from "~/components/admin/tournaments/registrations-table-columns"

interface RegistrationsTableProps {
  registrations: RegistrationRow[]
  tournamentName: string
}

export function RegistrationsTable({ registrations, tournamentName }: RegistrationsTableProps) {
  const router = useRouter()

  const statusAction = useAction(updateRegistrationStatus, {
    onSuccess: () => {
      toast.success("Registration status updated")
      router.refresh()
    },
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to update status"),
  })

  const bulkAction = useAction(bulkUpdateRegistrationStatus, {
    onSuccess: () => {
      toast.success("Registrations updated")
      table.resetRowSelection()
      router.refresh()
    },
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to bulk update"),
  })

  const isPending = statusAction.isPending || bulkAction.isPending

  const handleStatusUpdate = (registrationId: string, status: string) => {
    statusAction.execute({ registrationId, status: status as RegistrationStatus })
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
    bulkAction.execute({
      registrationIds: selectedIds,
      status: status as RegistrationStatus,
    })
  }

  return (
    <DataTable
      table={table}
      floatingBar={
        selectedIds.length > 0 ? (
          <Stack direction="row" size="sm" className="items-center">
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
          </Stack>
        ) : null
      }
    >
      <DataTableHeader title="Registrations" total={registrations.length} />
    </DataTable>
  )
}
