import type { Metadata } from "next"
import { Suspense } from "react"
import { BeltReviewsTable } from "~/app/app/belt-reviews/_components/belt-reviews-table"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { requirePermission } from "~/lib/auth-guard"
import { getPageMetadata } from "~/lib/pages"
import { findPendingPromoterReviews } from "~/server/admin/rank-reviews/queries"
import { rankReviewsTableParamsCache } from "~/server/admin/rank-reviews/schema"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"

/**
 * The belt-review queue index (G-010, ADR 0045) — a SIBLING AdminCollection of `/app/techniques`.
 * ACTIONS the PENDING `PROMOTER_CHANGED` `RankEntryReview` rows the SESSION_0540 backfill model
 * opens but nothing consumed (Giddy FINDING_07 — "unbounded invisible PENDING"). The
 * `AdminCollection` header count is the operator-visible PENDING total (the whole list is scoped
 * to PENDING + PROMOTER_CHANGED, so `total` IS the count).
 *
 * Gated INLINE on `belt.admin` (the same key `updateRankAwardFactAsAdmin` uses; admin `"*"`
 * covers it) — no subtree layout, matching the FI-027 precedent so a gate can never clobber a
 * sibling author-accessible route.
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
  await requirePermission(APP_AREA_PERMISSIONS.beltReviews)

  const search = rankReviewsTableParamsCache.parse(await searchParams)
  const reviewsPromise = findPendingPromoterReviews(search)

  return (
    <Suspense fallback={<DataTableSkeleton title="Belt reviews" />}>
      <BeltReviewsTable reviewsPromise={reviewsPromise} />
    </Suspense>
  )
}
