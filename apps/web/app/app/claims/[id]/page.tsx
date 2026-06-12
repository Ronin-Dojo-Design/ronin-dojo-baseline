import { notFound } from "next/navigation"
import { Badge } from "~/components/common/badge"
import { Card } from "~/components/common/card"
import { Heading } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Wrapper } from "~/components/common/wrapper"
import { findProfileClaimById, profileClaimSubjectLabel } from "~/server/admin/claims/claim-queries"
import { ProfileClaimReviewActions } from "~/app/admin/claims/[id]/_components/profile-claim-review-actions"

/**
 * Admin profile-claim detail + review (SESSION_0354). Mirrors lineage claim detail.
 */

export default async ({ params }: PageProps<"/app/claims/[id]">) => {
  const { id } = await params
  const claim = await findProfileClaimById(id)

  if (!claim) {
    notFound()
  }

  const subjectLabel = profileClaimSubjectLabel(claim)
  const subjectHref =
    claim.subjectType === "ORGANIZATION"
      ? claim.organization
        ? `/organizations/${claim.organization.slug}`
        : null
      : claim.directoryProfile?.slug
        ? `/directory/${claim.directoryProfile.slug}`
        : null
  const isReviewable = claim.status === "PENDING" || claim.status === "NEEDS_INFO"

  return (
    <Wrapper>
      <Stack direction="column" className="gap-6">
        <div>
          <Link href="/app/claims" className="text-muted-foreground text-sm hover:underline">
            ← Back to Claims
          </Link>
          <Heading
            render={props => <h1 {...props}>{props.children}</h1>}
            size="h3"
            className="mt-2"
          >
            Claim: {subjectLabel}
          </Heading>
        </div>

        <Card className="p-4">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <Badge>{claim.status}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Type</dt>
              <dd>{claim.subjectType === "ORGANIZATION" ? "Organization" : "Member"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Claimant</dt>
              <dd>{claim.claimant.name ?? claim.claimant.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Relationship</dt>
              <dd>{claim.relationship.toLowerCase()}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Submitted</dt>
              <dd>{claim.createdAt.toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Subject</dt>
              <dd>
                {subjectHref ? (
                  <Link href={subjectHref} className="hover:underline">
                    {subjectLabel}
                  </Link>
                ) : (
                  subjectLabel
                )}
              </dd>
            </div>
            {claim.claimantNote && (
              <div className="col-span-2">
                <dt className="text-muted-foreground">Claimant note</dt>
                <dd className="whitespace-pre-wrap">{claim.claimantNote}</dd>
              </div>
            )}
            {claim.reviewerNote && (
              <div className="col-span-2">
                <dt className="text-muted-foreground">Reviewer note</dt>
                <dd className="whitespace-pre-wrap">{claim.reviewerNote}</dd>
              </div>
            )}
          </dl>
        </Card>

        {isReviewable ? (
          <Card className="p-4">
            <ProfileClaimReviewActions claimId={claim.id} />
          </Card>
        ) : (
          <p className="text-muted-foreground text-sm">
            This claim is in a terminal state and can no longer be reviewed.
          </p>
        )}
      </Stack>
    </Wrapper>
  )
}
