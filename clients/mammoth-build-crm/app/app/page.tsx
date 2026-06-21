"use client";

import { useMemo } from "react";
import { AdminKanban, createLocalStorageBoardStore } from "@ronin-dojo/ui-kit/kanban";
import { MAMMOTH_BOARD, projectToCard } from "@/lib/board-config";
import { SEED_PROJECTS } from "@/lib/content";

/**
 * Mammoth pipeline (PWCC-004) — bound to the shared AdminKanban kernel (PWCC-007).
 *
 * This page is PURE WIRING: it picks a persistence adapter (localStorage), seeds from the
 * existing demo projects mapped to kernel cards, and mounts the board with the Mammoth
 * BoardConfig. No board logic lives here — the columns, drag, intake, automations, and
 * guards all come from @ronin-dojo/ui-kit. Brand = the token block in app/globals.css.
 */
export default function PipelinePage() {
  const store = useMemo(() => createLocalStorageBoardStore("mbcrm.kanban"), []);
  const seed = useMemo(() => SEED_PROJECTS.map(projectToCard), []);

  return (
    <div>
      <AdminKanban config={MAMMOTH_BOARD} store={store} seed={seed} />
    </div>
  );
}
