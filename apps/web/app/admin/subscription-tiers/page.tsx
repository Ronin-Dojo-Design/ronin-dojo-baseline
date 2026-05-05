import { Suspense } from "react"
import { SubscriptionTiersTable } from "~/app/admin/subscription-tiers/_components/subscription-tiers-table"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findSubscriptionTiers } from "~/server/admin/subscription-tiers/queries"
import { subscriptionTiersTableParamsCache } from "~/server/admin/subscription-tiers/schema"

export default withAdminPage(async ({ searchParams }: PageProps<"/admin/subscription-tiers">) => {
  const search = subscriptionTiersTableParamsCache.parse(await searchParams)
  const tiersPromise = findSubscriptionTiers(search)

  return (
    <Suspense fallback={<DataTableSkeleton title="Subscription Tiers" />}>
      <SubscriptionTiersTable tiersPromise={tiersPromise} />
    </Suspense>
  )
})
