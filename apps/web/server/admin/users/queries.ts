import { isTruthy } from "@dirstack/utils"
import { endOfDay, startOfDay } from "date-fns"
import type { Prisma } from "~/.generated/prisma/client"
import { db } from "~/services/db"
import type { UsersTableSchema } from "./schema"

export const findUsers = async (search: UsersTableSchema) => {
  const { name, page, perPage, sort, from, to, operator } = search

  // Offset to paginate the results
  const offset = (page - 1) * perPage

  // Column and order to sort by
  const orderBy = sort.map(item => ({ [item.id]: item.desc ? "desc" : "asc" }) as const)

  // Convert the date strings to date objects
  const fromDate = from ? startOfDay(new Date(from)) : undefined
  const toDate = to ? endOfDay(new Date(to)) : undefined

  const expressions: (Prisma.UserWhereInput | undefined)[] = [
    // Filter by name
    name
      ? {
          OR: [
            { name: { contains: name, mode: "insensitive" } },
            { email: { contains: name, mode: "insensitive" } },
          ],
        }
      : undefined,

    // Filter by createdAt
    fromDate || toDate ? { createdAt: { gte: fromDate, lte: toDate } } : undefined,
  ]

  const activeUserWhere: Prisma.UserWhereInput = {
    archivedAt: null,
    isPlaceholder: false,
  }
  const filteredExpressions = expressions.filter(isTruthy)
  const where: Prisma.UserWhereInput = {
    ...activeUserWhere,
    ...(filteredExpressions.length ? { [operator.toUpperCase()]: filteredExpressions } : {}),
  }

  // Transaction is used to ensure both queries are executed in a single transaction
  const [users, usersTotal] = await db.$transaction([
    db.user.findMany({
      where,
      orderBy,
      take: perPage,
      skip: offset,
    }),

    db.user.count({
      where,
    }),
  ])

  const pageCount = Math.ceil(usersTotal / perPage)
  return { users, usersTotal, pageCount }
}

export const findUserById = async (id: string) => {
  return db.user.findUnique({
    where: { id },
  })
}

export const findUserList = async () => {
  return db.user.findMany({
    where: {
      archivedAt: null,
      isPlaceholder: false,
    },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  })
}
