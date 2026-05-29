"use client"

import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { Stack } from "~/components/common/stack"
import {
  rejectOrgJoinRequest,
  transitionOrgMembershipStatus,
} from "~/server/web/organization/membership-actions"

type Props = {
  organizationId: string
  membershipId: string
  memberName: string
}

const onAccessError = (serverError: string | undefined, fallback: string) => {
  if (serverError?.includes("ACCESS_DENIED")) {
    toast.error("You don't have permission to manage this org's members")
  } else {
    toast.error(serverError ?? fallback)
  }
}

/**
 * Approve / reject controls for a PENDING join request, scoped to the org.
 * Approve → ACTIVE (status transition). Reject → hard-delete the request
 * (`rejectOrgJoinRequest`, F-0296-1) so the applicant can re-request later.
 */
export function MemberApprovalActions({ organizationId, membershipId, memberName }: Props) {
  const router = useRouter()

  const { executeAsync: approve, isPending: approving } = useAction(transitionOrgMembershipStatus, {
    onSuccess: () => {
      toast.success(`${memberName} approved`)
      router.refresh()
    },
    onError: ({ error }) => onAccessError(error.serverError, "Failed to approve member"),
  })

  const { executeAsync: reject, isPending: rejecting } = useAction(rejectOrgJoinRequest, {
    onSuccess: () => {
      toast.success(`${memberName}'s request declined`)
      router.refresh()
    },
    onError: ({ error }) => onAccessError(error.serverError, "Failed to decline request"),
  })

  const anyPending = approving || rejecting

  return (
    <Stack direction="row" className="gap-2">
      <Button
        size="sm"
        variant="primary"
        disabled={anyPending}
        isPending={approving}
        onClick={() => approve({ organizationId, membershipId, toStatus: "ACTIVE" })}
      >
        Approve
      </Button>
      <Button
        size="sm"
        variant="destructive"
        disabled={anyPending}
        isPending={rejecting}
        onClick={() => reject({ organizationId, membershipId })}
      >
        Reject
      </Button>
    </Stack>
  )
}
