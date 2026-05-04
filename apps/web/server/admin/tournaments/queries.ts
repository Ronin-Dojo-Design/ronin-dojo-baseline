import { isTruthy } from "@primoui/utils"
import { endOfDay, startOfDay } from "date-fns"
import type { Prisma } from "~/.generated/prisma/client"
import type { TournamentsTableSchema } from "~/server/admin/tournaments/schema"
import { db } from "~/services/db"

export const findTournaments = async (
  search: TournamentsTableSchema,
  where?: Prisma.TournamentWhereInput,
) => {
  const { name, sort, page, perPage, from, to, operator, status } = search

  const offset = (page - 1) * perPage
  const orderBy = sort.map(item => ({ [item.id]: item.desc ? "desc" : "asc" }) as const)

  const fromDate = from ? startOfDay(new Date(from)) : undefined
  const toDate = to ? endOfDay(new Date(to)) : undefined

  const expressions: (Prisma.TournamentWhereInput | undefined)[] = [
    name ? { name: { contains: name, mode: "insensitive" } } : undefined,
    status ? { status: status as any } : undefined,
    fromDate || toDate ? { startDate: { gte: fromDate, lte: toDate } } : undefined,
  ]

  const whereQuery: Prisma.TournamentWhereInput = {
    [operator.toUpperCase()]: expressions.filter(isTruthy),
  }

  const [tournaments, total] = await db.$transaction([
    db.tournament.findMany({
      where: { ...whereQuery, ...where },
      include: {
        host: { select: { id: true, name: true } },
        disciplines: {
          include: {
            discipline: { select: { id: true, name: true } },
            _count: { select: { divisions: true } },
          },
        },
        _count: { select: { registrations: true } },
      },
      orderBy: [...orderBy, { startDate: "asc" }],
      take: perPage,
      skip: offset,
    }),

    db.tournament.count({
      where: { ...whereQuery, ...where },
    }),
  ])

  const pageCount = Math.ceil(total / perPage)
  return { tournaments, total, pageCount }
}

export const findTournamentById = async (id: string) => {
  return db.tournament.findUnique({
    where: { id },
    include: {
      host: { select: { id: true, name: true } },
      disciplines: {
        include: {
          discipline: { select: { id: true, name: true, slug: true } },
          divisions: {
            orderBy: { sortOrder: "asc" },
            include: {
              roleRequired: { select: { id: true, name: true } },
              rankMin: { select: { id: true, name: true } },
              rankMax: { select: { id: true, name: true } },
            },
          },
          ruleSet: { select: { id: true, name: true } },
        },
      },
      _count: { select: { registrations: true } },
    },
  })
}

export const findTournamentBySlug = async (slug: string, brand: string) => {
  return db.tournament.findFirst({
    where: { slug, brand: brand as any },
    include: {
      host: { select: { id: true, name: true } },
      disciplines: {
        include: {
          discipline: { select: { id: true, name: true, slug: true } },
          divisions: {
            orderBy: { sortOrder: "asc" },
            include: {
              roleRequired: { select: { id: true, name: true } },
              rankMin: { select: { id: true, name: true } },
              rankMax: { select: { id: true, name: true } },
              _count: { select: { entries: true } },
            },
          },
        },
      },
    },
  })
}
