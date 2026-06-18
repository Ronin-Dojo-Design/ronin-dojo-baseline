import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Grid } from "~/components/web/ui/grid"
import { Section } from "~/components/web/ui/section"
import type { OrganizationDetailView } from "./organization-detail-data"

type RelatedOrganizationsProps = Pick<OrganizationDetailView, "relatedOrgs">

/**
 * Below-the-fold "Related Organizations" grid. Lazy-loaded by the orchestrator via
 * `next/dynamic` (SSR kept) so its chunk only loads once reached. The orchestrator
 * guards on a non-empty list, so this always has cards to render.
 */
export function RelatedOrganizations({ relatedOrgs }: RelatedOrganizationsProps) {
  return (
    <Section>
      <Section.Content>
        <H4>Related Organizations</H4>
        <Grid>
          {relatedOrgs.map(ro => (
            <Card key={ro.id} isRevealed>
              <CardHeader>
                <H4 render={props => <h3 {...props}>{props.children}</h3>} className="truncate">
                  <Link href={`/organizations/${ro.slug}`}>
                    <span className="absolute inset-0 z-10" />
                    {ro.name}
                  </Link>
                </H4>
              </CardHeader>
              <CardDescription>{ro.description ?? `${ro.type} organization`}</CardDescription>
              <Stack size="sm" className="flex-wrap">
                <Badge variant="outline">{ro.type}</Badge>
                {ro.city && <Badge variant="soft">{ro.city}</Badge>}
              </Stack>
            </Card>
          ))}
        </Grid>
      </Section.Content>
    </Section>
  )
}
