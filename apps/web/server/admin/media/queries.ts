import type { Prisma } from "~/.generated/prisma/client"
import { clampListPageParams } from "~/server/admin/list-query"
import { db } from "~/services/db"

const mediaRowInclude = {
  uploadedBy: { select: { id: true, name: true } },
  _count: { select: { attachments: true } },
} satisfies Prisma.MediaInclude

export type MediaRow = Prisma.MediaGetPayload<{ include: typeof mediaRowInclude }>

export const findMedia = async (params: {
  brand?: string
  type?: string
  /** Search term fanned across title + description (Title column id per the People exemplar). */
  title?: string
  page?: number
  perPage?: number
}) => {
  const { brand, type, title } = params
  const { page, perPage } = clampListPageParams(params.page ?? 1, params.perPage ?? 24)
  const skip = (page - 1) * perPage

  const where: Prisma.MediaWhereInput = {
    ...(brand && { brand: brand as any }),
    ...(type && { type: type as any }),
  }

  if (title) {
    where.OR = [
      { title: { contains: title, mode: "insensitive" } },
      { description: { contains: title, mode: "insensitive" } },
    ]
  }

  const [media, total] = await db.$transaction([
    db.media.findMany({
      where,
      include: mediaRowInclude,
      orderBy: { createdAt: "desc" },
      take: perPage,
      skip,
    }),
    db.media.count({ where }),
  ])

  const pageCount = Math.max(1, Math.ceil(total / perPage))

  return { media, total, page, perPage, pageCount }
}
