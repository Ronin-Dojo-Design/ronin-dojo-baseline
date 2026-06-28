"use client"

// The board renders kernel m-cards, so it loads the ui-kit token + card CSS once here
// (same pattern as the legacy AdminTaskBoard route): tokens.css defines the --mk-* vars the
// card reads, m-card.css the .mk-card classes. Both ship from @ronin-dojo/ui-kit.
import "@ronin-dojo/ui-kit/tokens.css"
import "@ronin-dojo/ui-kit/m-card.css"

import { AdminKanban, type BoardCard, createMemoryBoardStore } from "@ronin-dojo/ui-kit/kanban"
import { useMemo } from "react"
import { LOOP_BOARD } from "~/lib/loop-board/board-config"
import type { BacklogHealth } from "~/lib/loop-board/health"
import type { LedgerCode, Priority } from "~/lib/loop-board/ledger-parse"
import { cx } from "~/lib/utils"

type LoopBoardProps = {
  cards: BoardCard[]
  health: BacklogHealth
  source: { repo: string; branch: string }
  failedLedgers: LedgerCode[]
}

const PRIORITY_DOT: Record<Priority, string> = {
  P0: "bg-red-500",
  P1: "bg-amber-500",
  P2: "bg-muted-foreground",
  "—": "bg-muted-foreground/40",
}

const PRIORITY_LABEL: Record<Priority, string> = { P0: "P0", P1: "P1", P2: "P2", "—": "Other" }

/**
 * LoopBoard — pure wiring (like the Mammoth pipeline page): a backlog-health strip + the shared
 * AdminKanban kernel mounted READ-ONLY with the projected ledger cards as its seed. A memory store
 * (no persistence) backs the read-only board; Phase B swaps it for a Prisma adapter to make it editable.
 */
export function LoopBoard({ cards, health, source, failedLedgers }: LoopBoardProps) {
  const store = useMemo(() => createMemoryBoardStore(), [])

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold">{health.total} open</span>
          {health.byPriority
            .filter(p => p.count > 0)
            .map(p => (
              <span
                key={p.priority}
                className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs"
              >
                <span className={cx("size-1.5 rounded-full", PRIORITY_DOT[p.priority])} />
                {PRIORITY_LABEL[p.priority]} {p.count}
              </span>
            ))}
          <span aria-hidden className="text-muted-foreground">
            ·
          </span>
          {health.byLedger
            .filter(l => l.count > 0)
            .map(l => (
              <span
                key={l.code}
                className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground"
              >
                {l.code} {l.count}
              </span>
            ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Live from {source.repo}@{source.branch} · refreshes ~60s · read-only projection (editable
          in Phase B)
          {failedLedgers.length > 0 ? ` · ${failedLedgers.length} ledger(s) unavailable` : ""}
        </p>
      </header>

      <AdminKanban config={LOOP_BOARD} store={store} seed={cards} readOnly />
    </div>
  )
}
