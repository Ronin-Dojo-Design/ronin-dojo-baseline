"use client"

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react"
import { BeltSwatch } from "~/components/common/belt-swatch"
import { BBL, relativeLuminance, rgba } from "~/lib/lineage/belt-color"
import { memberInitials } from "~/lib/lineage/canvas-model"
import { connectorGrowDelay } from "~/lib/lineage/connector-geometry"
import type { LineageVisualNode } from "~/lib/lineage/to-lineage-visual"
import { cx } from "~/lib/utils"

/**
 * LineageCohortTimeline — the custom View A layout that replaces the vendored
 * `family-chart` genealogy engine (ADR 0027, decision B; SESSION_0395).
 *
 * The unit is a Kajukenbo-style **list-box**: a card with a cinematic header
 * (avatar / Poppins name / belt-graphic) plus a vertical list of that person's
 * children. A listed child who *has their own students* (structural — someone
 * points at them via `primaryVisualParentMemberId`) sprouts **their own box**
 * below, joined by a measured-SVG connector line; a leaf child stays a compact
 * row inside the parent card. Deterministic top-down flow (no physics, no new
 * dependency); native-scroll canvas (the WATERSHED 60B KISS conclusion).
 *
 * Interactions: click a box (or a branch box) → recenter focal (`onFocus`);
 * click the ⋮ → menu (`onOpenMenu`); click a leaf row → open the drawer
 * (`onOpenProfile`, where the belt-rank StudentsCarousel lives).
 */

// Editorial canvas chrome — NOT brand identity (see belt-color.ts). Solid
// "legacy/authoritative" surfaces (no glassmorphism / backdrop-blur).
const SOLID_PANEL =
  "border border-white/8 bg-[#0c0c0d] shadow-[0_20px_60px_-26px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.045)]"

// Connector band geometry (mirrors lineage-tree-canvas.tsx: the Balkan 90° idiom).
const CONNECTOR_BAND_PX = 40
const CONNECTOR_BUS_PX = CONNECTOR_BAND_PX / 2
const CONNECTOR_GROW_DURATION = 0.25

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect

// Promotion-date provenance (the lineage USP). The timeline orders + dates the
// tree off these; a null date sorts last so dated promotions read first.
function promotionYear(iso: string | null): string | null {
  if (!iso) return null
  const year = new Date(iso).getUTCFullYear()
  return Number.isNaN(year) ? null : String(year)
}

function formatPromotionDate(iso: string | null): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })
}

function sortByPromotion(a: LineageVisualNode, b: LineageVisualNode): number {
  // Earliest promotion first; undated members sort last (reading down = forward in time).
  const at = a.promotionDate ? new Date(a.promotionDate).getTime() : Number.POSITIVE_INFINITY
  const bt = b.promotionDate ? new Date(b.promotionDate).getTime() : Number.POSITIVE_INFINITY
  return at - bt
}

export type LineageTimelineHandlers = {
  /** Click a box / branch box → recenter the focal. */
  onFocus: (memberId: string) => void
  /** Click the ⋮ → open the actions menu anchored to the trigger. */
  onOpenMenu: (memberId: string, anchorEl: HTMLElement) => void
  /** Click a leaf row → open the profile drawer (belt-rank roster lives there). */
  onOpenProfile: (memberId: string) => void
}

type LineageCohortTimelineProps = LineageTimelineHandlers & {
  nodes: LineageVisualNode[]
  focusMemberId: string | null
  ancestryDepth: number
  progenyDepth: number
  /** null = no active filter (all shown); otherwise non-matching nodes dim. */
  matchedMemberIds: Set<string> | null
  reduceMotion: boolean
}

