"use client"

import { XIcon } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { H4 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import {
  assignRoleToMembership,
  removeRoleFromMembership,
} from "~/server/admin/memberships/actions"

type RoleOption = { id: string; name: string; code: string }
type RoleAssignment = { id: string; role: RoleOption }

type RoleAssignmentPanelProps = {
  membershipId: string
  roleAssignments: RoleAssignment[]
  roleList: RoleOption[]
}

export function RoleAssignmentPanel({
  membershipId,
  roleAssignments,
  roleList,
}: RoleAssignmentPanelProps) {
  const router = useRouter()
  const [selectedRoleId, setSelectedRoleId] = useState("")

  const assignedRoleIds = new Set(roleAssignments.map(ra => ra.role.id))
  const availableRoles = roleList.filter(r => !assignedRoleIds.has(r.id))

  const { executeAsync: execAssign, isPending: assigning } = useAction(assignRoleToMembership, {
    onSuccess: () => {
      toast.success("Role assigned")
      setSelectedRoleId("")
      router.refresh()
    },
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to assign role"),
  })

  const { executeAsync: execRemove, isPending: removing } = useAction(removeRoleFromMembership, {
    onSuccess: () => {
      toast.success("Role removed")
      router.refresh()
    },
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to remove role"),
  })

  const anyPending = assigning || removing

  return (
    <div className="space-y-3">
      <H4>Roles ({roleAssignments.length})</H4>

      {roleAssignments.length === 0 ? (
        <Note>No roles assigned.</Note>
      ) : (
        <div className="flex flex-wrap gap-2">
          {roleAssignments.map(ra => (
            <Badge key={ra.id} variant="outline" className="gap-1 pr-1">
              {ra.role.name}
              <button
                type="button"
                title={`Remove ${ra.role.name}`}
                disabled={anyPending}
                className="ml-1 rounded-full p-0.5 hover:bg-muted disabled:opacity-50"
                onClick={() => execRemove({ membershipId, roleId: ra.role.id })}
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {availableRoles.length > 0 && (
        <div className="flex items-center gap-2">
          <select
            value={selectedRoleId}
            onChange={e => setSelectedRoleId(e.target.value)}
            className="rounded-md border bg-background px-3 py-1.5 text-sm"
            disabled={anyPending}
            aria-label="Select a role to assign"
          >
            <option value="">Add a role…</option>
            {availableRoles.map(role => (
              <option key={role.id} value={role.id}>
                {role.name} ({role.code})
              </option>
            ))}
          </select>
          <Button
            size="sm"
            disabled={!selectedRoleId || anyPending}
            isPending={assigning}
            onClick={() => {
              if (selectedRoleId) {
                execAssign({ membershipId, roleId: selectedRoleId })
              }
            }}
          >
            Assign
          </Button>
        </div>
      )}
    </div>
  )
}
