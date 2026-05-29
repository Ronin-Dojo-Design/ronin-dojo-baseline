"use client"

import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { Stack } from "~/components/common/stack"
import { transitionOrgMembershipStatus } from "~/server/web/organization/membership-actions"

type Props = {
  organizationId: string
  membershipId: string
  memberName: string
}

/**
 * Approve / reject controls for a PENDING join request, scoped to the org.
 * Approve → ACTIVE, Reject → CANCELLED (both valid PENDING transitions).
 */
export function MemberApprovalActions({ organizationId, membershipId, memberName }: Props) {
  const router = useRouter()

  const { executeAsync, isPending } = useAction(transitionOrgMembershipStatus, {
    onSuccess: ({ input }) => {
      toast.success(
        input.toStatus === "ACTIVE" ? `${memberName} approved` : `${memberName}'s request declined`,
      )
      router.refresh()
    },
    onError: ({ error }) => {
      if (error.serverError?.includes("ACCESS_DENIED")) {
        toast.error("You don't have permission to manage this org's members")
      } else {
        toast.error(error.serverError ?? "Failed to update member")
      }
    },
  })

  return (
    <Stack direction="row" className="gap-2">
      <Button
        size="sm"
        variant="primary"
        disabled={isPending}
        isPending={isPending}
        onClick={() => executeAsync({ organizationId, membershipId, toStatus: "ACTIVE" })}
      >
        Approve
      </Button>
      <Button
        size="sm"
        variant="destructive"
        disabled={isPending}
        isPending={isPending}
        onClick={() => executeAsync({ organizationId, membershipId, toStatus: "CANCELLED" })}
      >
        Reject
      </Button>
    </Stack>
  )
}
