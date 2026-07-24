import { describe, expect, test } from "bun:test";

import {
  renderClaimVerifiedCard,
  renderLegacyWrappedCard,
  renderMilestoneCard,
  renderPromotionCard,
  renderTechniquePreviewCard,
} from "./cards";
import { parseArgs } from "./index";

const EXPECTED_ESCAPES = ["&amp;", "&lt;", "&gt;", "&quot;", "&apos;"];
const HOSTILE_TEXT = `Amp & less < greater > double " single ' slash /`;

function expectValidShape(svg: string): void {
  expect(svg.startsWith("<svg")).toBe(true);
  expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  expect(svg).toContain('width="1200"');
  expect(svg).toContain('height="630"');
  expect(svg).toContain('viewBox="0 0 1200 630"');
  expect(svg.endsWith("</svg>")).toBe(true);
}

function expectEscaped(svg: string): void {
  for (const escapedValue of EXPECTED_ESCAPES) {
    expect(svg).toContain(escapedValue);
  }
  expect(svg).toContain("slash /");
  expect(svg).not.toContain(HOSTILE_TEXT);
}

describe("BBL celebration-card SVG renderers", () => {
  test("promotion renders an OG-sized SVG, escapes input, and uses the belt color", () => {
    const svg = renderPromotionCard({
      name: HOSTILE_TEXT,
      beltName: HOSTILE_TEXT,
      beltColorHex: "#7A3E1D",
      date: HOSTILE_TEXT,
    });

    expectValidShape(svg);
    expectEscaped(svg);
    expect(svg).toContain("#7A3E1D");
    expect(svg).not.toContain("undefined");
  });

  test("promotion omits a missing academy cleanly", () => {
    const svg = renderPromotionCard({
      name: "Jane Doe",
      beltName: "Black Belt",
      beltColorHex: "#111111",
      date: "July 24, 2026",
    });

    expectValidShape(svg);
    expect(svg).not.toContain("undefined");
  });

  test("claim-verified renders an OG-sized SVG and escapes input", () => {
    const svg = renderClaimVerifiedCard({
      name: HOSTILE_TEXT,
      lineageLine: HOSTILE_TEXT,
      date: HOSTILE_TEXT,
    });

    expectValidShape(svg);
    expectEscaped(svg);
    expect(svg).not.toContain("undefined");
  });

  test("milestone renders an OG-sized SVG and escapes input", () => {
    const svg = renderMilestoneCard({
      statLine: HOSTILE_TEXT,
      contextLine: HOSTILE_TEXT,
    });

    expectValidShape(svg);
    expectEscaped(svg);
    expect(svg).not.toContain("undefined");
  });

  test("technique-preview renders an escaped OG-sized SVG with a free badge", () => {
    const svg = renderTechniquePreviewCard({
      techniqueName: HOSTILE_TEXT,
      disciplineLabel: HOSTILE_TEXT,
      freePreview: true,
    });

    expectValidShape(svg);
    expectEscaped(svg);
    expect(svg).toContain("Watch the breakdown");
    expect(svg).toContain("FREE PREVIEW");
    expect(svg).toContain("technique preview, free preview");
    expect(svg).not.toContain("undefined");
  });

  test("technique-preview omits the free badge when the preview is not free", () => {
    const svg = renderTechniquePreviewCard({
      techniqueName: "Triangle Choke",
      disciplineLabel: "Brazilian Jiu-Jitsu",
      freePreview: false,
    });

    expectValidShape(svg);
    expect(svg).not.toContain("FREE PREVIEW");
    expect(svg).not.toContain("technique preview, free preview");
    expect(svg).not.toContain("undefined");
  });

  test("legacy-wrapped renders an escaped OG-sized SVG without an optional name", () => {
    const svg = renderLegacyWrappedCard({
      year: 2026,
      statLines: [HOSTILE_TEXT],
    });

    expectValidShape(svg);
    expectEscaped(svg);
    expect(svg).toContain("LEGACY WRAPPED");
    expect(svg).not.toContain("undefined");
  });

  test("legacy-wrapped renders no more than four stat lines", () => {
    const svg = renderLegacyWrappedCard({
      year: 2026,
      statLines: ["STAT_ONE", "STAT_TWO", "STAT_THREE", "STAT_FOUR", "STAT_FIVE"],
      name: "Jane Doe",
    });

    expectValidShape(svg);
    for (const includedLine of [
      "STAT_ONE",
      "STAT_TWO",
      "STAT_THREE",
      "STAT_FOUR",
    ]) {
      expect(svg).toContain(includedLine);
    }
    expect(svg).not.toContain("STAT_FIVE");
    expect(svg).not.toContain("undefined");
  });

  test("CLI parsing rejects inherited object keys as card types", () => {
    expect(() => parseArgs(["toString"])).toThrow("Unknown or missing card type");
    expect(parseArgs(["promotion"])).toEqual({ type: "promotion" });
  });

  test("CLI parsing accepts the v1.1 card types", () => {
    expect(parseArgs(["technique-preview"])).toEqual({
      type: "technique-preview",
    });
    expect(parseArgs(["legacy-wrapped"])).toEqual({
      type: "legacy-wrapped",
    });
  });
});
