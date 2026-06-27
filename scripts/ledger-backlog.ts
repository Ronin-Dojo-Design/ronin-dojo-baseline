#!/usr/bin/env bun
/**
 * ledger-backlog.ts
 *
 * Loop-of-Loops P2 (docs/protocols/loop-of-loops-ledger-driven-sessions.md) — the
 * INBOUND backlog aggregator. Greps the governance ledgers for OPEN items and prints
 * one ranked backlog so bow-in can bundle 3-5 coherent items into the Petey plan
 * instead of hand-scanning eight files. Read-only — no schema, no DB, no mutation.
 *
 * Ledgers scanned (the inbound sources from the design doc + the security register):
 *   FS   failed-steps-log          docs/protocols/failed-steps-log.md
 *   D    drift-register            docs/knowledge/wiki/drift-register.md
 *   WL   wiring-ledger             docs/knowledge/wiki/wiring-ledger.md
 *   FI   POST_LAUNCH_SOT           docs/product/black-belt-legacy/POST_LAUNCH_SOT.md
 *   MB   manual-boundary-registry  docs/knowledge/wiki/manual-boundary-registry.md
 *   TFF  test-fail-fix-ledger      docs/knowledge/wiki/test-fail-fix-ledger.md
 *   INC  incidents                 docs/knowledge/wiki/incidents.md
 *   RISK ronin-security-risk-register docs/security/ronin-security-risk-register.md
 *
 * Usage:
 *   bun scripts/ledger-backlog.ts                 # ranked backlog, all ledgers
 *   bun scripts/ledger-backlog.ts --ledger=WL     # one ledger (FS|D|WL|FI|MB|TFF|INC|RISK)
 *   bun scripts/ledger-backlog.ts --top=20        # cap the rows printed
 *   bun scripts/ledger-backlog.ts --json          # machine-readable JSON
 */

import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

const ROOT = resolve(import.meta.dir, "..")
const ARGS = process.argv.slice(2)
const JSON_OUT = ARGS.includes("--json")
const LEDGER_FILTER = (ARGS.find(a => a.startsWith("--ledger=")) ?? "").split("=")[1]?.toUpperCase()
const TOP_ARG = (ARGS.find(a => a.startsWith("--top=")) ?? "").split("=")[1]
const TOP = TOP_ARG ? Number.parseInt(TOP_ARG, 10) : Number.POSITIVE_INFINITY

type Item = {
  id: string
  ledger: string
  priority: "P0" | "P1" | "P2" | "—"
  status: string
  summary: string
}

// --- priority ranking ------------------------------------------------------
const PRI_SCORE: Record<Item["priority"], number> = { P0: 0, P1: 1, P2: 2, "—": 3 }

// --- shared parsing helpers ------------------------------------------------

/** Read a ledger file; returns "" (and the caller skips it) when absent. */
function read(rel: string): string {
  const p = resolve(ROOT, rel)
  return existsSync(p) ? readFileSync(p, "utf-8") : ""
}

/** Split markdown into `#`-heading sections at an exact level (3 or 4). */
function sections(content: string, level: number): { heading: string; body: string }[] {
  const prefix = `${"#".repeat(level)} `
  const out: { heading: string; body: string }[] = []
  let cur: { heading: string; body: string } | null = null
  for (const line of content.split("\n")) {
    if (line.startsWith(prefix) && line[level] !== "#") {
      if (cur) out.push(cur)
      cur = { heading: line.slice(prefix.length).trim(), body: "" }
    } else if (cur) {
      cur.body += `${line}\n`
    }
  }
  if (cur) out.push(cur)
  return out
}

/** Pull the `- **Status:** …` value out of a section body. */
function statusOf(body: string): string {
  const m = body.match(/[-*]\s*\*\*Status:?\*\*\s*(.+)/i)
  return m ? m[1].trim() : ""
}

