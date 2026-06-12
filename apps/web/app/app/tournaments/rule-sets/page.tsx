import { Suspense } from "react"
import { TournamentsSubNav } from "~/app/admin/tournaments/_components/tournaments-sub-nav"
import { RuleSetsTable } from "~/app/admin/tournaments/rule-sets/_components/rule-sets-table"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findRuleSetsPaginated } from "~/server/admin/tournaments/queries"
import { ruleSetsTableParamsCache } from "~/server/admin/tournaments/schema"

export default async ({ searchParams }: PageProps<"/app/tournaments/rule-sets">) => {
  const search = ruleSetsTableParamsCache.parse(await searchParams)
  const ruleSetsPromise = findRuleSetsPaginated(search)

  return (
    <>
      <TournamentsSubNav />

      <Suspense fallback={<DataTableSkeleton title="Rule Sets" />}>
        <RuleSetsTable ruleSetsPromise={ruleSetsPromise} />
      </Suspense>
    </>
  )
}
