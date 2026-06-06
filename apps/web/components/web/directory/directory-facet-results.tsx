import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { FacetResultCard } from "~/components/web/directory/facet-result-card"
import { Pagination } from "~/components/web/pagination"
import { Grid } from "~/components/web/ui/grid"
import { ResultsCount } from "~/components/web/ui/results-count"
import type { DirectoryFacetTab } from "~/lib/directory/facet-result"
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
          <FacetResultCard key={result.id} result={result} />
        ))}
      </Grid>

      <Pagination total={facets.total} perPage={facets.perPage} page={facets.page} />
    </div>
  )
}
