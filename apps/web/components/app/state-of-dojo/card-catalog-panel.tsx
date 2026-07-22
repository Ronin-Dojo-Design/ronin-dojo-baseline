/**
 * CardCatalogPanel — the "Cards" facet of the SAME component catalog source (ADR 0040 "cards are
 * components", SESSION_0593 fork 7): the SAME `docs/knowledge/wiki/files/` PWCC specs as
 * `component-catalog-panel.tsx`, filtered to `kind === "card"` (SESSION_0606, G-023 WS-B — replaces
 * the WS-A placeholder). NOT a second data source — `fetch-catalog.ts`/`component-catalog-parse.ts`
 * are shared, and the board/ladder builder (`buildCatalogPanels`) is imported from the sibling panel
 * rather than re-implemented.
 *
 * Conforms to the FROZEN panel contract (`./_kernel/contract.ts`): named export, self-fetching async
 * RSC, placement-agnostic, `{ compact? }`, owns its own `<Suspense>` + empty state.
 */
import { Suspense } from "react"
import { EmptyList } from "~/components/common/empty-list"
import { Heading } from "~/components/common/heading"
import { fetchCatalogFeed } from "~/lib/state-of-dojo/fetch-catalog"
import { buildCatalogPanels } from "./component-catalog-panel"
import type { ProjectionPanelProps } from "./_kernel/contract"
import { BrandTabs, PanelSkeleton } from "./_kernel/projection"

// ── contract entrypoint: sync wrapper owns the Suspense boundary ─────────────────────────────────

export function CardCatalogPanel({ compact }: ProjectionPanelProps) {
  return (
    <Suspense fallback={<PanelSkeleton compact={compact} />}>
      <CardCatalogPanelContent compact={compact} />
    </Suspense>
  )
}

// ── async content ────────────────────────────────────────────────────────────────────────────────

async function CardCatalogPanelContent({ compact }: ProjectionPanelProps) {
  const feed = await fetchCatalogFeed()
  const cardRows = feed.rows.filter(r => r.kind === "card")
  const panels = buildCatalogPanels(cardRows, "cards", compact)

  return (
    <div className="w-full space-y-4">
      <header className="space-y-1">
        <Heading size="h4">Card catalog</Heading>
        <p className="text-xs text-muted-foreground">
          {cardRows.length} card spec{cardRows.length === 1 ? "" : "s"} — the Cards facet of{" "}
          {feed.rows.length} total <code>docs/knowledge/wiki/files/</code> specs
          {feed.meta.degraded && " · feed degraded (reading main)"}
        </p>
      </header>

      {cardRows.length === 0 ? (
        <EmptyList className="text-sm">
          No card-pattern specs found — projects <code>docs/knowledge/wiki/files/*.md</code> tagged{" "}
          <code>card</code>/<code>m-card</code> on <code>main</code>.
        </EmptyList>
      ) : (
        <BrandTabs panels={panels} />
      )}
    </div>
  )
}
