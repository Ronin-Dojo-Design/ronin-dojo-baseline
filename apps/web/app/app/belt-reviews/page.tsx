import type { Metadata } from "next"
import { Suspense } from "react"
import { BeltReviewsTable } from "~/app/app/belt-reviews/_components/belt-reviews-table"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { getPageMetadata } from "~/lib/pages"
import { findPendingPromoterReviews } from "~/server/admin/rank-reviews/queries"
import { rankReviewsTableParamsCache } from "~/server/admin/rank-reviews/schema"

/**
 * The belt-review queue index (G-010, ADR 0045) — a SIBLING AdminCollection of `/app/techniques`.
 * ACTIONS captured `PROPOSAL_PENDING` / `PROMOTER_CHANGED` rows the SESSION_0540 backfill model
 * opens but nothing consumed (Giddy FINDING_07 — "unbounded invisible PENDING"). The distinct
 * status is a rolling-writer barrier: the previous release only accepts legacy `PENDING` rows and
 * therefore cannot approve a captured proposal without applying its proposed promoter. Legacy
 * payload-less PENDING rows remain visible for inventory but fail closed on the detail surface.
 *
 * The segment layout gates both this queue and its row→detail review surface on `belt.admin`.
 */
export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata({
    url: "/app/belt-reviews",
    metadata: {
      title: "Belt reviews",
      description: "Review member belt promoter-change requests awaiting verification.",
      robots: { index: false, follow: false },
    },
  })
}

export default async ({ searchParams }: PageProps<"/app/belt-reviews">) => {
  const search = rankReviewsTableParamsCache.parse(await searchParams)
  const reviewsPromise = findPendingPromoterReviews(search)

  return (
    <Suspense fallback={<DataTableSkeleton title="Belt reviews" />}>
      <BeltReviewsTable reviewsPromise={reviewsPromise} />
    </Suspense>
  )
}
