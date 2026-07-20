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
 *
 * `sourceFilter` (SESSION_0586, G-021 loop 3b — read-side only) narrows `load`'s
 * result to one Lead Source. The kernel (`AdminKanban`/`useBoard`) has no filter
 * prop and only reloads when its `config.id` changes, so the page achieves the
 * filter by remounting AdminKanban (`key={sourceFilter}`) over a freshly built
 * store instead — `save`/`reconcileBoard` is untouched either way, and a
 * `reconcileBoard` call only ever touches the cards it's given, so persisting a
 * filtered subset never drops the rows that were filtered out of view.
 *
 * `onAfterSave` (SESSION_0588) is an optional post-persist seam so the page can
 * refresh out-of-band derived reads (the Lead Source facet counts) after the
 * board reconciles. A lead added via the intake column stamps a new source, so
 * the counts are no longer immutable after mount — the callback fires once
 * `reconcileBoard` resolves so the facet re-tallies without a full reload.
 */

import type { BoardState, BoardStore } from "@ronin-dojo/ui-kit/kanban";
import { listProjects, reconcileBoard } from "./actions";
import { projectToCard } from "./board-config";
import type { LeadSourceValue } from "./lead-source";

export function createDbBoardStore(
  sourceFilter?: LeadSourceValue | null,
  onAfterSave?: () => void,
): BoardStore {
  return {
    async load(configId) {
      const projects = await listProjects();
      const visible = sourceFilter
        ? projects.filter((project) => project.source === sourceFilter)
        : projects;
      return { configId, cards: visible.map(projectToCard) };
    },
    async save(state: BoardState) {
      await reconcileBoard(state.cards);
      onAfterSave?.();
    },
  };
}
