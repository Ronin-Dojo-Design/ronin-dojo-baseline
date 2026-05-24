"use server"

import { slugify } from "@dirstack/utils"
import { after } from "next/server"
import * as z from "zod"
import { MediaType } from "~/.generated/prisma/client"
import { getRequestBrand } from "~/lib/brand-context"
import { adminActionClient } from "~/lib/safe-actions"
import { contentAtomSchema, contentVariantSchema } from "~/server/admin/content/schema"
import { idsSchema } from "~/server/admin/shared/schema"

export const upsertContentAtom = adminActionClient
  .inputSchema(contentAtomSchema)
  .action(async ({ parsedInput, ctx: { db, user, revalidate } }) => {
    const { id, tags, tools, ...input } = parsedInput
    const brand = await getRequestBrand()

    const slug = input.slug || slugify(input.title)
    const canonicalId = input.canonicalId || `atom-${new Date().getFullYear()}-${slug}`

    const tagIds = tags?.map(id => ({ id }))
    const toolIds = tools?.map(id => ({ id }))

    const atom = id
      ? await (async () => {
          // Brand-scope the update: verify the atom belongs to the current brand
          const existing = await db.contentAtom.findFirst({
            where: { id, variants: { some: { brand } } },
            select: { id: true },
          })
          if (!existing) {
            throw new Error("Content atom not found")
          }
          return db.contentAtom.update({
            where: { id },
            data: {
              ...input,
              slug,
              canonicalId,
              tags: { set: tagIds },
              tools: { set: toolIds },
            },
          })
        })()
      : await db.contentAtom.create({
          data: {
            ...input,
            slug,
            canonicalId,
            createdById: user.id,
            tags: { connect: tagIds },
            tools: { connect: toolIds },
            // Create a default BLOG variant for the current brand
            variants: {
              create: {
                brand,
                channel: "BLOG",
                status: "DRAFT",
                publicTitle: input.title,
                publicSlug: slug,
              },
            },
          },
        })

    after(async () => {
      revalidate({
        paths: ["/admin/content"],
        tags: ["content-atoms", `content-atom-${atom.id}`],
      })
    })

    return atom
  })

export const deleteContentAtoms = adminActionClient
  .inputSchema(idsSchema)
  .action(async ({ parsedInput: { ids }, ctx: { db, revalidate } }) => {
    const brand = await getRequestBrand()

    // Only delete atoms that have at least one variant for the current brand
    await db.contentAtom.deleteMany({
      where: { id: { in: ids }, variants: { some: { brand } } },
    })

    revalidate({
      paths: ["/admin/content"],
      tags: ["content-atoms"],
    })

    return true
  })

export const upsertContentVariant = adminActionClient
  .inputSchema(contentVariantSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate } }) => {
    const { id, publishDate, ...input } = parsedInput
    const brand = await getRequestBrand()

    const variant = id
      ? await db.contentVariant.update({
          where: { id },
          data: { ...input, publishDate: publishDate ?? null },
        })
      : await db.contentVariant.create({
          data: {
            ...input,
            brand,
            publishDate: publishDate ?? null,
          },
        })

    after(async () => {
      revalidate({
        paths: ["/admin/content", `/admin/content/${input.atomId}`],
        tags: ["content-atoms", `content-atom-${input.atomId}`],
      })
    })

    return variant
  })

export const deleteContentVariant = adminActionClient
  .inputSchema(idsSchema)
  .action(async ({ parsedInput: { ids }, ctx: { db, revalidate } }) => {
    const brand = await getRequestBrand()

    await db.contentVariant.deleteMany({
      where: { id: { in: ids }, brand },
    })

    revalidate({
      paths: ["/admin/content"],
      tags: ["content-atoms"],
    })

    return true
  })

const attachMediaSchema = z.object({
  atomId: z.string().min(1),
  url: z.string().url(),
  title: z.string().optional(),
  altText: z.string().optional(),
  purpose: z.string().optional(),
})

