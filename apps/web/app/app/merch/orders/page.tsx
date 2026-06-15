import { Suspense } from "react"
import { OrdersTable } from "~/app/app/merch/orders/_components/orders-table"
import { merchOrdersTableParamsCache } from "~/app/app/merch/orders/_lib/schema"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { getRequestBrand } from "~/lib/brand-context"
import { findMerchOrders } from "~/server/web/merch/queries"

export default async function Page({ searchParams }: PageProps<"/app/merch/orders">) {
  const search = merchOrdersTableParamsCache.parse(await searchParams)
  const brand = await getRequestBrand()
  const ordersPromise = findMerchOrders(brand, search)

  return (
    <Suspense fallback={<DataTableSkeleton title="Merch Orders" />}>
      <OrdersTable ordersPromise={ordersPromise} />
    </Suspense>
  )
}
