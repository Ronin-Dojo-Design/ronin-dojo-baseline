import { Suspense } from "react"
import { AgeGroupsTable } from "~/app/admin/age-groups/_components/age-groups-table"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findAgeGroups } from "~/server/admin/age-groups/queries"
import { ageGroupsTableParamsCache } from "~/server/admin/age-groups/schema"

export default withAdminPage(async ({ searchParams }: PageProps<"/admin/age-groups">) => {
  const search = ageGroupsTableParamsCache.parse(await searchParams)
  const ageGroupsPromise = findAgeGroups(search)

  return (
    <Suspense fallback={<DataTableSkeleton title="Age Groups" />}>
      <AgeGroupsTable ageGroupsPromise={ageGroupsPromise} />
    </Suspense>
  )
})
