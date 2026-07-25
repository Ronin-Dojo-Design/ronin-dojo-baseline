import { describe, expect, test } from "bun:test";
import { getReviewRequestSenderConfig } from "./config";

const ENV_KEYS = [
  "MMB_REVIEW_SENDER_NAME",
  "MMB_REVIEW_SENDER_ROLE",
  "MMB_REVIEW_REPLY_ADDRESS",
  "MMB_GOOGLE_REVIEW_LINK",
  "MMB_PRIVATE_FEEDBACK_FORM_LINK",
  "MMB_REVIEW_RESOLUTION_OWNER_NAME",
  "MMB_REVIEW_EMAIL_UNSUBSCRIBE_LINK",
] as const;

describe("getReviewRequestSenderConfig", () => {
  test("env unset → the doc's bracket placeholders (visibly-unfinished, never invented copy)", () => {
    const saved = ENV_KEYS.map((key) => [key, process.env[key]] as const);
    for (const key of ENV_KEYS) {
      delete process.env[key];
    }
    try {
      expect(getReviewRequestSenderConfig()).toEqual({
        senderName: "[SENDER_NAME]",
        senderRole: "[SENDER_ROLE]",
        replyAddress: "[REPLY_ADDRESS]",
        googleReviewLink: "[GOOGLE_REVIEW_LINK]",
        privateFeedbackFormLink: "[PRIVATE_FEEDBACK_FORM_LINK]",
        resolutionOwnerName: "[RESOLUTION_OWNER_NAME]",
        emailUnsubscribeLink: "[EMAIL_UNSUBSCRIBE_LINK]",
      });
    } finally {
      for (const [key, value] of saved) {
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      }
    }
  });
});
