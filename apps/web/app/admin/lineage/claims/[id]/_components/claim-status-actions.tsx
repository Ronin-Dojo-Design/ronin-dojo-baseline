"use client"

import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { Stack } from "~/components/common/stack"
import { TextArea } from "~/components/common/textarea"
import { Label } from "~/components/common/label"
import { reviewLineageClaim } from "~/server/admin/lineage/claim-review-actions"
import type { ClaimDetail } from "~/server/admin/lineage/claim-queries"

/**
 * Claim review status action buttons.
 * Mirrors lead-status-actions.tsx pattern.
 *
 * Author: Cody / SESSION_0183 TASK_04.
 */

type ClaimStatusActionsProps = {
  claim: ClaimDetail
}

export function ClaimStatusActions({ claim }: ClaimStatusActionsProps) {
  const router = useRouter()
  const [reviewerNote, setReviewerNote] = useState("")

  const refresh = () => router.refresh()

  const { executeAsync: execApprove, isPending: approvePending } = useAction(reviewLineageClaim, {
    onSuccess: () => { toast.success("Claim approved"); refresh() },
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to approve"),
  })

  const { executeAsync: execDeny, isPending: denyPending } = useAction(reviewLineageClaim, {
    onSuccess: () => { toast.success("Claim denied"); refresh() },
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to deny"),
  })

  const { executeAsync: execNeedsInfo, isPending: needsInfoPending } = useAction(reviewLineageClaim, {
    onSuccess: () => { toast.success("Info requested from claimant"); refresh() },
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to request info"),
  })

  const anyPending = approvePending || denyPending || needsInfoPending
  const isReviewable = claim.status === "PENDING" || claim.status === "NEEDS_INFO"

  if (!isReviewable) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          This claim is <span className="font-semibold">{claim.status}</span> and cannot be reviewed.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <Stack direction="column" className="gap-4">
        <div>
          <Label htmlFor="reviewer-note">Reviewer Note (optional)</Label>
          <TextArea
            id="reviewer-note"
            value={reviewerNote}
            onChange={e => setReviewerNote(e.target.value)}
            placeholder="Add a note for the claimant…"
            className="mt-1"
            rows={3}
          />
        </div>

        <Stack direction="row" className="gap-2">
          <Button
            variant="default"
            disabled={anyPending}
            onClick={() => execApprove({ claimId: claim.id, decision: "APPROVED", reviewerNote: reviewerNote || undefined })}
          >
            Approve
          </Button>

          <Button
            variant="outline"
            disabled={anyPending}
            onClick={() => execNeedsInfo({ claimId: claim.id, decision: "NEEDS_INFO", reviewerNote: reviewerNote || undefined })}
          >
            Request Info
          </Button>

          <Button
            variant="destructive"
            disabled={anyPending}
            onClick={() => execDeny({ claimId: claim.id, decision: "DENIED", reviewerNote: reviewerNote || undefined })}
          >
            Deny
          </Button>
        </Stack>
      </Stack>
    </div>
  )
}
