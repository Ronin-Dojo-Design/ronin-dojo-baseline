import { Suspense } from "react"
import { SubscriptionTiersTable } from "~/app/app/subscription-tiers/_components/subscription-tiers-table"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findSubscriptionTiers } from "~/server/admin/subscription-tiers/queries"
import { subscriptionTiersTableParamsCache } from "~/server/admin/subscription-tiers/schema"

export default async function Page({ searchParams }: PageProps<"/app/subscription-tiers">) {
  const search = subscriptionTiersTableParamsCache.parse(await searchParams)
  const tiersPromise = findSubscriptionTiers(search)

  return (
    <Suspense fallback={<DataTableSkeleton title="Subscription Tiers" />}>
      <SubscriptionTiersTable tiersPromise={tiersPromise} />
    </Suspense>
  )
}
