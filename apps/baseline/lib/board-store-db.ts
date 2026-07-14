"use client";

/**
 * DB-backed BoardStore adapter (ADR 0033 D2 + ADR 0038 Phase 2).
 *
 * The AdminKanban kernel persists through the `BoardStore` port; swapping the
 * adapter — not the board — is what makes "storage-agnostic" true. This one is
 * backed by `baseline_dev` via the auth-gated server actions:
 *   - `load`  → the Lead rows projected to kernel cards (`leadToCard`);
 *   - `save`  → reconcile the cards back into Lead rows.
 *
 * `load` never returns `null` (always a BoardState), so the kernel's `seed` path
 * is unused — the DB is the single source of truth.
 */

import type { BoardState, BoardStore } from "@ronin-dojo/ui-kit/kanban";
import { listLeads, reconcileBoard } from "./actions";
import { leadToCard } from "./board-config";

export function createDbBoardStore(): BoardStore {
  return {
    async load(configId) {
      const leads = await listLeads();
      return { configId, cards: leads.map(leadToCard) };
    },
    async save(state: BoardState) {
      await reconcileBoard(state.cards);
    },
  };
}
