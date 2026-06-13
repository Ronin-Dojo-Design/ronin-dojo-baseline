import { Suspense } from "react"
import { AgeGroupsTable } from "~/app/app/age-groups/_components/age-groups-table"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findAgeGroups } from "~/server/admin/age-groups/queries"
import { ageGroupsTableParamsCache } from "~/server/admin/age-groups/schema"

export default async ({ searchParams }: PageProps<"/app/age-groups">) => {
  const search = ageGroupsTableParamsCache.parse(await searchParams)
  const ageGroupsPromise = findAgeGroups(search)

  return (
    <Suspense fallback={<DataTableSkeleton title="Age Groups" />}>
      <AgeGroupsTable ageGroupsPromise={ageGroupsPromise} />
    </Suspense>
  )
}
