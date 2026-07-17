/**
 * @added   SESSION_0542 (2026-07-16)
 * @why     Let BBL stewards inspect immutable promoter evidence before deciding a review
 * @wired   server/admin/rank-reviews/queries.ts, app/app/belt-reviews/_components/belt-review-actions.tsx
 */
import { formatDate } from "@dirstack/utils"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"
import { BeltReviewActions } from "~/app/app/belt-reviews/_components/belt-review-actions"
import { beltReviewDetailState } from "~/app/app/belt-reviews/_components/belt-review-detail-state"
import { Badge } from "~/components/common/badge"
import { BeltSwatch } from "~/components/common/belt-swatch"
import { Card } from "~/components/common/card"
import { Heading } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { Wrapper } from "~/components/common/wrapper"
import { passportDisplayName } from "~/lib/identity/passport-display"
import { findPromoterReviewById } from "~/server/admin/rank-reviews/queries"

type PassportSummary = {
  id: string
  displayName: string | null
  user: { name: string | null } | null
}

function renderPassportValue(
  passport: PassportSummary | null,
  fallback: string | null,
  emptyLabel: string,
): ReactNode {
  const label =
    passportDisplayName(passport) ?? fallback ?? (passport ? "Unnamed promoter" : emptyLabel)

  return passport ? (
    <Link href={`/app/users/${passport.id}`} className="font-medium hover:underline">
      {label}
    </Link>
  ) : (
    label
  )
}

/** Addressable, claims-conformant review detail required by ADR 0045. */
export default async function ({ params }: PageProps<"/app/belt-reviews/[reviewId]">) {
  const { reviewId } = await params
  const review = await findPromoterReviewById(reviewId)

  if (!review) notFound()

  const { rankEntry } = review
  const { passport, rank, rankAward } = rankEntry
  const memberName = passportDisplayName(passport) ?? "Unnamed member"
  const anchorAward = passport.rankAwardsEarned[0] ?? null
  const proposedPromoterName = review.proposedPromoter
    ? (passportDisplayName(review.proposedPromoter) ?? "Unnamed promoter")
    : "Proposal unavailable"
  const detailState = beltReviewDetailState({
    status: review.status,
    proposalCapturedAt: review.proposalCapturedAt,
    expectedPromoterPassportId: review.expectedPromoterPassportId,
    expectedPromoterName: review.expectedPromoterName,
    proposedPromoterPassportId: review.proposedPromoterPassportId,
    activePromoterPassportId: rankAward.awardedByPassportId,
    activePromoterName: rankAward.notes,
  })

  let decisionSurface: ReactNode
  if (detailState.surface === "actions") {
    decisionSurface = (
      <Card className="p-4">
        {detailState.showStaleWarning && (
          <Note role="alert" className="mb-4 text-amber-700 dark:text-amber-400">
            The accepted promoter changed after this proposal was captured. Approval is disabled;
            deny this stale proposal or use the explicit admin override.
          </Note>
        )}
        <BeltReviewActions
          reviewId={review.id}
          memberName={memberName}
          rankName={rank.name}
          proposedPromoterName={proposedPromoterName}
          canApprove={detailState.canApprove}
        />
      </Card>
    )
  } else if (detailState.surface === "legacy") {
    decisionSurface = (
      <p className="text-sm text-muted-foreground">
        This legacy review has no immutable promoter proposal and cannot be actioned.
      </p>
    )
  } else {
    decisionSurface = (
      <p className="text-sm text-muted-foreground">
        This promoter-change review is {review.status} and can no longer be actioned.
      </p>
    )
  }

  return (
    <Wrapper>
      <Stack direction="column" className="gap-6">
        <div>
          <Link href="/app/belt-reviews" className="text-sm text-muted-foreground hover:underline">
            ← Back to Belt reviews
          </Link>
          <Heading
            render={props => <h1 {...props}>{props.children}</h1>}
            size="h3"
            className="mt-2"
          >
            Belt review: {memberName}
          </Heading>
        </div>

        <Card className="p-4">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <Badge variant={detailState.statusVariant}>{detailState.statusLabel}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Requested</dt>
              <dd>{formatDate(review.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Member</dt>
              <dd>
                <Link href={`/app/users/${passport.id}`} className="font-medium hover:underline">
                  {memberName}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Review type</dt>
              <dd>Promoter change</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-4">
          <Heading
            render={props => <h2 {...props}>{props.children}</h2>}
            size="h5"
            className="mb-2"
          >
            Belt
          </Heading>
          <Stack wrap>
            <BeltSwatch
              variant="belt"
              colorHex={rank.colorHex}
              secondaryColorHex={rank.secondaryColorHex}
              degree={rank.degree}
              beltFamily={rank.beltFamily}
            />
            <span className="font-semibold">{rank.name}</span>
            <Badge variant={rankEntry.status === "VERIFIED" ? "success" : "outline"}>
              {rankEntry.status}
            </Badge>
          </Stack>
        </Card>

        <Card className="p-4">
          <Heading
            render={props => <h2 {...props}>{props.children}</h2>}
            size="h5"
            className="mb-2"
          >
            Promoter proposal
          </Heading>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Current promoter</dt>
              <dd>
                {renderPassportValue(
                  rankAward.awardedByPassport,
                  rankAward.notes,
                  "No promoter recorded",
                )}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Promoter when requested</dt>
              <dd>
                {detailState.hasCapturedProposal
                  ? renderPassportValue(
                      review.expectedPromoter,
                      review.expectedPromoterName,
                      "No promoter",
                    )
                  : "Not captured"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Trusted anchor promoter</dt>
              <dd>
                {anchorAward ? (
                  <Stack size="xs" wrap>
                    {renderPassportValue(
                      anchorAward.awardedByPassport,
                      anchorAward.notes,
                      "No promoter recorded",
                    )}
                    <Note as="span">via {anchorAward.rank.name}</Note>
                  </Stack>
                ) : (
                  "No trusted anchor"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Proposed promoter</dt>
              <dd>
                {review.proposedPromoter ? (
                  <Link
                    href={`/app/users/${review.proposedPromoter.id}`}
                    className="font-medium hover:underline"
                  >
                    {proposedPromoterName}
                  </Link>
                ) : (
                  proposedPromoterName
                )}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-muted-foreground">
            Approval applies the captured proposed promoter to this belt and marks the belt
            VERIFIED. Denial keeps the current promoter and verification state unchanged.
          </p>
        </Card>

        {decisionSurface}
      </Stack>
    </Wrapper>
  )
}
