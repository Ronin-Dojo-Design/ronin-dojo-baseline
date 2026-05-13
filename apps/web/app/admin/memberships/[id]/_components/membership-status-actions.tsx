"use client"

import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { Badge } from "~/components/common/badge"
import { Stack } from "~/components/common/stack"
import { transitionMembershipStatus } from "~/server/admin/memberships/actions"
import { VALID_TRANSITIONS } from "~/server/admin/memberships/constants"

type MembershipForActions = {
  id: string
  status: string
}

const STATUS_VARIANT: Record<string, "primary" | "success" | "warning" | "danger" | "outline"> = {
  INVITED: "primary",
  PENDING: "warning",
  ACTIVE: "success",
  SUSPENDED: "danger",
  CANCELLED: "outline",
  EXPIRED: "outline",
}

const TRANSITION_VARIANT: Record<string, "primary" | "secondary" | "destructive" | "ghost"> = {
  ACTIVE: "primary",
  SUSPENDED: "destructive",
  CANCELLED: "destructive",
  EXPIRED: "ghost",
  PENDING: "secondary",
}

export function MembershipStatusActions({ membership }: { membership: MembershipForActions }) {
  const router = useRouter()
  const validTransitions = VALID_TRANSITIONS[membership.status] ?? []

  const { executeAsync, isPending } = useAction(transitionMembershipStatus, {
    onSuccess: () => {
      toast.success("Status updated")
      router.refresh()
    },
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to update status"),
  })

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-muted-foreground">
          Status:{" "}
          <Badge variant={STATUS_VARIANT[membership.status] ?? "outline"}>
            {membership.status}
          </Badge>
        </div>
      </div>

      {validTransitions.length > 0 && (
        <Stack direction="row" className="gap-2 flex-wrap">
          {validTransitions.map(target => (
            <Button
              key={target}
              size="sm"
              variant={TRANSITION_VARIANT[target] ?? "default"}
              disabled={isPending}
              isPending={isPending}
              onClick={() => executeAsync({ id: membership.id, toStatus: target as any })}
            >
              → {target}
            </Button>
          ))}
        </Stack>
      )}

      {validTransitions.length === 0 && (
        <p className="text-xs text-muted-foreground">Terminal state — no transitions available.</p>
      )}
    </div>
  )
}
