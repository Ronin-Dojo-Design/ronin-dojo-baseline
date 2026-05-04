import { Suspense } from "react"
import { PricingPlansTable } from "~/app/admin/pricing-plans/_components/pricing-plans-table"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findPricingPlans } from "~/server/admin/pricing-plans/queries"
import { pricingPlansTableParamsCache } from "~/server/admin/pricing-plans/schema"

export default withAdminPage(async ({ searchParams }: PageProps<"/admin/pricing-plans">) => {
  const search = pricingPlansTableParamsCache.parse(await searchParams)
  const pricingPlansPromise = findPricingPlans(search)

  return (
    <Suspense fallback={<DataTableSkeleton title="Pricing Plans" />}>
      <PricingPlansTable pricingPlansPromise={pricingPlansPromise} />
    </Suspense>
  )
})
