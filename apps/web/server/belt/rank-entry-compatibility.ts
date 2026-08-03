/**
 * @added   SESSION_0520 (2026-07-09)
 * @changed SESSION_0739 — structural client type: the old `Pick<typeof db, …>` rejected the plain
 *          `PrismaClient` that seeds/import scripts use, which is why script-created awards
 *          skipped the sync and were display-invisible after the #397 read collapse.
 * @why     Mirror transitional RankAward writes into RankEntry while keeping trust axes distinct
 * @wired   server/belt/router.ts, server/belt/promoter-proposal-core.ts, server/belt/rank-entry-trust-axes.ts, e2e/helpers/seed-rank-entries.ts, prisma/seed.ts, prisma/seed-baseline-lineage.ts, prisma/seed-baseline-owner.ts, scripts/import-bbl-members-full.ts, scripts/enrich-bbl-members-pods.ts
 */
import type {
  RankAwardVerificationStatus,
  RankEntryProvenance,
  RankEntryStatus,
} from "~/.generated/prisma/client"
import { deriveRankEntryTrustAxesFromAwardStatus } from "~/server/belt/rank-entry-trust-axes"

/**
 * Minimal structural surface (method syntax on purpose — parameter bivariance is what lets the
 * extended app `db`, its transaction clients, AND a plain script `PrismaClient` all satisfy it).
 */
export type RankEntryCompatibilityDb = {
  rankAward: {
    findUniqueOrThrow(args: {
      where: { id: string }
      select: { passportId: true; rankId: true; verificationStatus: true }
    }): Promise<{
      passportId: string
      rankId: string
      verificationStatus: RankAwardVerificationStatus
    }>
  }
  rankEntry: {
    upsert(args: {
      where: { rankAwardId: string }
      create: {
        rankAwardId: string
        passportId: string
        rankId: string
        status: RankEntryStatus
        provenance: RankEntryProvenance
      }
      update: {
        passportId: string
        rankId: string
        status: RankEntryStatus
        provenance: RankEntryProvenance
      }
    }): Promise<unknown>
  }
}

/**
 * Synchronize the canonical RankEntry aggregate from its temporary RankAward
 * compatibility anchor.
 *
 * Runtime flows must pass their current Prisma transaction client — that keeps
 * the legacy fact write and canonical aggregate update atomic, and this helper
 * deliberately has no default connection that could escape the caller's
 * transaction. Idempotent seeds/import scripts (non-transactional by design)
 * may pass a plain client; their heal-on-rerun branches cover crash windows.
 */
export async function syncRankEntryFromAward(
  dbClient: RankEntryCompatibilityDb,
  rankAwardId: string,
): Promise<void> {
  const award = await dbClient.rankAward.findUniqueOrThrow({
    where: { id: rankAwardId },
    select: { passportId: true, rankId: true, verificationStatus: true },
  })

  const { status, provenance } = deriveRankEntryTrustAxesFromAwardStatus(award.verificationStatus)
  // Immutable origin axis (#375): IMPORTED (one-time WP self-report migration) vs EARNED in-app.
  // Derived on BOTH branches on purpose: `verificationStatus` never crosses the IMPORTED boundary
  // after creation (importers set it at create; `verifyRankEntryInTransaction` skips IMPORTED;
  // member promoter transitions preserve IMPORTED — SESSION_0730), so the re-derive is a no-op for
  // a correctly-set row and HEALS a row created outside this seam with the column default.
  // "Immutable" = no path may write a non-derived value. Historical metadata only — it locks
  // nothing (SESSION_0730). Kept separate from `status` (mutable; collapses IMPORTED → VERIFIED).
  await dbClient.rankEntry.upsert({
    where: { rankAwardId },
    create: { rankAwardId, passportId: award.passportId, rankId: award.rankId, status, provenance },
    update: { passportId: award.passportId, rankId: award.rankId, status, provenance },
  })
}
