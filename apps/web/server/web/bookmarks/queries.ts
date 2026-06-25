import type { Prisma } from "~/.generated/prisma/client"
import { toolManyPayload } from "~/server/web/tools/payloads"
import { db } from "~/services/db"

type BookmarkOrderBy =
  | Prisma.BookmarkOrderByWithRelationInput
  | Prisma.BookmarkOrderByWithRelationInput[]

type PublicBookmarkFindManyArgs = {
  where?: Prisma.BookmarkWhereInput
  orderBy?: BookmarkOrderBy
  take?: number
  skip?: number
  cursor?: Prisma.BookmarkWhereUniqueInput
}

export const findBookmarkedToolIds = async (userId: string) => {
  const bookmarks = await db.bookmark.findMany({
    where: { userId },
    select: { toolId: true },
    orderBy: { createdAt: "desc" },
  })

  return bookmarks.map(bookmark => bookmark.toolId)
}

export const findBookmarkedTools = async (
  userId: string,
  { where, orderBy, ...args }: PublicBookmarkFindManyArgs = {},
) => {
  return db.bookmark.findMany({
    ...args,
    where: { userId, ...where },
    orderBy: orderBy ?? { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      tool: { select: toolManyPayload },
    },
  })
}
