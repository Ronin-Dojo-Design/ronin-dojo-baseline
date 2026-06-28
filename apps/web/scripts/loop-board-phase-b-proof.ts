import "dotenv/config"

import type { BoardCard } from "@ronin-dojo/ui-kit/kanban"
import { db } from "~/services/db"
import {
  cardToManualCreate,
  cardToUpdate,
  legacyTaskToCreate,
  rowToBoardCard,
} from "~/server/loop-board/map-card"

/**
 * SESSION_0461 (G-003) — loop-board Phase B data-layer proof. Local-only, against `ronindojo_prodsnap`.
 *
 * Proves the persistence + anti-drift invariants WITHOUT the auth gate or a browser, on a THROWAWAY
 * configId (never touches the real `ronin-loop-board` rows), cleaned up at the end:
 *   1. The ledger importer (`createMany skipDuplicates`) is INSERT-ONLY + idempotent.
 *   2. THE ANTI-DRIFT INVARIANT: re-importing after an operator edit does NOT revert the edit.
 *   3. `importTasks` (legacy localStorage lift) is idempotent.
 *   4. `saveBoard` is UPSERT-ONLY (never deletes — check #6 proves an unreferenced card survives);
 *      `loadBoard` round-trips the edited state.
 *
 * Run:  cd apps/web && bun scripts/loop-board-phase-b-proof.ts
 */

const CONFIG = `ronin-loop-board-proof-${process.pid}`
const fail: string[] = []
function check(label: string, ok: boolean) {
  console.log(`${ok ? "✓" : "✗"} ${label}`)
  if (!ok) fail.push(label)
}

// Two synthetic "ledger" cards (same shape itemToBoardCard emits: stable `CODE:id`, badges, INERT ts).
const INERT = "1970-01-01T00:00:00.000Z"
const ledgerCards: BoardCard[] = [
  {
    id: "GL:G-PROOF-1",
    stage: "backlog",
    title: "Proof goal one",
    status: "active",
    badges: [{ label: "GL:G-PROOF-1", tone: "positive" }],
    createdAt: INERT,
    updatedAt: INERT,
  },
  {
    id: "RISK:#PROOF",
    stage: "blocked",
    title: "Proof risk",
    status: "active",
    badges: [{ label: "RISK #PROOF", tone: "warning" }],
    createdAt: INERT,
    updatedAt: INERT,
  },
]

async function importLedger(cards: BoardCard[]) {
  // Mirrors server/loop-board/sync.ts importLedgerCards (insert-only).
  const res = await db.kanbanCard.createMany({
    data: cards.map(c => ({
      id: c.id,
      configId: CONFIG,
      source: "ledger",
      sourceRef: c.id,
      stage: c.stage,
      title: c.title,
      status: c.status ?? null,
      badges: c.badges as object,
    })),
    skipDuplicates: true,
  })
  return res.count
}

async function main() {
  // 0. Clean slate.
  await db.kanbanCard.deleteMany({ where: { configId: CONFIG } })

  // 1. Import is insert-only + idempotent.
  const firstInsert = await importLedger(ledgerCards)
  check("import inserts both ledger cards (2)", firstInsert === 2)
  const secondInsert = await importLedger(ledgerCards)
  check("re-import inserts 0 (idempotent skipDuplicates)", secondInsert === 0)

  // 2. Operator EDIT: move GL:G-PROOF-1 backlog→in-progress + retitle (simulates saveBoard's upsert).
  const edited: BoardCard = {
    ...ledgerCards[0],
    stage: "in-progress",
    title: "Proof goal one — EDITED",
    updatedAt: new Date().toISOString(),
  }
  await db.kanbanCard.upsert({
    where: { id: edited.id },
    create: cardToManualCreate(edited, CONFIG, 0),
    update: cardToUpdate(edited, 0),
  })

  // 3. THE ANTI-DRIFT INVARIANT — re-import the original projection; the edit must survive untouched.
  const reInsert = await importLedger(ledgerCards)
  const afterReimport = await db.kanbanCard.findUnique({ where: { id: "GL:G-PROOF-1" } })
  check("re-import after edit inserts 0 (existing card skipped)", reInsert === 0)
  check(
    "ANTI-DRIFT: edited stage survives re-import (in-progress)",
    afterReimport?.stage === "in-progress",
  )
  check(
    "ANTI-DRIFT: edited title survives re-import (not reverted to projection)",
    afterReimport?.title === "Proof goal one — EDITED",
  )

  // 4. importTasks (legacy localStorage lift) — idempotent.
  const tasks = [
    { id: "t1", title: "Migrated task A", done: false, project: "Inbox" },
    { id: "t2", title: "Migrated task B", done: true, lane: "QF" as const },
  ]
  const t1 = await db.kanbanCard.createMany({
    data: tasks.map(t => legacyTaskToCreate(t, CONFIG)),
    skipDuplicates: true,
  })
  const t2 = await db.kanbanCard.createMany({
    data: tasks.map(t => legacyTaskToCreate(t, CONFIG)),
    skipDuplicates: true,
  })
  check("importTasks lifts 2 tasks", t1.count === 2)
  check("re-import tasks lifts 0 (idempotent)", t2.count === 0)
  const doneTask = await db.kanbanCard.findUnique({ where: { id: "task:t2" } })
  check("done task migrated to 'done' stage", doneTask?.stage === "done")

  // 5. loadBoard round-trip — the edited card reads back edited; counts are right.
  const rows = await db.kanbanCard.findMany({ where: { configId: CONFIG } })
  const board = rows.map(rowToBoardCard)
  check("loadBoard returns all 4 cards (2 ledger + 2 task)", board.length === 4)
  const editedRead = board.find(c => c.id === "GL:G-PROOF-1")
  check("loadBoard round-trips the edit", editedRead?.stage === "in-progress")

  // 6. ANTI-RACE: a stale hydrate-save (upsert-only, set MISSING an importer card the kernel hadn't
  //    loaded yet) must NOT wipe that importer card — saveBoard never deletes.
  const staleSet = board.filter(c => c.id !== "RISK:#PROOF")
  await db.$transaction(
    staleSet.map(card =>
      db.kanbanCard.upsert({
        where: { id: card.id },
        create: cardToManualCreate(card, CONFIG, 0),
        update: cardToUpdate(card, 0),
      }),
    ),
  )
  const survived = await db.kanbanCard.findUnique({ where: { id: "RISK:#PROOF" } })
  check(
    "ANTI-RACE: upsert-only save leaves an unreferenced importer card intact",
    survived !== null,
  )

  // Cleanup.
  await db.kanbanCard.deleteMany({ where: { configId: CONFIG } })

  console.log(fail.length === 0 ? "\nALL PASS ✅" : `\n${fail.length} FAILED ❌`)
  process.exit(fail.length === 0 ? 0 : 1)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
