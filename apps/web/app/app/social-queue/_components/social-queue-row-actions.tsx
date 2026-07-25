"use client"

import { CheckIcon, XIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
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
import { Label } from "~/components/common/label"
import { Stack } from "~/components/common/stack"
import { TextArea } from "~/components/common/textarea"
import { client } from "~/lib/orpc-client"
import { canTransition } from "~/server/social-queue/transitions"
import type { SocialQueueRow } from "~/server/social-queue/schema"

type Decision = "approve" | "reject"

/**
 * Per-row approve/reject for the social queue (SESSION_0686) — the belt-review decision idiom
 * (one controlled confirmation dialog per irreversible path) writing through the oRPC
 * `socialQueue` router (full-oRPC direction).
 *
 * CONSENT + NO-PUBLISH, restated where the human clicks:
 * - Approve means "ready to publish" and NOTHING more — no post is sent from here; the wired
 *   publish step is a later, operator-authorized build. The dialog copy says so.
 * - The server re-runs the live consent check on approve; a person-centric item whose subject
 *   revoked (or never held) consent will NOT approve, whatever this UI shows.
 * - Reject requires a written reason and is terminal — a rejected item can never publish.
 */
export function SocialQueueRowActions({ row }: { row: SocialQueueRow }) {
  const router = useRouter()
  const [decision, setDecision] = useState<Decision | null>(null)
  const [reason, setReason] = useState("")
  const [isPending, startTransition] = useTransition()

  const canApprove = canTransition(row.status, "APPROVED")
  const canReject = canTransition(row.status, "REJECTED")

  if (!canApprove && !canReject) {
    return null
  }

  const close = () => {
    setDecision(null)
    setReason("")
  }

  const confirmDecision = () => {
    startTransition(async () => {
      try {
        if (decision === "approve") {
          const result = await client.socialQueue.approve({ id: row.id })
          if (result.outcome === "auto-rejected") {
            toast.warning("Consent no longer holds — the draft was rejected instead.")
          } else {
            toast.success("Approved — ready to publish. Nothing has been posted.")
          }
        } else if (decision === "reject") {
          await client.socialQueue.reject({ id: row.id, reason: reason.trim() })
          toast.success("Draft rejected.")
        }
        close()
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not update this draft.")
        close()
        router.refresh()
      }
    })
  }

  return (
    <>
      <Stack size="sm" wrap={false}>
        {canApprove && (
          <Button
            size="sm"
            variant="secondary"
            prefix={<CheckIcon />}
            disabled={isPending}
            onClick={() => setDecision("approve")}
          >
            Approve
          </Button>
        )}
        {canReject && (
          <Button
            size="sm"
            variant="ghost"
            prefix={<XIcon />}
            disabled={isPending}
            onClick={() => setDecision("reject")}
          >
            Reject
          </Button>
        )}
      </Stack>

      <Dialog
        open={decision !== null}
        onOpenChange={open => {
          if (!open && !isPending) close()
        }}
      >
        <DialogContent className="max-w-md" showCloseButton={!isPending}>
          <DialogHeader>
            <DialogTitle>
              {decision === "approve" ? "Approve this draft?" : "Reject this draft?"}
            </DialogTitle>
            <DialogDescription>
              {decision === "approve"
                ? "Approving marks this draft ready to publish. Nothing is posted or sent — publishing is a separate, later step. Person-centric drafts are re-checked against the subject's live consent first."
                : "Rejection is final: a rejected draft can never be published, and a replayed event will not re-create it. A written reason is required."}
            </DialogDescription>
          </DialogHeader>

          {decision === "reject" && (
            <Stack direction="column" className="items-stretch">
              <Label htmlFor={`reject-reason-${row.id}`} isRequired>
                Reason
              </Label>
              <TextArea
                id={`reject-reason-${row.id}`}
                value={reason}
                onChange={event => setReason(event.target.value)}
                placeholder="Why is this draft being rejected?"
                rows={3}
                maxLength={500}
                disabled={isPending}
              />
            </Stack>
          )}

          <DialogFooter>
            <DialogClose render={<Button size="md" variant="secondary" disabled={isPending} />}>
              Cancel
            </DialogClose>
            <Button
              size="md"
              variant={decision === "approve" ? "primary" : "destructive"}
              className="min-w-32"
              disabled={isPending || (decision === "reject" && reason.trim().length === 0)}
              isPending={isPending}
              onClick={confirmDecision}
            >
              {decision === "approve" ? "Approve (no publish)" : "Reject draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
