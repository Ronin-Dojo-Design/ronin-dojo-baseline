"use client"

import { CheckIcon, XIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { Stack } from "~/components/common/stack"
import { approveRankEntryReview, dismissRankEntryReview } from "~/server/admin/rank-reviews/actions"

/**
 * Approve / Dismiss row actions for the belt-review queue (G-010). Approve verifies the
 * linked belt + closes the review (APPROVED); Dismiss closes it (DENIED) without changing the
 * belt. Both `router.refresh()` on success so the actioned row drops from the queue. Mirrors the
 * `useAction` + `sonner` + `router.refresh()` idiom from the steward `RankVerifyButton`.
 */
export function BeltReviewActions({ reviewId }: { reviewId: string }) {
  const router = useRouter()

  const approve = useAction(approveRankEntryReview, {
    onSuccess: () => {
      toast.success("Belt verified — review approved.")
      router.refresh()
    },
    onError: ({ error }) => toast.error(error.serverError ?? "Could not approve this review."),
  })

  const dismiss = useAction(dismissRankEntryReview, {
    onSuccess: () => {
      toast.success("Review dismissed.")
      router.refresh()
    },
    onError: ({ error }) => toast.error(error.serverError ?? "Could not dismiss this review."),
  })

  const isPending = approve.isPending || dismiss.isPending

  return (
    <Stack direction="row" className="gap-2" wrap={false}>
      <Button
        size="xs"
        variant="primary"
        prefix={<CheckIcon className="size-3.5" />}
        isPending={approve.isPending}
        disabled={isPending}
        onClick={() => approve.execute({ reviewId })}
      >
        Approve
      </Button>
      <Button
        size="xs"
        variant="secondary"
        prefix={<XIcon className="size-3.5" />}
        isPending={dismiss.isPending}
        disabled={isPending}
        onClick={() => dismiss.execute({ reviewId })}
      >
        Dismiss
      </Button>
    </Stack>
  )
}