/** Parse pipe-table rows (skips the separator + any header row). */
function tableRows(content: string, headerCell0: string): string[][] {
  const rows: string[][] = []
  for (const raw of content.split("\n")) {
    const t = raw.trim()
    if (!t.startsWith("|")) continue
    if (/^\|[\s:|-]+\|?$/.test(t)) continue // separator row
    const cells = t
      .split("|")
      .slice(1, -1)
      .map(c => c.trim())
    if (cells[0] === headerCell0) continue // header row
    rows.push(cells)
  }
  return rows
}

/** Heading "ID — title" → { id, title }. */
function splitHeading(heading: string): { id: string; title: string } {
  const m = heading.match(/^([A-Za-z0-9.\-_/]+)\s*[—–-]\s*(.+)$/)
  return m ? { id: m[1], title: m[2] } : { id: heading.split(/\s+/)[0], title: heading }
}

/** Tidy a cell/title into a one-line summary (strip md links/backticks/bold). */
function clean(s: string, max = 96): string {
  const t = s
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*~]/g, "")
    .replace(/\s+/g, " ")
    .trim()
  return t.length > max ? `${t.slice(0, max - 1)}…` : t
}

const priFromTag = (s: string): Item["priority"] =>
  /\bP0\b/.test(s) ? "P0" : /\bP1\b/.test(s) ? "P1" : /\bP2\b/.test(s) ? "P2" : "—"

// --- per-ledger extractors -------------------------------------------------

function parseSectioned(
  content: string,
  ledger: string,
  level: number,
  idRe: RegExp,
  isOpen: (status: string) => boolean,
): Item[] {
  return sections(content, level)
    .filter(s => idRe.test(s.heading))
    .map(s => {
      const { id, title } = splitHeading(s.heading)
      return { id, ledger, title, status: statusOf(s.body) }
    })
    .filter(s => isOpen(s.status))
    .map(s => ({
      id: s.id,
      ledger,
      priority: priFromTag(`${s.status} ${s.title}`),
      status: clean(s.status || "open", 17),
      summary: clean(s.title),
    }))
}

function parseWiring(content: string): Item[] {
  return tableRows(content, "ID")
    .filter(c => /^WL-P\d/.test(c[0] ?? ""))
    .filter(c => {
      // ✅ is the wiring-ledger's "Fixed/Resolved" marker — it lands in the status cell
      // normally, but a few resolved rows carry it appended to the ID cell instead.
      const status = c[c.length - 1] ?? ""
      return !c[0].includes("✅") && !/^\s*(✅|done\b|resolved\b|fixed\b)/i.test(status)
    })
    .map(c => ({
      id: c[0],
      ledger: "WL",
      priority: (c[0].match(/WL-(P\d)/)?.[1] as Item["priority"]) ?? "—",
      status: "open",
      summary: clean(c[3] ?? c[1] ?? ""),
    }))
}

function parseFeatureIntake(content: string): Item[] {
  return tableRows(content, "ID")
    .filter(c => /^FI-\d/.test(c[0] ?? ""))
    .filter(c => /triaged|in[\s-]?progress/i.test(c[4] ?? ""))
    .map(c => ({
      id: c[0],
      ledger: "FI",
      priority: priFromTag(c[3] ?? ""),
      status: clean(c[4] ?? "", 16),
      summary: clean(c[1] ?? ""),
    }))
}

function parseIncidents(content: string): Item[] {
  return tableRows(content, "Date")
    .filter(c => c.length >= 6 && /^\d{4}-\d{2}-\d{2}$/.test(c[0] ?? ""))
    .filter(c => (c[5] ?? "").length === 0) // empty "Resolved by" → still open
    .map(c => ({
      id: `${c[0]}/${c[1]}`,
      ledger: "INC",
      priority: "P0" as const, // an unresolved incident is always top-of-mind
      status: "unresolved",
      summary: clean(`${c[2]}: ${c[3]}`),
    }))
}

