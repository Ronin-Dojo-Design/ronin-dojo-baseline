import {
  createSearchParamsCache,
  type inferParserType,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"
import * as z from "zod"
import {
  Brand,
  DivisionFormat,
  DivisionGender,
  MatchResult,
  PaymentStatus,
  type RuleSet,
  ScoringMethod,
  SeedingMethod,
  type Tournament,
  type TournamentRole,
  TournamentStatus,
} from "~/.generated/prisma/browser"
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
  status: parseAsStringEnum<TournamentStatus>(Object.values(TournamentStatus)).withDefault(
    "" as any,
  ),
}

export const tournamentsTableParamsCache = createSearchParamsCache(tournamentsTableParamsSchema)
export type TournamentsTableSchema = Awaited<ReturnType<typeof tournamentsTableParamsCache.parse>>

// -----------------------------------------------------------------------------
// TournamentRole admin table params
// -----------------------------------------------------------------------------

export const tournamentRolesTableParamsSchema = {
  name: parseAsString.withDefault(""),
  sort: getSortingStateParser<TournamentRole>().withDefault([{ id: "name", desc: false }]),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(25),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  operator: parseAsStringEnum(["and", "or"]).withDefault("and"),
}

export const tournamentRolesTableParamsCache = createSearchParamsCache(
  tournamentRolesTableParamsSchema,
)
export type TournamentRolesTableSchema = Awaited<
  ReturnType<typeof tournamentRolesTableParamsCache.parse>
>

// -----------------------------------------------------------------------------
// RuleSet admin table params
// -----------------------------------------------------------------------------

export const ruleSetsTableParamsSchema = {
  name: parseAsString.withDefault(""),
  sort: getSortingStateParser<RuleSet>().withDefault([{ id: "name", desc: false }]),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(25),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  operator: parseAsStringEnum(["and", "or"]).withDefault("and"),
}

export const ruleSetsTableParamsCache = createSearchParamsCache(ruleSetsTableParamsSchema)
export type RuleSetsTableSchema = Awaited<ReturnType<typeof ruleSetsTableParamsCache.parse>>

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
  ruleSetId: z.string().optional().or(z.literal("")),
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
// Walk-in registration (SESSION_0260 — A2.5 fork)
//
// Admin-initiated registration creation for at-the-venue walk-ins. Discriminated
// `recipient` lets the operator either point at an existing User or supply a
// guest {email, name} pair. A3 (SESSION_0261): guest branch writes guestEmail/
// guestName columns directly; no stub-User row. recipientKey is built by the
// action and stored on Registration for uniqueness (see ADR-0020).
// -----------------------------------------------------------------------------

export const walkInRecipientSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("user"),
    userId: z.string().min(1, "User is required"),
  }),
  z.object({
    kind: z.literal("guest"),
    email: z.string().email("Valid email is required"),
    name: z.string().min(1, "Name is required"),
  }),
])

export const createWalkInRegistrationSchema = z.object({
  tournamentId: z.string().min(1, "Tournament is required"),
  divisionId: z.string().min(1, "Division is required"),
  tournamentRoleId: z.string().min(1, "Role is required"),
  paymentStatus: z.enum(PaymentStatus).default("UNPAID"),
  recipient: walkInRecipientSchema,
})

export type CreateWalkInRegistrationInput = z.infer<typeof createWalkInRegistrationSchema>

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

// -----------------------------------------------------------------------------
// Bracket generation
// -----------------------------------------------------------------------------

export const generateBracketSchema = z.object({
  divisionId: z.string().min(1, "Division ID is required"),
  bracketName: z.string().optional(),
  seedingMethod: z.enum(SeedingMethod).default("REGISTRATION_ORDER"),
  /** For MANUAL seeding: array of { entryId, seed } pairs */
  manualSeeds: z.array(z.object({ entryId: z.string(), seed: z.number().int().min(1) })).optional(),
})

export type GenerateBracketInput = z.infer<typeof generateBracketSchema>

// -----------------------------------------------------------------------------
// Score data schemas (per scoring system)
// -----------------------------------------------------------------------------

/** Points-based scoring: Karate, TKD, Fencing, etc. */
export const pointsScoreDataSchema = z.object({
  type: z.literal("POINTS"),
  competitor1Points: z.number().int().min(0),
  competitor2Points: z.number().int().min(0),
})

