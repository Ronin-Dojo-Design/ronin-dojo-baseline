import type { Metadata } from "next"
import Link from "next/link"
import type { SearchParams } from "nuqs"
import { Suspense } from "react"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H5 } from "~/components/common/heading"
import { MemberListingSkeleton } from "~/components/web/members/member-listing"
import { MemberQuery } from "~/components/web/members/member-query"
import { StructuredData } from "~/components/web/structured-data"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Grid } from "~/components/web/ui/grid"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageMetadata } from "~/lib/pages"
import { createGraph, generateCollectionPage } from "~/lib/structured-data"

const PAGE_URL = "/members"
const PAGE_TITLE = "Members"
const PAGE_DESCRIPTION =
  "Browse the member directory — find training partners and instructors in our community."

const CROSS_LINKS: Array<{ href: string; label: string; description: string }> = [
  { href: "/directory", label: "Directory", description: "Practitioners, instructors, and schools" },
  { href: "/schools", label: "Schools", description: "Dojos and academies in the network" },
  { href: "/lineage", label: "Lineage", description: "Promotion history and living legacy" },
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

export default async function MembersPage({ searchParams }: PageProps) {
  const brand = await getRequestBrand()
  const session = await getServerSession()
  const viewerUserId = session?.user?.id ?? null

  return (
    <>
      <StructuredData
        data={createGraph([
          generateCollectionPage(PAGE_URL, PAGE_TITLE, PAGE_DESCRIPTION),
        ])}
      />

      <Breadcrumbs items={[{ url: PAGE_URL, title: PAGE_TITLE }]} />

      <Intro>
        <IntroTitle>Member Directory</IntroTitle>
        <IntroDescription>{PAGE_DESCRIPTION}</IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          <Suspense fallback={<MemberListingSkeleton />}>
            <MemberQuery
              searchParams={searchParams}
              brand={brand}
              viewerUserId={viewerUserId}
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
