import { Suspense } from "react"
import { Heading } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { Wrapper } from "~/components/common/wrapper"
import { requireLineageManagementAccess } from "~/lib/auth-guard"
import { findPendingClaims } from "~/server/admin/lineage/claim-queries"
import { claimRowViewModel } from "./_components/claim-row-view-model"
import { ClaimRow } from "./_components/claim-row"

/**
 * Admin lineage claims list page.
 *
 * Author: Cody / SESSION_0183 TASK_03. Slice V5 (SESSION_0491): RANK_PROMOTION
 * rows render a "Promotion" badge + the asserted belt (swatch from
 * `Rank.colorHex`, ADR 0022) instead of the tree/directory subtitle.
 */

async function ClaimsContent() {
  const claims = await findPendingClaims()

  if (claims.length === 0) {
    return <p className="text-muted-foreground">No pending claims.</p>
  }

  return (
    <div className="divide-y rounded-lg border">
      {claims.map(claim => (
        <ClaimRow key={claim.id} vm={claimRowViewModel(claim)} />
      ))}
    </div>
  )
}

export default async () => {
  await requireLineageManagementAccess()

  return (
    <Wrapper>
      <Stack direction="column" className="gap-6">
        <Heading render={props => <h1 {...props}>{props.children}</h1>} size="h3">
          Lineage Claims
        </Heading>

        <Suspense fallback={<p className="text-muted-foreground">Loading claims…</p>}>
          <ClaimsContent />
        </Suspense>
      </Stack>
    </Wrapper>
  )
}
