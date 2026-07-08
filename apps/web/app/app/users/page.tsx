import { Suspense } from "react"
import { PeopleTable } from "~/app/app/users/_components/people-table"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findPeople } from "~/server/admin/people/queries"
import { peopleTableParamsCache } from "~/server/admin/people/schema"

export default async ({ searchParams }: PageProps<"/app/users">) => {
  const search = peopleTableParamsCache.parse(await searchParams)
  const peoplePromise = findPeople(search)

  return (
    <Suspense fallback={<DataTableSkeleton title="People" />}>
      <PeopleTable peoplePromise={peoplePromise} />
    </Suspense>
  )
}
