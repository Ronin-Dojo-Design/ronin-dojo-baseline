import { describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseArgs, renderFile } from "./index";

describe("parseArgs", () => {
  test("throws with a usage message when no input is given", () => {
    expect(() => parseArgs([])).toThrow(/usage/);
  });

  test("defaults the output path by swapping .md for .html", () => {
    expect(parseArgs(["outline.md"])).toEqual({ input: "outline.md", output: "outline.html" });
  });

  test("-o overrides the output path", () => {
    expect(parseArgs(["outline.md", "-o", "custom.html"])).toEqual({
      input: "outline.md",
      output: "custom.html",
    });
  });

  test("throws when -o is given without a value", () => {
    expect(() => parseArgs(["outline.md", "-o"])).toThrow(/-o requires/);
  });
});

describe("renderFile", () => {
  test("renders the sample fixture to a real file containing the title and >=3 slides", () => {
    const dir = mkdtempSync(join(tmpdir(), "render-deck-test-"));
    try {
      const outPath = join(dir, "out.html");
      const { slideCount } = renderFile(
        join(import.meta.dir, "fixtures", "sample-outline.md"),
        outPath,
      );

      expect(existsSync(outPath)).toBe(true);
      expect(slideCount).toBeGreaterThanOrEqual(3);

      const html = readFileSync(outPath, "utf8");
      expect(html).toContain("Ronin Dojo Design — Q3 Overview");
      const sectionCount = (html.match(/<section class="slide/g) ?? []).length;
      expect(sectionCount).toBeGreaterThanOrEqual(3);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("throws a readable error for an outline missing frontmatter", () => {
    const dir = mkdtempSync(join(tmpdir(), "render-deck-test-"));
    try {
      const badInput = join(dir, "bad.md");
      writeFileSync(badInput, "## No frontmatter\n", "utf8");
      expect(() => renderFile(badInput, join(dir, "bad.html"))).toThrow(/frontmatter/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
