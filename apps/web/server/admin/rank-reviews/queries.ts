import "server-only"

import {
  type Prisma,
  RankEntryReviewReason,
  RankEntryReviewStatus,
} from "~/.generated/prisma/client"
import { clampListPageParams, runAdminListTransaction } from "~/server/admin/list-query"
import type { RankReviewsTableSchema } from "~/server/admin/rank-reviews/schema"
import { db } from "~/services/db"

/**
 * Admin query for the belt-review queue (`/app/belt-reviews`, G-010, ADR 0045). Lists the
 * PENDING `PROMOTER_CHANGED` `RankEntryReview` rows the SESSION_0540 backfill-verification model
 * OPENS (via `openPromoterChangedReview`) but nothing consumed until this surface — the FINDING_07
 * "unbounded invisible PENDING" fix. Covered by the model's `@@index([status, reason])`.
 *
 * The select resolves the reviewing-instructor's context off the linked entry: the member
 * (`passport.displayName`), the belt (`rank.name`), and the CHANGED promoter the member now
 * claims (the award's `awardedByPassport.displayName`, falling back to the freetext `notes`).
 * All of it renders ONLY inside this `belt.admin`-gated route — a recruited-coach placeholder
 * promoter's name never reaches a public/member surface (no-leak invariant).
 */
const rankReviewAdminSelect = {
  id: true,
  createdAt: true,
  reason: true,
  rankEntry: {
    select: {
      passport: { select: { displayName: true } },
      rank: { select: { name: true } },
      rankAward: {
        select: {
          notes: true,
          awardedByPassport: { select: { displayName: true } },
        },
      },
    },
  },
} satisfies Prisma.RankEntryReviewSelect

export type RankReviewAdminRow = Prisma.RankEntryReviewGetPayload<{
  select: typeof rankReviewAdminSelect
}>

// The queue is FIXED to PENDING + PROMOTER_CHANGED — the only reviews this surface actions.
const PENDING_PROMOTER_CHANGED: Prisma.RankEntryReviewWhereInput = {
  status: RankEntryReviewStatus.PENDING,
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
        where: PENDING_PROMOTER_CHANGED,
        orderBy: resolveOrderBy(search.sort),
        select: rankReviewAdminSelect,
        take: perPage,
        skip: (page - 1) * perPage,
      }),
    count: () => db.rankEntryReview.count({ where: PENDING_PROMOTER_CHANGED }),
  })
}
