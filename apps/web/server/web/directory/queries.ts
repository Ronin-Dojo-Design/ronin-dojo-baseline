import { cacheLife, cacheTag } from "next/cache"
import { cache } from "react"
import type { Brand, DirectoryVisibility } from "~/.generated/prisma/client"
import {
  FREE_LINEAGE_PROFILE_DETAIL_RENDER_POLICY,
  type LineageProfileDetailRenderPolicy,
} from "~/lib/entitlements/lineage-tier-policy"
import {
  pickLineageClaimStatus,
  resolveLineageClaimBadgeStatus,
  resolveLineageTrustStatus,
} from "~/lib/lineage/trust-status"
import {
  directoryProfileDetailPayload,
  directoryProfileListPayload,
  directoryProfilePreviewPayload,
  filterDisciplinePayload,
  filterOrganizationPayload,
  filterRankPayload,
} from "~/server/web/directory/payloads"
import {
  getLineageProfileDetailRenderPoliciesForUsers,
  getLineageProfileDetailRenderPolicyForUser,
} from "~/server/web/entitlements/lineage-tier-policy"
import { db } from "~/services/db"

export type DirectoryFilters = {
  organizationId?: string
  disciplineId?: string
  rankId?: string
  locationCity?: string
  locationRegion?: string
}

type ProfileViewer = {
  viewerUserId?: string | null
  viewerRole?: string | null
}

type UserTrustSource = {
  isPlaceholder?: boolean | null
  lineageNode?: {
    isVerified?: boolean | null
    verificationStatus?: "PENDING" | "VERIFIED" | "DISPUTED" | null
    claimRequests?: { status: "PENDING" | "APPROVED" | "DENIED" | "NEEDS_INFO" | "CANCELLED" }[]
  } | null
}

function canRenderFullProfileForViewer({
  policy,
  profileUserId,
  viewerUserId,
  viewerRole,
}: {
  policy: LineageProfileDetailRenderPolicy
  profileUserId: string
} & ProfileViewer) {
  return policy.canRenderFullProfile || viewerRole === "admin" || viewerUserId === profileUserId
}

function rankSummaryForProfile<RankAward>(profile: {
  showRanks?: boolean
  user: {
    rankAwards: RankAward[]
  }
}): RankAward[] {
  return profile.showRanks === false ? [] : profile.user.rankAwards.slice(0, 1)
}

function trustSummaryForUser(user: UserTrustSource) {
  const claimStatus = pickLineageClaimStatus(user.lineageNode?.claimRequests)

  return {
    trustStatus: resolveLineageTrustStatus({
      verificationStatus: user.lineageNode?.verificationStatus,
      isVerified: user.lineageNode?.isVerified,
      isPlaceholder: user.isPlaceholder,
      claimStatus,
    }),
    claimBadgeStatus: resolveLineageClaimBadgeStatus({
      claimStatus,
    }),
  }
}

/**
 * Privacy-aware directory listing.
 *
 * - No viewer (unauthenticated) → PUBLIC profiles only
 * - Authenticated viewer → PUBLIC + MEMBERS_ONLY
 * - HIDDEN → never returned
 *
 * Per-field flags (showEmail, showPhone, showOrgs, showRanks) are projected
 * in the select so sensitive data never leaves the server.
 */
export const getDirectoryProfiles = cache(
  async ({
    brand,
    filters = {},
    viewerUserId,
    viewerRole,
  }: {
    brand: Brand
    filters?: DirectoryFilters
    viewerUserId?: string | null
    viewerRole?: string | null
  }) => {
    const allowedVisibility: DirectoryVisibility[] = viewerUserId
      ? ["PUBLIC", "MEMBERS_ONLY"]
      : ["PUBLIC"]

    // Build membership-level filters (org, discipline, rank)
    const membershipWhere: Record<string, unknown> = {}
    if (filters.organizationId) {
      membershipWhere.organizationId = filters.organizationId
    }
    if (filters.disciplineId) {
      membershipWhere.disciplineId = filters.disciplineId
    }

    // If org/discipline/rank filters are set, we need users who have a matching membership
    const userMembershipFilter =
      Object.keys(membershipWhere).length > 0
        ? { some: { ...membershipWhere, organization: { brand } } }
        : undefined

    // Rank filter works through RankAward
    const userRankFilter = filters.rankId ? { some: { rankId: filters.rankId } } : undefined

    const profiles = await db.directoryProfile.findMany({
      where: {
        visibility: { in: allowedVisibility },
        // Location filters
        ...(filters.locationCity && {
          locationCity: { contains: filters.locationCity, mode: "insensitive" as const },
        }),
        ...(filters.locationRegion && {
          locationRegion: { contains: filters.locationRegion, mode: "insensitive" as const },
        }),
        user: {
          // Brand scoping: user must have at least one membership in this brand
          memberships: userMembershipFilter ?? { some: { organization: { brand } } },
          // Rank filter
          ...(userRankFilter && { rankAwards: userRankFilter }),
        },
      },
      select: {
        ...directoryProfileListPayload,
        user: {
          select: {
            ...directoryProfileListPayload.user.select,
            memberships: {
              where: { organization: { brand } },
              select: directoryProfileListPayload.user.select.memberships.select,
            },
          },
        },
      },
      orderBy: { user: { name: "asc" } },
    })

    const policies = await getLineageProfileDetailRenderPoliciesForUsers({
      userIds: profiles.map(profile => profile.user.id),
      brand,
    })

    // Apply per-field privacy flags — strip data the user chose to hide
    return profiles.map(profile => {
      const policy = policies.get(profile.user.id) ?? FREE_LINEAGE_PROFILE_DETAIL_RENDER_POLICY
      const canRenderFullProfile = canRenderFullProfileForViewer({
        policy,
        profileUserId: profile.user.id,
        viewerUserId,
        viewerRole,
      })

      return {
        id: profile.id,
        slug: profile.slug ?? profile.id,
        userId: profile.user.id,
        name: profile.user.name,
        profileTier: policy.tier,
        canRenderFullProfile,
        ...trustSummaryForUser(profile.user),
        // Prefer the promoted Passport avatar, fall back to User.image.
        image: profile.user.passport?.avatarUrl ?? profile.user.image,
        locationCity:
          canRenderFullProfile && policy.features.location ? profile.locationCity : null,
        locationRegion:
          canRenderFullProfile && policy.features.location ? profile.locationRegion : null,
        locationCountry:
          canRenderFullProfile && policy.features.location ? profile.locationCountry : null,
        email:
          canRenderFullProfile && policy.features.email && profile.showEmail
            ? profile.user.email
            : null,
        organizations:
          canRenderFullProfile && policy.features.organizations && profile.showOrgs
            ? profile.user.memberships.map(m => ({
                id: m.organization.id,
                name: m.organization.name,
                slug: m.organization.slug,
                discipline: m.discipline,
              }))
            : [],
        ranks:
          canRenderFullProfile && policy.features.rankHistory && profile.showRanks
            ? profile.user.rankAwards
            : rankSummaryForProfile(profile),
      }
    })
  },
)

