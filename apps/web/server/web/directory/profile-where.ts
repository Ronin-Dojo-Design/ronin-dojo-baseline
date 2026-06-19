import type { Brand, DirectoryVisibility } from "~/.generated/prisma/client"

/**
 * Filter inputs that shape the directory-profile `where` clause.
 * `brand` is intentionally NOT part of this type — it is always passed
 * separately and server-derived, never trusted from the URL.
 */
export type DirectoryProfileWhereInput = {
  q?: string
  /** Discipline slug. */
  discipline?: string
  /** Organization (school) slug. Scoped inside the brand-pinned membership. */
  org?: string
  /**
   * Rank id (globally unique — `Rank` has no slug; it lives within a
   * `RankSystem` → `Discipline`). Narrows to people who earned that rank.
   */
  rank?: string
  city?: string
  region?: string
}

/**
 * Pure builder for the privacy- and brand-scoped DirectoryProfile `where` clause.
 *
 * Security invariant: the brand is ANDed inside the membership `some` regardless
 * of the filter inputs, so a cross-brand `org`/`discipline` slug supplied via the
 * URL yields a `{ brand, slug }` pair that matches nothing — it can never widen
 * results to another brand. Visibility is viewer-derived: unauthenticated viewers
 * see PUBLIC only; authenticated viewers also see MEMBERS_ONLY.
 *
 * Extracted from `searchDirectoryProfiles` (SESSION_0353) so the clause is
 * unit-testable without a database.
 */
export function buildDirectoryProfileWhere(
  search: DirectoryProfileWhereInput,
  brand: Brand,
  viewerUserId?: string | null,
): Record<string, unknown> {
  const { q, discipline, org, rank, city, region } = search

  const allowedVisibility: DirectoryVisibility[] = viewerUserId
    ? ["PUBLIC", "MEMBERS_ONLY"]
    : ["PUBLIC"]

  // Phase 3c: DirectoryProfile is Passport-rooted; memberships are account-side, reached
  // through passport.user (SOT-ADR D1). RankAward earner is Passport-rooted directly, so a rank
  // filter narrows on the Passport via `rankAwardsEarned`, alongside the account-side membership.
  const passport: Record<string, unknown> = {
    // The roster is Passport-rooted, with TWO brand-membership paths that must both surface:
    //   1. account-side Membership → Organization (claimed members with a User account)
    //   2. lineage-tree membership — the imported roster: placeholder Passports with no User
    //      (90/91 of BBL's), brand-linked via LineageTree, not Membership.
    // brand is server-derived and ANDed inside each path, so a cross-brand slug can't widen.
    OR: [
      {
        user: {
          memberships: {
            some: {
              organization: { brand, ...(org ? { slug: org } : {}) },
              ...(discipline ? { discipline: { slug: discipline } } : {}),
            },
          },
        },
      },
      { lineageNode: { treeMembers: { some: { tree: { brand } } } } },
    ],
    // rankId is globally unique, so it is brand-safe on its own; the UI scopes the
    // available ranks by the chosen discipline for usability, not for security.
    ...(rank ? { rankAwardsEarned: { some: { rankId: rank } } } : {}),
  }

  const where: Record<string, unknown> = {
    visibility: { in: allowedVisibility },
    passport,
  }

  if (city) {
    where.locationCity = { contains: city, mode: "insensitive" }
  }
  if (region) {
    where.locationRegion = { contains: region, mode: "insensitive" }
  }
  if (q) {
    where.OR = [
      { passport: { displayName: { contains: q, mode: "insensitive" } } },
      { passport: { user: { name: { contains: q, mode: "insensitive" } } } },
      { locationCity: { contains: q, mode: "insensitive" } },
      { locationRegion: { contains: q, mode: "insensitive" } },
    ]
  }

  return where
}
