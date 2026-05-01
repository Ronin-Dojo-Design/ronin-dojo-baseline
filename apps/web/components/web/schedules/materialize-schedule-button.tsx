"use client"

import { CalendarSyncIcon } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { materializeSchedule } from "~/server/web/schedule/actions"

interface MaterializeScheduleButtonProps {
  scheduleId: string
}

export const MaterializeScheduleButton = ({ scheduleId }: MaterializeScheduleButtonProps) => {
  const action = useAction(materializeSchedule, {
    onSuccess: ({ data }) => {
      if (!data) return
      const { created, refreshed, cancelled, deleted } = data
      toast.success(
        `Sessions: +${created} created · ${refreshed} refreshed · ${cancelled} cancelled · ${deleted} pruned`,
      )
    },
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to generate sessions"),
  })

  return (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      prefix={<CalendarSyncIcon />}
      isPending={action.isPending}
      onClick={() => action.execute({ id: scheduleId })}
    >
      Generate sessions
    </Button>
  )
}
