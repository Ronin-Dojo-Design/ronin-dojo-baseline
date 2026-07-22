import { z } from "zod"

// Use string literals instead of Prisma enums to avoid pulling Prisma runtime into client bundle
const DirectoryVisibility = z.enum(["PUBLIC", "MEMBERS_ONLY", "HIDDEN"])
const Gender = z.enum(["MALE", "FEMALE", "NONBINARY", "PREFER_NOT_TO_SAY"])

// Form inputs represent "not set" as either "" (text fields via the str() helper) or
// null (FormMedia clears to null) — both are valid to submit and map to null in the DB
// (clears the field). Use `.nullish()` (not `.optional()`) so a null from FormMedia is
// accepted; without it z.string().url() rejects null with the union's "Invalid input".
const optionalUrl = z
  .string()
  .url()
  .max(2048)
  .or(z.literal(""))
  .nullish()
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
  // ISO 3166-1 alpha-2 from `CountryField` (SESSION_0496). "" is the form's "not set"
  // (see the note above) and maps to null (clears the column) — the bare
  // `.length(2).optional()` rejected "", wedging the whole directory form for anyone
  // with no country set (latent since the raw 2-letter TextField). Letters-only +
  // uppercase normalization (pass-2): the column is Char(2) and every reader
  // (`countryFlagEmoji`, `getCountryLabel`) keys off the uppercase code. undefined
  // must SURVIVE as undefined — Prisma partial updates skip absent fields, null clears.
  locationCountry: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/, "Use a 2-letter country code")
    .or(z.literal(""))
    .nullish()
    .transform(v => (v ? v.toUpperCase() : v === "" ? null : v)),
  showEmail: z.boolean().optional(),
  showPhone: z.boolean().optional(),
  showOrgs: z.boolean().optional(),
  showRanks: z.boolean().optional(),
  coverPhotoUrl: optionalUrl,
  videoIntroUrl: optionalUrl,
})
