import type { SearchParams } from "nuqs"
import type { Brand } from "~/.generated/prisma/client"
import { DirectoryFacetResults } from "~/components/web/directory/directory-facet-results"
import { DirectoryFacetTabs } from "~/components/web/directory/directory-facet-tabs"
import {
  DirectoryListing,
  type DirectoryListingProps,
} from "~/components/web/directory/directory-listing"
import { getDirectoryFacets, normalizeDirectoryFacetTab } from "~/server/web/directory/facets"
import { getDirectoryFilterOptions } from "~/server/web/directory/filter-options"
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
  // `params` is already string-defaulted by the nuqs cache (every key has a `.withDefault`), so it
  // is passed straight to the facet dispatcher — no `"" → undefined` round-trip (the dispatcher no
  // longer re-coerces back to "").
  const params = directoryFilterParamsCache.parse(await searchParams)
  const tab = normalizeDirectoryFacetTab(params.type)

  const facets = await getDirectoryFacets({ brand, tab, params, viewerUserId, viewerRole })
  const filterOptions = await getDirectoryFilterOptions(brand)

  return (
    <DirectoryListing {...props} filterOptions={filterOptions}>
      <DirectoryFacetTabs activeTab={tab} />
      <DirectoryFacetResults facets={facets} />
    </DirectoryListing>
  )
}

export { DirectoryQuery, type DirectoryQueryProps }