export const attachMediaToAtom = adminActionClient
  .inputSchema(attachMediaSchema)
  .action(async ({ parsedInput, ctx: { db, user, revalidate } }) => {
    const { atomId, url, title, altText, purpose } = parsedInput
    const brand = await getRequestBrand()

    const atom = await db.contentAtom.findFirst({
      where: {
        id: atomId,
        variants: { some: { brand } },
      },
      select: { id: true },
    })

    if (!atom) {
      throw new Error("Content atom not found")
    }

    const existingOrder = await db.mediaAttachment.aggregate({
      where: { contentAtomId: atomId },
      _max: { sortOrder: true },
    })

    // Infer media type from URL extension
    const ext = url.split(".").pop()?.toLowerCase() ?? ""
    const typeMap: Record<string, MediaType> = {
      jpg: MediaType.IMAGE,
      jpeg: MediaType.IMAGE,
      png: MediaType.IMAGE,
      gif: MediaType.IMAGE,
      webp: MediaType.IMAGE,
      svg: MediaType.IMAGE,
      mp4: MediaType.VIDEO,
      webm: MediaType.VIDEO,
      mov: MediaType.VIDEO,
      mp3: MediaType.DOCUMENT,
      wav: MediaType.DOCUMENT,
      ogg: MediaType.DOCUMENT,
      pdf: MediaType.DOCUMENT,
    }
    const mediaType = typeMap[ext] ?? MediaType.IMAGE

    // Create the Media record first
    const media = await db.media.create({
      data: {
        brand,
        type: mediaType,
        url,
        title,
        altText,
        uploadedById: user.id,
      },
    })

    // Then create the attachment linking media to atom
    const attachment = await db.mediaAttachment.create({
      data: {
        purpose,
        sortOrder: (existingOrder._max.sortOrder ?? -1) + 1,
        contentAtomId: atomId,
        mediaId: media.id,
      },
    })

    after(async () => {
      revalidate({
        paths: ["/admin/content", `/admin/content/${atomId}`],
        tags: ["content-atoms", `content-atom-${atomId}`],
      })
    })

    return attachment
  })

const reorderContentAtomMediaAttachmentsSchema = z.object({
  atomId: z.string().min(1),
  attachmentIds: z.array(z.string().min(1)),
})

export const reorderContentAtomMediaAttachments = adminActionClient
  .inputSchema(reorderContentAtomMediaAttachmentsSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate } }) => {
    const { atomId, attachmentIds } = parsedInput
    const brand = await getRequestBrand()
    const uniqueIds = new Set(attachmentIds)

    if (uniqueIds.size !== attachmentIds.length) {
      throw new Error("Media attachment order contains duplicate ids")
    }

    const atom = await db.contentAtom.findFirst({
      where: {
        id: atomId,
        variants: { some: { brand } },
      },
      select: {
        id: true,
        mediaAttachments: {
          select: { id: true },
        },
      },
    })

    if (!atom) {
      throw new Error("Content atom not found")
    }

    const currentIds = new Set(atom.mediaAttachments.map(({ id }) => id))

    for (const id of attachmentIds) {
      if (!currentIds.has(id)) {
        throw new Error("Media attachment order includes an invalid attachment")
      }
    }

    if (attachmentIds.length !== currentIds.size) {
      throw new Error("Media attachment order is stale")
    }

    await db.$transaction(async tx => {
      for (const [sortOrder, id] of attachmentIds.entries()) {
        const result = await tx.mediaAttachment.updateMany({
          where: { id, contentAtomId: atomId },
          data: { sortOrder },
        })

        if (result.count !== 1) {
          throw new Error("Media attachment order could not be saved")
        }
      }
    })

    after(async () => {
      revalidate({
        paths: ["/admin/content", `/admin/content/${atomId}`],
        tags: ["content-atoms", `content-atom-${atomId}`],
      })
    })

    return true
  })

export const removeMediaAttachment = adminActionClient
  .inputSchema(idsSchema)
  .action(async ({ parsedInput: { ids }, ctx: { db, revalidate } }) => {
    await db.mediaAttachment.deleteMany({
      where: { id: { in: ids } },
    })

    revalidate({
      paths: ["/admin/content"],
      tags: ["content-atoms"],
    })

    return true
  })
