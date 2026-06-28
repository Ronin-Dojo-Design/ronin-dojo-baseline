/**
 * Loop-board health strip — the non-gimmicky replacement for the legacy Todoist "karma"
 * (TuffBuffs `SprintProgress` carry-forward): at-a-glance backlog totals by priority and ledger.
 * Pure derivation over the aggregated `Item[]`.
 */

import { LEDGER_ORDER, type Item, type LedgerCode, type Priority } from "./ledger-parse"

export type LedgerCount = { code: LedgerCode; count: number }
export type PriorityCount = { priority: Priority; count: number }

export type BacklogHealth = {
  total: number
  byPriority: PriorityCount[]
  byLedger: LedgerCount[]
}

const PRIORITY_ORDER: Priority[] = ["P0", "P1", "P2", "—"]

/** Compute the backlog health summary (total, per-priority, per-ledger). */
export function computeHealth(items: Item[]): BacklogHealth {
  const byPriority = PRIORITY_ORDER.map(priority => ({
    priority,
    count: items.filter(i => i.priority === priority).length,
  }))
  const byLedger = LEDGER_ORDER.map(code => ({
    code,
    count: items.filter(i => i.ledger === code).length,
  }))
  return { total: items.length, byPriority, byLedger }
}
