import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Grid } from "~/components/web/ui/grid"
import { Section } from "~/components/web/ui/section"
import type { SchoolDetailView } from "./school-detail-data"

type RelatedSchoolsProps = Pick<SchoolDetailView, "relatedSchools">

/**
 * Below-the-fold "Related Schools" grid (the `ListingDetail` `related` slot). Lazy
 * -loaded by the orchestrator via `next/dynamic` (SSR kept) so its chunk only loads
 * once reached. The orchestrator guards on a non-empty list, so this always renders
 * cards.
 */
export function RelatedSchools({ relatedSchools }: RelatedSchoolsProps) {
  return (
    <Section>
      <Section.Content>
        <H4>Related Schools</H4>
        <Grid>
          {relatedSchools.map(rs => (
            <Card key={rs.id} isRevealed>
              <CardHeader>
                <H4 render={props => <h3 {...props}>{props.children}</h3>} className="truncate">
                  <Link href={`/schools/${rs.slug}`}>
                    <span className="absolute inset-0 z-10" />
                    {rs.name}
                  </Link>
                </H4>
              </CardHeader>
              <CardDescription>
                {rs.description ??
                  `${rs.type.replace(/_/g, " ")} — ${rs._count.memberships} member${rs._count.memberships !== 1 ? "s" : ""}`}
              </CardDescription>
              <Stack size="sm" className="flex-wrap">
                <Badge variant="outline">{rs.type.replace(/_/g, " ")}</Badge>
                {(rs.city || rs.state) && (
                  <Badge variant="soft">{[rs.city, rs.state].filter(Boolean).join(", ")}</Badge>
                )}
              </Stack>
            </Card>
          ))}
        </Grid>
      </Section.Content>
    </Section>
  )
}
