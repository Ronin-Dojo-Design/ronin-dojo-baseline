import type { Brand, Prisma } from "~/.generated/prisma/client"
import { PostStatus } from "~/.generated/prisma/client"
import { postManyPayload, postOnePayload } from "~/server/web/posts/payloads"
import { db } from "~/services/db"

type PostOrderBy = Prisma.PostOrderByWithRelationInput | Prisma.PostOrderByWithRelationInput[]

type PublicPostFindManyArgs = {
  where?: Prisma.PostWhereInput
  orderBy?: PostOrderBy
  take?: number
  skip?: number
  cursor?: Prisma.PostWhereUniqueInput
}

type PublicPostFindFirstArgs = {
  where?: Prisma.PostWhereInput
  orderBy?: PostOrderBy
  take?: number
  skip?: number
  cursor?: Prisma.PostWhereUniqueInput
}

export const findPosts = async ({ where, orderBy, ...args }: PublicPostFindManyArgs = {}) => {
  "use cache"

  return db.post.findMany({
    ...args,
    where: { status: PostStatus.Published, ...where },
    select: postManyPayload,
    orderBy: orderBy ?? { publishedAt: "desc" },
  })
}

export const findPostSlugs = async ({ where, orderBy, ...args }: PublicPostFindManyArgs = {}) => {
  "use cache"

  return db.post.findMany({
    ...args,
    where: { status: PostStatus.Published, ...where },
    select: { slug: true, updatedAt: true },
    orderBy: orderBy ?? { publishedAt: "desc" },
  })
}

export const findPost = async ({ where, ...args }: PublicPostFindFirstArgs = {}) => {
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
