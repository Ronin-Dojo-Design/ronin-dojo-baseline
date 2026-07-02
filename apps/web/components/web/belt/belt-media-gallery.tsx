"use client"

import { Trash2Icon, UploadIcon } from "lucide-react"
import { type ChangeEvent, useRef, useState } from "react"
import { toast } from "sonner"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { H6 } from "~/components/common/heading"
import { Hint } from "~/components/common/hint"
import { Stack } from "~/components/common/stack"
import { client } from "~/lib/orpc-client"
import type { MilestoneMediaPurpose } from "~/server/belt/schemas"
import type { BeltCardMedia } from "./belt-view-model"

/**
 * `BeltMediaGallery` — one purpose-scoped photo gallery for a belt milestone
 * (Slice 4 — Petey Plan 0477). Four of these compose the milestone media block:
 * `belt`, `instructor`, `certificate`, `competition`.
 *
 * DETACH goes straight through the belt oRPC client
 * (`client.belt.detachMilestoneMedia`) — own-Passport, gated server-side. ATTACH
 * is a two-step: (1) upload the file to R2 to mint a `mediaId` via the parent-
 * supplied `onUpload` (the R2 upload pipeline lives behind a next-safe-action
 * server action keyed on a `MediaAttachTarget`, which has no `rankMilestone` kind
 * yet — see the Slice-5 note in the PR), then (2) link it with
 * `client.belt.attachMilestoneMedia`. When `onUpload` is omitted the upload
 * control is hidden (read-only gallery).
 *
 * Presentation-only otherwise: it renders the already-resolved {@link BeltCardMedia}
 * URLs the parent hands down and mirrors mutations optimistically.
 */
export function BeltMediaGallery({
  rankMilestoneId,
  purpose,
  title,
  items,
  onUpload,
  onChanged,
}: {
  /** The milestone whose media this gallery manages (own-Passport, gated server-side). */
  rankMilestoneId: string
  /** Which slot these photos fill — a shared-column string convention (Locked #2). */
  purpose: MilestoneMediaPurpose
  title: string
  /** Already-resolved media (URL + ids) for this purpose. */
  items: BeltCardMedia[]
  /**
   * Uploads a file to R2 (against the `rankMilestone` media target) and returns the
   * minted `mediaId`. Supplied by the mount (Slice 5) because the upload pipeline is
   * a server action, not an oRPC call. Receives the milestone id so the upload lands
   * on the right FK; the subsequent `attachMilestoneMedia` then sets the purpose
   * (idempotent — the upload already created the attachment). Omit → read-only gallery.
   */
  onUpload?: (file: File, rankMilestoneId: string) => Promise<{ mediaId: string } | null>
  /** Fired after any attach/detach so the parent can refresh the card view-model. */
  onChanged?: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [media, setMedia] = useState<BeltCardMedia[]>(items)
  const [isBusy, setIsBusy] = useState(false)

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file || !onUpload) return

    setIsBusy(true)
    try {
      const uploaded = await onUpload(file, rankMilestoneId)
      if (!uploaded) return
      await client.belt.attachMilestoneMedia({
        rankMilestoneId,
        mediaId: uploaded.mediaId,
        purpose,
      })
      setMedia(current => [
        ...current,
        {
          attachmentId: `pending-${uploaded.mediaId}`,
          mediaId: uploaded.mediaId,
          purpose,
          url: URL.createObjectURL(file),
          type: "IMAGE",
        },
      ])
      onChanged?.()
      toast.success("Photo added.")
    } catch {
      toast.error("Could not add that photo.")
    } finally {
      setIsBusy(false)
    }
  }

  const handleDetach = async (item: BeltCardMedia) => {
    setIsBusy(true)
    try {
      await client.belt.detachMilestoneMedia({ rankMilestoneId, mediaId: item.mediaId })
      setMedia(current => current.filter(m => m.mediaId !== item.mediaId))
      onChanged?.()
      toast.success("Photo removed.")
    } catch {
      toast.error("Could not remove that photo.")
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <Stack direction="column" size="sm" className="w-full">
      <div className="flex w-full items-center justify-between">
        <H6 render={props => <h4 {...props}>{props.children}</h4>}>{title}</H6>
        {onUpload && (
          <Button
            type="button"
            size="xs"
            variant="secondary"
            prefix={<UploadIcon />}
            isPending={isBusy}
            onClick={() => inputRef.current?.click()}
          >
            Add photo
          </Button>
        )}
      </div>

      {media.length === 0 ? (
        <Hint>No {title.toLowerCase()} yet.</Hint>
      ) : (
        <div className="grid w-full grid-cols-3 gap-2 sm:grid-cols-4">
          {media.map(item => (
            <div
              key={item.mediaId}
              className="relative overflow-hidden rounded-md border bg-background"
            >
              {item.type === "VIDEO" ? (
                <video src={item.url} className="aspect-square w-full object-cover" muted />
              ) : (
                <img src={item.url} alt={title} className="aspect-square w-full object-cover" />
              )}
              <Badge size="sm" variant="soft" className="absolute left-1 top-1 capitalize">
                {purpose}
              </Badge>
              <Button
                type="button"
                size="xs"
                variant="destructive"
                aria-label="Remove photo"
                prefix={<Trash2Icon />}
                isPending={isBusy}
                onClick={() => handleDetach(item)}
                className="absolute right-1 top-1"
              />
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </Stack>
  )
}
