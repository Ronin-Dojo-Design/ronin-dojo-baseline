import { Brand, MediaType, type Prisma } from "~/.generated/prisma/client"
import { clampListPageParams } from "~/server/admin/list-query"
import { db } from "~/services/db"

/**
 * WL-P2-41(c): `findMedia`'s `brand`/`type` params are URL-string origin (list search params),
 * so they arrive as arbitrary strings. Narrow them at the boundary with a literal-union guard —
 * a recognized value types as the real enum member, anything else drops the filter (an admin list
 * ignores a junk param instead of throwing Prisma's invalid-enum runtime error). Replaces the
 * SESSION_0515-deferred `as any` casts.
 */
const enumParam = <T extends Record<string, string>>(
  enumObject: T,
  value: string | undefined,
): T[keyof T] | undefined =>
  value && (Object.values(enumObject) as string[]).includes(value)
    ? (value as T[keyof T])
    : undefined

export const parseMediaBrandParam = (value: string | undefined) => enumParam(Brand, value)
export const parseMediaTypeParam = (value: string | undefined) => enumParam(MediaType, value)

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
  const { title } = params
  const { page, perPage } = clampListPageParams(params.page ?? 1, params.perPage ?? 24)
  const skip = (page - 1) * perPage

  const brand = parseMediaBrandParam(params.brand)
  const type = parseMediaTypeParam(params.type)

  const where: Prisma.MediaWhereInput = {
    ...(brand && { brand }),
    ...(type && { type }),
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
