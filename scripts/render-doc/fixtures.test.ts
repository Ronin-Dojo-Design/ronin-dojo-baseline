/**
 * fixtures.test.ts — golden-file regression test.
 *
 * Renders the two committed fixture inputs (one research-review, one sop-ritual — the doc pair
 * named in G-030 v1's scope) and asserts the output matches the checked-in `fixtures/*.html`
 * sample exactly. A change here means the renderer's output changed — regenerate the fixture
 * deliberately, don't let this fail silently.
 */

import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"

import { parseDoc } from "./core/parse"
import { renderDoc } from "./templates/render"

const REPO_ROOT = path.resolve(import.meta.dir, "../..")
const FIXTURES_DIR = path.join(import.meta.dir, "fixtures")

const CASES = [
  {
    input: "docs/architecture/research/research-review-security-headers-posture.md",
    golden: "research-review-security-headers-posture.html",
    genre: "research-review",
  },
  {
    input: "docs/rituals/opening.md",
    golden: "opening.html",
    genre: "sop-ritual",
  },
] as const

describe("render-doc fixtures (golden files)", () => {
  for (const { input, golden, genre } of CASES) {
    test(`${input} renders byte-for-byte the same as fixtures/${golden}`, () => {
      const raw = readFileSync(path.join(REPO_ROOT, input), "utf8")
      const doc = parseDoc(raw, input)
      const html = renderDoc(doc, input)

      expect(doc.genre).toBe(genre)
      expect(html).toBe(readFileSync(path.join(FIXTURES_DIR, golden), "utf8"))
    })
  }
})
