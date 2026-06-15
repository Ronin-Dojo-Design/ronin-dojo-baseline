import { Suspense } from "react"
import { SubscriptionsTable } from "~/app/app/subscriptions/_components/subscriptions-table"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findSubscriptions } from "~/server/admin/subscriptions/queries"
import { subscriptionsTableParamsCache } from "~/server/admin/subscriptions/schema"

export default async function Page({ searchParams }: PageProps<"/app/subscriptions">) {
  const search = subscriptionsTableParamsCache.parse(await searchParams)
  const subscriptionsPromise = findSubscriptions(search)

  return (
    <Suspense fallback={<DataTableSkeleton title="Subscriptions" />}>
      <SubscriptionsTable subscriptionsPromise={subscriptionsPromise} />
    </Suspense>
  )
}
