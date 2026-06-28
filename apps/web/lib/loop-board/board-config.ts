/**
 * Loop-board — the ONE per-project file binding the ledger backlog to the shared
 * AdminKanban kernel (PWCC-007), exactly like `clients/mammoth-build-crm/lib/board-config.ts`.
 *
 * The board is config + data (ADR 0033 D5): this file is a pure `BoardConfig` (workflow
 * stages) + an `Item → BoardCard` mapper. No board logic lives here — columns, drag (Phase B),
 * and rendering all come from `@ronin-dojo/ui-kit/kanban`. Phase A renders it `readOnly`.
 */

import type { BoardCard, BoardConfig, MCardBadge, MCardTone } from "@ronin-dojo/ui-kit"
import type { Item, Priority } from "./ledger-parse"

const LOOP_BOARD_CONFIG_ID = "ronin-loop-board"

/**
 * Workflow axis (not ledger columns): cards flow Backlog → In Progress → Blocked → Done.
 * An editable board needs a meaningful drag axis; ledger + priority ride as card badges and
 * the per-ledger counts live in the health strip. Phase A is read-only (no drag), but the
 * axis is chosen so Phase B's drag/persist needs no rework. No SLA/rotting automations — a
 * static projection has no activity clock, so nothing should be flagged at-risk.
 */
export const LOOP_BOARD: BoardConfig = {
  id: LOOP_BOARD_CONFIG_ID,
  title: "Loop of Loops · Ledger Backlog",
  brand: "bbl",
  cardKind: "task",
  stages: [
    { id: "backlog", name: "Backlog", gate: "Open ledger items", intake: true },
    { id: "in-progress", name: "In Progress", gate: "Being worked this session" },
    { id: "blocked", name: "Blocked", gate: "Incident / waiting on a gate" },
    { id: "done", name: "Done", gate: "Resolved (persisted in Phase B)", terminal: true },
  ],
  automations: [],
}

// Inert timestamps: the projection has no activity clock and runs no SLA/rotting automation,
// so these are never read — a constant keeps the mapper pure (no Date in render/tests).
const INERT_TS = "1970-01-01T00:00:00.000Z"

const PRIORITY_TONE: Record<Priority, MCardTone | null> = {
  P0: "critical",
  P1: "warning",
  P2: "neutral",
  "—": null,
}

/** Default workflow stage for an open item from its ledger + status text. */
function stageForItem(item: Item): string {
  if (item.ledger === "INC") return "blocked"
  if (/in[-\s]?progress|investigating/i.test(item.status)) return "in-progress"
  return "backlog"
}

/** Compact, informative ledger badge — the id already carries the prefix for most ledgers. */
function ledgerBadge(item: Item): MCardBadge {
  if (item.ledger === "RISK") return { label: `RISK ${item.id}`, tone: "warning" }
  if (item.ledger === "INC") return { label: "INC", tone: "critical" }
  return { label: item.id, tone: "neutral" }
}

/** Map one aggregated ledger `Item` to a kernel `BoardCard` (read-only projection). */
export function itemToBoardCard(item: Item): BoardCard {
  const badges: MCardBadge[] = [ledgerBadge(item)]
  const priTone = PRIORITY_TONE[item.priority]
  if (priTone) badges.push({ label: item.priority, tone: priTone })

  return {
    // Ledger-scoped id guarantees uniqueness across ledgers (RISK "#9" vs others) and is the
    // stable key Phase B will use to attach DB deltas / mark-done.
    id: `${item.ledger}:${item.id}`,
    stage: stageForItem(item),
    title: item.summary,
    status: "active",
    badges,
    createdAt: INERT_TS,
    updatedAt: INERT_TS,
  }
}

/** Map the full aggregated backlog to board cards (rank order preserved). */
export function itemsToBoardCards(items: Item[]): BoardCard[] {
  return items.map(itemToBoardCard)
}
