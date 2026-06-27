import type { Prisma } from "~/.generated/prisma/client"
import {
  buildAdminListWhere,
  createdAtRangeExpression,
  getAdminListQueryParts,
  runAdminListTransaction,
} from "~/server/admin/list-query"
import type { AgeGroupsTableSchema } from "~/server/admin/age-groups/schema"
import { db } from "~/services/db"

export const findAgeGroups = async (
  search: AgeGroupsTableSchema,
  where?: Prisma.AgeGroupWhereInput,
) => {
  const { name, perPage, operator } = search
  const { offset, orderBy, fromDate, toDate } =
    getAdminListQueryParts<Prisma.AgeGroupOrderByWithRelationInput>(search)

  const expressions: (Prisma.AgeGroupWhereInput | undefined)[] = [
    name ? { name: { contains: name, mode: "insensitive" } } : undefined,
    createdAtRangeExpression<Prisma.AgeGroupWhereInput>(fromDate, toDate),
  ]

  const whereQuery = buildAdminListWhere<Prisma.AgeGroupWhereInput>({
    expressions,
    extraWhere: where,
    operator,
  })

  const {
    rows: ageGroups,
    total: ageGroupsTotal,
    pageCount,
  } = await runAdminListTransaction({
    perPage,
    findMany: () =>
      db.ageGroup.findMany({
        where: whereQuery,
        orderBy: [...orderBy, { sortOrder: "asc" }],
        take: perPage,
        skip: offset,
        include: { _count: { select: { programs: true } } },
      }),
    count: () => db.ageGroup.count({ where: whereQuery }),
  })
  return { ageGroups, ageGroupsTotal, pageCount }
}

export const findAgeGroupList = async (args?: { where?: Prisma.AgeGroupWhereInput }) => {
  return db.ageGroup.findMany({
    where: args?.where,
    select: { id: true, name: true, ageMin: true, ageMax: true },
    orderBy: { sortOrder: "asc" },
  })
}

export const findAgeGroupById = async (id: string) => {
  return db.ageGroup.findUnique({
    where: { id },
  })
}
