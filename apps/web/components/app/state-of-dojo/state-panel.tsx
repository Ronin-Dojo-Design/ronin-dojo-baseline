/**
 * StatePanel — the live "State of the Dojo" projection: sessions (work board) + goals (belt ladders),
 * brand-tab scoped, plus the cross-brand Risk-watch + Needs-you feeds. The REAL reference panel of the
 * WS-A kernel (SESSION_0603) — proves the projection framework end-to-end and is the shape WS-B/C clone.
 *
 * Conforms to the FROZEN panel contract (`./_kernel/contract.ts`): named export, self-fetching async
 * RSC, placement-agnostic, `{ compact? }`, owns its own `<Suspense>` + empty state.
 */
import { Suspense } from "react"
import { Badge } from "~/components/common/badge"
import { EmptyList } from "~/components/common/empty-list"
import { Heading } from "~/components/common/heading"
import type { Item } from "~/lib/loop-board/ledger-parse"
import type { GoalDetail, SessionDetail } from "~/lib/state-of-dojo/parse"
import { fetchStateFeed } from "~/lib/state-of-dojo/fetch-state"
import type { ProjectionPanelProps } from "./_kernel/contract"
import { BRAND_SKINS, MASTHEAD_TITLE_HERE } from "./_kernel/phase"
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

export function StatePanel({ compact }: ProjectionPanelProps) {
  return (
    <Suspense fallback={<PanelSkeleton compact={compact} />}>
      <StatePanelContent compact={compact} />
    </Suspense>
  )
}

// ── mappers (feed detail → kernel row shapes) ────────────────────────────────────────────────────

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

async function StatePanelContent({ compact }: ProjectionPanelProps) {
  const feed = await fetchStateFeed()
  const { sessions, goals } = feed

  const panels: BrandTabPanel[] = BRAND_SKINS.map(skin => {
    const cards = sessions.filter(s => s.product === skin.key).map(sessionToCard)
    const rows = goals.filter(g => g.product === skin.key).map(goalToRow)
    return {
      skin,
      content: (
        <>
          <p className="text-xs text-muted-foreground">
            {cards.length} session{cards.length === 1 ? "" : "s"} · {rows.length} goal
            {rows.length === 1 ? "" : "s"}
          </p>
          <ProjectionSection title="Work board" accent>
            <WorkBoard cards={cards} belts={skin.belts} />
          </ProjectionSection>
          <ProjectionSection title="Goal belt-ladders" accent>
            <GoalLadders rows={rows} belts={skin.belts} />
            {!compact && <GoalLadderTable rows={rows} belts={skin.belts} />}
          </ProjectionSection>
        </>
      ),
    }
  })

  return (
    <div className="w-full space-y-4">
      <header className="space-y-1">
        <Heading size="h4">{MASTHEAD_TITLE_HERE}</Heading>
        <p className="text-xs text-muted-foreground">
          {sessions.length} sessions · {goals.length} goals · {feed.prCount} open PR
          {feed.prCount === 1 ? "" : "s"}
          {feed.meta.degraded && " · feed degraded (reading main)"}
        </p>
      </header>

      {sessions.length === 0 && goals.length === 0 ? (
        <EmptyList className="text-sm">
          State feed unavailable — projects from <code>docs/sprints</code> +{" "}
          <code>goals-ledger.md</code> on <code>main</code>.
        </EmptyList>
      ) : (
        <BrandTabs panels={panels} />
      )}

      {!compact && <RiskWatch items={feed.riskItems} />}
      <NeedsYou sessions={sessions} goals={goals} />
    </div>
  )
}

// ── cross-brand feeds (deliberately NOT tab-scoped — protocol) ───────────────────────────────────

function riskVariant(priority: Item["priority"]) {
  if (priority === "P0") return "danger" as const
  if (priority === "P1") return "warning" as const
  return "soft" as const
}

function RiskWatch({ items }: { items: Item[] }) {
  return (
    <ProjectionSection title="Risk watch">
      {items.length ? (
        <ul className="space-y-2 text-sm">
          {items.map(i => (
            <li key={`${i.ledger}-${i.id}`} className="flex flex-wrap items-center gap-2">
              <Badge variant={riskVariant(i.priority)} size="sm">
                {i.priority}
              </Badge>
              <strong>{i.id}</strong>
              <span className="text-secondary-foreground text-pretty">{i.summary}</span>
              <span className="text-2xs text-muted-foreground">({i.status})</span>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyList className="text-sm">No open risk items.</EmptyList>
      )}
    </ProjectionSection>
  )
}

function NeedsYou({ sessions, goals }: { sessions: SessionDetail[]; goals: GoalDetail[] }) {
  // Push-gate-held sessions still OPEN (a closed session's gate is resolved — its notes say "held" in
  // past tense, which would otherwise flood this list) + operator-pending goal rows.
  const held = sessions.filter(s => s.pushGateHeld && s.phase !== "done")
  const pending = goals.filter(g => g.operatorPending)
  const has = held.length > 0 || pending.length > 0
  return (
    <ProjectionSection title="Needs you">
      {has ? (
        <ul className="space-y-2 text-sm">
          {held.map(s => (
            <li key={`s-${s.number}`}>
              <span className="text-muted-foreground">Push gate held —</span>{" "}
              <strong>#{s.number}</strong> {s.title}
            </li>
          ))}
          {pending.map(g => (
            <li key={`g-${g.id}`}>
              <span className="text-muted-foreground">Ratification pending —</span>{" "}
              <strong>{g.id}</strong> {g.title}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyList className="text-sm">Nothing needs you right now.</EmptyList>
      )}
    </ProjectionSection>
  )
}
