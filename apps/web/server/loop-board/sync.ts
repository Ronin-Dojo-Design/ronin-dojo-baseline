/**
 * Ledger → KanbanCard importer (loop-board Phase B, G-003). Server-only (not a `"use server"` action):
 * it is called from the gated `/app/loop-board` server page, not over the network.
 *
 * The anti-drift rule (learning 0004): this is a ONE-WAY, INSERT-ONLY importer. It uses
 * `createMany({ skipDuplicates })` keyed on the stable ledger id, so it only ever ADDS ledger items that
 * have no card yet — it never updates or deletes. Once a card exists, the `KanbanCard` table owns its
 * state; the projection can no longer touch it. That is what keeps the table the single source of truth.
 */

import "server-only"
import { itemsToBoardCards } from "~/lib/loop-board/board-config"
import { fetchLedgerBacklog, type LedgerBacklog } from "~/lib/loop-board/fetch-ledgers"
import { db } from "~/services/db"
import { ledgerCardToCreate } from "./map-card"

/** Insert any projected ledger item that has no card yet. Returns the number of new cards inserted. */
async function importLedgerCards(configId: string, items: LedgerBacklog["items"]): Promise<number> {
  const cards = itemsToBoardCards(items)
  if (cards.length === 0) {
    return 0
  }
  const result = await db.kanbanCard.createMany({
    data: cards.map(c => ledgerCardToCreate(c, configId)),
    skipDuplicates: true,
  })
  return result.count
}

/**
 * Fetch the live ledger backlog and import any new items into the board, in one pass. Returns the backlog
 * so the page can reuse the same fetch for the health strip (one network round-trip per load).
 */
export async function syncLedgersForConfig(configId: string): Promise<LedgerBacklog> {
  const backlog = await fetchLedgerBacklog()
  await importLedgerCards(configId, backlog.items)
  return backlog
}
