import { z } from "zod"

const FamilyRole = z.enum(["GUARDIAN", "CHILD", "SPOUSE"])

export const createFamilyGroupSchema = z.object({
  organizationId: z.string().cuid(),
  name: z.string().trim().max(160).optional(),
  primaryUserId: z.string().cuid(),
  primaryRole: FamilyRole.default("GUARDIAN"),
})

export const addFamilyMemberSchema = z.object({
  organizationId: z.string().cuid(),
  familyGroupId: z.string().cuid(),
  userId: z.string().cuid(),
  role: FamilyRole,
  isPrimary: z.boolean().default(false),
})

export const removeFamilyMemberSchema = z.object({
  organizationId: z.string().cuid(),
  familyMemberId: z.string().cuid(),
})
