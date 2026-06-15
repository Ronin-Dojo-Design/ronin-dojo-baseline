import { Suspense } from "react"
import { PricingPlansTable } from "~/app/app/pricing-plans/_components/pricing-plans-table"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findPricingPlans } from "~/server/admin/pricing-plans/queries"
import { pricingPlansTableParamsCache } from "~/server/admin/pricing-plans/schema"

export default async function Page({ searchParams }: PageProps<"/app/pricing-plans">) {
  const search = pricingPlansTableParamsCache.parse(await searchParams)
  const pricingPlansPromise = findPricingPlans(search)

  return (
    <Suspense fallback={<DataTableSkeleton title="Pricing Plans" />}>
      <PricingPlansTable pricingPlansPromise={pricingPlansPromise} />
    </Suspense>
  )
}
