#!/usr/bin/env bun
/**
 * ledger-id-next.ts
 *
 * FS-0030 mechanization (docs/protocols/failed-steps-log.md) — the ledger-ID allocator.
 * FS-0030's incident: new ledger IDs were numbered by tail-reading the visually-adjacent
 * table block, colliding twice in one session with IDs already used elsewhere in the docs
 * tree. The corrective rule ("grep the FULL ID space before assigning") was manual; this
 * script is the mechanization. Read-only — scans docs/, prints advice, never writes.
 *
 * Usage:
 *   bun scripts/ledger-id-next.ts --prefix=FI      # first free FI-NNN across the whole docs tree
 *   bun scripts/ledger-id-next.ts --prefix=WL-P2   # WL uses per-priority spaces (WL-P1/P2/P3)
 *   bun scripts/ledger-id-next.ts --check          # flag IDs *defined* in >1 place (dup detector)
 *   bun scripts/ledger-id-next.ts --json           # machine-readable output for either mode
 *
 * "Next free" = max(used)+1 over every occurrence (references count — an ID that is only
 * referenced is still taken), archives included. The duplicate check looks only at
 * DEFINITION sites — an `ID —` em-dash heading (the ledger convention) or a table row whose
 * first cell is the ID — and excludes append-only history that legitimately restates rows
 * (docs/_archive/, docs/sprints/, the frozen baseline systems pack). It also reports PHANTOM
 * references: IDs cited somewhere in docs/ but defined nowhere (e.g. the FS-0342/FS-0186
 * sprint citations with no failed-steps-log entry) — informational, not a failure.
 */

import { readdirSync, readFileSync } from "node:fs"
import { join, relative, resolve } from "node:path"

const ROOT = resolve(import.meta.dir, "..")
const DOCS = resolve(ROOT, "docs")
const ARGS = process.argv.slice(2)
const JSON_OUT = ARGS.includes("--json")
const CHECK = ARGS.includes("--check")
const PREFIX = (ARGS.find(a => a.startsWith("--prefix=")) ?? "").split("=")[1]?.toUpperCase()

// The grep-assigned ledger ID spaces (llm-wiki-schema / loop-of-loops). ADR/SESSION/LR numbers
// come from filenames, not doc greps, so they are out of scope here. RISK uses bare `#N` — too
// generic to grep safely — and stays manual.
const PREFIXES = ["G", "FS", "D", "FI", "MB", "TFF", "INC", "TD", "WL-P1", "WL-P2", "WL-P3"] as const

function walkMarkdown(dir: string): string[] {
  const out: string[] = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) out.push(...walkMarkdown(p))
    else if (e.name.endsWith(".md")) out.push(p)
  }
  return out
}

const FILES = walkMarkdown(DOCS).map(p => ({ path: p, rel: relative(ROOT, p), text: readFileSync(p, "utf-8") }))

