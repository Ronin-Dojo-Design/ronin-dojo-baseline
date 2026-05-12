import { Suspense } from "react"
import { RolesTable } from "~/app/admin/roles/_components/roles-table"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findRoles } from "~/server/admin/roles/queries"
import { rolesTableParamsCache } from "~/server/admin/roles/schema"

export default withAdminPage(async ({ searchParams }: PageProps<"/admin/roles">) => {
  const search = rolesTableParamsCache.parse(await searchParams)
  const rolesPromise = findRoles(search)

  return (
    <Suspense fallback={<DataTableSkeleton title="Roles" />}>
      <RolesTable rolesPromise={rolesPromise} />
    </Suspense>
  )
})
