import "dotenv/config"

/**
 * board-backlog.ts — the INBOUND "board → session" reader (SESSION_0476).
 *
 * The other half of `scripts/ledger-backlog.ts`: that CLI ranks the raw ledgers; THIS one reads the
 * operator's actual, prioritized `KanbanCard` board back out of the DB so bow-in can start a session from
 * *the board the operator dragged*, not just the static ledger scan. Until now `KanbanCard` was write-only
 * — the importer/`saveBoard` wrote it and nothing ever read it back, so drag-to-prioritize changed zero
 * session work. This reader closes that: it prints the top-N OPEN cards in the operator's persisted order.
 *
 * DB-backed on purpose — that is why it lives HERE (under `apps/web`, run as `cd apps/web && bun
 * scripts/board-backlog.ts`) and not beside the root `scripts/ledger-backlog.ts`, which is deliberately
 * DB-free / alias-free. It uses the SAME connection recipe as `scripts/loop-board-phase-b-proof.ts`
 * (`dotenv/config` + `~/services/db`) — no new connection path invented.
 *
 * Read-only: it never mutates a card (marking a card done is the OUTBOUND half — `markCardDone` in
 * `server/loop-board/board-store.ts`, called at bow-out).
 *
 * Usage:
 *   cd apps/web && bun scripts/board-backlog.ts           # top 10 open cards in board order
 *   cd apps/web && bun scripts/board-backlog.ts --top=20  # cap the rows printed
 *   cd apps/web && bun scripts/board-backlog.ts --json     # machine-readable JSON
 */

import type { MCardBadge } from "@ronin-dojo/ui-kit"
import { LOOP_BOARD_CONFIG_ID } from "~/lib/loop-board/board-config"
import { db } from "~/services/db"

const ARGS = process.argv.slice(2)
const JSON_OUT = ARGS.includes("--json")
const TOP_ARG = (ARGS.find(a => a.startsWith("--top=")) ?? "").split("=")[1]
const TOP = TOP_ARG ? Math.max(1, Number.parseInt(TOP_ARG, 10)) : 10

/** Stage → sort rank (Blocked/In Progress ride above Backlog — the same "what's hot" ordering bow-in wants). */
const STAGE_RANK: Record<string, number> = { blocked: 0, "in-progress": 1, backlog: 2 }

/** Pull the ledger code / priority tag out of a card's presentation badges for the compact columns. */
function badgeLabels(badges: unknown): string[] {
  if (!Array.isArray(badges)) return []
  return (badges as MCardBadge[])
    .map(b => b.label)
    .filter((l): l is string => typeof l === "string")
}

async function main() {
  const rows = await db.kanbanCard.findMany({
    where: { configId: LOOP_BOARD_CONFIG_ID, stage: { not: "done" } },
    // Operator's prioritization: hottest stage first, then their intra-column `order` (the persisted rank).
    orderBy: [{ stage: "asc" }, { order: "asc" }, { updatedAt: "desc" }],
  })

  // `stage: "asc"` orders alphabetically; re-sort by the intended workflow heat (blocked → in-progress →
  // backlog), preserving each stage's persisted `order`.
  const sorted = [...rows].sort((a, b) => {
    const s = (STAGE_RANK[a.stage] ?? 9) - (STAGE_RANK[b.stage] ?? 9)
    if (s !== 0) return s
    return a.order - b.order
  })

  if (JSON_OUT) {
    console.log(JSON.stringify(sorted.slice(0, TOP), null, 2))
    process.exit(0)
  }

  const shown = sorted.slice(0, TOP)
  const stageCounts = ["blocked", "in-progress", "backlog"].map(
    st => `${st} ${rows.filter(r => r.stage === st).length}`,
  )

  console.log(
    `\nLOOP-BOARD BACKLOG — ${rows.length} open card(s) in the operator's board order (KanbanCard, read-only)\n`,
  )
  console.log(`  ${"STAGE".padEnd(13)}${"ID".padEnd(16)}${"BADGES".padEnd(18)}TITLE`)
  console.log(`  ${"-".repeat(13)}${"-".repeat(16)}${"-".repeat(18)}${"-".repeat(40)}`)
  for (const r of shown) {
    const badges = badgeLabels(r.badges).join(",")
    console.log(
      `  ${r.stage.padEnd(13)}${r.id.padEnd(16)}${badges.slice(0, 17).padEnd(18)}${r.title}`,
    )
  }
  if (shown.length < rows.length)
    console.log(`  … ${rows.length - shown.length} more (raise --top)`)
  console.log(`\n  By stage: ${stageCounts.join(" · ")}`)
  console.log(
    "\n  Bow-in: these are the cards the operator already prioritized — start the session from the top.",
  )
  console.log(
    "  Outbound: bow-out calls markCardDone(sourceRef) to move a resolved card to Done.\n",
  )
}

main().catch((e: unknown) => {
  // A fresh worktree may have no reachable DB (no `.env` / no Postgres). Fail with a clear one-liner,
  // not a stack trace — mirrors ledger-backlog's resilient PR-source degradation.
  const msg = e instanceof Error ? e.message : String(e)
  console.error(
    "board-backlog: could not read the loop-board (DB unreachable?). " +
      "Ensure apps/web `.env` is set and Postgres is up, then re-run from apps/web.",
  )
  console.error(`  (${msg.split("\n")[0]})`)
  process.exit(1)
})
