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
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"
import { db } from "~/services/db"
import {
  cardToManualCreate,
  cardToUpdate,
  type LegacyTaskInput,
  legacyTaskToCreate,
  rowToBoardCard,
} from "./map-card"

async function assertLoopBoardAccess() {
  await requirePermission(APP_AREA_PERMISSIONS.loopBoard)
}

/** Load persisted board state, or `null` when nothing is stored yet (kernel then falls back to its seed). */
export async function loadBoard(configId: string): Promise<BoardState | null> {
  await assertLoopBoardAccess()
  const rows = await db.kanbanCard.findMany({
    where: { configId },
    // The kernel re-sorts each column by `updatedAt` desc; this just yields a deterministic initial array.
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
