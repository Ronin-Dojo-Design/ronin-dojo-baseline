import { describe, expect, test } from "bun:test";
import { planReviewRequest } from "./generator";
import type { ReviewRequestCustomerInput, ReviewRequestSenderConfig } from "./types";

const CONFIG: ReviewRequestSenderConfig = {
  senderName: "Michael Flores",
  senderRole: "Owner",
  replyAddress: "michael@mammoth.build",
  googleReviewLink: "https://g.page/r/example/review",
  privateFeedbackFormLink: "https://mammoth.build/feedback",
  resolutionOwnerName: "Michael Flores",
  emailUnsubscribeLink: "https://mammoth.build/unsubscribe",
};

const customer = (overrides: Partial<ReviewRequestCustomerInput> = {}): ReviewRequestCustomerInput => ({
  customerFirstName: "Alex",
  buildingType: "60x100 Agricultural",
  smsConsent: false,
  preferredChannel: null,
  hasOpenResolutionTask: false,
  ...overrides,
});

describe("planReviewRequest", () => {
  test("defaults to the email channel + google_request route with no consent/preference on file", () => {
    const rendered = planReviewRequest(customer(), CONFIG);

    expect(rendered.channel).toBe("email");
    expect(rendered.route).toBe("google_request");
    expect(rendered.consentBasis).toBe("email_business_relationship");
    expect(rendered.sequenceStep).toBe("first_touch");
    expect(rendered.subject).toBe("Would you share your Mammoth build experience?");
    expect(rendered.body).toContain("Hi Alex,");
    expect(rendered.body).toContain("60x100 Agricultural");
    expect(rendered.body).toContain(CONFIG.googleReviewLink);
    expect(rendered.optOutNotice).toBe(CONFIG.emailUnsubscribeLink);
  });

  test("selects SMS only when BOTH preferred and consented — never on preference alone", () => {
    const preferredNoConsent = planReviewRequest(
      customer({ preferredChannel: "sms", smsConsent: false }),
      CONFIG,
    );
    expect(preferredNoConsent.channel).toBe("email");

    const preferredAndConsented = planReviewRequest(
      customer({ preferredChannel: "sms", smsConsent: true }),
      CONFIG,
    );
    expect(preferredAndConsented.channel).toBe("sms");
    expect(preferredAndConsented.consentBasis).toBe("sms_prior_express_written_consent");
    expect(preferredAndConsented.subject).toBeNull();
    expect(preferredAndConsented.body).toContain("Reply STOP to opt out.");
    expect(preferredAndConsented.optOutNotice).toBe("Reply STOP to opt out.");
  });

  test("consent alone (no channel preference) still defaults to email", () => {
    const rendered = planReviewRequest(customer({ smsConsent: true, preferredChannel: null }), CONFIG);
    expect(rendered.channel).toBe("email");
  });

  test("an open Resolution Task routes to private_recovery and suppresses the Google ask", () => {
    const rendered = planReviewRequest(customer({ hasOpenResolutionTask: true }), CONFIG);

    expect(rendered.route).toBe("private_recovery");
    expect(rendered.body).not.toContain(CONFIG.googleReviewLink);
    expect(rendered.body).toContain(CONFIG.privateFeedbackFormLink);
    expect(rendered.subject).toBe("Let's make sure your Mammoth experience is carried through");
  });

  test("private_recovery over SMS still carries the opt-out notice, never the Google link", () => {
    const rendered = planReviewRequest(
      customer({ hasOpenResolutionTask: true, preferredChannel: "sms", smsConsent: true }),
      CONFIG,
    );

    expect(rendered.route).toBe("private_recovery");
    expect(rendered.channel).toBe("sms");
    expect(rendered.body).not.toContain(CONFIG.googleReviewLink);
    expect(rendered.body).toContain("Reply STOP to opt out.");
  });

  test("renders the follow_up step's distinct copy when asked", () => {
    const rendered = planReviewRequest(customer(), CONFIG, "follow_up");

    expect(rendered.sequenceStep).toBe("follow_up");
    expect(rendered.subject).toBe("One quick follow-up about your Mammoth build");
    expect(rendered.body).toContain("One quick follow-up");
  });

  test("unconfigured sender config renders visible bracket placeholders, never invented copy", () => {
    const unconfigured: ReviewRequestSenderConfig = {
      senderName: "[SENDER_NAME]",
      senderRole: "[SENDER_ROLE]",
      replyAddress: "[REPLY_ADDRESS]",
      googleReviewLink: "[GOOGLE_REVIEW_LINK]",
      privateFeedbackFormLink: "[PRIVATE_FEEDBACK_FORM_LINK]",
      resolutionOwnerName: "[RESOLUTION_OWNER_NAME]",
      emailUnsubscribeLink: "[EMAIL_UNSUBSCRIBE_LINK]",
    };
    const rendered = planReviewRequest(customer(), unconfigured);
    expect(rendered.body).toContain("[GOOGLE_REVIEW_LINK]");
    expect(rendered.body).toContain("[EMAIL_UNSUBSCRIBE_LINK]");
  });
});
