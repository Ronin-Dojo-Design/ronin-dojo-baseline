import { cacheLife, cacheTag } from "next/cache"
import { type Brand, type Prisma } from "~/.generated/prisma/client"
import { tournamentCardPayload, tournamentDetailPayload } from "~/server/web/tournaments/payloads"
import type { TournamentFilterParams } from "~/server/admin/tournaments/schema"
import { db } from "~/services/db"

export const searchTournaments = async (
  search: TournamentFilterParams,
  brand: Brand,
  where?: Prisma.TournamentWhereInput,
) => {
  "use cache"

  cacheTag("tournaments")
  cacheLife("minutes")

  const { q, discipline, sort, page, perPage } = search
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
