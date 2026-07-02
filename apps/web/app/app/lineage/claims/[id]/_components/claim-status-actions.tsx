"use client"

import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { Input } from "~/components/common/input"
import { Label } from "~/components/common/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { Stack } from "~/components/common/stack"
import { TextArea } from "~/components/common/textarea"
import {
  LINEAGE_ELITE_ENTITLEMENT_KEY,
  LINEAGE_PREMIUM_ENTITLEMENT_KEY,
  type LineageCompTier,
} from "~/lib/entitlements/lineage-comp"
import type { ClaimDetail } from "~/server/admin/lineage/claim-queries"
import { reviewPassportClaim } from "~/server/admin/claims/passport-claim-review-actions"

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
  const [compTier, setCompTier] = useState<"NONE" | LineageCompTier>("NONE")
  const [compTermDays, setCompTermDays] = useState("")

  // Slice V5 (SESSION_0491): a promotion verifies a BELT on an already-owned
  // Passport — it grants NO comp (B1), so the comp controls are identity-only.
  const isPromotion = claim.type === "RANK_PROMOTION"

  const refresh = () => router.refresh()

  const { executeAsync: execApprove, isPending: approvePending } = useAction(reviewPassportClaim, {
    onSuccess: () => {
      toast.success("Claim approved")
      refresh()
    },
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to approve"),
  })

  const { executeAsync: execDeny, isPending: denyPending } = useAction(reviewPassportClaim, {
    onSuccess: () => {
      toast.success("Claim denied")
      refresh()
    },
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to deny"),
  })

  const { executeAsync: execNeedsInfo, isPending: needsInfoPending } = useAction(
    reviewPassportClaim,
    {
      onSuccess: () => {
        toast.success("Info requested from claimant")
        refresh()
      },
      onError: ({ error }) => toast.error(error.serverError ?? "Failed to request info"),
    },
  )

  const anyPending = approvePending || denyPending || needsInfoPending
  const isReviewable = claim.status === "PENDING" || claim.status === "NEEDS_INFO"

  if (!isReviewable) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          This claim is <span className="font-semibold">{claim.status}</span> and cannot be
          reviewed.
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

        {!isPromotion && (
          <Stack direction="row" className="gap-3">
            <div className="min-w-56">
              <Label htmlFor="claim-comp-tier">Comp Tier</Label>
              <Select
                value={compTier}
                onValueChange={value => setCompTier(value as "NONE" | LineageCompTier)}
              >
                <SelectTrigger id="claim-comp-tier" className="mt-1">
                  <SelectValue placeholder="No comp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">None</SelectItem>
                  <SelectItem value={LINEAGE_PREMIUM_ENTITLEMENT_KEY}>Lineage Premium</SelectItem>
                  <SelectItem value={LINEAGE_ELITE_ENTITLEMENT_KEY}>Lineage Elite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-44">
              <Label htmlFor="claim-comp-term-days">Term Days (optional)</Label>
              <Input
                id="claim-comp-term-days"
                type="number"
                placeholder="Lifetime"
                disabled={compTier === "NONE"}
                value={compTermDays}
                onChange={event => setCompTermDays(event.target.value)}
                className="mt-1"
              />
            </div>
          </Stack>
        )}

        <Stack direction="row" className="gap-2">
          <Button
            variant="primary"
            disabled={anyPending}
            onClick={() =>
              execApprove({
                claimId: claim.id,
                decision: "APPROVED",
                reviewerNote: reviewerNote || undefined,
                comp:
                  isPromotion || compTier === "NONE"
                    ? undefined
                    : {
                        tier: compTier,
                        termDays: compTermDays ? Number(compTermDays) : undefined,
                      },
              })
            }
          >
            Approve
          </Button>

          <Button
            variant="secondary"
            disabled={anyPending}
            onClick={() =>
              execNeedsInfo({
                claimId: claim.id,
                decision: "NEEDS_INFO",
                reviewerNote: reviewerNote || undefined,
              })
            }
          >
            Request Info
          </Button>

          <Button
            variant="destructive"
            disabled={anyPending}
            onClick={() =>
              execDeny({
                claimId: claim.id,
                decision: "DENIED",
                reviewerNote: reviewerNote || undefined,
              })
            }
          >
            Deny
          </Button>
        </Stack>
      </Stack>
    </div>
  )
}
