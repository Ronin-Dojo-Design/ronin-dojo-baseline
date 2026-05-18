"use client"

import { useTranslations } from "next-intl"
import type { PropsWithChildren } from "react"
import { Input } from "~/components/common/input"
import { MemberListSkeleton } from "~/components/web/members/member-list"
import { MemberSearch, type MemberSearchProps } from "~/components/web/members/member-search"
import { Pagination, type PaginationProps } from "~/components/web/pagination"
import { FiltersProvider, type FiltersProviderProps } from "~/contexts/filter-context"
import { memberFilterParams } from "~/server/web/directory/member-schema"

type MemberListingProps = PropsWithChildren & {
  pagination: PaginationProps
  search?: MemberSearchProps
  options?: Omit<FiltersProviderProps, "schema">
}

const MemberListing = ({ children, pagination, options, search }: MemberListingProps) => {
  return (
    <FiltersProvider schema={memberFilterParams} {...options}>
      <div className="space-y-5" id="members">
        <MemberSearch {...search} />
        {children}
      </div>

      <Pagination {...pagination} />
    </FiltersProvider>
  )
}

const MemberListingSkeleton = () => {
  const t = useTranslations("common")

  return (
    <div className="space-y-5">
      <Input size="lg" placeholder={t("loading")} disabled />
      <MemberListSkeleton />
    </div>
  )
}

export { MemberListing, type MemberListingProps, MemberListingSkeleton }
