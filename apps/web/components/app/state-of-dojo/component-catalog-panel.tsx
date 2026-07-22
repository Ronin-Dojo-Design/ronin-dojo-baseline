/**
 * ComponentCatalogPanel — the live Component catalog projection: every `docs/knowledge/wiki/files/`
 * PWCC spec, brand-tab scoped, as a lifecycle work board + belt-ladder (SESSION_0606, G-023 WS-B —
 * replaces the WS-A placeholder). Cards are the SAME source, filtered — see `card-catalog-panel.tsx`.
 *
 * Conforms to the FROZEN panel contract (`./_kernel/contract.ts`): named export, self-fetching async
 * RSC, placement-agnostic, `{ compact? }`, owns its own `<Suspense>` + empty state. Shape cloned from
 * `state-panel.tsx`; `buildCatalogPanels`/`rowToCard`/`rowToLadderRow` below are shared with
 * `card-catalog-panel.tsx` (same row shape, filtered subset — one mapper, not two).
 */
import { Suspense } from "react"
import { EmptyList } from "~/components/common/empty-list"
import { Heading } from "~/components/common/heading"
import type { CatalogRow } from "~/lib/state-of-dojo/component-catalog-parse"
import { fetchCatalogFeed } from "~/lib/state-of-dojo/fetch-catalog"
import type { ProjectionPanelProps } from "./_kernel/contract"
import { BRAND_SKINS } from "./_kernel/phase"
import {
  type BoardCard,
  BrandTabs,
  type BrandTabPanel,
  GoalLadders,
  GoalLadderTable,
  type LadderRow,
  PanelSkeleton,
  ProjectionSection,
  WorkBoard,
} from "./_kernel/projection"

// ── contract entrypoint: sync wrapper owns the Suspense boundary ─────────────────────────────────

export function ComponentCatalogPanel({ compact }: ProjectionPanelProps) {
  return (
    <Suspense fallback={<PanelSkeleton compact={compact} />}>
      <ComponentCatalogPanelContent compact={compact} />
    </Suspense>
  )
}

// ── helpers ──────────────────────────────────────────────────────────────────────────────────────

/** `noun` is always passed plural ("components"/"cards" — reads right in the always-plural title
 * strings below); this singularizes it for the one count-prefixed line so "1 components" reads
 * "1 component" (DES-003). Simple trailing-`s` strip — both nouns this builder sees pluralize that
 * way; not a general English pluralizer. */
const countNoun = (noun: string, count: number) => (count === 1 ? noun.replace(/s$/, "") : noun)

// ── mappers (catalog row → kernel row shapes) — shared with card-catalog-panel.tsx ────────────────

export const rowToCard = (r: CatalogRow): BoardCard => ({
  key: r.slug,
  eyebrow: r.pwcc ?? (r.kind === "card" ? "card" : "component"),
  title: r.title,
  status: r.lifecycle ?? r.status,
  phase: r.phase,
})

export const rowToLadderRow = (r: CatalogRow): LadderRow => ({
  key: r.slug,
  id: r.pwcc ?? r.slug,
  title: r.title,
  priority: "—", // no priority concept for a component/card spec — the "—" no-signal convention
  status: r.lifecycle ?? r.status,
  phase: r.phase,
})

/**
 * Build one `BrandTabPanel` per brand skin from a catalog row set (work board + belt-ladder). Owns
 * the per-tab empty state itself (rather than letting `WorkBoard`/`GoalLadders` render their
 * built-in — goal-worded — empty copy) so an empty brand tab reads honestly for a component/card
 * catalog. `compact` trims the secondary accessible-table + ladder section (chrome only — the board
 * always shows the SAME rows, per the contract). Exported so `card-catalog-panel.tsx` composes the
 * SAME builder over its filtered rows.
 */
export function buildCatalogPanels(
  rows: CatalogRow[],
  noun: string,
  compact?: boolean,
): BrandTabPanel[] {
  return BRAND_SKINS.map(skin => {
    const scoped = rows.filter(r => r.brands.includes(skin.key))
    if (scoped.length === 0) {
      return {
        skin,
        content: (
          <ProjectionSection title={`${skin.label} ${noun}`}>
            <EmptyList className="text-sm">
              No {noun} tagged for the {skin.label} brand tab yet — most specs don't carry a{" "}
              <code>brands:</code> field yet.
            </EmptyList>
          </ProjectionSection>
        ),
      }
    }
    const cards = scoped.map(rowToCard)
    const ladderRows = scoped.map(rowToLadderRow)
    return {
      skin,
      content: (
        <>
          <p className="text-xs text-muted-foreground">
            {scoped.length} {countNoun(noun, scoped.length)}
          </p>
          <ProjectionSection title={`${noun} board`} accent>
            <WorkBoard cards={cards} belts={skin.belts} />
          </ProjectionSection>
          <ProjectionSection title={`${noun} belt-ladder`} accent>
            <GoalLadders rows={ladderRows} belts={skin.belts} />
            {!compact && <GoalLadderTable rows={ladderRows} belts={skin.belts} />}
          </ProjectionSection>
        </>
      ),
    }
  })
}

// ── async content ────────────────────────────────────────────────────────────────────────────────

async function ComponentCatalogPanelContent({ compact }: ProjectionPanelProps) {
  const feed = await fetchCatalogFeed()
  const rows = feed.rows
  const panels = buildCatalogPanels(rows, "components", compact)

  return (
    <div className="w-full space-y-4">
      <header className="space-y-1">
        <Heading size="h4">Component catalog</Heading>
        <p className="text-xs text-muted-foreground">
          {rows.length} spec{rows.length === 1 ? "" : "s"} from docs/knowledge/wiki/files/
          {feed.meta.degraded && " · feed degraded (reading main)"}
        </p>
      </header>

      {rows.length === 0 ? (
        <EmptyList className="text-sm">
          Catalog feed unavailable — projects from <code>docs/knowledge/wiki/files/*.md</code> on{" "}
          <code>main</code>.
        </EmptyList>
      ) : (
        <BrandTabs panels={panels} />
      )}
    </div>
  )
}
