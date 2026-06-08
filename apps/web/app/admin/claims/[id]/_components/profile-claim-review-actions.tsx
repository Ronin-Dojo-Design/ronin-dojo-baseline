"use client"

import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { Label } from "~/components/common/label"
import { Stack } from "~/components/common/stack"
import { TextArea } from "~/components/common/textarea"
import { reviewProfileClaim } from "~/server/admin/claims/claim-review-actions"
import type { ProfileClaimDecision } from "~/server/admin/claims/claim-review-schemas"

/**
 * Admin profile-claim review actions (SESSION_0354). Mirrors the lineage
 * claim-status-actions client.
 */

export function ProfileClaimReviewActions({ claimId }: { claimId: string }) {
  const router = useRouter()
  const [reviewerNote, setReviewerNote] = useState("")

  const { executeAsync, isPending } = useAction(reviewProfileClaim, {
    onSuccess: ({ data }) => {
      if (data?.personMergePending) {
        toast.success("Approved. Person profiles need a manual account merge — see the runbook.")
      } else if (data?.ownershipGranted) {
        toast.success("Approved — ownership granted to the claimant.")
      } else {
        toast.success("Claim updated.")
      }
      router.refresh()
    },
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to update claim."),
  })

  function review(decision: ProfileClaimDecision) {
    void executeAsync({ claimId, decision, reviewerNote: reviewerNote || undefined })
  }

  return (
    <Stack direction="column" size="sm">
      <div>
        <Label htmlFor="reviewerNote">Reviewer note (optional)</Label>
        <TextArea
          id="reviewerNote"
          rows={3}
          value={reviewerNote}
          onChange={event => setReviewerNote(event.target.value)}
          placeholder="Why you approved / denied, or what info is missing."
        />
      </div>

      <Stack direction="row" className="flex-wrap gap-2">
        <Button onClick={() => review("APPROVED")} disabled={isPending}>
          Approve
        </Button>
        <Button variant="secondary" onClick={() => review("NEEDS_INFO")} disabled={isPending}>
          Needs info
        </Button>
        <Button variant="destructive" onClick={() => review("DENIED")} disabled={isPending}>
          Deny
        </Button>
      </Stack>
    </Stack>
  )
}
