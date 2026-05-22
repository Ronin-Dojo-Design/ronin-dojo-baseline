import type { Brand, Prisma } from "~/.generated/prisma/client"
import { ContentVariantStatus } from "~/.generated/prisma/client"
import { contentPostManyPayload, contentPostOnePayload } from "~/server/web/content-posts/payloads"
import { db } from "~/services/db"

/**
 * Visibility contract:
 * - ContentVariant.status = PUBLISHED
 * - ContentVariant.channel = BLOG
 * - ContentVariant.brand = request brand
 * - ContentAtom.status IN (APPROVED, PUBLISHED)
 * - publishDate <= now (or null — treat as published immediately)
 */
const publishedBlogVariantWhere = (brand: Brand): Prisma.ContentVariantWhereInput => ({
  brand,
  channel: "BLOG",
  status: ContentVariantStatus.PUBLISHED,
  OR: [{ publishDate: { lte: new Date() } }, { publishDate: null }],
  atom: {
    status: { in: ["APPROVED", "PUBLISHED"] },
  },
})

export const findPublishedContentPosts = async (brand: Brand) => {
  return db.contentVariant.findMany({
    where: publishedBlogVariantWhere(brand),
    select: contentPostManyPayload,
    orderBy: { publishDate: "desc" },
  })
}

export const findPublishedContentPostBySlug = async (slug: string, brand: Brand) => {
  return db.contentVariant.findFirst({
    where: {
      publicSlug: slug,
      ...publishedBlogVariantWhere(brand),
    },
    select: contentPostOnePayload,
  })
}
