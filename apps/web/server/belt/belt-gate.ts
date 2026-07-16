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
 * May the promotion FACT (date / promoter / school) be fully edited by the OWNER?
 * (B1 — ADR 0035 Amendment 1; loosened SESSION_0540.) The rule keys off **who
 * authored the award** and **whether it is still unverified**:
 *
 * - **Locked (authority-owned truth)** — an approver stamped it (`awardedById !==
 *   null` → instructor-VERIFIED / promotion-minted), or it is **IMPORTED** legacy
 *   truth, or **DISPUTED** and under review. Never member-editable.
 * - **Fully editable by the owner** — a **self-added STATED backfill**, OR **any
 *   award still standing UNVERIFIED** (SESSION_0540: the member may freely revise
 *   their own un-verified belt, not just fill blanks). An auto-verified
 *   same-promoter backfill (STATED, no approver stamp) stays editable; a
 *   differently-authored / authority award does not.
 *
 * The member's own promoter edit writes `awardedByPassportId` / `notes`, never
 * `awardedById`, so editing a fact never flips an award out of the editable class.
 */
export function isFactEditable(award: FactEditableAward): boolean {
  if (award.awardedById !== null) return false
  if (award.verificationStatus === "IMPORTED" || award.verificationStatus === "DISPUTED") {
    return false
  }
  return award.source === "STATED" || award.verificationStatus === "UNVERIFIED"
}

/**
 * The atomic transition for a member-owned **backfill** when its promoter fact is edited
 * (SESSION_0540, narrowed by D-046). Pure so the server-only proposal core can keep the fact,
 * trust, review, sync, and audit writes in one transaction.
 *
 * Every promoter is now a Passport FK: a REGISTERED pick, or — for a free-typed coach — a
 * find-or-create RECRUITED-COACH PLACEHOLDER Passport (the recruited-coach identity, see
 * `ensurePromoterPlaceholder`). So the decision can no longer branch on "FK vs freetext"; it
 * branches on WHO the promoter Passport is.
 *
 * D-046 is deliberately narrower than the old candidate-vs-anchor rule:
 * - same active Passport → **no_change** (post-approval B→B stays idempotent even if anchor A remains);
 * - established active A → different established B → **propose** (B never overwrites A directly);
 * - a free-typed recruited-coach candidate → **keep_unverified** immediately (ADR 0047 exception);
 * - null/recruited-placeholder active provenance is not established A, so an established candidate
 *   is an initial/unaccepted fact: it auto-verifies only when it matches the authority anchor,
 *   otherwise it stays unverified without inventing an A→B proposal;
 * - member clear is rejected by the authenticated adapter before reaching this decision.
 */
export type BackfillPromoterTransition = "no_change" | "verify" | "propose" | "keep_unverified"

export function decideBackfillPromoterTransition({
  currentPromoterPassportId,
  currentPromoterIsRecruitedCoachPlaceholder,
  candidatePromoterPassportId,
  candidatePromoterIsRecruitedCoachPlaceholder,
  anchorPromoterPassportId,
}: {
  currentPromoterPassportId: string | null
  currentPromoterIsRecruitedCoachPlaceholder: boolean
  candidatePromoterPassportId: string
  candidatePromoterIsRecruitedCoachPlaceholder: boolean
  anchorPromoterPassportId: string | null
}): BackfillPromoterTransition {
  if (currentPromoterPassportId === candidatePromoterPassportId) return "no_change"
  if (candidatePromoterIsRecruitedCoachPlaceholder) return "keep_unverified"
  if (currentPromoterPassportId && !currentPromoterIsRecruitedCoachPlaceholder) return "propose"
  if (anchorPromoterPassportId === candidatePromoterPassportId) return "verify"
  return "keep_unverified"
}

/**
 * The award shape PER-FACT editability needs: authorship (the `isFactEditable`
 * fields) plus the current value of each of the three promotion facts.
 */
export type FactValueAward = FactEditableAward & {
  awardedAt: Date | null
  awardedByPassportId: string | null
  /** Freetext promoter (the member-typed name) — `null` when unset. */
  notes: string | null
  organizationId: string | null
  /** Freetext school — `null` when unset. */
  location: string | null
}

/** The three promotion facts, as the fact-edit input groups them. */
export type FactKey = "awardedAt" | "promoter" | "school"

export type PerFactEditability = Record<FactKey, boolean>

/**
 * WHY the facts are (or aren't) editable — drives the UI copy:
 * - `SELF_BACKFILL`      — member-authored award: every fact fully editable.
 * - `AUTHORITY_PARTIAL`  — authority-owned, some facts EMPTY: those are fillable.
 * - `AUTHORITY_LOCKED`   — authority-owned, every fact filled (or DISPUTED): all locked.
 */
export type FactEditabilityReason = "SELF_BACKFILL" | "AUTHORITY_PARTIAL" | "AUTHORITY_LOCKED"

export type FactEditability = { facts: PerFactEditability; reason: FactEditabilityReason }

const isBlank = (value: string | null): boolean => value === null || value.trim() === ""

/**
 * Per-fact editability for the award OWNER (SESSION_0501 ratified policy — the
 * fill-blanks amendment to B1):
 *
 * - A **self-added STATED backfill** keeps today's FULL editability (unchanged —
 *   `isFactEditable`): set, overwrite, clear.
 * - On an **authority-owned** award (promotion-minted / IMPORTED / EARNED) the owner
 *   may FILL a fact that is currently EMPTY, but may NEVER modify or clear a fact
 *   that already has a value. "Empty" is per-fact:
 *     - date:     `awardedAt` is null
 *     - promoter: no `awardedByPassportId` AND no freetext `notes`
 *     - school:   no `organizationId` AND no freetext `location`
 * - **DISPUTED** awards are contested records under review — fully locked for the
 *   owner (deny-by-default; the ratified policy names IMPORTED/authority-owned, not
 *   disputed). Admins edit via the admin path, which bypasses this gate entirely.
 *
 * Server-authoritative: the router enforces this per requested fact, and the card
 * output carries the same matrix so the client only renders what the server says.
 */
export function memberFactEditability(award: FactValueAward): FactEditability {
  if (isFactEditable(award)) {
    return { facts: { awardedAt: true, promoter: true, school: true }, reason: "SELF_BACKFILL" }
  }
  if (award.verificationStatus === "DISPUTED") {
    return {
      facts: { awardedAt: false, promoter: false, school: false },
      reason: "AUTHORITY_LOCKED",
    }
  }
  const facts: PerFactEditability = {
    awardedAt: award.awardedAt === null,
    promoter: award.awardedByPassportId === null && isBlank(award.notes),
    school: award.organizationId === null && isBlank(award.location),
  }
  const anyEditable = facts.awardedAt || facts.promoter || facts.school
  return { facts, reason: anyEditable ? "AUTHORITY_PARTIAL" : "AUTHORITY_LOCKED" }
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
