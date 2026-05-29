"use client"

import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { Input } from "~/components/common/input"
import { Stack } from "~/components/common/stack"
import { createOrgInvite } from "~/server/web/organization/invite-actions"

type Props = { organizationId: string }

/**
 * Generate an invite link for the org. Generate button + optional maxUses /
 * expiresAt (blank = unlimited / no expiry). On success the new link is copied
 * to the clipboard and the list refreshes.
 */
export function GenerateInviteForm({ organizationId }: Props) {
  const router = useRouter()
  const [maxUses, setMaxUses] = useState("")
  const [expiresAt, setExpiresAt] = useState("")

  const { executeAsync, isPending } = useAction(createOrgInvite, {
    onSuccess: ({ data }) => {
      if (data?.code) {
        navigator.clipboard.writeText(`${window.location.origin}/invite/${data.code}`)
        toast.success("Invite link generated and copied to clipboard")
      } else {
        toast.success("Invite link generated")
      }
      setMaxUses("")
      setExpiresAt("")
      router.refresh()
    },
    onError: ({ error }) => {
      if (error.serverError?.includes("ACCESS_DENIED")) {
        toast.error("You don't have permission to create invites for this org")
      } else {
        toast.error(error.serverError ?? "Failed to generate invite")
      }
    },
  })

  return (
    <div className="rounded-lg border bg-card p-4">
      <Stack size="sm" wrap className="items-end gap-3">
        <div className="flex flex-col gap-1 text-sm">
          <label htmlFor="invite-max-uses" className="text-muted-foreground">
            Max uses (optional)
          </label>
          <Input
            id="invite-max-uses"
            type="number"
            min={1}
            placeholder="Unlimited"
            value={maxUses}
            onChange={e => setMaxUses(e.target.value)}
            className="w-36"
          />
        </div>
        <div className="flex flex-col gap-1 text-sm">
          <label htmlFor="invite-expires-at" className="text-muted-foreground">
            Expires (optional)
          </label>
          <Input
            id="invite-expires-at"
            type="date"
            value={expiresAt}
            onChange={e => setExpiresAt(e.target.value)}
            className="w-44"
          />
        </div>
        <Button
          disabled={isPending}
          isPending={isPending}
          onClick={() =>
            executeAsync({
              organizationId,
              maxUses: maxUses ? Number(maxUses) : null,
              expiresAt: expiresAt ? new Date(expiresAt) : null,
            })
          }
        >
          Generate invite link
        </Button>
      </Stack>
    </div>
  )
}
