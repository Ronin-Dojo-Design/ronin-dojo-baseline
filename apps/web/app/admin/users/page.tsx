import { Suspense } from "react"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findUsers } from "~/server/admin/users/queries"
import { usersTableParamsCache } from "~/server/admin/users/schema"
import { UsersTable } from "./_components/users-table"

export default withAdminPage(async ({ searchParams }: PageProps<"/admin/users">) => {
  const search = usersTableParamsCache.parse(await searchParams)
  const usersPromise = findUsers(search)

  return (
    <Suspense fallback={<DataTableSkeleton title="Users" />}>
      <UsersTable usersPromise={usersPromise} />
    </Suspense>
  )
})
