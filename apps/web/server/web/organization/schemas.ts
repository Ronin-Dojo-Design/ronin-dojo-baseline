import { z } from "zod"

const Brand = z.enum(["RONIN_DOJO_DESIGN", "BASELINE_MARTIAL_ARTS", "BBL", "WEKAF"])
const OrganizationType = z.enum(["DOJO", "LEAGUE", "SCHOOL", "CLUB"])

export const createOrganizationSchema = z.object({
  brand: Brand,
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .max(200)
    .regex(/^[a-z0-9-]*$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional()
    .default(""),
  type: OrganizationType.default("DOJO"),
  addressLine1: z.string().max(500).optional(),
  addressLine2: z.string().max(500).optional(),
  city: z.string().min(1, "City is required").max(200),
  state: z.string().min(1, "State is required").max(100),
  zip: z.string().max(20).optional(),
  country: z.string().max(100).default("US"),
  websiteUrl: z.string().url().max(2048).optional().or(z.literal("")),
  phoneE164: z.string().max(32).optional(),
  email: z.string().email().max(200).optional().or(z.literal("")),
  /** IDs of disciplines this org teaches — creates OrganizationDiscipline join rows */
  disciplineIds: z.array(z.string().cuid()).optional(),
})

export const joinOrganizationSchema = z.object({
  organizationId: z.string().cuid(),
  disciplineId: z.string().cuid(),
  brand: Brand,
})

export const joinByInviteCodeSchema = z.object({
  inviteCode: z.string().min(1),
  disciplineId: z.string().cuid(),
})

export const updateMembershipStatusSchema = z.object({
  membershipId: z.string().cuid(),
  status: z.enum(["ACTIVE", "SUSPENDED", "EXPIRED"]),
})

export const assignRoleSchema = z.object({
  membershipId: z.string().cuid(),
  roleId: z.string().cuid(),
})

export const removeRoleSchema = z.object({
  membershipId: z.string().cuid(),
  roleId: z.string().cuid(),
})
