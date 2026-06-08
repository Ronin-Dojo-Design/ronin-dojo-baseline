import {
  FREE_LINEAGE_PROFILE_DETAIL_RENDER_POLICY,
  type LineageProfileDetailRenderPolicy,
} from "~/lib/entitlements/lineage-tier-policy"
import {
  pickLineageClaimStatus,
  resolveLineageClaimBadgeStatus,
  resolveLineageTrustStatus,
} from "~/lib/lineage/trust-status"
import type { DirectoryProfileList } from "~/server/web/directory/payloads"

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

export function canRenderFullProfileForViewer({
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

export function rankSummaryForProfile<RankAward>(profile: {
  showRanks?: boolean
  user: {
    rankAwards: RankAward[]
  }
}): RankAward[] {
  return profile.showRanks === false ? [] : profile.user.rankAwards.slice(0, 1)
}

export function trustSummaryForUser(user: UserTrustSource) {
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

export function projectDirectoryProfileListItem({
  profile,
  policy = FREE_LINEAGE_PROFILE_DETAIL_RENDER_POLICY,
  viewerUserId,
  viewerRole,
}: {
  profile: DirectoryProfileList
  policy?: LineageProfileDetailRenderPolicy
} & ProfileViewer) {
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
    locationCity: canRenderFullProfile && policy.features.location ? profile.locationCity : null,
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
}
