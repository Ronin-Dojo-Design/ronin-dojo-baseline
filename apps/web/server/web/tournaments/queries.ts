import { cacheLife, cacheTag } from "next/cache"
import type { Brand, Prisma } from "~/.generated/prisma/client"
import type { TournamentFilterParams } from "~/server/admin/tournaments/schema"
import { tournamentCardPayload, tournamentDetailPayload } from "~/server/web/tournaments/payloads"
import { db } from "~/services/db"

export const searchTournaments = async (
  search: TournamentFilterParams,
  brand: Brand,
  where?: Prisma.TournamentWhereInput,
) => {
  "use cache"

  cacheTag("tournaments")
  cacheLife("minutes")

  const { q, discipline, sort: _sort, page, perPage } = search
  const skip = (page - 1) * perPage
  const take = perPage

  const whereQuery: Prisma.TournamentWhereInput = {
    brand,
    status: "PUBLISHED",
    ...(discipline && {
      disciplines: { some: { discipline: { slug: discipline } } },
    }),
  }

  if (q) {
    whereQuery.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { venueName: { contains: q, mode: "insensitive" } },
      { venueCity: { contains: q, mode: "insensitive" } },
    ]
  }

  const [tournaments, total] = await db.$transaction([
    db.tournament.findMany({
      where: { ...whereQuery, ...where },
      select: tournamentCardPayload,
      orderBy: { startDate: "asc" },
      take,
      skip,
    }),

    db.tournament.count({
      where: { ...whereQuery, ...where },
    }),
  ])

  return { tournaments, total, page, perPage }
}

export const findTournamentBySlug = async (slug: string, brand: Brand) => {
  "use cache"

  cacheTag(`tournament-${slug}`)
  cacheLife("minutes")

  return db.tournament.findFirst({
    where: { slug, brand, status: "PUBLISHED" },
    select: tournamentDetailPayload,
  })
}

export const findTournamentResults = async (slug: string, brand: Brand) => {
  "use cache"

  cacheTag(`tournament-results-${slug}`)
  cacheLife("minutes")

  const tournament = await db.tournament.findFirst({
    where: { slug, brand, status: "PUBLISHED" },
    select: {
      id: true,
      name: true,
      slug: true,
      startDate: true,
      endDate: true,
      venueName: true,
      venueCity: true,
      venueRegion: true,
      host: { select: { name: true } },
      disciplines: {
        select: {
          id: true,
          discipline: { select: { id: true, name: true, slug: true } },
          rulesetName: true,
          divisions: {
            orderBy: { sortOrder: "asc" as const },
            select: {
              id: true,
              name: true,
              format: true,
              gender: true,
              brackets: {
                select: {
                  id: true,
                  name: true,
                  matches: {
                    where: { status: "COMPLETED" },
                    orderBy: [{ roundNumber: "desc" as const }, { matchNumber: "asc" as const }],
                    select: {
                      id: true,
                      roundNumber: true,
                      matchNumber: true,
                      status: true,
                      result: true,
                      winnerEntryId: true,
                      competitors: {
                        orderBy: { slot: "asc" as const },
                        select: {
                          id: true,
                          slot: true,
                          seed: true,
                          registrationEntry: {
                            select: {
                              id: true,
                              registration: {
                                select: {
                                  user: {
                                    select: {
                                      id: true,
                                      name: true,
                                      passport: {
                                        select: { displayName: true },
                                      },
                                    },
                                  },
                                  guestName: true,
                                  guestEmail: true,
                                },
                              },
                              representingMembership: {
                                select: {
                                  organization: {
                                    select: { name: true },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  return tournament
}
