import { isTruthy } from "@dirstack/utils"
import { endOfDay, startOfDay } from "date-fns"
import type { Prisma } from "~/.generated/prisma/client"
import type { TagsTableSchema } from "~/server/admin/tags/schema"
import { db } from "~/services/db"

export const findTags = async (search: TagsTableSchema, where?: Prisma.TagWhereInput) => {
  const { name, page, perPage, sort, from, to, operator } = search

  // Offset to paginate the results
  const offset = (page - 1) * perPage

  // Column and order to sort by
  const orderBy = sort.map(item => ({ [item.id]: item.desc ? "desc" : "asc" }) as const)

  // Convert the date strings to Date objects and adjust the range
  const fromDate = from ? startOfDay(new Date(from)) : undefined
  const toDate = to ? endOfDay(new Date(to)) : undefined

  const expressions: (Prisma.TagWhereInput | undefined)[] = [
    // Filter by name
    name ? { name: { contains: name, mode: "insensitive" } } : undefined,

    // Filter by createdAt
    fromDate || toDate ? { createdAt: { gte: fromDate, lte: toDate } } : undefined,
  ]

  const whereQuery: Prisma.TagWhereInput = {
    [operator.toUpperCase()]: expressions.filter(isTruthy),
  }

  const combinedWhere = { ...whereQuery, ...where }

  const tagsQuery = (db.tag.findMany as any)({
    where: combinedWhere,
    orderBy: [...orderBy, { createdAt: "asc" as const }],
    take: perPage,
    skip: offset,
    include: { _count: { select: { tools: true } } },
  })

  const countQuery = db.tag.count({ where: combinedWhere })

  const [tags, tagsTotal] = await db.$transaction([tagsQuery, countQuery])

  const pageCount = Math.ceil(tagsTotal / perPage)
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
