import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { FacetResultCard } from "~/components/web/directory/facet-result-card"
import { ListingSaveButton } from "~/components/web/listing/listing-save-button"
import { MCard } from "~/components/web/m-card/m-card"
import { Pagination } from "~/components/web/pagination"
import { Grid } from "~/components/web/ui/grid"
import { ResultsCount } from "~/components/web/ui/results-count"
import type { DirectoryFacetResult, DirectoryFacetTab } from "~/lib/directory/facet-result"
import { mapFacetPersonToRosterCard } from "~/lib/m-card/map-roster"
import type { DirectoryFacetPage } from "~/server/web/directory/facets"

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
 * One result card. People (roster) now render through the unified `m-card` (PWCC-002 slice 1) —
 * mapped from the already-gated `DirectoryFacetResult` and keeping behaviour parity with the
 * `FacetResultCard` it replaces (same fields, same href, same Save subject). Organizations and
 * lineage trees stay on `FacetResultCard` until their kinds land (later slices).
 */
function ResultCard({ result }: { result: DirectoryFacetResult }) {
  if (result.type === "person") {
    return (
      <MCard
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
    )
  }

  return <FacetResultCard result={result} />
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
          <ResultCard key={result.id} result={result} />
        ))}
      </Grid>

      <Pagination total={facets.total} perPage={facets.perPage} page={facets.page} />
    </div>
  )
}
