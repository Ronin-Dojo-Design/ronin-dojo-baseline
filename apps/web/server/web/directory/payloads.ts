import type { Prisma } from "~/.generated/prisma/client"

// ---------------------------------------------------------------------------
// Directory listing payloads — Dirstarter L1 pattern
//
// Note: The directory query does post-query privacy filtering (showEmail,
// showOrgs, showRanks), so the payload includes all fields that *might* be
// returned. The privacy stripping happens in the query function, not here.
// ---------------------------------------------------------------------------

const directoryLineageTrustPayload = {
  id: true,
  isVerified: true,
  verificationStatus: true,
  visibility: true,
  claimRequests: {
    where: { status: { in: ["APPROVED", "PENDING", "NEEDS_INFO"] } },
    select: { status: true },
  },
} satisfies Prisma.LineageNodeSelect

// @changed SESSION_0392 (Phase 3c) — DirectoryProfile is Passport-rooted (SOT-ADR D1). Identity
// (displayName/avatarUrl) is on the Passport; the attached account (nullable `user`) carries the
// account mirror (name/image/email) and account-side CARRY collections. A null `user` = placeholder.
export const directoryPassportPayload = {
  id: true,
  displayName: true,
  // avatarUrl is deliberately public (SESSION_0324); preferred over the account image.
  avatarUrl: true,
  user: {
    select: {
      id: true,
      name: true,
      image: true,
      email: true,
    },
  },
  lineageNode: { select: directoryLineageTrustPayload },
} satisfies Prisma.PassportSelect

export const directoryMembershipPayload = {
  organization: { select: { id: true, name: true, slug: true } },
  discipline: { select: { id: true, name: true } },
  status: true,
} satisfies Prisma.MembershipSelect

// @added SESSION_0358 — Affiliation is the canonical person↔org axis (passport-and-shells.md);
// the directory org facet reads this first, falling back to Membership during the transition.
export const directoryAffiliationPayload = {
  schoolName: true,
  organization: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.AffiliationSelect

export const directoryRankAwardPayload = {
  id: true,
  rank: {
    select: {
      id: true,
      name: true,
      sortOrder: true,
      rankSystem: { select: { id: true, name: true } },
    },
  },
  awardedAt: true,
} satisfies Prisma.RankAwardSelect

export const directoryProfileListPayload = {
  id: true,
  // @added SESSION_0397 — Passport id for the polymorphic Bookmark subject (person = Passport SoT).
  passportId: true,
  slug: true,
  visibility: true,
  locationCity: true,
  locationRegion: true,
  locationCountry: true,
  showEmail: true,
  showPhone: true,
  showOrgs: true,
  showRanks: true,
  passport: {
    select: {
      ...directoryPassportPayload,
      affiliations: {
        where: { isCurrent: true },
        select: directoryAffiliationPayload,
        orderBy: { updatedAt: "desc" as const },
      },
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          email: true,
          memberships: { select: directoryMembershipPayload },
        },
      },
      rankAwardsEarned: {
        select: directoryRankAwardPayload,
        orderBy: { rank: { sortOrder: "desc" as const } },
        take: 1,
      },
    },
  },
} satisfies Prisma.DirectoryProfileSelect

export type DirectoryProfileList = Prisma.DirectoryProfileGetPayload<{
  select: typeof directoryProfileListPayload
}>

// ---------------------------------------------------------------------------
// Public preview payload — enough for free profile listing/detail preview.
// Full profile fields are selected only after the owner/listing tier is known.
// ---------------------------------------------------------------------------

export const directoryProfilePreviewPayload = {
  id: true,
  slug: true,
  visibility: true,
  showRanks: true,
  passport: {
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      user: { select: { id: true, name: true, image: true } },
      lineageNode: { select: directoryLineageTrustPayload },
      rankAwardsEarned: {
        select: directoryRankAwardPayload,
        orderBy: { rank: { sortOrder: "desc" as const } },
      },
    },
  },
} satisfies Prisma.DirectoryProfileSelect

export type DirectoryProfilePreview = Prisma.DirectoryProfileGetPayload<{
  select: typeof directoryProfilePreviewPayload
}>

// ---------------------------------------------------------------------------
// Detail payload — single profile page
// ---------------------------------------------------------------------------

export const directoryProfileDetailPayload = {
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
  passport: {
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      socialLinks: true,
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          email: true,
          memberships: {
            select: {
              ...directoryMembershipPayload,
              joinedAt: true,
            },
          },
          techniqueProgress: {
            select: {
              id: true,
              status: true,
              verifiedById: true,
            },
          },
        },
      },
      lineageNode: { select: directoryLineageTrustPayload },
      rankAwardsEarned: {
        select: directoryRankAwardPayload,
        orderBy: { rank: { sortOrder: "desc" as const } },
      },
    },
  },
} satisfies Prisma.DirectoryProfileSelect

export type DirectoryProfileDetail = Prisma.DirectoryProfileGetPayload<{
  select: typeof directoryProfileDetailPayload
}>

// Filter-options payloads (id/name/sortOrder selects) were removed in
// SESSION_0350 with their only consumer `getDirectoryFilterOptions`; the
// cross-facet filter follow-up will reintroduce a slug-aware options query.
