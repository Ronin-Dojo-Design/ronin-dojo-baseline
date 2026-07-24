import { describe, expect, test } from "bun:test"

import { parseFrontmatter } from "./frontmatter"

describe("parseFrontmatter", () => {
  test("splits a flat frontmatter block from the body", () => {
    const raw = `---
title: "Hello World"
slug: hello-world
status: active
---

# Body

Some text.
`
    const { data, body } = parseFrontmatter(raw)
    expect(data.title).toBe("Hello World")
    expect(data.slug).toBe("hello-world")
    expect(data.status).toBe("active")
    expect(body.trim()).toBe("# Body\n\nSome text.".trim())
  })

  test("parses a list value (pairs_with / backlinks style)", () => {
    const raw = `---
title: Doc
pairs_with:
  - docs/a.md
  - docs/b.md
---
Body.
`
    const { data } = parseFrontmatter(raw)
    expect(data.pairs_with).toEqual(["docs/a.md", "docs/b.md"])
  })

  test("keeps colons inside a quoted scalar value intact", () => {
    const raw = `---
decision: "operator-accepted 2026-07-22 — 1B: durable sink first"
---
Body.
`
    const { data } = parseFrontmatter(raw)
    expect(data.decision).toBe("operator-accepted 2026-07-22 — 1B: durable sink first")
  })

  test("returns an empty frontmatter object and the raw text as body when there's no block", () => {
    const raw = "# Just a heading\n\nNo frontmatter here.\n"
    const { data, body } = parseFrontmatter(raw)
    expect(data).toEqual({})
    expect(body).toBe(raw)
  })

  test("treats an empty scalar as unset rather than an empty string", () => {
    const raw = `---
title: Doc
goal_ids: []
---
Body.
`
    const { data } = parseFrontmatter(raw)
    expect(data.title).toBe("Doc")
    expect(data.goal_ids).toBeUndefined()
  })
})
