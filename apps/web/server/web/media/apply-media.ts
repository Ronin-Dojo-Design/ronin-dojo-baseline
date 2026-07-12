import { randomUUID } from "node:crypto"
import { tryCatch } from "@dirstack/utils"
import type { Brand } from "~/.generated/prisma/client"
import type { AuthzUser } from "~/lib/authz"
import { getS3KeyFromUrl, removeS3File, uploadToS3Storage } from "~/lib/media"
import { sniffUploadBuffer } from "~/lib/media-guard"
import { authorizeMediaTarget } from "~/server/web/media/media-authorization"
import { MAX_WEB_UPLOAD_BYTES } from "~/server/web/media/media-schemas"
import { getMediaConfig } from "~/services/s3"
import { WEB_MEDIA_ERROR } from "~/server/web/media/media-errors"
import type {
  AttachWebMediaUrlInput,
  PromotePassportAvatarMediaInput,
  RemoveWebMediaInput,
  ReorderWebMediaInput,
  SetWebMediaPremiumInput,
  UploadWebMediaInput,
} from "~/server/web/media/media-schemas"
import { toVideoThumbnailUrl } from "~/lib/video-embed"
import {
  MEDIA_TARGET_ENTITY_TYPE,
  type MediaAttachTarget,
  mediaTargetCreateData,
  mediaTargetWhere,
} from "~/server/web/media/media-targets"
import type { db as appDb } from "~/services/db"

type AppDb = typeof appDb

export type WebMediaUploadResult = {
  attachmentId: string
  mediaId: string
  url: string
  isPublic: boolean
}

export type PassportAvatarPromotionResult = {
  attachmentId: string
  mediaId: string
  avatarUrl: string
}

// Only organization targets carry a meaningful org id for the audit row; the
// rest record null (technique/course org is one lookup away and not needed here).
const auditOrganizationId = (target: MediaAttachTarget) =>
  target.kind === "organization" ? target.id : null

/**
 * Shared preamble for the mutate-an-existing-attachment flows (remove / set-premium /
 * promote-avatar): authorize the target, then load the attachment via `id` combined with the
 * target FK so the lookup enforces the attachment actually belongs to the target the caller
 * claims. `select` is threaded per call site so each keeps its own projection. Throws
 * `UPLOAD_ACCESS_REQUIRED` / `ATTACHMENT_NOT_FOUND` — the same errors, in the same order, as
 * the inlined copies this replaces.
 */
// A fixed superset projection that covers every mutate-existing-attachment caller: removal needs
// `mediaId` + `media.url`, avatar-promotion additionally needs `media.type`, premium needs only `id`.
// Selecting the union (a few unused columns on one already-fetched row) keeps the helper non-generic,
// which sidesteps Prisma's deep-generic recursion on the polymorphic MediaAttachment relations.
async function authorizeAndFindAttachment({
  db,
  brand,
  user,
  target,
  attachmentId,
  allowAdminOverride = false,
}: {
  db: AppDb
  brand: Brand
  user: AuthzUser
  target: MediaAttachTarget
  attachmentId: string
  allowAdminOverride?: boolean
}) {
  const authorized = await authorizeMediaTarget({ db, brand, user, target, allowAdminOverride })
  if (!authorized) {
    throw new Error(WEB_MEDIA_ERROR.UPLOAD_ACCESS_REQUIRED)
  }

  const attachment = await db.mediaAttachment.findFirst({
    where: { id: attachmentId, ...mediaTargetWhere(target) },
    select: { id: true, mediaId: true, media: { select: { id: true, url: true, type: true } } },
  })
  if (!attachment) {
    throw new Error(WEB_MEDIA_ERROR.ATTACHMENT_NOT_FOUND)
  }

  return attachment
}

/**
 * Authorize → upload to S3 → create `Media` + `MediaAttachment` + `AuditLog`.
 * The S3 upload runs *outside* the DB transaction (no network inside a tx); a
 * failed tx leaves at most an orphaned S3 object, never a half-attached row.
 */
