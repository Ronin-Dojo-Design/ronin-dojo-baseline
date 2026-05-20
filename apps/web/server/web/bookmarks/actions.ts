"use server"

import { userActionClient } from "~/lib/safe-actions"
import { bookmarkInputSchema, setBookmarkInputSchema } from "~/server/web/bookmarks/schema"

export const checkBookmark = userActionClient
  .inputSchema(bookmarkInputSchema)
  .action(async ({ parsedInput: { toolId }, ctx: { db, user } }) => {
    const bookmark = await db.bookmark.findUnique({
      where: { userId_toolId: { userId: user.id, toolId } },
      select: { id: true },
    })

    return { bookmarked: Boolean(bookmark) }
  })

export const setBookmark = userActionClient
  .inputSchema(setBookmarkInputSchema)
  .action(async ({ parsedInput: { toolId, bookmarked }, ctx: { db, user, revalidate } }) => {
    if (bookmarked) {
      await db.bookmark.upsert({
        where: { userId_toolId: { userId: user.id, toolId } },
        update: {},
        create: { userId: user.id, toolId },
      })
    } else {
      await db.bookmark.deleteMany({
        where: { userId: user.id, toolId },
      })
    }

    revalidate({
      paths: ["/dashboard/bookmarks"],
      tags: ["bookmarks", `bookmark-${toolId}`],
    })

    return { bookmarked }
  })

export const removeBookmark = userActionClient
  .inputSchema(bookmarkInputSchema)
  .action(async ({ parsedInput: { toolId }, ctx: { db, user, revalidate } }) => {
    await db.bookmark.deleteMany({
      where: { userId: user.id, toolId },
    })

    revalidate({
      paths: ["/dashboard/bookmarks"],
      tags: ["bookmarks", `bookmark-${toolId}`],
    })

    return { removed: true }
  })
