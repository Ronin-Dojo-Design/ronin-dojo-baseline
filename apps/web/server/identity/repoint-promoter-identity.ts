/**
 * @added   SESSION_0542 (2026-07-16)
 * @why     Enforce one recoverable lock law when canonicalizing promoter identity references
 * @wired   server/admin/lineage/claim-finalize.ts, server/web/lineage/claim-node-for-user.ts,
 *          scripts/migrate-founders-to-canonical.ts
 */
import type { Prisma } from "~/.generated/prisma/client"

// Deliberately no `server-only` marker: the guarded Bun recovery script imports this transaction
// helper directly. It has no ambient client or secrets; every operation requires a supplied tx.

type PromoterAwardReference = { id: string; passportId: string }
type PromoterReviewReference = {
  id: string
  expectedPromoterPassportId: string | null
  proposedPromoterPassportId: string | null
  rankEntry: { rankAwardId: string; passportId: string }
}

export type PromoterIdentityMergeReviewManifest = {
  id: string
  expectedPromoterReferencedFrom: boolean
  proposedPromoterReferencedFrom: boolean
}

/**
 * Exact promoter before-image covered by an identity-merge recovery artifact.
 *
 * Review fields are independent because one review can reference the superseded Passport in either
 * or both columns. Rollback must restore only the columns that the merge actually changed.
 */
export type PromoterIdentityMergeManifest = {
  fromPassportId: string
  toPassportId: string
  awardIds: string[]
  reviews: PromoterIdentityMergeReviewManifest[]
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
    }): Promise<{ count: number }>
  }
  rankEntryReview: {
    findMany(args: {
      where: {
        OR: Array<{ expectedPromoterPassportId: string } | { proposedPromoterPassportId: string }>
      }
      select: {
        id: true
        expectedPromoterPassportId: true
        proposedPromoterPassportId: true
        rankEntry: { select: { rankAwardId: true; passportId: true } }
      }
      orderBy: { id: "asc" }
    }): Promise<PromoterReviewReference[]>
  }
}

const reviewSelect = {
  id: true,
  expectedPromoterPassportId: true,
  proposedPromoterPassportId: true,
  rankEntry: { select: { rankAwardId: true, passportId: true } },
} as const

function canonicalManifest(manifest: PromoterIdentityMergeManifest): PromoterIdentityMergeManifest {
  const awardIds = [...manifest.awardIds].sort()
  const reviews = [...manifest.reviews].sort((a, b) => a.id.localeCompare(b.id))

  if (new Set(awardIds).size !== awardIds.length) {
    throw new Error("Invalid promoter identity recovery manifest: duplicate RankAward id.")
  }
  if (new Set(reviews.map(review => review.id)).size !== reviews.length) {
    throw new Error("Invalid promoter identity recovery manifest: duplicate RankEntryReview id.")
  }
  if (
    reviews.some(
      review => !review.expectedPromoterReferencedFrom && !review.proposedPromoterReferencedFrom,
    )
  ) {
    throw new Error(
      "Invalid promoter identity recovery manifest: a review has no captured promoter field.",
    )
  }

  return {
    fromPassportId: manifest.fromPassportId,
    toPassportId: manifest.toPassportId,
    awardIds,
    reviews,
  }
}

/** Fail closed when a recovery artifact does not cover the exact locked before-image. */
export function assertPromoterIdentityMergeManifestMatches(
  expected: PromoterIdentityMergeManifest,
  actual: PromoterIdentityMergeManifest,
): void {
  if (JSON.stringify(canonicalManifest(expected)) !== JSON.stringify(canonicalManifest(actual))) {
    throw new Error(
      "Promoter identity recovery manifest no longer matches locked database state. Refusing unbacked merge.",
    )
  }
}

async function findPromoterReferences(
  tx: PromoterIdentityMergeTx,
  fromPassportId: string,
): Promise<{ awards: PromoterAwardReference[]; reviews: PromoterReviewReference[] }> {
  // Interactive transaction queries stay sequential; the pg adapter cannot multiplex one checked-
  // out connection.
  const awards = await tx.rankAward.findMany({
    where: { awardedByPassportId: fromPassportId },
    select: { id: true, passportId: true },
    orderBy: { id: "asc" },
  })
  const reviews = await tx.rankEntryReview.findMany({
    where: {
      OR: [
        { expectedPromoterPassportId: fromPassportId },
        { proposedPromoterPassportId: fromPassportId },
      ],
    },
    select: reviewSelect,
    orderBy: { id: "asc" },
  })
  return { awards, reviews }
}

