"use server"

import { randomUUID } from "node:crypto"
import { after } from "next/server"
import { z } from "zod/v4"
import { getS3KeyFromUrl, removeS3File, uploadToS3Storage } from "~/lib/media"
import { adminActionClient } from "~/lib/safe-actions"
import { idsSchema } from "~/server/admin/shared/schema"

/**
 * The set of entity types that can receive a MediaAttachment. Each value
 * maps to a nullable FK column on the MediaAttachment model.
 */
const attachableEntityType = z.enum([
  "passport",
  "technique",
  "event",
  "rankAward",
  "course",
  "organization",
  "contentAtom",
  "certificateTemplate",
])

export type AttachableEntityType = z.infer<typeof attachableEntityType>

const createMediaSchema = z.object({
  brand: z.string(),
  type: z.enum(["IMAGE", "VIDEO", "YOUTUBE", "DOCUMENT"]),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  altText: z.string().optional(),
  mimeType: z.string().optional(),
  sizeBytes: z.number().optional(),
  widthPx: z.number().optional(),
  heightPx: z.number().optional(),
  isPublic: z.boolean().default(false),
})

export const createMedia = adminActionClient
  .inputSchema(createMediaSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate, user } }) => {
    const { brand, type, ...rest } = parsedInput
    const media = await db.media.create({
      data: {
        ...rest,
        brand: brand as any,
        type: type as any,
        uploadedBy: { connect: { id: user.id } },
      },
    })

    after(async () => {
      revalidate({
        paths: ["/app/media"],
        tags: ["media"],
      })
    })

    return media
  })

const MAX_LIBRARY_UPLOAD_BYTES = 25 * 1024 * 1024

const uploadMediaToLibrarySchema = z.object({
  file: z
    .instanceof(File)
    .refine(file => file.size > 0, "File is empty.")
    .refine(file => file.size <= MAX_LIBRARY_UPLOAD_BYTES, "File exceeds the 25MB limit.")
    .refine(
      file => file.type.startsWith("image/") || file.type.startsWith("video/"),
      "Only image and video files are allowed.",
    ),
  title: z.string().optional(),
  isPublic: z.boolean().default(false),
})

/**
 * Uploads a file to S3 and persists a tracked `Media` record for it. This is the
 * media-library counterpart to the web `uploadMedia` action — the latter only
 * returns a URL for a single form field and never creates a `Media` row.
 */
export const uploadMediaToLibrary = adminActionClient
  .inputSchema(uploadMediaToLibrarySchema)
  .action(
    async ({ parsedInput: { file, title, isPublic }, ctx: { db, revalidate, user, brand } }) => {
      const buffer = Buffer.from(await file.arrayBuffer())
      const url = await uploadToS3Storage(buffer, `media/${randomUUID()}`)
      const type = file.type.startsWith("video/") ? "VIDEO" : "IMAGE"

      const media = await db.media.create({
        data: {
          brand,
          type,
          url,
          title: title ?? file.name,
          mimeType: file.type || undefined,
          sizeBytes: file.size,
          isPublic,
          uploadedBy: { connect: { id: user.id } },
        },
      })

      after(async () => {
        revalidate({
          paths: ["/app/media"],
          tags: ["media"],
        })
      })

      return media
    },
  )

export const deleteMedia = adminActionClient
  .inputSchema(idsSchema)
  .action(async ({ parsedInput: { ids }, ctx: { db, revalidate } }) => {
    const items = await db.media.findMany({
      where: { id: { in: ids } },
      select: { url: true },
    })

    await db.media.deleteMany({
      where: { id: { in: ids } },
    })

    // Best-effort S3 cleanup so deleted rows don't leave orphaned objects. A
    // failed object delete (e.g. already gone) must not fail the row deletion.
    await Promise.allSettled(
      items.map(({ url }) => {
        const key = getS3KeyFromUrl(url)
        return key ? removeS3File(key) : Promise.resolve()
      }),
    )

    revalidate({
      paths: ["/app/media"],
      tags: ["media"],
    })

    return true
  })

// ---------------------------------------------------------------------------
// MediaAttachment attach / detach
// ---------------------------------------------------------------------------

const attachMediaSchema = z.object({
  mediaId: z.string().min(1),
  entityType: attachableEntityType,
  entityId: z.string().min(1),
  purpose: z.string().optional(),
  sortOrder: z.number().int().default(0),
})

/**
 * Attach a Media record to an entity via MediaAttachment. Exactly one FK
 * column (determined by `entityType`) is set; the rest stay null.
 */
export const attachMedia = adminActionClient
  .inputSchema(attachMediaSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate } }) => {
    const { mediaId, entityType, entityId, purpose, sortOrder } = parsedInput

    // Build the FK column dynamically: entityType "rankAward" → { rankAwardId: entityId }
    const fkColumn = `${entityType}Id` as const

    const attachment = await db.mediaAttachment.create({
      data: {
        mediaId,
        [fkColumn]: entityId,
        purpose,
        sortOrder,
      },
    })

    after(async () => {
      revalidate({
        paths: ["/app/media"],
        tags: ["media"],
      })
    })

    return attachment
  })

/**
 * Detach (delete) one or more MediaAttachment rows by id.
 */
export const detachMedia = adminActionClient
  .inputSchema(idsSchema)
  .action(async ({ parsedInput: { ids }, ctx: { db, revalidate } }) => {
    await db.mediaAttachment.deleteMany({
      where: { id: { in: ids } },
    })

    after(async () => {
      revalidate({
        paths: ["/app/media"],
        tags: ["media"],
      })
    })

    return true
  })
