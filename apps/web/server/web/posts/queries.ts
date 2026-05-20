import type { Brand, Prisma } from "~/.generated/prisma/client"
import { PostStatus } from "~/.generated/prisma/client"
import { postManyPayload, postOnePayload } from "~/server/web/posts/payloads"
import { db } from "~/services/db"

export const findPosts = async ({ where, orderBy, ...args }: Prisma.PostFindManyArgs = {}) => {
  "use cache"

  return db.post.findMany({
    ...args,
    where: { status: PostStatus.Published, ...where },
    select: postManyPayload,
    orderBy: orderBy ?? { publishedAt: "desc" },
  })
}

export const findPostSlugs = async ({ where, orderBy, ...args }: Prisma.PostFindManyArgs = {}) => {
  "use cache"

  return db.post.findMany({
    ...args,
    where: { status: PostStatus.Published, ...where },
    select: { slug: true, updatedAt: true },
    orderBy: orderBy ?? { publishedAt: "desc" },
  })
}

export const findPost = async ({ where, ...args }: Prisma.PostFindFirstArgs = {}) => {
  "use cache"

  return db.post.findFirst({
    ...args,
    where,
    select: postOnePayload,
  })
}

export const findPublishedPosts = async (brand: Brand) => {
  return db.post.findMany({
    where: {
      brand,
      status: PostStatus.Published,
      publishedAt: { lte: new Date() },
    },
    select: postManyPayload,
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
    select: postOnePayload,
  })
}
