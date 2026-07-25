/**
 * frontmatter.ts — pure YAML-frontmatter + body splitter.
 *
 * Not a general YAML parser: handles the flat `key: value` and simple `key:\n  - item` array shape
 * every doc in this repo actually uses (same scope as scripts/wiki-lint.ts's `parseFrontmatter`,
 * reimplemented here so scripts/render-doc stays self-contained — no cross-import of a sibling
 * script). No dependency needed; the workspace lockfile has no YAML parser.
 */

export interface ParsedFrontmatter {
  /** Frontmatter keys as parsed. Scalars are strings; list keys (`- item`) are string arrays. */
  data: Record<string, string | string[]>
  /** Everything after the closing `---`, unchanged. */
  body: string
}

const FRONTMATTER_BLOCK = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/

export function parseFrontmatter(raw: string): ParsedFrontmatter {
  const match = raw.match(FRONTMATTER_BLOCK)
  if (!match) return { data: {}, body: raw }

  const [, yamlBlock, body] = match
  const data: Record<string, string | string[]> = {}
  let currentKey = ""
  let currentArray: string[] | null = null

  for (const line of yamlBlock.split("\n")) {
    const arrayItem = line.match(/^\s+-\s+(.+)$/)
    if (arrayItem && currentKey) {
      if (!currentArray) {
        currentArray = []
        data[currentKey] = currentArray
      }
      currentArray.push(stripQuotes(arrayItem[1].trim()))
      continue
    }

    const kv = line.match(/^(\w[\w_-]*)\s*:\s*(.*)$/)
    if (!kv) continue

    currentKey = kv[1]
    currentArray = null
    const value = stripQuotes(kv[2].trim())
    if (value === "" || value === "[]") {
      // Either an empty scalar or the start of a `key:\n  - ...` array — leave unset until/unless
      // array items follow; an empty scalar never renders (metadata treats it as absent).
      delete data[currentKey]
      continue
    }
    data[currentKey] = value
  }

  return { data, body }
}

function stripQuotes(value: string): string {
  return value.replace(/^["']|["']$/g, "")
}
