import type { Prisma } from "~/.generated/prisma/client"

export const tournamentCardPayload = {
  id: true,
  brand: true,
  name: true,
  slug: true,
  description: true,
  status: true,
  startDate: true,
  endDate: true,
  venueName: true,
  venueCity: true,
  venueRegion: true,
  venueCountry: true,
  host: { select: { id: true, name: true } },
  disciplines: {
    select: {
      discipline: { select: { id: true, name: true, slug: true } },
      _count: { select: { divisions: true } },
    },
  },
  _count: { select: { registrations: true } },
} satisfies Prisma.TournamentSelect

export const tournamentDetailPayload = {
  id: true,
  brand: true,
  name: true,
  slug: true,
  description: true,
  status: true,
  startDate: true,
  endDate: true,
  timezone: true,
  venueName: true,
  venueCity: true,
  venueRegion: true,
  venueCountry: true,
  host: { select: { id: true, name: true } },
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
          ageMin: true,
          ageMax: true,
          weightMinKg: true,
          weightMaxKg: true,
          feeCents: true,
          capacity: true,
          sortOrder: true,
          roleRequired: { select: { id: true, name: true } },
          rankMin: { select: { id: true, name: true } },
          rankMax: { select: { id: true, name: true } },
          _count: { select: { entries: true } },
        },
      },
    },
  },
} satisfies Prisma.TournamentSelect
