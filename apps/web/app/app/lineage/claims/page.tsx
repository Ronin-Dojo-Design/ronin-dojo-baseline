import { Suspense } from "react"
import { Badge } from "~/components/common/badge"
import { Heading } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Wrapper } from "~/components/common/wrapper"
import { findPendingClaims } from "~/server/admin/lineage/claim-queries"

/**
 * Admin lineage claims list page.
 *
 * Author: Cody / SESSION_0183 TASK_03.
 */

async function ClaimsContent() {
  const claims = await findPendingClaims()

  if (claims.length === 0) {
    return <p className="text-muted-foreground">No pending claims.</p>
  }

  return (
    <div className="divide-y rounded-lg border">
      {claims.map(claim => {
        const nodeDisplayName = claim.node.user.passport?.displayName ?? "Unnamed lineage node"

        return (
          <Link
            key={claim.id}
            href={`/app/lineage/claims/${claim.id}`}
            className="flex items-center justify-between gap-4 p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">
                {claim.claimant.name ?? claim.claimant.email} → {nodeDisplayName}
              </p>
              <p className="text-sm text-muted-foreground truncate">Tree: {claim.tree.name}</p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Badge variant={claim.status === "NEEDS_INFO" ? "outline" : "info"}>
                {claim.status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {claim.createdAt.toLocaleDateString()}
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

export default async () => {
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
