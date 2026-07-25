import type { Metadata } from "next"
import { Suspense } from "react"
import { InboxTable } from "~/app/app/inbox/_components/inbox-table"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { requirePermission } from "~/lib/auth-guard"
import { rsc } from "~/lib/orpc-server"
import { getPageMetadata } from "~/lib/pages"
import {
  INBOX_SORTABLE_COLUMNS,
  type InboxListResult,
  type InboxSortableColumn,
  inboxTableParamsCache,
} from "~/server/inbox/schema"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"

/**
 * The inbound-email triage AdminCollection index (G-033 slice 1, SESSION_0639) — a SIBLING
 * collection of `/app/planning-intake`, gated INLINE with the EXISTING `email.manage` area key
 * (an inbound-email inbox is the email admin area; no subordinate routes to protect, so a
 * `layout.tsx` gate would add nothing). Rows arrive exclusively via the Resend webhook
 * (`/api/resend/webhooks`); reads go through the oRPC `inbox` router (full-oRPC direction).
 */
export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata({
    url: "/app/inbox",
    metadata: {
      title: "Inbox",
      description: "Triage inbound email received on the portfolio's Resend domains.",
      robots: { index: false, follow: false },
    },
  })
}

const SORTABLE = new Set<string>(INBOX_SORTABLE_COLUMNS)

export default async ({ searchParams }: PageProps<"/app/inbox">) => {
  await requirePermission(APP_AREA_PERMISSIONS.email)

  const search = inboxTableParamsCache.parse(await searchParams)
  const api = await rsc()
  // The nuqs sort parser admits any row key; the router's zod enum only the sortable subset —
  // drop URL-crafted non-sortable ids here instead of 500ing on input validation.
  const sort = search.sort.filter((entry): entry is { id: InboxSortableColumn; desc: boolean } =>
    SORTABLE.has(entry.id),
  )
  const rowsPromise: Promise<InboxListResult> = api.inbox.list({
    triageStatus: search.status,
    brand: search.brand,
    fromAddress: search.fromAddress || undefined,
    page: search.page,
    perPage: search.perPage,
    sort,
  })

  return (
    <Suspense fallback={<DataTableSkeleton title="Inbox" />}>
      <InboxTable rowsPromise={rowsPromise} />
    </Suspense>
  )
}
