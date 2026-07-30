import { H4 } from "~/components/common/heading"
import { FacetResultCard } from "~/components/web/directory/facet-result-card"
import { Grid } from "~/components/web/ui/grid"
import { Section } from "~/components/web/ui/section"
import type { DirectoryFacetResult } from "~/lib/directory/facet-result"

/**
 * "Related profiles" discovery rail on the public profile detail (BBL-DISCOVER-003) — mirrors the
 * org page's `RelatedOrganizations`. Renders the already-gated, PUBLIC-only related cards through
 * the ONE directory card (`FacetResultCard`), so nothing new is exposed beyond a directory card.
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
      <H4>Related profiles</H4>
      <Grid>
        {profiles.map(result => (
          <FacetResultCard key={result.id} result={result} />
        ))}
      </Grid>
    </Section>
  )
}
