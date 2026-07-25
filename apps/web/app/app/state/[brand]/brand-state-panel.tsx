/**
 * BrandStatePanel — the brand-scoped State-of-Dojo/Building view (SESSION_0674): ONE lane's work
 * board + goal belt-ladders, composed entirely from the projection kernel's public exports with the
 * brand filter applied HERE, at the route layer, on the non-frozen feed. Zero frozen-file edits:
 *
 *   - The frozen panel contract stays `{ compact? }` (`_kernel/contract.ts` — "Do NOT widen this
 *     type per-panel"). This component is NOT one of the four contract panels; it is route-owned
 *     composition (`/app/state/[brand]` is its only mount), so no prop-widening occurs.
 *   - The cross-brand feeds (Risk watch / Needs you) and the cross-brand masthead totals are
 *     deliberately cross-brand in the reference panel (`state-panel.tsx` protocol note) — a
 *     brand-scoped surface OMITS them rather than mis-scoping them (risk rows carry no lane facet
 *     yet, per `fetch-state.ts`). Nothing here renders data from any other lane.
 *
 * Shape still follows the frozen contract's panel discipline (its rules 1–4): named export,
 * self-fetching async RSC, placement-agnostic root, owns its own `<Suspense>` + empty state.
 */
import { Suspense } from "react"
import { EmptyList } from "~/components/common/empty-list"
import { Heading } from "~/components/common/heading"
import { type BrandSkin, MASTHEAD_TITLE } from "~/components/app/state-of-dojo/_kernel/phase"
import {
  type BoardCard,
  BrandTabs,
  GoalLadders,
  GoalLadderTable,
  type LadderRow,
  PanelSkeleton,
  ProjectionSection,
  WorkBoard,
} from "~/components/app/state-of-dojo/_kernel/projection"
import type { GoalDetail, SessionDetail } from "~/lib/state-of-dojo/parse"
import { fetchStateFeed } from "~/lib/state-of-dojo/fetch-state"

/** The per-deploy-skin masthead word for one brand skin (dojo skins say "Dojo", MMB says "Building"). */
export function brandMastheadTitle(skin: BrandSkin): string {
  return skin.belts ? MASTHEAD_TITLE.dojo : MASTHEAD_TITLE.building
}

// ── contract-shaped entrypoint: sync wrapper owns the Suspense boundary ──────────────────────────

export function BrandStatePanel({ skin }: { skin: BrandSkin }) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <BrandStatePanelContent skin={skin} />
    </Suspense>
  )
}

// ── mappers (feed detail → kernel row shapes) ────────────────────────────────────────────────────
// Mirror `state-panel.tsx`'s private mappers — the frozen file doesn't export them, and 0674's law
// is to leave it untouched; the shapes are pinned by the kernel's `BoardCard`/`LadderRow` types.

const sessionToCard = (s: SessionDetail): BoardCard => ({
  key: s.number,
  eyebrow: `#${s.number}`,
  title: s.title,
  status: s.status,
  phase: s.phase,
})

const goalToRow = (g: GoalDetail): LadderRow => ({
  key: g.id,
  id: g.id,
  title: g.title,
  priority: g.priority,
  status: g.status,
  phase: g.phase,
  dropped: g.status.toLowerCase() === "dropped",
})

// ── async content ────────────────────────────────────────────────────────────────────────────────

async function BrandStatePanelContent({ skin }: { skin: BrandSkin }) {
  const feed = await fetchStateFeed()
  const cards = feed.sessions.filter(s => s.product === skin.key).map(sessionToCard)
  const rows = feed.goals.filter(g => g.product === skin.key).map(goalToRow)
  const feedEmpty = feed.sessions.length === 0 && feed.goals.length === 0

  return (
    <div className="w-full space-y-4">
      <header className="space-y-1">
        <Heading size="h4">{brandMastheadTitle(skin)}</Heading>
        <p className="text-xs text-muted-foreground">
          {skin.label} · {cards.length} session{cards.length === 1 ? "" : "s"} · {rows.length} goal
          {rows.length === 1 ? "" : "s"}
          {feed.meta.degraded && " · feed degraded (reading main)"}
        </p>
      </header>

      {feedEmpty ? (
        <EmptyList className="text-sm">
          State feed unavailable — projects from <code>docs/sprints</code> +{" "}
          <code>goals-ledger.md</code> on <code>main</code>.
        </EmptyList>
      ) : (
        // One-panel BrandTabs = the kernel's tab-less single-brand path: `data-brand` + the
        // per-skin `--sotd-accent` tint wrapper, no tab strip. Same content shape as the frozen
        // panel's per-brand tab (counts line lives in the masthead here, being single-brand).
        <BrandTabs
          panels={[
            {
              skin,
              content: (
                <>
                  <ProjectionSection title="Work board" accent>
                    <WorkBoard cards={cards} belts={skin.belts} />
                  </ProjectionSection>
                  <ProjectionSection title="Goal belt-ladders" accent>
                    <GoalLadders rows={rows} belts={skin.belts} />
                    <GoalLadderTable rows={rows} belts={skin.belts} />
                  </ProjectionSection>
                </>
              ),
            },
          ]}
        />
      )}
    </div>
  )
}
