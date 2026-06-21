import { cache } from "react"
import { resolveDisplayAvatar } from "~/lib/media"
import type { Brand, DirectoryVisibility } from "~/.generated/prisma/client"
import {
  directoryProfileDetailPayload,
  directoryProfilePreviewPayload,
  directoryProfileSelfPayload,
} from "~/server/web/directory/payloads"
import {
  canRenderFullProfileForViewer,
  type MyProfile,
  projectOwnProfile,
  rankSummaryForProfile,
  trustSummaryForUser,
} from "~/server/web/directory/profile-projection"
import { getLineageProfileDetailRenderPolicyForUser } from "~/server/web/entitlements/lineage-tier-policy"
import {
  projectPublicPassport,
  type PublicPassportRank,
} from "~/server/web/passport/public-projection"
import { db } from "~/services/db"

/**
 * Project a preview-payload rank award (from `directoryProfilePreviewPayload`) to the
 * `PublicPassportRank` shape so both branches of `findProfileBySlug` return the same
 * `user.ranks` type. The preview payload does not include discipline data, so those
 * fields are null.
 */
function previewRankToPublicRank(award: {
  id: string
  rank: {
    id: string
    name: string
    sortOrder: number
    colorHex: string | null
    rankSystem: { id: string; name: string }
  }
  awardedAt: Date | null
}): PublicPassportRank {
  return {
    awardId: award.id,
    rankId: award.rank.id,
    name: award.rank.name,
    shortName: null,
    colorHex: award.rank.colorHex,
    awardedAt: award.awardedAt,
    disciplineName: null,
    disciplineSlug: null,
  }
}

type ProfileViewer = {
  viewerUserId?: string | null
  viewerRole?: string | null
}

/**
 * The authenticated member's OWN directory profile, projected for `/me`.
 *
 * @added SESSION_0410 — the member-profile surface (BBL_PARITY_SPEC §2). Resolved by
 * `passport.userId` (Passport is the identity SoT, ADR 0025), so it returns the full
 * profile with no tier/visibility gate — a member always sees their own profile. The
 * companion promotion *timeline* reads `getOwnLineageProfile` from the lineage model;
 * this seam carries identity, bio, socials, affiliations, and the current-rank card data.
 *
 * Request-scoped `cache()` so the page and its metadata share one query.
 */
export const getOwnDirectoryProfile = cache(
  async ({ userId, brand }: { userId: string; brand: Brand }): Promise<MyProfile | null> => {
    const profile = await db.directoryProfile.findFirst({
      where: { passport: { userId } },
      select: directoryProfileSelfPayload,
    })

    if (!profile) {
      return null
    }

    return projectOwnProfile({ profile, brand })
  },
)

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
      // Same two brand-membership paths as the listing (see profile-where.ts): account-side
      // Membership OR lineage-tree membership (the imported placeholder roster).
      passport: {
        OR: [
          { user: { memberships: { some: { organization: { brand } } } } },
          { lineageNode: { treeMembers: { some: { tree: { brand } } } } },
        ],
      },
    },
    select: directoryProfilePreviewPayload,
  })

  if (!preview) return null

  // Phase 3c: identity is Passport-rooted; `passport.user` is the attached account (null = placeholder).
  const previewAccount = preview.passport.user
  const policy = await getLineageProfileDetailRenderPolicyForUser({
    userId: previewAccount?.id ?? "",
    brand,
  })
  const canRenderFullProfile = canRenderFullProfileForViewer({
    policy,
    profileUserId: previewAccount?.id ?? null,
    viewerUserId,
    viewerRole,
  })

  if (!canRenderFullProfile) {
    return {
      id: preview.id,
      // @added SESSION_0397 — Passport id (Save subject) on BOTH branches so it's unconditionally available.
      passportId: preview.passport.id,
      slug: preview.slug,
      profileTier: policy.tier,
      canRenderFullProfile: false,
      // A legacy placeholder profile (no real login account) is "claimable":
      // the detail page renders the claim teaser instead of an empty profile.
      isClaimablePlaceholder: previewAccount == null,
      isOwnProfile: previewAccount != null && viewerUserId === previewAccount.id,
      ...trustSummaryForUser({
        isPlaceholder: previewAccount == null,
        lineageNode: preview.passport.lineageNode,
      }),
      coverPhotoUrl: null,
      videoIntroUrl: null,
      locationCity: null,
      locationRegion: null,
      locationCountry: null,
      user: {
        id: previewAccount?.id ?? null,
        name: preview.passport.displayName ?? previewAccount?.name ?? null,
        image: resolveDisplayAvatar(preview.passport.avatarUrl ?? previewAccount?.image, brand),
        bio: null,
        socialLinks: null,
        email: null,
        organizations: [],
        ranks: rankSummaryForProfile({
          showRanks: preview.showRanks,
          rankAwards: preview.passport.rankAwardsEarned,
        }).map(previewRankToPublicRank),
        techniqueProgress: [],
      },
    }
  }

  const profile = await db.directoryProfile.findFirst({
    where: { id: preview.id },
    select: directoryProfileDetailPayload,
  })

  if (!profile) return null

  const account = profile.passport.user

  // Project identity through the canonical public passport projector (issue #134 surface-2).
  // This applies the displayName → account.name fallback, resolves the avatar, applies the
  // showRanks gate, and projects rankAwardsEarned → PublicPassportRank[].
  const passportDto = projectPublicPassport(profile.passport, {
    brand,
    showRanks: profile.showRanks ?? undefined,
  })

  // Apply per-field privacy flags
  return {
    id: profile.id,
    // @added SESSION_0397 — Passport id is the Save subject for a person (Passport = identity SoT).
    passportId: profile.passport.id,
    slug: profile.slug,
    profileTier: policy.tier,
    canRenderFullProfile: true,
    isClaimablePlaceholder: account == null,
    isOwnProfile: account != null && viewerUserId === account.id,
    ...trustSummaryForUser({
      isPlaceholder: account == null,
      lineageNode: profile.passport.lineageNode,
    }),
    coverPhotoUrl: profile.coverPhotoUrl,
    videoIntroUrl: profile.videoIntroUrl,
    locationCity: profile.locationCity,
    locationRegion: profile.locationRegion,
    locationCountry: profile.locationCountry,
    user: {
      id: account?.id ?? null,
      name: passportDto.displayName,
      image: passportDto.avatarUrl,
      bio: profile.passport.bio ?? null,
      socialLinks: profile.passport.socialLinks ?? null,
      email: profile.showEmail ? (account?.email ?? null) : null,
      organizations:
        profile.showOrgs && account
          ? account.memberships
              .filter(m => m.organization)
              .map(m => ({
                id: m.organization.id,
                name: m.organization.name,
                slug: m.organization.slug,
                discipline: m.discipline,
                joinedAt: m.joinedAt,
              }))
          : [],
      ranks: passportDto.ranks,
      techniqueProgress: account?.techniqueProgress ?? [],
    },
  }
}
