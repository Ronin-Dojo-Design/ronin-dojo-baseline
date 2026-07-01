import type { RankAwardSource, RankAwardVerificationStatus } from "~/.generated/prisma/client"

/**
 * Pure belt-journey gating logic (Slice 3 — Petey Plan 0477 Locked #5).
 *
 * Kept DB-free and side-effect-free so every invariant is unit-testable in
 * isolation (mirrors `matchesPattern` / `pickTopAwardInDiscipline`). The oRPC
 * procedures in `./router.ts` are the ONLY caller — they resolve the member's
 * awards, then delegate every self-promotion / verified-fact / top-award
 * decision here. No self-service path may bypass these predicates.
 *
 * Ceiling = the member's highest AWARDED rank IN the discipline
 * (`pickTopAwardInDiscipline(...).rank.sortOrder`, BBL = BJJ). A member may only
 * create/enrich a `RankAward` at `sortOrder <= ceiling`, so they can never
 * self-promote past what they have already been awarded.
 */

/** The minimal award shape the gate needs: a discipline-scoped rank + status. */
export type GateAward = {
  id: string
  verificationStatus: RankAwardVerificationStatus
  rank: {
    sortOrder: number
    rankSystem: { disciplineId: string | null } | null
  }
}

/**
 * The member's ceiling `sortOrder` in the given discipline — the highest AWARDED
 * belt they hold. `awards` must be pre-ordered by `rank.sortOrder desc` (the
 * Prisma read order), so `pickTopAwardInDiscipline`'s "first in discipline" rule
 * yields the ceiling. Returns `null` when the member holds no award in the
 * discipline (nothing is grantable — not even white belt — until they hold one,
 * which the onboarding/import path seeds).
 */
export function ceilingSortOrder(awards: GateAward[], disciplineId: string | null): number | null {
  const top = disciplineId
    ? (awards.find(a => a.rank.rankSystem?.disciplineId === disciplineId) ?? null)
    : (awards[0] ?? null)
  return top ? top.rank.sortOrder : null
}

/**
 * May the member create/enrich a `RankAward` at `targetSortOrder`? Only at or
 * below their ceiling. A member with no discipline award has no ceiling, so
 * every rank is denied (deny-by-default — self-service can never bootstrap a
 * belt from nothing).
 */
export function isWithinCeiling(targetSortOrder: number, ceiling: number | null): boolean {
  return ceiling !== null && targetSortOrder <= ceiling
}

/** The minimal award shape the fact-edit gate needs (B1 — ADR 0035 Amendment 1). */
export type FactEditableAward = {
  source: RankAwardSource
  verificationStatus: RankAwardVerificationStatus
  awardedById: string | null
}

/**
 * May the promotion FACT (date / promoter / school) be edited? (B1 — ADR 0035
 * Amendment 1.) Under B1 there are **no UNVERIFIED awards**: a self-added backfill
 * mints VERIFIED-by-implication, and an approved promotion mints VERIFIED via
 * `mintAssertedRankAward`. So "editable" can no longer key off `UNVERIFIED` — it
 * keys off **who authored the award**:
 *
 * - **Self-added backfill** (`source === "STATED"` and NO approver actor —
 *   `awardedById === null`): the member's own enrichment; date/promoter/school are
 *   theirs to edit.
 * - **Promotion-minted** (`mintAssertedRankAward` stamps `awardedById =` the
 *   approving instructor/admin): authority-owned → read-only.
 * - **IMPORTED / DISPUTED**: authority/legacy records → read-only.
 *
 * Deny-by-default: anything that is not a clean self-added STATED award is locked.
 * The member's own promoter edit writes `awardedByPassportId` / `notes`, never
 * `awardedById`, so editing a fact never flips an award out of the editable class.
 */
export function isFactEditable(award: FactEditableAward): boolean {
  return (
    award.source === "STATED" &&
    award.awardedById === null &&
    award.verificationStatus !== "IMPORTED" &&
    award.verificationStatus !== "DISPUTED"
  )
}

/**
 * Is `rankAwardId` the member's current TOP award in the discipline? Deleting it
 * would drop the ceiling (a backdoor demotion of the whole journey), so the top
 * award is undeletable via self-service (Locked #5). Compares against the same
 * discipline-scoped ceiling award the create-gate uses.
 */
export function isTopAward(
  rankAwardId: string,
  awards: GateAward[],
  disciplineId: string | null,
): boolean {
  const top = disciplineId
    ? (awards.find(a => a.rank.rankSystem?.disciplineId === disciplineId) ?? null)
    : (awards[0] ?? null)
  return top?.id === rankAwardId
}
