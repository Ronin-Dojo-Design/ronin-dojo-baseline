import type { SearchParams } from "nuqs"
import type { Brand } from "~/.generated/prisma/client"
import type { PaginationProps } from "~/components/web/pagination"
import { MemberList, type MemberListProps } from "~/components/web/members/member-list"
import { MemberListing, type MemberListingProps } from "~/components/web/members/member-listing"
import { searchDirectoryProfiles } from "~/server/web/directory/search-profiles"
import { type MemberFilterParams, memberFilterParamsCache } from "~/server/web/directory/member-schema"

type MemberQueryProps = Omit<MemberListingProps, "list" | "pagination"> & {
  searchParams: Promise<SearchParams>
  brand: Brand
  viewerUserId?: string | null
  overrideParams?: Partial<MemberFilterParams>
  list?: Partial<Omit<MemberListProps, "members">>
  pagination?: Partial<Omit<PaginationProps, "total" | "pageSize">>
}

const MemberQuery = async ({
  searchParams,
  brand,
  viewerUserId,
  overrideParams,
  list,
  pagination,
  ...props
}: MemberQueryProps) => {
  const parsedParams = memberFilterParamsCache.parse(await searchParams)
  const params = { ...parsedParams, ...overrideParams }
  const { members, total, page, perPage } = await searchDirectoryProfiles(params, brand, viewerUserId)

  return (
    <MemberListing pagination={{ total, perPage, page, ...pagination }} {...props}>
      <MemberList members={members} {...list} />
    </MemberListing>
  )
}

export { MemberQuery, type MemberQueryProps }
