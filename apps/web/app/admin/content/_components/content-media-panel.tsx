"use client"

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVerticalIcon, RotateCcwIcon, SaveIcon, Trash2Icon, UploadIcon } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { type ChangeEvent, type CSSProperties, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: attachment.id,
    disabled: isDragDisabled,
  })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={isDragging ? "list-none opacity-70" : "list-none"}
      aria-label={attachment.media.title || attachment.media.type}
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
          prefix={<GripVerticalIcon />}
          aria-label="Drag to reorder media"
          disabled={isDragDisabled}
          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
          {...attributes}
          {...listeners}
        />
        <Button
          size="sm"
          variant="secondary"
          prefix={<Trash2Icon />}
          aria-label="Remove media attachment"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
          onClick={() => onRemove(attachment.id)}
        />
      </Card>
    </li>
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const savedOrder = attachmentIds(atom.mediaAttachments)
  const currentOrder = attachmentIds(orderedAttachments)
  const hasOrderChanges =
    savedOrder.length === currentOrder.length &&
    savedOrder.some((id, index) => currentOrder[index] !== id)
  const isDragDisabled = reorder.isPending || isUploading || orderedAttachments.length < 2

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    upload.execute({ file, path: `content/${atom.id}/media` })
    // Reset input so same file can be re-selected
    e.target.value = ""
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return
    if (active.id === over.id) return

    setOrderedAttachments(items => {
      const oldIndex = items.findIndex(({ id }) => id === String(active.id))
      const newIndex = items.findIndex(({ id }) => id === String(over.id))
      if (oldIndex === -1 || newIndex === -1) return items
      return arrayMove(items, oldIndex, newIndex)
    })
  }

  const handleSaveOrder = () => {
    reorder.execute({ atomId: atom.id, attachmentIds: attachmentIds(orderedAttachments) })
  }

  const handleResetOrder = () => {
    setOrderedAttachments(atom.mediaAttachments)
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
            <>
              <Button
                size="sm"
                variant="secondary"
                prefix={<RotateCcwIcon />}
                disabled={reorder.isPending}
                onClick={handleResetOrder}
              >
                Reset
              </Button>
              <Button
                size="sm"
                variant="primary"
                prefix={<SaveIcon />}
                isPending={reorder.isPending}
                onClick={handleSaveOrder}
              >
                Save order
              </Button>
            </>
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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={currentOrder} strategy={rectSortingStrategy}>
            <ul className="grid gap-3 @md:grid-cols-2 @lg:grid-cols-3">
              {orderedAttachments.map(attachment => (
                <SortableMediaAttachmentCard
                  key={attachment.id}
                  attachment={attachment}
                  isDragDisabled={isDragDisabled}
                  onRemove={handleRemove}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      ) : (
        <p className="text-sm text-muted">
          No media attached. Upload images, videos, or audio to attach to this content atom.
        </p>
      )}
    </div>
  )
}
