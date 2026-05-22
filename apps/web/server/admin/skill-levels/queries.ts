import { isTruthy } from "@dirstack/utils"
import { endOfDay, startOfDay } from "date-fns"
import type { Prisma } from "~/.generated/prisma/client"
import type { SkillLevelsTableSchema } from "~/server/admin/skill-levels/schema"
import { db } from "~/services/db"

export const findSkillLevels = async (
  search: SkillLevelsTableSchema,
  where?: Prisma.SkillLevelWhereInput,
) => {
  const { name, page, perPage, sort, from, to, operator } = search

  const offset = (page - 1) * perPage
  const orderBy = sort.map(item => ({ [item.id]: item.desc ? "desc" : "asc" }) as const)

  const fromDate = from ? startOfDay(new Date(from)) : undefined
  const toDate = to ? endOfDay(new Date(to)) : undefined

  const expressions: (Prisma.SkillLevelWhereInput | undefined)[] = [
    name ? { name: { contains: name, mode: "insensitive" } } : undefined,
    fromDate || toDate ? { createdAt: { gte: fromDate, lte: toDate } } : undefined,
  ]

  const whereQuery: Prisma.SkillLevelWhereInput = {
    [operator.toUpperCase()]: expressions.filter(isTruthy),
  }

  const [skillLevels, skillLevelsTotal] = await db.$transaction([
    db.skillLevel.findMany({
      where: { ...whereQuery, ...where },
      orderBy: [...orderBy, { sortOrder: "asc" }],
      take: perPage,
      skip: offset,
      include: { _count: { select: { programs: true } } },
    }),

    db.skillLevel.count({
      where: { ...whereQuery, ...where },
    }),
  ])

  const pageCount = Math.ceil(skillLevelsTotal / perPage)
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
