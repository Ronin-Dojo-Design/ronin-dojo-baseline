import { notFound } from "next/navigation"
import { requireLineageManagementAccess } from "~/lib/auth-guard"
import { findClaimById } from "~/server/admin/lineage/claim-queries"
import { ClaimReviewDetail } from "./_components/claim-review-detail"

/**
 * Org-scoped lineage claim detail page.
 *
 * Author: Cody / SESSION_0183 TASK_04. Shares the `ClaimReviewDetail` body with
 * the platform-admin `/admin/lineage/claims/[id]` page (SESSION_0441) — this
 * variant previously drifted (missing the Claimed Rank card); the shared
 * component keeps both surfaces identical.
 */

export default async ({ params }: PageProps<"/app/lineage/claims/[id]">) => {
  await requireLineageManagementAccess()

  const { id } = await params
  const claim = await findClaimById(id)

  if (!claim) {
    notFound()
  }

  return <ClaimReviewDetail claim={claim} backHref="/app/lineage/claims" />
}
