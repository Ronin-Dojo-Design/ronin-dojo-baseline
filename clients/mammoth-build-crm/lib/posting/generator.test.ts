import { describe, expect, test } from "bun:test";
import { extractPlaceholders, hasUnresolvedPlaceholders, renderPostingTemplate } from "./generator";
import { POSTING_PLATFORMS, POSTING_TEMPLATES } from "./templates";

describe("extractPlaceholders", () => {
  test("finds every distinct bracket token, in first-seen order", () => {
    expect(extractPlaceholders("[A] and [B] and [A] again")).toEqual(["[A]", "[B]"]);
  });

  test("returns an empty array when there are no placeholders", () => {
    expect(extractPlaceholders("plain text, no tokens")).toEqual([]);
  });
});

describe("hasUnresolvedPlaceholders", () => {
  test("is true while a bracket token remains", () => {
    expect(hasUnresolvedPlaceholders("Completed: [BUILDING_TYPE].")).toBe(true);
  });

  test("is false once every token is filled", () => {
    expect(hasUnresolvedPlaceholders("Completed: Auto Service.")).toBe(false);
  });

  test("is stable across repeated calls on the same body (no shared-regex lastIndex bleed)", () => {
    const body = "Completed: [BUILDING_TYPE] in [PUBLISHABLE_GENERAL_LOCATION].";
    expect(hasUnresolvedPlaceholders(body)).toBe(true);
    expect(hasUnresolvedPlaceholders(body)).toBe(true);
    expect(hasUnresolvedPlaceholders(body)).toBe(true);
  });
});

describe("renderPostingTemplate", () => {
  test("fills every placeholder it has a context value for", () => {
    const rendered = renderPostingTemplate("completed_build", "google_business_profile", {
      APPROVED_PROJECT_DETAIL: "sequenced delivery, zero jobsite surprises",
      BUILDING_TYPE: "Auto Service",
      CALL_TO_ACTION_URL: "https://mammothmb.com/start",
    });
    expect(rendered.body).toBe(
      "Completed Auto Service: sequenced delivery, zero jobsite surprises. Mammoth carries projects through delivery and a satisfied installation. Start your build conversation: https://mammothmb.com/start",
    );
    expect(rendered.missingPlaceholders).toEqual([]);
  });

  test("leaves an unfilled placeholder literal and reports it — never guesses", () => {
    const rendered = renderPostingTemplate("before_after", "instagram", {
      BUILDING_TYPE: "Auto Service",
      PUBLISHABLE_GENERAL_LOCATION: "Boise, ID",
      // APPROVED_PROJECT_DETAIL and APPROVED_HASHTAGS deliberately omitted.
    });
    expect(rendered.body).toContain("[APPROVED_PROJECT_DETAIL]");
    expect(rendered.body).toContain("[APPROVED_HASHTAGS]");
    expect(rendered.missingPlaceholders).toEqual([
      "[APPROVED_PROJECT_DETAIL]",
      "[APPROVED_HASHTAGS]",
    ]);
  });

  test("treats a blank-string context value the same as missing (never renders blank copy)", () => {
    const rendered = renderPostingTemplate("faq_answer", "facebook", {
      BUILDING_TYPE: "Agricultural",
      CALL_TO_ACTION_URL: "https://mammothmb.com/start",
      CANON_ANSWER: "",
      FAQ_QUESTION: "How long does engineering take?",
    });
    expect(rendered.body).toContain("[CANON_ANSWER]");
    expect(rendered.missingPlaceholders).toContain("[CANON_ANSWER]");
  });

  test("throws on an unknown template key", () => {
    expect(() =>
      // @ts-expect-error — deliberately invalid key to prove the lookup guard.
      renderPostingTemplate("not_a_real_template", "facebook", {}),
    ).toThrow();
  });

  test("every declared template renders on every platform without throwing", () => {
    for (const template of POSTING_TEMPLATES) {
      for (const platform of POSTING_PLATFORMS) {
        const rendered = renderPostingTemplate(template.key, platform, {});
        expect(typeof rendered.body).toBe("string");
        expect(rendered.body.length).toBeGreaterThan(0);
        // With an empty context, every placeholder in the source is unresolved.
        expect(rendered.missingPlaceholders.length).toBeGreaterThan(0);
      }
    }
  });
});
