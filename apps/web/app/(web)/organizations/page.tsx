import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link as CommonLink } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { StructuredData } from "~/components/web/structured-data"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Grid } from "~/components/web/ui/grid"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageMetadata } from "~/lib/pages"
import {
  createGraph,
  generateBreadcrumbs,
  generateCollectionPageWithGenericItems,
  generateSchemaReference,
} from "~/lib/structured-data"
import { getOrganizationsByBrand } from "~/server/web/organization/queries"

const PAGE_URL = "/organizations"
const PAGE_TITLE = "Organizations"
const PAGE_DESCRIPTION = "Browse dojos, schools, clubs, and leagues in the martial arts network."

const CROSS_LINKS: Array<{ href: string; label: string; description: string }> = [
  { href: "/schools", label: "Schools", description: "Dojos and academies in the network" },
  {
    href: "/disciplines",
    label: "Disciplines",
    description: "Martial arts styles and rank systems",
  },
  { href: "/programs", label: "Programs", description: "Training programs and curriculum" },
]

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata({
    url: PAGE_URL,
    metadata: { title: PAGE_TITLE, description: PAGE_DESCRIPTION },
  })
}

export default async function OrganizationsPage() {
  const brand = await getRequestBrand()
  const orgs = await getOrganizationsByBrand(brand)

  const itemListItems = orgs.map(o => ({
    name: o.name,
    url: `/organizations/${o.slug}`,
    description: o.description,
    id: generateSchemaReference("Organization", `/organizations/${o.slug}`, o.name)["@id"],
    about:
      o.disciplines.length > 0
        ? o.disciplines.map(od =>
            generateSchemaReference(
              "Thing",
              `/disciplines/${od.discipline.slug}`,
              od.discipline.name,
            ),
          )
        : undefined,
    address: {
      addressLocality: o.city,
      addressRegion: o.state,
      addressCountry: o.country,
    },
  }))

  return (
    <>
      <StructuredData
        data={createGraph([
          generateBreadcrumbs([{ url: PAGE_URL, title: PAGE_TITLE }]),
          generateCollectionPageWithGenericItems(
            PAGE_URL,
            PAGE_TITLE,
            PAGE_DESCRIPTION,
            itemListItems,
            "Organization",
          ),
        ])}
      />

      <Breadcrumbs items={[{ url: PAGE_URL, title: PAGE_TITLE }]} />

      <Intro>
        <IntroTitle>{PAGE_TITLE}</IntroTitle>
        <IntroDescription>{PAGE_DESCRIPTION}</IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          <Stack className="justify-between w-full mb-4">
            <p className="text-sm text-muted-foreground">
              {orgs.length} organization{orgs.length !== 1 ? "s" : ""}
            </p>
            <Button size="sm" render={<CommonLink href="/organizations/new" />}>
              Create Organization
            </Button>
          </Stack>

          {orgs.length === 0 ? (
            <Note>No organizations yet. Be the first to create one!</Note>
          ) : (
            <Grid>
              {orgs.map(org => (
                <Card key={org.id} isRevealed>
                  <CardHeader>
                    <H4 render={props => <h3 {...props}>{props.children}</h3>} className="truncate">
                      <Link href={`/organizations/${org.slug}`}>
                        <span className="absolute inset-0 z-10" />
                        {org.name}
                      </Link>
                    </H4>
                  </CardHeader>

                  <CardDescription>
                    <Stack size="sm" className="flex-wrap">
                      <Badge variant="outline">{org.type}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {org._count.memberships} member{org._count.memberships !== 1 ? "s" : ""}
                      </span>
                    </Stack>
                  </CardDescription>

                  {org.disciplines.length > 0 && (
                    <Stack size="sm" className="flex-wrap">
                      {org.disciplines.map(od => (
                        <Badge key={od.discipline.id} size="sm">
                          {od.discipline.name}
                        </Badge>
                      ))}
                    </Stack>
                  )}
                </Card>
              ))}
            </Grid>
          )}
        </Section.Content>
      </Section>

      {/* Cross-links */}
      <Section>
        <Section.Content>
          <Grid>
            {CROSS_LINKS.map(link => (
              <Link key={link.href} href={link.href}>
                <Card>
                  <CardHeader>
                    <H4>{link.label}</H4>
                    <CardDescription>{link.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </Grid>
        </Section.Content>
      </Section>
    </>
  )
}
