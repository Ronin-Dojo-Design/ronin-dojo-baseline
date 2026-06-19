import type { Metadata } from "next"
import Link from "next/link"
import type { SearchParams } from "nuqs"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H5 } from "~/components/common/heading"
import { DirectoryQuery } from "~/components/web/directory/directory-query"
import { ListingRegisterCta } from "~/components/web/directory/listing-register-cta"
import { StructuredData } from "~/components/web/structured-data"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Grid } from "~/components/web/ui/grid"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageMetadata } from "~/lib/pages"
import { createGraph, generateCollectionPage } from "~/lib/structured-data"

const PAGE_URL = "/directory"
const PAGE_TITLE = "Directory"
const PAGE_DESCRIPTION = "Find practitioners and lineage profiles in the community."

const CROSS_LINKS: Array<{ href: string; label: string; description: string }> = [
  { href: "/schools", label: "Schools", description: "Dojos and academies in the network" },
  // Organizations link hidden for launch (SESSION_0417).
]

type Props = {
  searchParams: Promise<SearchParams>
}

export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata({
    url: PAGE_URL,
    metadata: { title: PAGE_TITLE, description: PAGE_DESCRIPTION },
  })
}

export default async function DirectoryPage({ searchParams }: Props) {
  const brand = await getRequestBrand()
  const session = await getServerSession()

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

      {!session?.user && (
        <ListingRegisterCta
          title="Train martial arts?"
          description="Join the directory to claim your profile, track your rank, and connect with schools."
          href="/auth/login?next=/me"
          cta="Join the directory"
        />
      )}

      <Section>
        <Section.Content>
          <DirectoryQuery
            searchParams={searchParams}
            brand={brand}
            viewerUserId={session?.user?.id}
            viewerRole={session?.user?.role}
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
