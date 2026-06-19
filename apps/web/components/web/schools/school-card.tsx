import type { CSSProperties } from "react"
import { FacetResultCard } from "~/components/web/directory/facet-result-card"
import { ListingCardSkeleton } from "~/components/web/listing/listing-card"
import { mapOrganizationToFacet } from "~/lib/directory/facet-result"

/**
 * SchoolCard — now a thin adapter over the premium `FacetResultCard` (SESSION_0415).
 *
 * The school listing card was previously a bespoke `ListingCard`; it now delegates to
 * the same `FacetResultCard` the `/directory` organizations facet renders, so a school
 * looks identical whether it surfaces on `/schools`, `/directory/schools`, or the
 * faceted directory. School data is normalized through the shared `mapOrganizationToFacet`
 * adapter (the one source of org→card truth), so the rank chip / location pin / Save
 * footer / hover glow all come for free and stay in sync with the person cards.
 */

export type SchoolCardData = {
  /** Organization id — the Save subject (SESSION_0397). */
  id: string
  slug: string
  name: string
  description: string | null
  city: string | null
  region: string | null
  type: string | null
  // Contact fields stay on the data shape (returned by searchOrganizations) but are not
  // shown on the card — they surface on the school detail page.
  phoneE164: string | null
  email: string | null
  websiteUrl: string | null
  disciplines?: { discipline: { name: string } }[]
}

type SchoolCardProps = {
  school: SchoolCardData
  /** Forwarded grid `order` (set by `SchoolList`). */
  style?: CSSProperties
}

export const SchoolCard = ({ school, style }: SchoolCardProps) => {
  return <FacetResultCard result={mapOrganizationToFacet(school)} style={style} />
}

export const SchoolCardSkeleton = ListingCardSkeleton
