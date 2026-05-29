import type { Metadata } from "next"
import Link from "next/link"
import type { SearchParams } from "nuqs"
import { Suspense } from "react"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H5 } from "~/components/common/heading"
import { StructuredData } from "~/components/web/structured-data"
import { TechniqueListingSkeleton } from "~/components/web/techniques/technique-listing"
import { TechniqueQuery } from "~/components/web/techniques/technique-query"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Grid } from "~/components/web/ui/grid"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageMetadata } from "~/lib/pages"
import { createGraph, generateCollectionPage } from "~/lib/structured-data"

const PAGE_URL = "/techniques"
const PAGE_TITLE = "Technique Library"
const PAGE_DESCRIPTION = "Browse techniques by category, position, and discipline."

const CROSS_LINKS: Array<{ href: string; label: string; description: string }> = [
  {
    href: "/disciplines",
    label: "Disciplines",
    description: "Martial arts styles and rank systems",
  },
  { href: "/courses", label: "Courses", description: "Curriculum and certification programs" },
  { href: "/programs", label: "Programs", description: "Active training programs and offerings" },
]

type PageProps = {
  searchParams: Promise<SearchParams>
}

export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata({
    url: PAGE_URL,
    metadata: { title: PAGE_TITLE, description: PAGE_DESCRIPTION },
  })
}

export default async function TechniquesPage({ searchParams }: PageProps) {
  const brand = await getRequestBrand()

  return (
    <>
      <StructuredData
        data={createGraph([generateCollectionPage(PAGE_URL, PAGE_TITLE, PAGE_DESCRIPTION)])}
      />

      <Breadcrumbs items={[{ url: PAGE_URL, title: PAGE_TITLE }]} />

      <Intro>
        <IntroTitle>{PAGE_TITLE}</IntroTitle>
        <IntroDescription>{PAGE_DESCRIPTION}</IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          <Suspense fallback={<TechniqueListingSkeleton />}>
            <TechniqueQuery
              searchParams={searchParams}
              brand={brand}
              options={{ enableFilters: true, enableSort: true }}
            />
          </Suspense>
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
