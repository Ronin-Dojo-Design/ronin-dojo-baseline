"use client"

import { Trash2Icon, UploadIcon, UserRoundCheckIcon } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { type ChangeEvent, useRef, useState } from "react"
import { toast } from "sonner"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { Checkbox } from "~/components/common/checkbox"
import { H6 } from "~/components/common/heading"
import { Hint } from "~/components/common/hint"
import { Input } from "~/components/common/input"
import { Stack } from "~/components/common/stack"
import {
  promotePassportAvatarMedia,
  removeWebMedia,
  uploadWebMedia,
} from "~/server/web/media/actions"
import type { MediaAttachTarget } from "~/server/web/media/media-targets"
import type { DashboardMediaAttachment } from "~/server/web/media/queries"

type MediaAttachmentManagerProps = {
  target: MediaAttachTarget
  initialAttachments: DashboardMediaAttachment[]
  title?: string
  description?: string
  avatarUrl?: string | null
}

/**
 * Shared dashboard surface for the capability-gated web media pipeline. Renders
 * an upload control (with a per-upload public/private toggle and optional
 * caption) plus a grid of existing attachments with per-item remove. Every
 * action is re-authorized server-side for `target`; this component only mirrors
 * the result optimistically. Reused across the PromotionEvent gallery,
 * Technique, and Organization surfaces (SESSION_0322).
 */
export function MediaAttachmentManager({
  target,
  initialAttachments,
  title = "Media",
  description = "Upload images or video. Public items appear on the public page.",
  avatarUrl = null,
}: MediaAttachmentManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const publicToggleId = `media-public-${target.kind}-${target.id}`
  const [attachments, setAttachments] = useState<DashboardMediaAttachment[]>(initialAttachments)
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(avatarUrl)
  const [isPublic, setIsPublic] = useState(false)
  const [caption, setCaption] = useState("")

  const upload = useAction(uploadWebMedia, {
    onSuccess: ({ data }) => {
      if (!data) return
      setAttachments(current => [
        ...current,
        {
          attachmentId: data.attachmentId,
          mediaId: data.mediaId,
          url: data.url,
          type: "IMAGE",
          title: caption || null,
          altText: null,
          isPublic: data.isPublic,
          sortOrder: current.length,
        },
      ])
      setCaption("")
      toast.success("Media uploaded.")
    },
    onError: ({ error: { serverError, validationErrors } }) => {
      toast.error(validationErrors?.file?._errors?.[0] ?? serverError ?? "Failed to upload media.")
    },
  })

  const remove = useAction(removeWebMedia, {
    onSuccess: ({ input }) => {
      const removedAttachment = attachments.find(item => item.attachmentId === input.attachmentId)
      setAttachments(current => current.filter(item => item.attachmentId !== input.attachmentId))
      if (removedAttachment?.url === currentAvatarUrl) {
        setCurrentAvatarUrl(null)
      }
      toast.success("Media removed.")
    },
    onError: ({ error: { serverError } }) => {
      toast.error(serverError ?? "Failed to remove media.")
    },
  })

  const promoteAvatar = useAction(promotePassportAvatarMedia, {
    onSuccess: ({ data }) => {
      if (!data) return
      setCurrentAvatarUrl(data.avatarUrl)
      setAttachments(current =>
        current.map(item =>
          item.attachmentId === data.attachmentId ? { ...item, isPublic: true } : item,
        ),
      )
      toast.success("Avatar updated.")
    },
    onError: ({ error: { serverError, validationErrors } }) => {
      toast.error(
        validationErrors?.attachmentId?._errors?.[0] ?? serverError ?? "Failed to update avatar.",
      )
    },
  })

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      upload.execute({ target, file, isPublic, title: caption || undefined })
    }
    event.target.value = ""
  }

  return (
    <Card hover={false}>
      <CardHeader direction="column" size="xs">
        <H6 render={props => <h2 {...props}>{props.children}</h2>}>{title}</H6>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <Stack direction="column" size="md" className="w-full">
        <Stack size="sm" wrap className="w-full items-center">
          <Input
            placeholder="Optional caption"
            value={caption}
            onChange={event => setCaption(event.target.value)}
            className="min-w-48 flex-1"
          />
          <label
            htmlFor={publicToggleId}
            className="flex items-center gap-2 whitespace-nowrap text-sm"
          >
            <Checkbox
              id={publicToggleId}
              checked={isPublic}
              onCheckedChange={checked => setIsPublic(checked === true)}
            />
            Public
          </label>
          <Button
            type="button"
            size="sm"
            prefix={<UploadIcon />}
            isPending={upload.isPending}
            onClick={() => inputRef.current?.click()}
          >
            Upload
          </Button>
        </Stack>

        {attachments.length === 0 ? (
          <Hint>No media yet. Uploaded images and video appear here.</Hint>
        ) : (
          <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
            {attachments.map(attachment => (
              <div
                key={attachment.attachmentId}
                className="relative overflow-hidden rounded-md border bg-background"
              >
                {attachment.type === "VIDEO" ? (
                  <video src={attachment.url} className="aspect-square w-full object-cover" muted />
                ) : (
                  <img
                    src={attachment.url}
                    alt={attachment.altText ?? attachment.title ?? "Uploaded media"}
                    className="aspect-square w-full object-cover"
                  />
                )}

                <Badge
                  size="sm"
                  variant={attachment.isPublic ? "success" : "soft"}
                  className="absolute left-1 top-1"
                >
                  {attachment.isPublic ? "Public" : "Private"}
                </Badge>

                {target.kind === "passport" && currentAvatarUrl === attachment.url && (
                  <Badge size="sm" variant="info" className="absolute bottom-1 left-1">
                    Avatar
                  </Badge>
                )}

                <Stack size="xs" direction="column" className="absolute right-1 top-1">
                  {target.kind === "passport" &&
                    attachment.type === "IMAGE" &&
                    currentAvatarUrl !== attachment.url && (
                      <Button
                        type="button"
                        size="xs"
                        variant="secondary"
                        prefix={<UserRoundCheckIcon />}
                        isPending={promoteAvatar.isPending}
                        onClick={() =>
                          promoteAvatar.execute({
                            target: { kind: "passport", id: target.id },
                            attachmentId: attachment.attachmentId,
                          })
                        }
                      >
                        Use as avatar
                      </Button>
                    )}

                  <Button
                    type="button"
                    size="xs"
                    variant="destructive"
                    prefix={<Trash2Icon />}
                    isPending={remove.isPending}
                    onClick={() =>
                      remove.execute({ target, attachmentId: attachment.attachmentId })
                    }
                  >
                    Remove
                  </Button>
                </Stack>
              </div>
            ))}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleChange}
          className="hidden"
        />
      </Stack>
    </Card>
  )
}
