"use client"

import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { Stack } from "~/components/common/stack"
import { grantUserEntitlement, revokeUserEntitlement } from "~/server/admin/entitlements/actions"

type Props = {
  userId: string
  hasUploadEntitlement: boolean
}

export function UploadGrantToggle({ userId, hasUploadEntitlement }: Props) {
  const grant = useAction(grantUserEntitlement, {
    onSuccess: () => toast.success("Upload capability granted."),
    onError: () => toast.error("Failed to grant upload capability."),
  })

  const revoke = useAction(revokeUserEntitlement, {
    onSuccess: () => toast.success("Upload capability revoked."),
    onError: () => toast.error("Failed to revoke upload capability."),
  })

  const isPending = grant.isPending || revoke.isPending

  return (
    <Stack className="items-center gap-3">
      <span className="text-sm font-medium">
        S3 Upload:{" "}
        {hasUploadEntitlement ? (
          <span className="text-green-600">Granted</span>
        ) : (
          <span className="text-muted-foreground">Not granted</span>
        )}
      </span>

      {hasUploadEntitlement ? (
        <Button
          size="sm"
          variant="destructive"
          disabled={isPending}
          onClick={() => revoke.execute({ userId, entitlementKey: "S3_UPLOAD" })}
        >
          {revoke.isPending ? "Revoking…" : "Revoke Upload"}
        </Button>
      ) : (
        <Button
          size="sm"
          variant="secondary"
          disabled={isPending}
          onClick={() => grant.execute({ userId, entitlementKey: "S3_UPLOAD" })}
        >
          {grant.isPending ? "Granting…" : "Grant Upload"}
        </Button>
      )}
    </Stack>
  )
}
