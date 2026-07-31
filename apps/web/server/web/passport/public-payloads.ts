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
  // @changed SESSION_0729 (#376) — read the member's ranks from `RankEntry` (the ONE canonical
  // rank model, ADR 0058 / spec #372) instead of the retired `RankAward` read-model, so every
  // public surface (profile, directory, lineage, rail, related-profiles) agrees on rank. Fact
  // fields the rank card still shows (awardedAt) come from the anchor award via the required
  // `RankEntry.rankAward` relation until the table-drop (G-011).
  rankEntries: {
    // [0] is the headline "current rank" in projectPublicPassport. Highest belt (Rank.sortOrder)
    // first; the anchor award's `awardedAt` is the tiebreak so a NULL-dated lower belt can't float
    // to the top (Postgres NULLS-FIRST default). SESSION_0430 order preserved.
    orderBy: [
      { rank: { sortOrder: "desc" as const } },
      { rankAward: { awardedAt: "desc" as const } },
    ],
    select: {
      id: true,
      // @added SESSION_0523 (WL-P2-46) — the canonical member-facing rank trust axis (LR 0008),
      // now read straight off the RankEntry so the directory trust badge and the lineage surfaces
      // share ONE source (`pickTopTrustStatus`).
      status: true,
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
      // Anchor read (fact domain): `awardedAt` + the award id live on RankAward until the
      // table-drop. Reached via the required `rankAward` relation — NOT a top-level RankAward read.
      rankAward: { select: { id: true, awardedAt: true } },
    },
  },
} satisfies Prisma.PassportSelect

export type PublicPassportRow = Prisma.PassportGetPayload<{ select: typeof publicPassportPayload }>
