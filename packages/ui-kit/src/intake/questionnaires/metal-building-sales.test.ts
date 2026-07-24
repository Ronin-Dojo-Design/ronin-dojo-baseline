// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep.
import { describe, expect, test } from "bun:test";
import { flatQuestions, toMarkdown } from "../questionnaire";
import { METAL_BUILDING_SALES } from "./metal-building-sales";

const allText = flatQuestions(METAL_BUILDING_SALES)
  .map((q) => `${q.prompt} ${q.why}`)
  .join(" ")
  .toLowerCase();

describe("METAL_BUILDING_SALES", () => {
  test("every question id is unique — ids key the answer map and localStorage", () => {
    const ids = flatQuestions(METAL_BUILDING_SALES).map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("covers the four commercial lanes (the GAP-1 taxonomy's first real consumer)", () => {
    expect(allText).toContain("steel building");
    expect(allText).toContain("erection");
    expect(allText).toContain("concrete");
    expect(allText).toContain("excavation");
    expect(allText).toContain("building-only");
  });

  test("asks the Installation Path with BOTH canon values named (CONTEXT.md)", () => {
    expect(allText).toContain("mammoth-installed");
    expect(allText).toContain("customer-installed");
  });

  test("covers spec, site readiness, permits, delivery window, budget, and decision-maker", () => {
    expect(allText).toContain("dimensions");
    expect(allText).toContain("cleared, graded");
    expect(allText).toContain("permits");
    expect(allText).toContain("delivered");
    expect(allText).toContain("budget");
    expect(allText).toContain("signs off");
  });

  test("serializes through the ONE kernel serializer with its own title", () => {
    const md = toMarkdown(
      METAL_BUILDING_SALES,
      {
        client: "Flores Ag Supply",
        contact: "M. F.",
        meetingDate: "2026-07-23",
        containsRealData: true,
      },
      { commercial_lanes: "Building + install" },
    );
    expect(md).toContain("# Flores Ag Supply — Metal building discovery call");
    expect(md).toContain("Building + install");
    expect(md).toContain("do NOT commit to git");
  });
});
