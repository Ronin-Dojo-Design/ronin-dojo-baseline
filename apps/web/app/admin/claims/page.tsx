import { Suspense } from "react"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Badge } from "~/components/common/badge"
import { Heading } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Wrapper } from "~/components/common/wrapper"
import {
  findPendingProfileClaims,
  profileClaimSubjectLabel,
} from "~/server/admin/claims/claim-queries"

/**
 * Admin profile-claim queue (SESSION_0354). Mirrors the lineage claims list.
 */

async function ProfileClaimsContent() {
  const claims = await findPendingProfileClaims()

  if (claims.length === 0) {
    return <p className="text-muted-foreground">No pending profile claims.</p>
  }

  return (
    <div className="divide-y rounded-lg border">
      {claims.map(claim => (
        <Link
          key={claim.id}
          href={`/admin/claims/${claim.id}`}
          className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/50"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">
              {claim.claimant.name ?? claim.claimant.email} → {profileClaimSubjectLabel(claim)}
            </p>
            <p className="truncate text-muted-foreground text-sm">
              {claim.subjectType === "ORGANIZATION" ? "Organization" : "Member"} ·{" "}
              {claim.relationship.toLowerCase()}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <Badge variant={claim.status === "NEEDS_INFO" ? "outline" : "info"}>
              {claim.status}
            </Badge>
            <span className="text-muted-foreground text-xs">
              {claim.createdAt.toLocaleDateString()}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default withAdminPage(async () => {
  return (
    <Wrapper>
      <Stack direction="column" className="gap-6">
        <Heading render={props => <h1 {...props}>{props.children}</h1>} size="h3">
          Profile Claims
        </Heading>

        <Suspense fallback={<p className="text-muted-foreground">Loading claims…</p>}>
          <ProfileClaimsContent />
        </Suspense>
      </Stack>
    </Wrapper>
  )
})
