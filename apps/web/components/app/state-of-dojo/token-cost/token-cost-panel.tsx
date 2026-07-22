/**
 * TokenCostPanel — the State-of-Dojo token-cost projection: per-session `telemetry:` frontmatter
 * (`docs/protocols/state-of-dojo-telemetry-schema.md`) rendered as a $/session spend trend + a
 * per-model cost breakdown (G-023 WS-D, SESSION_0608).
 *
 * Conforms to the FROZEN panel contract (`../_kernel/contract.ts`): named export, self-fetching
 * async RSC, placement-agnostic, `{ compact? }`, owns its own `<Suspense>` + empty state — same
 * shape as `state-panel.tsx`, so SESSION_0599 WS-3 could mount it identically. NOT one of the
 * frozen contract's original four panels (state/component-catalog/card-catalog/cookbook) — an
 * ADDITIONAL panel built to the same contract, not a placeholder replacement.
 */
import type { CSSProperties } from "react"
import { Suspense } from "react"
import { EmptyList } from "~/components/common/empty-list"
import { Heading } from "~/components/common/heading"
import { fetchTokenCostFeed } from "~/lib/state-of-dojo/fetch-token-cost"
import type { ProjectionPanelProps } from "../_kernel/contract"
import { PanelSkeleton, ProjectionSection } from "../_kernel/projection"
import { TokenCostChart } from "./token-cost-chart"
import { TokenCostModelTable, TokenCostSessionTable } from "./token-cost-table"

export function TokenCostPanel({ compact }: ProjectionPanelProps) {
  return (
    <Suspense fallback={<PanelSkeleton compact={compact} />}>
      <TokenCostPanelContent compact={compact} />
    </Suspense>
  )
}

async function TokenCostPanelContent({ compact }: ProjectionPanelProps) {
  const feed = await fetchTokenCostFeed()
  const { sessions } = feed

  if (sessions.length === 0) {
    return (
      <ProjectionSection title="Token cost">
        <EmptyList className="text-sm">
          No session carries structured <code>telemetry:</code> frontmatter yet — see{" "}
          <code>docs/protocols/state-of-dojo-telemetry-schema.md</code> for the schema.
        </EmptyList>
      </ProjectionSection>
    )
  }

  return (
    // `ProjectionSection accent` reads `--sotd-accent`, which `BrandTabs` normally sets per skin
    // (`_kernel/projection.tsx`). This panel isn't mounted under `BrandTabs`, so scope the var
    // locally to the primary brand color rather than leaving it unset (DES-003).
    <div className="w-full space-y-4" style={{ "--sotd-accent": "var(--color-primary)" } as CSSProperties}>
      <header className="space-y-1">
        <Heading size="h4">Token cost</Heading>
        <p className="text-xs text-muted-foreground">
          {sessions.length} session{sessions.length === 1 ? "" : "s"} with telemetry · $
          {feed.totalCostUsd.toFixed(2)} total
          {feed.meta.degraded && " · feed degraded (reading main)"}
        </p>
      </header>

      <ProjectionSection title="Spend trend" accent>
        {feed.series.length >= 2 ? (
          <TokenCostChart points={feed.series} />
        ) : (
          <EmptyList className="text-sm">
            Need at least 2 sessions with telemetry for a trend.
          </EmptyList>
        )}
      </ProjectionSection>

      {!compact && (
        <>
          <ProjectionSection title="By session">
            <TokenCostSessionTable sessions={sessions} />
          </ProjectionSection>
          <ProjectionSection title="By model">
            <TokenCostModelTable models={feed.byModel} />
          </ProjectionSection>
        </>
      )}
    </div>
  )
}
