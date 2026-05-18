"use client"

import type { Table } from "@tanstack/react-table"
import { CheckCircleIcon, ClockIcon, XCircleIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import type { RegistrationRow } from "~/components/admin/tournaments/registrations-table-columns"
import { Button } from "~/components/common/button"
import { Stack } from "~/components/common/stack"
import { Tooltip } from "~/components/common/tooltip"
import { bulkUpdateRegistrationStatus } from "~/server/admin/tournaments/actions"

interface RegistrationsTableToolbarActionsProps {
  table: Table<RegistrationRow>
}

export function RegistrationsTableToolbarActions({ table }: RegistrationsTableToolbarActionsProps) {
  const router = useRouter()
  const { rows } = table.getFilteredSelectedRowModel()

  const { executeAsync, isPending } = useAction(bulkUpdateRegistrationStatus, {
    onSuccess: () => {
      table.resetRowSelection()
      router.refresh()
    },
  })

  if (!rows.length) return null

  const selectedIds = rows.map(r => r.original.id)

  const handleBulkUpdate = (status: string) => {
    toast.promise(
      async () => {
        const { serverError } = await executeAsync({
          registrationIds: selectedIds,
          status: status as any,
        })
        if (serverError) throw new Error(serverError)
      },
      {
        loading: `Updating ${selectedIds.length} registrations...`,
        success: `${selectedIds.length} registrations updated`,
        error: err => `Failed: ${err.message}`,
      },
    )
  }

  return (
    <Stack direction="row" size="xs" className="items-center">
      <span className="text-sm font-medium text-muted-foreground">{rows.length} selected</span>

      <Tooltip tooltip="Approve selected">
        <Button
          variant="primary"
          size="sm"
          prefix={<CheckCircleIcon />}
          onClick={() => handleBulkUpdate("APPROVED")}
          disabled={isPending}
        >
          Approve
        </Button>
      </Tooltip>

      <Tooltip tooltip="Waitlist selected">
        <Button
          variant="secondary"
          size="sm"
          prefix={<ClockIcon />}
          onClick={() => handleBulkUpdate("WAITLISTED")}
          disabled={isPending}
        >
          Waitlist
        </Button>
      </Tooltip>

      <Tooltip tooltip="Cancel selected">
        <Button
          variant="destructive"
          size="sm"
          prefix={<XCircleIcon />}
          onClick={() => handleBulkUpdate("CANCELLED")}
          disabled={isPending}
        >
          Cancel
        </Button>
      </Tooltip>
    </Stack>
  )
}
