/**
 * @added   SESSION_0148 (2026-05-12)
 * @why     Membership admin list page — view/filter/manage all memberships
 * @wired   server/admin/memberships/queries.ts, server/admin/programs/queries.ts
 */
import { Suspense } from "react"
import { MembershipsTable } from "~/app/admin/memberships/_components/memberships-table"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findMemberships } from "~/server/admin/memberships/queries"
import { membershipsTableParamsCache } from "~/server/admin/memberships/schema"
import { findOrganizationOptions, findDisciplineOptions } from "~/server/admin/programs/queries"

export default withAdminPage(async ({ searchParams }: PageProps<"/admin/memberships">) => {
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
})
