"use client"

import {
  CalendarIcon,
  CheckCircleIcon,
  HeartPulseIcon,
  UserPlusIcon,
  XCircleIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { Stack } from "~/components/common/stack"
import { markLeadLost, markLeadNurture } from "~/server/admin/leads/actions"
import type { LeadDetail } from "~/server/admin/leads/queries"
import { bookTrial, completeTrial, convertLead } from "~/server/web/lead/actions"

type LeadStatusActionsProps = {
  lead: LeadDetail
}

export function LeadStatusActions({ lead }: LeadStatusActionsProps) {
  const router = useRouter()

  const refresh = () => router.refresh()

  const { executeAsync: execBookTrial, isPending: bookingPending } = useAction(bookTrial, {
    onSuccess: () => {
      toast.success("Trial booked")
      refresh()
    },
    onError: ({ error }) => toast.error(error.serverError),
  })

  const { executeAsync: execCompleteTrial, isPending: completePending } = useAction(completeTrial, {
    onSuccess: () => {
      toast.success("Trial completed")
      refresh()
    },
    onError: ({ error }) => toast.error(error.serverError),
  })

  const { executeAsync: execConvert, isPending: convertPending } = useAction(convertLead, {
    onSuccess: () => {
      toast.success("Lead converted to member")
      refresh()
    },
    onError: ({ error }) => toast.error(error.serverError),
  })

  const { executeAsync: execLost, isPending: lostPending } = useAction(markLeadLost, {
    onSuccess: () => {
      toast.success("Lead marked as lost")
      refresh()
    },
    onError: ({ error }) => toast.error(error.serverError),
  })

  const { executeAsync: execNurture, isPending: nurturePending } = useAction(markLeadNurture, {
    onSuccess: () => {
      toast.success("Lead moved to nurture")
      refresh()
    },
    onError: ({ error }) => toast.error(error.serverError),
  })

  const anyPending =
    bookingPending || completePending || convertPending || lostPending || nurturePending

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-muted-foreground">
          Status:{" "}
          <span className="font-semibold text-foreground">{lead.status.replace(/_/g, " ")}</span>
        </div>
      </div>

      <Stack size="sm" wrap>
        {/* NEW / CONTACTED / NURTURE → Book Trial */}
        {["NEW", "CONTACTED", "NURTURE"].includes(lead.status) && (
          <Button
            size="sm"
            variant="primary"
            prefix={<CalendarIcon className="size-4" />}
            isPending={bookingPending}
            disabled={anyPending}
            onClick={() => execBookTrial({ leadId: lead.id })}
          >
            Book Trial
          </Button>
        )}

        {/* TRIAL_BOOKED → Complete Trial */}
        {lead.status === "TRIAL_BOOKED" && (
          <Button
            size="sm"
            variant="primary"
            prefix={<CheckCircleIcon className="size-4" />}
            isPending={completePending}
            disabled={anyPending}
            onClick={() => execCompleteTrial({ leadId: lead.id })}
          >
            Complete Trial
          </Button>
        )}

        {/* TRIAL_COMPLETED → Convert */}
        {lead.status === "TRIAL_COMPLETED" && (
          <Button
            size="sm"
            variant="primary"
            prefix={<UserPlusIcon className="size-4" />}
            isPending={convertPending}
            disabled={anyPending}
            onClick={() => execConvert({ leadId: lead.id })}
          >
            Convert to Member
          </Button>
        )}

        {/* Any non-terminal → Nurture */}
        {!["CONVERTED", "NURTURE"].includes(lead.status) && (
          <Button
            size="sm"
            variant="secondary"
            prefix={<HeartPulseIcon className="size-4" />}
            isPending={nurturePending}
            disabled={anyPending}
            onClick={() => execNurture({ id: lead.id })}
          >
            Nurture
          </Button>
        )}

        {/* Any non-terminal → Mark Lost */}
        {!["CONVERTED", "LOST"].includes(lead.status) && (
          <Button
            size="sm"
            variant="secondary"
            prefix={<XCircleIcon className="size-4" />}
            isPending={lostPending}
            disabled={anyPending}
            onClick={() => execLost({ id: lead.id })}
          >
            Mark Lost
          </Button>
        )}
      </Stack>
    </div>
  )
}
