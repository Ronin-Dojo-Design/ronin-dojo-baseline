import { Brand, type Prisma } from "~/.generated/prisma/client"
import {
  buildAdminListWhere,
  createdAtRangeExpression,
  getAdminListQueryParts,
  runAdminListTransaction,
} from "~/server/admin/list-query"
import { db } from "~/services/db"
import type { UsersTableSchema } from "./schema"

export const findUsers = async (search: UsersTableSchema) => {
  const { name, perPage, operator } = search
  const { offset, orderBy, fromDate, toDate } =
    getAdminListQueryParts<Prisma.UserOrderByWithRelationInput>(search)

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
    createdAtRangeExpression<Prisma.UserWhereInput>(fromDate, toDate),
  ]

  const where = buildAdminListWhere<Prisma.UserWhereInput>({
    baseWhere: { archivedAt: null, isPlaceholder: false },
    expressions,
    operator,
    omitEmptyOperator: true,
  })

  const {
    rows: users,
    total: usersTotal,
    pageCount,
  } = await runAdminListTransaction({
    perPage,
    findMany: () =>
      db.user.findMany({
        where,
        orderBy,
        take: perPage,
        skip: offset,
      }),
    count: () => db.user.count({ where }),
  })

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
 * Option data for the `/app/users/new` add-person form. Brand-scoped, no hardcoding:
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
