import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { ListingSaveButton } from "~/components/web/listing/listing-save-button"
import { MCard } from "~/components/web/m-card/m-card"
import { Pagination } from "~/components/web/pagination"
import { Grid } from "~/components/web/ui/grid"
import { ResultsCount } from "~/components/web/ui/results-count"
import type { DirectoryFacetResult, DirectoryFacetTab } from "~/lib/directory/facet-result"
import { mapRosterFromFacet } from "~/lib/m-card/map-roster"
import type { DirectoryFacetPage } from "~/server/web/directory/facets"

/** BBL faceless gi default — shown when a person has no usable photo. Surface-level (brand-aware)
 * so the brand-agnostic m-card never references it; injected into the roster DTO as a fallback. */
const PERSON_FALLBACK_AVATAR = "/brand/bbl/default-black-belt.png"

const EMPTY_COPY: Record<DirectoryFacetTab, string> = {
  people: "No people found. Try adjusting your search.",
  organizations: "No schools or organizations found. Try adjusting your search.",
  trees: "No lineage trees found. Try adjusting your search.",
}

const COUNT_NOUN: Record<DirectoryFacetTab, [string, string]> = {
  people: ["person", "people"],
  organizations: ["school / organization", "schools & organizations"],
  trees: ["lineage tree", "lineage trees"],
}

function countLabel(tab: DirectoryFacetTab, count: number) {
  const [singular, plural] = COUNT_NOUN[tab]
  return `${count} ${count === 1 ? singular : plural}`
}

/**
 * One roster card via the unified m-card (PWCC-002), replacing the bespoke `FacetResultCard`
 * (SESSION_0430). The already-gated `DirectoryFacetResult` is mapped to the roster DTO; the deep
 * link and persisted-Save control are passed as structural props/actions. People get the brand gi
 * silhouette as their avatar fallback — injected here (surface), never in the card.
 */
function RosterCard({ result }: { result: DirectoryFacetResult }) {
  const data = mapRosterFromFacet(result, {
    fallbackAvatarUrl: result.type === "person" ? PERSON_FALLBACK_AVATAR : null,
  })

  return (
    <MCard
      kind="roster"
      data={data}
      href={result.href}
      actions={
        <ListingSaveButton
          subjectType={result.save.subjectType}
          subjectId={result.save.subjectId}
        />
      }
    />
  )
}

/**
 * Renders one facet's grouped results: count line, shared card grid, and the
 * reused `Pagination` control.
 */
export function DirectoryFacetResults({ facets }: { facets: DirectoryFacetPage }) {
  if (facets.results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardDescription>{EMPTY_COPY[facets.tab]}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      <ResultsCount total={facets.total} label={countLabel(facets.tab, facets.total)} />

      <Grid>
        {facets.results.map(result => (
          <RosterCard key={result.id} result={result} />
        ))}
      </Grid>

      <Pagination total={facets.total} perPage={facets.perPage} page={facets.page} />
    </div>
  )
}
