/**
 * Review-request status transitions — pure guard (SESSION_0685).
 *
 * This engine performs exactly ONE transition: draft → approved. It NEVER
 * transitions a row to `sent` — the actual send is a later wired step +
 * operator action (HOLD EXTERNAL ACTIONS). `assertApprovable` is the single
 * gate lib/reviews/actions.ts calls before writing the DB update; it throws
 * on an invalid starting state or a failed consent check and returns nothing
 * on success, so the DB write only happens once this doesn't throw.
 */

import { assertConsentToSend, type ConsentCheckInput } from "./consent";
import type { ReviewRequestStatus, ReviewSequenceStep } from "./types";

export class ReviewRequestStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReviewRequestStateError";
  }
}

export interface ReviewRequestTransitionInput extends ConsentCheckInput {
  status: ReviewRequestStatus;
}

/**
 * draft → approved, the only transition this engine performs. Throws
 * `ReviewRequestStateError` when the row isn't currently `draft` (covers both
 * re-approving an already-approved row and any attempt to move past
 * `approved`, since nothing in this codebase ever sets `sent`), and
 * `ConsentGuardError` when the consent/opt-out check fails.
 */
export function assertApprovable(input: ReviewRequestTransitionInput): void {
  if (input.status !== "draft") {
    throw new ReviewRequestStateError(
      `Review request is ${input.status}, not draft — cannot approve.`,
    );
  }
  assertConsentToSend(input);
}

/** The (status, optOut) slice of prior ReviewRequest rows the duplicate guard inspects. */
export interface PriorReviewRequest {
  status: ReviewRequestStatus;
  optOut: boolean;
}

/**
 * "Send once only" / "Only one follow-up is queued" (review-request-sequences.md
 * Automation contract + Send checklist): a project may hold at most ONE active
 * request per sequence step. Called by `generateReviewRequestDraft` with the
 * project's existing rows for that step, BEFORE it writes a new draft — throws
 * `ReviewRequestStateError` when a non-opted-out `draft`/`approved` row already
 * exists. An opted-out row doesn't block: the opt-out ended that thread, and
 * whether a NEW request may ever go out is the consent gate's call, not this
 * one's. `sent` rows are the future send step's suppression concern (nothing in
 * this codebase writes `sent` today).
 */
export function assertNoActiveDuplicate(
  step: ReviewSequenceStep,
  prior: readonly PriorReviewRequest[],
): void {
  const active = prior.some(
    (row) => !row.optOut && (row.status === "draft" || row.status === "approved"),
  );
  if (active) {
    throw new ReviewRequestStateError(
      `A ${step} review request is already drafted or approved for this project — send once only.`,
    );
  }
}
