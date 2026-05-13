import { isTruthy } from "@primoui/utils"
import { endOfDay, startOfDay } from "date-fns"
import type { Prisma } from "~/.generated/prisma/client"
import type { MembershipsTableSchema } from "~/server/admin/memberships/schema"
import { db } from "~/services/db"

export const findMemberships = async (
  search: MembershipsTableSchema,
  where?: Prisma.MembershipWhereInput,
) => {
  const { name, status, page, perPage, sort, from, to, operator } = search

  const offset = (page - 1) * perPage
  const orderBy = sort.map(item => ({ [item.id]: item.desc ? "desc" : "asc" }) as const)

  const fromDate = from ? startOfDay(new Date(from)) : undefined
  const toDate = to ? endOfDay(new Date(to)) : undefined

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
    fromDate || toDate ? { createdAt: { gte: fromDate, lte: toDate } } : undefined,
  ]

  const whereQuery: Prisma.MembershipWhereInput = {
    [operator.toUpperCase()]: expressions.filter(isTruthy),
  }

  const [memberships, membershipsTotal] = await Promise.all([
    db.membership.findMany({
      where: { ...whereQuery, ...where },
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

    db.membership.count({
      where: { ...whereQuery, ...where },
    }),
  ])

  const pageCount = Math.ceil(membershipsTotal / perPage)
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
