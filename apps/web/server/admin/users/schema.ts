import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"
import { z } from "zod"
import { AffiliationRole, type User } from "~/.generated/prisma/browser"
import { getSortingStateParser } from "~/lib/parsers"

export const usersTableParamsSchema = {
  name: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(50),
  sort: getSortingStateParser<User>().withDefault([{ id: "createdAt", desc: true }]),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  operator: parseAsStringEnum(["and", "or"]).withDefault("and"),
}

export const usersTableParamsCache = createSearchParamsCache(usersTableParamsSchema)
export type UsersTableSchema = Awaited<ReturnType<typeof usersTableParamsCache.parse>>

export const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  email: z.email("Invalid email").optional().or(z.literal("")),
  image: z.url().optional().or(z.literal("")),
  role: z.enum(["admin", "tournament_director", "user"]).optional(),
})

export type UserSchema = z.infer<typeof userSchema>

/**
 * Add-person ("just add someone") input. One submit → placeholder User + Passport + stated RankAward
 * + optional Affiliation (+ optional lineage placement, see lineagePlacement). Discipline + rank are
 * required (the RankAward is the point); identity name is required; email is optional (a unique
 * placeholder is minted server-side). See SESSION_0358 TASK_01/02.
 *
 * @added SESSION_0358
 */
export const createPersonSchema = z.object({
  // Identity
  name: z.string().trim().min(1, "Name is required"),
  displayName: z.string().trim().optional().or(z.literal("")),
  email: z.email("Invalid email").optional().or(z.literal("")),

  // Rank (discipline-scoped cascade; RankAward source=STATED is created from these)
  disciplineId: z.string().min(1, "Discipline is required"),
  rankId: z.string().min(1, "Rank is required"),

  // Affiliation (display-only; created only when an org or a free-text school is provided)
  organizationId: z.string().optional().or(z.literal("")),
  schoolName: z.string().trim().optional().or(z.literal("")),
  affiliationRole: z.enum(AffiliationRole).default(AffiliationRole.TRAINS_AT),

  // Optional lineage placement (SESSION_0358 TASK_02). Placement happens only when treeId is set.
  treeId: z.string().optional().or(z.literal("")),
  parentMemberId: z.string().optional().or(z.literal("")),
})

export type CreatePersonSchema = z.infer<typeof createPersonSchema>