/** Every number in use for a prefix, across all occurrences (references included, archives included). */
function usedNumbers(prefix: string): { numbers: Set<number>; padWidth: number } {
  const re = new RegExp(`\\b${prefix.replaceAll("-", "\\-")}-(\\d+)\\b`, "g")
  const numbers = new Set<number>()
  const padCounts = new Map<number, number>()
  for (const f of FILES) {
    for (const m of f.text.matchAll(re)) {
      const digits = m[1] as string
      numbers.add(Number.parseInt(digits, 10))
      padCounts.set(digits.length, (padCounts.get(digits.length) ?? 0) + 1)
    }
  }
  const padWidth = [...padCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 3
  return { numbers, padWidth }
}

/**
 * Definition sites for a full ID: an `ID —` em-dash heading (ledger convention: `### FS-0030 — …`,
 * `#### MB-003 — …`) or a table row with the ID as its first cell (`| WL-P2-9 |`, `| FI-020 |`).
 * A heading that merely *mentions* the ID (`### FI-019 design implication`) is a reference.
 */
function definitionSites(prefix: string, n: number, text: string, rel: string): string[] {
  const sites: string[] = []
  // `0*` mirrors the FS-0030 grep rule — `WL-P2-6` and `WL-P2-06` are the same ID.
  const escaped = `${prefix.replaceAll("-", "\\-")}-0*${n}(?!\\d)`
  const headingRe = new RegExp(`^#{1,6}\\s+\`?\\*{0,2}${escaped}\\*{0,2}\`?\\s+—`)
  const rowRe = new RegExp(`^\\|\\s*\`?\\*{0,2}${escaped}\\*{0,2}\`?\\s*\\|`)
  text.split("\n").forEach((line, i) => {
    if (headingRe.test(line) || rowRe.test(line)) sites.push(`${rel}:${i + 1}`)
  })
  return sites
}

/** Append-only history that legitimately restates ledger rows — excluded from the dup check. */
const HISTORY_PREFIXES = ["docs/_archive/", "docs/sprints/", "docs/ronin_dojo_baseline_systems_pack/"]

if (CHECK) {
  const liveFiles = FILES.filter(f => !HISTORY_PREFIXES.some(p => f.rel.startsWith(p)))
  const dupes: { id: string; sites: string[] }[] = []
  const phantoms: string[] = []
  for (const prefix of PREFIXES) {
    const { numbers, padWidth } = usedNumbers(prefix)
    for (const n of numbers) {
      const id = `${prefix}-${String(n).padStart(padWidth, "0")}`
      const sites = liveFiles.flatMap(f => definitionSites(prefix, n, f.text, f.rel))
      if (sites.length > 1) dupes.push({ id, sites })
      // Phantom = referenced somewhere yet defined NOWHERE, history included.
      if (sites.length === 0 && !FILES.some(f => definitionSites(prefix, n, f.text, f.rel).length > 0)) {
        phantoms.push(id)
      }
    }
  }
  dupes.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
  phantoms.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  if (JSON_OUT) {
    console.log(JSON.stringify({ dupes, phantoms }, null, 2))
  } else {
    if (dupes.length === 0) {
      console.log("\n  No ledger ID is defined in more than one place (history excluded). Clean.")
    } else {
      console.log(`\n  ${dupes.length} ledger ID(s) defined in more than one place (FS-0030 class):\n`)
      for (const d of dupes) {
        console.log(`  ${d.id}`)
        for (const s of d.sites) console.log(`    ${s}`)
      }
      console.log("\n  Each ID must have ONE defining row/heading; every other mention is a reference.")
    }
    if (phantoms.length > 0) {
      console.log(`\n  ${phantoms.length} phantom ID(s) — referenced in docs/ but defined nowhere (informational):`)
      console.log(`  ${phantoms.join(", ")}`)
      console.log("  These numbers stay retired (next-free skips past them); fix the citing doc only if it misleads.")
    }
    console.log("")
  }
  process.exit(dupes.length === 0 ? 0 : 1)
}

if (!PREFIX) {
  console.error(`Usage: bun scripts/ledger-id-next.ts --prefix=<${PREFIXES.join("|")}> | --check [--json]`)
  process.exit(2)
}
if (!(PREFIXES as readonly string[]).includes(PREFIX)) {
  console.error(`Unknown prefix "${PREFIX}". Known: ${PREFIXES.join(", ")} (RISK is manual — bare #N is too generic to grep).`)
  process.exit(2)
}

const { numbers, padWidth } = usedNumbers(PREFIX)
const max = numbers.size === 0 ? 0 : Math.max(...numbers)
const next = `${PREFIX}-${String(max + 1).padStart(padWidth, "0")}`
if (JSON_OUT) {
  console.log(JSON.stringify({ prefix: PREFIX, used: numbers.size, max, next }))
} else {
  console.log(`\n  ${PREFIX}: ${numbers.size} number(s) in use, highest ${PREFIX}-${String(max).padStart(padWidth, "0")}.`)
  console.log(`  Next free ID: ${next}`)
  console.log(`  (max+1 over every occurrence in docs/ incl. archives — gap numbers are retired, never reuse them.)\n`)
}
