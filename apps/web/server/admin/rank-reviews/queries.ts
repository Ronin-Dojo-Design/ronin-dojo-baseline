import "server-only"

import {
  type Prisma,
  RankAwardVerificationStatus,
  RankEntryReviewReason,
  RankEntryReviewStatus,
} from "~/.generated/prisma/client"
import { clampListPageParams, runAdminListTransaction } from "~/server/admin/list-query"
import type { RankReviewsTableSchema } from "~/server/admin/rank-reviews/schema"
import { db } from "~/services/db"

/**
 * Admin query for the belt-review queue (`/app/belt-reviews`, G-010, ADR 0045). Lists the
 * captured `PROPOSAL_PENDING` rows the SESSION_0540 model opens plus visible legacy PENDING rows
 * from the rolling window. Captured rows are actionable; payload-less legacy rows fail closed on
 * detail. This closes FINDING_07's "unbounded invisible PENDING" gap and is covered by
 * `@@index([status, reason])`.
 *
 * The select resolves the reviewing-instructor's queue context from the immutable proposal:
 * member, belt render data, and the proposed promoter identity. It deliberately never reads the
 * mutable active award as the proposal. A valid captured proposal has both
 * `proposalCapturedAt` and a proposed established-coach identity.
 */
const rankReviewAdminSelect = {
  id: true,
  createdAt: true,
  proposalCapturedAt: true,
  proposedPromoterPassportId: true,
  proposedPromoter: {
    select: { id: true, displayName: true, user: { select: { name: true } } },
  },
  rankEntry: {
    select: {
      passport: {
        select: { id: true, displayName: true, user: { select: { name: true } } },
      },
      rank: {
        select: {
          id: true,
          name: true,
          colorHex: true,
          secondaryColorHex: true,
          degree: true,
          beltFamily: true,
        },
      },
    },
  },
} satisfies Prisma.RankEntryReviewSelect

export type RankReviewAdminRow = Prisma.RankEntryReviewGetPayload<{
  select: typeof rankReviewAdminSelect
}>

/**
 * Full operator detail for a promoter-change proposal. The immutable expected/proposed values sit
 * beside the active award so the reviewer can see both the captured decision boundary and current
 * state. The member's highest authority-verified BJJ award is selected as live anchor context; it
 * is supporting context, not part of the immutable proposal snapshot.
 */
const promoterReviewDetailSelect = {
  id: true,
  status: true,
  reason: true,
  note: true,
  proposalCapturedAt: true,
  expectedPromoterPassportId: true,
  expectedPromoterName: true,
  proposedPromoterPassportId: true,
  createdAt: true,
  updatedAt: true,
  expectedPromoter: {
    select: { id: true, displayName: true, user: { select: { name: true } } },
  },
  proposedPromoter: {
    select: { id: true, displayName: true, user: { select: { name: true } } },
  },
  rankEntry: {
    select: {
      id: true,
      status: true,
      passport: {
        select: {
          id: true,
          displayName: true,
          user: { select: { name: true } },
          rankAwardsEarned: {
            where: {
              rank: { rankSystem: { discipline: { code: "bjj" } } },
              OR: [
                { verificationStatus: RankAwardVerificationStatus.IMPORTED },
                {
                  verificationStatus: RankAwardVerificationStatus.VERIFIED,
                  awardedById: { not: null },
                },
              ],
            },
            orderBy: [{ rank: { sortOrder: "desc" } }, { awardedAt: "desc" }],
            take: 1,
            select: {
              id: true,
              notes: true,
              awardedByPassportId: true,
              awardedByPassport: {
                select: { id: true, displayName: true, user: { select: { name: true } } },
              },
              rank: { select: { name: true } },
            },
          },
        },
      },
      rank: {
        select: {
          id: true,
          name: true,
          colorHex: true,
          secondaryColorHex: true,
          degree: true,
          beltFamily: true,
        },
      },
      rankAward: {
        select: {
          id: true,
          verificationStatus: true,
          awardedByPassportId: true,
          notes: true,
          awardedByPassport: {
            select: { id: true, displayName: true, user: { select: { name: true } } },
          },
        },
      },
    },
  },
} satisfies Prisma.RankEntryReviewSelect

export type PromoterReviewDetail = Prisma.RankEntryReviewGetPayload<{
  select: typeof promoterReviewDetailSelect
}>

// Captured proposals use a proposal-only status as a rolling-writer barrier: the previous release
// only actions `PENDING`, so it cannot decide them without applying B. Legacy payload-less PENDING
// rows stay visible here for operator inventory but the detail/action core fails them closed.
const OPEN_PROMOTER_CHANGED: Prisma.RankEntryReviewWhereInput = {
  status: { in: [RankEntryReviewStatus.PENDING, RankEntryReviewStatus.PROPOSAL_PENDING] },
  reason: RankEntryReviewReason.PROMOTER_CHANGED,
}

// Only `createdAt` is a real scalar to order by; the member / belt / promoter cells are
// resolved off relations and have no column to sort on. Anything else falls back to oldest-first.
const resolveOrderBy = (
  sort: RankReviewsTableSchema["sort"],
): Prisma.RankEntryReviewOrderByWithRelationInput => {
  const primary = sort[0]
  if (primary?.id === "createdAt") return { createdAt: primary.desc ? "desc" : "asc" }
  return { createdAt: "asc" }
}

export async function findPendingPromoterReviews(search: RankReviewsTableSchema) {
  const { page, perPage } = clampListPageParams(search.page, search.perPage)

  return runAdminListTransaction({
    perPage,
    findMany: () =>
      db.rankEntryReview.findMany({
        where: OPEN_PROMOTER_CHANGED,
        orderBy: resolveOrderBy(search.sort),
        select: rankReviewAdminSelect,
        take: perPage,
        skip: (page - 1) * perPage,
      }),
    count: () => db.rankEntryReview.count({ where: OPEN_PROMOTER_CHANGED }),
  })
}

/**
 * Addressable review detail. The reason is fixed to this surface, but status is intentionally not:
 * after a decision, `router.refresh()` must be able to render the APPROVED/DENIED terminal state.
 */
export function findPromoterReviewById(reviewId: string) {
  return db.rankEntryReview.findFirst({
    where: { id: reviewId, reason: RankEntryReviewReason.PROMOTER_CHANGED },
    select: promoterReviewDetailSelect,
  })
}
