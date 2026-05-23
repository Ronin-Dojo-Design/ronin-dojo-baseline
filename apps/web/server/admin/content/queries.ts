import { isTruthy } from "@dirstack/utils"
import { endOfDay, startOfDay } from "date-fns"
import type { Prisma } from "~/.generated/prisma/client"
import { getRequestBrand } from "~/lib/brand-context"
import type { ContentAtomsTableSchema } from "~/server/admin/content/schema"
import { db } from "~/services/db"

export const findContentAtoms = async (search: ContentAtomsTableSchema) => {
  const { title, sort, page, perPage, from, to, operator, status } = search
  const brand = await getRequestBrand()

  const offset = (page - 1) * perPage
  const orderBy = sort.map(item => ({ [item.id]: item.desc ? "desc" : "asc" }) as const)

  const fromDate = from ? startOfDay(new Date(from)) : undefined
  const toDate = to ? endOfDay(new Date(to)) : undefined

  const expressions: (Prisma.ContentAtomWhereInput | undefined)[] = [
    title ? { title: { contains: title, mode: "insensitive" } } : undefined,
    fromDate || toDate ? { createdAt: { gte: fromDate, lte: toDate } } : undefined,
    status.length > 0 ? { status: { in: status } } : undefined,
  ]

  const whereQuery: Prisma.ContentAtomWhereInput = {
    [operator.toUpperCase()]: expressions.filter(isTruthy),
    // Brand scoping: atoms are visible if they have at least one variant for this brand,
    // or if they were created within the org context of this brand.
    variants: { some: { brand } },
  }

  const [atoms, total] = await db.$transaction([
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

    db.contentAtom.count({ where: whereQuery }),
  ])

  const pageCount = Math.ceil(total / perPage)
  return { atoms, total, pageCount }
}

export const findContentAtomById = async (id: string) => {
  return db.contentAtom.findUnique({
    where: { id },
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
          channel: true,
          brand: true,
          status: true,
          publishDate: true,
        },
        orderBy: { createdAt: "desc" },
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
