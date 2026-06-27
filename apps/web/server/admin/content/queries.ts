import { Brand, type Prisma } from "~/.generated/prisma/client"
import {
  buildAdminListWhere,
  createdAtRangeExpression,
  getAdminListQueryParts,
  runAdminListTransaction,
} from "~/server/admin/list-query"
import type { ContentAtomsTableSchema } from "~/server/admin/content/schema"
import { db } from "~/services/db"

export const findContentAtoms = async (search: ContentAtomsTableSchema) => {
  const { title, perPage, operator, status } = search
  const { offset, orderBy, fromDate, toDate } =
    getAdminListQueryParts<Prisma.ContentAtomOrderByWithRelationInput>(search)

  const expressions: (Prisma.ContentAtomWhereInput | undefined)[] = [
    title ? { title: { contains: title, mode: "insensitive" } } : undefined,
    createdAtRangeExpression<Prisma.ContentAtomWhereInput>(fromDate, toDate),
    status.length > 0 ? { status: { in: status } } : undefined,
  ]

  const whereQuery = buildAdminListWhere<Prisma.ContentAtomWhereInput>({
    // Brand scoping: atoms are visible if they have at least one variant for this brand,
    // or if they were created within the org context of this brand.
    baseWhere: { variants: { some: { brand: Brand.BBL } } },
    expressions,
    operator,
  })

  const {
    rows: atoms,
    total,
    pageCount,
  } = await runAdminListTransaction({
    perPage,
    findMany: () =>
      db.contentAtom.findMany({
        where: whereQuery,
        include: {
          discipline: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true } },
          _count: { select: { tags: true, tools: true, variants: true, mediaAttachments: true } },
        },
        orderBy: [...orderBy, { createdAt: "asc" }],
        take: perPage,
        skip: offset,
      }),
    count: () => db.contentAtom.count({ where: whereQuery }),
  })

  return { atoms, total, pageCount }
}

export const findContentAtomById = async (id: string) => {
  return db.contentAtom.findFirst({
    where: { id, variants: { some: { brand: Brand.BBL } } },
    include: {
      discipline: { select: { id: true, name: true } },
      style: { select: { id: true, name: true } },
      organization: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
      tags: { select: { id: true, name: true }, orderBy: { name: "asc" } },
      tools: { select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } },
      variants: {
        select: {
          id: true,
          publicTitle: true,
          publicSlug: true,
          renderedCopy: true,
          excerpt: true,
          cta: true,
          thumbnailUrl: true,
          videoUrl: true,
          voiceNotes: true,
          channel: true,
          brand: true,
          status: true,
          publishDate: true,
        },
        orderBy: { createdAt: "desc" },
      },
      mediaAttachments: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
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
            },
          },
        },
      },
    },
  })
}

export const findStyleOptions = async () => {
  return db.style.findMany({
    where: { status: "APPROVED" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })
}

export const findContentVariantById = async (id: string) => {
  return db.contentVariant.findFirst({
    where: { id, brand: Brand.BBL },
  })
}
