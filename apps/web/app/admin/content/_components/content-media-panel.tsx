"use client"

import { Trash2Icon, UploadIcon } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { type ChangeEvent, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { H4 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { attachMediaToAtom, removeMediaAttachment } from "~/server/admin/content/actions"
import type { findContentAtomById } from "~/server/admin/content/queries"
import { uploadMedia } from "~/server/web/actions/media"
import { ALLOWED_MIMETYPES } from "~/server/web/shared/schema"

type Atom = NonNullable<Awaited<ReturnType<typeof findContentAtomById>>>

type ContentMediaPanelProps = {
  atom: Atom
}

export function ContentMediaPanel({ atom }: ContentMediaPanelProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

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

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("path", `content/${atom.id}/media`)
    upload.execute({ file, path: `content/${atom.id}/media` })
    // Reset input so same file can be re-selected
    e.target.value = ""
  }

  const handleRemove = async (attachmentId: string) => {
    if (!confirm("Remove this media attachment?")) return
    const result = await removeMediaAttachment({ ids: [attachmentId] })
    if (result?.data) {
      toast.success("Media attachment removed")
      router.refresh()
    }
  }

  return (
    <div className="grid gap-4">
      <Stack className="justify-between">
        <H4>Media ({atom.mediaAttachments.length})</H4>
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

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_MIMETYPES.join(",")}
        onChange={handleUpload}
        className="hidden"
        title="Upload media"
      />

      {atom.mediaAttachments.length > 0 ? (
        <div className="grid gap-3 @md:grid-cols-2 @lg:grid-cols-3">
          {atom.mediaAttachments.map(att => (
            <div key={att.id} className="relative group rounded-lg border bg-card overflow-hidden">
              {att.media.url && (
                <Image
                  src={att.media.thumbnailUrl || att.media.url}
                  alt={att.media.altText || att.media.title || "Media"}
                  width={400}
                  height={300}
                  className="w-full h-40 object-cover"
                  unoptimized
                />
              )}
              <div className="p-2">
                <p className="text-xs font-medium truncate">{att.media.title || att.media.type}</p>
                {att.purpose && <p className="text-xs text-muted">{att.purpose}</p>}
              </div>
              <Button
                size="sm"
                variant="secondary"
                prefix={<Trash2Icon />}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(att.id)}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">
          No media attached. Upload images, videos, or audio to attach to this content atom.
        </p>
      )}
    </div>
  )
}
