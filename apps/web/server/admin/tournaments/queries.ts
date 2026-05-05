import { isTruthy } from "@primoui/utils"
import { endOfDay, startOfDay } from "date-fns"
import type { Prisma } from "~/.generated/prisma/client"
import type { TournamentsTableSchema, TournamentRolesTableSchema, RuleSetsTableSchema } from "~/server/admin/tournaments/schema"
import { getRequestBrand } from "~/lib/brand-context"
import { db } from "~/services/db"

export const findTournaments = async (
  search: TournamentsTableSchema,
  where?: Prisma.TournamentWhereInput,
) => {
  const { name, sort, page, perPage, from, to, operator, status } = search
  const brand = await getRequestBrand()

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
    brand,
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
  const brand = await getRequestBrand()

  return db.tournament.findUnique({
    where: { id, brand },
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
              brackets: { select: { id: true, name: true }, take: 1 },
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

// -----------------------------------------------------------------------------
// TournamentRole queries
// -----------------------------------------------------------------------------

export const findTournamentRoles = async () => {
  const brand = await getRequestBrand()

  return db.tournamentRole.findMany({
    where: {
      OR: [{ brand }, { brand: null, isSystem: true }],
    },
    orderBy: [{ isSystem: "desc" }, { name: "asc" }],
  })
}

export const findTournamentRolesPaginated = async (search: TournamentRolesTableSchema) => {
  const { name, sort, page, perPage, from, to, operator } = search
  const brand = await getRequestBrand()

  const offset = (page - 1) * perPage
  const orderBy = sort.map(item => ({ [item.id]: item.desc ? "desc" : "asc" }) as const)

  const fromDate = from ? startOfDay(new Date(from)) : undefined
  const toDate = to ? endOfDay(new Date(to)) : undefined

  const expressions: (Prisma.TournamentRoleWhereInput | undefined)[] = [
    name ? { name: { contains: name, mode: "insensitive" } } : undefined,
    fromDate || toDate ? { createdAt: { gte: fromDate, lte: toDate } } : undefined,
  ]

  const whereQuery: Prisma.TournamentRoleWhereInput = {
    OR: [{ brand }, { brand: null, isSystem: true }],
    [operator.toUpperCase()]: expressions.filter(isTruthy),
  }

  const [roles, total] = await db.$transaction([
    db.tournamentRole.findMany({
      where: whereQuery,
      include: {
        _count: { select: { staffAssignments: true } },
      },
      orderBy: [{ isSystem: "desc" }, ...orderBy, { name: "asc" }],
      take: perPage,
      skip: offset,
    }),
    db.tournamentRole.count({ where: whereQuery }),
  ])

  const pageCount = Math.ceil(total / perPage)
  return { roles, total, pageCount }
}

export const findTournamentRoleById = async (id: string) => {
  return db.tournamentRole.findUnique({
    where: { id },
    include: {
      staffAssignments: {
        include: {
          user: { select: { id: true, name: true } },
          tournament: { select: { id: true, name: true } },
        },
        take: 10,
      },
    },
  })
}

// -----------------------------------------------------------------------------
// TournamentStaffAssignment queries
// -----------------------------------------------------------------------------

export const findTournamentStaff = async (tournamentId: string) => {
  return db.tournamentStaffAssignment.findMany({
    where: { tournamentId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      tournamentRole: { select: { id: true, name: true, code: true } },
      division: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  })
}

// -----------------------------------------------------------------------------
// Registration detail query
// -----------------------------------------------------------------------------

export const findRegistrationById = async (id: string) => {
  return db.registration.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      paymentStatus: true,
      totalFeeCents: true,
      currency: true,
      stripePaymentIntentId: true,
      submittedAt: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
      tournament: {
        select: { id: true, name: true },
      },
      entries: {
        select: {
          id: true,
          snapshotRankName: true,
          snapshotOrgName: true,
          status: true,
          division: { select: { id: true, name: true } },
          tournamentRole: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  })
}

// -----------------------------------------------------------------------------
// WeighInRecord queries
// -----------------------------------------------------------------------------

export const findWeighInRecords = async (registrationId: string) => {
  return db.weighInRecord.findMany({
    where: { registrationId },
    include: {
      user: { select: { id: true, name: true } },
    },
    orderBy: { recordedAt: "desc" },
  })
}

export const findWeighInRecordsByTournament = async (tournamentId: string) => {
  return db.weighInRecord.findMany({
    where: {
      registration: { tournamentId },
    },
    include: {
      user: { select: { id: true, name: true } },
      registration: {
        select: {
          id: true,
          user: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { recordedAt: "desc" },
  })
}

// -----------------------------------------------------------------------------
// RuleSet queries
// -----------------------------------------------------------------------------

export const findRuleSets = async () => {
  const brand = await getRequestBrand()

  return db.ruleSet.findMany({
    where: {
      OR: [{ brand }, { brand: null, isSystem: true }],
    },
    include: {
      discipline: { select: { id: true, name: true } },
      _count: { select: { tournamentDisciplines: true } },
    },
    orderBy: [{ isSystem: "desc" }, { name: "asc" }],
  })
}

export const findRuleSetsPaginated = async (search: RuleSetsTableSchema) => {
  const { name, sort, page, perPage, from, to, operator } = search
  const brand = await getRequestBrand()

  const offset = (page - 1) * perPage
  const orderBy = sort.map(item => ({ [item.id]: item.desc ? "desc" : "asc" }) as const)

  const fromDate = from ? startOfDay(new Date(from)) : undefined
  const toDate = to ? endOfDay(new Date(to)) : undefined

  const expressions: (Prisma.RuleSetWhereInput | undefined)[] = [
    name ? { name: { contains: name, mode: "insensitive" } } : undefined,
    fromDate || toDate ? { createdAt: { gte: fromDate, lte: toDate } } : undefined,
  ]

  const whereQuery: Prisma.RuleSetWhereInput = {
    OR: [{ brand }, { brand: null, isSystem: true }],
    [operator.toUpperCase()]: expressions.filter(isTruthy),
  }

  const [ruleSets, total] = await db.$transaction([
    db.ruleSet.findMany({
      where: whereQuery,
      include: {
        discipline: { select: { id: true, name: true } },
        _count: { select: { tournamentDisciplines: true } },
      },
      orderBy: [{ isSystem: "desc" }, ...orderBy, { name: "asc" }],
      take: perPage,
      skip: offset,
    }),
    db.ruleSet.count({ where: whereQuery }),
  ])

  const pageCount = Math.ceil(total / perPage)
  return { ruleSets, total, pageCount }
}

export const findRuleSetById = async (id: string) => {
  return db.ruleSet.findUnique({
    where: { id },
    include: {
      discipline: { select: { id: true, name: true } },
      tournamentDisciplines: {
        include: {
          tournament: { select: { id: true, name: true } },
        },
        take: 10,
      },
    },
  })
}

// -----------------------------------------------------------------------------
// MatAssignment queries
// -----------------------------------------------------------------------------

export const findMatAssignmentsByTournament = async (tournamentId: string) => {
  return db.matAssignment.findMany({
    where: { tournamentId },
    include: {
      match: {
        select: {
          id: true,
          roundNumber: true,
          matchNumber: true,
          status: true,
          bracket: {
            select: {
              division: { select: { id: true, name: true } },
            },
          },
          competitors: {
            include: {
              registrationEntry: {
                include: {
                  registration: {
                    include: { user: { select: { name: true } } },
                  },
                },
              },
            },
            orderBy: { slot: "asc" as const },
          },
        },
      },
    },
    orderBy: [{ matName: "asc" }, { startTime: "asc" }],
  })
}

// -----------------------------------------------------------------------------
// FightRecord queries
// -----------------------------------------------------------------------------

export const findFightRecordsByTournament = async (tournamentId: string) => {
  // Get all users who competed in this tournament, then their fight records
  const registrations = await db.registration.findMany({
    where: { tournamentId, status: "APPROVED" },
    select: { userId: true },
  })
  const userIds = [...new Set(registrations.map(r => r.userId))]

  if (userIds.length === 0) return []

  return db.fightRecord.findMany({
    where: { userId: { in: userIds } },
    include: {
      user: { select: { id: true, name: true, email: true } },
      discipline: { select: { id: true, name: true } },
    },
    orderBy: [{ userId: "asc" }, { disciplineId: "asc" }],
  })
}
