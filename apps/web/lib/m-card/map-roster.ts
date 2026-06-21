import type { DirectoryFacetResult } from "~/lib/directory/facet-result"
import type { MCardRosterData } from "~/lib/m-card/types"

/**
 * map-roster (PWCC-002) — directory facet DTO → `MCardData["roster"]`.
 *
 * Binds the roster `kind` of the m-card to the directory surface. The source is
 * `DirectoryFacetResult` — the **already-projected, already-gated** presentation DTO the
 * `/directory` facet grid feeds its cards (people / organizations / lineage trees). The spec
 * names `projectDirectoryProfileListItem` as the roster source; for the `/directory` surface that
 * projection's gated output IS `DirectoryFacetResult` (see `lib/directory/facet-result.ts`), so we
 * bind there. The mapper is **pure** and reads ONLY already-public fields — it adds no redaction
 * and cannot leak claim evidence, hidden contact fields, or private member data (those are never
 * present on `DirectoryFacetResult`).
 *
 * `fallbackAvatarUrl` is a surface-supplied default image (e.g. a brand silhouette for people with
 * no photo). It is injected by the brand-aware surface, not hardcoded here or in the card, so the
 * card stays brand-agnostic.
 */
export function mapRosterFromFacet(
  result: DirectoryFacetResult,
  options: { fallbackAvatarUrl?: string | null } = {},
): MCardRosterData {
  const rankName = result.tags[0]

  return {
    id: result.id,
    name: result.title,
    avatarUrl: result.imageUrl,
    avatarFallbackUrl: options.fallbackAvatarUrl ?? null,
    initials: result.initials,
    rank: rankName ? { name: rankName, colorHex: result.rankColorHex } : null,
    // The directory facet does not split a separate school label from the location/owner line.
    schoolLabel: null,
    locationLine: result.subtitle,
    trustStatus: result.trustStatus,
    claimStatus: result.claimStatus,
    tier: result.badges[0]?.label ?? null,
    badges: result.badges.map(badge => ({ label: badge.label, variant: badge.variant })),
    viewLabel: result.type === "person" ? "View profile" : "View",
  }
}
