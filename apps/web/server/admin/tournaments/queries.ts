import { Brand, type Prisma } from "~/.generated/prisma/client"
import {
  buildAdminListWhere,
  createdAtRangeExpression,
  getAdminListQueryParts,
  runAdminListTransaction,
} from "~/server/admin/list-query"
import type {
  RuleSetsTableSchema,
  TournamentRolesTableSchema,
  TournamentsTableSchema,
} from "~/server/admin/tournaments/schema"
import type { ActiveUser } from "~/components/admin/recipient-options"
import { db } from "~/services/db"

/**
 * Active, non-placeholder users for admin recipient pickers (walk-in
 * registration, certificate issuance). Top 200 ordered by name (nulls last
 * via secondary email sort).
 */
export const findActiveUsers = async (): Promise<ActiveUser[]> => {
  return db.user.findMany({
    where: { archivedAt: null, isPlaceholder: false },
    select: { id: true, name: true, email: true },
    orderBy: [{ name: "asc" }, { email: "asc" }],
    take: 200,
  })
}

export const findTournaments = async (
  search: TournamentsTableSchema,
  where?: Prisma.TournamentWhereInput,
) => {
  const { name, perPage, operator, status } = search
  const { offset, orderBy, fromDate, toDate } =
    getAdminListQueryParts<Prisma.TournamentOrderByWithRelationInput>(search)

  const expressions: (Prisma.TournamentWhereInput | undefined)[] = [
    name ? { name: { contains: name, mode: "insensitive" } } : undefined,
    status ? { status: status as any } : undefined,
    fromDate || toDate ? { startDate: { gte: fromDate, lte: toDate } } : undefined,
  ]

  const whereQuery = buildAdminListWhere<Prisma.TournamentWhereInput>({
    baseWhere: { brand: Brand.BBL },
    expressions,
    extraWhere: where,
    operator,
  })

  const {
    rows: tournaments,
    total,
    pageCount,
  } = await runAdminListTransaction({
    perPage,
    findMany: () =>
      db.tournament.findMany({
        where: whereQuery,
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
    count: () => db.tournament.count({ where: whereQuery }),
  })

  return { tournaments, total, pageCount }
}

export const findTournamentById = async (id: string) => {
  return db.tournament.findUnique({
    where: { id, brand: Brand.BBL },
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
              ruleSet: { select: { id: true, name: true, scoringMethod: true } },
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
  return db.tournamentRole.findMany({
    where: {
      OR: [{ brand: Brand.BBL }, { brand: null, isSystem: true }],
    },
    orderBy: [{ isSystem: "desc" }, { name: "asc" }],
  })
}

export const findTournamentRolesPaginated = async (search: TournamentRolesTableSchema) => {
  const { name, perPage, operator } = search
  const { offset, orderBy, fromDate, toDate } =
    getAdminListQueryParts<Prisma.TournamentRoleOrderByWithRelationInput>(search)

  const expressions: (Prisma.TournamentRoleWhereInput | undefined)[] = [
    name ? { name: { contains: name, mode: "insensitive" } } : undefined,
    createdAtRangeExpression<Prisma.TournamentRoleWhereInput>(fromDate, toDate),
  ]

  const whereQuery = buildAdminListWhere<Prisma.TournamentRoleWhereInput>({
    baseWhere: { OR: [{ brand: Brand.BBL }, { brand: null, isSystem: true }] },
    expressions,
    operator,
  })

  const {
    rows: roles,
    total,
    pageCount,
  } = await runAdminListTransaction({
    perPage,
    findMany: () =>
      db.tournamentRole.findMany({
        where: whereQuery,
        include: {
          _count: { select: { staffAssignments: true } },
        },
        orderBy: [{ isSystem: "desc" }, ...orderBy, { name: "asc" }],
        take: perPage,
        skip: offset,
      }),
    count: () => db.tournamentRole.count({ where: whereQuery }),
  })

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
      userId: true,
      guestEmail: true,
      guestName: true,
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
  return db.ruleSet.findMany({
    where: {
      OR: [{ brand: Brand.BBL }, { brand: null, isSystem: true }],
    },
    include: {
      discipline: { select: { id: true, name: true } },
      _count: { select: { tournamentDisciplines: true } },
    },
    orderBy: [{ isSystem: "desc" }, { name: "asc" }],
  })
}

export const findRuleSetsPaginated = async (search: RuleSetsTableSchema) => {
  const { name, perPage, operator } = search
  const { offset, orderBy, fromDate, toDate } =
    getAdminListQueryParts<Prisma.RuleSetOrderByWithRelationInput>(search)

  const expressions: (Prisma.RuleSetWhereInput | undefined)[] = [
    name ? { name: { contains: name, mode: "insensitive" } } : undefined,
    createdAtRangeExpression<Prisma.RuleSetWhereInput>(fromDate, toDate),
  ]

  const whereQuery = buildAdminListWhere<Prisma.RuleSetWhereInput>({
    baseWhere: { OR: [{ brand: Brand.BBL }, { brand: null, isSystem: true }] },
    expressions,
    operator,
  })

  const {
    rows: ruleSets,
    total,
    pageCount,
  } = await runAdminListTransaction({
    perPage,
    findMany: () =>
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
    count: () => db.ruleSet.count({ where: whereQuery }),
  })

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
  // Get all users who competed in this tournament, then their fight records.
  // Guest registrations (userId null) have no FightRecord rows.
  const registrations = await db.registration.findMany({
    where: { tournamentId, status: "APPROVED" },
    select: { userId: true },
  })
  const userIds = [
    ...new Set(registrations.map(r => r.userId).filter((id): id is string => id !== null)),
  ]

  if (userIds.length === 0) return []

  return db.fightRecord.findMany({
    where: { passport: { userId: { in: userIds } } },
    include: {
      // Phase 3c: FightRecord is Passport-rooted; identity + account reached via the Passport.
      passport: {
        select: {
          id: true,
          displayName: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
      discipline: { select: { id: true, name: true } },
    },
    orderBy: [{ passportId: "asc" }, { disciplineId: "asc" }],
  })
}
