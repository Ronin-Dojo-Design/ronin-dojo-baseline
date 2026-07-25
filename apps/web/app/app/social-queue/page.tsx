/**
 * @added   SESSION_0686 (2026-07-24)
 * @why     The social-flywheel approval queue — event-generated brand-social drafts require a
 *          HUMAN approve/reject before anything can ever publish (approval-queue-first).
 * @wired   server/orpc/routers/social-queue.ts, app/app/social-queue/_components/social-queue-table.tsx
 */
import type { Metadata } from "next"
import { Suspense } from "react"
import { SocialQueueTable } from "~/app/app/social-queue/_components/social-queue-table"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { rsc } from "~/lib/orpc-server"
import { getPageMetadata } from "~/lib/pages"
import {
  SOCIAL_QUEUE_SORTABLE_COLUMNS,
  type SocialQueueListResult,
  type SocialQueueSortableColumn,
  socialQueueTableParamsCache,
} from "~/server/social-queue/schema"

/**
 * The social approval-queue index (SESSION_0686, spec §4) — a conformed AdminCollection,
 * SIBLING of `/app/inbox`/`/app/belt-reviews`. The segment layout gates on
 * `social-queue.manage`; reads go through the oRPC `socialQueue` router (full-oRPC direction).
 * Approval STOPS at "ready to publish" — this surface has NO publish action.
 */
export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata({
    url: "/app/social-queue",
    metadata: {
      title: "Social queue",
      description: "Review, approve, or reject event-generated social drafts before publishing.",
      robots: { index: false, follow: false },
    },
  })
}

const SORTABLE = new Set<string>(SOCIAL_QUEUE_SORTABLE_COLUMNS)

export default async ({ searchParams }: PageProps<"/app/social-queue">) => {
  const search = socialQueueTableParamsCache.parse(await searchParams)
  const api = await rsc()
  // The nuqs sort parser admits any row key; the router's zod enum only the sortable subset —
  // drop URL-crafted non-sortable ids here instead of 500ing on input validation (inbox idiom).
  const sort = search.sort.filter(
    (entry): entry is { id: SocialQueueSortableColumn; desc: boolean } => SORTABLE.has(entry.id),
  )
  const rowsPromise: Promise<SocialQueueListResult> = api.socialQueue.list({
    status: search.status,
    source: search.source,
    page: search.page,
    perPage: search.perPage,
    sort,
  })

  return (
    <Suspense fallback={<DataTableSkeleton title="Social queue" />}>
      <SocialQueueTable rowsPromise={rowsPromise} />
    </Suspense>
  )
}
