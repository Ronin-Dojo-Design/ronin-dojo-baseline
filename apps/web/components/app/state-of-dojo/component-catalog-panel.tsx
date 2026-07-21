/**
 * ComponentCatalogPanel — PLACEHOLDER (SESSION_0603 WS-A). Landed at the frozen path + signature so
 * SESSION_0599 WS-3 can import/mount it TODAY; the real projection is WS-B.
 *
 * Contract (`./_kernel/contract.ts`): named export, `{ compact? }`, placement-agnostic, mountable now.
 * WS-B replaces this file's body with the real self-fetching async RSC — copy `state-panel.tsx`'s
 * Suspense+async shape and swap the feed for `lib/state-of-dojo/component-catalog-parse.ts` (projects the
 * PWCC `/files` specs: `status`/`lifecycle`/`wiring` + a thin `brands:` field, bugs via the DBS cross-ref).
 */
import { Suspense } from "react"
import type { ProjectionPanelProps } from "./_kernel/contract"
import { PanelPlaceholder, PanelSkeleton } from "./_kernel/projection"

export function ComponentCatalogPanel({ compact }: ProjectionPanelProps) {
  return (
    <Suspense fallback={<PanelSkeleton compact={compact} />}>
      <ComponentCatalogPanelContent />
    </Suspense>
  )
}

async function ComponentCatalogPanelContent() {
  return (
    <PanelPlaceholder
      title="Component catalog"
      note="Coming in WS-B — projects the PWCC /files specs (status · lifecycle · wiring · brands) with bug cross-refs from the daily scan."
    />
  )
}
