/**
 * Guard: `DropdownMenuItem` must never use `onSelect`.
 *
 * Run: cd apps/web && bun test components/common/dropdown-menu.guard.test.ts
 *
 * Why this exists (SESSION_0333 / SESSION_0334, drift D-016, WL-P1-3):
 * `DropdownMenuItem` is Base UI `Menu.Item`, which activates on `onClick` (it
 * synthesizes a click on keyboard Enter/Space via `useButton`) and has **no**
 * `onSelect` prop. A Radix-style `onSelect={…}` typechecks (it falls through to
 * the underlying `<div>`'s DOM text-selection event) but never fires — the menu
 * item is silently dead. The D-016 Radix→Base UI migration scanned imports, not
 * `Menu.Item` semantics, so ~6 admin menus shipped non-functional.
 *
 * This guard scans the JSX source and fails if any `<DropdownMenuItem …>` opening
 * tag carries an `onSelect` attribute. Sibling primitives that legitimately use
 * `onSelect` (cmdk `CommandItem`, Base UI `Calendar`, lineage callback props) are
 * out of scope — the guard is intentionally anchored to `DropdownMenuItem` only.
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { readFileSync } from "node:fs"
// @ts-expect-error — Bun global Glob; @types/bun is not a repo dep yet.
import { Glob } from "bun"

const SCAN_GLOBS = ["app/**/*.tsx", "components/**/*.tsx"]

/**
 * Extract the attribute text of every `<DropdownMenuItem …>` opening tag in a
 * source string. Walks from each tag start tracking `{}` brace depth so the
 * scan is robust to multiline tags and arrow functions (`=>`) in handlers — the
 * tag terminates at the first `>` seen at brace depth 0 that is not part of `=>`.
 */
function dropdownMenuItemTags(source: string): string[] {
  const tags: string[] = []
  const opener = /<DropdownMenuItem(?=[\s/>])/g
  let match: RegExpExecArray | null

  // oxlint-disable-next-line no-cond-assign -- standard regex-exec loop.
  while ((match = opener.exec(source)) !== null) {
    let i = match.index + match[0].length
    let depth = 0
    let attrs = ""
    for (; i < source.length; i++) {
      const ch = source[i]
      if (ch === "{") depth++
      else if (ch === "}") depth--
      else if (ch === ">" && depth === 0 && source[i - 1] !== "=") break
      attrs += ch
    }
    tags.push(attrs)
  }

  return tags
}

describe("DropdownMenuItem onSelect guard", () => {
  it("no DropdownMenuItem in app/ or components/ uses onSelect (Base UI ignores it)", async () => {
    const violations: string[] = []

    for (const pattern of SCAN_GLOBS) {
      const glob = new Glob(pattern)
      for await (const file of glob.scan(".")) {
        const source = readFileSync(file, "utf8")
        if (!source.includes("DropdownMenuItem")) continue
        for (const attrs of dropdownMenuItemTags(source)) {
          if (/\bonSelect\b/.test(attrs)) {
            violations.push(`${file}: <DropdownMenuItem … onSelect …> — use onClick instead`)
          }
        }
      }
    }

    expect(violations).toEqual([])
  })

  it("self-check: the tag parser detects onSelect past an arrow-function onClick", () => {
    const sample =
      "<DropdownMenuItem onClick={() => doThing()} onSelect={() => leak()}>x</DropdownMenuItem>"
    expect(dropdownMenuItemTags(sample).some(a => /\bonSelect\b/.test(a))).toBe(true)

    const clean = "<DropdownMenuItem onClick={() => doThing()}>x</DropdownMenuItem>"
    expect(dropdownMenuItemTags(clean).some(a => /\bonSelect\b/.test(a))).toBe(false)
  })
})
