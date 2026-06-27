import type { Prisma } from "~/.generated/prisma/client"
import {
  buildAdminListWhere,
  createdAtRangeExpression,
  getAdminListQueryParts,
  runAdminListTransaction,
} from "~/server/admin/list-query"
import type { SkillLevelsTableSchema } from "~/server/admin/skill-levels/schema"
import { db } from "~/services/db"

export const findSkillLevels = async (
  search: SkillLevelsTableSchema,
  where?: Prisma.SkillLevelWhereInput,
) => {
  const { name, perPage, operator } = search
  const { offset, orderBy, fromDate, toDate } =
    getAdminListQueryParts<Prisma.SkillLevelOrderByWithRelationInput>(search)

  const expressions: (Prisma.SkillLevelWhereInput | undefined)[] = [
    name ? { name: { contains: name, mode: "insensitive" } } : undefined,
    createdAtRangeExpression<Prisma.SkillLevelWhereInput>(fromDate, toDate),
  ]

  const whereQuery = buildAdminListWhere<Prisma.SkillLevelWhereInput>({
    expressions,
    extraWhere: where,
    operator,
  })

  const {
    rows: skillLevels,
    total: skillLevelsTotal,
    pageCount,
  } = await runAdminListTransaction({
    perPage,
    findMany: () =>
      db.skillLevel.findMany({
        where: whereQuery,
        orderBy: [...orderBy, { sortOrder: "asc" }],
        take: perPage,
        skip: offset,
        include: { _count: { select: { programs: true } } },
      }),
    count: () => db.skillLevel.count({ where: whereQuery }),
  })

  return { skillLevels, skillLevelsTotal, pageCount }
}

export const findSkillLevelList = async (args?: { where?: Prisma.SkillLevelWhereInput }) => {
  return db.skillLevel.findMany({
    where: args?.where,
    select: { id: true, name: true, description: true },
    orderBy: { sortOrder: "asc" },
  })
}

export const findSkillLevelById = async (id: string) => {
  return db.skillLevel.findUnique({
    where: { id },
  })
}
