import { describe, expect, test } from "bun:test";
import { emailKey, phoneKey } from "./contact-match";

// THE ONE dedupe semantic (SESSION_0582): these keys are consumed by BOTH the
// ingest preview (lib/lead-ingest.ts) and the write path (findOrCreateContact /
// commitLeadSheet via lib/lead-commit.ts). Sanitized inputs only.

describe("emailKey", () => {
  test("lowercases and trims — the case-insensitive email semantic", () => {
    expect(emailKey("  Alex.Rivera@Example.COM ")).toBe("alex.rivera@example.com");
    expect(emailKey("lead@example.com")).toBe("lead@example.com");
  });

  test("no '@' (or nothing at all) is no key", () => {
    expect(emailKey("notanemail")).toBeNull();
    expect(emailKey("   ")).toBeNull();
    expect(emailKey("")).toBeNull();
    expect(emailKey(null)).toBeNull();
    expect(emailKey(undefined)).toBeNull();
  });
});

describe("phoneKey", () => {
  test("normalizes formatting and country prefix to the last 10 digits", () => {
    expect(phoneKey("+1 (555) 010-0134")).toBe("5550100134");
    expect(phoneKey("555-010-0134")).toBe("5550100134");
    expect(phoneKey("555.010.0134")).toBe("5550100134");
  });

  test("keeps 7–10 digit locals as-is", () => {
    expect(phoneKey("010-0134")).toBe("0100134");
    expect(phoneKey("5550100134")).toBe("5550100134");
  });

  test("under 7 digits (or nothing) is no key", () => {
    expect(phoneKey("123456")).toBeNull();
    expect(phoneKey("")).toBeNull();
    expect(phoneKey(null)).toBeNull();
    expect(phoneKey(undefined)).toBeNull();
  });
});
