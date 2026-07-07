"use client"

import { GitBranchPlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/common/dialog"
import { placeLeadOnLineage } from "~/server/admin/lineage/place-lead"

/**
 * FI-003 — MANUAL steward fallback to place a Join-the-Legacy signup on the canonical lineage tree
 * UNDER the instructor they named on the registration form. New signups auto-place at submit; this
 * covers leads that weren't auto-placed (instructor didn't resolve, or pre-existing leads). Rendered
 * ONLY for eligible leads (the parent server component gates on `meta.source === "join-the-legacy"` +
 * a resolvable `trainedUnderNodeId`). This does NOT verify or approve the member — placement is
 * automatic and the member lands Unverified + not claimable.
 *
 * Mirrors the sibling `lead-status-actions.tsx`: `useAction` + `sonner` toast + `router.refresh()`.
 * The confirm dialog shows the resolved instructor name + target tree so the placement is explicit.
 */
export function LeadLineagePlace({
  leadId,
  instructorName,
  treeName,
}: {
  leadId: string
  instructorName: string
  treeName: string
}) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const { execute, isPending } = useAction(placeLeadOnLineage, {
    onSuccess: ({ data }) => {
      setIsOpen(false)
      toast.success(
        data?.alreadyPlaced
          ? "Already on the lineage tree — no changes made."
          : `Placed under ${instructorName} in ${treeName}.`,
      )
      router.refresh()
    },
    onError: ({ error }) =>
      toast.error(error.serverError ?? "Could not place on the lineage tree."),
  })

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 text-sm font-medium text-muted-foreground">
        Lineage placement:{" "}
        <span className="font-semibold text-foreground">
          under {instructorName} in {treeName}
        </span>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <Button
          size="sm"
          variant="primary"
          prefix={<GitBranchPlusIcon className="size-4" />}
          isPending={isPending}
          onClick={() => setIsOpen(true)}
        >
          Place on lineage tree
        </Button>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Place on lineage tree</DialogTitle>
            <DialogDescription>
              This adds the signup to the lineage as a member{" "}
              <strong>under {instructorName}</strong> in <strong>{treeName}</strong>, marked
              Unverified. It does not verify them — an instructor or steward verifies their node
              separately.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button size="md" variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              size="md"
              variant="primary"
              isPending={isPending}
              onClick={() => execute({ leadId })}
            >
              Place under {instructorName}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
