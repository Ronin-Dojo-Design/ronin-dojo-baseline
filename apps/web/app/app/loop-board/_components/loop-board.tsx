"use client"

// The board renders kernel m-cards, so it loads the ui-kit token + card CSS once here (same pattern as
// the retired AdminTaskBoard route), IN ORDER: tokens.css defines the --mk-* vars, card.css the ported
// L1 `.mk-surface` shell, m-card.css the board `.mk-card` anatomy. All ship from @ronin-dojo/ui-kit.
import "@ronin-dojo/ui-kit/tokens.css"
import "@ronin-dojo/ui-kit/card.css"
import "@ronin-dojo/ui-kit/m-card.css"

import { AdminKanban } from "@ronin-dojo/ui-kit/kanban"
import { useEffect, useMemo } from "react"
import { LOOP_BOARD, LOOP_BOARD_CONFIG_ID } from "~/lib/loop-board/board-config"
import { createServerActionBoardStore } from "~/lib/loop-board/board-store-client"
import type { BacklogHealth } from "~/lib/loop-board/health"
import type { LedgerCode, Priority } from "~/lib/loop-board/ledger-parse"
import { parseLegacyTaskBoard } from "~/lib/loop-board/parse-legacy-tasks"
import { cx } from "~/lib/utils"
import { importTasks } from "~/server/loop-board/board-store"

type LoopBoardProps = {
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

// One-time lift of the retired localStorage AdminTaskBoard into the unified board (G-003 collapse).
const TASK_MIGRATION_FLAG = "bbl_loopboard_tasks_imported_v1"
const LEGACY_TASKBOARD_KEY = "bbl_admin_taskboard_v1"

/**
 * Migrate the operator's per-browser AdminTaskBoard tasks into `KanbanCard` exactly once, then reload so
 * the migrated cards surface. The flag is set up front so a reload can't re-trigger it; the import itself
 * is idempotent (`skipDuplicates`), so even a race is harmless. Parsing is the pure `parseLegacyTaskBoard`.
 */
function useLegacyTaskMigration() {
  useEffect(() => {
    if (window.localStorage.getItem(TASK_MIGRATION_FLAG)) {
      return
    }
    const tasks = parseLegacyTaskBoard(window.localStorage.getItem(LEGACY_TASKBOARD_KEY))
    window.localStorage.setItem(TASK_MIGRATION_FLAG, "1")
    if (tasks.length === 0) {
      return
    }
    let cancelled = false
    void importTasks(LOOP_BOARD_CONFIG_ID, tasks).then(count => {
      if (!cancelled && count > 0) {
        window.location.reload()
      }
    })
    return () => {
      cancelled = true
    }
  }, [])
}

/**
 * LoopBoard — pure wiring: a backlog-health strip + the shared AdminKanban kernel mounted EDITABLE,
 * persisting to `KanbanCard` through the Prisma `BoardStore` adapter. The server page has already synced
 * the live ledger projection into the table (insert-only), so the kernel's `store.load` returns the
 * current cards; drag/add/done then persist. Phase A's read-only memory store is gone.
 */
export function LoopBoard({ health, source, failedLedgers }: LoopBoardProps) {
  const store = useMemo(() => createServerActionBoardStore(), [])
  useLegacyTaskMigration()

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
          Synced from {source.repo}@{source.branch} · new items auto-import · drag / add / done
          persists
          {failedLedgers.length > 0 ? ` · ${failedLedgers.length} ledger(s) unavailable` : ""}
        </p>
      </header>

      <AdminKanban config={LOOP_BOARD} store={store} />
    </div>
  )
}
