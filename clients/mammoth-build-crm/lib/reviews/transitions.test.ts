import { describe, expect, test } from "bun:test";
import { ConsentGuardError } from "./consent";
import {
  assertApprovable,
  assertNoActiveDuplicate,
  ReviewRequestStateError,
} from "./transitions";

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

describe("assertNoActiveDuplicate (send once only — one active request per project+step)", () => {
  test("allows the first request for a step (no prior rows)", () => {
    expect(() => assertNoActiveDuplicate("first_touch", [])).not.toThrow();
  });

  test("blocks a second draft while one is already drafted for the same step", () => {
    expect(() =>
      assertNoActiveDuplicate("first_touch", [{ status: "draft", optOut: false }]),
    ).toThrow(ReviewRequestStateError);
  });

  test("blocks a new draft while an approved request is queued for the same step", () => {
    expect(() =>
      assertNoActiveDuplicate("follow_up", [{ status: "approved", optOut: false }]),
    ).toThrow(/send once only/);
  });

  test("an opted-out prior row doesn't block (that thread ended; consent gate owns the rest)", () => {
    expect(() =>
      assertNoActiveDuplicate("first_touch", [{ status: "draft", optOut: true }]),
    ).not.toThrow();
  });

  test("a `sent` prior row doesn't trip THIS guard (send-step suppression owns it)", () => {
    expect(() =>
      assertNoActiveDuplicate("first_touch", [{ status: "sent", optOut: false }]),
    ).not.toThrow();
  });
});
