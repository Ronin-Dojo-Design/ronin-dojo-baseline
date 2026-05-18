"use server"

import { after } from "next/server"
import { z } from "zod/v4"
import { adminActionClient } from "~/lib/safe-actions"
import { idsSchema } from "~/server/admin/shared/schema"

const createMediaSchema = z.object({
  brand: z.string(),
  type: z.enum(["IMAGE", "VIDEO", "AUDIO", "DOCUMENT"]),
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
        paths: ["/admin/media"],
        tags: ["media"],
      })
    })

    return media
  })

export const deleteMedia = adminActionClient
  .inputSchema(idsSchema)
  .action(async ({ parsedInput: { ids }, ctx: { db, revalidate } }) => {
    await db.media.deleteMany({
      where: { id: { in: ids } },
    })

    revalidate({
      paths: ["/admin/media"],
      tags: ["media"],
    })

    return true
  })
