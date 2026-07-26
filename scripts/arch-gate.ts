/**
 * Architecture-conformance gate (SESSION_0711) — cody-preflight §0.
 *
 * Reads docs/architecture/invariants.yml (flat rows: {id, adr, note, glob, pattern,
 * max_count, allowlist?}), scans the tree for pattern matches under each row's glob,
 * and fails (exit 1) on any breach BEFORE code is written. Two row shapes:
 *
 *   - Count rows: total matches across matching files must be <= max_count. The gate
 *     RATCHETS: a passing run that measures a LOWER count rewrites the manifest's
 *     max_count to the measured value — the ceiling only ever falls.
 *   - Allowlist rows (an `allowlist:` key present): any matching FILE not in the
 *     allowlist is a breach — "no NEW files may do this"; existing offenders are pinned.
 *
 * Dependency-light by design: bun + node:fs + a hand-rolled flat-YAML parse (the file
 * is a flat list of scalar maps — no anchors, no nesting beyond one string list).
 *
 *   bun scripts/arch-gate.ts            # scan + ratchet
 *   bun scripts/arch-gate.ts --check    # scan only, never rewrite the manifest
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs"
import { join, relative, resolve } from "node:path"

const ROOT = resolve(import.meta.dir, "..")
const MANIFEST = resolve(ROOT, "docs/architecture/invariants.yml")
const CHECK_ONLY = process.argv.includes("--check")

type Row = {
  id: string
  adr: string
  note: string
  glob: string
  pattern: string
  max_count: number
  allowlist?: string[]
}

// --- tiny flat-YAML parse: `- id: x` starts a row; `key: value` scalars; `allowlist:` +
//     `  - path` lines (or `allowlist: []`). Comments/blank lines skipped. No escapes. ---
const parseManifest = (src: string): Row[] => {
  const rows: Row[] = []
  let cur: Partial<Row> | null = null
  let inAllowlist = false
  for (const raw of src.split("\n")) {
    const line = raw.replace(/\s+$/, "")
    if (line.trim() === "" || line.trim().startsWith("#")) continue
    const itemMatch = line.match(/^- id:\s*(.+)$/)
    if (itemMatch) {
      if (cur) rows.push(cur as Row)
      cur = { id: itemMatch[1].trim() }
      inAllowlist = false
      continue
    }
    if (!cur) throw new Error(`invariants.yml: key before first row: ${line}`)
    const listItem = line.match(/^\s+-\s+(.+)$/)
    if (inAllowlist && listItem) {
      cur.allowlist?.push(stripQuotes(listItem[1]))
      continue
    }
    const kv = line.match(/^\s+([\w]+):\s*(.*)$/)
    if (!kv) throw new Error(`invariants.yml: unparseable line: ${line}`)
    const [, key, rawVal] = kv
    inAllowlist = false
    if (key === "allowlist") {
      cur.allowlist = rawVal.trim() === "[]" || rawVal.trim() === "" ? [] : [stripQuotes(rawVal)]
      inAllowlist = rawVal.trim() === ""
    } else if (key === "max_count") {
      cur.max_count = Number(rawVal)
      if (!Number.isInteger(cur.max_count)) throw new Error(`invariants.yml: bad max_count in ${cur.id}`)
    } else {
      ;(cur as Record<string, unknown>)[key] = stripQuotes(rawVal)
    }
  }
  if (cur) rows.push(cur as Row)
  for (const r of rows) {
    if (!r.id || !r.glob || r.pattern === undefined || r.max_count === undefined)
      throw new Error(`invariants.yml: row ${r.id ?? "?"} missing id/glob/pattern/max_count`)
  }
  return rows
}
const stripQuotes = (s: string): string => {
  const t = s.trim()
  return (t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")) ? t.slice(1, -1) : t
}

// --- glob → regex: supports **, *, and {a,b} alternation; anchored to repo-relative path ---
const globToRegex = (glob: string): RegExp => {
  let re = ""
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i]
    if (c === "*") {
      if (glob[i + 1] === "*") {
        // `**/` matches zero or more path segments; bare `**` matches anything
        if (glob[i + 2] === "/") {
          re += "(?:.*/)?"
          i += 2
        } else {
          re += ".*"
          i += 1
        }
      } else re += "[^/]*"
    } else if (c === "{") {
      const end = glob.indexOf("}", i)
      if (end === -1) throw new Error(`bad glob (unclosed {): ${glob}`)
      re += `(?:${glob
        .slice(i + 1, end)
        .split(",")
        .map(s => s.replace(/[.+^$()|[\]\\]/g, "\\$&"))
        .join("|")})`
      i = end
    } else if (".+^$()|[]\\?".includes(c)) re += `\\${c}`
    else re += c
  }
  return new RegExp(`^${re}$`)
}

// --- walk the tree once; skip vendored/generated dirs ---
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  ".turbo",
  ".vercel",
  ".graphify",
  ".generated", // generated Prisma client — never a conformance target
  "dist",
  "build",
  "coverage",
  "out",
  "test-results",
  "playwright-report",
])
const allFiles: string[] = []
const walk = (dir: string): void => {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) walk(full)
    else allFiles.push(relative(ROOT, full))
  }
}
walk(ROOT)

// --- evaluate rows ---
const rows = parseManifest(readFileSync(MANIFEST, "utf8"))
type Result = { row: Row; count: number; offenders: string[]; breach: boolean; ratchet: boolean }
const results: Result[] = rows.map(row => {
  const fileRe = globToRegex(row.glob)
  const patRe = new RegExp(row.pattern, "g")
  const files = allFiles.filter(f => fileRe.test(f))
  let count = 0
  const matchedFiles: string[] = []
  for (const f of files) {
    const text = readFileSync(resolve(ROOT, f), "utf8")
    const n = (text.match(patRe) ?? []).length
    if (n > 0) {
      count += n
      matchedFiles.push(f)
    }
  }
  if (row.allowlist !== undefined) {
    const offenders = matchedFiles.filter(f => !row.allowlist?.includes(f))
    return { row, count, offenders, breach: offenders.length > 0, ratchet: false }
  }
  return { row, count, offenders: matchedFiles, breach: count > row.max_count, ratchet: count < row.max_count }
})

// --- ratchet: a green run that found a lower count rewrites the manifest ceiling ---
const breaches = results.filter(r => r.breach)
if (breaches.length === 0 && !CHECK_ONLY) {
  let text = readFileSync(MANIFEST, "utf8")
  let rewrote = false
  for (const r of results.filter(x => x.ratchet)) {
    // Replace max_count only inside this row's block (from `- id:` to the next `- id:` or EOF).
    const blockRe = new RegExp(`(- id:\\s*${r.row.id}\\b[\\s\\S]*?max_count:\\s*)\\d+`)
    if (blockRe.test(text)) {
      text = text.replace(blockRe, `$1${r.count}`)
      rewrote = true
      console.log(`  ⤓ ratchet: ${r.row.id} max_count ${r.row.max_count} → ${r.count}`)
    }
  }
  if (rewrote) writeFileSync(MANIFEST, text)
}

// --- report ---
console.log(`\narch-gate — ${rows.length} invariant(s) (${relative(ROOT, MANIFEST)})\n`)
for (const r of results) {
  const mode = r.row.allowlist !== undefined ? `allowlist(${r.row.allowlist.length})` : `max ${r.row.max_count}`
  const mark = r.breach ? "✗" : "✓"
  console.log(`  ${mark} ${r.row.id} [${r.row.adr}] — ${r.count} match(es), ${mode}`)
  if (r.breach) {
    for (const f of r.offenders.slice(0, 20)) console.log(`      offender: ${f}`)
    console.log(`      → ${r.row.note}`)
  }
}
if (breaches.length > 0) {
  console.log(`\n✗ arch-gate: ${breaches.length} invariant breach(es). Fix before writing code (cody-preflight §0),`)
  console.log("  or take the breach to the operator — never raise a ceiling to get green.\n")
  process.exit(1)
}
console.log(`\n✓ arch-gate: all invariants hold.${CHECK_ONLY ? " (--check: no ratchet)" : ""}\n`)
