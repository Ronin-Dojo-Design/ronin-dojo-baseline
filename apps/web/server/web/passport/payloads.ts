import type { Prisma } from "~/.generated/prisma/client"

// ---------------------------------------------------------------------------
// Passport payloads — Dirstarter L1 pattern
// ---------------------------------------------------------------------------

export const passportOnePayload = {
  id: true,
  displayName: true,
  legalFirstName: true,
  legalLastName: true,
  dob: true,
  gender: true,
  phoneE164: true,
  emergencyContactName: true,
  emergencyContactPhoneE164: true,
  avatarUrl: true,
  bio: true,
  socialLinks: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
} satisfies Prisma.PassportSelect

export type PassportOne = Prisma.PassportGetPayload<{ select: typeof passportOnePayload }>

// ---------------------------------------------------------------------------
// DirectoryProfile payloads
// ---------------------------------------------------------------------------

export const directoryProfileOnePayload = {
  id: true,
  slug: true,
  visibility: true,
  locationCity: true,
  locationRegion: true,
  locationCountry: true,
  showEmail: true,
  showPhone: true,
  showOrgs: true,
  showRanks: true,
  coverPhotoUrl: true,
  videoIntroUrl: true,
  createdAt: true,
  updatedAt: true,
  passportId: true,
} satisfies Prisma.DirectoryProfileSelect

export type DirectoryProfileOne = Prisma.DirectoryProfileGetPayload<{
  select: typeof directoryProfileOnePayload
}>
