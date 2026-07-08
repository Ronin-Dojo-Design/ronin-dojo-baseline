"use client"

import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { Stack } from "~/components/common/stack"
import { Switch } from "~/components/common/switch"
import { grantUserPermission, revokeUserPermission } from "~/server/admin/permissions/actions"
import type { UserPermissionGrantState } from "~/server/admin/permissions/queries"

type Props = {
  userId: string
  grants: UserPermissionGrantState[]
  hasLegacyUploadEntitlement: boolean
}

type PermissionGrantRowProps = {
  permission: UserPermissionGrantState
  hasLegacyUploadEntitlement: boolean
  isPending: boolean
  onToggle: (permissionGrant: UserPermissionGrantState["grant"], checked: boolean) => void
}

const MEDIA_UPLOAD_GRANT = "media.upload"

function PermissionGrantsHeader({ activeCount }: { activeCount: number }) {
  return (
    <CardHeader size="sm">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold">Permission grants</h2>
          <CardDescription>Account-level capability overrides.</CardDescription>
        </div>
        <Badge variant="outline">{activeCount} active</Badge>
      </div>
    </CardHeader>
  )
}

function PermissionGrantRow({
  permission,
  hasLegacyUploadEntitlement,
  isPending,
  onToggle,
}: PermissionGrantRowProps) {
  const hasLegacyUpload = hasLegacyUploadEntitlement && permission.grant === MEDIA_UPLOAD_GRANT

  return (
    <div className="flex min-h-16 w-full items-center justify-between gap-4 py-3">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{permission.label}</span>
          <Badge variant={permission.isGranted ? "success" : "outline"} size="sm">
            {permission.grant}
          </Badge>
          {hasLegacyUpload ? (
            <Badge variant="info" size="sm">
              Legacy S3 active
            </Badge>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">{permission.description}</p>
      </div>

      <Switch
        aria-label={`Toggle ${permission.label}`}
        checked={permission.isGranted}
        disabled={isPending}
        onCheckedChange={checked => onToggle(permission.grant, Boolean(checked))}
      />
    </div>
  )
}

export function PermissionGrantsPanel({ userId, grants, hasLegacyUploadEntitlement }: Props) {
  const router = useRouter()
  const grant = useAction(grantUserPermission, {
    onSuccess: () => {
      toast.success("Permission granted.")
      router.refresh()
    },
    onError: () => toast.error("Failed to grant permission."),
  })
  const revoke = useAction(revokeUserPermission, {
    onSuccess: () => {
      toast.success("Permission revoked.")
      router.refresh()
    },
    onError: () => toast.error("Failed to revoke permission."),
  })

  const isPending = grant.isPending || revoke.isPending

  const toggleGrant = (permissionGrant: UserPermissionGrantState["grant"], checked: boolean) => {
    if (checked) {
      grant.execute({ userId, grant: permissionGrant })
      return
    }

    revoke.execute({ userId, grant: permissionGrant })
  }

  return (
    <Card hover={false}>
      <PermissionGrantsHeader activeCount={grants.filter(item => item.isGranted).length} />

      <Stack direction="column" className="w-full divide-y divide-border">
        {grants.map(permission => (
          <PermissionGrantRow
            key={permission.grant}
            permission={permission}
            hasLegacyUploadEntitlement={hasLegacyUploadEntitlement}
            isPending={isPending}
            onToggle={toggleGrant}
          />
        ))}
      </Stack>
    </Card>
  )
}
