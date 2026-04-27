"use client"

import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { Stack } from "~/components/common/stack"
import {
  updateMembershipStatus,
  assignRole,
  removeRole,
} from "~/server/web/organization/actions"

interface Role {
  id: string
  code: string
  name: string
}

interface MembershipActionsProps {
  membership: { id: string; status: string }
  roles: Role[]
  assignedRoleIds: string[]
}

const statusTransitions: Record<string, { label: string; status: string; variant: "primary" | "secondary" | "destructive" | "ghost" }[]> = {
  INVITED: [
    { label: "Approve", status: "ACTIVE", variant: "primary" },
    { label: "Reject", status: "EXPIRED", variant: "destructive" },
  ],
  PENDING: [
    { label: "Approve", status: "ACTIVE", variant: "primary" },
    { label: "Reject", status: "EXPIRED", variant: "destructive" },
  ],
  ACTIVE: [
    { label: "Suspend", status: "SUSPENDED", variant: "destructive" },
  ],
  SUSPENDED: [
    { label: "Reactivate", status: "ACTIVE", variant: "primary" },
    { label: "Expire", status: "EXPIRED", variant: "destructive" },
  ],
  EXPIRED: [],
}

export const MembershipActions = ({
  membership,
  roles,
  assignedRoleIds,
}: MembershipActionsProps) => {
  const router = useRouter()
  const transitions = statusTransitions[membership.status] ?? []

  const statusAction = useAction(updateMembershipStatus, {
    onSuccess: () => { toast.success("Status updated"); router.refresh() },
    onError: ({ error }) => toast.error(error.serverError ?? "Failed"),
  })

  const assignAction = useAction(assignRole, {
    onSuccess: () => { toast.success("Role assigned"); router.refresh() },
    onError: ({ error }) => toast.error(error.serverError ?? "Failed"),
  })

  const removeAction = useAction(removeRole, {
    onSuccess: () => { toast.success("Role removed"); router.refresh() },
    onError: ({ error }) => toast.error(error.serverError ?? "Failed"),
  })

  return (
    <div className="px-4 pb-3 space-y-2">
      {/* Status transitions */}
      {transitions.length > 0 && (
        <Stack size="sm">
          {transitions.map((t) => (
            <Button
              key={t.status}
              size="sm"
              variant={t.variant}
              isPending={statusAction.isPending}
              onClick={() =>
                statusAction.execute({
                  membershipId: membership.id,
                  status: t.status as "ACTIVE" | "SUSPENDED" | "EXPIRED",
                })
              }
            >
              {t.label}
            </Button>
          ))}
        </Stack>
      )}

      {/* Role toggles */}
      {membership.status === "ACTIVE" && (
        <Stack size="sm" className="flex-wrap">
          {roles
            .filter((r) => r.code !== "OWNER") // Don't let owner role be toggled
            .map((role) => {
              const isAssigned = assignedRoleIds.includes(role.id)
              return (
                <Button
                  key={role.id}
                  size="sm"
                  variant={isAssigned ? "secondary" : "ghost"}
                  isPending={assignAction.isPending || removeAction.isPending}
                  onClick={() =>
                    isAssigned
                      ? removeAction.execute({ membershipId: membership.id, roleId: role.id })
                      : assignAction.execute({ membershipId: membership.id, roleId: role.id })
                  }
                >
                  {isAssigned ? `✓ ${role.name}` : `+ ${role.name}`}
                </Button>
              )
            })}
        </Stack>
      )}
    </div>
  )
}
