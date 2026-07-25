import { describe, expect, test } from "bun:test"

import { extractMetadata } from "./metadata"

describe("extractMetadata", () => {
  test("pulls the known fields and prefers author over last_agent", () => {
    const metadata = extractMetadata({
      title: "Doc Title",
      created: "2026-01-01",
      updated: "2026-01-02",
      author: "Human Author",
      last_agent: "claude-session-0001",
      status: "active",
      session: "SESSION_0001",
      slug: "doc-title",
      decision: "accepted",
    })

    expect(metadata).toEqual({
      title: "Doc Title",
      created: "2026-01-01",
      updated: "2026-01-02",
      author: "Human Author",
      status: "active",
      sessionOrSlug: "SESSION_0001",
      decision: "accepted",
    })
  })

  test("falls back to last_agent when author is absent, and slug when session is absent", () => {
    const metadata = extractMetadata({
      last_agent: "claude-session-0002",
      slug: "doc-slug",
    })

    expect(metadata.author).toBe("claude-session-0002")
    expect(metadata.sessionOrSlug).toBe("doc-slug")
  })

  test("missing keys are undefined, never the string 'undefined'", () => {
    const metadata = extractMetadata({})
    expect(metadata.created).toBeUndefined()
    expect(metadata.decision).toBeUndefined()
    expect(Object.values(metadata).every(v => v !== "undefined")).toBe(true)
  })

  test("uses the title fallback when frontmatter has no title", () => {
    const metadata = extractMetadata({}, "Fallback Title")
    expect(metadata.title).toBe("Fallback Title")
  })

  test("ignores a non-string (array) title/status value rather than rendering it raw", () => {
    const metadata = extractMetadata({ title: ["not", "a", "title"] })
    expect(metadata.title).toBeUndefined()
  })
})
