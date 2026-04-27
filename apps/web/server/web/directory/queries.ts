import { cache } from "react"
import type { Brand, DirectoryVisibility } from "~/.generated/prisma/client"
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
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            // Email/phone conditionally included — filtered post-query by per-field flags
            email: true,
            memberships: {
              where: { organization: { brand } },
              select: {
                organization: { select: { id: true, name: true, slug: true } },
                discipline: { select: { id: true, name: true } },
                status: true,
              },
            },
            rankAwards: {
              select: {
                rank: { select: { id: true, name: true, sortOrder: true, rankSystem: { select: { id: true, name: true } } } },
                awardedAt: true,
              },
              orderBy: { rank: { sortOrder: "desc" } },
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
export const getDirectoryFilterOptions = cache(async (brand: Brand) => {
  const [organizations, disciplines, ranks] = await Promise.all([
    db.organization.findMany({
      where: { brand },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.discipline.findMany({
      where: { brand },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.rank.findMany({
      where: { rankSystem: { brand } },
      select: { id: true, name: true, sortOrder: true },
      orderBy: { sortOrder: "asc" },
    }),
  ])

  return { organizations, disciplines, ranks }
})
