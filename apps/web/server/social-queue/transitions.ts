import type {
  SocialConsentBasisLiteral,
  SocialQueueStatusLiteral,
} from "~/server/social-queue/schema"

/**
 * The social approval-queue status machine + consent gate (SESSION_0686,
 * social-flywheel-approval-queue-spec-draft.md §2.3/§3). Pure — no IO, unit-tested in
 * isolation; consumers: the oRPC router (`server/orpc/routers/social-queue.ts`) for writes +
 * the row-actions UI (transition-aware buttons).
 *
 * ═══ THE TWO NON-NEGOTIABLES ═══
 *
 * 1. NOTHING AUTO-PUBLISHES. The machine deliberately STOPS at `APPROVED` ("ready to
 *    publish"). `PUBLISHED` is a reserved terminal state for a LATER wired publish step behind
 *    operator authorization — the transition map below has NO edge into it, so no v1 code path
 *    (approve included) can ever mark an item published. A rejected item is terminal: it can
 *    never re-enter the flow, so a rejected item can never publish.
 *
 * 2. CONSENT IS A PRECONDITION, NOT AN EDITORIAL HABIT. Every item carries a consent basis
 *    recorded at enqueue time; person-centric items (`MEMBER_OPT_IN`) are RE-verified against
 *    the live subject at approve time — enqueue-time consent is necessary, not sufficient
 *    (spec §2.3 "revocation is honored at every later gate").
 */

/**
 * Allowed transitions (spec §3): `DRAFT → APPROVED` · `DRAFT → REJECTED` ·
 * `APPROVED → REJECTED` (pulled before publish, incl. consent revocation).
 *
 * Deliberate absences:
 * - NO edge into `PUBLISHED` — v1 has no publish action (non-negotiable #1).
 * - `REJECTED` maps to [] — rejection is terminal; a replayed event never resurrects a
 *   rejected draft (the enqueue dedupe key conflict-noops against the existing row).
 * - `PUBLISHED` maps to [] — future-proofing: even once a publisher exists, a published item
 *   never re-enters the review flow.
 */
export const SOCIAL_QUEUE_TRANSITIONS: Record<
  SocialQueueStatusLiteral,
  readonly SocialQueueStatusLiteral[]
> = {
  DRAFT: ["APPROVED", "REJECTED"],
  APPROVED: ["REJECTED"],
  REJECTED: [],
  PUBLISHED: [],
}

/** Is `from → to` a legal status transition? Unknown states fail closed. */
export const canTransition = (from: string, to: SocialQueueStatusLiteral): boolean => {
  const allowed = SOCIAL_QUEUE_TRANSITIONS[from as SocialQueueStatusLiteral]
  return allowed !== undefined && allowed.includes(to)
}

/** The statuses a reject may act on — derived from the map, never restated. */
export const REJECTABLE_STATUSES = (
  Object.keys(SOCIAL_QUEUE_TRANSITIONS) as SocialQueueStatusLiteral[]
).filter(status => canTransition(status, "REJECTED"))

/** Machine-set rejection reason when the live consent re-check fails (spec §2.3). */
export const CONSENT_REVOKED_REASON = "consent-revoked"

export type ApprovalConsentResult =
  | { ok: true }
  | {
      ok: false
      /**
       * - `consent-revoked` — no verifiable affirmative consent exists RIGHT NOW: the subject
       *   Passport is gone, no longer account-claimed, or does not hold the affirmative
       *   `allowSocialCelebration` opt-in (fork F2, RATIFIED at SESSION_0705 — opt-in,
       *   default OFF). The item is auto-flipped to REJECTED (spec §2.3).
       * - `unknown-basis` — an unrecognized consent basis. Fails closed, item stays DRAFT.
       *
       * (`consent-unratified` — the pre-F2 "mechanism doesn't exist yet" holding state —
       * retired at SESSION_0705 when the opt-in column landed; no code path can emit it.)
       */
      reason: "consent-revoked" | "unknown-basis"
    }

/**
 * THE CONSENT GATE, re-run live at approve time (spec §2.3).
 *
 * CONSENT BASES:
 * - `AGGREGATE_ONLY` — aggregate numbers only (e.g. "100th verified black belt"); names no
 *   person and draws no member data → no per-person consent legs to verify.
 * - `OWNED_CONTENT` — brand-owned editorial (staff blog post); no member is the subject.
 * - `MEMBER_OPT_IN` — person-centric (claim-verified / belt-promotion celebrations). ALL legs
 *   must hold at approve time:
 *     1. the item carries a subject Passport (structural — person-centric without a subject
 *        fails closed as revoked);
 *     2. that Passport still exists and is ACCOUNT-CLAIMED (`userId != null`) — placeholder
 *        Passports are structurally excluded (spec §2.3 leg 1): an accountless person cannot
 *        have consented to anything;
 *     3. the subject holds the AFFIRMATIVE publicity opt-in — fork F2, RATIFIED at
 *        SESSION_0705: `Passport.allowSocialCelebration`, explicit opt-in, DEFAULT OFF,
 *        editable only in the PassportEditor (ADR 0025). `false` means "no verifiable
 *        affirmative consent right now" → consent-revoked (flywheel ground rule 2:
 *        revocation — including never-opting-in — is honored at every later gate). This is
 *        the exact one-line swap 0686 pre-specified for ratification.
 */
export const evaluateApprovalConsent = (input: {
  consentBasis: string
  /** The LIVE subject Passport (`null` = item has no passportId, or the row is gone). */
  passport: { userId: string | null; allowSocialCelebration: boolean } | null
}): ApprovalConsentResult => {
  const basis = input.consentBasis as SocialConsentBasisLiteral

  if (basis === "AGGREGATE_ONLY" || basis === "OWNED_CONTENT") {
    return { ok: true }
  }

  if (basis === "MEMBER_OPT_IN") {
    // Legs 1+2: a live, account-claimed subject. A deleted or unclaimed (placeholder) subject
    // = consent structurally revoked → the caller auto-flips the item to REJECTED.
    if (!input.passport || input.passport.userId === null) {
      return { ok: false, reason: "consent-revoked" }
    }

    // Leg 3: the affirmative publicity opt-in (fork F2, ratified). No opt-in bit → no
    // verifiable consent → revoked. Read LIVE by every caller, so opting out later revokes.
    if (input.passport.allowSocialCelebration !== true) {
      return { ok: false, reason: "consent-revoked" }
    }

    return { ok: true }
  }

  // Unknown basis: fail closed — never approve what we cannot classify.
  return { ok: false, reason: "unknown-basis" }
}
