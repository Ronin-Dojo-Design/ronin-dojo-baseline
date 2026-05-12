import { isTruthy } from "@primoui/utils"
import { endOfDay, startOfDay } from "date-fns"
import type { Prisma } from "~/.generated/prisma/client"
import type { RolesTableSchema } from "~/server/admin/roles/schema"
import { db } from "~/services/db"

export const findRoles = async (
  search: RolesTableSchema,
  where?: Prisma.RoleWhereInput,
) => {
  const { name, page, perPage, sort, from, to, operator } = search

  const offset = (page - 1) * perPage
  const orderBy = sort.map(item => ({ [item.id]: item.desc ? "desc" : "asc" }) as const)

  const fromDate = from ? startOfDay(new Date(from)) : undefined
  const toDate = to ? endOfDay(new Date(to)) : undefined

  const expressions: (Prisma.RoleWhereInput | undefined)[] = [
    name ? { name: { contains: name, mode: "insensitive" } } : undefined,
    fromDate || toDate ? { createdAt: { gte: fromDate, lte: toDate } } : undefined,
  ]

  const whereQuery: Prisma.RoleWhereInput = {
    [operator.toUpperCase()]: expressions.filter(isTruthy),
  }

  const [roles, rolesTotal] = await db.$transaction([
    db.role.findMany({
      where: { ...whereQuery, ...where },
      orderBy,
      take: perPage,
      skip: offset,
      include: { _count: { select: { roleAssignments: true } } },
    }),

    db.role.count({
      where: { ...whereQuery, ...where },
    }),
  ])

  const pageCount = Math.ceil(rolesTotal / perPage)
  return { roles, rolesTotal, pageCount }
}

export const findRoleList = async (args?: { where?: Prisma.RoleWhereInput }) => {
  return db.role.findMany({
    where: args?.where,
    select: { id: true, name: true, code: true },
    orderBy: { name: "asc" },
  })
}

export const findRoleById = async (id: string) => {
  return db.role.findUnique({
    where: { id },
  })
}
