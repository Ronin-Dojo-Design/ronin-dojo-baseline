"use client"

import { Menu } from "@base-ui/react/menu"
import { useReducedMotion } from "@mantine/hooks"
import {
  ChevronDownIcon,
  CopyIcon,
  FocusIcon,
  NetworkIcon,
  PencilIcon,
  RouteIcon,
  ShieldCheckIcon,
  UserRoundIcon,
  UserRoundPlusIcon,
  UsersRoundIcon,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react"
import { BeltSwatch } from "~/components/common/belt-swatch"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/common/dropdown-menu"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { LineageCohortTimeline } from "~/components/web/lineage/lineage-cohort-timeline"
import {
  LineageProfileDrawer,
  type LineageProfileDrawerTab,
} from "~/components/web/lineage/lineage-profile-drawer"
import { bblPortalTypographyClass } from "~/lib/fonts"
import { BBL, rgba } from "~/lib/lineage/belt-color"
import { memberInitials } from "~/lib/lineage/canvas-model"
import {
  deriveFacets,
  facetKey,
  matchMemberIds,
  type FilterDimension,
  type FilterFacet,
} from "~/lib/lineage/filter-facets"
import { toLineageVisual } from "~/lib/lineage/to-lineage-visual"
import type { LineageTrustStatus } from "~/lib/lineage/trust-status"
import type { ClaimViewerState } from "~/server/web/claims/resolve-viewer-claim-state"
import type {
  LineageNodeProfile,
  LineageRelationshipRow,
  LineageTreeMemberRow,
  LineageVisualGroupRow,
} from "~/server/web/lineage/payloads"
import { cx, popoverAnimationClasses } from "~/lib/utils"

type Props = {
  members: LineageTreeMemberRow[]
  relationships?: Pick<LineageRelationshipRow, "fromNodeId" | "toNodeId" | "type">[]
  /** Cohort groups (e.g. the Dirty Dozen) — resolves the group filter chip label. */
  visualGroups?: Pick<LineageVisualGroupRow, "id" | "label">[]
  defaultRootMemberId?: string | null
  profilesById: Record<string, LineageNodeProfile>
  /**
   * The viewer's claim state per node id (ADR 0036, SESSION_0440). Threaded from the
   * page loader's shared resolver so the drawer + card menu render the right CTA and
   * never offer a claim on a claimed/pending node.
   */
  claimStateByNodeId?: Record<string, ClaimViewerState>
  treeSlug?: string
  isTreeClaimable?: boolean
  /**
   * The tree's discipline (ADR 0035 §3). This tree is a discipline-scoped surface, so the
   * shown belt is the member's highest rank IN THIS DISCIPLINE — passed through to the
   * resolver so a multi-discipline holder shows the right belt (BBL tree = BJJ).
   */
  disciplineId?: string | null
  initialFocusId?: string | null
  /** Tree owner / platform admin — gates the "Open in editor" card action. */
  canManage?: boolean
}

// Depth control: value === MAX_DEPTH means "All" (a depth larger than any real tree).
const MAX_DEPTH = 6

// Solid "legacy/authoritative" chrome — replaces glassmorphism (no backdrop-blur).
const SOLID_PANEL =
  "border border-white/8 bg-[#0c0c0d] shadow-[0_20px_60px_-26px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.045)]"
const SOLID_PILL =
  "border border-white/8 bg-[#101011] shadow-[0_12px_30px_-18px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.04)]"

// Trust state is detail-level metadata — focus panel / drawer only.
const TRUST_LABEL: Record<LineageTrustStatus, string> = {
  verified: "Verified",
  disputed: "Disputed",
  "claim-pending": "Claim pending",
  claimed: "Claimed",
  imported: "Imported",
  unverified: "Unverified",
}

// Filter dimensions render as one labeled dropdown each (Apple-clean bar,
// SESSION_0401) — order + display labels for the bar.
const DIMENSION_ORDER: FilterDimension[] = ["group", "belt", "school", "year"]
const DIMENSION_LABEL: Record<FilterDimension, string> = {
  group: "Group",
  belt: "Belt",
  school: "School",
  year: "Year",
}

/**
 * One dimension's multi-select dropdown for the filter bar. Composes the L1
 * `DropdownMenu` + `DropdownMenuCheckboxItem` primitives (checkbox items keep
 * the menu open for multi-toggle) — never a hand-rolled menu (FS-0001). The
 * trigger surfaces active state via a count badge so a closed filter still
 * reads as "on".
 */
function FilterDropdown({
  label,
  facets,
  activeFilters,
  onToggle,
  onClear,
}: {
  label: string
  facets: FilterFacet[]
  activeFilters: Set<string>
  onToggle: (key: string) => void
  onClear: () => void
}) {
  const activeCount = facets.reduce(
    (count, facet) => (activeFilters.has(facetKey(facet)) ? count + 1 : count),
    0,
  )
  const active = activeCount > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cx(
          "inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-white/70 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring max-sm:flex-1 max-sm:basis-[calc(50%-0.25rem)]",
          active ? "border border-primary/40 bg-primary/15 text-white" : SOLID_PILL,
        )}
      >
        <span className="text-[0.62rem] font-bold uppercase tracking-[0.16em]">{label}</span>
        {active && (
          <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[0.6rem] font-black text-white">
            {activeCount}
          </span>
        )}
        <ChevronDownIcon className="ml-auto size-3.5 opacity-60 sm:ml-0" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="max-h-80 min-w-52 overflow-y-auto">
        {facets.map(facet => {
          const key = facetKey(facet)
          return (
            <DropdownMenuCheckboxItem
              key={key}
              checked={activeFilters.has(key)}
              onCheckedChange={() => onToggle(key)}
            >
              <span className="flex min-w-0 items-center gap-2">
                {facet.dimension === "belt" && (
                  <BeltSwatch variant="bar" colorHex={facet.colorHex} />
                )}
                <span className="max-w-[12rem] truncate">{facet.label}</span>
              </span>
            </DropdownMenuCheckboxItem>
          )
        })}

        {active && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onClear}>Clear {label.toLowerCase()}</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function DepthStepper({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (next: number) => void
}) {
  return (
    <div
      className={cx("flex min-w-0 items-center gap-1 rounded-xl px-2 py-1 text-white", SOLID_PILL)}
    >
      <span className="w-14 truncate text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white/45">
        {label}
      </span>

      <button
        type="button"
        aria-label={`Decrease ${label.toLowerCase()} depth`}
        disabled={value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
        className="flex size-6 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        −
      </button>

      <span className="min-w-7 text-center text-xs font-bold tabular-nums text-white">
        {value >= MAX_DEPTH ? "All" : value}
      </span>

      <button
        type="button"
        aria-label={`Increase ${label.toLowerCase()} depth`}
        disabled={value >= MAX_DEPTH}
        onClick={() => onChange(Math.min(MAX_DEPTH, value + 1))}
        className="flex size-6 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        +
      </button>
    </div>
  )
}

function MetricPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
}) {
  return (
    <div className={cx("rounded-2xl px-4 py-3", SOLID_PILL)}>
      <div className="flex items-center gap-2 text-white/45">
        <span className="[&_svg]:size-4">{icon}</span>
        <span className="text-[0.62rem] font-bold uppercase tracking-[0.2em]">{label}</span>
      </div>
      <div className="mt-2 text-xl font-black tracking-[-0.04em] text-white">{value}</div>
    </div>
  )
}

