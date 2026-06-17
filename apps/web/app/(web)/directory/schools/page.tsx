import type { Metadata } from "next"
import type { SearchParams } from "nuqs"
import { DirectoryFacetResults } from "~/components/web/directory/directory-facet-results"
import { DirectoryListing } from "~/components/web/directory/directory-listing"
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

// SESSION_0396 — dedicated schools listing route (Tool→Listing parity). A single-entity
// (organizations) ListingCard grid; detail links keep pointing at the existing /schools/[slug].

const PAGE_URL = "/directory/schools"
const PAGE_TITLE = "Schools & Organizations"
const PAGE_DESCRIPTION = "Find dojos, gyms, academies, and governing bodies in the community."

type Props = { searchParams: Promise<SearchParams> }

export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata({
    url: PAGE_URL,
    metadata: { title: PAGE_TITLE, description: PAGE_DESCRIPTION },
  })
}

export default async function DirectorySchoolsPage({ searchParams }: Props) {
  const brand = await getRequestBrand()
  const session = await getServerSession()
  const params = directoryFilterParamsCache.parse(await searchParams)

  const facets = await getDirectoryFacets({
    brand,
    tab: "organizations",
    viewerUserId: session?.user?.id,
    viewerRole: session?.user?.role,
    // `params` is already string-defaulted by the nuqs cache; on this page the `type` param is the
    // org-type filter (the tab is fixed to "organizations"), so it is mapped onto `orgType`.
    params: { ...params, orgType: params.type },
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
