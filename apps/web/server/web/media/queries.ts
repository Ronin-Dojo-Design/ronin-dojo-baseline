import type { Brand } from "~/.generated/prisma/client"
import type { AuthzUser } from "~/lib/authz"
import { authorizeMediaTarget } from "~/server/web/media/media-authorization"
import { type MediaAttachTarget, mediaTargetWhere } from "~/server/web/media/media-targets"
import { db } from "~/services/db"

export type DashboardMediaAttachment = {
  attachmentId: string
  mediaId: string
  url: string
  type: "IMAGE" | "VIDEO" | "YOUTUBE" | "DOCUMENT"
  title: string | null
  altText: string | null
  isPublic: boolean
  sortOrder: number
}

/**
 * Dashboard-side attachment list for a target. Unlike the public payload (which
 * filters `media.isPublic`), this returns *all* attachments — including private
 * ones — so an authorized editor can manage them. Returns `null` when the user
 * is not authorized for the target.
 */
export async function getDashboardMediaAttachments({
  brand,
  user,
  target,
}: {
  brand: Brand
  user: AuthzUser
  target: MediaAttachTarget
}): Promise<DashboardMediaAttachment[] | null> {
  const authorized = await authorizeMediaTarget({ db, brand, user, target })
  if (!authorized) return null

  const attachments = await db.mediaAttachment.findMany({
    where: mediaTargetWhere(target),
    select: {
      id: true,
      sortOrder: true,
      media: {
        select: {
          id: true,
          url: true,
          type: true,
          title: true,
          altText: true,
          isPublic: true,
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  })

  return attachments.map(attachment => ({
    attachmentId: attachment.id,
    mediaId: attachment.media.id,
    url: attachment.media.url,
    type: attachment.media.type,
    title: attachment.media.title,
    altText: attachment.media.altText,
    isPublic: attachment.media.isPublic,
    sortOrder: attachment.sortOrder,
  }))
}
