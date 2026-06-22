import { isTruthy } from "@dirstack/utils"
import { endOfDay, startOfDay } from "date-fns"
import { Brand, type Prisma } from "~/.generated/prisma/client"
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

/**
 * Option data for the `/admin/users/new` add-person form. Brand-scoped, no hardcoding:
 * disciplines + the flat rank list (each carrying `disciplineId` so the client can show a
 * discipline-scoped Rank cascade) + brand organizations for the Affiliation select.
 *
 * @added SESSION_0358 — Passport-centric add-person (TASK_01). Rank chain is Rank → RankSystem → Discipline.
 */
export const findAddPersonOptions = async () => {
  const disciplineWhere: Prisma.DisciplineWhereInput = {
    OR: [{ isSystem: true }, { brand: Brand.BBL }],
  }

  const [disciplines, ranks, organizations, trees, treeMembers] = await db.$transaction([
    db.discipline.findMany({
      where: disciplineWhere,
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.rank.findMany({
      where: { rankSystem: { discipline: disciplineWhere } },
      select: {
        id: true,
        name: true,
        colorHex: true,
        sortOrder: true,
        rankSystem: { select: { disciplineId: true } },
      },
      orderBy: { sortOrder: "asc" },
    }),
    db.organization.findMany({
      where: { brand: Brand.BBL },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.lineageTree.findMany({
      where: { brand: Brand.BBL },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.lineageTreeMember.findMany({
      where: { tree: { brand: Brand.BBL } },
      select: {
        id: true,
        treeId: true,
        node: {
          select: {
            passport: { select: { displayName: true, user: { select: { name: true } } } },
          },
        },
      },
      orderBy: { visualSortOrder: "asc" },
    }),
  ])

  return {
    disciplines,
    organizations,
    trees,
    ranks: ranks.map(rank => ({
      id: rank.id,
      name: rank.name,
      colorHex: rank.colorHex,
      sortOrder: rank.sortOrder,
      disciplineId: rank.rankSystem.disciplineId,
    })),
    // Parent-select source; filtered by the chosen tree client-side.
    treeMembers: treeMembers.map(member => ({
      id: member.id,
      treeId: member.treeId,
      label: member.node.passport?.displayName || member.node.passport?.user?.name || "Unnamed",
    })),
  }
}

export type AddPersonOptions = Awaited<ReturnType<typeof findAddPersonOptions>>
