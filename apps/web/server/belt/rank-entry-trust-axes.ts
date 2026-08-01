/**
 * @added   SESSION_0731 (2026-07-31)
 * @why     Encode mutable trust, immutable origin, and the temporary RankAward anchor in one pure seam
 * @wired   server/belt/queries.ts, server/belt/rank-entry-compatibility.ts, server/belt/member-ranks.ts, e2e/helpers/seed-rank-entries.ts
 */
import type {
  RankAwardVerificationStatus,
  RankEntryProvenance,
  RankEntryStatus,
} from "~/.generated/prisma/client"

export type MutableRankEntryStatus = RankEntryStatus
export type ImmutableRankEntryProvenance = RankEntryProvenance

export type RankEntryTrustAxes = {
  status: MutableRankEntryStatus
  readonly provenance: ImmutableRankEntryProvenance
}

export type TransitionalRankAwardAnchor = {
  readonly rankAwardId: string
}

export function deriveRankEntryTrustAxesFromAwardStatus(
  verificationStatus: RankAwardVerificationStatus,
): RankEntryTrustAxes {
  let status: MutableRankEntryStatus = "UNVERIFIED"
  if (verificationStatus === "VERIFIED" || verificationStatus === "IMPORTED") {
    status = "VERIFIED"
  } else if (verificationStatus === "DISPUTED") {
    status = "DISPUTED"
  }

  return {
    status,
    provenance: verificationStatus === "IMPORTED" ? "IMPORTED" : "EARNED",
  }
}

/** Compatibility export while RankAward remains the write anchor. */
export function rankEntryStatusForAward(
  verificationStatus: RankAwardVerificationStatus,
): MutableRankEntryStatus {
  return deriveRankEntryTrustAxesFromAwardStatus(verificationStatus).status
}