// ---------------------------------------------------------------------------
// Measured-SVG connector band: one parent box → its branch-child columns.
// Adapted from lineage-tree-canvas.tsx's LineageConnectorLayer (the canvas's
// copy is not exported); reuses the `:scope > [data-lineage-conn-col]`
// measurement + connector-geometry timing. Reduced-motion = full, no animation.
// ---------------------------------------------------------------------------
function ConnectorBand({
  columns,
  generation,
  reduceMotion,
}: {
  /** One per branch-child column, in render order: stable id + promotion year label. */
  columns: { id: string; year: string | null }[]
  generation: number
  reduceMotion: boolean
}) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [layout, setLayout] = useState<{
    centerX: number
    targets: number[]
  } | null>(null)
  const remeasureKey = columns.map(col => col.id).join("|")
  const growDelaySec = connectorGrowDelay(generation)

  useIsomorphicLayoutEffect(() => {
    const container = svgRef.current?.parentElement
    if (!container) return

    const measure = () => {
      const columns = container.querySelectorAll<HTMLElement>(":scope > [data-lineage-conn-col]")
      if (columns.length === 0) {
        setLayout(null)
        return
      }
      const centerX = container.clientWidth / 2
      const targets = Array.from(columns, col => col.offsetLeft + col.offsetWidth / 2)
      setLayout({ centerX, targets })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }, [remeasureKey])

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      width="100%"
      height={CONNECTOR_BAND_PX}
      className="pointer-events-none absolute left-0 overflow-visible"
      style={{ top: -CONNECTOR_BAND_PX }}
    >
      {layout?.targets.map((targetX, index) => {
        const col = columns[index]
        if (!col) return null
        const d = `M ${layout.centerX} 0 L ${layout.centerX} ${CONNECTOR_BUS_PX} L ${targetX} ${CONNECTOR_BUS_PX} L ${targetX} ${CONNECTOR_BAND_PX}`
        return (
          <g key={col.id}>
            <path
              d={d}
              fill="none"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              className="stroke-border transition-colors duration-200"
              style={{
                strokeDasharray: reduceMotion ? undefined : 1,
                animation: reduceMotion
                  ? undefined
                  : `connector-draw ${CONNECTOR_GROW_DURATION}s var(--ease-snappy) ${growDelaySec}s both`,
              }}
            />
            {/* Promotion-year marker on the rail — the connector IS a dated timeline segment. */}
            {col.year && (
              <text
                x={targetX}
                y={CONNECTOR_BUS_PX - 3}
                textAnchor="middle"
                className="fill-white/40 text-[9px] font-semibold tabular-nums"
              >
                {col.year}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Avatar (image or initials ring), belt-colored.
// ---------------------------------------------------------------------------
function CardAvatar({
  node,
  size,
  bright,
}: {
  node: LineageVisualNode
  size: number
  bright: boolean
}) {
  const colorHex = node.colorHex ?? BBL.slate
  const inner = size - 4
  return (
    <div
      className="shrink-0 rounded-full p-0.5"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${colorHex}, rgba(255,255,255,0.22))`,
        boxShadow: `0 0 18px ${rgba(colorHex, bright ? 0.18 : 0.26)}`,
      }}
    >
      <div
        className="flex items-center justify-center overflow-hidden rounded-full bg-[#0a0a0a] font-extrabold text-white"
        style={{
          width: inner,
          height: inner,
          fontSize: Math.round(size / 3.2),
        }}
      >
        {node.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element -- public avatar URL, no Next loader on the cinematic canvas
          <img
            src={node.avatar}
            alt={node.displayName}
            className="size-full object-cover"
            style={{ borderRadius: 999 }}
          />
        ) : (
          memberInitials(node.displayName)
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Compact leaf row — a child with no students of their own. Click → drawer.
// ---------------------------------------------------------------------------
function LeafRow({
  node,
  dimmed,
  onOpenProfile,
}: {
  node: LineageVisualNode
  dimmed: boolean
  onOpenProfile: (memberId: string) => void
}) {
  return (
    <button
      type="button"
      id={`lineage-member-${node.id}`}
      onClick={() => onOpenProfile(node.id)}
      data-dimmed={dimmed || undefined}
      className="flex w-full items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 text-left transition hover:border-white/10 hover:bg-white/[0.05] data-[dimmed]:opacity-30"
    >
      <CardAvatar node={node} size={28} bright={relativeLuminance(node.colorHex) > 0.6} />
      <span className="min-w-0 flex-1 truncate text-[0.8rem] font-medium text-white/85">
        {node.displayName}
      </span>
      {promotionYear(node.promotionDate) && (
        <span className="shrink-0 text-[0.6rem] font-semibold tabular-nums text-white/35">
          {promotionYear(node.promotionDate)}
        </span>
      )}
      <BeltSwatch variant="bar" colorHex={node.colorHex} />
    </button>
  )
}

// ---------------------------------------------------------------------------
// The cinematic list-box card: header + inline leaf-child list.
// ---------------------------------------------------------------------------
function LineageBoxCard({
  node,
  promoterName,
  leafChildren,
  branchCount,
  isFocal,
  dimmed,
  onFocus,
  onOpenMenu,
  onOpenProfile,
}: {
  node: LineageVisualNode
  /** Who promoted this member (their visual parent) — the provenance claim. */
  promoterName: string | null
  leafChildren: LineageVisualNode[]
  branchCount: number
  isFocal: boolean
  dimmed: boolean
  onFocus: (memberId: string) => void
  onOpenMenu: (memberId: string, anchorEl: HTMLElement) => void
  onOpenProfile: (memberId: string) => void
}) {
  const colorHex = node.colorHex ?? BBL.slate
  const bright = relativeLuminance(colorHex) > 0.6
  const glow = rgba(colorHex, isFocal ? (bright ? 0.26 : 0.42) : bright ? 0.12 : 0.2)
  const cardBorder = isFocal ? rgba(colorHex, 0.7) : "rgba(255,255,255,0.1)"
  const promotionLabel = formatPromotionDate(node.promotionDate)

  const handleMenu = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      onOpenMenu(node.id, event.currentTarget)
    },
    [node.id, onOpenMenu],
  )

  return (
    <div
      id={`lineage-member-${node.id}`}
      data-bbl-card
      data-dimmed={dimmed || undefined}
      {...(isFocal ? { "data-bbl-focal": "" } : { "data-bbl-recede": "" })}
      className="relative w-72 overflow-hidden rounded-3xl text-white transition data-[dimmed]:opacity-30"
      style={
        {
          background: `radial-gradient(circle at 16% 8%, ${rgba(colorHex, 0.16)} 0, transparent 36%),linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.012) 42%, #060606)`,
          boxShadow: isFocal
            ? `0 0 0 1px ${cardBorder}, 0 22px 60px -24px ${glow}`
            : `0 0 0 1px ${cardBorder}, 0 14px 34px -20px rgba(0,0,0,0.7)`,
        } as CSSProperties
      }
    >
      {/* Header — click recenters this node (the focal-zoom feel). */}
      <button
        type="button"
        onClick={() => onFocus(node.id)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <CardAvatar node={node} size={isFocal ? 56 : 48} bright={bright} />
        <div className="min-w-0 flex-1">
          <div
            className="truncate text-[0.95rem] font-extrabold italic leading-tight text-white"
            style={{
              fontFamily: "var(--font-bbl-heading),system-ui,sans-serif",
            }}
          >
            {node.displayName}
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <BeltSwatch variant="bar" shimmer={isFocal} colorHex={node.colorHex} />
            {node.schoolLabel && (
              <span className="min-w-0 truncate text-[0.7rem] font-medium text-white/50">
                {node.schoolLabel}
              </span>
            )}
          </div>
          {/* Promotion provenance — the lineage USP: by whom, and when. */}
          {(promoterName || promotionLabel) && (
            <div className="mt-1 truncate text-[0.65rem] text-white/40">
              {promoterName ? `Promoted by ${promoterName}` : "Promoted"}
              {promotionLabel ? ` · ${promotionLabel}` : ""}
            </div>
          )}
        </div>
      </button>

      {/* ⋮ actions — never recenters (own click handler, stopPropagation). */}
      <button
        type="button"
        aria-haspopup="menu"
        aria-label="Actions"
        onClick={handleMenu}
        className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/60 transition hover:bg-white/[0.12] hover:text-white"
      >
        <span className="text-base leading-none">⋮</span>
      </button>

      {node.claimable && (
        <span className="absolute right-12 top-4 rounded-full border border-indigo-300/30 bg-indigo-500/15 px-1.5 py-0.5 text-[0.5rem] font-bold uppercase tracking-[0.06em] text-indigo-100">
          Claimable
        </span>
      )}

      {/* Inline leaf-child list — students with no students of their own. */}
      {leafChildren.length > 0 && (
        <div className="border-t border-white/5 px-2 pb-2 pt-1.5">
          <div className="px-2 pb-1 text-[0.55rem] font-bold uppercase tracking-[0.18em] text-white/35">
            Students · {leafChildren.length}
          </div>
          <div className="flex flex-col gap-0.5">
            {leafChildren.map(child => (
              <LeafRow key={child.id} node={child} dimmed={false} onOpenProfile={onOpenProfile} />
            ))}
          </div>
        </div>
      )}

      {branchCount > 0 && (
        <div className="px-4 pb-3 text-[0.6rem] font-semibold text-white/35">
          {branchCount} instructor {branchCount === 1 ? "branch" : "branches"} below
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Recursive top-down box layout, rooted at the focal node (progeny direction).
// ---------------------------------------------------------------------------
function BoxNode({
  node,
  promoterName,
  childrenByParent,
  focusMemberId,
  generation,
  maxDepth,
  matchedMemberIds,
  reduceMotion,
  handlers,
}: {
  node: LineageVisualNode
  promoterName: string | null
  childrenByParent: Map<string, LineageVisualNode[]>
  focusMemberId: string | null
  generation: number
  maxDepth: number
  matchedMemberIds: Set<string> | null
  reduceMotion: boolean
  handlers: LineageTimelineHandlers
}) {
  // Chronological: earliest promotion first, undated last (reading down = forward in time).
  const children = [...(childrenByParent.get(node.id) ?? [])].sort(sortByPromotion)
  const leafChildren = children.filter(child => !childrenByParent.has(child.id))
  const branchChildren =
    generation < maxDepth ? children.filter(child => childrenByParent.has(child.id)) : []

  const dimmed = matchedMemberIds !== null && !matchedMemberIds.has(node.id)

  return (
    <div data-lineage-conn-col className="flex min-w-fit flex-col items-center">
      <LineageBoxCard
        node={node}
        promoterName={promoterName}
        leafChildren={leafChildren}
        branchCount={branchChildren.length}
        isFocal={node.id === focusMemberId}
        dimmed={dimmed}
        onFocus={handlers.onFocus}
        onOpenMenu={handlers.onOpenMenu}
        onOpenProfile={handlers.onOpenProfile}
      />

      {branchChildren.length > 0 && (
        <div className="relative mt-10 flex items-start justify-center gap-8">
          <ConnectorBand
            columns={branchChildren.map(child => ({
              id: child.id,
              year: promotionYear(child.promotionDate),
            }))}
            generation={generation}
            reduceMotion={reduceMotion}
          />
          {branchChildren.map(child => (
            <BoxNode
              key={child.id}
              node={child}
              promoterName={node.displayName}
              childrenByParent={childrenByParent}
              focusMemberId={focusMemberId}
              generation={generation + 1}
              maxDepth={maxDepth}
              matchedMemberIds={matchedMemberIds}
              reduceMotion={reduceMotion}
              handlers={handlers}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Ancestor spine above the focal node (single column up to the root).
// ---------------------------------------------------------------------------
function AncestorSpine({
  ancestors,
  matchedMemberIds,
  handlers,
}: {
  ancestors: LineageVisualNode[]
  matchedMemberIds: Set<string> | null
  handlers: LineageTimelineHandlers
}) {
  if (ancestors.length === 0) return null
  return (
    <div className="mb-10 flex flex-col items-center gap-3">
      {ancestors.map(ancestor => {
        const dimmed = matchedMemberIds !== null && !matchedMemberIds.has(ancestor.id)
        return (
          <div key={ancestor.id} className="flex flex-col items-center gap-3">
            <button
              type="button"
              id={`lineage-member-${ancestor.id}`}
              onClick={() => handlers.onFocus(ancestor.id)}
              data-dimmed={dimmed || undefined}
              className={cx(
                "flex items-center gap-2.5 rounded-2xl px-3 py-2 text-left text-white transition hover:bg-white/[0.04] data-[dimmed]:opacity-30",
                SOLID_PANEL,
              )}
            >
              <CardAvatar
                node={ancestor}
                size={36}
                bright={relativeLuminance(ancestor.colorHex) > 0.6}
              />
              <span
                className="max-w-44 truncate text-sm font-bold italic text-white/90"
                style={{
                  fontFamily: "var(--font-bbl-heading),system-ui,sans-serif",
                }}
              >
                {ancestor.displayName}
              </span>
              <BeltSwatch variant="bar" colorHex={ancestor.colorHex} />
              {promotionYear(ancestor.promotionDate) && (
                <span className="shrink-0 text-[0.6rem] font-semibold tabular-nums text-white/35">
                  {promotionYear(ancestor.promotionDate)}
                </span>
              )}
            </button>
            <span aria-hidden className="h-6 w-px bg-border" />
          </div>
        )
      })}
    </div>
  )
}

export function LineageCohortTimeline({
  nodes,
  focusMemberId,
  ancestryDepth,
  progenyDepth,
  matchedMemberIds,
  reduceMotion,
  onFocus,
  onOpenMenu,
  onOpenProfile,
}: LineageCohortTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const nodeById = useMemo(() => new Map(nodes.map(node => [node.id, node])), [nodes])

  const childrenByParent = useMemo(() => {
    const map = new Map<string, LineageVisualNode[]>()
    for (const node of nodes) {
      const parentId = node.primaryVisualParentMemberId
      if (!parentId) continue
      const list = map.get(parentId) ?? []
      list.push(node)
      map.set(parentId, list)
    }
    return map
  }, [nodes])

  const focalNode = focusMemberId ? (nodeById.get(focusMemberId) ?? null) : (nodes[0] ?? null)

  // Ancestor spine: walk up from focal, capped by ancestryDepth, ordered root→focal.
  const ancestors = useMemo(() => {
    if (!focalNode) return []
    const chain: LineageVisualNode[] = []
    const seen = new Set<string>()
    let cursor = focalNode.primaryVisualParentMemberId
    while (cursor && !seen.has(cursor) && chain.length < ancestryDepth) {
      const parent = nodeById.get(cursor)
      if (!parent) break
      seen.add(cursor)
      chain.push(parent)
      cursor = parent.primaryVisualParentMemberId
    }
    return chain.reverse()
  }, [focalNode, nodeById, ancestryDepth])

  const handlers = useMemo<LineageTimelineHandlers>(
    () => ({ onFocus, onOpenMenu, onOpenProfile }),
    [onFocus, onOpenMenu, onOpenProfile],
  )

  // Auto-center the focal box on focus change (replaces family-chart's tree_position).
  useEffect(() => {
    if (!focusMemberId) return
    const el = document.getElementById(`lineage-member-${focusMemberId}`)
    el?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center",
      inline: "center",
    })
  }, [focusMemberId, reduceMotion])

  if (!focalNode) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-white/40">
        No lineage members to display.
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="size-full overflow-auto" style={{ scrollbarWidth: "thin" }}>
      <div className="flex min-h-full min-w-fit flex-col items-center px-10 py-12">
        <AncestorSpine
          ancestors={ancestors}
          matchedMemberIds={matchedMemberIds}
          handlers={handlers}
        />
        <BoxNode
          node={focalNode}
          promoterName={ancestors.at(-1)?.displayName ?? null}
          childrenByParent={childrenByParent}
          focusMemberId={focusMemberId}
          generation={0}
          maxDepth={progenyDepth}
          matchedMemberIds={matchedMemberIds}
          reduceMotion={reduceMotion}
          handlers={handlers}
        />
      </div>
    </div>
  )
}
