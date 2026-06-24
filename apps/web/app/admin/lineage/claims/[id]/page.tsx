import { notFound } from "next/navigation"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { findClaimById } from "~/server/admin/lineage/claim-queries"
import { ClaimReviewDetail } from "~/app/app/lineage/claims/[id]/_components/claim-review-detail"

/**
 * Admin lineage claim detail page (platform super-admin).
 *
 * Author: Cody / SESSION_0183 TASK_04. Body extracted to a shared
 * `ClaimReviewDetail` that now lives under `/app` (the surviving surface —
 * `/admin` is being retired, SESSION_0441) so the two pages stay in lockstep.
 */

export default withAdminPage(async ({ params }: PageProps<"/admin/lineage/claims/[id]">) => {
  const { id } = await params
  const claim = await findClaimById(id)

  if (!claim) {
    notFound()
  }

  return <ClaimReviewDetail claim={claim} backHref="/admin/lineage/claims" />
})
