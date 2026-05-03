import { z } from "zod"

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
  organizationId: z.string().cuid(),
  programId: z.string().cuid().optional(),
  source: LeadSource.default("WEBSITE"),
  firstName: z.string().trim().min(1).max(120),
  lastName: z.string().trim().max(120).optional(),
  email: z.string().trim().email().optional(),
  phoneE164: z.string().trim().max(32).optional(),
  notes: z.string().trim().max(2000).optional(),
  referredBy: z.string().trim().max(200).optional(),
})

export const bookTrialSchema = z.object({
  leadId: z.string().cuid(),
  trialBookedAt: z.coerce.date().optional(),
})

export const completeTrialSchema = z.object({
  leadId: z.string().cuid(),
})

export const convertLeadSchema = z.object({
  leadId: z.string().cuid(),
  disciplineId: z.string().cuid().optional(),
  waiverIds: z.array(z.string().cuid()).default([]),
})
