import { describe, expect, test } from "bun:test";
import type { Outline } from "../core/parse";
import { renderDeck, renderInline } from "./deck";

function baseOutline(overrides: Partial<Outline["frontmatter"]> = {}): Outline {
  return {
    frontmatter: { title: "Deck Title", brand: "rdd", ...overrides },
    slides: [
      { title: "Slide One", blocks: [{ type: "bullets", items: ["a", "b"] }], layout: "content" },
      { title: "Slide Two", blocks: [{ type: "quote", text: "Big idea" }], layout: "statement" },
    ],
  };
}

describe("renderInline", () => {
  test("escapes raw HTML (XSS-safe)", () => {
    expect(renderInline('<script>alert("x")</script>')).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;",
    );
  });

  test("renders **bold**, *italic*, and `code`", () => {
    expect(renderInline("**bold**")).toBe("<strong>bold</strong>");
    expect(renderInline("*italic*")).toBe("<em>italic</em>");
    expect(renderInline("`code`")).toBe("<code>code</code>");
  });

  test("escapes ampersands inside plain text", () => {
    expect(renderInline("A & B")).toBe("A &amp; B");
  });
});

describe("renderDeck", () => {
  test("injects the brand primary color as a CSS variable", () => {
    const html = renderDeck(baseOutline({ brand: "bbl" }));
    expect(html).toContain("--primary:#e52421;");
  });

  test("renders one <section class=\"slide\"> per slide plus the auto title slide", () => {
    const html = renderDeck(baseOutline());
    const count = (html.match(/<section class="slide/g) ?? []).length;
    expect(count).toBe(3); // title + 2 body slides
  });

  test("the title slide carries the frontmatter title and subtitle", () => {
    const html = renderDeck(baseOutline({ subtitle: "A subtitle" }));
    expect(html).toContain("Deck Title");
    expect(html).toContain("A subtitle");
  });

  test("a statement-layout slide gets the 'statement' class and no title heading", () => {
    const html = renderDeck(baseOutline());
    expect(html).toContain('class="slide statement"');
    expect(html).toContain("Big idea");
  });

  test("notes render inside a hidden aside, not visibly", () => {
    const outline = baseOutline();
    outline.slides[0].notes = "speaker-only text";
    const html = renderDeck(outline);
    expect(html).toContain('<aside class="notes" hidden aria-hidden="true">speaker-only text</aside>');
  });

  test("includes @media print one-slide-per-page rules", () => {
    const html = renderDeck(baseOutline());
    expect(html).toContain("@media print");
    expect(html).toContain("page-break-after:always");
  });

  test("includes arrow-key navigation and a slide counter", () => {
    const html = renderDeck(baseOutline());
    expect(html).toContain("ArrowRight");
    expect(html).toContain("ArrowLeft");
    expect(html).toContain('id="counter"');
  });
});
