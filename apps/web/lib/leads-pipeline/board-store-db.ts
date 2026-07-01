"use client"

/**
 * BBL Lead Pipeline — the DB-backed `BoardStore` adapter (Slice 6, Petey Plan 0477).
 *
 * The `AdminKanban` kernel persists through the `BoardStore` port (ADR 0033 D2);
 * swapping the ADAPTER — not the board — is what makes "brand/storage agnostic" true.
 * This adapter is backed by BBL's OWN `Lead` rows (ADR 0034/0038 — share the kernel,
 * not the data), the SAME shape Mammoth's `createDbBoardStore` and the loop-board's
 * `createServerActionBoardStore` use:
 *   - `load` → BBL leads projected to kernel cards (`pipelineLeadsToCards`);
 *   - `save` → reconcile each card's STAGE back to its `Lead.status`.
 *
 * Reconcile is UPDATE-ONLY: leads are created by the Slice-1 flywheel + the admin
 * leads surface, never from this board (the pipeline is an outreach QUEUE, not an
 * intake form). A card whose stage the kernel didn't change writes the same status
 * (a cheap idempotent no-op); a card unknown to the DB (there is none) is skipped by
 * `updateLeadStatus` returning `null`.
 */

import type { BoardState, BoardStore } from "@ronin-dojo/ui-kit/kanban"
import { isPipelineStageId, pipelineLeadsToCards } from "./board-config"
import { loadPipelineLeads } from "./queries"
import { updateLeadStatus } from "./actions"

export function createLeadsPipelineBoardStore(): BoardStore {
  return {
    async load(configId) {
      const leads = await loadPipelineLeads()
      return { configId, cards: pipelineLeadsToCards(leads) }
    },
    async save(state: BoardState) {
      for (const card of state.cards) {
        if (!isPipelineStageId(card.stage)) {
          continue
        }
        await updateLeadStatus(card.id, card.stage, card.lostReason ?? null)
      }
    },
  }
}
