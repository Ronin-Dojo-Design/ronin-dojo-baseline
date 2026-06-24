import { Badge } from "~/components/common/badge"
import { Card } from "~/components/common/card"
import { Heading } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Wrapper } from "~/components/common/wrapper"
import type { ClaimDetail } from "~/server/admin/lineage/claim-queries"
import { ClaimStatusActions } from "./claim-status-actions"

/**
 * Shared lineage-claim review detail (SESSION_0441).
 *
 * The `/admin/lineage/claims/[id]` (platform super-admin) and
 * `/app/lineage/claims/[id]` (org-scoped admin) pages were near-duplicates that
 * had drifted — only `/admin` rendered the Claimed Rank card. Extracted to one
 * component so both surfaces stay in lockstep; `backHref` is the only per-route
 * difference. The Claimant Note carries every field as text; the typed refs
 * (rank/school/instructor/tree) render as resolved, verifiable links.
 */
export function ClaimReviewDetail({ claim, backHref }: { claim: ClaimDetail; backHref: string }) {
  const subjectName = claim.passport.displayName ?? "Unnamed profile"

  return (
    <Wrapper>
      <Stack direction="column" className="gap-6">
        <div>
          <Link href={backHref} className="text-sm text-muted-foreground hover:underline">
            ← Back to Claims
          </Link>
          <Heading
            render={props => <h1 {...props}>{props.children}</h1>}
            size="h3"
            className="mt-2"
          >
            Claim: {subjectName}
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
                {claim.tree ? (
                  <Link href={`/lineage/${claim.tree.slug}`} className="hover:underline">
                    {claim.tree.name}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">Directory profile (no tree)</span>
                )}
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

        {/* Claimed Rank */}
        {claim.claimedRank && (
          <Card className="p-4">
            <Heading
              render={props => <h2 {...props}>{props.children}</h2>}
              size="h5"
              className="mb-2"
            >
              Claimed Rank
            </Heading>
            <div className="flex items-center gap-2 text-sm">
              {claim.claimedRank.colorHex && (
                <span
                  className="inline-block h-4 w-4 rounded-full border"
                  style={{ backgroundColor: claim.claimedRank.colorHex }}
                />
              )}
              <span className="font-medium">{claim.claimedRank.name}</span>
              {claim.claimedRank.shortName && (
                <Badge variant="outline">{claim.claimedRank.shortName}</Badge>
              )}
              <span className="text-muted-foreground text-xs">
                — asserted at claim time; approval will create a verified RankAward
              </span>
            </div>
          </Card>
        )}

        {/* Lineage selections — registered school/instructor/tree the claimant picked in the
            join wizard (SESSION_0441). Resolved to links the steward can verify. A custom
            (typed) value has no ref and appears only as text in the Claimant Note below. */}
        {(claim.claimedSchool || claim.trainedUnderNode || claim.representTree) && (
          <Card className="p-4">
            <Heading
              render={props => <h2 {...props}>{props.children}</h2>}
              size="h5"
              className="mb-2"
            >
              Lineage selections
            </Heading>
            <dl className="grid gap-2 text-sm">
              {claim.claimedSchool && (
                <div className="flex items-center gap-2">
                  <dt className="text-muted-foreground w-28 shrink-0">School</dt>
                  <dd className="flex items-center gap-2">
                    <Link href={`/schools/${claim.claimedSchool.slug}`} className="hover:underline">
                      {claim.claimedSchool.name}
                    </Link>
                    <Badge variant="outline">registered</Badge>
                  </dd>
                </div>
              )}
              {claim.trainedUnderNode && (
                <div className="flex items-center gap-2">
                  <dt className="text-muted-foreground w-28 shrink-0">Trained under</dt>
                  <dd className="flex items-center gap-2">
                    <span className="font-medium">
                      {claim.trainedUnderNode.passport?.displayName ?? "Lineage member"}
                    </span>
                    <Badge variant="outline">registered</Badge>
                  </dd>
                </div>
              )}
              {claim.representTree && (
                <div className="flex items-center gap-2">
                  <dt className="text-muted-foreground w-28 shrink-0">Represents</dt>
                  <dd className="flex items-center gap-2">
                    <Link href={`/lineage/${claim.representTree.slug}`} className="hover:underline">
                      {claim.representTree.name}
                    </Link>
                    <Badge variant="outline">registered</Badge>
                  </dd>
                </div>
              )}
            </dl>
            <p className="text-muted-foreground mt-2 text-xs">
              Registered picks link to the verified entity; custom entries appear as text in the
              claimant note.
            </p>
          </Card>
        )}

        {/* Claimant Note */}
        {claim.claimantNote && (
          <Card className="p-4">
            <Heading
              render={props => <h2 {...props}>{props.children}</h2>}
              size="h5"
              className="mb-2"
            >
              Claimant Note
            </Heading>
            <p className="text-sm whitespace-pre-wrap">{claim.claimantNote}</p>
          </Card>
        )}

        {/* Reviewer Note */}
        {claim.reviewerNote && (
          <Card className="p-4">
            <Heading
              render={props => <h2 {...props}>{props.children}</h2>}
              size="h5"
              className="mb-2"
            >
              Reviewer Note
            </Heading>
            <p className="text-sm whitespace-pre-wrap">{claim.reviewerNote}</p>
          </Card>
        )}

        {/* Evidence */}
        {claim.evidence.length > 0 && (
          <Card className="p-4">
            <Heading
              render={props => <h2 {...props}>{props.children}</h2>}
              size="h5"
              className="mb-2"
            >
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
}
