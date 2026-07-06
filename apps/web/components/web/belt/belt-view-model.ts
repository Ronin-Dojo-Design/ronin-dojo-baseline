import type { BeltCardOutput } from "~/server/belt/schemas"

/**
 * One render-ready milestone media item, projected off {@link BeltCardOutput}.
 * The card now carries the resolved `url`/`type` directly (SESSION_0492 cleanup —
 * the server joins the `Media` rows), so there is no separate media array to
 * reconcile. Derived from the card shape so it can never drift from the read model.
 */
export type BeltCardMedia = NonNullable<BeltCardOutput["milestone"]>["media"][number]

/**
 * Belt-journey view-model + pure presentation logic (Slice 4 — Petey Plan 0477).
 *
 * The belt UI is presentation-only: Slice 5 loads the member's discipline rank
 * ladder + their `BeltCardOutput`s + the ceiling on the server and hands them
 * down as {@link BeltRankViewModel}s. Every state decision (status badge, lock,
 * white-belt special-case) is a PURE function here so it is unit-testable without
 * a DOM — mirroring the `belt-gate` predicates on the server side.
 *
 * No Prisma import: the card components are `"use client"` (importing the Prisma
 * client into client chrome breaks Turbopack — see the
 * `prisma-in-browser-via-client-chrome` memory).
 */

/** A discipline rank in the ladder, reduced to the presentation fields. */
export type BeltRankRef = {
  id: string
  name: string
  /** `Rank.colorHex` — drives `--rank-color`; never hardcoded (ADR 0022). */
  colorHex: string | null
  sortOrder: number
}

/**
 * One rank's belt-journey view-model: the rank ref, plus the member's award/
 * milestone for it (`card`, `null` when they have never enriched this belt). The
 * card's `milestone.media` now carries render-ready `url`/`type` (SESSION_0492 —
 * no separate media array). The `ceiling` is the whole grid's — passed once to
 * {@link BeltJourneyGrid}.
 */
export type BeltRankViewModel = {
  rank: BeltRankRef
  /** The member's enriched card for this rank, or `null` if not yet started. */
  card: BeltCardOutput | null
}

/** The three surfaced states of a belt card. */
export type BeltCardStatus = "add" | "locked" | "completed"

/**
 * A belt is LOCKED when its rank sits above the member's awarded ceiling — the
 * self-promotion invariant (Locked #5): you cannot enrich a belt you have not
 * been awarded. `ceiling` is a `sortOrder`; `null` means the member holds no
 * discipline award, so every belt is locked.
 */
export function isRankLocked(rankSortOrder: number, ceiling: number | null): boolean {
  return ceiling === null || rankSortOrder > ceiling
}

/**
 * May the member REQUEST a promotion for this belt? (B1 — ADR 0035 Amendment 1.)
 * A locked (above-ceiling) belt is exactly one the member has NOT been awarded, so
 * it routes to a `RANK_PROMOTION` claim (`promotion.submit`) rather than a self-mint.
 * A belt at/below the ceiling is enrichable, not requestable — self-promotion stays
 * structurally impossible (the ceiling only rises through an approved promotion).
 *
 * This is exactly the `locked` condition; it is named separately so the card's
 * intent reads clearly (a locked card is now an actionable promotion CTA, not a
 * dead-end) and so the predicate is unit-tested against the promotion flow.
 */
export function canRequestPromotion(rankSortOrder: number, ceiling: number | null): boolean {
  return isRankLocked(rankSortOrder, ceiling)
}

/**
 * Derive the card's status badge:
 * - `locked`   — above the ceiling (takes precedence; a locked belt is never editable);
 * - `completed`— unlocked AND the member has a card with a story or any media;
 * - `add`      — unlocked but empty (no card, or a card with no enrichment yet).
 *
 * "Completed" reflects member enrichment, not verification — the milestone is
 * member-owned and never "verified" (Locked #1).
 */
export function deriveBeltStatus(vm: BeltRankViewModel, ceiling: number | null): BeltCardStatus {
  if (isRankLocked(vm.rank.sortOrder, ceiling)) return "locked"
  const milestone = vm.card?.milestone
  const hasStory = Boolean(milestone?.story && milestone.story.trim().length > 0)
  const hasMedia = (milestone?.media.length ?? 0) > 0
  return hasStory || hasMedia ? "completed" : "add"
}

/** Presentation copy for each status badge. */
export const BELT_STATUS_LABEL: Record<BeltCardStatus, string> = {
  add: "Add",
  locked: "Locked",
  completed: "Completed",
}

/** The card's server-computed per-fact editability matrix (SESSION_0501). */
export type CardFactEditability = BeltCardOutput["factEditability"]

const NO_FACTS_EDITABLE: CardFactEditability = { awardedAt: false, promoter: false, school: false }

/**
 * PER-FACT editability of the promotion facts (date / promoter / school) for a
 * card — SESSION_0501 fill-blanks policy. The server computes this authoritatively
 * (`memberFactEditability` in `belt-gate.ts`: a self-added backfill is fully
 * editable; on an authority-owned award only the EMPTY facts are fillable; a
 * filled authority fact is locked). The client just reflects it, per field. An
 * absent card has no award to edit → all locked.
 */
export function cardFactEditability(card: BeltCardOutput | null | undefined): CardFactEditability {
  return card?.factEditability ?? NO_FACTS_EDITABLE
}

/**
 * Is this the white belt (the ladder's lowest rank, `sortOrder` 0/1)? The white
 * belt is a special-case in the UI: the date field asks "when did you start
 * training?" and the promoter/location fields are hidden (you don't get promoted
 * TO white belt). Detected structurally as the minimum sortOrder in the ladder so
 * no belt name is hardcoded.
 */
export function isWhiteBelt(rankSortOrder: number, minSortOrder: number): boolean {
  return rankSortOrder === minSortOrder
}

/** The date-field label — white-belt asks about training start, others about promotion. */
export function beltDateLabel(isWhite: boolean): string {
  return isWhite ? "When did you start training in BJJ?" : "Promotion date"
}
