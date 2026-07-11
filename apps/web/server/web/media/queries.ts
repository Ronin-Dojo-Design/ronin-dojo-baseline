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

export type PublicPassportMedia = {
  id: string
  type: "IMAGE" | "VIDEO" | "YOUTUBE" | "DOCUMENT"
  url: string
  thumbnailUrl: string | null
  title: string | null
  durationSec: number | null
  /** The attachment's curation slot (e.g. "podcast", "technique-highlight") — the rail axis. */
  purpose: string | null
  /** Linked-technique slug when the attachment references one → internal `/techniques/[slug]` route. */
  techniqueSlug: string | null
  /**
   * The ATTACHMENT's freemium flag (SESSION_0527 Slice 0, per-video) — true → premium (locked-preview).
   * The gate unit moved from the whole technique to the attachment, so a profile technique reel is
   * gated on its OWN flag (backfilled from the parent technique). Drives the per-item `locked` on the
   * profile technique rail. Non-technique attachments (podcasts/matches) default false → never locked.
   */
  isPremium: boolean
  sortOrder: number
}

/**
 * PUBLIC passport media (SESSION_0525 C1) — only `media.isPublic` attachments, no ACL, so it is
 * safe to read on the public profile. Feeds the rich-media-gated `profileMedia` highlight rails
 * (`buildProfileMedia`); the caller applies the tier gate, this only enforces the public flag. The
 * optional `technique` join lets a "technique-highlight" attachment link INTERNALLY to the
 * technique page (parity: TuffBuffs "Technique Reels" route) instead of opening the raw media.
 */
export async function getPublicPassportMedia(passportId: string): Promise<PublicPassportMedia[]> {
  const attachments = await db.mediaAttachment.findMany({
    where: { passportId, media: { isPublic: true } },
    select: {
      sortOrder: true,
      purpose: true,
      isPremium: true,
      technique: { select: { slug: true } },
      media: {
        select: {
          id: true,
          type: true,
          url: true,
          thumbnailUrl: true,
          title: true,
          durationSec: true,
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  })

  return attachments.map(attachment => ({
    id: attachment.media.id,
    type: attachment.media.type,
    url: attachment.media.url,
    thumbnailUrl: attachment.media.thumbnailUrl,
    title: attachment.media.title,
    durationSec: attachment.media.durationSec,
    purpose: attachment.purpose,
    techniqueSlug: attachment.technique?.slug ?? null,
    isPremium: attachment.isPremium,
    sortOrder: attachment.sortOrder,
  }))
}
