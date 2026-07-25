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

import { assertConsentToSend, ConsentGuardError, type ConsentCheckInput } from "./consent";
import type { ReviewRequestStatus } from "./types";

export { ConsentGuardError };

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
