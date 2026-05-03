import type { Prisma } from "~/.generated/prisma/client"

export const leadProgramPayload = {
  id: true,
  brand: true,
  organizationId: true,
  disciplineId: true,
  maxEnrollment: true,
  name: true,
  slug: true,
} satisfies Prisma.ProgramSelect

export const leadPayload = {
  id: true,
  brand: true,
  status: true,
  source: true,
  firstName: true,
  lastName: true,
  email: true,
  phoneE164: true,
  notes: true,
  referredBy: true,
  trialBookedAt: true,
  convertedAt: true,
  convertedToUserId: true,
  meta: true,
  createdAt: true,
  updatedAt: true,
  organizationId: true,
  programId: true,
  program: { select: leadProgramPayload },
} satisfies Prisma.LeadSelect

export const leadFollowUpPayload = {
  id: true,
  channel: true,
  notes: true,
  scheduledAt: true,
  completedAt: true,
  createdAt: true,
  leadId: true,
  assignedToId: true,
} satisfies Prisma.LeadFollowUpSelect

export type LeadRecord = Prisma.LeadGetPayload<{
  select: typeof leadPayload
}>

export type LeadFollowUpRecord = Prisma.LeadFollowUpGetPayload<{
  select: typeof leadFollowUpPayload
}>
