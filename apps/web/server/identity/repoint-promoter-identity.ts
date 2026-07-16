import type { Prisma } from "~/.generated/prisma/client"

type PromoterAwardReference = { id: string; passportId: string }
type PromoterReviewReference = {
  id: string
  rankEntry: { rankAwardId: string; passportId: string }
}

/**
 * The narrow transaction port used by the merge helper.
 *
 * Keep this structural instead of picking full Prisma delegates: the application client carries a
 * query extension, so its interactive transaction delegates use different internal generic args
 * than a plain `Prisma.TransactionClient`. Both clients support these exact operations.
 */
export type PromoterIdentityMergeTx = {
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: unknown[]): Promise<T>
  $executeRaw(query: TemplateStringsArray | Prisma.Sql, ...values: unknown[]): Promise<number>
  rankAward: {
    findMany(args: {
      where: { awardedByPassportId: string }
      select: { id: true; passportId: true }
      orderBy: { id: "asc" }
    }): Promise<PromoterAwardReference[]>
    updateMany(args: {
      where: { id: { in: string[] }; awardedByPassportId: string }
      data: { awardedByPassportId: string }
    }): Promise<unknown>
  }
  rankEntryReview: {
    findMany(args: {
      where: {
        OR: Array<{ expectedPromoterPassportId: string } | { proposedPromoterPassportId: string }>
      }
      select: {
        id: true
        rankEntry: { select: { rankAwardId: true; passportId: true } }
      }
      orderBy: { id: "asc" }
    }): Promise<PromoterReviewReference[]>
  }
}

/**
 * Canonicalize every promoter edge before an identity merge deletes a superseded Passport.
 *
 * The caller MUST provide a transaction client. Lock order follows the promoter workflow's global
 * law: Passport → RankAward → RankEntryReview, with ids sorted inside each tier so overlapping
 * multi-row merges cannot acquire the same graph backwards.
 *
 * Review identity collapse is not a belt-verification decision. Even when expected A and proposed
 * B become the same canonical Passport, status and all review timestamps remain unchanged.
 */
export async function repointPromoterIdentityForMerge(
  tx: PromoterIdentityMergeTx,
  fromPassportId: string,
  toPassportId: string,
): Promise<void> {
  if (fromPassportId === toPassportId) return

  // Interactive transaction queries stay sequential; the pg adapter cannot multiplex one checked-
  // out connection.
  const initialAwards = await tx.rankAward.findMany({
    where: { awardedByPassportId: fromPassportId },
    select: { id: true, passportId: true },
    orderBy: { id: "asc" },
  })
  const initialReviews = await tx.rankEntryReview.findMany({
    where: {
      OR: [
        { expectedPromoterPassportId: fromPassportId },
        { proposedPromoterPassportId: fromPassportId },
      ],
    },
    select: { id: true, rankEntry: { select: { rankAwardId: true, passportId: true } } },
    orderBy: { id: "asc" },
  })

  const lockedPassportIds = [
    ...new Set([
      fromPassportId,
      toPassportId,
      ...initialAwards.map(award => award.passportId),
      ...initialReviews.map(review => review.rankEntry.passportId),
    ]),
  ].sort()
  for (const passportId of lockedPassportIds) {
    await tx.$queryRaw`SELECT "id" FROM "Passport" WHERE "id" = ${passportId} FOR UPDATE`
  }

  // A writer that won the Passport tier first may have changed the graph while this merge waited.
  // A newly discovered earner Passport fails closed so a retry can acquire the whole sorted tier.
  const currentAwards = await tx.rankAward.findMany({
    where: { awardedByPassportId: fromPassportId },
    select: { id: true, passportId: true },
    orderBy: { id: "asc" },
  })
  const currentReviews = await tx.rankEntryReview.findMany({
    where: {
      OR: [
        { expectedPromoterPassportId: fromPassportId },
        { proposedPromoterPassportId: fromPassportId },
      ],
    },
    select: { id: true, rankEntry: { select: { rankAwardId: true, passportId: true } } },
    orderBy: { id: "asc" },
  })
  const lockedPassportIdSet = new Set(lockedPassportIds)
  if (
    currentAwards.some(award => !lockedPassportIdSet.has(award.passportId)) ||
    currentReviews.some(review => !lockedPassportIdSet.has(review.rankEntry.passportId))
  ) {
    throw new Error("Promoter identity changed during identity merge. Retry the operation.")
  }

  const lockedAwardIds = [
    ...new Set([
      ...currentAwards.map(award => award.id),
      ...currentReviews.map(review => review.rankEntry.rankAwardId),
    ]),
  ].sort()
  for (const awardId of lockedAwardIds) {
    await tx.$queryRaw`SELECT "id" FROM "RankAward" WHERE "id" = ${awardId} FOR UPDATE`
  }

  const lockedReviewIds = currentReviews.map(review => review.id).sort()
  for (const reviewId of lockedReviewIds) {
    await tx.$queryRaw`SELECT "id" FROM "RankEntryReview" WHERE "id" = ${reviewId} FOR UPDATE`
  }

  await tx.rankAward.updateMany({
    where: { id: { in: lockedAwardIds }, awardedByPassportId: fromPassportId },
    data: { awardedByPassportId: toPassportId },
  })

  // Raw FK-only updates deliberately bypass Prisma's @updatedAt injection: canonicalizing identity
  // is not a new proposal or steward decision and must not rewrite the review timeline.
  for (const review of [...currentReviews].sort((a, b) => a.id.localeCompare(b.id))) {
    await tx.$executeRaw`
      UPDATE "RankEntryReview"
      SET "expectedPromoterPassportId" = ${toPassportId}
      WHERE "id" = ${review.id}
        AND "expectedPromoterPassportId" = ${fromPassportId}
    `
    await tx.$executeRaw`
      UPDATE "RankEntryReview"
      SET "proposedPromoterPassportId" = ${toPassportId}
      WHERE "id" = ${review.id}
        AND "proposedPromoterPassportId" = ${fromPassportId}
    `
  }
}
