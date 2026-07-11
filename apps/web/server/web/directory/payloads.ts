import type { Prisma } from "~/.generated/prisma/client"
import { publicPassportPayload } from "~/server/web/passport/public-payloads"

// ---------------------------------------------------------------------------
// Directory listing payloads — Dirstarter L1 pattern
//
// Note: The directory query does post-query privacy filtering (showEmail,
// showOrgs, showRanks), so the payload includes all fields that *might* be
// returned. The privacy stripping happens in the query function, not here.
// ---------------------------------------------------------------------------

const directoryLineageTrustPayload = {
  id: true,
  isVerified: true,
  verificationStatus: true,
  visibility: true,
  claimRequests: {
    where: { status: { in: ["APPROVED", "PENDING", "NEEDS_INFO"] } },
    select: { status: true },
  },
} satisfies Prisma.LineageNodeSelect

// @changed SESSION_0392 (Phase 3c) — DirectoryProfile is Passport-rooted (SOT-ADR D1). Identity
// (displayName/avatarUrl) is on the Passport; the attached account (nullable `user`) carries the
// account mirror (name/image/email) and account-side CARRY collections. A null `user` = placeholder.
export const directoryPassportPayload = {
  id: true,
  displayName: true,
  // avatarUrl is deliberately public (SESSION_0324); preferred over the account image.
  avatarUrl: true,
  user: {
    select: {
      id: true,
      name: true,
      image: true,
      email: true,
    },
  },
  lineageNode: { select: directoryLineageTrustPayload },
} satisfies Prisma.PassportSelect

export const directoryMembershipPayload = {
  organization: { select: { id: true, name: true, slug: true } },
  discipline: { select: { id: true, name: true } },
  status: true,
} satisfies Prisma.MembershipSelect

// @added SESSION_0358 — Affiliation is the canonical person↔org axis (passport-and-shells.md);
// the directory org facet reads this first, falling back to Membership during the transition.
export const directoryAffiliationPayload = {
  schoolName: true,
  organization: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.AffiliationSelect

export const directoryRankAwardPayload = {
  id: true,
  rank: {
    select: {
      id: true,
      name: true,
      sortOrder: true,
      // @added SESSION_0410 — colorHex is the brand-neutral belt tint (ADR 0022) for the BJJ Passport
      // credential card on the public profile + lineage drawer. Passport-rooted (this select hangs off
      // `passport.rankAwardsEarned`), so it is claim/attach-invariant. (Discipline eyebrow intentionally
      // not added here — the card's generic "Passport" label keeps the shared payload lean.)
      colorHex: true,
      rankSystem: { select: { id: true, name: true } },
    },
  },
  awardedAt: true,
  // @added SESSION_0523 (WL-P2-46) — the canonical member-facing rank trust axis (LR 0008).
  // The directory card's trust badge derives from the top award's RankEntry status
  // (`pickTopTrustStatus`), the SAME source the lineage tree/drawer read — not `node.isVerified`.
  rankEntry: {
    select: { status: true },
  },
} satisfies Prisma.RankAwardSelect

export const directoryProfileListPayload = {
  id: true,
  // @added SESSION_0397 — Passport id for the polymorphic Bookmark subject (person = Passport SoT).
  passportId: true,
  slug: true,
  visibility: true,
  locationCity: true,
  locationRegion: true,
  locationCountry: true,
  showEmail: true,
  showPhone: true,
  showOrgs: true,
  showRanks: true,
  passport: {
    select: {
      ...directoryPassportPayload,
      affiliations: {
        where: { isCurrent: true },
        select: directoryAffiliationPayload,
        orderBy: { updatedAt: "desc" as const },
      },
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          email: true,
          memberships: { select: directoryMembershipPayload },
        },
      },
      // NOT `take: 1` — the trust resolver (`resolveMemberTrustStatus`) must see the full award
      // set so it can skip a top award whose `RankEntry` is null/unsynced and read a lower verified
      // belt's status, matching the detail page (WL-P2-46 — surfaces must AGREE, LR 0008). The
      // DISPLAYED belt is still top-only via `.slice(0, 1)` in the projection.
      rankAwardsEarned: {
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
// @changed issue #134 surface-2 — now spreads publicPassportPayload for the
// canonical identity core (displayName, avatarUrl, bio, socialLinks, rankAwardsEarned
// ordered by awardedAt desc). Surface-specific extras (user email, memberships,
// techniqueProgress, lineageNode) are merged on top.
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
  passport: {
    select: {
      ...publicPassportPayload,
      // Surface-specific extras on top of the canonical public identity core:
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          email: true,
          memberships: {
            select: {
              ...directoryMembershipPayload,
              joinedAt: true,
            },
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
      lineageNode: { select: directoryLineageTrustPayload },
    },
  },
} satisfies Prisma.DirectoryProfileSelect

export type DirectoryProfileDetail = Prisma.DirectoryProfileGetPayload<{
  select: typeof directoryProfileDetailPayload
}>

// The `/me` owner self-payload (`directoryProfileSelfPayload` / `DirectoryProfileSelf`) was
// deleted with the owner arm (SESSION_0525 C0) — `/me` redirects to `/app/profile`, so the only
// live directory read is the public detail payload above.

// Filter-options payloads (id/name/sortOrder selects) were removed in
// SESSION_0350 with their only consumer `getDirectoryFilterOptions`; the
// cross-facet filter follow-up will reintroduce a slug-aware options query.