// Compact mobile metric — value + label inline, for the slim header strip.
function MetricStat({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-sm font-black tabular-nums text-white">{value}</span>
      <span className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-white/45">
        {label}
      </span>
    </span>
  )
}

function PremiumPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cx("rounded-3xl p-4", SOLID_PANEL, className)}>{children}</div>
}

export function LineageViewAIsland({
  members,
  relationships = [],
  visualGroups = [],
  defaultRootMemberId,
  profilesById,
  claimStateByNodeId,
  treeSlug,
  isTreeClaimable = false,
  disciplineId,
  initialFocusId,
  canManage = false,
}: Props) {
  const reduceMotion = useReducedMotion() ?? false

  const initialMemberId = initialFocusId ?? defaultRootMemberId ?? members[0]?.id ?? null
  const [focusMemberId, setFocusMemberId] = useState<string | null>(initialMemberId)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMemberId, setDrawerMemberId] = useState<string | null>(null)
  const [drawerTab, setDrawerTab] = useState<LineageProfileDrawerTab>("info")

  // "Click to recenter" hint auto-dismisses after the first focus interaction.
  const [hasInteracted, setHasInteracted] = useState(false)

  const [ancestryDepth, setAncestryDepth] = useState(MAX_DEPTH)
  const [progenyDepth, setProgenyDepth] = useState(MAX_DEPTH)

  const [cardMenu, setCardMenu] = useState<{
    memberId: string
    anchorEl: HTMLElement
  } | null>(null)
  const [copied, setCopied] = useState(false)

  // Derived multi-select filter — belt + school facets from existing DTO data
  // (no schema). Empty set = no active filter (all shown). (SESSION_0395 grill Q7)
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set())

  const memberMap = useMemo(() => new Map(members.map(member => [member.id, member])), [members])
  const drawerMember = drawerMemberId ? (memberMap.get(drawerMemberId) ?? null) : null
  const drawerProfile = drawerMember ? (profilesById[drawerMember.nodeId] ?? null) : null

  const drawerStudents = useMemo(
    () =>
      drawerMember
        ? members.filter(member => member.primaryVisualParentMemberId === drawerMember.id)
        : [],
    [members, drawerMember],
  )

  const { nodes, secondaryLinks } = useMemo(
    () =>
      toLineageVisual(members, {
        mainMemberId: initialMemberId,
        relationships,
        visualGroups,
        disciplineId,
      }),
    [members, initialMemberId, relationships, visualGroups, disciplineId],
  )

  const nodeByMemberId = useMemo(() => new Map(nodes.map(node => [node.id, node])), [nodes])
  const focusNode = focusMemberId ? (nodeByMemberId.get(focusMemberId) ?? null) : null
  const activeMenuNode = cardMenu ? (nodeByMemberId.get(cardMenu.memberId) ?? null) : null

  const rootCount = useMemo(
    () => members.filter(member => !member.primaryVisualParentMemberId).length,
    [members],
  )

  const verifiedCount = useMemo(
    () => nodes.filter(node => node.trustStatus === "verified").length,
    [nodes],
  )

  const claimableCount = useMemo(() => nodes.filter(node => node.claimable).length, [nodes])

  // Derive filter facets from existing DTO data (no schema): cohort group (e.g.
  // the Dirty Dozen), belt, school, and promotion year — one labeled dropdown
  // each. Matching is AND-across / OR-within (see `lib/lineage/filter-facets`).
  const facets = useMemo(() => deriveFacets(nodes), [nodes])

  const facetByKey = useMemo(() => new Map(facets.map(facet => [facetKey(facet), facet])), [facets])

  // Group facets by dimension so the bar renders one dropdown per dimension.
  const facetsByDimension = useMemo(() => {
    const map = new Map<FilterDimension, FilterFacet[]>()
    for (const facet of facets) {
      const list = map.get(facet.dimension)
      if (list) list.push(facet)
      else map.set(facet.dimension, [facet])
    }
    return map
  }, [facets])

  const matchedMemberIds = useMemo(() => {
    const activeFacets = [...activeFilters]
      .map(key => facetByKey.get(key))
      .filter((facet): facet is FilterFacet => facet != null)
    return matchMemberIds(nodes, activeFacets)
  }, [activeFilters, facetByKey, nodes])

  const toggleFilter = useCallback((key: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  // Per-dimension clear — drop only this dimension's active keys.
  const clearDimension = useCallback((dimension: FilterDimension) => {
    setActiveFilters(prev => {
      const next = new Set(prev)
      for (const key of next) {
        if (key.startsWith(`${dimension}:`)) next.delete(key)
      }
      return next
    })
  }, [])

  const openDrawer = useCallback((memberId: string) => {
    setDrawerMemberId(memberId)
    setDrawerTab("info")
    setDrawerOpen(true)
  }, [])

  // Tap a student avatar in the drawer carousel → swap the drawer (recursive drill).
  const selectStudent = useCallback(
    (memberId: string) => {
      const member = memberMap.get(memberId)
      if (member && profilesById[member.nodeId]) {
        setDrawerMemberId(memberId)
      }
    },
    [memberMap, profilesById],
  )

  const focusMember = useCallback((memberId: string) => {
    setFocusMemberId(memberId)
    setHasInteracted(true)
    const sp = new URLSearchParams(window.location.search)
    sp.set("view", "explore")
    sp.set("focus", memberId)
    window.history.replaceState(null, "", `?${sp.toString()}`)
  }, [])

  const openCardMenu = useCallback((memberId: string, anchorEl: HTMLElement) => {
    setCardMenu({ memberId, anchorEl })
  }, [])

  const copyFocusLink = useCallback((memberId: string) => {
    const sp = new URLSearchParams(window.location.search)
    sp.set("view", "explore")
    sp.set("focus", memberId)
    const url = `${window.location.origin}${window.location.pathname}?${sp.toString()}`

    void navigator.clipboard?.writeText(url)
    setCardMenu(null)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }, [])

  // Keep React focus in sync if the initial focus id resolves late (data load).
  useEffect(() => {
    if (!focusMemberId && initialMemberId) setFocusMemberId(initialMemberId)
  }, [focusMemberId, initialMemberId])

  const focusTrustLabel = focusNode
    ? (TRUST_LABEL[focusNode.trustStatus] ?? focusNode.trustStatus)
    : null

  return (
    <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/8 bg-[#050505] text-white shadow-2xl shadow-black/60 [font-family:var(--font-bbl-body),system-ui,sans-serif]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-14rem] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_28rem)]" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black to-transparent" />
      </div>

      <div className="relative z-10 p-4 sm:p-5 lg:p-6">
        <div className="mb-3 grid gap-4 sm:mb-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <PremiumPanel className="max-sm:p-3">
            <div className="flex flex-col gap-4 sm:gap-5 2xl:flex-row 2xl:items-end 2xl:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/8 bg-[#141415] px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white/60 sm:text-[0.65rem]">
                    <RouteIcon className="size-3.5" />
                    Focal lineage view
                  </span>
                </div>

                {/* Slim mobile title (YouTube-app header); desktop keeps the full heading + lede. */}
                <h2 className="mt-3 text-xl uppercase italic tracking-[0.01em] text-white [font-family:var(--font-bbl-heading),system-ui,sans-serif] sm:hidden">
                  Living lineage
                </h2>

                <h2 className="mt-4 hidden text-balance text-3xl uppercase italic tracking-[0.01em] text-white [font-family:var(--font-bbl-heading),system-ui,sans-serif] sm:block sm:text-4xl lg:text-5xl">
                  Explore the living lineage.
                </h2>

                <p className="mt-3 hidden max-w-3xl text-pretty text-sm/6 text-white/60 sm:block sm:text-base/7">
                  Click any practitioner to recenter the tree and trace their lineage. Instructors
                  with students of their own branch into their own box; everyone else lists under
                  their teacher — tap them to open their profile and full student roster.
                </p>
              </div>

              {/* Metrics — thin inline strip on mobile, MetricPill grid on sm+. */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:hidden">
                <MetricStat label="Members" value={members.length} />
                <span aria-hidden className="text-white/20">
                  ·
                </span>
                <MetricStat label="Verified" value={verifiedCount} />
                <span aria-hidden className="text-white/20">
                  ·
                </span>
                <MetricStat label="Roots" value={rootCount} />
              </div>

              <div className="hidden w-full shrink-0 grid-cols-3 gap-2 sm:grid md:w-auto md:max-w-[25rem]">
                <MetricPill icon={<UsersRoundIcon />} label="Members" value={members.length} />
                <MetricPill icon={<ShieldCheckIcon />} label="Verified" value={verifiedCount} />
                <MetricPill icon={<NetworkIcon />} label="Roots" value={rootCount} />
              </div>
            </div>
          </PremiumPanel>

          <PremiumPanel className="hidden flex-col justify-between gap-4 xl:flex">
            <div>
              <div className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-white/42">
                Current focus
              </div>

              <div className="mt-3 flex items-start gap-3">
                <div
                  className="flex size-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm font-black text-white shadow-lg"
                  style={{
                    boxShadow: focusNode?.colorHex
                      ? `0 0 22px ${rgba(focusNode.colorHex, 0.24)}`
                      : undefined,
                  }}
                >
                  {memberInitials(focusNode?.displayName ?? "Lineage")}
                </div>

                <div className="min-w-0">
                  <div className="truncate text-lg italic text-white [font-family:var(--font-bbl-heading),system-ui,sans-serif]">
                    {focusNode?.displayName ?? "Select a practitioner"}
                  </div>

                  <div className="mt-1.5 flex items-center gap-2">
                    <BeltSwatch variant="bar" shimmer colorHex={focusNode?.colorHex} />
                    <span className="min-w-0 truncate text-xs text-white/55">
                      {focusNode?.rankLabel ?? "Unranked"}
                    </span>
                  </div>

                  {focusNode?.schoolLabel && (
                    <div className="mt-1 truncate text-xs text-white/42">
                      {focusNode.schoolLabel}
                    </div>
                  )}

                  {focusTrustLabel && (
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-[#101011] px-2 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white/62">
                      <ShieldCheckIcon className="size-3" />
                      {focusTrustLabel}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={!focusMemberId}
              onClick={() => {
                if (focusMemberId) openDrawer(focusMemberId)
              }}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 text-xs font-bold text-white transition hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <UserRoundIcon className="size-4" />
              View profile
            </button>
          </PremiumPanel>
        </div>

        {/* Filter bar — one labeled dropdown per dimension; dim non-matches (not hide).
            Matching is AND-across / OR-within (lib/lineage/filter-facets). */}
        {facets.length > 0 && (
          <Stack direction="row" wrap size="sm" className="mb-3 max-sm:gap-2">
            {DIMENSION_ORDER.map(dimension => {
              const dimensionFacets = facetsByDimension.get(dimension)
              if (!dimensionFacets || dimensionFacets.length === 0) return null
              return (
                <FilterDropdown
                  key={dimension}
                  label={DIMENSION_LABEL[dimension]}
                  facets={dimensionFacets}
                  activeFilters={activeFilters}
                  onToggle={toggleFilter}
                  onClear={() => clearDimension(dimension)}
                />
              )
            })}
            {activeFilters.size > 0 && (
              <button
                type="button"
                onClick={() => setActiveFilters(new Set())}
                className="text-[0.68rem] font-semibold text-white/45 underline-offset-2 transition hover:text-white hover:underline max-sm:ml-auto"
              >
                Clear all
              </button>
            )}
          </Stack>
        )}

        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/8 bg-black/60 shadow-2xl shadow-black/50">
          <div
            className="relative"
            style={
              {
                width: "100%",
                // SESSION_0411: content-driven height (only a floor). The fixed
                // `clamp(560px,78vh,880px)` cap trapped the 77-member tree in a
                // both-axis nested scroller; now the box grows to the tree's full
                // height so the page scrolls vertically to the bottom.
                minHeight: 560,
                background: "#050505",
              } as CSSProperties
            }
          >
            {/* Depth controls — FI-013: at phone width the top-right absolute overlay
                floated over the root member card, hiding its name/rank. On mobile the
                controls now flow as an in-canvas bar ABOVE the tree (no overlap); at
                `sm`+ they restore to the top-right overlay so the desktop layout is
                unchanged. Same single instance drives both. */}
            <div className="relative z-20 flex flex-row flex-wrap justify-end gap-2 px-3 pt-3 sm:absolute sm:right-4 sm:top-4 sm:flex-col sm:px-0 sm:pt-0">
              <DepthStepper label="Ancestry" value={ancestryDepth} onChange={setAncestryDepth} />
              <DepthStepper label="Progeny" value={progenyDepth} onChange={setProgenyDepth} />
            </div>

            <LineageCohortTimeline
              nodes={nodes}
              focusMemberId={focusMemberId}
              ancestryDepth={ancestryDepth}
              progenyDepth={progenyDepth}
              matchedMemberIds={matchedMemberIds}
              reduceMotion={reduceMotion}
              onFocus={focusMember}
              onOpenMenu={openCardMenu}
              onOpenProfile={openDrawer}
            />
          </div>

          <div className="pointer-events-none absolute left-1/2 top-[-8rem] h-80 w-80 -translate-x-1/2 rounded-full bg-primary/18 blur-[120px]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/70 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />

          <div className="absolute left-3 top-3 z-20 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-2 sm:left-4 sm:top-4">
            {!hasInteracted && (
              <div
                className={cx(
                  "inline-flex items-center gap-2 rounded-full px-3 py-2 text-[0.68rem] font-black uppercase tracking-[0.18em] text-white/72",
                  SOLID_PILL,
                )}
              >
                <FocusIcon className="size-3.5 text-primary" />
                Tap to recenter
              </div>
            )}
          </div>

          <div className="absolute bottom-3 left-3 z-20 hidden max-w-[calc(100%-1.5rem)] flex-wrap gap-2 sm:bottom-4 sm:left-4 sm:flex">
            <div
              className={cx(
                "inline-flex items-center gap-2 rounded-full px-3 py-2 text-[0.68rem] font-bold text-white/58",
                SOLID_PILL,
              )}
            >
              <span className="size-2 rounded-full bg-primary shadow-[0_0_12px] shadow-primary/70" />
              Primary lineage
            </div>

            {secondaryLinks.length > 0 && (
              <div
                className={cx(
                  "inline-flex items-center gap-2 rounded-full px-3 py-2 text-[0.68rem] font-bold text-white/58",
                  SOLID_PILL,
                )}
              >
                <svg width="28" height="10" aria-hidden>
                  <line
                    x1="0"
                    y1="5"
                    x2="28"
                    y2="5"
                    stroke={BBL.gold}
                    strokeWidth="1.5"
                    strokeDasharray="4,3"
                    strokeOpacity="0.9"
                  />
                </svg>
                {secondaryLinks.length} cross-training link
                {secondaryLinks.length === 1 ? "" : "s"}
              </div>
            )}
          </div>

          {copied && (
            // SESSION_0411: fixed to the viewport so the transient confirmation stays
            // visible no matter how far the page has scrolled down the tall tree.
            <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/10 bg-white px-4 py-2 text-xs font-black text-black shadow-2xl">
              Focus link copied
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-white/42">
          <span className="hidden sm:inline">
            Best on desktop; fully usable on mobile — tap a card to recenter, scroll the canvas, and
            use depth controls to simplify.
          </span>

          {claimableCount > 0 && (
            <span className="font-semibold text-white/60">
              {claimableCount} claimable {claimableCount === 1 ? "profile" : "profiles"}
            </span>
          )}
        </div>
      </div>

      <Menu.Root
        open={cardMenu !== null}
        onOpenChange={open => {
          if (!open) setCardMenu(null)
        }}
      >
        <Menu.Portal>
          <Menu.Positioner
            anchor={cardMenu?.anchorEl ?? null}
            side="bottom"
            align="end"
            sideOffset={6}
            className="isolate z-50"
          >
            <Menu.Popup
              className={cx(
                "flex min-w-48 flex-col rounded-xl border border-white/10 bg-[#0a0a0b] p-1 text-white shadow-2xl shadow-black/50",
                popoverAnimationClasses,
              )}
            >
              <DropdownMenuItem
                onClick={() => {
                  if (cardMenu) openDrawer(cardMenu.memberId)
                  setCardMenu(null)
                }}
              >
                <UserRoundIcon />
                View profile
              </DropdownMenuItem>

              {activeMenuNode?.claimable &&
                isTreeClaimable &&
                // SESSION_0440 — don't offer a claim on a node already claimed or with the
                // viewer's claim pending (shared resolver). Undefined (un-threaded) → UNCLAIMED.
                (claimStateByNodeId?.[activeMenuNode.nodeId] ?? "UNCLAIMED") === "UNCLAIMED" && (
                  <DropdownMenuItem
                    render={<Link href={`/lineage/join?node=${activeMenuNode.nodeId}`} />}
                  >
                    <UserRoundPlusIcon />
                    Claim this profile
                  </DropdownMenuItem>
                )}

              <DropdownMenuItem
                onClick={() => {
                  if (cardMenu) copyFocusLink(cardMenu.memberId)
                }}
              >
                <CopyIcon />
                Copy focus link
              </DropdownMenuItem>

              {canManage && treeSlug && activeMenuNode && (
                <DropdownMenuItem
                  render={<Link href={`/lineage/${treeSlug}/edit/${activeMenuNode.nodeId}`} />}
                >
                  <PencilIcon />
                  Open in editor
                </DropdownMenuItem>
              )}
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      <LineageProfileDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        profile={drawerProfile}
        disciplineId={disciplineId}
        isClaimable={drawerMember?.isClaimable ?? false}
        isTreeClaimable={isTreeClaimable}
        viewerClaimState={drawerMember ? claimStateByNodeId?.[drawerMember.nodeId] : undefined}
        treeSlug={treeSlug}
        nodeId={drawerMember?.nodeId}
        isAdmin={canManage}
        activeTab={drawerTab}
        onTabChange={setDrawerTab}
        contentClassName={bblPortalTypographyClass}
        students={drawerStudents}
        onSelectStudent={selectStudent}
      />
    </div>
  )
}
