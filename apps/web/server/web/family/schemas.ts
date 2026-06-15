import { z } from "zod"
import { databaseIdSchema } from "~/lib/validation/id"

const FamilyRole = z.enum(["GUARDIAN", "CHILD", "SPOUSE"])

export const createFamilyGroupSchema = z.object({
  organizationId: databaseIdSchema,
  name: z.string().trim().max(160).optional(),
  primaryUserId: databaseIdSchema,
  primaryRole: FamilyRole.default("GUARDIAN"),
})

export const addFamilyMemberSchema = z.object({
  organizationId: databaseIdSchema,
  familyGroupId: databaseIdSchema,
  userId: databaseIdSchema,
  role: FamilyRole,
  isPrimary: z.boolean().default(false),
})

export const removeFamilyMemberSchema = z.object({
  organizationId: databaseIdSchema,
  familyMemberId: databaseIdSchema,
})
