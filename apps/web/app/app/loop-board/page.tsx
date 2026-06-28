import type { Metadata } from "next"
import { LoopBoard } from "~/app/app/loop-board/_components/loop-board"
import { Wrapper } from "~/components/common/wrapper"
import { itemsToBoardCards } from "~/lib/loop-board/board-config"
import { fetchLedgerBacklog } from "~/lib/loop-board/fetch-ledgers"
import { computeHealth } from "~/lib/loop-board/health"

export const metadata: Metadata = {
  title: "Loop Board",
}

// Always render fresh; the underlying ledger fetches are themselves `revalidate`-cached
// (~60s) so this is near-realtime without hammering GitHub per request.
export const dynamic = "force-dynamic"

/**
 * /app/loop-board — the shared, ledger-backed AdminKanban (Loop-of-Loops P3, Phase A).
 *
 * Server-projects the 9 governance ledgers (read live from the public `main` branch) onto the
 * shared kanban kernel as a READ-ONLY board, so every admin (Brian + Tony) sees the same
 * near-realtime backlog status. Editable persistence (drag/add) lands in Phase B.
 */
export default async function Page() {
  const { items, source, failedLedgers } = await fetchLedgerBacklog()

  return (
    <Wrapper size="lg" gap="sm">
      <LoopBoard
        cards={itemsToBoardCards(items)}
        health={computeHealth(items)}
        source={source}
        failedLedgers={failedLedgers}
      />
    </Wrapper>
  )
}
