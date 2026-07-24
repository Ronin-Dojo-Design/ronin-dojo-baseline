import { describe, expect, test } from "bun:test"

import { parseDoc } from "./parse"

describe("parseDoc", () => {
  test("composes frontmatter + genre + markdown into one doc model", () => {
    const raw = `---
title: "Sample SOP"
type: sop
status: active
created: 2026-01-01
---

# Sample SOP

Step one.
`
    const doc = parseDoc(raw, "docs/runbooks/sops/sop-sample.md")

    expect(doc.genre).toBe("sop-ritual")
    expect(doc.metadata.title).toBe("Sample SOP")
    expect(doc.metadata.status).toBe("active")
    expect(doc.bodyHtml).toContain("<h1>Sample SOP</h1>")
    expect(doc.bodyHtml).toContain("<p>Step one.</p>")
  })

  test("a doc with no frontmatter still parses cleanly (generic genre, fallback title)", () => {
    const doc = parseDoc("# Just A Doc\n\nSome text.\n", "docs/some/random-path.md")

    expect(doc.genre).toBe("generic")
    expect(doc.metadata.title).toBe("Just A Doc")
    expect(doc.frontmatter).toEqual({})
  })

  test("an explicit genre override wins over auto-detection", () => {
    const raw = `---
type: research-review
---
Body.
`
    const doc = parseDoc(raw, "docs/architecture/research/research-review-x.md", "generic")
    expect(doc.genre).toBe("generic")
  })
})
