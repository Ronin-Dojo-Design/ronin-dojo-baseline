import {
  FREE_LINEAGE_PROFILE_DETAIL_RENDER_POLICY,
  type LineageProfileDetailRenderPolicy,
} from "~/lib/entitlements/lineage-tier-policy"
import {
  pickLineageClaimStatus,
  resolveLineageClaimBadgeStatus,
  resolveLineageTrustStatus,
  resolveMemberTrustStatus,
  type TrustRankAward,
} from "~/lib/lineage/trust-status"
import { resolveDisplayAvatar } from "~/lib/media"
import type {
  DirectoryProfileDetail,
  DirectoryProfileList,
  DirectoryProfileSelf,
} from "~/server/web/directory/payloads"
import { projectPublicPassport } from "~/server/web/passport/public-projection"

type ProfileViewer = {
  viewerUserId?: string | null
  viewerRole?: string | null
}

type UserTrustSource = {
  isPlaceholder?: boolean | null
  // The member's awarded belts, carrying each award's canonical `RankEntry.status` — the ONE
  // member-facing rank-trust source (LR 0008). Trust derives from the top non-PENDING entry, the
  // SAME source (and SAME `resolveMemberTrustStatus` choke point) the lineage tree/drawer read.
  rankAwards?: readonly TrustRankAward[]
  lineageNode?: {
    // Beltless fallback ONLY (WL-P2-46): a documented-but-beltless verified member still reads
    // verified. A present RankEntry always wins over these node fields.
    isVerified?: boolean | null
    verificationStatus?: "PENDING" | "VERIFIED" | "DISPUTED" | null
    claimRequests?: { status: "PENDING" | "APPROVED" | "DENIED" | "NEEDS_INFO" | "CANCELLED" }[]
  } | null
}

/**
 * Whether the viewer may see the RICH-media fields (cover/video/social/location/email).
 * Basic identity+bio+ranks+organizations are unconditional for a claimed profile — no viewer
 * check is needed for those. Rich media unlocks when the tier grants it, OR the viewer is an
 * admin, OR the viewer owns the Passport (owner always previews their own rich media).
 *
 * @changed SESSION_0502 (TASK_03) — renamed from `canRenderFullProfileForViewer`; the gate now
 * targets rich media specifically, since "full basic" is granted to every claimed profile.
 */
function canRenderRichMediaForViewer({
  policy,
  profileUserId,
  viewerUserId,
  viewerRole,
}: {
  policy: LineageProfileDetailRenderPolicy
  profileUserId: string | null
} & ProfileViewer) {
  return (
    policy.canRenderRichMedia ||
    viewerRole === "admin" ||
    (profileUserId != null && viewerUserId === profileUserId)
  )
}