export async function applyWebMediaUpload({
  db,
  brand,
  user,
  input,
  allowAdminOverride = false,
  allowVideo = false,
  fileUploadCapability = false,
}: {
  db: AppDb
  brand: Brand
  user: AuthzUser
  input: UploadWebMediaInput
  /** Opt-in admin bypass for setting an unowned/placeholder passport's media. Default false. */
  allowAdminOverride?: boolean
  /**
   * Whether the sniffed bytes may be a video. Default `false` (fail-closed): image-only
   * callers like avatar upload reject a spoofed `image/*` carrying video bytes at the sniff,
   * so no stray VIDEO media/attachment ever persists. The general media library opts in.
   */
  allowVideo?: boolean
  /**
   * SESSION_0529 review fix (Doug P2-1) — the caller's resolved `canUploadMediaForUser` (RBAC
   * `media.manage`/`media.upload` ∨ staff/org grants ∨ S3_UPLOAD entitlement), threaded as a
   * boolean so this core stays hermetic. Enforced for TECHNIQUE targets only: Slice 3B's author
   * branch in `authorizeMediaTarget` means target-authz alone no longer implies R2 FILE-upload
   * capability there (operator policy: member video = URL-paste only; R2 stays capability-gated).
   * Author media MANAGEMENT (url-attach / premium / reorder / remove) is deliberately NOT gated,
   * and member-owned passport/rankMilestone flows (avatars, belt journey) are unaffected.
   */
  fileUploadCapability?: boolean
}): Promise<WebMediaUploadResult> {
  const authorized = await authorizeMediaTarget({
    db,
    brand,
    user,
    target: input.target,
    allowAdminOverride,
  })
  if (!authorized) {
    throw new Error(WEB_MEDIA_ERROR.UPLOAD_ACCESS_REQUIRED)
  }
  if (input.target.kind === "technique" && !fileUploadCapability) {
    throw new Error(WEB_MEDIA_ERROR.FILE_UPLOAD_CAPABILITY_REQUIRED)
  }

  const { file, target } = input
  // Trust the bytes, not the client-declared MIME: sniff + reject SVG / non-media.
  // This path feeds public avatars, so a stored SVG would be stored-XSS.
  const {
    buffer,
    mime,
    kind: type,
  } = await sniffUploadBuffer(file, {
    maxBytes: MAX_WEB_UPLOAD_BYTES,
    allowVideo,
  })
  const url = await uploadToS3Storage(buffer, `media/${randomUUID()}`, brand)

  return db.$transaction(async tx => {
    const txDb = tx as AppDb

    const media = await txDb.media.create({
      data: {
        brand,
        type,
        url,
        title: input.title ?? file.name,
        altText: input.altText,
        mimeType: mime || undefined,
        sizeBytes: buffer.byteLength,
        isPublic: input.isPublic,
        uploadedBy: { connect: { id: user.id } },
      },
      select: { id: true },
    })

    const attachment = await txDb.mediaAttachment.create({
      data: {
        mediaId: media.id,
        ...mediaTargetCreateData(target),
      },
      select: { id: true },
    })

    await txDb.auditLog.create({
      data: {
        brand,
        action: "media.attached",
        entityType: MEDIA_TARGET_ENTITY_TYPE[target.kind],
        entityId: target.id,
        organizationId: auditOrganizationId(target),
        userId: user.id,
        after: {
          mediaId: media.id,
          attachmentId: attachment.id,
          url,
          isPublic: input.isPublic,
        },
      },
    })

    return { attachmentId: attachment.id, mediaId: media.id, url, isPublic: input.isPublic }
  })
}

export type WebMediaUrlAttachResult = {
  attachmentId: string
  mediaId: string
  url: string
  thumbnailUrl: string | null
  isPublic: boolean
}

/**
 * SESSION_0529 Slice 3B — attach an EXTERNAL video by URL (the member video path; the R2 file
 * uploader stays out of the member UI). Authorize → validate the provider (YouTube-only: the one
 * provider with a derivable static poster + a safe embed id shape, `lib/video-embed`) → create
 * `Media { type: YOUTUBE }` + `MediaAttachment` + `AuditLog`. `isPublic: true` — a YouTube link is
 * inherently public content; the freemium gate rides the ATTACHMENT `isPremium` flag (default
 * false), not the visibility flag. No S3/R2 write anywhere on this path.
 */
