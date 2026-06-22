import { z } from "zod"

// Use string literals instead of Prisma enums to avoid pulling Prisma runtime into client bundle
const DirectoryVisibility = z.enum(["PUBLIC", "MEMBERS_ONLY", "HIDDEN"])
const Gender = z.enum(["MALE", "FEMALE", "NONBINARY", "PREFER_NOT_TO_SAY"])

// Form inputs coerce null → "" via the str() helper in passport-editor.tsx. An empty
// string is "not set" — valid to submit, maps to null in the DB (clears the field).
// Without this, z.string().url().optional() rejects "" with "Invalid URL".
const optionalUrl = z
  .string()
  .url()
  .max(2048)
  .or(z.literal(""))
  .optional()
  .transform(v => (v === "" ? null : v))

export const updatePassportSchema = z.object({
  displayName: z.string().max(100).optional(),
  legalFirstName: z.string().max(100).optional(),
  legalLastName: z.string().max(100).optional(),
  dob: z.coerce.date().nullish(),
  gender: Gender.nullish(),
  phoneE164: z.string().max(20).optional(),
  emergencyContactName: z.string().max(100).optional(),
  emergencyContactPhoneE164: z.string().max(20).optional(),
  avatarUrl: optionalUrl,
  bio: z.string().max(2000).optional(),
  socialLinks: z
    .array(
      z.object({
        platform: z.string(),
        url: z.string().url(),
      }),
    )
    .optional(),
})

export const updateDirectoryProfileSchema = z.object({
  slug: z
    .string()
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes")
    .optional(),
  visibility: DirectoryVisibility.optional(),
  locationCity: z.string().max(100).optional(),
  locationRegion: z.string().max(100).optional(),
  locationCountry: z.string().length(2).optional(),
  showEmail: z.boolean().optional(),
  showPhone: z.boolean().optional(),
  showOrgs: z.boolean().optional(),
  showRanks: z.boolean().optional(),
  coverPhotoUrl: optionalUrl,
  videoIntroUrl: optionalUrl,
})
