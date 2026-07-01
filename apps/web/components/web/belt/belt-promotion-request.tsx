"use client"

import { CheckCircle2Icon, UploadIcon } from "lucide-react"
import { type ChangeEvent, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/common/dialog"
import { Label } from "~/components/common/label"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { TextArea } from "~/components/common/textarea"
import { client } from "~/lib/orpc-client"
import type { BeltRankRef } from "./belt-view-model"

/**
 * `BeltPromotionRequest` — the above-ceiling "Request promotion" flow (B1 — ADR 0035
 * Amendment 1, TASK_03). An above-ceiling belt cannot be self-minted (that would be a
 * self-promotion); instead the member FILES a `RANK_PROMOTION` claim their instructor
 * reviews. This lightweight modal collects an optional note + an OPTIONAL certificate/
 * instructor photo (the soft-gate — allowed to submit without) and calls
 * `client.promotion.submit`; the photo materializes onto the belt's `RankMilestone` on
 * approval (Slice V3 → `finalizeRankPromotion`).
 *
 * Reuse-first: the L1 `Dialog` + `Button` + `TextArea`, and the SAME `onUpload` seam the
 * belt media galleries use — here the upload target is the member's own `passport` (a
 * promotion has no milestone yet), which mints a `mediaId` we pass as evidence. No new
 * card kind (ADR 0040), no new modal primitive.
 *
 * One-open is enforced SERVER-side; on rejection the friendly message is surfaced (with a
 * generic fallback if the transport masks it) and re-submit stays available.
 */

/** A photo the member has staged for the promotion evidence (uploaded → has a mediaId). */
type StagedPhoto = { mediaId: string; label: "certificate" | "instructor" }

export function BeltPromotionRequest({
  rank,
  passportId,
  open,
  onOpenChange,
  onUpload,
}: {
  /** The above-ceiling belt being requested. */
  rank: BeltRankRef
  /** The member's own Passport — the upload target for a soft-gate photo (no milestone yet). */
  passportId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  /**
   * Per-file R2 upload against a media target (mints a mediaId). The same seam the belt
   * galleries use; here it uploads to the member's `passport`. Omit → photo upload hidden
   * (note-only request still works — the photo is a soft-gate).
   */
  onUpload?: (file: File, passportId: string) => Promise<{ mediaId: string } | null>
}) {
  const [note, setNote] = useState("")
  const [photos, setPhotos] = useState<StagedPhoto[]>([])
  const [isBusy, setIsBusy] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const certInputRef = useRef<HTMLInputElement>(null)
  const instrInputRef = useRef<HTMLInputElement>(null)

  const stagePhoto =
    (label: "certificate" | "instructor") => async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ""
      if (!file || !onUpload) return
      setIsBusy(true)
      try {
        const uploaded = await onUpload(file, passportId)
        if (!uploaded) {
          toast.error("Could not upload that photo.")
          return
        }
        setPhotos(current => [...current, { mediaId: uploaded.mediaId, label }])
        toast.success("Photo attached.")
      } catch {
        toast.error("Could not upload that photo.")
      } finally {
        setIsBusy(false)
      }
    }

  const submit = async () => {
    setIsBusy(true)
    try {
      await client.promotion.submit({
        claimedRankId: rank.id,
        claimantNote: note.trim() || undefined,
        evidence: photos.map(p => ({ mediaId: p.mediaId, label: p.label })),
      })
      setSubmitted(true)
      toast.success("Promotion request submitted.")
    } catch (error) {
      // The core throws friendly Error messages (one-open, above-ceiling); surface it if the
      // transport preserved it, else a generic fallback. Re-submit stays available.
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Could not submit your promotion request. Please try again."
      toast.error(message)
    } finally {
      setIsBusy(false)
    }
  }

  const close = () => {
    onOpenChange(false)
    // Reset for the next open so a fresh request starts clean.
    setNote("")
    setPhotos([])
    setSubmitted(false)
  }

  return (
    <Dialog open={open} onOpenChange={next => (next ? onOpenChange(true) : close())}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request your {rank.name}</DialogTitle>
        </DialogHeader>

        {submitted ? (
          <Stack direction="column" size="md" className="w-full items-center py-4 text-center">
            <CheckCircle2Icon className="size-10 text-green-700 dark:text-green-300" aria-hidden />
            <Note className="text-sm">
              Submitted — pending verification by your instructor. You&apos;ll be notified when it
              is reviewed.
            </Note>
            <Button type="button" onClick={close}>
              Done
            </Button>
          </Stack>
        ) : (
          <>
            <Stack direction="column" size="md" className="w-full">
              <Note className="text-sm">
                This belt is above your verified rank, so it needs your instructor&apos;s approval.
                Add a note and an optional certificate or instructor photo to speed up the review.
              </Note>

              <div className="w-full">
                <Label htmlFor="promotion-note">Note (optional)</Label>
                <TextArea
                  id="promotion-note"
                  size="lg"
                  className="min-h-24"
                  placeholder="When and where were you promoted? Who promoted you?"
                  value={note}
                  onChange={event => setNote(event.target.value)}
                />
              </div>

              {onUpload && (
                <Stack direction="column" size="sm" className="w-full">
                  <Label>Evidence photos (optional)</Label>
                  <Stack size="sm">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      prefix={<UploadIcon />}
                      isPending={isBusy}
                      onClick={() => certInputRef.current?.click()}
                    >
                      Certificate
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      prefix={<UploadIcon />}
                      isPending={isBusy}
                      onClick={() => instrInputRef.current?.click()}
                    >
                      Instructor
                    </Button>
                  </Stack>
                  {photos.length > 0 && (
                    <Note className="text-xs">
                      {photos.length} {photos.length === 1 ? "photo" : "photos"} attached
                    </Note>
                  )}
                  <input
                    ref={certInputRef}
                    type="file"
                    accept="image/*"
                    onChange={stagePhoto("certificate")}
                    className="hidden"
                  />
                  <input
                    ref={instrInputRef}
                    type="file"
                    accept="image/*"
                    onChange={stagePhoto("instructor")}
                    className="hidden"
                  />
                </Stack>
              )}
            </Stack>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={close} disabled={isBusy}>
                Cancel
              </Button>
              <Button type="button" isPending={isBusy} onClick={submit}>
                Submit request
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