/**
 * Available filter options for the directory within a brand.
 */
export const getDirectoryFilterOptions = async (brand: Brand) => {
  "use cache"

  cacheTag("directory-filters")
  cacheLife("minutes")

  const [organizations, disciplines, ranks] = await Promise.all([
    db.organization.findMany({
      where: { brand },
      select: filterOrganizationPayload,
      orderBy: { name: "asc" },
    }),
    db.discipline.findMany({
      where: { brand },
      select: filterDisciplinePayload,
      orderBy: { name: "asc" },
    }),
    db.rank.findMany({
      where: { rankSystem: { brand } },
      select: filterRankPayload,
      orderBy: { sortOrder: "asc" },
    }),
  ])

  return { organizations, disciplines, ranks }
}

/**
 * Find a single directory profile by slug for the detail page.
 *
 * Privacy rules:
 * - HIDDEN profiles → never returned
 * - MEMBERS_ONLY → only if viewerUserId is provided (authenticated)
 * - PUBLIC → always returned
 * - Per-field flags strip sensitive data at this layer
 */
export const findProfileBySlug = async ({
  slug,
  brand,
  viewerUserId,
  viewerRole,
}: {
  slug: string
  brand: Brand
} & ProfileViewer) => {
  const allowedVisibility: DirectoryVisibility[] = viewerUserId
    ? ["PUBLIC", "MEMBERS_ONLY"]
    : ["PUBLIC"]

  const preview = await db.directoryProfile.findFirst({
    where: {
      slug,
      visibility: { in: allowedVisibility },
      user: {
        memberships: { some: { organization: { brand } } },
      },
    },
    select: directoryProfilePreviewPayload,
  })

  if (!preview) return null

  const policy = await getLineageProfileDetailRenderPolicyForUser({
    userId: preview.user.id,
    brand,
  })
  const canRenderFullProfile = canRenderFullProfileForViewer({
    policy,
    profileUserId: preview.user.id,
    viewerUserId,
    viewerRole,
  })

  if (!canRenderFullProfile) {
    return {
      id: preview.id,
      slug: preview.slug,
      profileTier: policy.tier,
      canRenderFullProfile: false,
      isOwnProfile: viewerUserId === preview.user.id,
      ...trustSummaryForUser(preview.user),
      coverPhotoUrl: null,
      videoIntroUrl: null,
      locationCity: null,
      locationRegion: null,
      locationCountry: null,
      user: {
        id: preview.user.id,
        name: preview.user.name,
        image: preview.user.passport?.avatarUrl ?? preview.user.image,
        bio: null,
        socialLinks: null,
        email: null,
        organizations: [],
        ranks: rankSummaryForProfile(preview),
        techniqueProgress: [],
      },
    }
  }

  const profile = await db.directoryProfile.findFirst({
    where: { id: preview.id },
    select: directoryProfileDetailPayload,
  })

  if (!profile) return null

  // Apply per-field privacy flags
  return {
    id: profile.id,
    slug: profile.slug,
    profileTier: policy.tier,
    canRenderFullProfile: true,
    isOwnProfile: viewerUserId === profile.user.id,
    ...trustSummaryForUser(profile.user),
    coverPhotoUrl: profile.coverPhotoUrl,
    videoIntroUrl: profile.videoIntroUrl,
    locationCity: profile.locationCity,
    locationRegion: profile.locationRegion,
    locationCountry: profile.locationCountry,
    user: {
      id: profile.user.id,
      name: profile.user.name,
      // Prefer the promoted Passport avatar, fall back to User.image.
      image: profile.user.passport?.avatarUrl ?? profile.user.image,
      bio: profile.user.passport?.bio ?? null,
      socialLinks: profile.user.passport?.socialLinks ?? null,
      email: profile.showEmail ? profile.user.email : null,
      organizations: profile.showOrgs
        ? profile.user.memberships
            .filter(m => m.organization)
            .map(m => ({
              id: m.organization.id,
              name: m.organization.name,
              slug: m.organization.slug,
              discipline: m.discipline,
              joinedAt: m.joinedAt,
            }))
        : [],
      ranks: profile.showRanks ? profile.user.rankAwards : [],
      techniqueProgress: profile.user.techniqueProgress,
    },
  }
}
