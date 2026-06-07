import type { LineageClaimBadgeStatus, LineageTrustStatus } from "~/lib/lineage/trust-status"

/**
 * Faceted `/directory` presentation adapter (SESSION_0350).
 *
 * `DirectoryFacetResult` is a presentation-only, normalized card shape shared by
 * the three public discovery facets — people (`DirectoryProfile`), organizations
 * (`Organization`), and published lineage trees (`LineageTree`). It is NOT a
 * persisted model and adds NO schema/enum: each source keeps its own
 * privacy-aware query; the mappers below only normalize the card header fields,
 * href, badges, and trust signals for display.
 *
 * Privacy contract: the mappers read ONLY already-public/already-projected
 * fields from each source row. They never receive (and therefore cannot leak)
 * claim evidence, reviewer notes, hidden contact fields, or private member data.
 */

/** Internal discriminator for a single result card. */
export type DirectoryFacetType = "person" | "organization" | "lineageTree"

/** URL-facing segmented-control tab values. */
export type DirectoryFacetTab = "people" | "organizations" | "trees"

export type DirectoryFacetBadge = {
  label: string
  variant: "primary" | "soft" | "outline"
}

export type DirectoryFacetResult = {
  /** Stable React key, namespaced by type so ids never collide across facets. */
  id: string
  type: DirectoryFacetType
  title: string
  href: string
  /** Secondary line: location (people/orgs) or owning org (trees). */
  subtitle: string | null
  /** Avatar/logo URL when available; otherwise null → initials fallback. */
  imageUrl: string | null
  initials: string
  /** Reuses the SESSION_0349 trust resolver output. Null when N/A (orgs). */
  trustStatus: LineageTrustStatus | null
  /** Secondary claim/claimable badge. Null when N/A. */
  claimStatus: LineageClaimBadgeStatus | null
  /** Neutral chips: top rank (people), disciplines (orgs/trees). */
  tags: string[]
  /** Outline badges: org type (orgs), paid tier (people). */
  badges: DirectoryFacetBadge[]
}

// ---------------------------------------------------------------------------
// Source row shapes (structural — satisfied by each server query's return).
// Declared here so the mappers stay pure and unit-testable without importing
// server query types (avoids a server→lib dependency cycle).
// ---------------------------------------------------------------------------

export type PersonFacetSource = {
  id: string
  slug: string
  name: string | null
  image: string | null
  profileTier: "free" | "premium" | "elite" | "legend"
  trustStatus: LineageTrustStatus
  claimBadgeStatus: LineageClaimBadgeStatus | null
  locationCity: string | null
  locationRegion: string | null
  ranks: { rank: { id: string; name: string } }[]
}

export type OrganizationFacetSource = {
  slug: string
  name: string
  city: string | null
  region: string | null
  type: string | null
  disciplines?: { discipline: { name: string } }[]
}

export type LineageTreeFacetSource = {
  id: string
  slug: string
  name: string
  discipline: { name: string } | null
  organization: { name: string; slug: string } | null
  isClaimable?: boolean | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Org types that are training locations route to `/schools`; the rest (e.g. */
/** LEAGUE / federations / affiliations) route to `/organizations`. */
const SCHOOL_ORG_TYPES = new Set(["DOJO", "SCHOOL", "CLUB"])

export function organizationHref(type: string | null, slug: string): string {
  // Only confirmed school types resolve at `/schools/[slug]` (findSchoolBySlug
  // 404s any non-school type). Everything else — LEAGUE, null/unknown, future
  // types — routes to `/organizations/[slug]`, which resolves for ANY org.
  // (Previously the null/unknown fallback went to `/schools` → a 404.)
  return type && SCHOOL_ORG_TYPES.has(type) ? `/schools/${slug}` : `/organizations/${slug}`
}

export function initialsOf(name: string | null | undefined): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

function tierLabel(tier: PersonFacetSource["profileTier"]): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1)
}

// ---------------------------------------------------------------------------
// Mappers (pure)
// ---------------------------------------------------------------------------

export function mapPersonToFacet(person: PersonFacetSource): DirectoryFacetResult {
  const location = [person.locationCity, person.locationRegion].filter(Boolean).join(", ")
  const topRank = person.ranks[0]?.rank.name

  return {
    id: `person:${person.id}`,
    type: "person",
    title: person.name ?? "Anonymous",
    href: `/directory/${person.slug}`,
    subtitle: location || null,
    imageUrl: person.image,
    initials: initialsOf(person.name),
    trustStatus: person.trustStatus,
    claimStatus: person.claimBadgeStatus,
    tags: topRank ? [topRank] : [],
    badges:
      person.profileTier !== "free"
        ? [{ label: tierLabel(person.profileTier), variant: "outline" }]
        : [],
  }
}

export function mapOrganizationToFacet(org: OrganizationFacetSource): DirectoryFacetResult {
  const location = [org.city, org.region].filter(Boolean).join(", ")

  return {
    id: `organization:${org.slug}`,
    type: "organization",
    title: org.name,
    href: organizationHref(org.type, org.slug),
    subtitle: location || null,
    imageUrl: null,
    initials: initialsOf(org.name),
    trustStatus: null,
    claimStatus: null,
    tags: (org.disciplines ?? []).map(entry => entry.discipline.name),
    badges: org.type ? [{ label: org.type.replace(/_/g, " "), variant: "outline" }] : [],
  }
}

export function mapLineageTreeToFacet(tree: LineageTreeFacetSource): DirectoryFacetResult {
  return {
    id: `lineageTree:${tree.id}`,
    type: "lineageTree",
    title: tree.name,
    href: `/lineage/${tree.slug}`,
    subtitle: tree.organization?.name ?? null,
    imageUrl: null,
    initials: initialsOf(tree.name),
    // The published-tree summary intentionally excludes node/member verification
    // data, so the only trust-family signal available here is claimability. A
    // true Verified/Disputed tree badge needs aggregated member verification
    // (deferred follow-up).
    trustStatus: null,
    claimStatus: tree.isClaimable ? "claimable" : null,
    tags: tree.discipline ? [tree.discipline.name] : [],
    badges: [],
  }
}
