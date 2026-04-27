import { z } from "zod"

const Brand = z.enum(["RONIN_DOJO_DESIGN", "BASELINE_MARTIAL_ARTS", "BBL", "WEKAF"])
const OrganizationType = z.enum(["DOJO", "LEAGUE", "SCHOOL", "CLUB"])

export const createOrganizationSchema = z.object({
  brand: Brand,
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  type: OrganizationType.default("DOJO"),
  address: z.string().max(500).optional(),
  websiteUrl: z.string().url().max(2048).optional(),
  /** IDs of disciplines this org teaches — creates OrganizationDiscipline join rows */
  disciplineIds: z.array(z.string().cuid()).optional(),
})

export const joinOrganizationSchema = z.object({
  organizationId: z.string().cuid(),
  disciplineId: z.string().cuid(),
  brand: Brand,
})
