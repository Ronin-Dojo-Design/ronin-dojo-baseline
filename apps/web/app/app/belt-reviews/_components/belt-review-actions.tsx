"use client"

import { CheckIcon, XIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/common/dialog"
import { Stack } from "~/components/common/stack"
import { approveRankEntryReview, denyRankEntryReview } from "~/server/admin/rank-reviews/actions"
import { type BeltReviewDecision, getBeltReviewDecisionCopy } from "./belt-review-decision"

/**
 * Detail-only promoter-review decisions. One controlled accessible dialog confirms either
 * irreversible path; server state stays in safe actions and the refreshed Server Component.
 */
export function BeltReviewActions({
  reviewId,
  memberName,
  rankName,
  proposedPromoterName,
  canApprove,
}: {
  reviewId: string
  memberName: string
  rankName: string
  proposedPromoterName: string
  canApprove: boolean
}) {
  const router = useRouter()
  const [decision, setDecision] = useState<BeltReviewDecision | null>(null)

  const approve = useAction(approveRankEntryReview, {
    onSuccess: () => {
      setDecision(null)
      toast.success("Promoter change approved — belt verified.")
      router.refresh()
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Could not approve this promoter change.")
      setDecision(null)
      router.refresh()
    },
  })

  const deny = useAction(denyRankEntryReview, {
    onSuccess: () => {
      setDecision(null)
      toast.success("Promoter change denied.")
      router.refresh()
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Could not deny this promoter change.")
      setDecision(null)
      router.refresh()
    },
  })

  const isPending = approve.isPending || deny.isPending
  const copy = getBeltReviewDecisionCopy(decision ?? "approve", {
    memberName,
    rankName,
    proposedPromoterName,
  })

  const confirmDecision = () => {
    if (decision === "approve") approve.execute({ reviewId })
    if (decision === "deny") deny.execute({ reviewId })
  }

  return (
    <>
      <Stack direction="row" className="gap-2" wrap>
        <Button
          size="md"
          variant="primary"
          prefix={<CheckIcon />}
          disabled={isPending || !canApprove}
          onClick={() => setDecision("approve")}
        >
          Approve
        </Button>
        <Button
          size="md"
          variant="destructive"
          prefix={<XIcon />}
          disabled={isPending}
          onClick={() => setDecision("deny")}
        >
          Deny
        </Button>
      </Stack>

      <Dialog
        open={decision !== null}
        onOpenChange={open => {
          if (!open && !isPending) setDecision(null)
        }}
      >
        <DialogContent className="max-w-md" showCloseButton={!isPending}>
          <DialogHeader>
            <DialogTitle>{copy.title}</DialogTitle>
            <DialogDescription>{copy.description}</DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose render={<Button size="md" variant="secondary" disabled={isPending} />}>
              Cancel
            </DialogClose>
            <Button
              size="md"
              variant={copy.confirmVariant}
              className="min-w-36"
              disabled={isPending}
              isPending={
                decision === "approve" ? approve.isPending : decision === "deny" && deny.isPending
              }
              onClick={confirmDecision}
            >
              {copy.confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
