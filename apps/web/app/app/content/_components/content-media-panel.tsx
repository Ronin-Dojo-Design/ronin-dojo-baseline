"use client"

import { Trash2Icon, UploadIcon } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { type ChangeEvent, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import {
  MediaOrderControls,
  SortableMediaGrid,
  SortableMediaTile,
  useSortableMediaOrder,
} from "~/components/web/media/sortable-media-grid"
import {
  attachMediaToAtom,
  removeMediaAttachment,
  reorderContentAtomMediaAttachments,
} from "~/server/admin/content/actions"
import type { findContentAtomById } from "~/server/admin/content/queries"
import { uploadMedia } from "~/server/web/actions/media"
import { ALLOWED_MIMETYPES } from "~/server/web/shared/schema"

type Atom = NonNullable<Awaited<ReturnType<typeof findContentAtomById>>>
type MediaAttachment = Atom["mediaAttachments"][number]

type ContentMediaPanelProps = {
  atom: Atom
}

type SortableMediaAttachmentCardProps = {
  attachment: MediaAttachment
  isDragDisabled: boolean
  onRemove: (attachmentId: string) => void
}

const attachmentIds = (attachments: MediaAttachment[]) => attachments.map(({ id }) => id)

function SortableMediaAttachmentCard({
  attachment,
  isDragDisabled,
  onRemove,
}: SortableMediaAttachmentCardProps) {
  return (
    // The shared tile (WL-P2-49) renders the grip as the li's last child, so the `group`
    // hover-reveal moves from the Card to the li (same hover surface — the li wraps the Card
    // exactly; the grip keeps its shipped top-left placement).
    <SortableMediaTile
      as="li"
      id={attachment.id}
      disabled={isDragDisabled}
      className="group relative list-none"
      draggingClassName="opacity-70"
      aria-label={attachment.media.title || attachment.media.type}
      grip={{
        label: "Drag to reorder media",
        className:
          "absolute top-2 left-2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity",
      }}
    >
      <Card className="relative group overflow-hidden p-0">
        {attachment.media.url && (
          <Image
            src={attachment.media.thumbnailUrl || attachment.media.url}
            alt={attachment.media.altText || attachment.media.title || "Media"}
            width={400}
            height={300}
            className="w-full h-40 object-cover"
            unoptimized
          />
        )}
        <div className="p-2">
          <p className="text-xs font-medium truncate">
            {attachment.media.title || attachment.media.type}
          </p>
          {attachment.purpose && <p className="text-xs text-muted">{attachment.purpose}</p>}
        </div>
        <Button
          size="sm"
          variant="secondary"
          prefix={<Trash2Icon />}
          aria-label="Remove media attachment"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
          onClick={() => onRemove(attachment.id)}
        />
      </Card>
    </SortableMediaTile>
  )
}

export function ContentMediaPanel({ atom }: ContentMediaPanelProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [orderedAttachments, setOrderedAttachments] = useState(atom.mediaAttachments)

  const attach = useAction(attachMediaToAtom, {
    onSuccess: () => {
      toast.success("Media uploaded and attached")
      setIsUploading(false)
      router.refresh()
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Failed to attach media")
      setIsUploading(false)
    },
  })

  const upload = useAction(uploadMedia, {
    onSuccess: ({ data }) => {
      if (!data) return
      attach.execute({ atomId: atom.id, url: data })
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Upload failed")
      setIsUploading(false)
    },
  })

  const reorder = useAction(reorderContentAtomMediaAttachments, {
    onSuccess: () => {
      toast.success("Media order saved")
      router.refresh()
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Failed to save media order")
    },
  })

  useEffect(() => {
    setOrderedAttachments(atom.mediaAttachments)
  }, [atom.mediaAttachments])

  // Shared ordering mechanics (WL-P2-49) — the saved order derives from the server prop; reset
  // re-derives from it (a just-removed id is simply absent from the current items, so it drops).
  const {
    currentIds: currentOrder,
    hasOrderChanges,
    handleDragEnd,
    resetOrder,
  } = useSortableMediaOrder({
    items: orderedAttachments,
    setItems: setOrderedAttachments,
    getId: attachment => attachment.id,
    savedIds: attachmentIds(atom.mediaAttachments),
  })
  const isDragDisabled = reorder.isPending || isUploading || orderedAttachments.length < 2

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    upload.execute({ file, path: `content/${atom.id}/media` })
    // Reset input so same file can be re-selected
    e.target.value = ""
  }

  const handleSaveOrder = () => {
    reorder.execute({ atomId: atom.id, attachmentIds: currentOrder })
  }

  const handleRemove = async (attachmentId: string) => {
    if (!confirm("Remove this media attachment?")) return
    const result = await removeMediaAttachment({ ids: [attachmentId] })
    if (result?.data) {
      toast.success("Media attachment removed")
      setOrderedAttachments(items => items.filter(({ id }) => id !== attachmentId))
      router.refresh()
    }
  }

  return (
    <div className="grid gap-4">
      <Stack className="justify-between">
        <H4>Media ({atom.mediaAttachments.length})</H4>
        <Stack size="xs" wrap>
          {hasOrderChanges && (
            <MediaOrderControls
              isPending={reorder.isPending}
              onReset={resetOrder}
              onSave={handleSaveOrder}
            />
          )}
          <Button
            size="sm"
            variant="secondary"
            prefix={<UploadIcon />}
            isPending={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            Upload
          </Button>
        </Stack>
      </Stack>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_MIMETYPES.join(",")}
        onChange={handleUpload}
        className="hidden"
        title="Upload media"
      />

      {orderedAttachments.length > 0 ? (
        <SortableMediaGrid
          as="ul"
          ids={currentOrder}
          onDragEnd={handleDragEnd}
          className="grid gap-3 @md:grid-cols-2 @lg:grid-cols-3"
        >
          {orderedAttachments.map(attachment => (
            <SortableMediaAttachmentCard
              key={attachment.id}
              attachment={attachment}
              isDragDisabled={isDragDisabled}
              onRemove={handleRemove}
            />
          ))}
        </SortableMediaGrid>
      ) : (
        <p className="text-sm text-muted">
          No media attached. Upload images, videos, or audio to attach to this content atom.
        </p>
      )}
    </div>
  )
}
