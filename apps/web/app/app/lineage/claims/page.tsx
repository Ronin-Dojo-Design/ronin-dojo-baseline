import { Suspense } from "react"
import { Badge } from "~/components/common/badge"
import { BeltSwatch } from "~/components/common/belt-swatch"
import { Heading } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Wrapper } from "~/components/common/wrapper"
import { requireLineageManagementAccess } from "~/lib/auth-guard"
import { findPendingClaims } from "~/server/admin/lineage/claim-queries"

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
      {claims.map(claim => {
        const subjectName = claim.passport.displayName ?? "Unnamed profile"
        const isPromotion = claim.type === "RANK_PROMOTION"

        return (
          <Link
            key={claim.id}
            href={`/app/lineage/claims/${claim.id}`}
            className="flex items-center justify-between gap-4 p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">
                {/* A promotion is filed by the member on their OWN Passport — no claimant → subject arrow. */}
                {isPromotion
                  ? subjectName
                  : `${claim.claimant.name ?? claim.claimant.email} → ${subjectName}`}
              </p>
              {isPromotion ? (
                <p className="text-sm text-muted-foreground truncate flex items-center gap-1.5">
                  <BeltSwatch colorHex={claim.claimedRank?.colorHex} />
                  Belt promotion → {claim.claimedRank?.name ?? "Unknown belt"}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground truncate">
                  {claim.tree ? `Tree: ${claim.tree.name}` : "Directory profile (no tree)"}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {isPromotion && <Badge variant="soft">Promotion</Badge>}
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
