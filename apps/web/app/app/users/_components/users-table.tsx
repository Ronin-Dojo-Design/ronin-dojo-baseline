"use client"

import { MailPlusIcon, UserPlusIcon } from "lucide-react"
import { useQueryStates } from "nuqs"
import { use, useMemo } from "react"
import type { User } from "~/.generated/prisma/browser"
import { AdminCollection } from "~/components/admin/admin-collection"
import { DateRangePicker } from "~/components/admin/date-range-picker"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { DataTableViewOptions } from "~/components/data-table/data-table-view-options"
import type { findUsers } from "~/server/admin/users/queries"
import { usersTableParamsSchema } from "~/server/admin/users/schema"
import type { DataTableFilterField } from "~/types"
import { getColumns } from "./users-table-columns"
import { UsersTableToolbarActions } from "./users-table-toolbar-actions"

type UsersTableProps = {
  usersPromise: ReturnType<typeof findUsers>
}

export function UsersTable({ usersPromise }: UsersTableProps) {
  const { users, usersTotal, pageCount } = use(usersPromise)
  const [{ perPage, sort }] = useQueryStates(usersTableParamsSchema)

  // Memoize the columns so they don't re-render on every render
  const columns = useMemo(() => getColumns(), [])

  // Search filters
  const filterFields: DataTableFilterField<User>[] = [
    {
      id: "name",
      label: "Name",
      placeholder: "Search by name or email...",
    },
  ]

  return (
    <AdminCollection
      title="Users"
      total={usersTotal}
      data={users}
      columns={columns}
      pageCount={pageCount}
      filterFields={filterFields}
      sorting={sort}
      pageSize={perPage}
      initialState={{ columnPinning: { right: ["actions"] } }}
      getRowId={(originalRow, index) => `${originalRow.id}-${index}`}
      enableRowSelection={row => row.original.role !== "admin"}
      callToAction={
        <Stack size="sm">
          <Button
            variant="primary"
            size="md"
            prefix={<UserPlusIcon />}
            render={<Link href="/app/users/new" />}
          >
            <div className="max-sm:sr-only">Add person</div>
          </Button>

          <Button
            variant="secondary"
            size="md"
            prefix={<MailPlusIcon />}
            render={<Link href="/admin/invites/new" />}
          >
            <div className="max-sm:sr-only">Invite user</div>
          </Button>
        </Stack>
      }
    >
      {table => (
        <>
          <UsersTableToolbarActions table={table} />
          <DateRangePicker align="end" />
          <DataTableViewOptions table={table} />
        </>
      )}
    </AdminCollection>
  )
}
