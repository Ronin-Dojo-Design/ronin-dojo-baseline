import { describe, expect, test } from "bun:test";
import { countLeadSources, LEAD_SOURCES, leadSourceLabel, normalizeLeadSource } from "./lead-source";

describe("countLeadSources", () => {
  test("tallies canonical values by bucket", () => {
    const counts = countLeadSources(["referral", "referral", "web_form", "other"]);
    expect(counts).toEqual({ referral: 2, web_form: 1, other: 1 });
  });

  test("omits buckets with zero items", () => {
    const counts = countLeadSources(["phone"]);
    expect(counts.phone).toBe(1);
    expect(counts.email).toBeUndefined();
    expect(counts.referral).toBeUndefined();
  });

  test("empty input tallies nothing", () => {
    expect(countLeadSources([])).toEqual({});
  });

  test("routes stray/free-text spellings through normalizeLeadSource (one vocabulary)", () => {
    const counts = countLeadSources(["Word of mouth", "webform", "Facebook", null, undefined, ""]);
    // "Word of mouth" -> referral, "webform" -> web_form, "Facebook" (unrecognized) -> other,
    // null/undefined/"" -> other (empty maps silently, per normalizeLeadSource's own contract).
    expect(counts).toEqual({ referral: 1, web_form: 1, other: 4 });
  });

  test("every LEAD_SOURCES value is a valid lookup key for leadSourceLabel", () => {
    for (const value of LEAD_SOURCES) {
      expect(typeof leadSourceLabel(value)).toBe("string");
    }
  });

  test("cross-check against normalizeLeadSource on a mixed sample", () => {
    const sample = ["referral", "trade show", "unknown-spelling"];
    const counts = countLeadSources(sample);
    const expected: Record<string, number> = {};
    for (const raw of sample) {
      const { value } = normalizeLeadSource(raw);
      expected[value] = (expected[value] ?? 0) + 1;
    }
    expect(counts).toEqual(expected);
  });
});
