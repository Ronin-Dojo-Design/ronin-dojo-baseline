/**
 * Review-request message templates (SESSION_0685) — rendered verbatim from
 * docs/product/mammoth-build/templates/review-request-sequences.md. Every
 * function here is a pure string renderer; no I/O, no DB.
 *
 * DRAFT NOT APPROVED FOR SENDING: the source doc is explicitly marked draft —
 * `[PLACEHOLDER: ...]` values that doc leaves open (compliance owner, the
 * approved follow-up delay) are NOT resolved here. `ReviewRequestSenderConfig`
 * values default to their bracket placeholders (lib/reviews/config.ts) until
 * an operator configures them, so an unconfigured deploy still reads as an
 * obvious draft rather than silently inventing business copy.
 */

import type { ReviewRequestSenderConfig } from "./types";

export interface RenderedMessage {
  subject: string | null;
  body: string;
  optOutNotice: string;
}

const SMS_OPT_OUT_NOTICE = "Reply STOP to opt out.";

export function smsFirstTouch(
  customerFirstName: string,
  buildingType: string,
  config: ReviewRequestSenderConfig,
): RenderedMessage {
  return {
    subject: null,
    body:
      `Hi ${customerFirstName} — thank you for building with Mammoth. We're proud to have carried ` +
      `your ${buildingType} project through a satisfied installation. Would you share your ` +
      `experience on Google? ${config.googleReviewLink} — ${config.senderName}, Mammoth Metal ` +
      `Buildings. ${SMS_OPT_OUT_NOTICE}`,
    optOutNotice: SMS_OPT_OUT_NOTICE,
  };
}

export function smsFollowUp(
  customerFirstName: string,
  buildingType: string,
  config: ReviewRequestSenderConfig,
): RenderedMessage {
  return {
    subject: null,
    body:
      `Hi ${customerFirstName} — one quick follow-up from Mammoth. If you'd still like to share ` +
      `how your ${buildingType} project went, here's the Google link: ${config.googleReviewLink}. ` +
      `Thank you for trusting us with your build. ${SMS_OPT_OUT_NOTICE}`,
    optOutNotice: SMS_OPT_OUT_NOTICE,
  };
}

export function emailFirstTouch(
  customerFirstName: string,
  buildingType: string,
  config: ReviewRequestSenderConfig,
): RenderedMessage {
  return {
    subject: "Would you share your Mammoth build experience?",
    body: [
      `Hi ${customerFirstName},`,
      "",
      `Thank you for building with Mammoth. We're proud to have carried your ${buildingType} ` +
        "project through a satisfied installation.",
      "",
      "If you have a moment, would you share your experience on Google?",
      "",
      config.googleReviewLink,
      "",
      "Your feedback helps future customers build with confidence.",
      "",
      "Built all the way through.",
      "",
      config.senderName,
      config.senderRole,
      "Mammoth Metal Buildings",
      "",
      config.emailUnsubscribeLink,
    ].join("\n"),
    optOutNotice: config.emailUnsubscribeLink,
  };
}

export function emailFollowUp(
  customerFirstName: string,
  buildingType: string,
  config: ReviewRequestSenderConfig,
): RenderedMessage {
  return {
    subject: "One quick follow-up about your Mammoth build",
    body: [
      `Hi ${customerFirstName},`,
      "",
      `One quick follow-up: if you'd still like to share your ${buildingType} project ` +
        "experience, here's the direct Google review link:",
      "",
      config.googleReviewLink,
      "",
      "Thank you for trusting Mammoth to carry the build through.",
      "",
      config.senderName,
      "Mammoth Metal Buildings",
      "",
      config.emailUnsubscribeLink,
    ].join("\n"),
    optOutNotice: config.emailUnsubscribeLink,
  };
}

export function smsPrivateRecovery(
  customerFirstName: string,
  config: ReviewRequestSenderConfig,
): RenderedMessage {
  return {
    subject: null,
    body:
      `Hi ${customerFirstName} — thank you for telling us. We want to understand what happened ` +
      `and keep the next step owned. Please share the details here: ` +
      `${config.privateFeedbackFormLink}, or reply directly. ${config.resolutionOwnerName} will ` +
      `own the follow-up. ${SMS_OPT_OUT_NOTICE}`,
    optOutNotice: SMS_OPT_OUT_NOTICE,
  };
}

export function emailPrivateRecovery(
  customerFirstName: string,
  config: ReviewRequestSenderConfig,
): RenderedMessage {
  return {
    subject: "Let's make sure your Mammoth experience is carried through",
    body: [
      `Hi ${customerFirstName},`,
      "",
      "Thank you for telling us there's more to resolve. Please use our private feedback form " +
        "to share the details:",
      "",
      config.privateFeedbackFormLink,
      "",
      `${config.resolutionOwnerName} will own the next action in the Mammoth project record. No ` +
        "further review reminders will be sent while this concern is open.",
      "",
      config.senderName,
      "Mammoth Metal Buildings",
      "",
      config.emailUnsubscribeLink,
    ].join("\n"),
    optOutNotice: config.emailUnsubscribeLink,
  };
}
