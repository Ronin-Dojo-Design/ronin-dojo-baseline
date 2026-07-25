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
  // Fork F2 (SESSION_0705, PL-027): affirmative publicity opt-in for social celebration
  // posts. Editable ONLY through the PassportEditor (ADR 0025 — the ONE identity editor).
  allowSocialCelebration: z.boolean().optional(),
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

// ---------------------------------------------------------------------------
// Combined Passport + DirectoryProfile schema (WL-P2-45, SESSION_0700)
// ---------------------------------------------------------------------------
//
// The ONE merged schema behind the PassportEditor's single Save. A flat merge (not
// nested sub-objects) so the editor's RHF field names stay exactly what they were
// under the two separate forms — no `passport.`/`directoryProfile.` prefix churn,
// and `SocialLinksEditor`'s `socialLinks` contract is untouched. The two field sets
// share no key (Passport = identity, DirectoryProfile = presentation), so the spread
// is collision-free; `splitPassportAndProfileInput` routes each parsed key back to
// its owning model. The granular schemas above REMAIN the public API for granular
// consumers — do not delete them.

export const updatePassportAndProfileSchema = z.object({
  ...updatePassportSchema.shape,
  ...updateDirectoryProfileSchema.shape,
})

type UpdatePassportInput = z.infer<typeof updatePassportSchema>
type UpdateDirectoryProfileInput = z.infer<typeof updateDirectoryProfileSchema>

/**
 * Split a parsed combined payload back into its Passport / DirectoryProfile halves.
 *
 * Only keys PRESENT on the input are copied, preserving the load-bearing
 * undefined-skip semantics (absent field → Prisma skips it; null → clears the
 * column — see the locationCountry note above). Keys are routed by schema shape
 * membership, so a new field added to either granular schema automatically lands
 * in the right half of the combined update.
 */
export function splitPassportAndProfileInput(
  input: Partial<z.infer<typeof updatePassportAndProfileSchema>>,
): { passport: UpdatePassportInput; directoryProfile: UpdateDirectoryProfileInput } {
  const passport: Record<string, unknown> = {}
  const directoryProfile: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(input)) {
    if (key in updatePassportSchema.shape) passport[key] = value
    else if (key in updateDirectoryProfileSchema.shape) directoryProfile[key] = value
    // Unknown keys (e.g. the admin passportId, stripped by the caller) are dropped.
  }

  return {
    passport: passport as UpdatePassportInput,
    directoryProfile: directoryProfile as UpdateDirectoryProfileInput,
  }
}
