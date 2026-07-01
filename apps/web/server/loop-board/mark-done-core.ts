import { LOOP_BOARD_CONFIG_ID } from "~/lib/loop-board/board-config"
import { db } from "~/services/db"

/**
 * The single predicate that moves a projected ledger card into the terminal `done` stage — the ONE place the
 * where-clause lives (SESSION_0476, F2). Shared by the `"use server"` `markCardDone` action (the authenticated
 * in-app path, in `./board-store`) and the headless `scripts/board-mark-done.ts` bow-out runner (session-free).
 *
 * Keyed on the `@@unique([configId, source, sourceRef])`, so `updateMany` touches at most one row and is a
 * clean no-op (count 0) on a stale/unknown `sourceRef` rather than a throw. Returns the number of cards moved.
 *
 * Deliberately a plain module (no `"use server"`, no permission gate): the two entry points own their own
 * trust context — the route-layer gate for the in-app action, a trusted local operator for the CLI — exactly
 * as `sync.ts`'s insert-only importer does. Keeping the predicate here means a later filter change lands in one
 * spot instead of drifting between the action and the script.
 */
export async function markLedgerCardDone(
  sourceRef: string,
  configId: string = LOOP_BOARD_CONFIG_ID,
): Promise<number> {
  const { count } = await db.kanbanCard.updateMany({
    where: { configId, source: "ledger", sourceRef },
    data: { stage: "done" },
  })
  return count
}
