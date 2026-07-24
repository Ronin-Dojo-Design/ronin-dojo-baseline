"use client"

import { useQueryStates } from "nuqs"
import { use, useMemo } from "react"
import { AdminCollection } from "~/components/admin/admin-collection"
import { DataSelect } from "~/components/common/data-select"
import {
  INBOX_BRAND_LABELS,
  INBOX_BRANDS,
  type InboxEmailRow,
  type InboxListResult,
  type InboxTableSchema,
  inboxTableParamsSchema,
} from "~/server/inbox/schema"
import type { DataTableFilterField } from "~/types"
import { getColumns } from "./inbox-table-columns"

type InboxTableProps = {
  rowsPromise: Promise<InboxListResult>
}

const STATUS_OPTIONS: { value: InboxTableSchema["status"]; label: string }[] = [
  { value: "UNREAD", label: "Unread" },
  { value: "READ", label: "Read" },
  { value: "ARCHIVED", label: "Archived" },
  { value: "all", label: "All" },
]

/**
 * The `/app/inbox` conformed AdminCollection (G-033 slice 1, SESSION_0639) — mirrors
 * `planning-intake-table.tsx`: status DataSelect in the toolbar (opens on the UNREAD queue),
 * sender search field, brand facet, in-row triage select. No detail route in this slice.
 */
export function InboxTable({ rowsPromise }: InboxTableProps) {
  const { rows, total, pageCount } = use(rowsPromise)
  // shallow:false — the status write must trigger a server round-trip (the planning-intake
  // precedent), or the URL flips while the rows stay on the old view.
  const [{ perPage, sort, status }, setParams] = useQueryStates(inboxTableParamsSchema, {
    shallow: false,
  })

  const columns = useMemo(() => getColumns(), [])

  const filterFields: DataTableFilterField<InboxEmailRow>[] = [
    { id: "fromAddress", label: "From", placeholder: "Filter by sender..." },
    {
      id: "brand",
      label: "Brand",
      options: INBOX_BRANDS.map(brand => ({ label: INBOX_BRAND_LABELS[brand], value: brand })),
    },
  ]

  return (
    <AdminCollection
      title="Inbox"
      total={total}
      data={rows}
      columns={columns}
      pageCount={pageCount}
      sorting={sort}
      pageSize={perPage}
      filterFields={filterFields}
      emptyState="No inbound emails match this view."
      getRowId={originalRow => originalRow.id}
    >
      {() => (
        <DataSelect
          options={STATUS_OPTIONS}
          value={status}
          // Reset to page 1 on status change — the out-of-range-page guard shared by the
          // planning-intake status select.
          onValueChange={value =>
            setParams({ status: value as InboxTableSchema["status"], page: 1 })
          }
          aria-label="Triage filter"
          triggerClassName="w-36"
        />
      )}
    </AdminCollection>
  )
}
