import { describe, expect, test } from "bun:test";
import { assertConsentToSend, ConsentGuardError } from "./consent";

describe("assertConsentToSend (the consent/TCPA guard)", () => {
  test("blocks SMS without prior express written consent on file", () => {
    expect(() =>
      assertConsentToSend({ channel: "sms", smsConsent: false, optOut: false }),
    ).toThrow(ConsentGuardError);
  });

  test("allows SMS when consent is present and no opt-out is recorded", () => {
    expect(() =>
      assertConsentToSend({ channel: "sms", smsConsent: true, optOut: false }),
    ).not.toThrow();
  });

  test("email never requires smsConsent", () => {
    expect(() =>
      assertConsentToSend({ channel: "email", smsConsent: false, optOut: false }),
    ).not.toThrow();
  });

  test("blocks ANY channel once the contact has opted out — even a consented SMS contact", () => {
    expect(() => assertConsentToSend({ channel: "email", smsConsent: true, optOut: true })).toThrow(
      ConsentGuardError,
    );
    expect(() => assertConsentToSend({ channel: "sms", smsConsent: true, optOut: true })).toThrow(
      ConsentGuardError,
    );
  });

  test("opt-out is checked before the consent check (fails on the opt-out message)", () => {
    expect(() =>
      assertConsentToSend({ channel: "sms", smsConsent: false, optOut: true }),
    ).toThrow(/opted out/);
  });
});
