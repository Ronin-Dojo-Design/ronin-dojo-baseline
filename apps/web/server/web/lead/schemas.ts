import { z } from "zod"
import { databaseIdSchema } from "~/lib/validation/id"

const LeadSource = z.enum([
  "WEBSITE",
  "REFERRAL",
  "WALK_IN",
  "SOCIAL_MEDIA",
  "EVENT",
  "PARTNER",
  "AD_CAMPAIGN",
  "OTHER",
])

export const createLeadSchema = z.object({
  organizationId: databaseIdSchema,
  programId: databaseIdSchema.optional(),
  source: LeadSource.default("WEBSITE"),
  firstName: z.string().trim().min(1).max(120),
  lastName: z.string().trim().max(120).optional(),
  email: z.string().trim().email().optional(),
  phoneE164: z.string().trim().max(32).optional(),
  notes: z.string().trim().max(2000).optional(),
  referredBy: z.string().trim().max(200).optional(),
})

export const bookTrialSchema = z.object({
  leadId: databaseIdSchema,
  trialBookedAt: z.coerce.date().optional(),
})

export const completeTrialSchema = z.object({
  leadId: databaseIdSchema,
})

export const convertLeadSchema = z.object({
  leadId: databaseIdSchema,
  disciplineId: databaseIdSchema.optional(),
  waiverIds: z.array(databaseIdSchema).default([]),
})
