"use server"

import { slugify } from "@dirstack/utils"
import { after } from "next/server"
import * as z from "zod"
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
      ? await db.contentAtom.update({
          where: { id },
          data: {
            ...input,
            slug,
            canonicalId,
            tags: { set: tagIds },
            tools: { set: toolIds },
          },
        })
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
    await db.contentAtom.deleteMany({
      where: { id: { in: ids } },
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
    await db.contentVariant.deleteMany({
      where: { id: { in: ids } },
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

    // Infer media type from URL extension
    const ext = url.split(".").pop()?.toLowerCase() ?? ""
    const typeMap: Record<string, string> = {
      jpg: "IMAGE",
      jpeg: "IMAGE",
      png: "IMAGE",
      gif: "IMAGE",
      webp: "IMAGE",
      svg: "IMAGE",
      mp4: "VIDEO",
      webm: "VIDEO",
      mov: "VIDEO",
      mp3: "AUDIO",
      wav: "AUDIO",
      ogg: "AUDIO",
      pdf: "DOCUMENT",
    }
    const mediaType = (typeMap[ext] ?? "IMAGE") as any

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
