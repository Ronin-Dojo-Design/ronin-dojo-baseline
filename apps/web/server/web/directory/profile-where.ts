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
  const { q, discipline, org, city, region } = search

  const allowedVisibility: DirectoryVisibility[] = viewerUserId
    ? ["PUBLIC", "MEMBERS_ONLY"]
    : ["PUBLIC"]

  // Phase 3c: DirectoryProfile is Passport-rooted; memberships are account-side, reached
  // through passport.user (SOT-ADR D1).
  const where: Record<string, unknown> = {
    visibility: { in: allowedVisibility },
    passport: {
      user: {
        memberships: {
          some: {
            // brand is always server-derived; org slug only narrows within it.
            organization: { brand, ...(org ? { slug: org } : {}) },
            ...(discipline ? { discipline: { slug: discipline } } : {}),
          },
        },
      },
    },
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