export async function applyWebMediaUrlAttach({
  db,
  brand,
  user,
  input,
}: {
  db: AppDb
  brand: Brand
  user: AuthzUser
  input: AttachWebMediaUrlInput
}): Promise<WebMediaUrlAttachResult> {
  const authorized = await authorizeMediaTarget({ db, brand, user, target: input.target })
  if (!authorized) {
    throw new Error(WEB_MEDIA_ERROR.UPLOAD_ACCESS_REQUIRED)
  }

  const url = input.url.trim()
  // YouTube-only: `toVideoThumbnailUrl` returns a poster ONLY for a parseable YouTube video id
  // (charset-validated, SESSION_0495 C1-11) — anything else (Vimeo, arbitrary urls) is rejected.
  const thumbnailUrl = toVideoThumbnailUrl(url)
  if (!thumbnailUrl) {
    throw new Error(WEB_MEDIA_ERROR.VIDEO_URL_UNSUPPORTED)
  }

  return db.$transaction(async tx => {
    const txDb = tx as AppDb

    const media = await txDb.media.create({
      data: {
        brand,
        type: "YOUTUBE",
        url,
        thumbnailUrl,
        title: input.title,
        isPublic: true,
        uploadedBy: { connect: { id: user.id } },
      },
      select: { id: true },
    })

    const attachment = await txDb.mediaAttachment.create({
      data: {
        mediaId: media.id,
        ...mediaTargetCreateData(input.target),
      },
      select: { id: true },
    })

    await txDb.auditLog.create({
      data: {
        brand,
        action: "media.attached",
        entityType: MEDIA_TARGET_ENTITY_TYPE[input.target.kind],
        entityId: input.target.id,
        organizationId: auditOrganizationId(input.target),
        userId: user.id,
        after: {
          mediaId: media.id,
          attachmentId: attachment.id,
          url,
          isPublic: true,
          source: "url",
        },
      },
    })

    return { attachmentId: attachment.id, mediaId: media.id, url, thumbnailUrl, isPublic: true }
  })
}

/**
 * SESSION_0529 Slice 3B — persist a drag-reorder (`sortOrder` = array index). Authorize the target,
 * then verify the id list is EXACTLY the target's full attachment set (same-set check) before
 * writing — a foreign/missing id rejects the whole batch (one author can never reorder another
 * target's rail), and a PARTIAL subset rejects too (review fix P3: writing indexes for a subset
 * would leave duplicate `sortOrder` positions against the untouched rows).
 */
export async function applyWebMediaReorder({
  db,
  brand,
  user,
  input,
}: {
  db: AppDb
  brand: Brand
  user: AuthzUser
  input: ReorderWebMediaInput
}): Promise<{ reordered: true }> {
  const authorized = await authorizeMediaTarget({ db, brand, user, target: input.target })
  if (!authorized) {
    throw new Error(WEB_MEDIA_ERROR.UPLOAD_ACCESS_REQUIRED)
  }

  const targetAttachments = await db.mediaAttachment.findMany({
    where: mediaTargetWhere(input.target),
    select: { id: true },
  })
  const targetIds = new Set(targetAttachments.map(attachment => attachment.id))
  // The schema already rejects duplicate input ids, so equal sizes + full membership = same set.
  if (input.attachmentIds.some(id => !targetIds.has(id))) {
    throw new Error(WEB_MEDIA_ERROR.ATTACHMENT_NOT_FOUND)
  }
  if (input.attachmentIds.length !== targetIds.size) {
    throw new Error(WEB_MEDIA_ERROR.REORDER_SET_INCOMPLETE)
  }

  await db.$transaction(async tx => {
    const txDb = tx as AppDb
    for (const [index, id] of input.attachmentIds.entries()) {
      await txDb.mediaAttachment.update({ where: { id }, data: { sortOrder: index } })
    }
    await txDb.auditLog.create({
      data: {
        brand,
        action: "media.reordered",
        entityType: MEDIA_TARGET_ENTITY_TYPE[input.target.kind],
        entityId: input.target.id,
        organizationId: auditOrganizationId(input.target),
        userId: user.id,
        after: { attachmentIds: input.attachmentIds },
      },
    })
  })

  return { reordered: true }
}

/**
 * Authorize → verify the attachment belongs to the target → detach. The
 * underlying `Media` + S3 object are removed only when no other attachment
 * references the media; both cleanups are best-effort so a shared/FK-held media
 * never blocks the detach the user asked for.
 */