function parseRisk(content: string): Item[] {
  return tableRows(content, "Priority")
    .filter(c => /^\d+$/.test(c[0] ?? ""))
    .filter(c => {
      const row = c.join(" | ")
      return !/~~|superseded|shelved|→\s*N\/A|✅|\bresolved\b|confirmed fixed/i.test(row)
    })
    .map(c => {
      const sev = c[2] ?? ""
      const priority: Item["priority"] = /critical/i.test(sev)
        ? "P0"
        : /high/i.test(sev)
          ? "P1"
          : "P2"
      return {
        id: `#${c[0]}`,
        ledger: "RISK",
        priority,
        status: clean(sev || "open", 16),
        summary: clean(c[1] ?? ""),
      }
    })
}

// --- collect ---------------------------------------------------------------

const COLLECT: Record<string, () => Item[]> = {
  FS: () =>
    parseSectioned(
      read("docs/protocols/failed-steps-log.md"),
      "FS",
      3,
      /^FS-\d/,
      s => /\bopen\b/i.test(s) || /pending/i.test(s),
    ),
  D: () =>
    parseSectioned(
      read("docs/knowledge/wiki/drift-register.md"),
      "D",
      3,
      /^D-\d/,
      s => /^open\b/i.test(s) || /pending/i.test(s),
    ),
  MB: () =>
    parseSectioned(read("docs/knowledge/wiki/manual-boundary-registry.md"), "MB", 4, /^MB-\d/, s =>
      /^open\b/i.test(s),
    ),
  TFF: () =>
    parseSectioned(read("docs/knowledge/wiki/test-fail-fix-ledger.md"), "TFF", 3, /^TFF-\d+\b/, s =>
      /\bopen\b|investigating/i.test(s),
    ),
  WL: () => parseWiring(read("docs/knowledge/wiki/wiring-ledger.md")),
  FI: () => parseFeatureIntake(read("docs/product/black-belt-legacy/POST_LAUNCH_SOT.md")),
  INC: () => parseIncidents(read("docs/knowledge/wiki/incidents.md")),
  RISK: () => parseRisk(read("docs/security/ronin-security-risk-register.md")),
}

const LEDGER_ORDER = ["FS", "D", "WL", "FI", "MB", "TFF", "INC", "RISK"]

let items: Item[] = []
for (const code of LEDGER_ORDER) {
  if (LEDGER_FILTER && code !== LEDGER_FILTER) continue
  items.push(...COLLECT[code]())
}

// rank: priority → ledger order → id
items.sort((a, b) => {
  const p = PRI_SCORE[a.priority] - PRI_SCORE[b.priority]
  if (p !== 0) return p
  const l = LEDGER_ORDER.indexOf(a.ledger) - LEDGER_ORDER.indexOf(b.ledger)
  if (l !== 0) return l
  return a.id.localeCompare(b.id, undefined, { numeric: true })
})

// --- output ----------------------------------------------------------------

if (JSON_OUT) {
  console.log(JSON.stringify(items, null, 2))
  process.exit(0)
}

const counts = LEDGER_ORDER.map(code => `${code} ${items.filter(i => i.ledger === code).length}`)
const shown = items.slice(0, TOP)

console.log(
  `\nLOOP-OF-LOOPS BACKLOG — ${items.length} open item(s)${LEDGER_FILTER ? ` in ${LEDGER_FILTER}` : ""} (read-only; ledgers are the backlog)\n`,
)
console.log(
  `  ${"PRI".padEnd(4)}${"ID".padEnd(14)}${"LEDGER".padEnd(8)}${"STATUS".padEnd(18)}SUMMARY`,
)
console.log(`  ${"-".repeat(4)}${"-".repeat(14)}${"-".repeat(8)}${"-".repeat(18)}${"-".repeat(40)}`)
for (const i of shown) {
  console.log(
    `  ${i.priority.padEnd(4)}${i.id.padEnd(14)}${i.ledger.padEnd(8)}${i.status.padEnd(18)}${i.summary}`,
  )
}
if (shown.length < items.length)
  console.log(`  … ${items.length - shown.length} more (raise --top)`)
console.log(`\n  By ledger: ${counts.join(" · ")}`)
console.log(
  "\n  Bow-in: bundle 3-5 coherent items (one axis — domain hub / risk class / deploy unit).",
)
console.log("  Spec: docs/protocols/loop-of-loops-ledger-driven-sessions.md\n")
