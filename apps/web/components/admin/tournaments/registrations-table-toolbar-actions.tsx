"use client"

import type { Table } from "@tanstack/react-table"
import { CheckCircleIcon, ClockIcon, XCircleIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import type { RegistrationRow } from "~/components/admin/tournaments/registrations-table-columns"
import { Button } from "~/components/common/button"
import { Stack } from "~/components/common/stack"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/common/tooltip"
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

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="primary"
              size="sm"
              prefix={<CheckCircleIcon />}
              onClick={() => handleBulkUpdate("APPROVED")}
              disabled={isPending}
            >
              Approve
            </Button>
          }
        />
        <TooltipContent>Approve selected</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="secondary"
              size="sm"
              prefix={<ClockIcon />}
              onClick={() => handleBulkUpdate("WAITLISTED")}
              disabled={isPending}
            >
              Waitlist
            </Button>
          }
        />
        <TooltipContent>Waitlist selected</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="destructive"
              size="sm"
              prefix={<XCircleIcon />}
              onClick={() => handleBulkUpdate("CANCELLED")}
              disabled={isPending}
            >
              Cancel
            </Button>
          }
        />
        <TooltipContent>Cancel selected</TooltipContent>
      </Tooltip>
    </Stack>
  )
}
