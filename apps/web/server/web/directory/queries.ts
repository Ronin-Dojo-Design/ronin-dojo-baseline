import { cacheLife, cacheTag } from "next/cache"
import { cache } from "react"
import type { Brand, DirectoryVisibility } from "~/.generated/prisma/client"
import {
  directoryProfileListPayload,
  directoryProfileDetailPayload,
  filterDisciplinePayload,
  filterOrganizationPayload,
  filterRankPayload,
} from "~/server/web/directory/payloads"
import { db } from "~/services/db"

export type DirectoryFilters = {
  organizationId?: string
  disciplineId?: string
  rankId?: string
  locationCity?: string
  locationRegion?: string
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
  }: {
    brand: Brand
    filters?: DirectoryFilters
    viewerUserId?: string | null
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
    const userRankFilter = filters.rankId
      ? { some: { rankId: filters.rankId } }
      : undefined

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

    // Apply per-field privacy flags — strip data the user chose to hide
    return profiles.map((profile) => ({
      id: profile.id,
      userId: profile.user.id,
      name: profile.user.name,
      image: profile.user.image,
      locationCity: profile.locationCity,
      locationRegion: profile.locationRegion,
      locationCountry: profile.locationCountry,
      email: profile.showEmail ? profile.user.email : null,
      organizations: profile.showOrgs
        ? profile.user.memberships.map((m) => ({
            id: m.organization.id,
            name: m.organization.name,
            slug: m.organization.slug,
            discipline: m.discipline,
          }))
        : [],
      ranks: profile.showRanks ? profile.user.rankAwards : [],
    }))
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
}: {
  slug: string
  brand: Brand
  viewerUserId?: string | null
}) => {
  const allowedVisibility: DirectoryVisibility[] = viewerUserId
    ? ["PUBLIC", "MEMBERS_ONLY"]
    : ["PUBLIC"]

  const profile = await db.directoryProfile.findFirst({
    where: {
      slug,
      visibility: { in: allowedVisibility },
      user: {
        memberships: { some: { organization: { brand } } },
      },
    },
    select: directoryProfileDetailPayload,
  })

  if (!profile) return null

  // Apply per-field privacy flags
  return {
    id: profile.id,
    slug: profile.slug,
    coverPhotoUrl: profile.coverPhotoUrl,
    videoIntroUrl: profile.videoIntroUrl,
    locationCity: profile.locationCity,
    locationRegion: profile.locationRegion,
    locationCountry: profile.locationCountry,
    user: {
      id: profile.user.id,
      name: profile.user.name,
      image: profile.user.image,
      bio: profile.user.passport?.bio ?? null,
      socialLinks: profile.user.passport?.socialLinks ?? null,
      email: profile.showEmail ? profile.user.email : null,
      organizations: profile.showOrgs
        ? profile.user.memberships
            .filter((m) => m.organization)
            .map((m) => ({
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
