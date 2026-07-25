/**
 * Review-request engine — domain types (SESSION_0685).
 *
 * Mirrors the Prisma enums 1:1 (prisma/schema.prisma "Review-request engine")
 * as plain string unions so the pure lib/reviews/* modules don't import the
 * generated Prisma client (keeps generator/consent/transitions hermetic and
 * independently testable — see lib/types.ts for the same pattern on Project).
 */

export type ReviewRequestStatus = "draft" | "approved" | "sent";

export type ReviewChannel = "email" | "sms";

export type ReviewSequenceStep = "first_touch" | "follow_up";

export type ReviewRequestRoute = "google_request" | "private_recovery";

export type ReviewConsentBasis =
  | "email_business_relationship"
  | "sms_prior_express_written_consent";

/**
 * The business-identity copy the templates render (review-request-sequences.md
 * "Sender identity" + link placeholders). Sourced from env (lib/reviews/config.ts)
 * rather than hardcoded so it's configurable per deploy without a code change.
 */
export interface ReviewRequestSenderConfig {
  senderName: string;
  senderRole: string;
  replyAddress: string;
  googleReviewLink: string;
  privateFeedbackFormLink: string;
  resolutionOwnerName: string;
  emailUnsubscribeLink: string;
}

/** The per-customer inputs the generator needs — deliberately DB-shape-free. */
export interface ReviewRequestCustomerInput {
  customerFirstName: string;
  buildingType: string;
  /** `Contact.smsConsent` — explicit prior express written consent (TCPA). */
  smsConsent: boolean;
  /** The customer's known channel preference, if any; null = no preference on file. */
  preferredChannel: ReviewChannel | null;
  /** True when the project carries an open Resolution Task — routes to the
   * private service-recovery branch and suppresses the Google ask entirely. */
  hasOpenResolutionTask: boolean;
}

export interface RenderedReviewRequest {
  route: ReviewRequestRoute;
  sequenceStep: ReviewSequenceStep;
  channel: ReviewChannel;
  consentBasis: ReviewConsentBasis;
  subject: string | null;
  body: string;
  optOutNotice: string;
}
