import type { Prisma } from "~/.generated/prisma/client"

/**
 * Canonical PUBLIC Passport identity payload (issue #134, ADR 0025 — Passport is the
 * identity source of truth). This is the ONE select every public-facing surface
 * (directory, lineage tree/drawer, galaxy, disciplines/top-ranked, family, promotion
 * timeline, public tournaments) should view-model from via `projectPublicPassport`,
 * instead of re-selecting + re-redacting the identity core per surface.
 *
 * Public-safe by construction: no email/phone/legal name/DOB/emergency contact. The rank
 * gate (`directoryProfile.showRanks`) is applied in the projector, not here, so the select
 * stays a single shared shape and redaction has one audit point.
 */
export const publicPassportPayload = {
  id: true,
  displayName: true,
  avatarUrl: true,
  bio: true,
  socialLinks: true,
  user: {
    select: { id: true, name: true, image: true },
  },
  directoryProfile: {
    select: { slug: true, visibility: true, showRanks: true },
  },
  rankAwardsEarned: {
    // [0] is the headline "current rank" in projectPublicPassport. Order by highest
    // belt (Rank.sortOrder) first, awardedAt as tiebreak, so a NULL-dated lower-belt
    // award can't float to the top (Postgres NULLS-FIRST default). SESSION_0430 —
    // matches server/web/disciplines/top-ranked-queries.ts.
    orderBy: [{ rank: { sortOrder: "desc" as const } }, { awardedAt: "desc" as const }],
    select: {
      id: true,
      awardedAt: true,
      rank: {
        select: {
          id: true,
          name: true,
          shortName: true,
          colorHex: true,
          // @added SESSION_0539 — refined-belt render fields (marks + coral panels + family bar).
          secondaryColorHex: true,
          degree: true,
          beltFamily: true,
          rankSystem: {
            select: {
              id: true,
              name: true,
              discipline: { select: { id: true, name: true, slug: true, code: true } },
            },
          },
        },
      },
      // @added SESSION_0523 (WL-P2-46) — the canonical member-facing rank trust axis (LR 0008).
      // Carries the RankEntry status alongside the award so the directory trust badge reads the
      // SAME source (`pickTopTrustStatus`) as the lineage surfaces, retiring `node.isVerified`.
      rankEntry: {
        select: { status: true },
      },
    },
  },
} satisfies Prisma.PassportSelect

export type PublicPassportRow = Prisma.PassportGetPayload<{ select: typeof publicPassportPayload }>
