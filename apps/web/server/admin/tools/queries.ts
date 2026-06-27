import { type Prisma, ToolStatus } from "~/.generated/prisma/client"
import {
  buildAdminListWhere,
  createdAtRangeExpression,
  getAdminListQueryParts,
  runAdminListTransaction,
} from "~/server/admin/list-query"
import type { ToolsTableSchema } from "~/server/admin/tools/schema"
import { db } from "~/services/db"

export const findTools = async (search: ToolsTableSchema, where?: Prisma.ToolWhereInput) => {
  const { name, perPage, operator, status, tier } = search
  const { offset, orderBy, fromDate, toDate } =
    getAdminListQueryParts<Prisma.ToolOrderByWithRelationInput>(search)

  const expressions: (Prisma.ToolWhereInput | undefined)[] = [
    // Filter by name
    name ? { name: { contains: name, mode: "insensitive" } } : undefined,

    // Filter by createdAt
    createdAtRangeExpression<Prisma.ToolWhereInput>(fromDate, toDate),

    // Filter tasks by status
    status.length > 0 ? { status: { in: status } } : undefined,

    // Filter listings by tier
    tier.length > 0 ? { tier: { in: tier } } : undefined,
  ]

  const whereQuery = buildAdminListWhere<Prisma.ToolWhereInput>({
    expressions,
    extraWhere: where,
    operator,
  })

  const {
    rows: tools,
    total,
    pageCount,
  } = await runAdminListTransaction({
    perPage,
    findMany: () =>
      db.tool.findMany({
        where: whereQuery,
        orderBy: [...orderBy, { createdAt: "asc" }],
        take: perPage,
        skip: offset,
      }),
    count: () => db.tool.count({ where: whereQuery }),
  })

  return { tools, total, pageCount }
}

export const findScheduledTools = async ({ where, ...args }: Prisma.ToolFindManyArgs = {}) => {
  // Prisma 7 hits TS2321 "excessive stack depth" on ToolInclude here — upstream issue.
  return db.tool.findMany({
    ...(args as any),
    where: { status: { in: [ToolStatus.Published, ToolStatus.Scheduled] }, ...where },
    select: { slug: true, name: true, status: true, publishedAt: true },
    orderBy: { publishedAt: "asc" },
  })
}

export const findToolList = async ({ ...args }: Prisma.ToolFindManyArgs = {}) => {
  // Prisma 7 hits TS2321 "excessive stack depth" on ToolInclude here — upstream issue.
  return db.tool.findMany({
    ...(args as any),
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })
}

export const findToolBySlug = async (slug: string) => {
  return db.tool.findUnique({
    where: { slug },
    include: {
      categories: { select: { id: true } },
      tags: { select: { id: true } },
    },
  })
}
