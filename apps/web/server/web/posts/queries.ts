import { PostStatus } from "~/.generated/prisma/client"
import { db } from "~/services/db"
import type { Brand } from "~/.generated/prisma/client"

export const findPublishedPosts = async (brand: Brand) => {
  return db.post.findMany({
    where: {
      brand,
      status: PostStatus.Published,
      publishedAt: { lte: new Date() },
    },
    include: { author: { select: { id: true, name: true, image: true } } },
    orderBy: { publishedAt: "desc" },
  })
}

export const findPublishedPostBySlug = async (slug: string, brand: Brand) => {
  return db.post.findFirst({
    where: {
      slug,
      brand,
      status: PostStatus.Published,
      publishedAt: { lte: new Date() },
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      tools: {
        where: { status: "Published" },
        select: { slug: true, name: true, faviconUrl: true },
      },
    },
  })
}
