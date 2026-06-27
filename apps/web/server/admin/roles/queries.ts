import type { Prisma } from "~/.generated/prisma/client"
import {
  buildAdminListWhere,
  createdAtRangeExpression,
  getAdminListQueryParts,
  runAdminListTransaction,
} from "~/server/admin/list-query"
import type { RolesTableSchema } from "~/server/admin/roles/schema"
import { db } from "~/services/db"

export const findRoles = async (search: RolesTableSchema, where?: Prisma.RoleWhereInput) => {
  const { name, perPage, operator } = search
  const { offset, orderBy, fromDate, toDate } =
    getAdminListQueryParts<Prisma.RoleOrderByWithRelationInput>(search)

  const expressions: (Prisma.RoleWhereInput | undefined)[] = [
    name ? { name: { contains: name, mode: "insensitive" } } : undefined,
    createdAtRangeExpression<Prisma.RoleWhereInput>(fromDate, toDate),
  ]

  const whereQuery = buildAdminListWhere<Prisma.RoleWhereInput>({
    expressions,
    extraWhere: where,
    operator,
  })

  const {
    rows: roles,
    total: rolesTotal,
    pageCount,
  } = await runAdminListTransaction({
    perPage,
    findMany: () =>
      db.role.findMany({
        where: whereQuery,
        orderBy,
        take: perPage,
        skip: offset,
        include: { _count: { select: { roleAssignments: true } } },
      }),
    count: () => db.role.count({ where: whereQuery }),
  })

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
