import { z } from "zod"

// Use string literals instead of Prisma enums to avoid pulling Prisma runtime into client bundle
const DirectoryVisibility = z.enum(["PUBLIC", "MEMBERS_ONLY", "HIDDEN"])
const Gender = z.enum(["MALE", "FEMALE", "NONBINARY", "PREFER_NOT_TO_SAY"])

export const updatePassportSchema = z.object({
  displayName: z.string().max(100).optional(),
  legalFirstName: z.string().max(100).optional(),
  legalLastName: z.string().max(100).optional(),
  dob: z.coerce.date().nullish(),
  gender: Gender.nullish(),
  phoneE164: z.string().max(20).optional(),
  emergencyContactName: z.string().max(100).optional(),
  emergencyContactPhoneE164: z.string().max(20).optional(),
  avatarUrl: z.string().url().max(2048).optional(),
  bio: z.string().max(2000).optional(),
  socialLinks: z.record(z.string(), z.string().url()).optional(),
})

export const updateDirectoryProfileSchema = z.object({
  visibility: DirectoryVisibility.optional(),
  locationCity: z.string().max(100).optional(),
  locationRegion: z.string().max(100).optional(),
  locationCountry: z.string().length(2).optional(),
  showEmail: z.boolean().optional(),
  showPhone: z.boolean().optional(),
  showOrgs: z.boolean().optional(),
  showRanks: z.boolean().optional(),
})
