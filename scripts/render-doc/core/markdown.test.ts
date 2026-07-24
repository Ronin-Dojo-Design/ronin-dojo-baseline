import { describe, expect, test } from "bun:test"

import { firstHeading, renderMarkdown } from "./markdown"

describe("renderMarkdown", () => {
  test("renders headings, paragraphs, and a code fence", () => {
    const html = renderMarkdown("# Title\n\nA paragraph.\n\n```ts\nconst x = 1\n```\n")
    expect(html).toContain("<h1>Title</h1>")
    expect(html).toContain("<p>A paragraph.</p>")
    expect(html).toContain('<code class="language-ts">const x = 1')
  })

  test("renders a GFM table, a blockquote, and a link", () => {
    const html = renderMarkdown(
      "| A | B |\n|---|---|\n| 1 | 2 |\n\n> quoted\n\n[text](https://example.com)\n",
    )
    expect(html).toContain("<table>")
    expect(html).toContain("<blockquote>")
    expect(html).toContain('<a href="https://example.com">text</a>')
  })

  test("renders an unordered and ordered list", () => {
    const html = renderMarkdown("- one\n- two\n\n1. first\n2. second\n")
    expect(html).toContain("<ul>")
    expect(html).toContain("<ol>")
  })
})

describe("firstHeading", () => {
  test("returns the text of the first level-1 heading", () => {
    expect(firstHeading("intro\n\n# The Title\n\nmore text\n")).toBe("The Title")
  })

  test("returns undefined when there is no level-1 heading", () => {
    expect(firstHeading("## Only a level-2 heading\n\ntext\n")).toBeUndefined()
  })
})
