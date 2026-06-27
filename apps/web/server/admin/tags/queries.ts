import type { Prisma } from "~/.generated/prisma/client"
import {
  buildAdminListWhere,
  createdAtRangeExpression,
  getAdminListQueryParts,
  runAdminListTransaction,
} from "~/server/admin/list-query"
import type { TagsTableSchema } from "~/server/admin/tags/schema"
import { db } from "~/services/db"

type TagRow = Prisma.TagGetPayload<{
  include: { _count: { select: { tools: true } } }
}>

export const findTags = async (search: TagsTableSchema, where?: Prisma.TagWhereInput) => {
  const { name, perPage, operator } = search
  const { offset, orderBy, fromDate, toDate } =
    getAdminListQueryParts<Prisma.TagOrderByWithRelationInput>(search)

  const expressions: (Prisma.TagWhereInput | undefined)[] = [
    // Filter by name
    name ? { name: { contains: name, mode: "insensitive" } } : undefined,

    // Filter by createdAt
    createdAtRangeExpression<Prisma.TagWhereInput>(fromDate, toDate),
  ]

  const combinedWhere = buildAdminListWhere<Prisma.TagWhereInput>({
    expressions,
    extraWhere: where,
    operator,
  })

  const {
    rows: tags,
    total: tagsTotal,
    pageCount,
  } = await runAdminListTransaction<TagRow[]>({
    perPage,
    findMany: () =>
      (db.tag.findMany as any)({
        where: combinedWhere,
        orderBy: [...orderBy, { createdAt: "asc" as const }],
        take: perPage,
        skip: offset,
        include: { _count: { select: { tools: true } } },
      }) as Prisma.PrismaPromise<TagRow[]>,
    count: () => db.tag.count({ where: combinedWhere }),
  })
  return { tags, tagsTotal, pageCount }
}

export const findTagList = async ({ ...args }: Record<string, any> = {}) => {
  return (db.tag.findMany as any)({
    ...args,
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })
}

export const findTagBySlug = async (slug: string) => {
  return db.tag.findUnique({
    where: { slug },
    include: {
      tools: { select: { id: true } },
    },
  })
}
