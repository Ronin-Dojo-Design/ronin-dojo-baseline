import { describe, expect, test } from "bun:test";
import { parseOutline } from "./parse";

function outline(body: string, frontmatter = 'title: "T"\nbrand: rdd') {
  return `---\n${frontmatter}\n---\n${body}`;
}

describe("parseOutline — frontmatter", () => {
  test("parses required + optional fields", () => {
    const md = `---
title: "My Deck"
subtitle: "A subtitle"
brand: bbl
author: "Jane Doe"
date: "2026-07-24"
---

## Only slide

- one
`;
    const result = parseOutline(md);
    expect(result.frontmatter).toEqual({
      title: "My Deck",
      subtitle: "A subtitle",
      brand: "bbl",
      author: "Jane Doe",
      date: "2026-07-24",
    });
  });

  test("optional fields are undefined when omitted", () => {
    const result = parseOutline(outline("## Slide\n"));
    expect(result.frontmatter.subtitle).toBeUndefined();
    expect(result.frontmatter.author).toBeUndefined();
    expect(result.frontmatter.date).toBeUndefined();
  });

  test("throws when title is missing", () => {
    expect(() => parseOutline(outline("## Slide\n", "brand: rdd"))).toThrow(/title/);
  });

  test("throws when brand is missing", () => {
    expect(() => parseOutline(outline("## Slide\n", 'title: "T"'))).toThrow(/brand/);
  });

  test("throws on an invalid brand value", () => {
    expect(() => parseOutline(outline("## Slide\n", 'title: "T"\nbrand: acme'))).toThrow(
      /rdd \| bbl \| mmb/,
    );
  });

  test("throws when there is no leading frontmatter block", () => {
    expect(() => parseOutline("## Slide\n\n- bullet\n")).toThrow(/frontmatter/);
  });

  test("unquotes double- and single-quoted values", () => {
    const md = outline("## Slide\n", `title: "Quoted Title"\nbrand: 'mmb'`);
    const result = parseOutline(md);
    expect(result.frontmatter.title).toBe("Quoted Title");
    expect(result.frontmatter.brand).toBe("mmb");
  });

  test("accepts unquoted scalar values", () => {
    const md = outline("## Slide\n", "title: Bare Title\nbrand: rdd");
    expect(parseOutline(md).frontmatter.title).toBe("Bare Title");
  });
});

describe("parseOutline — slide splitting", () => {
  test("each '## ' heading starts a new slide, in order", () => {
    const md = outline("## First\n\n## Second\n\n## Third\n");
    const titles = parseOutline(md).slides.map((s) => s.title);
    expect(titles).toEqual(["First", "Second", "Third"]);
  });

  test("a slide with no body has empty blocks and content layout", () => {
    const slide = parseOutline(outline("## Empty\n")).slides[0];
    expect(slide.blocks).toEqual([]);
    expect(slide.layout).toBe("content");
    expect(slide.notes).toBeUndefined();
  });

  test("content before the first heading is ignored, not an error", () => {
    const md = outline("Some stray intro text.\n\n## Real Slide\n\n- item\n");
    const result = parseOutline(md);
    expect(result.slides).toHaveLength(1);
    expect(result.slides[0].title).toBe("Real Slide");
  });

  test("'- ' bullets collect into one bullets block", () => {
    const md = outline("## Slide\n\n- one\n- two\n- three\n");
    const slide = parseOutline(md).slides[0];
    expect(slide.blocks).toEqual([{ type: "bullets", items: ["one", "two", "three"] }]);
  });

  test("'* ' bullets also collect into a bullets block", () => {
    const md = outline("## Slide\n\n* alpha\n* beta\n");
    const slide = parseOutline(md).slides[0];
    expect(slide.blocks).toEqual([{ type: "bullets", items: ["alpha", "beta"] }]);
  });

  test("a plain paragraph joins consecutive lines into one block", () => {
    const md = outline("## Slide\n\nLine one\nLine two continues\n");
    const slide = parseOutline(md).slides[0];
    expect(slide.blocks).toEqual([{ type: "paragraph", text: "Line one Line two continues" }]);
  });

  test("a blank line separates two paragraph blocks", () => {
    const md = outline("## Slide\n\nFirst paragraph.\n\nSecond paragraph.\n");
    const slide = parseOutline(md).slides[0];
    expect(slide.blocks).toEqual([
      { type: "paragraph", text: "First paragraph." },
      { type: "paragraph", text: "Second paragraph." },
    ]);
  });

  test("bullets then a blank line then a paragraph produce two ordered blocks", () => {
    const md = outline("## Slide\n\n- one\n- two\n\nA closing paragraph.\n");
    const slide = parseOutline(md).slides[0];
    expect(slide.blocks).toEqual([
      { type: "bullets", items: ["one", "two"] },
      { type: "paragraph", text: "A closing paragraph." },
    ]);
  });

  test("multiple consecutive blank lines don't create empty blocks", () => {
    const md = outline("## Slide\n\n\n\n- one\n\n\n\nA paragraph.\n");
    const slide = parseOutline(md).slides[0];
    expect(slide.blocks).toEqual([
      { type: "bullets", items: ["one"] },
      { type: "paragraph", text: "A paragraph." },
    ]);
  });
});

describe("parseOutline — blockquotes and statement layout", () => {
  test("a lone blockquote on a slide is layout 'statement'", () => {
    const md = outline("## Slide\n\n> A single big idea.\n");
    const slide = parseOutline(md).slides[0];
    expect(slide.layout).toBe("statement");
    expect(slide.blocks).toEqual([{ type: "quote", text: "A single big idea." }]);
  });

  test("consecutive '> ' lines join into one quote block", () => {
    const md = outline("## Slide\n\n> Line one\n> Line two\n");
    const slide = parseOutline(md).slides[0];
    expect(slide.blocks).toEqual([{ type: "quote", text: "Line one Line two" }]);
  });

  test("a blockquote combined with other content is NOT a statement slide", () => {
    const md = outline("## Slide\n\nIntro paragraph.\n\n> A supporting quote.\n");
    const slide = parseOutline(md).slides[0];
    expect(slide.layout).toBe("content");
    expect(slide.blocks).toEqual([
      { type: "paragraph", text: "Intro paragraph." },
      { type: "quote", text: "A supporting quote." },
    ]);
  });
});

describe("parseOutline — speaker notes", () => {
  test("a trailing 'Notes:' paragraph is captured and excluded from blocks", () => {
    const md = outline("## Slide\n\n- one\n\nNotes: remember to slow down here.\n");
    const slide = parseOutline(md).slides[0];
    expect(slide.blocks).toEqual([{ type: "bullets", items: ["one"] }]);
    expect(slide.notes).toBe("remember to slow down here.");
  });

  test("multi-line notes are joined until the next blank line", () => {
    const md = outline("## Slide\n\nNotes: line one\nline two\n");
    const slide = parseOutline(md).slides[0];
    expect(slide.notes).toBe("line one line two");
  });

  test("a slide with no Notes: paragraph has undefined notes", () => {
    const slide = parseOutline(outline("## Slide\n\n- one\n")).slides[0];
    expect(slide.notes).toBeUndefined();
  });
});
