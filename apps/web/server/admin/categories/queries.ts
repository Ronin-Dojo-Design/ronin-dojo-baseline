import type { Prisma } from "~/.generated/prisma/client"
import {
  buildAdminListWhere,
  createdAtRangeExpression,
  getAdminListQueryParts,
  runAdminListTransaction,
} from "~/server/admin/list-query"
import type { CategoriesTableSchema } from "~/server/admin/categories/schema"
import { db } from "~/services/db"

export const findCategories = async (
  search: CategoriesTableSchema,
  where?: Prisma.CategoryWhereInput,
) => {
  const { name, perPage, operator } = search
  const { offset, orderBy, fromDate, toDate } =
    getAdminListQueryParts<Prisma.CategoryOrderByWithRelationInput>(search)

  const expressions: (Prisma.CategoryWhereInput | undefined)[] = [
    // Filter by name
    name ? { name: { contains: name, mode: "insensitive" } } : undefined,

    // Filter by createdAt
    createdAtRangeExpression<Prisma.CategoryWhereInput>(fromDate, toDate),
  ]

  const whereQuery = buildAdminListWhere<Prisma.CategoryWhereInput>({
    expressions,
    extraWhere: where,
    operator,
  })

  // Transaction is used to ensure both queries are executed in a single transaction
  const {
    rows: categories,
    total: categoriesTotal,
    pageCount,
  } = await runAdminListTransaction({
    perPage,
    findMany: () =>
      db.category.findMany({
        where: whereQuery,
        orderBy: [...orderBy, { createdAt: "asc" }],
        take: perPage,
        skip: offset,
        include: { _count: { select: { tools: true } } },
      }),
    count: () => db.category.count({ where: whereQuery }),
  })

  return { categories, categoriesTotal, pageCount }
}

export const findCategoryList = async (args?: { where?: Prisma.CategoryWhereInput }) => {
  return db.category.findMany({
    where: args?.where,
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })
}

export const findCategoryBySlug = async (slug: string) => {
  return db.category.findUnique({
    where: { slug },
    include: {
      tools: { select: { id: true } },
    },
  })
}
