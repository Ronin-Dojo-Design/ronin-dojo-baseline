import { notFound } from "next/navigation"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Badge } from "~/components/common/badge"
import { Card } from "~/components/common/card"
import { Heading } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Wrapper } from "~/components/common/wrapper"
import { findClaimById } from "~/server/admin/lineage/claim-queries"
import { ClaimStatusActions } from "./_components/claim-status-actions"

/**
 * Admin lineage claim detail page.
 *
 * Author: Cody / SESSION_0183 TASK_04.
 */

export default withAdminPage(async ({ params }: PageProps<"/admin/lineage/claims/[id]">) => {
  const { id } = await params
  const claim = await findClaimById(id)

  if (!claim) {
    notFound()
  }

  const nodeDisplayName = claim.node.user.passport?.displayName ?? "Unnamed lineage node"

  return (
    <Wrapper>
      <Stack direction="column" className="gap-6">
        <div>
          <Link
            href="/admin/lineage/claims"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Back to Claims
          </Link>
          <Heading as="h1" size="h3" className="mt-2">
            Claim: {nodeDisplayName}
          </Heading>
        </div>

        {/* Status + Meta */}
        <Card className="p-4">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <Badge>{claim.status}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Submitted</dt>
              <dd>{claim.createdAt.toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Claimant</dt>
              <dd>{claim.claimant.name ?? claim.claimant.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Tree</dt>
              <dd>
                <Link href={`/lineage/${claim.tree.slug}`} className="hover:underline">
                  {claim.tree.name}
                </Link>
              </dd>
            </div>
            {claim.reviewedBy && (
              <>
                <div>
                  <dt className="text-muted-foreground">Reviewed by</dt>
                  <dd>{claim.reviewedBy.name ?? claim.reviewedBy.email}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Reviewed at</dt>
                  <dd>{claim.reviewedAt?.toLocaleDateString()}</dd>
                </div>
              </>
            )}
          </dl>
        </Card>

        {/* Claimant Note */}
        {claim.claimantNote && (
          <Card className="p-4">
            <Heading as="h2" size="h5" className="mb-2">
              Claimant Note
            </Heading>
            <p className="text-sm whitespace-pre-wrap">{claim.claimantNote}</p>
          </Card>
        )}

        {/* Reviewer Note */}
        {claim.reviewerNote && (
          <Card className="p-4">
            <Heading as="h2" size="h5" className="mb-2">
              Reviewer Note
            </Heading>
            <p className="text-sm whitespace-pre-wrap">{claim.reviewerNote}</p>
          </Card>
        )}

        {/* Evidence */}
        {claim.evidence.length > 0 && (
          <Card className="p-4">
            <Heading as="h2" size="h5" className="mb-2">
              Evidence ({claim.evidence.length})
            </Heading>
            <Stack direction="column" className="gap-3">
              {claim.evidence.map(ev => (
                <div key={ev.id} className="rounded border p-3 text-sm">
                  {ev.label && <p className="font-medium">{ev.label}</p>}
                  {ev.url && (
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all"
                    >
                      {ev.url}
                    </a>
                  )}
                  {ev.text && (
                    <p className="text-muted-foreground whitespace-pre-wrap mt-1">{ev.text}</p>
                  )}
                </div>
              ))}
            </Stack>
          </Card>
        )}

        {/* Actions */}
        <ClaimStatusActions claim={claim} />
      </Stack>
    </Wrapper>
  )
})
