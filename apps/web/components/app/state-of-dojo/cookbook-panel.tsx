/**
 * CookbookPanel — PLACEHOLDER (SESSION_0603 WS-A). Landed at the frozen path + signature so
 * SESSION_0599 WS-3 can import/mount it TODAY; the real projection is WS-C.
 *
 * Contract (`./_kernel/contract.ts`): named export, `{ compact? }`, placement-agnostic, mountable now.
 * WS-C replaces this file's body with the real self-fetching async RSC (parses `SOT_Cookbook.md` +
 * `docs/protocols/recipes/*`) — copy `state-panel.tsx`'s Suspense+async shape for the feed.
 */
import { Suspense } from "react"
import type { ProjectionPanelProps } from "./_kernel/contract"
import { PanelPlaceholder, PanelSkeleton } from "./_kernel/projection"

export function CookbookPanel({ compact }: ProjectionPanelProps) {
  return (
    <Suspense fallback={<PanelSkeleton compact={compact} />}>
      <CookbookPanelContent />
    </Suspense>
  )
}

async function CookbookPanelContent() {
  return (
    <PanelPlaceholder
      title="Cookbook"
      note="Coming in WS-C — projects SOT_Cookbook.md + docs/protocols/recipes/* as browsable recipe cards."
    />
  )
}
