/**
 * Review-request generator — pure planning (SESSION_0685).
 *
 * Given per-customer inputs + the sender config, renders the review-request
 * sequence (review-request-sequences.md) into a single draft message. Two
 * decisions happen here, both taken straight from the doc's "Routing rules"
 * and "Automation contract":
 *
 *   1. ROUTE — an open Resolution Task suppresses the Google ask entirely and
 *      routes to the private service-recovery branch (routing rule #2).
 *   2. CHANNEL — SMS is only ever selected when the customer both prefers it
 *      AND has explicit prior-express-written consent on file; anything else
 *      falls back to the safe default, email (deliverable requirement).
 *
 * No I/O: this module never touches the DB or a provider. The caller
 * (lib/reviews/actions.ts) persists the result as a `draft` ReviewRequest row.
 */

import {
  emailFirstTouch,
  emailFollowUp,
  emailPrivateRecovery,
  smsFirstTouch,
  smsFollowUp,
  smsPrivateRecovery,
  type RenderedMessage,
} from "./templates";
import type {
  RenderedReviewRequest,
  ReviewChannel,
  ReviewConsentBasis,
  ReviewRequestCustomerInput,
  ReviewRequestRoute,
  ReviewRequestSenderConfig,
  ReviewSequenceStep,
} from "./types";

/**
 * SMS requires the customer to both prefer it AND carry explicit consent —
 * this is the ONLY place channel selection happens, so the generator can
 * never produce an SMS draft for an unconsented contact.
 */
function resolveChannel(customer: ReviewRequestCustomerInput): ReviewChannel {
  if (customer.preferredChannel === "sms" && customer.smsConsent) {
    return "sms";
  }
  return "email";
}

function consentBasisFor(channel: ReviewChannel): ReviewConsentBasis {
  return channel === "sms" ? "sms_prior_express_written_consent" : "email_business_relationship";
}

function renderMessage(
  route: ReviewRequestRoute,
  channel: ReviewChannel,
  step: ReviewSequenceStep,
  customer: ReviewRequestCustomerInput,
  config: ReviewRequestSenderConfig,
): RenderedMessage {
  if (route === "private_recovery") {
    return channel === "sms"
      ? smsPrivateRecovery(customer.customerFirstName, config)
      : emailPrivateRecovery(customer.customerFirstName, config);
  }
  if (channel === "sms") {
    return step === "first_touch"
      ? smsFirstTouch(customer.customerFirstName, customer.buildingType, config)
      : smsFollowUp(customer.customerFirstName, customer.buildingType, config);
  }
  return step === "first_touch"
    ? emailFirstTouch(customer.customerFirstName, customer.buildingType, config)
    : emailFollowUp(customer.customerFirstName, customer.buildingType, config);
}

/**
 * Render one review-request draft. `step` defaults to `first_touch` — the
 * completed-job trigger's message; `follow_up` exists so a later scheduler
 * can reuse the same renderer for the single documented follow-up touch
 * (review-request-sequences.md "One polite follow-up") without a second
 * generator. Building that scheduler is out of this lane's scope.
 */
export function planReviewRequest(
  customer: ReviewRequestCustomerInput,
  config: ReviewRequestSenderConfig,
  step: ReviewSequenceStep = "first_touch",
): RenderedReviewRequest {
  const route: ReviewRequestRoute = customer.hasOpenResolutionTask
    ? "private_recovery"
    : "google_request";
  const channel = resolveChannel(customer);
  const message = renderMessage(route, channel, step, customer, config);

  return {
    route,
    sequenceStep: step,
    channel,
    consentBasis: consentBasisFor(channel),
    subject: message.subject,
    body: message.body,
    optOutNotice: message.optOutNotice,
  };
}
