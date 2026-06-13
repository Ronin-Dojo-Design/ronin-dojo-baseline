import { Suspense } from "react"
import { RolesTable } from "~/app/app/roles/_components/roles-table"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findRoles } from "~/server/admin/roles/queries"
import { rolesTableParamsCache } from "~/server/admin/roles/schema"

export default async function ({ searchParams }: PageProps<"/app/roles">) {
  const search = rolesTableParamsCache.parse(await searchParams)
  const rolesPromise = findRoles(search)

  return (
    <Suspense fallback={<DataTableSkeleton title="Roles" />}>
      <RolesTable rolesPromise={rolesPromise} />
    </Suspense>
  )
}
