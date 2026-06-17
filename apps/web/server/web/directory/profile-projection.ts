import {
  FREE_LINEAGE_PROFILE_DETAIL_RENDER_POLICY,
  type LineageProfileDetailRenderPolicy,
} from "~/lib/entitlements/lineage-tier-policy"
import {
  pickLineageClaimStatus,
  resolveLineageClaimBadgeStatus,
  resolveLineageTrustStatus,
} from "~/lib/lineage/trust-status"
import { resolveDisplayAvatar } from "~/lib/media"
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
  profileUserId: string | null
} & ProfileViewer) {
  return (
    policy.canRenderFullProfile ||
    viewerRole === "admin" ||
    (profileUserId != null && viewerUserId === profileUserId)
  )
}

export function rankSummaryForProfile<RankAward>(profile: {
  showRanks?: boolean
  rankAwards: RankAward[]
}): RankAward[] {
  return profile.showRanks === false ? [] : profile.rankAwards.slice(0, 1)
}

type ProfileOrg = {
  id: string
  name: string
  slug: string
  discipline: { id: string; name: string } | null
}

/**
 * The person↔org facet for the directory list. Reads the canonical **Affiliation** axis
 * (current affiliations with a linked org) first, falling back to Baseline **Membership**
 * orgs during the Passport-consolidation transition (D-023). Free-text-only affiliations
 * (no linked org) are intentionally excluded from the org list — they surface as a school label.
 *
 * @added SESSION_0358 (TASK_03)
 */
export function projectProfileOrganizations(user: {
  affiliations?: {
    schoolName: string | null
    organization: { id: string; name: string; slug: string } | null
  }[]
  memberships: {
    organization: { id: string; name: string; slug: string }
    discipline: { id: string; name: string } | null
  }[]
}): ProfileOrg[] {
  const affiliationOrgs = (user.affiliations ?? []).flatMap(affiliation =>
    affiliation.organization ? [{ ...affiliation.organization, discipline: null }] : [],
  )

  if (affiliationOrgs.length > 0) {
    return affiliationOrgs
  }

  return user.memberships.map(membership => ({
    id: membership.organization.id,
    name: membership.organization.name,
    slug: membership.organization.slug,
    discipline: membership.discipline,
  }))
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
  brand,
  viewerUserId,
  viewerRole,
}: {
  profile: DirectoryProfileList
  policy?: LineageProfileDetailRenderPolicy
  brand?: string | null
} & ProfileViewer) {
  // Phase 3c: identity is Passport-rooted; `passport.user` is the attached account (null = placeholder).
  const account = profile.passport.user
  const canRenderFullProfile = canRenderFullProfileForViewer({
    policy,
    profileUserId: account?.id ?? null,
    viewerUserId,
    viewerRole,
  })

  return {
    id: profile.id,
    // @added SESSION_0397 — Passport id is the bookmark subject for a person (Passport = identity SoT).
    passportId: profile.passportId,
    slug: profile.slug ?? profile.id,
    userId: account?.id ?? null,
    name: profile.passport.displayName ?? account?.name ?? null,
    profileTier: policy.tier,
    canRenderFullProfile,
    ...trustSummaryForUser({
      isPlaceholder: account == null,
      lineageNode: profile.passport.lineageNode,
    }),
    // Prefer the promoted Passport avatar, fall back to the account image, then the brand default.
    image: resolveDisplayAvatar(profile.passport.avatarUrl ?? account?.image, brand),
    locationCity: canRenderFullProfile && policy.features.location ? profile.locationCity : null,
    locationRegion:
      canRenderFullProfile && policy.features.location ? profile.locationRegion : null,
    locationCountry:
      canRenderFullProfile && policy.features.location ? profile.locationCountry : null,
    email:
      canRenderFullProfile && policy.features.email && profile.showEmail
        ? (account?.email ?? null)
        : null,
    organizations:
      canRenderFullProfile && policy.features.organizations && profile.showOrgs
        ? projectProfileOrganizations({
            affiliations: profile.passport.affiliations,
            memberships: account?.memberships ?? [],
          })
        : [],
    ranks:
      canRenderFullProfile && policy.features.rankHistory && profile.showRanks
        ? profile.passport.rankAwardsEarned
        : rankSummaryForProfile({
            showRanks: profile.showRanks,
            rankAwards: profile.passport.rankAwardsEarned,
          }),
  }
}