function rankSummaryForProfile<RankAward>(profile: {
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
function projectProfileOrganizations(user: {
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

function trustSummaryForUser(user: UserTrustSource) {
  const claimStatus = pickLineageClaimStatus(user.lineageNode?.claimRequests)

  return {
    // Trust from the member's rank (top non-PENDING RankEntry), else the beltless node fallback
    // (WL-P2-46) — the SAME choke point the lineage surfaces read; claim axis still from the node.
    trustStatus: resolveLineageTrustStatus({
      rankStatus: resolveMemberTrustStatus(user.rankAwards ?? [], user.lineageNode ?? {}),
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
// sees their own profile in full (the `canRenderRichMediaForViewer` "own
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

  // Project identity through the canonical public passport projector (issue #134 surface-2).
  // showRanks: true — the owner always sees their own ranks in full (no gate for /me).
  const passportDto = projectPublicPassport(passport, { brand, showRanks: true })
  const currentRankFromDto = passportDto.currentRank

  const currentRank = currentRankFromDto
    ? {
        name: currentRankFromDto.name,
        colorHex: currentRankFromDto.colorHex,
        // disciplineName is the full discipline name (e.g. "Brazilian Jiu-Jitsu").
        disciplineLabel: currentRankFromDto.disciplineName ?? null,
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

  // "Based in" string: prefer the structured DirectoryProfile location (city/region/country the
  // member set for the directory), falling back to the Passport's free-text `currentResidence`
  // (the Pods-imported residence — added by the SESSION_0410 currentResidence migration). Without
  // this fallback the imported residence never surfaced on /me.
  const locationLine =
    [profile.locationCity, profile.locationRegion, profile.locationCountry]
      .filter(Boolean)
      .join(", ") ||
    passport.currentResidence ||
    null

  return {
    passportId: profile.passportId,
    slug: profile.slug,
    name: passportDto.displayName,
    avatarUrl: passportDto.avatarUrl,
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

// ---------------------------------------------------------------------------
// Public directory DETAIL projection (`/directory/[slug]`) — SESSION_0502 (TASK_03).
//
// ONE policy-parameterized projector for the detail page, replacing the two-branch
// (preview vs full) split that used to live inline in `findProfileBySlug`. It maps
// fields per the operator-ratified boundary:
//   BASIC (name/avatar/bio/organizations/full rank history/trust) — always populated for a
//     claimed profile, free tier included.
//   RICH  (coverPhotoUrl/videoIntroUrl/socialLinks/location/email/techniqueProgress) — populated
//     only when the viewer may see rich media (premium+ tier, admin, or owner).
// `email` is additionally gated behind the member's `showEmail` flag; `techniqueProgress`
// behind rich media. The returned object keeps a `canRenderFullProfile` key aliased to the
// rich-media decision so the existing component consumers need no edits.
// ---------------------------------------------------------------------------

export function projectDirectoryDetailProfile({
  profile,
  policy,
  viewerUserId,
  viewerRole,
  brand,
}: {
  profile: DirectoryProfileDetail
  policy: LineageProfileDetailRenderPolicy
  brand?: string | null
} & ProfileViewer) {
  // Phase 3c: identity is Passport-rooted; `passport.user` is the attached account (null = placeholder).
  const account = profile.passport.user
  const canRenderRichMedia = canRenderRichMediaForViewer({
    policy,
    profileUserId: account?.id ?? null,
    viewerUserId,
    viewerRole,
  })

  // Project identity through the canonical public passport projector (issue #134 surface-2):
  // displayName → account.name fallback, avatar resolution, showRanks gate, full rank history.
  const passportDto = projectPublicPassport(profile.passport, {
    brand,
    showRanks: profile.showRanks ?? undefined,
  })

  const organizations =
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
      : []

  return {
    id: profile.id,
    // @added SESSION_0397 — Passport id is the Save subject for a person (Passport = identity SoT).
    passportId: profile.passport.id,
    slug: profile.slug,
    profileTier: policy.tier,
    // Aliased to the rich-media decision so the 7 component consumers (rich/upgrade/QR affordances)
    // need zero edits. Basic fields render unconditionally regardless of this flag.
    canRenderFullProfile: canRenderRichMedia,
    isClaimablePlaceholder: account == null,
    isOwnProfile: account != null && viewerUserId === account.id,
    ...trustSummaryForUser({
      isPlaceholder: account == null,
      rankAwards: profile.passport.rankAwardsEarned,
      lineageNode: profile.passport.lineageNode,
    }),
    // RICH media — gated.
    coverPhotoUrl: canRenderRichMedia ? profile.coverPhotoUrl : null,
    videoIntroUrl: canRenderRichMedia ? profile.videoIntroUrl : null,
    locationCity: canRenderRichMedia ? profile.locationCity : null,
    locationRegion: canRenderRichMedia ? profile.locationRegion : null,
    locationCountry: canRenderRichMedia ? profile.locationCountry : null,
    user: {
      id: account?.id ?? null,
      // BASIC identity — always published for a claimed profile.
      name: passportDto.displayName,
      image: passportDto.avatarUrl,
      bio: profile.passport.bio ?? null,
      organizations,
      ranks: passportDto.ranks,
      // RICH media — gated.
      socialLinks: canRenderRichMedia ? (profile.passport.socialLinks ?? null) : null,
      email: canRenderRichMedia && profile.showEmail ? (account?.email ?? null) : null,
      techniqueProgress: canRenderRichMedia ? (account?.techniqueProgress ?? []) : [],
    },
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
  // The output flag stays viewer-widened (owner/admin see the "full" badge on their own card).
  const canRenderFullProfile = canRenderRichMediaForViewer({
    policy,
    profileUserId: account?.id ?? null,
    viewerUserId,
    viewerRole,
  })
  // @changed SESSION_0502 (TASK_03, scope guard) — the list/roster CARD is a DISTINCT surface
  // from the detail page and stays behavior-identical: free cards keep their compact roster
  // shape even for the owner/admin. The detail-policy `features` map was widened so free DETAIL
  // pages publish bio/ranks/orgs, so the list card can no longer gate on those flags — it gates
  // on the TIER's rich access (`policy.canRenderRichMedia`), which is false-on-free regardless
  // of viewer. (Previously this rode `features.organizations/rankHistory` being false-on-free.)
  const cardShowsRich = policy.canRenderRichMedia

  return {
    id: profile.id,
    // @added SESSION_0397 — Passport id is the bookmark subject for a person (Passport = identity SoT).
    passportId: profile.passportId,
    slug: profile.slug ?? profile.id,
    userId: account?.id ?? null,
    name: profile.passport.displayName ?? account?.name ?? null,
    profileTier: policy.tier,
    // Output key kept as `canRenderFullProfile` (the roster-card consumer + map-roster contract).
    canRenderFullProfile,
    ...trustSummaryForUser({
      isPlaceholder: account == null,
      rankAwards: profile.passport.rankAwardsEarned,
      lineageNode: profile.passport.lineageNode,
    }),
    // Prefer the promoted Passport avatar, fall back to the account image, then the brand default.
    image: resolveDisplayAvatar(profile.passport.avatarUrl ?? account?.image, brand),
    locationCity: cardShowsRich && policy.features.location ? profile.locationCity : null,
    locationRegion: cardShowsRich && policy.features.location ? profile.locationRegion : null,
    locationCountry: cardShowsRich && policy.features.location ? profile.locationCountry : null,
    email:
      cardShowsRich && policy.features.email && profile.showEmail ? (account?.email ?? null) : null,
    organizations:
      cardShowsRich && policy.features.organizations && profile.showOrgs
        ? projectProfileOrganizations({
            affiliations: profile.passport.affiliations,
            memberships: account?.memberships ?? [],
          })
        : [],
    ranks:
      cardShowsRich && policy.features.rankHistory && profile.showRanks
        ? profile.passport.rankAwardsEarned
        : rankSummaryForProfile({
            showRanks: profile.showRanks,
            rankAwards: profile.passport.rankAwardsEarned,
          }),
  }
}
