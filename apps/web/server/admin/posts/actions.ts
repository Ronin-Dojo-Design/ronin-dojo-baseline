"use server"

import { after } from "next/server"
import { Brand } from "~/.generated/prisma/client"
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
            brand: Brand.BBL,
            tools: { connect: toolIds },
          },
        })

    after(async () => {
      revalidate({
        paths: ["/app/posts"],
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
      paths: ["/app/posts"],
      tags: ["posts"],
    })
  })
