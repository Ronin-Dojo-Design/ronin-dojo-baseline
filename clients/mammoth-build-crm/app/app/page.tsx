"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminKanban } from "@ronin-dojo/ui-kit/kanban";
import { LeadSourceFacet } from "@/components/crm/LeadSourceFacet";
import { listProjects } from "@/lib/actions";
import { MAMMOTH_BOARD } from "@/lib/board-config";
import { createDbBoardStore } from "@/lib/board-store-db";
import { countLeadSources, leadSourceLabel, type LeadSourceValue } from "@/lib/lead-source";

/**
 * Mammoth pipeline (PWCC-004) — bound to the shared AdminKanban kernel (PWCC-007).
 *
 * This page is PURE WIRING: it picks a persistence adapter (the Mammoth Prisma DB,
 * ADR 0038 Phase 2) and mounts the board with the Mammoth BoardConfig. No board logic
 * lives here — the columns, drag, intake, automations, and guards all come from
 * @ronin-dojo/ui-kit; the cards are the `Project` rows of `mammoth_dev`. Brand = the
 * token block in app/globals.css. (Seed comes from the DB now, not a prop.)
 *
 * Lead Source facet (SESSION_0586, G-021 loop 3b): read-side only. Counts come from one
 * `listProjects()` read — a lead's source is stamped at intake and never changes afterward,
 * so a one-time fetch is enough (no polling, no callback out of the kernel). The kernel
 * (`AdminKanban`) takes only `config` + `store` and has no filter prop (ADR 0033 D5 — the
 * board is config + data, zero per-project code in the kernel), and `useBoard` only reloads
 * when `config.id` changes, not when `store` does. So the filter narrows
 * `createDbBoardStore`'s own `load()` and the page remounts `AdminKanban` via `key` on filter
 * change — the kernel itself is never touched.
 */
export default function PipelinePage() {
  const [sourceFilter, setSourceFilter] = useState<LeadSourceValue | null>(null);
  const [counts, setCounts] = useState<Partial<Record<LeadSourceValue, number>> | null>(null);

  useEffect(() => {
    let alive = true;
    listProjects().then((projects) => {
      if (alive) setCounts(countLeadSources(projects.map((project) => project.source)));
    });
    return () => {
      alive = false;
    };
  }, []);

  const store = useMemo(() => createDbBoardStore(sourceFilter), [sourceFilter]);
  const totalCount = useMemo(
    () => Object.values(counts ?? {}).reduce((sum: number, n) => sum + (n ?? 0), 0),
    [counts],
  );
  const selectedCount = sourceFilter ? (counts?.[sourceFilter] ?? 0) : totalCount;
  const showEmptyState = counts !== null && sourceFilter !== null && selectedCount === 0;

  return (
    <div>
      <div className="mb-4">
        <LeadSourceFacet
          counts={counts ?? {}}
          total={totalCount}
          selected={sourceFilter}
          onSelect={setSourceFilter}
        />
      </div>
      {showEmptyState ? (
        <p className="rounded-lg border border-dashed border-border p-5 text-sm text-muted">
          No {leadSourceLabel(sourceFilter as LeadSourceValue)} leads.
        </p>
      ) : (
        <AdminKanban key={sourceFilter ?? "all"} config={MAMMOTH_BOARD} store={store} />
      )}
    </div>
  );
}
