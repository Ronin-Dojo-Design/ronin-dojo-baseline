import { Suspense } from "react"
import { EntitlementsTable } from "~/app/app/entitlements/_components/entitlements-table"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findEntitlements } from "~/server/admin/entitlements/queries"
import { entitlementsTableParamsCache } from "~/server/admin/entitlements/schema"

export default async function ({ searchParams }: PageProps<"/app/entitlements">) {
  const search = entitlementsTableParamsCache.parse(await searchParams)
  const entitlementsPromise = findEntitlements(search)

  return (
    <Suspense fallback={<DataTableSkeleton title="Entitlements" />}>
      <EntitlementsTable entitlementsPromise={entitlementsPromise} />
    </Suspense>
  )
}
