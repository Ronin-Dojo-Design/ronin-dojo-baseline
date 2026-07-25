import { describe, expect, test } from "bun:test";
import { ConsentGuardError } from "./consent";
import { assertApprovable, ReviewRequestStateError } from "./transitions";

describe("assertApprovable (draft -> approved, the ONE transition this engine performs)", () => {
  test("approves a draft, consented, non-opted-out email request", () => {
    expect(() =>
      assertApprovable({ status: "draft", channel: "email", smsConsent: false, optOut: false }),
    ).not.toThrow();
  });

  test("approves a draft, consented SMS request", () => {
    expect(() =>
      assertApprovable({ status: "draft", channel: "sms", smsConsent: true, optOut: false }),
    ).not.toThrow();
  });

  test("refuses to re-approve an already-approved request", () => {
    expect(() =>
      assertApprovable({ status: "approved", channel: "email", smsConsent: false, optOut: false }),
    ).toThrow(ReviewRequestStateError);
  });

  test("refuses to approve a `sent` request — this engine never produces one, but the guard still holds", () => {
    expect(() =>
      assertApprovable({ status: "sent", channel: "email", smsConsent: false, optOut: false }),
    ).toThrow(ReviewRequestStateError);
  });

  test("blocks approval of a draft SMS request with no consent on file", () => {
    expect(() =>
      assertApprovable({ status: "draft", channel: "sms", smsConsent: false, optOut: false }),
    ).toThrow(ConsentGuardError);
  });

  test("blocks approval once the contact has opted out, even if it's still a draft", () => {
    expect(() =>
      assertApprovable({ status: "draft", channel: "email", smsConsent: false, optOut: true }),
    ).toThrow(ConsentGuardError);
  });

  test("the state check runs before the consent check (wrong-state message wins)", () => {
    expect(() =>
      assertApprovable({ status: "approved", channel: "sms", smsConsent: false, optOut: false }),
    ).toThrow(/not draft/);
  });
});
