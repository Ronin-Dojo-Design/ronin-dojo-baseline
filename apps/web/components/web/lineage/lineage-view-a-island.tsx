"use client"

import { useReducedMotion } from "@mantine/hooks"
import { FocusIcon } from "lucide-react"
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react"
import { LineageCohortTimeline } from "~/components/web/lineage/lineage-cohort-timeline"
import { CardMenu } from "~/components/web/lineage/lineage-view-a/card-menu"
import { SOLID_PILL } from "~/components/web/lineage/lineage-view-a/chrome"
import { FilterBar } from "~/components/web/lineage/lineage-view-a/filter-bar"
import { FocusPanel } from "~/components/web/lineage/lineage-view-a/focus-panel"
import { MetricsHeader } from "~/components/web/lineage/lineage-view-a/metrics-header"
import { useLineageFocus } from "~/components/web/lineage/lineage-view-a/use-lineage-focus"
import { useLineageViewAFilters } from "~/components/web/lineage/lineage-view-a/use-lineage-view-a-filters"
import {
  LineageProfileDrawer,
  type LineageProfileDrawerTab,
} from "~/components/web/lineage/lineage-profile-drawer"
import { bblPortalTypographyClass } from "~/lib/fonts"
import { BBL } from "~/lib/lineage/belt-color"
import { toLineageVisual } from "~/lib/lineage/to-lineage-visual"
import type { LineageTrustStatus } from "~/lib/lineage/trust-status"
import type { ClaimViewerState } from "~/server/web/claims/resolve-viewer-claim-state"
import type {
  LineageNodeProfile,
  LineageRelationshipRow,
  LineageTreeMemberRow,
  LineageVisualGroupRow,
} from "~/server/web/lineage/payloads"
import { cx } from "~/lib/utils"

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

// Trust state is detail-level metadata — focus panel / drawer only.
const TRUST_LABEL: Record<LineageTrustStatus, string> = {
  verified: "Verified",
  disputed: "Disputed",
  "claim-pending": "Claim pending",
  claimed: "Claimed",
  imported: "Imported",
  unverified: "Unverified",
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

  // Students-rail bake-off toggle (SESSION_0496, Epic A0.5): `?cards=v2` opts the
  // drawer into the V2 player-card carousel. Resolved in an effect (not render) so the
  // SSR pass and first client render agree on "v1" — no hydration mismatch; anything
  // other than "v2" stays V1, the regression guarantee.
  const [studentsCarouselVariant, setStudentsCarouselVariant] = useState<"v1" | "v2">("v1")
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("cards") === "v2") {
      setStudentsCarouselVariant("v2")
    }
  }, [])

  const initialMemberId = initialFocusId ?? defaultRootMemberId ?? members[0]?.id ?? null
  const { focusMemberId, focusMember, copyFocusLink, copied, hasInteracted } =
    useLineageFocus(initialMemberId)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMemberId, setDrawerMemberId] = useState<string | null>(null)
  const [drawerTab, setDrawerTab] = useState<LineageProfileDrawerTab>("info")

  const [ancestryDepth, setAncestryDepth] = useState(MAX_DEPTH)
  const [progenyDepth, setProgenyDepth] = useState(MAX_DEPTH)

  const [cardMenu, setCardMenu] = useState<{
    memberId: string
    anchorEl: HTMLElement
  } | null>(null)

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

  // Derived multi-select filter (cohort group / belt / school / year) from the
  // existing DTO data — no schema. `matchedMemberIds` may be null ("all lit");
  // it is forwarded straight to `<LineageCohortTimeline>` unchanged.
  const {
    activeFilters,
    facets,
    facetsByDimension,
    matchedMemberIds,
    toggleFilter,
    clearDimension,
    clearAll,
  } = useLineageViewAFilters(nodes)

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

  const openCardMenu = useCallback((memberId: string, anchorEl: HTMLElement) => {
    setCardMenu({ memberId, anchorEl })
  }, [])

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
          <MetricsHeader
            memberCount={members.length}
            verifiedCount={verifiedCount}
            rootCount={rootCount}
          />

          <FocusPanel
            focusNode={focusNode}
            focusTrustLabel={focusTrustLabel}
            focusMemberId={focusMemberId}
            onViewProfile={openDrawer}
          />
        </div>

        <FilterBar
          facets={facets}
          facetsByDimension={facetsByDimension}
          activeFilters={activeFilters}
          onToggle={toggleFilter}
          onClearDimension={clearDimension}
          onClearAll={clearAll}
        />

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
            Tap a card to recenter · scroll to explore · use depth controls to simplify.
          </span>

          {claimableCount > 0 && (
            <span className="font-semibold text-white/60">
              {claimableCount} claimable {claimableCount === 1 ? "profile" : "profiles"}
            </span>
          )}
        </div>
      </div>

      <CardMenu
        cardMenu={cardMenu}
        activeMenuNode={activeMenuNode}
        claimStateByNodeId={claimStateByNodeId}
        isTreeClaimable={isTreeClaimable}
        canManage={canManage}
        treeSlug={treeSlug}
        openDrawer={openDrawer}
        copyFocusLink={copyFocusLink}
        onClose={() => setCardMenu(null)}
      />

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
        studentsCarouselVariant={studentsCarouselVariant}
      />
    </div>
  )
}