/** 10-point must round score for a single round */
export const tenPointRoundSchema = z.object({
  competitor1Score: z.number().int().min(0).max(10),
  competitor2Score: z.number().int().min(0).max(10),
  competitor1Deductions: z.number().int().min(0).default(0),
  competitor2Deductions: z.number().int().min(0).default(0),
  /** Knockdowns (Boxing/MT) or Disarms (Eskrima) this round */
  competitor1Knockdowns: z.number().int().min(0).default(0),
  competitor2Knockdowns: z.number().int().min(0).default(0),
})

/** 10-point must scoring: Boxing, Muay Thai, MMA, Eskrima (WEKAF) */
export const tenPointMustScoreDataSchema = z.object({
  type: z.literal("TEN_POINT_MUST"),
  rounds: z.array(tenPointRoundSchema).min(1),
  /** Total knockdowns/disarms per competitor (for 3-knockdown/disarm TKO rule) */
  competitor1TotalKnockdowns: z.number().int().min(0).default(0),
  competitor2TotalKnockdowns: z.number().int().min(0).default(0),
})

/** Union of all scoring types */
export const scoreDataSchema = z.discriminatedUnion("type", [
  pointsScoreDataSchema,
  tenPointMustScoreDataSchema,
])

export type PointsScoreData = z.infer<typeof pointsScoreDataSchema>
export type TenPointMustScoreData = z.infer<typeof tenPointMustScoreDataSchema>
export type ScoreData = z.infer<typeof scoreDataSchema>

// -----------------------------------------------------------------------------
// Score match
// -----------------------------------------------------------------------------

export const scoreMatchSchema = z.object({
  matchId: z.string().min(1, "Match ID is required"),
  winnerEntryId: z.string().min(1, "Winner is required"),
  result: z.enum(MatchResult),
  scoreData: scoreDataSchema.optional(),
  notes: z.string().optional(),
})

export type ScoreMatchInput = z.infer<typeof scoreMatchSchema>

// -----------------------------------------------------------------------------
// TournamentRole schema
// -----------------------------------------------------------------------------

export const tournamentRoleSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isSystem: z.boolean().default(false),
})

export type TournamentRoleSchema = z.infer<typeof tournamentRoleSchema>

// -----------------------------------------------------------------------------
// TournamentStaffAssignment schema
// -----------------------------------------------------------------------------

export const tournamentStaffAssignmentSchema = z.object({
  id: z.string().optional(),
  tournamentId: z.string().min(1, "Tournament is required"),
  userId: z.string().min(1, "User is required"),
  tournamentRoleId: z.string().min(1, "Role is required"),
  divisionId: z.string().optional().or(z.literal("")),
  notes: z.string().optional(),
})

export type TournamentStaffAssignmentSchema = z.infer<typeof tournamentStaffAssignmentSchema>

// -----------------------------------------------------------------------------
// WeighInRecord schema
// -----------------------------------------------------------------------------

export const weighInRecordSchema = z.object({
  id: z.string().optional(),
  registrationId: z.string().min(1, "Registration is required"),
  userId: z.string().min(1, "User is required"),
  weightKg: z.coerce.number().positive("Weight must be positive"),
  isOfficial: z.boolean().default(false),
  notes: z.string().optional(),
})

export type WeighInRecordSchema = z.infer<typeof weighInRecordSchema>

// -----------------------------------------------------------------------------
// RuleSet schema
// -----------------------------------------------------------------------------

export const ruleSetSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  matchDurationSec: z.coerce.number().int().positive().optional().nullable(),
  overtimeSec: z.coerce.number().int().positive().optional().nullable(),
  scoringMethod: z.enum(ScoringMethod).default("POINTS"),
  scoringConfig: z.any().optional(),
  isSystem: z.boolean().default(false),
  disciplineId: z.string().optional().or(z.literal("")),
})

export type RuleSetSchema = z.infer<typeof ruleSetSchema>

// -----------------------------------------------------------------------------
// MatAssignment schema
// -----------------------------------------------------------------------------

export const matAssignmentSchema = z.object({
  id: z.string().optional(),
  matchId: z.string().min(1, "Match is required"),
  tournamentId: z.string().min(1, "Tournament is required"),
  matName: z.string().min(1, "Mat/ring name is required"),
  startTime: z.coerce.date().optional().nullable(),
  endTime: z.coerce.date().optional().nullable(),
})

export type MatAssignmentSchema = z.infer<typeof matAssignmentSchema>

// -----------------------------------------------------------------------------
// FightRecord publication schema
// -----------------------------------------------------------------------------

export const publishFightRecordSchema = z.object({
  matchId: z.string().min(1, "Match is required"),
})

export type PublishFightRecordSchema = z.infer<typeof publishFightRecordSchema>
