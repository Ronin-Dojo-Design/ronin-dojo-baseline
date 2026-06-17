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
import type { DirectoryProfileList, DirectoryProfileSelf } from "~/server/web/directory/payloads"

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

// ---------------------------------------------------------------------------
// Owner self-profile projection (`/me`) — SESSION_0410.
//
// The member-facing read model for the authenticated profile page. Unlike the
// public projections above there is no tier/visibility gate: a member always
// sees their own profile in full (the `canRenderFullProfileForViewer` "own
// profile" rule, ADR 0025). Pure presentation shaping — no DB.
// ---------------------------------------------------------------------------

export type MyProfileAffiliation = {
  id: string
  /** Linked-org name when present, otherwise the free-text school label. */
  name: string | null
  /** Org slug for deep-linking to `/schools/[slug]`; null for free-text affiliations. */
  slug: string | null
  role: DirectoryProfileSelf["passport"]["affiliations"][number]["role"]
  isCurrent: boolean
}

export type MyProfile = {
  passportId: string
  slug: string | null
  name: string | null
  /** Resolved avatar (Passport avatar → account image → brand default). */
  avatarUrl: string | null
  bio: string | null
  socialLinks: Record<string, string> | null
  visibility: DirectoryProfileSelf["visibility"]
  /** Any location field set — used for the "Based in" identity bit. */
  locationLine: string | null
  placeOfBirth: string | null
  startedTrainingAt: Date | null
  /** Highest earned belt, projected for the BJJ Passport card. */
  currentRank: { name: string; colorHex: string | null; disciplineLabel: string | null } | null
  /** Current school for the card header (linked-org name → free-text label). */
  schoolLabel: string | null
  affiliations: MyProfileAffiliation[]
  /** The owner's lineage node id — null when they have no lineage placement yet. */
  lineageNodeId: string | null
}

export function projectOwnProfile({
  profile,
  brand,
}: {
  profile: DirectoryProfileSelf
  brand?: string | null
}): MyProfile {
  const { passport } = profile
  const account = passport.user

  const topAward = passport.rankAwardsEarned[0] ?? null
  const currentRank = topAward
    ? {
        name: topAward.rank.name,
        colorHex: topAward.rank.colorHex,
        // Discipline code reads as the credential eyebrow (e.g. "BJJ"); name is the fallback.
        disciplineLabel:
          topAward.rank.rankSystem.discipline?.code?.toUpperCase() ??
          topAward.rank.rankSystem.discipline?.name ??
          null,
      }
    : null

  const affiliations: MyProfileAffiliation[] = passport.affiliations.map(affiliation => ({
    id: affiliation.id,
    name: affiliation.organization?.name ?? affiliation.schoolName,
    slug: affiliation.organization?.slug ?? null,
    role: affiliation.role,
    isCurrent: affiliation.isCurrent,
  }))

  const currentAffiliation = affiliations.find(a => a.isCurrent) ?? affiliations[0] ?? null

  const locationLine =
    [profile.locationCity, profile.locationRegion, profile.locationCountry]
      .filter(Boolean)
      .join(", ") || null

  return {
    passportId: profile.passportId,
    slug: profile.slug,
    name: passport.displayName ?? account?.name ?? null,
    avatarUrl: resolveDisplayAvatar(passport.avatarUrl ?? account?.image, brand),
    bio: passport.bio ?? null,
    socialLinks: (passport.socialLinks as Record<string, string> | null) ?? null,
    visibility: profile.visibility,
    locationLine,
    placeOfBirth: passport.placeOfBirth ?? null,
    startedTrainingAt: passport.startedTrainingAt ?? null,
    currentRank,
    schoolLabel: currentAffiliation?.name ?? null,
    affiliations,
    lineageNodeId: passport.lineageNode?.id ?? null,
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
