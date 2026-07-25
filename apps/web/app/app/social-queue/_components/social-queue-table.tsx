"use client"

import { useQueryStates } from "nuqs"
import { use, useMemo } from "react"
import { AdminCollection } from "~/components/admin/admin-collection"
import { DataSelect } from "~/components/common/data-select"
import {
  SOCIAL_QUEUE_SOURCE_LABELS,
  SOCIAL_QUEUE_SOURCES,
  SOCIAL_QUEUE_STATUS_LABELS,
  SOCIAL_QUEUE_STATUSES,
  type SocialQueueListResult,
  type SocialQueueRow,
  type SocialQueueTableSchema,
  socialQueueTableParamsSchema,
} from "~/server/social-queue/schema"
import type { DataTableFilterField } from "~/types"
import { getColumns } from "./social-queue-table-columns"

type SocialQueueTableProps = {
  rowsPromise: Promise<SocialQueueListResult>
}

const STATUS_OPTIONS: { value: SocialQueueTableSchema["status"]; label: string }[] = [
  ...SOCIAL_QUEUE_STATUSES.map(status => ({
    value: status,
    label: SOCIAL_QUEUE_STATUS_LABELS[status],
  })),
  { value: "all", label: "All" },
]

/**
 * The `/app/social-queue` conformed AdminCollection (SESSION_0686, spec §4) — mirrors
 * `inbox-table.tsx`: status DataSelect in the toolbar (opens on the DRAFT review queue),
 * source facet, per-row approve/reject actions. NO publish control exists on this surface —
 * approval stops at "ready to publish".
 */
export function SocialQueueTable({ rowsPromise }: SocialQueueTableProps) {
  const { rows, total, pageCount } = use(rowsPromise)
  // shallow:false — the status write must trigger a server round-trip (the inbox precedent),
  // or the URL flips while the rows stay on the old view.
  const [{ perPage, sort, status }, setParams] = useQueryStates(socialQueueTableParamsSchema, {
    shallow: false,
  })

  const columns = useMemo(() => getColumns(), [])

  const filterFields: DataTableFilterField<SocialQueueRow>[] = [
    {
      id: "source",
      label: "Source",
      options: SOCIAL_QUEUE_SOURCES.map(source => ({
        label: SOCIAL_QUEUE_SOURCE_LABELS[source],
        value: source,
      })),
    },
  ]

  return (
    <AdminCollection
      title="Social queue"
      total={total}
      data={rows}
      columns={columns}
      pageCount={pageCount}
      sorting={sort}
      pageSize={perPage}
      filterFields={filterFields}
      initialState={{ columnPinning: { right: ["actions"] } }}
      emptyState="No social drafts match this view."
      getRowId={originalRow => originalRow.id}
    >
      {() => (
        <DataSelect
          options={STATUS_OPTIONS}
          value={status}
          // Reset to page 1 on status change — the out-of-range-page guard shared by the
          // inbox/planning-intake status selects.
          onValueChange={value =>
            setParams({ status: value as SocialQueueTableSchema["status"], page: 1 })
          }
          aria-label="Status filter"
          triggerClassName="w-36"
        />
      )}
    </AdminCollection>
  )
}
