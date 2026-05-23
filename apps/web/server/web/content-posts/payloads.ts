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
      tags: {
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      },
      tools: {
        where: { status: "Published" },
        select: { id: true, slug: true, name: true, faviconUrl: true },
        orderBy: { name: "asc" },
      },
      mediaAttachments: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          purpose: true,
          sortOrder: true,
          media: {
            select: {
              id: true,
              type: true,
              url: true,
              thumbnailUrl: true,
              title: true,
              altText: true,
              widthPx: true,
              heightPx: true,
              durationSec: true,
            },
          },
        },
      },
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
