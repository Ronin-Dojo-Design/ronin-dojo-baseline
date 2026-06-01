import type { Prisma } from "~/.generated/prisma/client"

// ---------------------------------------------------------------------------
// Directory listing payloads — Dirstarter L1 pattern
//
// Note: The directory query does post-query privacy filtering (showEmail,
// showOrgs, showRanks), so the payload includes all fields that *might* be
// returned. The privacy stripping happens in the query function, not here.
// ---------------------------------------------------------------------------

export const directoryUserPayload = {
  id: true,
  name: true,
  image: true,
  email: true,
  // Promoted Passport avatar is preferred over User.image at the projection
  // layer (SESSION_0325). Only avatarUrl is selected — it is deliberately
  // public (SESSION_0324); no other Passport field is widened into the list.
  passport: { select: { avatarUrl: true } },
} satisfies Prisma.UserSelect

export const directoryMembershipPayload = {
  organization: { select: { id: true, name: true, slug: true } },
  discipline: { select: { id: true, name: true } },
  status: true,
} satisfies Prisma.MembershipSelect

export const directoryRankAwardPayload = {
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
  visibility: true,
  locationCity: true,
  locationRegion: true,
  locationCountry: true,
  showEmail: true,
  showPhone: true,
  showOrgs: true,
  showRanks: true,
  user: {
    select: {
      ...directoryUserPayload,
      memberships: { select: directoryMembershipPayload },
      rankAwards: {
        select: directoryRankAwardPayload,
        orderBy: { rank: { sortOrder: "desc" as const } },
      },
    },
  },
} satisfies Prisma.DirectoryProfileSelect

export type DirectoryProfileList = Prisma.DirectoryProfileGetPayload<{
  select: typeof directoryProfileListPayload
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
  user: {
    select: {
      id: true,
      name: true,
      image: true,
      email: true,
      passport: {
        select: {
          avatarUrl: true,
          bio: true,
          socialLinks: true,
        },
      },
      memberships: {
        select: {
          ...directoryMembershipPayload,
          joinedAt: true,
        },
      },
      rankAwards: {
        select: directoryRankAwardPayload,
        orderBy: { rank: { sortOrder: "desc" as const } },
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
} satisfies Prisma.DirectoryProfileSelect

export type DirectoryProfileDetail = Prisma.DirectoryProfileGetPayload<{
  select: typeof directoryProfileDetailPayload
}>

// ---------------------------------------------------------------------------
// Filter options payloads
// ---------------------------------------------------------------------------

export const filterOrganizationPayload = {
  id: true,
  name: true,
} satisfies Prisma.OrganizationSelect

export const filterDisciplinePayload = {
  id: true,
  name: true,
} satisfies Prisma.DisciplineSelect

export const filterRankPayload = {
  id: true,
  name: true,
  sortOrder: true,
} satisfies Prisma.RankSelect
