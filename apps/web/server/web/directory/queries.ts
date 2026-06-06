import type { Brand, DirectoryVisibility } from "~/.generated/prisma/client"
import {
  directoryProfileDetailPayload,
  directoryProfilePreviewPayload,
} from "~/server/web/directory/payloads"
import {
  canRenderFullProfileForViewer,
  rankSummaryForProfile,
  trustSummaryForUser,
} from "~/server/web/directory/profile-projection"
import { getLineageProfileDetailRenderPolicyForUser } from "~/server/web/entitlements/lineage-tier-policy"
import { db } from "~/services/db"

type ProfileViewer = {
  viewerUserId?: string | null
  viewerRole?: string | null
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
