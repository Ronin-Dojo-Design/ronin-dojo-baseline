import { H4 } from "~/components/common/heading"
import { ListingSaveButton } from "~/components/web/listing/listing-save-button"
import { MCard } from "~/components/web/m-card/m-card"
import { Grid } from "~/components/web/ui/grid"
import { Section } from "~/components/web/ui/section"
import type { DirectoryFacetResult } from "~/lib/directory/facet-result"
import { mapFacetPersonToRosterCard } from "~/lib/m-card/map-roster"

/**
 * "Related profiles" discovery rail on the public profile detail (BBL-DISCOVER-003) — mirrors the
 * org page's `RelatedOrganizations`. `findRelatedProfiles` only ever returns PERSON facets, so each
 * renders through the CURRENT people card — `MCard kind="roster"` (PWCC-002), the same card the
 * `/directory` people facet uses (`directory-facet-results.tsx`) — via the live
 * `mapFacetPersonToRosterCard` adapter, so nothing new is exposed beyond a directory card.
 *
 * Empty → renders nothing (no orphan empty state): the loader returns `[]` when the person has no
 * top discipline / no lineage tree, or no other profile shares both.
 */
export function RelatedProfilesSection({ profiles }: { profiles: DirectoryFacetResult[] }) {
  if (profiles.length === 0) {
    return null
  }

  return (
    <Section>
      <H4>Related Profiles</H4>
      {/* Section is md:grid-cols-3 — without the span the grid auto-places into ONE narrow column
          next to the heading (Desi P0, same class of bug as AncestrySection). Heading keeps col 1;
          grid 2–3. */}
      <Grid className="md:col-span-2">
        {profiles.map(result => (
          <MCard
            key={result.id}
            kind="roster"
            data={mapFacetPersonToRosterCard(result)}
            href={result.href}
            actions={
              <ListingSaveButton
                subjectType={result.save.subjectType}
                subjectId={result.save.subjectId}
              />
            }
          />
        ))}
      </Grid>
    </Section>
  )
}
