"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminKanban } from "@ronin-dojo/ui-kit/kanban";
import { BASELINE_BOARD } from "@/lib/board-config";
import { createDbBoardStore } from "@/lib/board-store-db";
import { signOut } from "@/lib/auth-client";

/**
 * The Baseline inquiry board client island (ADR 0033 D5) — pure wiring: pick the
 * DB persistence adapter (baseline_dev, ADR 0038 Phase 2) and mount the shared
 * AdminKanban with the Baseline BoardConfig. No board logic here; columns, drag,
 * intake, and automations all come from @ronin-dojo/ui-kit. Brand = the token
 * bridge in app/globals.css.
 */
export function LeadsBoard() {
  const router = useRouter();
  const store = useMemo(() => createDbBoardStore(), []);

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Inquiries</h1>
          <p className="text-sm text-muted">Follow up on prospective students.</p>
        </div>
        <div className="flex items-center gap-5 text-sm">
          <button
            type="button"
            onClick={handleSignOut}
            className="text-muted transition-colors hover:text-ink"
          >
            Sign out
          </button>
          <Link href="/" className="text-muted transition-colors hover:text-ink">
            ← Site
          </Link>
        </div>
      </header>
      <AdminKanban config={BASELINE_BOARD} store={store} />
    </div>
  );
}
