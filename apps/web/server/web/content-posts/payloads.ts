import type { Prisma } from "~/.generated/prisma/client"

export const contentPostAuthorPayload = {
  select: { id: true, name: true, image: true },
} satisfies Prisma.UserDefaultArgs

export const contentPostOnePayload = {
  id: true,
  brand: true,
  channel: true,
  status: true,
  publicTitle: true,
  publicSlug: true,
  renderedCopy: true,
  excerpt: true,
  cta: true,
  thumbnailUrl: true,
  videoUrl: true,
  publishDate: true,
  createdAt: true,
  updatedAt: true,
  atom: {
    select: {
      id: true,
      canonicalId: true,
      title: true,
      slug: true,
      status: true,
      longFormCopy: true,
      hook: true,
      createdBy: contentPostAuthorPayload,
      discipline: { select: { id: true, name: true, slug: true } },
    },
  },
} satisfies Prisma.ContentVariantSelect

export const contentPostManyPayload = {
  id: true,
  brand: true,
  channel: true,
  status: true,
  publicTitle: true,
  publicSlug: true,
  excerpt: true,
  thumbnailUrl: true,
  publishDate: true,
  createdAt: true,
  updatedAt: true,
  atom: {
    select: {
      id: true,
      canonicalId: true,
      title: true,
      slug: true,
      status: true,
      hook: true,
      createdBy: contentPostAuthorPayload,
    },
  },
} satisfies Prisma.ContentVariantSelect

export type ContentPostOne = Prisma.ContentVariantGetPayload<{
  select: typeof contentPostOnePayload
}>

export type ContentPostMany = Prisma.ContentVariantGetPayload<{
  select: typeof contentPostManyPayload
}>
