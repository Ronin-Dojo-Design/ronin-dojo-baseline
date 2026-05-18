"use server"

import { after } from "next/server"
import { getRequestBrand } from "~/lib/brand-context"
import { adminActionClient } from "~/lib/safe-actions"
import { postSchema } from "~/server/admin/posts/schema"
import { idsSchema } from "~/server/admin/shared/schema"

export const upsertPost = adminActionClient
  .inputSchema(postSchema)
  .action(async ({ parsedInput, ctx: { db, user, revalidate } }) => {
    const { id, tools, ...input } = parsedInput

    // Strip content to plain text for search/read-time
    const plainText = input.content.replace(/[#*_~`>[\]()!-]/g, "").trim()
    const toolIds = tools?.map(id => ({ id }))
    const brand = await getRequestBrand()

    const post = id
      ? await db.post.update({
          where: { id },
          data: {
            ...input,
            slug: input.slug || "",
            plainText,
            tools: { set: toolIds },
          },
        })
      : await db.post.create({
          data: {
            ...input,
            slug: input.slug || "",
            plainText,
            authorId: user.id,
            brand,
            tools: { connect: toolIds },
          },
        })

    after(async () => {
      revalidate({
        paths: ["/admin/posts"],
        tags: ["posts", `post-${post.slug}`],
      })
    })

    return post
  })

export const deletePosts = adminActionClient
  .inputSchema(idsSchema)
  .action(async ({ parsedInput: { ids }, ctx: { db, revalidate } }) => {
    await db.post.deleteMany({
      where: { id: { in: ids } },
    })

    revalidate({
      paths: ["/admin/posts"],
      tags: ["posts"],
    })
  })
