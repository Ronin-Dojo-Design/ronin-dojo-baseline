import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  type inferParserType,
} from "nuqs/server"
import * as z from "zod"
import { type Tournament, Brand, TournamentStatus, DivisionFormat, DivisionGender } from "~/.generated/prisma/browser"
import { getSortingStateParser } from "~/lib/parsers"

// -----------------------------------------------------------------------------
// Admin table params
// -----------------------------------------------------------------------------

export const tournamentsTableParamsSchema = {
  name: parseAsString.withDefault(""),
  sort: getSortingStateParser<Tournament>().withDefault([{ id: "startDate", desc: true }]),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(25),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  operator: parseAsStringEnum(["and", "or"]).withDefault("and"),
  status: parseAsStringEnum<TournamentStatus>(Object.values(TournamentStatus)).withDefault("" as any),
}

export const tournamentsTableParamsCache = createSearchParamsCache(tournamentsTableParamsSchema)
export type TournamentsTableSchema = Awaited<ReturnType<typeof tournamentsTableParamsCache.parse>>

// -----------------------------------------------------------------------------
// Division schema
// -----------------------------------------------------------------------------

export const divisionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  format: z.enum(DivisionFormat),
  gender: z.enum(DivisionGender).default("ANY"),
  ageMin: z.number().int().nullish(),
  ageMax: z.number().int().nullish(),
  weightMinKg: z.number().nullish(),
  weightMaxKg: z.number().nullish(),
  feeCents: z.number().int().default(0),
  capacity: z.number().int().nullish(),
  sortOrder: z.number().int().default(0),
  tournamentDisciplineId: z.string().min(1, "Discipline is required"),
  roleRequiredId: z.string().min(1, "Role is required"),
  rankMinId: z.string().optional().or(z.literal("")),
  rankMaxId: z.string().optional().or(z.literal("")),
})

export type DivisionSchema = z.infer<typeof divisionSchema>

// -----------------------------------------------------------------------------
// Tournament schema
// -----------------------------------------------------------------------------

export const tournamentSchema = z.object({
  id: z.string().optional(),
  brand: z.enum(Brand),
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(TournamentStatus).default("DRAFT"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  timezone: z.string().optional(),
  venueName: z.string().optional(),
  venueCity: z.string().optional(),
  venueRegion: z.string().optional(),
  venueCountry: z.string().optional(),
  hostId: z.string().min(1, "Host organization is required"),
})

export type TournamentSchema = z.infer<typeof tournamentSchema>

// -----------------------------------------------------------------------------
// Tournament discipline schema (linking tournament ↔ discipline)
// -----------------------------------------------------------------------------

export const tournamentDisciplineSchema = z.object({
  id: z.string().optional(),
  tournamentId: z.string().min(1),
  disciplineId: z.string().min(1, "Discipline is required"),
  rulesetName: z.string().optional(),
  ruleSetId: z.string().optional().or(z.literal("")),
})

export type TournamentDisciplineSchema = z.infer<typeof tournamentDisciplineSchema>

// -----------------------------------------------------------------------------
// Status transition
// -----------------------------------------------------------------------------

export const updateTournamentStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(TournamentStatus),
})

// -----------------------------------------------------------------------------
// Registration status update
// -----------------------------------------------------------------------------

import { RegistrationStatus } from "~/.generated/prisma/browser"

/** Valid admin-driven registration status transitions */
export const REGISTRATION_STATUS_TRANSITIONS: Record<string, string[]> = {
  SUBMITTED: ["APPROVED", "WAITLISTED", "CANCELLED"],
  WAITLISTED: ["APPROVED", "CANCELLED"],
  APPROVED: ["CANCELLED"],
  STARTED: ["CANCELLED"],
  CANCELLED: [],
}

export const registrationStatusUpdateSchema = z.object({
  registrationId: z.string().min(1),
  status: z.enum(RegistrationStatus),
})

export const bulkRegistrationStatusUpdateSchema = z.object({
  registrationIds: z.array(z.string().min(1)).min(1),
  status: z.enum(RegistrationStatus),
})

// -----------------------------------------------------------------------------
// Public filter params
// -----------------------------------------------------------------------------

export const tournamentFilterParams = {
  q: parseAsString.withDefault(""),
  sort: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(12),
  discipline: parseAsString.withDefault(""),
}

export const tournamentFilterParamsCache = createSearchParamsCache(tournamentFilterParams)

export type TournamentFilterSchema = typeof tournamentFilterParams
export type TournamentFilterParams = inferParserType<typeof tournamentFilterParams>
