import { SquareKanbanIcon } from "lucide-react"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { fetchLedgerBacklog } from "~/lib/loop-board/fetch-ledgers"
import { computeHealth } from "~/lib/loop-board/health"
import type { Priority } from "~/lib/loop-board/ledger-parse"
import { cx } from "~/lib/utils"

const PRIORITY_DOT: Record<Priority, string> = {
  P0: "bg-red-500",
  P1: "bg-amber-500",
  P2: "bg-muted-foreground",
  "—": "bg-muted-foreground/40",
}

const PRIORITY_LABEL: Record<Priority, string> = { P0: "P0", P1: "P1", P2: "P2", "—": "Other" }

/**
 * Compact loop-board embed — the AdminTODOist glance (ratified G-003): the live
 * shared ledger backlog health + a jump into the full editable board. This IS the
 * AdminTODOist; it deliberately does NOT revive a personal-todo surface.
 *
 * Async server component — stream it under `<Suspense>` so the GitHub-backed ledger
 * fetch never blocks the landing's first paint. Reads via `fetchLedgerBacklog`
 * (revalidate-cached ~60s), NOT `syncLedgersForConfig` — the glance needs no
 * KanbanCard insert side-effect. The full interactive `AdminKanban` lives at
 * `/app/loop-board`; mounting it inline is deferred (its client legacy-task
 * migration effect can reload the page — unwanted on the landing; a compact board
 * variant is WS-3/WS-5 work once `loop-board.tsx` is in scope).
 */
export async function LoopBoardEmbed() {
  let health: ReturnType<typeof computeHealth>
  try {
    const backlog = await fetchLedgerBacklog()
    health = computeHealth(backlog.items)
  } catch {
    // A ledger-fetch failure is a quiet fallback, never a broken landing.
    health = { total: 0, byPriority: [], byLedger: [] }
  }

  const activePriorities = health.byPriority.filter(p => p.count > 0)

  return (
    <Card hover={false} className="gap-4">
      <Stack className="w-full items-center justify-between">
        <Stack size="sm" className="items-center">
          <SquareKanbanIcon className="size-5 text-primary" />
          <H4>Loop board</H4>
          <Badge variant="outline" size="sm">
            {health.total} open
          </Badge>
        </Stack>

        <Button size="sm" variant="secondary" render={<Link href="/app/loop-board" />}>
          Open board
        </Button>
      </Stack>

      {activePriorities.length > 0 ? (
        <Stack size="sm" className="w-full">
          {activePriorities.map(p => (
            <span
              key={p.priority}
              className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs"
            >
              <span className={cx("size-1.5 rounded-full", PRIORITY_DOT[p.priority])} />
              {PRIORITY_LABEL[p.priority]} {p.count}
            </span>
          ))}
        </Stack>
      ) : (
        <Note>Backlog clear — new ledger items auto-import onto the board.</Note>
      )}

      <Note>Shared ledger backlog. Open the board to drag, add, or mark items done.</Note>
    </Card>
  )
}
