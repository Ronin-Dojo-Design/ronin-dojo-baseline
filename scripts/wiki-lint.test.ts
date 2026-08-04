/**
 * wiki-lint.test.ts — negative-fixture proof for the R9 `recipe:` resolution
 * check (petey-plan-0741 §B2, SESSION_0746).
 *
 * Pure static checks against the real repo's recipe cards + skills — no DB.
 * Run: bun test scripts/wiki-lint.test.ts
 */

import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { lintRecipeValue, normalizeFacetValue } from "./wiki-lint"

const FIXTURES_DIR = path.join(import.meta.dir, "wiki-lint-fixtures")

function runFixture(fixture: string, relativePath = "sprints/SESSION_9999.md") {
  const content = readFileSync(path.join(FIXTURES_DIR, fixture), "utf-8")
  return lintRecipeValue(relativePath, content)
}

describe("R9 — recipe: value resolution", () => {
  test("bogus recipe + status: staged → ERROR", () => {
    const results = runFixture("session-staged-bogus-recipe.md")
    expect(results).toHaveLength(1)
    expect(results[0].rule).toBe("R9")
    expect(results[0].severity).toBe("error")
    expect(results[0].message).toContain("not-a-real-recipe-or-skill")
  })

  test("card-resolving value (lane → docs/protocols/recipes/lane.md) → no findings", () => {
    expect(runFixture("session-staged-card-recipe.md")).toHaveLength(0)
  })

  test("skill-resolving value (seq-lane-build → .claude/skills/…/SKILL.md) → no findings", () => {
    expect(runFixture("session-staged-skill-recipe.md")).toHaveLength(0)
  })

  test("quoted skill-resolving value (\"pp\") → no findings", () => {
    expect(runFixture("session-staged-quoted-recipe.md")).toHaveLength(0)
  })

  test("bogus recipe + status: closed → WARNING, not error", () => {
    const results = runFixture("session-closed-bogus-recipe.md")
    expect(results).toHaveLength(1)
    expect(results[0].severity).toBe("warning")
  })

  test("empty / comment-only recipe → no findings", () => {
    expect(runFixture("session-staged-empty-recipe.md")).toHaveLength(0)
  })

  test("archived session path → warning even with a live status (history is frozen)", () => {
    const results = runFixture(
      "session-staged-bogus-recipe.md",
      "sprints/_archive/monorepo-era/SESSION_0601.md",
    )
    expect(results).toHaveLength(1)
    expect(results[0].severity).toBe("warning")
  })

  test("non-SESSION file is out of scope (recipe cards carry recipe: frontmatter themselves)", () => {
    const results = runFixture("session-staged-bogus-recipe.md", "protocols/recipes/state-sweep.md")
    expect(results).toHaveLength(0)
  })
})

describe("normalizeFacetValue", () => {
  test("strips quotes, inline comments, and whitespace", () => {
    expect(normalizeFacetValue("lane")).toBe("lane")
    expect(normalizeFacetValue('"lane"')).toBe("lane")
    expect(normalizeFacetValue("'lane'")).toBe("lane")
    expect(normalizeFacetValue("lane # a comment")).toBe("lane")
    expect(normalizeFacetValue("# only a comment")).toBe("")
    expect(normalizeFacetValue(undefined)).toBe("")
    expect(normalizeFacetValue([])).toBe("")
  })
})
