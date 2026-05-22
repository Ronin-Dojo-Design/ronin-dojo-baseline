import { isTruthy } from "@dirstack/utils"
import { endOfDay, startOfDay } from "date-fns"
import type { Prisma } from "~/.generated/prisma/client"
import type { AgeGroupsTableSchema } from "~/server/admin/age-groups/schema"
import { db } from "~/services/db"

export const findAgeGroups = async (
  search: AgeGroupsTableSchema,
  where?: Prisma.AgeGroupWhereInput,
) => {
  const { name, page, perPage, sort, from, to, operator } = search

  const offset = (page - 1) * perPage
  const orderBy = sort.map(item => ({ [item.id]: item.desc ? "desc" : "asc" }) as const)

  const fromDate = from ? startOfDay(new Date(from)) : undefined
  const toDate = to ? endOfDay(new Date(to)) : undefined

  const expressions: (Prisma.AgeGroupWhereInput | undefined)[] = [
    name ? { name: { contains: name, mode: "insensitive" } } : undefined,
    fromDate || toDate ? { createdAt: { gte: fromDate, lte: toDate } } : undefined,
  ]

  const whereQuery: Prisma.AgeGroupWhereInput = {
    [operator.toUpperCase()]: expressions.filter(isTruthy),
  }

  const [ageGroups, ageGroupsTotal] = await db.$transaction([
    db.ageGroup.findMany({
      where: { ...whereQuery, ...where },
      orderBy: [...orderBy, { sortOrder: "asc" }],
      take: perPage,
      skip: offset,
      include: { _count: { select: { programs: true } } },
    }),

    db.ageGroup.count({
      where: { ...whereQuery, ...where },
    }),
  ])

  const pageCount = Math.ceil(ageGroupsTotal / perPage)
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
