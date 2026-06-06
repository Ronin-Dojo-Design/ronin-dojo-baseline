import type { SearchParams } from "nuqs"
import type { Brand } from "~/.generated/prisma/client"
import { DirectoryFacetResults } from "~/components/web/directory/directory-facet-results"
import { DirectoryFacetTabs } from "~/components/web/directory/directory-facet-tabs"
import {
  DirectoryListing,
  type DirectoryListingProps,
} from "~/components/web/directory/directory-listing"
import { getDirectoryFacets, normalizeDirectoryFacetTab } from "~/server/web/directory/facets"
import { directoryFilterParamsCache } from "~/server/web/directory/schema"

type DirectoryQueryProps = Omit<DirectoryListingProps, "children"> & {
  searchParams: Promise<SearchParams>
  brand: Brand
  viewerUserId?: string | null
  viewerRole?: string | null
}

const DirectoryQuery = async ({
  searchParams,
  brand,
  viewerUserId,
  viewerRole,
  ...props
}: DirectoryQueryProps) => {
  const params = directoryFilterParamsCache.parse(await searchParams)
  const tab = normalizeDirectoryFacetTab(params.type)

  const facets = await getDirectoryFacets({
    brand,
    tab,
    viewerUserId,
    viewerRole,
    params: {
      q: params.q || undefined,
      discipline: params.discipline || undefined,
      page: params.page,
      perPage: params.perPage,
    },
  })

  return (
    <DirectoryListing {...props}>
      <DirectoryFacetTabs activeTab={tab} />
      <DirectoryFacetResults facets={facets} />
    </DirectoryListing>
  )
}

export { DirectoryQuery, type DirectoryQueryProps }