/**
 * Acquire the complete promoter identity graph without changing it and return its exact before-image.
 *
 * This is also the lock-only preflight for callers that must honor Passport-first ordering before
 * writing another FK tier. Keep the transaction open after this returns; its locks are the contract.
 */
export async function lockPromoterIdentityMergeScope(
  tx: PromoterIdentityMergeTx,
  fromPassportId: string,
  toPassportId: string,
): Promise<PromoterIdentityMergeManifest> {
  if (fromPassportId === toPassportId) {
    return { fromPassportId, toPassportId, awardIds: [], reviews: [] }
  }

  const initial = await findPromoterReferences(tx, fromPassportId)
  const lockedPassportIds = [
    ...new Set([
      fromPassportId,
      toPassportId,
      ...initial.awards.map(award => award.passportId),
      ...initial.reviews.map(review => review.rankEntry.passportId),
    ]),
  ].sort()
  for (const passportId of lockedPassportIds) {
    await tx.$queryRaw`SELECT "id" FROM "Passport" WHERE "id" = ${passportId} FOR UPDATE`
  }

  // A writer that won the Passport tier first may have changed the graph while this merge waited.
  // A newly discovered earner Passport fails closed so a retry can acquire the whole sorted tier.
  const current = await findPromoterReferences(tx, fromPassportId)
  const lockedPassportIdSet = new Set(lockedPassportIds)
  if (
    current.awards.some(award => !lockedPassportIdSet.has(award.passportId)) ||
    current.reviews.some(review => !lockedPassportIdSet.has(review.rankEntry.passportId))
  ) {
    throw new Error("Promoter identity changed during identity merge. Retry the operation.")
  }

  const lockedAwardIds = [
    ...new Set([
      ...current.awards.map(award => award.id),
      ...current.reviews.map(review => review.rankEntry.rankAwardId),
    ]),
  ].sort()
  for (const awardId of lockedAwardIds) {
    await tx.$queryRaw`SELECT "id" FROM "RankAward" WHERE "id" = ${awardId} FOR UPDATE`
  }

  const lockedReviewIds = current.reviews.map(review => review.id).sort()
  for (const reviewId of lockedReviewIds) {
    await tx.$queryRaw`SELECT "id" FROM "RankEntryReview" WHERE "id" = ${reviewId} FOR UPDATE`
  }

  // Rows can change while a tier lock waits. Re-read only after every tier is held; Passport FK
  // locks prevent new promoter references, while these subset checks catch parent/earner movement.
  const locked = await findPromoterReferences(tx, fromPassportId)
  const lockedAwardIdSet = new Set(lockedAwardIds)
  const lockedReviewIdSet = new Set(lockedReviewIds)
  if (
    locked.awards.some(
      award => !lockedPassportIdSet.has(award.passportId) || !lockedAwardIdSet.has(award.id),
    ) ||
    locked.reviews.some(
      review =>
        !lockedPassportIdSet.has(review.rankEntry.passportId) ||
        !lockedAwardIdSet.has(review.rankEntry.rankAwardId) ||
        !lockedReviewIdSet.has(review.id),
    )
  ) {
    throw new Error("Promoter identity changed during identity merge. Retry the operation.")
  }

  return canonicalManifest({
    fromPassportId,
    toPassportId,
    awardIds: locked.awards.map(award => award.id),
    reviews: locked.reviews.map(review => ({
      id: review.id,
      expectedPromoterReferencedFrom: review.expectedPromoterPassportId === fromPassportId,
      proposedPromoterReferencedFrom: review.proposedPromoterPassportId === fromPassportId,
    })),
  })
}

