import type { BeltCardOutput } from "~/server/belt/schemas"

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

/** A milestone media item joined to its resolved URL (Slice 5 supplies the URL). */
export type BeltMediaItem = {
  attachmentId: string
  mediaId: string
  /** One of the `MILESTONE_MEDIA_PURPOSES` (belt/instructor/certificate/competition). */
  purpose: string | null
  /** Resolved R2 URL — the `BeltCardOutput` carries only ids, so Slice 5 joins the Media rows. */
  url: string
  type?: "IMAGE" | "VIDEO" | "YOUTUBE" | "DOCUMENT"
}

/**
 * One rank's belt-journey view-model: the rank ref, plus the member's award/
 * milestone for it (`card`, `null` when they have never enriched this belt), plus
 * the resolved media URLs (the `card.milestone.media` carries ids only). The
 * `ceiling` is the whole grid's — passed once to {@link BeltJourneyGrid}.
 */
export type BeltRankViewModel = {
  rank: BeltRankRef
  /** The member's enriched card for this rank, or `null` if not yet started. */
  card: BeltCardOutput | null
  /** Resolved media for `card.milestone.media` (ids → URLs), keyed by attachmentId order. */
  media: BeltMediaItem[]
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

/** The tooltip shown on a locked card's disabled action. */
export const BELT_LOCKED_TOOLTIP = "Your instructor needs to promote you to unlock this."

/**
 * Whether the promotion FACT fields (date / promoter / school) are editable —
 * true only while the award is UNVERIFIED (mirrors `isFactEditable` on the
 * server; a verified/imported/disputed fact is authority-owned and read-only).
 * An absent card has no award yet, so there is nothing to edit → `false`.
 */
export function isFactEditableStatus(verificationStatus: string | null | undefined): boolean {
  return verificationStatus === "UNVERIFIED"
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
