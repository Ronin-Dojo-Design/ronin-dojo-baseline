"use client";

import { useMemo } from "react";
import { AdminKanban } from "@ronin-dojo/ui-kit/kanban";
import { MAMMOTH_BOARD } from "@/lib/board-config";
import { createDbBoardStore } from "@/lib/board-store-db";

/**
 * Mammoth pipeline (PWCC-004) — bound to the shared AdminKanban kernel (PWCC-007).
 *
 * This page is PURE WIRING: it picks a persistence adapter (the Mammoth Prisma DB,
 * ADR 0038 Phase 2) and mounts the board with the Mammoth BoardConfig. No board logic
 * lives here — the columns, drag, intake, automations, and guards all come from
 * @ronin-dojo/ui-kit; the cards are the `Project` rows of `mammoth_dev`. Brand = the
 * token block in app/globals.css. (Seed comes from the DB now, not a prop.)
 */
export default function PipelinePage() {
  const store = useMemo(() => createDbBoardStore(), []);

  return (
    <div>
      <AdminKanban config={MAMMOTH_BOARD} store={store} />
    </div>
  );
}