export async function applyWebMediaRemoval({
  db,
  brand,
  user,
  input,
}: {
  db: AppDb
  brand: Brand
  user: AuthzUser
  input: RemoveWebMediaInput
}): Promise<{ removed: true }> {
  const attachment = await authorizeAndFindAttachment({
    db,
    brand,
    user,
    target: input.target,
    attachmentId: input.attachmentId,
  })

  await db.mediaAttachment.delete({ where: { id: attachment.id } })

  if (input.target.kind === "passport") {
    await db.passport.updateMany({
      where: { id: input.target.id, avatarUrl: attachment.media.url },
      data: { avatarUrl: null },
    })
  }

  const remaining = await db.mediaAttachment.count({ where: { mediaId: attachment.mediaId } })
  if (remaining === 0) {
    const { error } = await tryCatch(db.media.delete({ where: { id: attachment.mediaId } }))
    if (!error) {
      const key = getS3KeyFromUrl(attachment.media.url, getMediaConfig(brand).bucket)
      if (key) await tryCatch(removeS3File(key, brand))
    }
  }

  await db.auditLog.create({
    data: {
      brand,
      action: "media.detached",
      entityType: MEDIA_TARGET_ENTITY_TYPE[input.target.kind],
      entityId: input.target.id,
      organizationId: auditOrganizationId(input.target),
      userId: user.id,
      before: { attachmentId: attachment.id, mediaId: attachment.mediaId },
    },
  })

  return { removed: true }
}

/**
 * Authorize → verify the attachment belongs to the target → flip its `isPremium` flag
 * (SESSION_0527 Slice 2, per-video freemium authoring). Combining `attachmentId` with the target FK
 * in one `where` enforces the attachment actually belongs to the target the caller claims — the same
 * ownership guard `applyWebMediaRemoval` uses. The public freemium gate (`gateTechniqueMedia`,
 * `buildProfileMedia`) reads this flag, so the action revalidates the technique surfaces.
 */
export async function applyWebMediaPremium({
  db,
  brand,
  user,
  input,
}: {
  db: AppDb
  brand: Brand
  user: AuthzUser
  input: SetWebMediaPremiumInput
}): Promise<{ attachmentId: string; isPremium: boolean }> {
  const attachment = await authorizeAndFindAttachment({
    db,
    brand,
    user,
    target: input.target,
    attachmentId: input.attachmentId,
  })

  await db.mediaAttachment.update({
    where: { id: attachment.id },
    data: { isPremium: input.isPremium },
  })

  await db.auditLog.create({
    data: {
      brand,
      action: "media.premium.set",
      entityType: MEDIA_TARGET_ENTITY_TYPE[input.target.kind],
      entityId: input.target.id,
      organizationId: auditOrganizationId(input.target),
      userId: user.id,
      after: { attachmentId: attachment.id, isPremium: input.isPremium },
    },
  })

  return { attachmentId: attachment.id, isPremium: input.isPremium }
}

/**
 * Explicitly promotes one Passport image attachment to the canonical avatar URL.
 * The selected media is marked public because `Passport.avatarUrl` can be
 * rendered outside private dashboard media management.
 */
export async function applyPassportAvatarPromotion({
  db,
  brand,
  user,
  input,
  allowAdminOverride = false,
}: {
  db: AppDb
  brand: Brand
  user: AuthzUser
  input: PromotePassportAvatarMediaInput
  /** Opt-in admin bypass for promoting an unowned/placeholder passport's avatar. Default false. */
  allowAdminOverride?: boolean
}): Promise<PassportAvatarPromotionResult> {
  const attachment = await authorizeAndFindAttachment({
    db,
    brand,
    user,
    target: input.target,
    attachmentId: input.attachmentId,
    allowAdminOverride,
  })
  if (attachment.media.type !== "IMAGE") {
    throw new Error(WEB_MEDIA_ERROR.AVATAR_IMAGE_REQUIRED)
  }

  return db.$transaction(async tx => {
    const txDb = tx as AppDb

    await txDb.media.update({
      where: { id: attachment.mediaId },
      data: { isPublic: true },
    })

    await txDb.passport.update({
      where: { id: input.target.id },
      data: { avatarUrl: attachment.media.url },
      select: { id: true },
    })

    await txDb.auditLog.create({
      data: {
        brand,
        action: "passport.avatar.promoted",
        entityType: MEDIA_TARGET_ENTITY_TYPE.passport,
        entityId: input.target.id,
        organizationId: null,
        userId: user.id,
        after: {
          mediaId: attachment.mediaId,
          attachmentId: attachment.id,
          avatarUrl: attachment.media.url,
        },
      },
    })

    return {
      attachmentId: attachment.id,
      mediaId: attachment.mediaId,
      avatarUrl: attachment.media.url,
    }
  })
}
