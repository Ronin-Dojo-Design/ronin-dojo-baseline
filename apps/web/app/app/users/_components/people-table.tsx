"use client"

import { MailPlusIcon, UserPlusIcon } from "lucide-react"
import { useQueryStates } from "nuqs"
import { use, useMemo } from "react"
import { AdminCollection } from "~/components/admin/admin-collection"
import { DateRangePicker } from "~/components/admin/date-range-picker"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { DataTableViewOptions } from "~/components/data-table/data-table-view-options"
import type { findPeople, PersonRow } from "~/server/admin/people/queries"
import { peopleTableParamsSchema } from "~/server/admin/people/schema"
import type { DataTableFilterField } from "~/types"
import { getColumns } from "./people-table-columns"
import { PeopleTableToolbarActions } from "./people-table-toolbar-actions"

type PeopleTableProps = {
  peoplePromise: ReturnType<typeof findPeople>
}

export function PeopleTable({ peoplePromise }: PeopleTableProps) {
  const { people, peopleTotal, pageCount } = use(peoplePromise)
  const [{ perPage, sort }] = useQueryStates(peopleTableParamsSchema)

  // Memoize the columns so they don't re-render on every render
  const columns = useMemo(() => getColumns(), [])

  // Search filters — one text field over Passport identity + linked-account name/email.
  // nuqs keys the URL search param off `field.id` and `useDataTable` targets the column with
  // that id, so `id` must be a real `PersonRow` key that is ALSO a column id: `displayName`
  // (the Name column's accessor). The server `findPeople` reads the `displayName` param and
  // fans the term across displayName / legal name / account name+email.
  const filterFields: DataTableFilterField<PersonRow>[] = [
    {
      id: "displayName",
      label: "Name",
      placeholder: "Search by name or email...",
    },
  ]

  return (
    <AdminCollection
      title="People"
      total={peopleTotal}
      data={people}
      columns={columns}
      pageCount={pageCount}
      filterFields={filterFields}
      sorting={sort}
      pageSize={perPage}
      initialState={{ columnPinning: { right: ["actions"] } }}
      getRowId={(originalRow, index) => `${originalRow.id}-${index}`}
      // Accountless placeholders + admins are not selectable (bulk actions are account-only).
      enableRowSelection={row => row.original.user != null && row.original.user.role !== "admin"}
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
          <PeopleTableToolbarActions table={table} />
          <DateRangePicker align="end" />
          <DataTableViewOptions table={table} />
        </>
      )}
    </AdminCollection>
  )
}
