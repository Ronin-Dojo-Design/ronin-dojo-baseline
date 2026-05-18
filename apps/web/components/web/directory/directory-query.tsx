import type { SearchParams } from "nuqs"
import type { Brand } from "~/.generated/prisma/client"
import { DirectoryList } from "~/components/web/directory/directory-list"
import {
  DirectoryListing,
  type DirectoryListingProps,
} from "~/components/web/directory/directory-listing"
import { getDirectoryProfiles } from "~/server/web/directory/queries"
import { directoryFilterParamsCache } from "~/server/web/directory/schema"

type DirectoryQueryProps = Omit<DirectoryListingProps, "children"> & {
  searchParams: Promise<SearchParams>
  brand: Brand
  viewerUserId?: string | null
}

const DirectoryQuery = async ({
  searchParams,
  brand,
  viewerUserId,
  ...props
}: DirectoryQueryProps) => {
  const params = directoryFilterParamsCache.parse(await searchParams)

  const profiles = await getDirectoryProfiles({
    brand,
    viewerUserId,
    filters: {
      organizationId: params.org || undefined,
      disciplineId: params.discipline || undefined,
      rankId: params.rank || undefined,
      locationCity: params.city || undefined,
      locationRegion: params.region || undefined,
    },
  })

  return (
    <DirectoryListing {...props}>
      <DirectoryList profiles={profiles} />
    </DirectoryListing>
  )
}

export { DirectoryQuery, type DirectoryQueryProps }
