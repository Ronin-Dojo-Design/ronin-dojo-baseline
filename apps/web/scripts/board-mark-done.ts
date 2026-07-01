import "dotenv/config"

/**
 * board-mark-done.ts — the HEADLESS "bow-out → board" writer (SESSION_0476).
 *
 * The CLI twin of `server/loop-board/board-store.ts`'s `markCardDone` server action: it moves a resolved
 * ledger card into the terminal `done` stage by its stable `sourceRef` (`CODE:id`, e.g. `GL:G-003` /
 * `RISK:#9`). The server action is the correct IN-APP path — but it's a `"use server"` action gated by
 * `requirePermission(loopBoard)`, which reads the request session/cookies and therefore THROWS when
 * imported into a headless `bun scripts/*` bow-out runner (no session). So the bow-out ritual needs this
 * session-free path.
 *
 * Same trust boundary as `server/loop-board/sync.ts` (hits `db` directly with no permission gate — the gate
 * lives at the route layer) and the sibling reader `scripts/board-backlog.ts` (runs headless via a direct
 * `~/services/db` import). It shares the ONE mark-done predicate with the `markCardDone` server action via
 * `server/loop-board/mark-done-core.ts` (`markLedgerCardDone` — `source: "ledger"`, keyed on the
 * `(configId, source, sourceRef)` unique, `updateMany` so a stale/unknown `sourceRef` is a clean no-op rather
 * than a throw). This is a trusted local-operator script, so it calls the core directly with no auth gate.
 *
 * DB-backed on purpose — that is why it lives HERE (under `apps/web`, run as `cd apps/web && bun
 * scripts/board-mark-done.ts <sourceRef>...`), using the SAME connection recipe as `board-backlog.ts`
 * (`dotenv/config` + `~/services/db`) — no new connection path invented.
 *
 * Usage:
 *   cd apps/web && bun scripts/board-mark-done.ts GL:G-003 RISK:#9   # move one or more cards to Done
 *   cd apps/web && bun scripts/board-mark-done.ts GL:G-003 --json    # machine-readable JSON
 *   cd apps/web && bun scripts/board-mark-done.ts                    # prints usage, exits 0
 */

import { markLedgerCardDone } from "~/server/loop-board/mark-done-core"

const ARGS = process.argv.slice(2)
const JSON_OUT = ARGS.includes("--json")
const SOURCE_REFS = ARGS.filter(a => !a.startsWith("--"))

async function main() {
  if (SOURCE_REFS.length === 0) {
    console.log(
      "Usage: bun scripts/board-mark-done.ts <sourceRef>... [--json]   (e.g. GL:G-003 RISK:#9)",
    )
    process.exit(0)
  }

  // The shared `markLedgerCardDone` core owns the predicate (`source: "ledger"`, keyed on the
  // `(configId, source, sourceRef)` unique) so it touches at most one row per ref. A no-op (count 0) means the
  // card is already done or was never on the board; not an error.
  const results: { sourceRef: string; moved: boolean }[] = []
  for (const sourceRef of SOURCE_REFS) {
    const count = await markLedgerCardDone(sourceRef)
    results.push({ sourceRef, moved: count > 0 })
  }

  if (JSON_OUT) {
    console.log(JSON.stringify(results, null, 2))
    process.exit(0)
  }

  const movedCount = results.filter(r => r.moved).length
  console.log(
    `\nLOOP-BOARD MARK-DONE — ${results.length} sourceRef(s) processed (KanbanCard, source=ledger)\n`,
  )
  for (const r of results) {
    console.log(
      `  ${r.sourceRef.padEnd(20)}${r.moved ? "moved → done" : "no-op (already done / not on board)"}`,
    )
  }
  console.log(`\n  Total moved: ${movedCount} of ${results.length}\n`)
}

main().catch((e: unknown) => {
  // A fresh worktree may have no reachable DB (no `.env` / no Postgres). Fail with a clear one-liner,
  // not a stack trace — mirrors board-backlog's resilient DB-unreachable degradation.
  const msg = e instanceof Error ? e.message : String(e)
  console.error(
    "board-mark-done: could not reach the loop-board (DB unreachable?). " +
      "Ensure apps/web `.env` is set and Postgres is up, then re-run from apps/web.",
  )
  console.error(`  (${msg.split("\n")[0]})`)
  process.exit(1)
})
