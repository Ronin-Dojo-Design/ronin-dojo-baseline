import type { Prisma } from "~/.generated/prisma/client"

export const postAuthorPayload = {
  select: { id: true, name: true, image: true },
} satisfies Prisma.UserDefaultArgs

export const postToolPayload = {
  where: { status: "Published" },
  select: { slug: true, name: true, faviconUrl: true },
} satisfies Prisma.Post$toolsArgs

// Flair source for the blog feed (SESSION_0492): the Post↔Category / Post↔Tag relations already exist
// on the model; we surface them at the read-model layer so the feed can render/filter by flair. Ordered
// by name for a stable tab order.
export const postCategoriesPayload = {
  select: { name: true, slug: true },
  orderBy: { name: "asc" },
} satisfies Prisma.Post$categoriesArgs

export const postTagsPayload = {
  select: { name: true, slug: true },
  orderBy: { name: "asc" },
} satisfies Prisma.Post$tagsArgs

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
  categories: postCategoriesPayload,
  tags: postTagsPayload,
} satisfies Prisma.PostSelect

export type PostOne = Prisma.PostGetPayload<{ select: typeof postOnePayload }>
export type PostMany = Prisma.PostGetPayload<{ select: typeof postManyPayload }>
