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
    orderBy: { awardedAt: "desc" as const },
    select: {
      id: true,
      awardedAt: true,
      rank: {
        select: {
          id: true,
          name: true,
          shortName: true,
          colorHex: true,
          rankSystem: {
            select: {
              id: true,
              name: true,
              discipline: { select: { id: true, name: true, slug: true, code: true } },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.PassportSelect

export type PublicPassportRow = Prisma.PassportGetPayload<{ select: typeof publicPassportPayload }>