async function updateReviewPromoterField(args: {
  tx: PromoterIdentityMergeTx
  reviewId: string
  field: "expected" | "proposed"
  fromPassportId: string
  toPassportId: string
}): Promise<void> {
  const { tx, reviewId, field, fromPassportId, toPassportId } = args
  const count =
    field === "expected"
      ? await tx.$executeRaw`
          UPDATE "RankEntryReview"
          SET "expectedPromoterPassportId" = ${toPassportId}
          WHERE "id" = ${reviewId}
            AND "expectedPromoterPassportId" = ${fromPassportId}
        `
      : await tx.$executeRaw`
          UPDATE "RankEntryReview"
          SET "proposedPromoterPassportId" = ${toPassportId}
          WHERE "id" = ${reviewId}
            AND "proposedPromoterPassportId" = ${fromPassportId}
        `

  if (count !== 1) {
    throw new Error(
      `Promoter identity ${field} review edge ${reviewId} changed after locking. Refusing partial repoint.`,
    )
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
  expectedManifest?: PromoterIdentityMergeManifest,
): Promise<PromoterIdentityMergeManifest> {
  const manifest = await lockPromoterIdentityMergeScope(tx, fromPassportId, toPassportId)
  if (expectedManifest) {
    assertPromoterIdentityMergeManifestMatches(expectedManifest, manifest)
  }
  if (fromPassportId === toPassportId) return manifest

  if (manifest.awardIds.length > 0) {
    const result = await tx.rankAward.updateMany({
      where: { id: { in: manifest.awardIds }, awardedByPassportId: fromPassportId },
      data: { awardedByPassportId: toPassportId },
    })
    if (result.count !== manifest.awardIds.length) {
      throw new Error(
        "Promoter identity award edges changed after locking. Refusing partial repoint.",
      )
    }
  }

  // Raw FK-only updates deliberately bypass Prisma's @updatedAt injection: canonicalizing identity
  // is not a new proposal or steward decision and must not rewrite the review timeline.
  for (const review of manifest.reviews) {
    if (review.expectedPromoterReferencedFrom) {
      await updateReviewPromoterField({
        tx,
        reviewId: review.id,
        field: "expected",
        fromPassportId,
        toPassportId,
      })
    }
    if (review.proposedPromoterReferencedFrom) {
      await updateReviewPromoterField({
        tx,
        reviewId: review.id,
        field: "proposed",
        fromPassportId,
        toPassportId,
      })
    }
  }

  return manifest
}

/** Restore only promoter fields captured by a prior merge artifact. */
export async function restorePromoterIdentityFromMergeManifest(
  tx: PromoterIdentityMergeTx,
  recoveryManifest: PromoterIdentityMergeManifest,
): Promise<void> {
  const manifest = canonicalManifest(recoveryManifest)
  if (manifest.fromPassportId === manifest.toPassportId) return
  if (manifest.awardIds.length === 0 && manifest.reviews.length === 0) return

  // Lock the entire current canonical graph in the same global order, but deliberately restore only
  // artifact IDs. A canonical Passport can have acquired unrelated edges since the merge.
  const current = await lockPromoterIdentityMergeScope(
    tx,
    manifest.toPassportId,
    manifest.fromPassportId,
  )
  const currentAwardIds = new Set(current.awardIds)
  const currentReviews = new Map(current.reviews.map(review => [review.id, review]))
  const missingAward = manifest.awardIds.find(id => !currentAwardIds.has(id))
  const missingReviewField = manifest.reviews.find(review => {
    const now = currentReviews.get(review.id)
    return (
      !now ||
      (review.expectedPromoterReferencedFrom && !now.expectedPromoterReferencedFrom) ||
      (review.proposedPromoterReferencedFrom && !now.proposedPromoterReferencedFrom)
    )
  })
  if (missingAward || missingReviewField) {
    throw new Error(
      "Promoter identity recovery target changed after the merge. Refusing to overwrite newer state.",
    )
  }

  if (manifest.awardIds.length > 0) {
    const result = await tx.rankAward.updateMany({
      where: {
        id: { in: manifest.awardIds },
        awardedByPassportId: manifest.toPassportId,
      },
      data: { awardedByPassportId: manifest.fromPassportId },
    })
    if (result.count !== manifest.awardIds.length) {
      throw new Error("Promoter identity award recovery was incomplete. Rolling back transaction.")
    }
  }

  for (const review of manifest.reviews) {
    if (review.expectedPromoterReferencedFrom) {
      await updateReviewPromoterField({
        tx,
        reviewId: review.id,
        field: "expected",
        fromPassportId: manifest.toPassportId,
        toPassportId: manifest.fromPassportId,
      })
    }
    if (review.proposedPromoterReferencedFrom) {
      await updateReviewPromoterField({
        tx,
        reviewId: review.id,
        field: "proposed",
        fromPassportId: manifest.toPassportId,
        toPassportId: manifest.fromPassportId,
      })
    }
  }
}
