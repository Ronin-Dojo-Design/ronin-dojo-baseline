import dynamic from "next/dynamic"
import type { Brand } from "~/.generated/prisma/client"
import { Button } from "~/components/common/button"
import { EmptyList } from "~/components/common/empty-list"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { BrandTypography, bblHeadingScopeClass } from "~/components/web/ui/brand-typography"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Grid } from "~/components/web/ui/grid"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import type { OrganizationMany } from "~/server/web/organization/payloads"
import { OrganizationCard } from "./organization-card"
import { OrganizationsListStructuredData } from "./organizations-list-structured-data"

// Lazy boundary: the cross-links sit below the organizations grid, so their chunk
// loads once reached. SSR is kept (no `ssr: false`) so they still server-render.
const OrganizationsCrossLinks = dynamic(() =>
  import("./organizations-cross-links").then(m => m.OrganizationsCrossLinks),
)

type OrganizationsListView = {
  orgs: OrganizationMany[]
  brand: Brand
  url: string
  title: string
  description: string
}

/**
 * Public organizations listing orchestrator — the folder module's barrel and only
 * export (component-launch-sweep recipe). Thin: it composes the header + card grid +
 * lazy cross-links and renders the JSON-LD sibling; the route owns the data fetch.
 *
 * Brand seam: the visible body renders inside `BrandTypography` so the heading +
 * body inherit the BBL type tokens under BBL and degrade to the app fonts off-BBL.
 */
export function OrganizationsList({ orgs, brand, url, title, description }: OrganizationsListView) {
  return (
    <>
      <BrandTypography brand={brand} className={bblHeadingScopeClass}>
        <Breadcrumbs items={[{ url, title }]} />

        <Intro>
          <IntroTitle>{title}</IntroTitle>
          <IntroDescription>{description}</IntroDescription>
        </Intro>

        <Section>
          <Section.Content>
            <Stack className="justify-between w-full mb-4">
              <p className="text-sm text-muted-foreground">
                {orgs.length} organization{orgs.length !== 1 ? "s" : ""}
              </p>
              <Button size="sm" render={<Link href="/organizations/new" />}>
                Create Organization
              </Button>
            </Stack>

            {orgs.length === 0 ? (
              <EmptyList>No organizations yet. Be the first to create one!</EmptyList>
            ) : (
              <Grid>
                {orgs.map(org => (
                  <OrganizationCard key={org.id} org={org} />
                ))}
              </Grid>
            )}
          </Section.Content>
        </Section>

        <OrganizationsCrossLinks />
      </BrandTypography>

      <OrganizationsListStructuredData
        orgs={orgs}
        url={url}
        title={title}
        description={description}
      />
    </>
  )
}
