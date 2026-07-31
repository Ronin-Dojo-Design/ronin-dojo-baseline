import type { LineageClaimStatus, RankEntryStatus } from "~/.generated/prisma/client"

export type LineageTrustStatus =
  | "disputed"
  | "verified"
  | "claimed"
  | "claim-pending"
  | "imported"
  | "unverified"

export type LineageClaimBadgeStatus = "claimable"

type ClaimSummary = {
  status: LineageClaimStatus
}

/**
 * Minimal `RankEntry` shape `pickTopTrustStatus` reads: the member's canonical rank entry carrying
 * its `status` (the ONE member-facing rank-trust axis — LR 0008) plus the discipline id for
 * discipline-scoped surfaces. Structurally satisfied by every `rankEntries` payload (lineage
 * row/profile, public passport, directory) since #376 collapsed every rank read onto `RankEntry`,
 * so ONE resolver reads them all instead of N surfaces each deriving trust from the node-level flag.
 */
export type TrustRankEntry = {
  status: RankEntryStatus
  // `rankSystem.id` is universal across the `rankEntries` payloads (it defeats the weak-type check
  // for the directory's discipline-less `{ id, name }` rankSystem); `discipline.id` powers optional
  // discipline scoping.
  rank: { rankSystem?: { id: string; discipline?: { id: string } | null } | null }
}

/**
 * THE member's rank-trust = the status of their CURRENT rank = the highest non-PENDING RankEntry in
 * the (optionally discipline-scoped) entry ordering (rank-entry-unified-data-flow.md: "current rank
 * is the highest non-pending entry"). `UNVERIFIED | VERIFIED | DISPUTED` count; `PENDING` does not.
 * Entries arrive pre-ordered highest-belt-first, so the first qualifying entry is the top one. Null →
 * no verified rank on record (resolves to unverified/imported).
 */
export function pickTopTrustStatus(
  entries: readonly TrustRankEntry[],
  disciplineId?: string | null,
): RankEntryStatus | null {
  for (const entry of entries) {
    if (disciplineId && entry.rank.rankSystem?.discipline?.id !== disciplineId) continue
    if (entry.status !== "PENDING") return entry.status
  }
  return null
}

/**
 * Node-level membership verification — the BELTLESS fallback (WL-P2-46). `isVerified` /
 * `verificationStatus` survive ONLY here: a documented lineage member with no belt still needs a
 * trust standing, so when there's no rank to read, the node's membership-verification is used.
 */
export type NodeTrustFallback = {
  isVerified?: boolean | null
  verificationStatus?: string | null
}

/**
 * THE member's trust axis (the ONE choke point every surface reads): the top non-PENDING
 * `RankEntry.status` when the member has a rank (belt precedence — a VERIFIED belt on a
 * node-unverified member reads verified; a DISPUTED belt reads disputed), ELSE — beltless or
 * all-PENDING — fall back to the node's membership verification so a documented-but-beltless
 * verified lineage member still reads verified (WL-P2-46; ~34 such members on the canonical tree).
 * Null → no rank AND no node verification → the caller's unverified/imported/claim path (unchanged).
 */
export function resolveMemberTrustStatus(
  entries: readonly TrustRankEntry[],
  node: NodeTrustFallback,
  disciplineId?: string | null,
): RankEntryStatus | null {
  const rankStatus = pickTopTrustStatus(entries, disciplineId)
  if (rankStatus) return rankStatus
  // Beltless / all-PENDING → node membership verification (the only surviving use of these fields).
  if (node.verificationStatus === "DISPUTED") return "DISPUTED"
  if (node.verificationStatus === "VERIFIED" || node.isVerified === true) return "VERIFIED"
  return null
}

export type ResolveLineageTrustStatusInput = {
  /**
   * The member's current-rank trust — the top non-PENDING `RankEntry.status` (`pickTopTrustStatus`).
   * The single member-facing lineage-trust source (LR 0008); the retired `node.isVerified` /
   * `node.verificationStatus` axis no longer feeds display.
   */
  rankStatus?: RankEntryStatus | null
  isPlaceholder?: boolean | null
  claimStatus?: LineageClaimStatus | null
}

export type ResolveLineageClaimBadgeStatusInput = {
  isClaimable?: boolean | null
  claimStatus?: LineageClaimStatus | null
}

export function pickLineageClaimStatus(
  claims: readonly ClaimSummary[] | null | undefined,
): LineageClaimStatus | null {
  if (!claims?.length) return null

  const statuses = new Set(claims.map(claim => claim.status))
  if (statuses.has("APPROVED")) return "APPROVED"
  if (statuses.has("PENDING")) return "PENDING"
  if (statuses.has("NEEDS_INFO")) return "NEEDS_INFO"

  return null
}

export function resolveLineageTrustStatus({
  rankStatus,
  isPlaceholder,
  claimStatus,
}: ResolveLineageTrustStatusInput): LineageTrustStatus {
  if (rankStatus === "DISPUTED") return "disputed"
  if (rankStatus === "VERIFIED") return "verified"
  if (claimStatus === "APPROVED") return "claimed"
  if (claimStatus === "PENDING" || claimStatus === "NEEDS_INFO") return "claim-pending"
  if (isPlaceholder === true) return "imported"

  return "unverified"
}

export function resolveLineageClaimBadgeStatus({
  isClaimable,
  claimStatus,
}: ResolveLineageClaimBadgeStatusInput): LineageClaimBadgeStatus | null {
  if (claimStatus === "APPROVED") return null
  return isClaimable === true ? "claimable" : null
}
