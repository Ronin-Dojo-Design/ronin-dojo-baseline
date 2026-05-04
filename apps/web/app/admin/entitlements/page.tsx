import { Suspense } from "react"
import { EntitlementsTable } from "~/app/admin/entitlements/_components/entitlements-table"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findEntitlements } from "~/server/admin/entitlements/queries"
import { entitlementsTableParamsCache } from "~/server/admin/entitlements/schema"

export default withAdminPage(async ({ searchParams }: PageProps<"/admin/entitlements">) => {
  const search = entitlementsTableParamsCache.parse(await searchParams)
  const entitlementsPromise = findEntitlements(search)

  return (
    <Suspense fallback={<DataTableSkeleton title="Entitlements" />}>
      <EntitlementsTable entitlementsPromise={entitlementsPromise} />
    </Suspense>
  )
})
