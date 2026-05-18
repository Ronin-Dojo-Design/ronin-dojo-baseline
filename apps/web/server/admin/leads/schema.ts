import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"
import { z } from "zod"
import { type Lead, LeadSource, LeadStatus } from "~/.generated/prisma/browser"
import { getSortingStateParser } from "~/lib/parsers"

// ---------------------------------------------------------------------------
// nuqs table params (mirrors server/admin/tools/schema.ts pattern)
// ---------------------------------------------------------------------------

export const leadsTableParamsSchema = {
  name: parseAsString.withDefault(""),
  sort: getSortingStateParser<Lead>().withDefault([{ id: "createdAt", desc: true }]),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(25),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  operator: parseAsStringEnum(["and", "or"]).withDefault("and"),
  status: parseAsArrayOf(parseAsStringEnum<LeadStatus>(Object.values(LeadStatus))).withDefault([]),
  source: parseAsArrayOf(parseAsStringEnum<LeadSource>(Object.values(LeadSource))).withDefault([]),
  organizationId: parseAsString.withDefault(""),
}

export const leadsTableParamsCache = createSearchParamsCache(leadsTableParamsSchema)
export type LeadsTableSchema = Awaited<ReturnType<typeof leadsTableParamsCache.parse>>

// ---------------------------------------------------------------------------
// Zod form schema for admin create/edit
// ---------------------------------------------------------------------------

export const leadFormSchema = z.object({
  id: z.string().optional(),
  organizationId: z.string().min(1, "Organization is required"),
  programId: z.string().optional().or(z.literal("")),
  source: z.nativeEnum(LeadSource).default(LeadSource.WALK_IN),
  firstName: z.string().trim().min(1, "First name is required").max(120),
  lastName: z.string().trim().max(120).optional().or(z.literal("")),
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  phoneE164: z.string().trim().max(32).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  referredBy: z.string().trim().max(200).optional().or(z.literal("")),
})

export type LeadFormSchema = z.infer<typeof leadFormSchema>

// ---------------------------------------------------------------------------
// Follow-up form schema
// ---------------------------------------------------------------------------

export const followUpFormSchema = z.object({
  leadId: z.string().min(1),
  channel: z.string().min(1, "Channel is required"),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  scheduledAt: z.coerce.date().optional(),
  assignedToId: z.string().optional().or(z.literal("")),
})

export type FollowUpFormSchema = z.infer<typeof followUpFormSchema>
