/**
 * Review-request sender config (SESSION_0685).
 *
 * The business-identity + link copy the templates render (review-request-
 * sequences.md "Sender identity" + Google/private-feedback links). Not
 * secrets — plain business copy — so it's fine in `.env.example`. Values
 * default to the doc's own bracket placeholders when unset, so an
 * unconfigured deploy renders visibly-unfinished drafts (`[SENDER_NAME]`,
 * etc.) rather than inventing business copy the compliance owner hasn't
 * approved yet (the source doc is explicitly "DRAFT — NOT APPROVED FOR
 * SENDING" until `[PLACEHOLDER: COMPLIANCE OWNER]` signs off).
 */

import type { ReviewRequestSenderConfig } from "./types";

export function getReviewRequestSenderConfig(): ReviewRequestSenderConfig {
  return {
    senderName: process.env.MMB_REVIEW_SENDER_NAME || "[SENDER_NAME]",
    senderRole: process.env.MMB_REVIEW_SENDER_ROLE || "[SENDER_ROLE]",
    replyAddress: process.env.MMB_REVIEW_REPLY_ADDRESS || "[REPLY_ADDRESS]",
    googleReviewLink: process.env.MMB_GOOGLE_REVIEW_LINK || "[GOOGLE_REVIEW_LINK]",
    privateFeedbackFormLink:
      process.env.MMB_PRIVATE_FEEDBACK_FORM_LINK || "[PRIVATE_FEEDBACK_FORM_LINK]",
    resolutionOwnerName: process.env.MMB_REVIEW_RESOLUTION_OWNER_NAME || "[RESOLUTION_OWNER_NAME]",
    emailUnsubscribeLink:
      process.env.MMB_REVIEW_EMAIL_UNSUBSCRIBE_LINK || "[EMAIL_UNSUBSCRIBE_LINK]",
  };
}
