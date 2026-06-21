import type { MCardData } from "~/components/web/m-card/m-card"
import type { DirectoryFacetResult } from "~/lib/directory/facet-result"
import type { projectDirectoryProfileListItem } from "~/server/web/directory/profile-projection"

/**
 * Roster mapper (PWCC-002 slice 1) — `projectDirectoryProfileListItem` → `MCardData["roster"]`.
 *
 * Spec: `docs/knowledge/wiki/files/m-card-pattern.md` (kind→DTO binding table).
 *
 * **Presentation-only / redaction is upstream.** This mapper consumes an ALREADY-projected,
 * already-gated directory list item — the projection (`profile-projection.ts`) has already
 * applied the tier/visibility/`showRanks` gates (see `public-passport-dto.md`). The mapper adds
 * NO fetch, NO redaction, and reads ONLY the public presentation fields off the projection. It
 * never touches email/phone/legal/DOB (those are not on the projection's list-item output), so
 * no non-public field can leak through into the card.
 */

/** The already-projected, already-gated directory list item this mapper consumes. */
export type DirectoryRosterProjection = ReturnType<typeof projectDirectoryProfileListItem>

/**
 * Build the human-readable location line from the (already-gated) location parts. The projection
 * nulls these out when the viewer/policy may not see them, so an absent line is intentional.
 */
function locationLineOf(profile: DirectoryRosterProjection): string | null {
  return [profile.locationCity, profile.locationRegion].filter(Boolean).join(", ") || null
}

export function mapToRosterCard(profile: DirectoryRosterProjection): MCardData["roster"] {
  // The projection returns ranks already gated to what the viewer may see (top award when
  // `showRanks`, empty when hidden). Lead with the highest (first) award for the belt tint.
  // NOTE: the directory LIST payload's rank shape carries `rankSystem` (id/name) but NOT the
  // discipline (kept lean — see directoryRankAwardPayload comment in payloads.ts). So the
  // roster card on /directory/profiles has no discipline eyebrow/code here — matching the
  // FacetResultCard it replaces. The richer detail/own-profile projections (later slices) can
  // supply discipline via their own mapper overloads.
  const topAward = profile.ranks[0]
  const rank = topAward
    ? {
        name: topAward.rank.name,
        colorHex: topAward.rank.colorHex ?? null,
        disciplineCode: null,
      }
    : null

  return {
    id: profile.id,
    name: profile.name ?? "Anonymous",
    avatarUrl: profile.image,
    rank,
    eyebrow: null,
    schoolLabel: profile.organizations[0]?.name ?? null,
    locationLine: locationLineOf(profile),
    trustStatus: profile.trustStatus,
    claimStatus: profile.claimBadgeStatus,
    badges:
      profile.profileTier !== "free"
        ? [
            {
              label: profile.profileTier.charAt(0).toUpperCase() + profile.profileTier.slice(1),
              variant: "outline",
            },
          ]
        : [],
  }
}

/**
 * Live-surface adapter (PWCC-002 slice 1) — `DirectoryFacetResult` (people) → `MCardData["roster"]`.
 *
 * The `/directory*` pages already normalize their privacy-aware query rows into the shared
 * `DirectoryFacetResult` card shape (`mapPersonToFacet`, itself fed by `projectDirectoryProfileListItem`).
 * To swap the people roster to `m-card` with zero behaviour drift we adapt that ALREADY-projected,
 * already-gated facet shape directly — same fields, same href, same Save subject — rather than
 * re-threading the facet pipeline (deferred to a later slice). Still presentation-only: no fetch,
 * no redaction; reads only public facet fields.
 */
export function mapFacetPersonToRosterCard(result: DirectoryFacetResult): MCardData["roster"] {
  const rankName = result.tags[0]

  return {
    id: result.id,
    name: result.title,
    avatarUrl: result.imageUrl,
    initials: result.initials,
    rank: rankName ? { name: rankName, colorHex: result.rankColorHex } : null,
    eyebrow: null,
    schoolLabel: null,
    locationLine: result.subtitle,
    trustStatus: result.trustStatus,
    claimStatus: result.claimStatus,
    badges: result.badges.map(badge => ({ label: badge.label, variant: badge.variant })),
  }
}
