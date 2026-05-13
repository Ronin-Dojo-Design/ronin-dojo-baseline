import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"
import * as z from "zod"
import { type Membership, MembershipStatus } from "~/.generated/prisma/browser"
import { getSortingStateParser } from "~/lib/parsers"

export const membershipsTableParamsSchema = {
  name: parseAsString.withDefault(""),
  status: parseAsArrayOf(
    parseAsStringEnum<MembershipStatus>(Object.values(MembershipStatus)),
  ).withDefault([]),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(25),
  sort: getSortingStateParser<Membership>().withDefault([{ id: "createdAt", desc: true }]),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  operator: parseAsStringEnum(["and", "or"]).withDefault("and"),
}

export const membershipsTableParamsCache = createSearchParamsCache(membershipsTableParamsSchema)
export type MembershipsTableSchema = Awaited<ReturnType<typeof membershipsTableParamsCache.parse>>

export const transitionMembershipSchema = z.object({
  id: z.string().min(1, "Membership ID is required"),
  toStatus: z.enum(["INVITED", "PENDING", "ACTIVE", "SUSPENDED", "CANCELLED", "EXPIRED"]),
})

export type TransitionMembershipSchema = z.infer<typeof transitionMembershipSchema>

export { VALID_TRANSITIONS } from "~/server/admin/memberships/constants"

export const roleAssignmentSchema = z.object({
  membershipId: z.string().min(1, "Membership ID is required"),
  roleId: z.string().min(1, "Role ID is required"),
})

export type RoleAssignmentSchema = z.infer<typeof roleAssignmentSchema>
