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
  PromotePassportAvatarMediaInput,
  RemoveWebMediaInput,
  UploadWebMediaInput,
} from "~/server/web/media/media-schemas"
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
}: {
  db: AppDb
  brand: Brand
  user: AuthzUser
  input: UploadWebMediaInput
  /** Opt-in admin bypass for setting an unowned/placeholder passport's media. Default false. */
  allowAdminOverride?: boolean
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

  const { file, target } = input
  // Trust the bytes, not the client-declared MIME: sniff + reject SVG / non-media.
  // This path feeds public avatars, so a stored SVG would be stored-XSS.
  const {
    buffer,
    mime,
    kind: type,
  } = await sniffUploadBuffer(file, {
    maxBytes: MAX_WEB_UPLOAD_BYTES,
    allowVideo: true,
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
  const authorized = await authorizeMediaTarget({ db, brand, user, target: input.target })
  if (!authorized) {
    throw new Error(WEB_MEDIA_ERROR.UPLOAD_ACCESS_REQUIRED)
  }

  // Combining the id with the target FK in one `where` enforces that the
  // attachment actually belongs to the target the caller claims.
  const attachment = await db.mediaAttachment.findFirst({
    where: { id: input.attachmentId, ...mediaTargetWhere(input.target) },
    select: { id: true, mediaId: true, media: { select: { url: true } } },
  })
  if (!attachment) {
    throw new Error(WEB_MEDIA_ERROR.ATTACHMENT_NOT_FOUND)
  }

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

  const attachment = await db.mediaAttachment.findFirst({
    where: { id: input.attachmentId, ...mediaTargetWhere(input.target) },
    select: {
      id: true,
      mediaId: true,
      media: { select: { id: true, url: true, type: true } },
    },
  })
  if (!attachment) {
    throw new Error(WEB_MEDIA_ERROR.ATTACHMENT_NOT_FOUND)
  }
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
