"use server"

/**
 * The Prisma `BoardStore` port for the loop-board (Phase B, G-003) — the kernel persists through
 * these server actions (ADR 0033 D2). `loadBoard`/`saveBoard` match the kernel `BoardStore` shape
 * exactly (`load(configId)` / `save(state)`) so the client adapter is a trivial `{ load, save }` with
 * zero envelope-unwrapping. `importTasks` runs the one-time localStorage→DB task migration.
 *
 * `"use server"` modules may only export async functions — the row↔card mappers live in `./map-card`.
 * Every action re-asserts `loop-board.manage` (defense-in-depth behind the route layout gate).
 */

import { revalidatePath } from "next/cache"
import type { BoardState } from "@ronin-dojo/ui-kit/kanban"
import { requirePermission } from "~/lib/auth-guard"
import { LOOP_BOARD_CONFIG_ID } from "~/lib/loop-board/board-config"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"
import { db } from "~/services/db"
import {
  cardToManualCreate,
  cardToUpdate,
  type LegacyTaskInput,
  legacyTaskToCreate,
  rowToBoardCard,
} from "./map-card"
import { markLedgerCardDone } from "./mark-done-core"

async function assertLoopBoardAccess() {
  await requirePermission(APP_AREA_PERMISSIONS.loopBoard)
}

/** Load persisted board state, or `null` when nothing is stored yet (kernel then falls back to its seed). */
export async function loadBoard(configId: string): Promise<BoardState | null> {
  await assertLoopBoardAccess()
  const rows = await db.kanbanCard.findMany({
    where: { configId },
    // The kernel renders each column by `order` asc (falling back to `updatedAt`); match that here so
    // the hydrated array is already in render order.
    orderBy: [{ stage: "asc" }, { order: "asc" }, { updatedAt: "desc" }],
  })
  if (rows.length === 0) {
    return null
  }
  return { configId, cards: rows.map(rowToBoardCard) }
}

/**
 * Persist the whole board document (the kernel debounce-saves the full state). UPSERT-ONLY — never
 * deletes. A card unknown to the DB here is — by construction — a manual operator add (ledger/task cards
 * only enter via their importers), so the create branch always writes `source=manual`; the update branch
 * never touches the immutable origin.
 *
 * Why no delete-reconcile: the importers run out-of-band w.r.t. the kernel's card set (a freshly-imported
 * ledger/task card isn't in the set the kernel hydrate-saves), so a whole-doc "delete what's missing" pass
 * would RACE the importers and wipe just-imported cards. It also has no payoff — the kernel exposes no
 * delete affordance; loop-board items leave the backlog by moving to the Done stage (a persisted edit),
 * never by deletion. If a real delete affordance lands later, add an explicit per-card delete action
 * rather than reviving the whole-doc reconcile.
 */
export async function saveBoard(state: BoardState): Promise<void> {
  await assertLoopBoardAccess()
  const { configId, cards } = state

  // `order` = position within each stage, in the incoming array order.
  const nextOrderForStage = new Map<string, number>()
  const orderById = new Map<string, number>()
  for (const card of cards) {
    const n = nextOrderForStage.get(card.stage) ?? 0
    orderById.set(card.id, n)
    nextOrderForStage.set(card.stage, n + 1)
  }

  await db.$transaction(
    cards.map(card =>
      db.kanbanCard.upsert({
        where: { id: card.id },
        create: cardToManualCreate(card, configId, orderById.get(card.id) ?? 0),
        update: cardToUpdate(card, orderById.get(card.id) ?? 0),
      }),
    ),
  )
  revalidatePath("/app/loop-board")
}

/**
 * Mark a projected ledger card **done** by its stable `sourceRef` (the ledger-scoped `CODE:id`, e.g.
 * `GL:G-003` / `RISK:#9`) — the OUTBOUND half of the read-path loop (SESSION_0476). A bow-out step calls
 * this after a session resolves a backlog item, moving the card into the terminal `done` stage so the
 * operator's board reflects the session's work (closing the write-only gap: nothing else takes a card off
 * the backlog programmatically). This is a normal persisted edit — exactly what dragging a card to Done
 * does — so it obeys the same "the table owns card state" rule and never conflicts with the insert-only
 * projection (learning 0004): the importer skips an already-present card, so a done card stays done.
 *
 * Matching: cards are keyed by the `(configId, source, sourceRef)` unique. A ledger card carries
 * `source="ledger"` and `sourceRef=CODE:id`, so `(LOOP_BOARD_CONFIG_ID, "ledger", sourceRef)` is exact —
 * an `updateMany` (no throw on zero rows) is used so a stale/unknown `sourceRef` is a clean no-op, and the
 * returned count tells the caller whether a card was actually moved. Returns the number of cards updated
 * (0 = no matching open card, 1 = moved to done). `sourceRef` is NOT globally unique in the schema, but is
 * unique within `(configId, source)`, so at most one row matches.
 */
export async function markCardDone(
  sourceRef: string,
  configId: string = LOOP_BOARD_CONFIG_ID,
): Promise<number> {
  await assertLoopBoardAccess()
  const count = await markLedgerCardDone(sourceRef, configId)
  revalidatePath("/app/loop-board")
  return count
}

/**
 * One-time migration of the operator's localStorage AdminTaskBoard tasks into `KanbanCard`. Insert-only
 * (`skipDuplicates`, keyed on `task:<id>`) so a re-run is a harmless no-op. Returns the inserted count.
 */
export async function importTasks(configId: string, tasks: LegacyTaskInput[]): Promise<number> {
  await assertLoopBoardAccess()
  if (tasks.length === 0) {
    return 0
  }
  const result = await db.kanbanCard.createMany({
    data: tasks.map(t => legacyTaskToCreate(t, configId)),
    skipDuplicates: true,
  })
  revalidatePath("/app/loop-board")
  return result.count
}
