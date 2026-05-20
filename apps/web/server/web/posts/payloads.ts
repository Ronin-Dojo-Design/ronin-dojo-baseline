import type { Prisma } from "~/.generated/prisma/client"

export const postAuthorPayload = {
  select: { id: true, name: true, image: true },
} satisfies Prisma.UserDefaultArgs

export const postToolPayload = {
  where: { status: "Published" },
  select: { slug: true, name: true, faviconUrl: true },
} satisfies Prisma.Post$toolsArgs

export const postOnePayload = {
  id: true,
  title: true,
  slug: true,
  description: true,
  content: true,
  plainText: true,
  imageUrl: true,
  status: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  brand: true,
  authorId: true,
  author: postAuthorPayload,
  tools: postToolPayload,
} satisfies Prisma.PostSelect

export const postManyPayload = {
  id: true,
  title: true,
  slug: true,
  description: true,
  content: true,
  imageUrl: true,
  plainText: true,
  status: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  brand: true,
  authorId: true,
  author: postAuthorPayload,
} satisfies Prisma.PostSelect

export type PostOne = Prisma.PostGetPayload<{ select: typeof postOnePayload }>
export type PostMany = Prisma.PostGetPayload<{ select: typeof postManyPayload }>
