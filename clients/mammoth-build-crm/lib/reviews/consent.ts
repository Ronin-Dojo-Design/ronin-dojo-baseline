/**
 * Review-request consent/TCPA gate (SESSION_0685).
 *
 * The ONE place send-eligibility is decided. MUST be called (a) before a
 * draft may be approved (lib/reviews/transitions.ts) and (b) again by the
 * future send step against LIVE Contact/ReviewRequest state — never trust a
 * draft-time snapshot alone, since consent can be revoked (or an opt-out
 * recorded) between drafting and sending.
 *
 * Throws `ConsentGuardError` rather than returning a boolean so a caller
 * can't accidentally ignore a `false`.
 */

import type { ReviewChannel } from "./types";

export class ConsentGuardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConsentGuardError";
  }
}

export interface ConsentCheckInput {
  channel: ReviewChannel;
  /** `Contact.smsConsent` — explicit prior express written consent (TCPA). */
  smsConsent: boolean;
  /** `ReviewRequest.optOut` — this specific request's contact opted out. */
  optOut: boolean;
}

/**
 * Consent/TCPA gate: SMS requires prior express written consent on file;
 * an opted-out contact blocks on either channel. Email's own compliance
 * requirement (a working unsubscribe link, CAN-SPAM) is enforced by the
 * templates always carrying one — not re-checked here.
 */
export function assertConsentToSend(input: ConsentCheckInput): void {
  if (input.optOut) {
    throw new ConsentGuardError("This contact has opted out — cannot send.");
  }
  if (input.channel === "sms" && !input.smsConsent) {
    throw new ConsentGuardError(
      "SMS requires prior express written consent (TCPA) on file — cannot send without it.",
    );
  }
}
