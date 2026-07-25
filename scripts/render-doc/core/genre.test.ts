import { describe, expect, test } from "bun:test"

import { detectGenre } from "./genre"

describe("detectGenre", () => {
  test("detects research-review from frontmatter type", () => {
    expect(detectGenre({ type: "research-review" }, "docs/architecture/research/foo.md")).toBe(
      "research-review",
    )
  })

  test("detects research-review from the path when type is absent", () => {
    expect(detectGenre({}, "docs/architecture/research/research-review-foo.md")).toBe(
      "research-review",
    )
  })

  test("detects sop-ritual from a rituals/ path even when type is 'protocol'", () => {
    expect(detectGenre({ type: "protocol" }, "docs/rituals/opening.md")).toBe("sop-ritual")
  })

  test("detects sop-ritual from a workflow type", () => {
    expect(detectGenre({ type: "workflow" }, "docs/protocols/some-workflow.md")).toBe("sop-ritual")
  })

  test("falls back to generic for an unrecognized doc — never throws", () => {
    expect(detectGenre({ type: "reference" }, "docs/architecture/plan-vs-current.md")).toBe(
      "generic",
    )
  })

  test("an explicit override always wins", () => {
    expect(detectGenre({ type: "research-review" }, "docs/rituals/opening.md", "generic")).toBe(
      "generic",
    )
  })

  test("an unknown override throws a clear error", () => {
    expect(() => detectGenre({}, "docs/rituals/opening.md", "not-a-genre")).toThrow(
      /Unknown --genre override/,
    )
  })
})
