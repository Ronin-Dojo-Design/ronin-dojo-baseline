/**
 * Projection UI kernel — the reusable, server-renderable vocabulary every State-of-Dojo panel composes
 * (SESSION_0603 WS-A). Cards, the belt/phase ladder, the work board, the brand-tab switcher, the panel
 * skeleton + placeholder. All presentational + placement-agnostic (no outer margin/width); the mounting
 * shell owns placement. The only client boundary is the `Tabs` primitive `BrandTabs` composes.
 *
 * WS-B/C build their catalog panels by composing these SAME pieces — the kernel is the contract's body.
 */
import type { CSSProperties, ReactNode } from "react"
import { Badge } from "~/components/common/badge"
import { Card } from "~/components/common/card"
import { EmptyList } from "~/components/common/empty-list"
import { Heading } from "~/components/common/heading"
import { Skeleton } from "~/components/common/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/common/tabs"
import type { Phase } from "~/lib/state-of-dojo/parse"
import { cx } from "~/lib/utils"
import { type BrandSkin, PHASE_STOP_CLASS, PHASES, phaseBadgeVariant, phaseWord } from "./phase"

/** The `done` column is the whole historical backlog (hundreds of closed sessions) — capping it to the
 * most recent N keeps the board a triage surface, not an archive rendered inline (protocol). */
const DONE_COLUMN_CAP = 12

// ── Section ──────────────────────────────────────────────────────────────────────────────────────

/**
 * A placement-agnostic projection section: full-width, internal spacing only, optional per-brand accent
 * top-border (the fixed-hue tint surfaced via `--sotd-accent`). This is the shared "section" vocabulary.
 */
