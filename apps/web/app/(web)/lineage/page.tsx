import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H5 } from "~/components/common/heading"
import { LineageQuery } from "~/components/web/lineage/lineage-query"
import { StructuredData } from "~/components/web/structured-data"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Grid } from "~/components/web/ui/grid"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageMetadata } from "~/lib/pages"
import { createGraph, generateBreadcrumbs } from "~/lib/structured-data"

const PAGE_URL = "/lineage"
const PAGE_TITLE = "Lineage Trees"
const PAGE_DESCRIPTION =
  "Explore martial arts lineage trees — who promoted whom, rank history, and the living legacy of instructors and students."

const CROSS_LINKS: Array<{ href: string; label: string; description: string }> = [
  {
    href: "/disciplines",
    label: "Disciplines",
    description: "Martial arts styles and rank systems",
  },
  {
    href: "/schools",
    label: "Schools",
    description: "Dojos and academies in the network",
  },
  {
    href: "/courses",
    label: "Courses",
    description: "Curriculum and certification programs",
  },
]

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata({
    url: PAGE_URL,
    metadata: {
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
    },
  })
}

export default async function LineageIndexPage(props: PageProps<"/lineage">) {
  const brand = await getRequestBrand()

  return (
    <>
      <StructuredData
        data={createGraph([generateBreadcrumbs([{ url: PAGE_URL, title: PAGE_TITLE }])])}
      />

      <Breadcrumbs items={[{ url: PAGE_URL, title: PAGE_TITLE }]} />

      <Intro>
        <IntroTitle>{PAGE_TITLE}</IntroTitle>
        <IntroDescription>{PAGE_DESCRIPTION}</IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          <LineageQuery
            searchParams={props.searchParams}
            brand={brand}
            pageUrl={PAGE_URL}
            pageTitle={PAGE_TITLE}
            pageDescription={PAGE_DESCRIPTION}
          />
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
                    <H5>{link.label}</H5>
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
