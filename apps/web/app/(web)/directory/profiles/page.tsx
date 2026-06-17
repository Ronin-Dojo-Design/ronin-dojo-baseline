import type { Metadata } from "next"
import type { SearchParams } from "nuqs"
import { DirectoryFacetResults } from "~/components/web/directory/directory-facet-results"
import { DirectoryListing } from "~/components/web/directory/directory-listing"
import { ListingRegisterCta } from "~/components/web/directory/listing-register-cta"
import { StructuredData } from "~/components/web/structured-data"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageMetadata } from "~/lib/pages"
import { createGraph, generateCollectionPage } from "~/lib/structured-data"
import { getDirectoryFacets } from "~/server/web/directory/facets"
import { directoryFilterParamsCache } from "~/server/web/directory/schema"

// SESSION_0396 — dedicated profiles listing route (Tool→Listing parity). A single-entity
// (people) ListingCard grid; detail links keep pointing at the existing /directory/[slug].

const PAGE_URL = "/directory/profiles"
const PAGE_TITLE = "Profiles"
const PAGE_DESCRIPTION = "Browse martial artists and lineage profiles in the community."

type Props = { searchParams: Promise<SearchParams> }

export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata({
    url: PAGE_URL,
    metadata: { title: PAGE_TITLE, description: PAGE_DESCRIPTION },
  })
}

export default async function DirectoryProfilesPage({ searchParams }: Props) {
  const brand = await getRequestBrand()
  const session = await getServerSession()
  const params = directoryFilterParamsCache.parse(await searchParams)

  // `params` is already string-defaulted by the nuqs cache; passed straight through (this also
  // wires the `rank` filter on the dedicated people page, which the old hand-built object omitted).
  const facets = await getDirectoryFacets({
    brand,
    tab: "people",
    viewerUserId: session?.user?.id,
    viewerRole: session?.user?.role,
    params,
  })

  return (
    <>
      <StructuredData
        data={createGraph([generateCollectionPage(PAGE_URL, PAGE_TITLE, PAGE_DESCRIPTION)])}
      />

      <Breadcrumbs
        items={[
          { url: "/directory", title: "Directory" },
          { url: PAGE_URL, title: PAGE_TITLE },
        ]}
      />

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
          <DirectoryListing>
            <DirectoryFacetResults facets={facets} />
          </DirectoryListing>
        </Section.Content>
      </Section>
    </>
  )
}
