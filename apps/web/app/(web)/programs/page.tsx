import { PlusIcon } from "lucide-react"
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
import { getProgramsByBrand } from "~/server/web/program/queries"

const PAGE_URL = "/programs"
const PAGE_TITLE = "Programs"
const PAGE_DESCRIPTION =
  "Browse active training programs, curriculum offerings, and the schools that host them."

const CROSS_LINKS: Array<{ href: string; label: string; description: string }> = [
  { href: "/courses", label: "Courses", description: "Curriculum and certification programs" },
  { href: "/schools", label: "Schools", description: "Dojos and academies in the network" },
  {
    href: "/disciplines",
    label: "Disciplines",
    description: "Martial arts styles and rank systems",
  },
]

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata({
    url: PAGE_URL,
    metadata: { title: PAGE_TITLE, description: PAGE_DESCRIPTION },
  })
}

export default async function ProgramsPage() {
  const brand = await getRequestBrand()
  const programs = await getProgramsByBrand(brand)

  const itemListItems = programs.map(p => ({
    name: p.name,
    url: `/programs/${p.id}`,
    description: p.description,
    id: generateSchemaReference("Course", `/programs/${p.id}`, p.name, "program")["@id"],
    provider: generateSchemaReference(
      "Organization",
      `/organizations/${p.organization.slug}`,
      p.organization.name,
    ),
    about: p.discipline
      ? generateSchemaReference("Thing", `/disciplines/${p.discipline.slug}`, p.discipline.name)
      : undefined,
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
            "Course",
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
              {programs.length} program{programs.length !== 1 ? "s" : ""}
            </p>
            <Button size="sm" prefix={<PlusIcon />} render={<CommonLink href="/programs/new" />}>
              Create Program
            </Button>
          </Stack>

          {programs.length === 0 ? (
            <Note>No active programs yet.</Note>
          ) : (
            <Grid>
              {programs.map(program => (
                <Card key={program.id} isRevealed>
                  <CardHeader>
                    <H4 render={props => <h3 {...props}>{props.children}</h3>} className="truncate">
                      <Link href={`/programs/${program.id}`}>
                        <span className="absolute inset-0 z-10" />
                        {program.name}
                      </Link>
                    </H4>
                  </CardHeader>

                  <CardDescription>
                    {program.description ?? `${program.organization.name} program`}
                  </CardDescription>

                  <Stack size="sm" className="flex-wrap">
                    <Badge variant="outline">{program.organization.name}</Badge>
                    {program.discipline && <Badge>{program.discipline.name}</Badge>}
                    <span className="text-xs text-muted-foreground">
                      {program._count.programEnrollments} enrolled
                    </span>
                  </Stack>
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
