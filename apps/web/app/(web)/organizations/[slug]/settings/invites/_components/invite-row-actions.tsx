"use client"

import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { Stack } from "~/components/common/stack"
import { revokeOrgInvite } from "~/server/web/organization/invite-actions"

type Props = {
  organizationId: string
  inviteId: string
  code: string
  /** Whether the invite is still active (PENDING) — only active invites can be revoked. */
  revocable: boolean
}

/**
 * Copy-link + revoke controls for an invite row. Copy mirrors the platform
 * admin idiom (`window.location.origin` + `/invite/{code}`); revoke calls the
 * org-scoped action.
 */
export function InviteRowActions({ organizationId, inviteId, code, revocable }: Props) {
  const router = useRouter()

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/invite/${code}`)
    toast.success("Invite link copied to clipboard")
  }

  const { executeAsync: revoke, isPending: revoking } = useAction(revokeOrgInvite, {
    onSuccess: () => {
      toast.success("Invite revoked")
      router.refresh()
    },
    onError: ({ error }) => {
      if (error.serverError?.includes("ACCESS_DENIED")) {
        toast.error("You don't have permission to revoke this invite")
      } else {
        toast.error(error.serverError ?? "Failed to revoke invite")
      }
    },
  })

  return (
    <Stack direction="row" className="gap-2">
      <Button size="sm" variant="secondary" onClick={copyLink}>
        Copy link
      </Button>
      {revocable && (
        <Button
          size="sm"
          variant="destructive"
          disabled={revoking}
          isPending={revoking}
          onClick={() => revoke({ organizationId, inviteId })}
        >
          Revoke
        </Button>
      )}
    </Stack>
  )
}
