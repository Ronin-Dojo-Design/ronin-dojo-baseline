import type { Prisma } from "~/.generated/prisma/client"
import {
  buildAdminListWhere,
  createdAtRangeExpression,
  getAdminListQueryParts,
  runAdminListParallel,
} from "~/server/admin/list-query"
import type { MembershipsTableSchema } from "~/server/admin/memberships/schema"
import { db } from "~/services/db"

export const findMemberships = async (
  search: MembershipsTableSchema,
  where?: Prisma.MembershipWhereInput,
) => {
  const { name, status, perPage, operator } = search
  const { offset, orderBy, fromDate, toDate } =
    getAdminListQueryParts<Prisma.MembershipOrderByWithRelationInput>(search)

  const expressions: (Prisma.MembershipWhereInput | undefined)[] = [
    name
      ? {
          OR: [
            { user: { name: { contains: name, mode: "insensitive" } } },
            { memberNumber: { contains: name, mode: "insensitive" } },
          ],
        }
      : undefined,
    status.length > 0 ? { status: { in: status } } : undefined,
    createdAtRangeExpression<Prisma.MembershipWhereInput>(fromDate, toDate),
  ]

  const whereQuery = buildAdminListWhere<Prisma.MembershipWhereInput>({
    expressions,
    extraWhere: where,
    operator,
  })

  const {
    rows: memberships,
    total: membershipsTotal,
    pageCount,
  } = await runAdminListParallel({
    perPage,
    findMany: () =>
      db.membership.findMany({
        where: whereQuery,
        orderBy,
        take: perPage,
        skip: offset,
        include: {
          user: { select: { id: true, name: true, email: true } },
          organization: { select: { id: true, name: true } },
          discipline: { select: { id: true, name: true } },
          roleAssignments: {
            include: { role: { select: { id: true, name: true, code: true } } },
          },
          rank: { select: { id: true, name: true } },
        },
      }),
    count: () => db.membership.count({ where: whereQuery }),
  })

  return { memberships, membershipsTotal, pageCount }
}

export const findMembershipById = async (id: string) => {
  return db.membership.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      organization: { select: { id: true, name: true } },
      discipline: { select: { id: true, name: true } },
      roleAssignments: {
        include: { role: { select: { id: true, name: true, code: true } } },
      },
      rank: { select: { id: true, name: true } },
    },
  })
}
