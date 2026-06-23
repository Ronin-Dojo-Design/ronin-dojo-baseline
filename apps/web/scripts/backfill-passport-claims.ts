/**
 * P4 backfill (ADR 0036, SESSION_0437) — migrate legacy person claims into the unified
 * `PassportClaimRequest`, keyed on identity.
 *
 * Sources (BBL-scoped):
 *   - every `LineageClaimRequest`  → passportId = node.passportId, with node/tree context.
 *   - every PERSON `ProfileClaimRequest` → passportId = directoryProfile.passportId, directory context.
 *   ORGANIZATION `ProfileClaimRequest` rows are left untouched (an org is not a Passport, ADR 0036 §5).
 *
 * Idempotent: a row is skipped if a `PassportClaimRequest` already exists for the same
 * (claimantUserId, passportId, status) and the same door (nodeId for lineage / directoryProfileId
 * for profile). Re-runs are no-ops. Original `status` (incl. Tony Hua APPROVED), `createdAt`,
 * `bypassReason`, `claimedRankId`, and `reviewed*` are preserved.
 *
 * Supervised data lane (NOT auto-fleet). Run:
 *   cd apps/web && bun run scripts/backfill-passport-claims.ts            # against $DATABASE_URL
 * Verify counts in the printed summary, run twice to confirm no dupes, THEN gate the prod run.
 */

import { Brand } from "~/.generated/prisma/client"

// biome-ignore lint/suspicious/noExplicitAny: Prisma client / tx surface (callers pass `db`).
type Db = any

export type BackfillSummary = {
  lineageScanned: number
  lineageMigrated: number
  lineageSkipped: number
  profilePersonScanned: number
  profilePersonMigrated: number
  profilePersonSkipped: number
}

export async function backfillPassportClaims(
  db: Db,
  { brand = Brand.BBL }: { brand?: Brand } = {},
): Promise<BackfillSummary> {
  const summary: BackfillSummary = {
    lineageScanned: 0,
    lineageMigrated: 0,
    lineageSkipped: 0,
    profilePersonScanned: 0,
    profilePersonMigrated: 0,
    profilePersonSkipped: 0,
  }

  // --- LineageClaimRequest → PassportClaimRequest -------------------------------------------
  const lineageClaims = await db.lineageClaimRequest.findMany({
    where: { tree: { brand } },
    select: {
      id: true,
      status: true,
      claimantNote: true,
      reviewerNote: true,
      bypassReason: true,
      reviewedAt: true,
      reviewedById: true,
      createdAt: true,
      treeId: true,
      nodeId: true,
      claimantUserId: true,
      claimedRankId: true,
      node: { select: { passportId: true } },
    },
  })

  for (const lc of lineageClaims) {
    summary.lineageScanned++
    const passportId = lc.node?.passportId
    if (!passportId) {
      summary.lineageSkipped++
      continue
    }

    const existing = await db.passportClaimRequest.findFirst({
      where: {
        passportId,
        claimantUserId: lc.claimantUserId,
        nodeId: lc.nodeId,
        status: lc.status,
      },
      select: { id: true },
    })
    if (existing) {
      summary.lineageSkipped++
      continue
    }

    await db.passportClaimRequest.create({
      data: {
        passportId,
        treeId: lc.treeId,
        nodeId: lc.nodeId,
        claimantUserId: lc.claimantUserId,
        brand,
        status: lc.status,
        claimantNote: lc.claimantNote,
        reviewerNote: lc.reviewerNote,
        bypassReason: lc.bypassReason,
        reviewedById: lc.reviewedById,
        reviewedAt: lc.reviewedAt,
        claimedRankId: lc.claimedRankId,
        createdAt: lc.createdAt,
      },
    })
    summary.lineageMigrated++
  }

  // --- PERSON ProfileClaimRequest → PassportClaimRequest ------------------------------------
  const profileClaims = await db.profileClaimRequest.findMany({
    where: { brand, subjectType: "PERSON" },
    select: {
      id: true,
      status: true,
      relationship: true,
      claimantNote: true,
      reviewerNote: true,
      reviewedAt: true,
      reviewedById: true,
      createdAt: true,
      claimantUserId: true,
      directoryProfileId: true,
      directoryProfile: { select: { passportId: true } },
    },
  })

  for (const pc of profileClaims) {
    summary.profilePersonScanned++
    const passportId = pc.directoryProfile?.passportId
    if (!passportId) {
      summary.profilePersonSkipped++
      continue
    }

    const existing = await db.passportClaimRequest.findFirst({
      where: {
        passportId,
        claimantUserId: pc.claimantUserId,
        directoryProfileId: pc.directoryProfileId,
        status: pc.status,
      },
      select: { id: true },
    })
    if (existing) {
      summary.profilePersonSkipped++
      continue
    }

    await db.passportClaimRequest.create({
      data: {
        passportId,
        directoryProfileId: pc.directoryProfileId,
        claimantUserId: pc.claimantUserId,
        brand,
        status: pc.status,
        relationship: pc.relationship,
        claimantNote: pc.claimantNote,
        reviewerNote: pc.reviewerNote,
        reviewedById: pc.reviewedById,
        reviewedAt: pc.reviewedAt,
        createdAt: pc.createdAt,
      },
    })
    summary.profilePersonMigrated++
  }

  return summary
}

// CLI entry — only runs when invoked directly (not when imported by the test).
if (import.meta.main) {
  const { db } = await import("~/services/db")
  const summary = await backfillPassportClaims(db)
  console.log("[backfill-passport-claims] summary:", JSON.stringify(summary, null, 2))
  const total = await db.passportClaimRequest.count({ where: { brand: Brand.BBL } })
  console.log(`[backfill-passport-claims] BBL PassportClaimRequest total now: ${total}`)
}
