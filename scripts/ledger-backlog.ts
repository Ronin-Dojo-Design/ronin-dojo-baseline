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
 * Ledgers scanned: GL · PR · FS · D · WL · FI · MB · TFF · INC · RISK · TD. `PR` is a LIVE source —
 * queried from `gh pr list` (not a file) and parsed by the SAME `parsePullRequests` the loop-board uses
 * (G-007). Open PRs surface as backlog items: red-CI / changes-requested = P1, draft / clean = P2.
 *
 * Usage:
 *   bun scripts/ledger-backlog.ts                 # ranked backlog, all sources (incl. live PRs)
 *   bun scripts/ledger-backlog.ts --ledger=GL     # one source (GL|PR|FS|D|WL|FI|MB|TFF|INC|RISK|TD)
 *   bun scripts/ledger-backlog.ts --top=20        # cap the rows printed
 *   bun scripts/ledger-backlog.ts --json          # machine-readable JSON
 *   bun scripts/ledger-backlog.ts --no-pr         # skip the live `gh` PR query
 */

import { execFileSync } from "node:child_process"
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import {
  aggregateFromContents,
  FILE_LEDGER_ORDER,
  type FileLedgerCode,
  LEDGER_FILES,
  type LedgerCode,
  LEDGER_ORDER,
  parsePullRequests,
  type PullRequestJson,
} from "../apps/web/lib/loop-board/ledger-parse"
import {
  type GoalDetail,
  parseGoalsDetail,
  parseSessionFile,
  type SessionDetail,
} from "./lib/state-of-project-parse"

const ROOT = resolve(import.meta.dir, "..")
const ARGS = process.argv.slice(2)
const JSON_OUT = ARGS.includes("--json")
const NO_PR = ARGS.includes("--no-pr")
const LEDGER_FILTER = (ARGS.find(a => a.startsWith("--ledger=")) ?? "").split("=")[1]?.toUpperCase() as
  | LedgerCode
  | undefined
const TOP_ARG = (ARGS.find(a => a.startsWith("--top=")) ?? "").split("=")[1]
const TOP = TOP_ARG ? Number.parseInt(TOP_ARG, 10) : Number.POSITIVE_INFINITY

// Read each file-backed ledger from disk; an absent file is left undefined so the parser skips it.
const contents: Partial<Record<FileLedgerCode, string>> = {}
for (const code of FILE_LEDGER_ORDER) {
  const p = resolve(ROOT, LEDGER_FILES[code])
  if (existsSync(p)) contents[code] = readFileSync(p, "utf-8")
}

/**
 * Live `PR` source: shell out to `gh pr list --json …` and parse with the shared `parsePullRequests`.
 * Resilient by design (G-007 "skip cleanly if `gh` absent") — a missing/unauthenticated `gh`, a non-repo
 * cwd, or malformed JSON all degrade to zero PR items with a one-line stderr note, never a crash.
 */
function fetchPullRequestItems() {
  if (NO_PR) return []
  if (LEDGER_FILTER && LEDGER_FILTER !== "PR") return [] // a file-ledger filter never needs the PR query
  try {
    const out = execFileSync(
      "gh",
      [
        "pr",
        "list",
        "--state",
        "open",
        "--limit",
        "100",
        "--json",
        "number,title,headRefName,isDraft,reviewDecision,statusCheckRollup",
      ],
      { cwd: ROOT, encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] },
    )
    const prs = JSON.parse(out) as PullRequestJson[]
    return parsePullRequests(prs)
  } catch {
    if (!JSON_OUT) {
      console.error("  (PR source skipped — `gh` unavailable, unauthenticated, or no repo on this cwd)")
    }
    return []
  }
}

const prItems = fetchPullRequestItems()

const items = aggregateFromContents(contents, {
  ...(LEDGER_FILTER ? { ledger: LEDGER_FILTER } : {}),
  extraItems: prItems,
})

/**
 * State-of-the-Dojo feed (SESSION_0585, G-023 child): read `docs/sprints/SESSION_*.md` +
 * the already-loaded `GL` ledger content into the richer `SessionDetail`/`GoalDetail` shapes
 * `scripts/state-of-project.ts` renders from. ADDITIVE ONLY — the pre-existing `items` feed
 * (and the default text output below) is untouched. `goals-ledger.md` is read once already
 * (as `contents.GL`, above) — reused here rather than re-read from disk.
 */
function readSessionsDetail(): SessionDetail[] {
  const dir = resolve(ROOT, "docs/sprints")
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter(f => /^SESSION_\d{4}\.md$/.test(f))
    .map(f => {
      const p = resolve(dir, f)
      return parseSessionFile(p, readFileSync(p, "utf-8"))
    })
    .filter((s): s is SessionDetail => s !== null)
    .sort((a, b) => Number(a.number) - Number(b.number))
}

// --- output ----------------------------------------------------------------

if (JSON_OUT) {
  const sessions = readSessionsDetail()
  const goals: GoalDetail[] = contents.GL ? parseGoalsDetail(contents.GL) : []
  console.log(JSON.stringify({ items, sessions, goals }, null, 2))
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
