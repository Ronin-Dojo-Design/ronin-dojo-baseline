/**
 * @added   SESSION_0148 (2026-05-12)
 * @why     Membership admin list page — view/filter/manage all memberships
 * @wired   server/admin/memberships/queries.ts, server/admin/programs/queries.ts
 */
import { Suspense } from "react"
import { MembershipsTable } from "~/app/admin/memberships/_components/memberships-table"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findMemberships } from "~/server/admin/memberships/queries"
import { membershipsTableParamsCache } from "~/server/admin/memberships/schema"
import { findDisciplineOptions, findOrganizationOptions } from "~/server/admin/programs/queries"

export default async ({ searchParams }: PageProps<"/app/memberships">) => {
  const search = membershipsTableParamsCache.parse(await searchParams)
  const membershipsPromise = findMemberships(search)
  const [organizations, disciplines] = await Promise.all([
    findOrganizationOptions(),
    findDisciplineOptions(),
  ])

  return (
    <Suspense fallback={<DataTableSkeleton title="Memberships" />}>
      <MembershipsTable
        membershipsPromise={membershipsPromise}
        organizations={organizations}
        disciplines={disciplines}
      />
    </Suspense>
  )
}
