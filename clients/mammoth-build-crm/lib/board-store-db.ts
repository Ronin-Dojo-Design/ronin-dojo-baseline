"use client";

/**
 * DB-backed BoardStore adapter (ADR 0033 D2 + ADR 0038 Phase 2).
 *
 * The AdminKanban kernel persists through the `BoardStore` port; swapping the
 * adapter — not the board — is what makes "brand/storage agnostic" true. This
 * replaces `createLocalStorageBoardStore` with one backed by `mammoth_dev`:
 *   - `load`  → the Project rows projected to kernel cards (`projectToCard`);
 *   - `save`  → reconcile the cards back into Project rows.
 *
 * `load` never returns `null` (always a BoardState), so the kernel's `seed`
 * path is unused — the DB is the single source of truth. Both surfaces (this
 * board + the project-detail `useProjects`) now read/write the same Projects.
 */

import type { BoardState, BoardStore } from "@ronin-dojo/ui-kit/kanban";
import { listProjects, reconcileBoard } from "./actions";
import { projectToCard } from "./board-config";

export function createDbBoardStore(): BoardStore {
  return {
    async load(configId) {
      const projects = await listProjects();
      return { configId, cards: projects.map(projectToCard) };
    },
    async save(state: BoardState) {
      await reconcileBoard(state.cards);
    },
  };
}
