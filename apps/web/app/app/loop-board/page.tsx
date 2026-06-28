import type { Metadata } from "next"
import { LoopBoard } from "~/app/app/loop-board/_components/loop-board"
import { Wrapper } from "~/components/common/wrapper"
import { LOOP_BOARD_CONFIG_ID } from "~/lib/loop-board/board-config"
import { computeHealth } from "~/lib/loop-board/health"
import { syncLedgersForConfig } from "~/server/loop-board/sync"

export const metadata: Metadata = {
  title: "Loop Board",
}

// Always render fresh; the underlying ledger fetch is itself `revalidate`-cached (~60s) so this is
// near-realtime without hammering GitHub per request.
export const dynamic = "force-dynamic"

/**
 * /app/loop-board — the shared, editable, DB-backed AdminKanban (Loop-of-Loops P3, Phase B).
 *
 * On each load we sync the live ledger projection INTO the board (insert-only — new backlog items
 * appear automatically, existing cards are never touched), then the client board loads its persisted
 * state from `KanbanCard` via the Prisma `BoardStore`. The `KanbanCard` table is the single source of
 * truth: edits (drag/add/done) persist; the projection can only ever add, so it can't cause drift.
 * The health strip reuses the same ledger fetch (one round-trip) to show live backlog totals.
 */
export default async function Page() {
  const { items, source, failedLedgers } = await syncLedgersForConfig(LOOP_BOARD_CONFIG_ID)

  return (
    <Wrapper size="lg" gap="sm">
      <LoopBoard health={computeHealth(items)} source={source} failedLedgers={failedLedgers} />
    </Wrapper>
  )
}
