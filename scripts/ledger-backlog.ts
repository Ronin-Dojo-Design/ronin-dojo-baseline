#!/usr/bin/env bun
/**
 * ledger-backlog.ts
 *
 * Loop-of-Loops P2 (docs/protocols/loop-of-loops-ledger-driven-sessions.md) — the
 * INBOUND backlog aggregator. Greps the governance ledgers for OPEN items and prints
 * one ranked backlog so bow-in can bundle 3-5 coherent items into the Petey plan
 * instead of hand-scanning nine files. Read-only — no schema, no DB, no mutation.
 *
 * The parsing lives in `apps/web/lib/loop-board/ledger-parse.ts` (P3) so ONE aggregator
 * serves both this CLI (reads the ledgers from disk) and the `/app/loop-board` server
 * projection (fetches them from the public `main` branch). This file = the fs reader + the
 * terminal formatter; all parsing is delegated.
 *
 * Ledgers scanned: FS · D · WL · FI · MB · TFF · INC · RISK · TD (see LEDGER_FILES).
 *
 * Usage:
 *   bun scripts/ledger-backlog.ts                 # ranked backlog, all ledgers
 *   bun scripts/ledger-backlog.ts --ledger=WL     # one ledger (FS|D|WL|FI|MB|TFF|INC|RISK|TD)
 *   bun scripts/ledger-backlog.ts --top=20        # cap the rows printed
 *   bun scripts/ledger-backlog.ts --json          # machine-readable JSON
 */

import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import {
  aggregateFromContents,
  LEDGER_FILES,
  LEDGER_ORDER,
  type LedgerCode,
} from "../apps/web/lib/loop-board/ledger-parse"

const ROOT = resolve(import.meta.dir, "..")
const ARGS = process.argv.slice(2)
const JSON_OUT = ARGS.includes("--json")
const LEDGER_FILTER = (ARGS.find(a => a.startsWith("--ledger=")) ?? "").split("=")[1]?.toUpperCase() as
  | LedgerCode
  | undefined
const TOP_ARG = (ARGS.find(a => a.startsWith("--top=")) ?? "").split("=")[1]
const TOP = TOP_ARG ? Number.parseInt(TOP_ARG, 10) : Number.POSITIVE_INFINITY

// Read each ledger from disk; an absent file is left undefined so the parser skips it.
const contents: Partial<Record<LedgerCode, string>> = {}
for (const code of LEDGER_ORDER) {
  const p = resolve(ROOT, LEDGER_FILES[code])
  if (existsSync(p)) contents[code] = readFileSync(p, "utf-8")
}

const items = aggregateFromContents(contents, LEDGER_FILTER ? { ledger: LEDGER_FILTER } : {})

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
