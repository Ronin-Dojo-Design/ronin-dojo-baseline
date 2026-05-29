"use client"

import { XIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { assignOrgRole, removeOrgRole } from "~/server/web/organization/membership-actions"

type RoleOption = { id: string; name: string; code: string }
type RoleAssignment = { role: RoleOption }

type Props = {
  organizationId: string
  membershipId: string
  roleAssignments: RoleAssignment[]
  roleList: RoleOption[]
}

const onError =
  (fallback: string) =>
  ({ error }: { error: { serverError?: string } }) => {
    if (error.serverError?.includes("ACCESS_DENIED")) {
      toast.error("You don't have permission to manage roles for this org")
    } else {
      toast.error(error.serverError ?? fallback)
    }
  }

/**
 * Org-scoped role assignment for a roster member. Mirrors the platform
 * `RoleAssignmentPanel` but wired to `assignOrgRole`/`removeOrgRole` (owner +
 * ORG_ADMIN, cross-org guarded). Any org admin can grant any system role.
 */
export function OrgRoleAssignment({
  organizationId,
  membershipId,
  roleAssignments,
  roleList,
}: Props) {
  const router = useRouter()
  const [selectedRoleId, setSelectedRoleId] = useState("")

  const assignedRoleIds = new Set(roleAssignments.map(ra => ra.role.id))
  const availableRoles = roleList.filter(r => !assignedRoleIds.has(r.id))

  const { executeAsync: assign, isPending: assigning } = useAction(assignOrgRole, {
    onSuccess: () => {
      toast.success("Role assigned")
      setSelectedRoleId("")
      router.refresh()
    },
    onError: onError("Failed to assign role"),
  })

  const { executeAsync: remove, isPending: removing } = useAction(removeOrgRole, {
    onSuccess: () => {
      toast.success("Role removed")
      router.refresh()
    },
    onError: onError("Failed to remove role"),
  })

  const anyPending = assigning || removing

  return (
    <div className="flex flex-wrap items-center gap-2">
      {roleAssignments.map(ra => (
        <Badge key={ra.role.id} variant="primary" className="gap-1 pr-1">
          {ra.role.name}
          <button
            type="button"
            title={`Remove ${ra.role.name}`}
            disabled={anyPending}
            className="ml-1 rounded-full p-0.5 hover:bg-background/20 disabled:opacity-50"
            onClick={() => remove({ organizationId, membershipId, roleId: ra.role.id })}
          >
            <XIcon className="size-3" />
          </button>
        </Badge>
      ))}

      {availableRoles.length > 0 && (
        <div className="flex items-center gap-1">
          <select
            value={selectedRoleId}
            onChange={e => setSelectedRoleId(e.target.value)}
            className="rounded-md border bg-background px-2 py-1 text-xs"
            disabled={anyPending}
            aria-label="Select a role to assign"
          >
            <option value="">Add role…</option>
            {availableRoles.map(role => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            variant="secondary"
            disabled={!selectedRoleId || anyPending}
            isPending={assigning}
            onClick={() => {
              if (selectedRoleId) {
                assign({ organizationId, membershipId, roleId: selectedRoleId })
              }
            }}
          >
            Add
          </Button>
        </div>
      )}
    </div>
  )
}