export function ProjectionSection({
  title,
  accent,
  action,
  children,
  className,
}: {
  title: string
  accent?: boolean
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cx(
        "w-full space-y-3 rounded-lg border bg-card p-4",
        accent && "border-t-2 border-t-[color:var(--sotd-accent)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <Heading size="h6" className="uppercase tracking-wide text-muted-foreground">
          {title}
        </Heading>
        {action}
      </div>
      {children}
    </section>
  )
}

// ── Cards ────────────────────────────────────────────────────────────────────────────────────────

export type BoardCard = {
  /** Stable React key + identity. */
  key: string
  /** Small dim eyebrow, e.g. `#0603`. */
  eyebrow: string
  title: string
  /** Raw status text shown in the pill (e.g. `closed-full`, `in-progress`, `staged`). */
  status: string
  phase: Phase
}

/** One projection row card — composes the L1 `Card`, tightened for a dense board column. */
export function ProjectionCard({ card }: { card: BoardCard }) {
  return (
    <Card hover={false} focus={false} className="gap-1.5 rounded-md p-3">
      <span className="text-2xs text-muted-foreground">{card.eyebrow}</span>
      <span className="text-sm font-medium text-pretty">{card.title}</span>
      <Badge variant={phaseBadgeVariant(card.phase)} size="sm">
        {card.status}
      </Badge>
    </Card>
  )
}

// ── Work board (sessions as cards, one column per phase) ─────────────────────────────────────────

export function WorkBoard({ cards, belts }: { cards: BoardCard[]; belts: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {PHASES.map(phase => {
        const inPhase = cards
          .filter(c => c.phase === phase)
          .sort((a, b) => b.key.localeCompare(a.key, undefined, { numeric: true }))
        const capped = phase === "done" ? inPhase.slice(0, DONE_COLUMN_CAP) : inPhase
        const hidden = inPhase.length - capped.length
        return (
          <div
            key={phase}
            className={cx(
              "space-y-2",
              // Mobile: triage what's moving first (in-flight → review → planned → done).
              phase === "in-flight" && "max-sm:order-1",
              phase === "held" && "max-sm:order-2",
              phase === "review" && "max-sm:order-3",
              phase === "planned" && "max-sm:order-4",
              phase === "done" && "max-sm:order-5",
            )}
          >
            <div className="flex items-center gap-2">
              <Heading size="h6">{phaseWord(phase, belts)}</Heading>
              <Badge variant="soft" size="sm">
                {inPhase.length}
              </Badge>
            </div>
            {capped.length ? (
              <ul className="space-y-2">
                {capped.map(card => (
                  <li key={card.key}>
                    <ProjectionCard card={card} />
                  </li>
                ))}
                {hidden > 0 && (
                  <li className="text-2xs text-muted-foreground italic">
                    +{hidden} more — see docs/sprints/
                  </li>
                )}
              </ul>
            ) : (
              <EmptyList className="text-xs">Nothing here.</EmptyList>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Goal belt-ladder + accessible table ──────────────────────────────────────────────────────────

export type LadderRow = {
  key: string
  id: string
  title: string
  priority: string
  status: string
  phase: Phase
  /** Dropped goals have no ladder position — rendered fully dim + badged (protocol). */
  dropped?: boolean
}

/** One goal's 5-stop belt track (white·blue·purple·brown·black); stops up to and including the reached phase are lit, the rest dim. */
export function PhaseLadder({ row, belts }: { row: LadderRow; belts: boolean }) {
  const reachedIndex = row.dropped ? -1 : PHASES.indexOf(row.phase)
  return (
    <div className="flex gap-1" aria-hidden="true">
      {PHASES.map((phase, i) => (
        <span
          key={phase}
          title={phaseWord(phase, belts)}
          className={cx(
            "flex-1 truncate rounded-sm px-1 py-1 text-center text-2xs font-bold uppercase",
            PHASE_STOP_CLASS[phase],
            i <= reachedIndex ? "opacity-100" : "opacity-35",
          )}
        >
          {phaseWord(phase, belts)}
        </span>
      ))}
    </div>
  )
}

export function GoalLadders({ rows, belts }: { rows: LadderRow[]; belts: boolean }) {
  if (!rows.length) return <EmptyList className="text-xs">No goals for this brand tab.</EmptyList>
  return (
    <ul className="space-y-3">
      {rows.map(row => (
        <li key={row.key} className="space-y-1.5 border-b pb-3 last:border-b-0">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <strong>{row.id}</strong>
            <span className="text-pretty text-secondary-foreground">{row.title}</span>
            {row.dropped && (
              <Badge variant="danger" size="sm">
                dropped
              </Badge>
            )}
          </div>
          <PhaseLadder row={row} belts={belts} />
        </li>
      ))}
    </ul>
  )
}

/** The same goal data as an accessible table (screen-reader path for the visual ladder). */
export function GoalLadderTable({ rows, belts }: { rows: LadderRow[]; belts: boolean }) {
  if (!rows.length) return null
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-xs">
        <thead>
          <tr className="text-left text-muted-foreground">
            <th className="border-b p-1.5">ID</th>
            <th className="border-b p-1.5">Goal</th>
            <th className="border-b p-1.5">Pri</th>
            <th className="border-b p-1.5">Status</th>
            {PHASES.map(phase => (
              <th key={phase} className="border-b p-1.5">
                {phaseWord(phase, belts)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const reachedIndex = row.dropped ? -1 : PHASES.indexOf(row.phase)
            return (
              <tr key={row.key}>
                <td className="border-b p-1.5 font-medium">{row.id}</td>
                <td className="border-b p-1.5">{row.title}</td>
                <td className="border-b p-1.5">{row.priority}</td>
                <td className="border-b p-1.5">{row.status}</td>
                {PHASES.map((phase, i) => (
                  <td key={phase} className="border-b p-1.5 text-center text-muted-foreground">
                    {i <= reachedIndex ? "✓" : "·"}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Brand tabs (skin × lane filter) ──────────────────────────────────────────────────────────────

export type BrandTabPanel = { skin: BrandSkin; content: ReactNode }

/**
 * The brand-tab switcher. Each tab's server-rendered content is wrapped in `data-brand` + the per-skin
 * `--sotd-accent`, so the fixed-hue tint applies statically inside each panel (no JS needed for the
 * tint — only the `Tabs` primitive's show/hide is client). Semantic phase colors stay brand-invariant.
 */
export function BrandTabs({ panels }: { panels: BrandTabPanel[] }) {
  if (!panels.length) return null
  return (
    <Tabs defaultValue={panels[0].skin.key}>
      <TabsList>
        {panels.map(({ skin }) => (
          <TabsTrigger key={skin.key} value={skin.key}>
            {skin.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {panels.map(({ skin, content }) => (
        <TabsContent key={skin.key} value={skin.key}>
          <div
            data-brand={skin.key}
            style={{ "--sotd-accent": skin.accent } as CSSProperties}
            className="space-y-4"
          >
            {content}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}

// ── Skeleton + placeholder (Suspense fallback / unbuilt panels) ──────────────────────────────────

/** Suspense fallback for a self-fetching panel — the shape the panel owns per the frozen contract. */
export function PanelSkeleton({ compact }: { compact?: boolean }) {
  return (
    <div className="w-full space-y-3 rounded-lg border bg-card p-4" aria-hidden="true">
      <Skeleton className="h-4 w-40" />
      <div
        className={cx(
          "grid gap-3",
          compact ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
        )}
      >
        {Array.from({ length: compact ? 2 : 4 }, (_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-md" />
        ))}
      </div>
    </div>
  )
}

/**
 * A placeholder panel body: renders a real, non-broken section naming the workstream that will fill it.
 * The WS-B/C real panels replace the whole file — this keeps 0599 WS-3's mount importable + honest today.
 */
export function PanelPlaceholder({ title, note }: { title: string; note: string }) {
  return (
    <ProjectionSection title={title}>
      <EmptyList className="text-sm">{note}</EmptyList>
    </ProjectionSection>
  )
}
