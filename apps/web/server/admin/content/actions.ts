"use server"

import { slugify } from "@dirstack/utils"
import { after } from "next/server"
import { getRequestBrand } from "~/lib/brand-context"
import { adminActionClient } from "~/lib/safe-actions"
import { contentAtomSchema } from "~/server/admin/content/schema"
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
