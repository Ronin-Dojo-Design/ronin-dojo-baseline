/**
 * CardCatalogPanel — PLACEHOLDER (SESSION_0603 WS-A). Landed at the frozen path + signature so
 * SESSION_0599 WS-3 can import/mount it TODAY; the real projection is WS-B.
 *
 * Contract (`./_kernel/contract.ts`): named export, `{ compact? }`, placement-agnostic, mountable now.
 * Cards are a FACET of the component catalog (one source, a Cards tab — ADR 0040 "cards are components",
 * SESSION_0593 fork 7), not a second source. WS-B fills this in — see `state-panel.tsx` for the shape.
 */
import { Suspense } from "react"
import type { ProjectionPanelProps } from "./_kernel/contract"
import { PanelPlaceholder, PanelSkeleton } from "./_kernel/projection"

export function CardCatalogPanel({ compact }: ProjectionPanelProps) {
  return (
    <Suspense fallback={<PanelSkeleton compact={compact} />}>
      <CardCatalogPanelContent />
    </Suspense>
  )
}

async function CardCatalogPanelContent() {
  return (
    <PanelPlaceholder
      title="Card catalog"
      note="Coming in WS-B — a facet of the component catalog (the Cards tab of one source, ADR 0040)."
    />
  )
}
