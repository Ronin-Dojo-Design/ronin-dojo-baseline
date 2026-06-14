"use client"

import { Menu } from "@base-ui/react/menu"
import { LinkIcon, PencilIcon, UserRoundIcon, UserRoundPlusIcon } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { createChart } from "~/lib/lineage/family-chart/index"
import { toFamilyChartData } from "~/lib/lineage/to-family-chart-data"
import { toLineageVisual } from "~/lib/lineage/to-lineage-visual"
import { memberInitials } from "~/lib/lineage/canvas-model"
import type { LineageTrustStatus } from "~/lib/lineage/trust-status"
import {
  clearSecondaryLinks,
  updateSecondaryLinks,
} from "~/lib/lineage/family-chart/renderers/view-secondary-links"
import { DropdownMenuItem } from "~/components/common/dropdown-menu"
import { Link } from "~/components/common/link"
import { LineageProfileDrawer } from "~/components/web/lineage/lineage-profile-drawer"
import type {
  LineageNodeProfile,
  LineageRelationshipRow,
  LineageTreeMemberRow,
} from "~/server/web/lineage/payloads"
import type { TreeDatum } from "~/lib/lineage/family-chart/types/treeData"
import { cx, popoverAnimationClasses } from "~/lib/utils"
import "~/lib/lineage/family-chart/styles/family-chart.css"

type Props = {
  members: LineageTreeMemberRow[]
  relationships?: Pick<LineageRelationshipRow, "fromNodeId" | "toNodeId" | "type">[]
  defaultRootMemberId?: string | null
  profilesById: Record<string, LineageNodeProfile>
  treeSlug?: string
  isTreeClaimable?: boolean
  initialFocusId?: string | null
  /** Tree owner / platform admin — gates the "Open in editor" card action. */
  canManage?: boolean
}

// Depth control: value === MAX_DEPTH means "All". The engine's trimTree takes a
// numeric depth, so "All" is expressed as a depth larger than any real tree.
const MAX_DEPTH = 6
const DEPTH_ALL = 50

// Trust badge config — inline styles, no Tailwind (card is d3-managed DOM)
const TRUST_BADGE: Record<LineageTrustStatus, { bg: string; fg: string; label: string }> = {
  verified: { bg: "#dcfce7", fg: "#15803d", label: "Verified" },
  disputed: { bg: "#fee2e2", fg: "#b91c1c", label: "Disputed" },
  "claim-pending": { bg: "#fef3c7", fg: "#92400e", label: "Claim pending" },
  claimed: { bg: "#e0e7ff", fg: "#3730a3", label: "Claimed" },
  imported: { bg: "#f1f5f9", fg: "#64748b", label: "Imported" },
  unverified: { bg: "#f1f5f9", fg: "#64748b", label: "Unverified" },
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function buildCardHtml(d: TreeDatum, isFocal: boolean): string {
  const raw = d.data.data as {
    displayName?: string
    colorHex?: string | null
    rankLabel?: string | null
    schoolLabel?: string | null
    avatar?: string | null
    trustStatus?: LineageTrustStatus
    claimable?: boolean
  }

  const displayName = raw.displayName ?? "Unknown"
  const colorHex = raw.colorHex ?? null
  const rankLabel = raw.rankLabel ?? null
  const schoolLabel = raw.schoolLabel ?? null
  const avatar = raw.avatar ?? null
  const trustStatus = raw.trustStatus ?? "unverified"
  const claimable = raw.claimable ?? false

  const bandColor = colorHex ?? "#e2e8f0"
  const chipBg = colorHex ?? "#64748b"
  const avatarBg = colorHex ?? "#94a3b8"
  const initials = memberInitials(displayName)

  const shadow = isFocal
    ? `0 0 0 2px ${chipBg}, 0 1px 4px rgba(0,0,0,0.10)`
    : "0 1px 4px rgba(0,0,0,0.10)"

  // claimable badge takes precedence over trust status
  const badge = claimable
    ? { bg: "#c7d2fe", fg: "#3730a3", label: "Claimable" }
    : TRUST_BADGE[trustStatus]

  const badgeHtml = badge
    ? `<span style="display:inline-block; margin-top:2px; background:${badge.bg}; color:${badge.fg}; font-size:9px; font-weight:500; padding:1px 5px; border-radius:999px; line-height:1.4;">${badge.label}</span>`
    : ""

  const rankChipHtml = rankLabel
    ? `<div style="position:absolute; top:10px; right:6px; background:${chipBg}; color:#fff; font-size:10px; font-weight:500; padding:2px 6px; border-radius:999px; max-width:68px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escHtml(rankLabel)}</div>`
    : ""

  const avatarHtml = avatar
    ? `<img src="${escHtml(avatar)}" style="width:44px; height:44px; border-radius:50%; object-fit:cover; flex-shrink:0;" />`
    : `<div style="width:44px; height:44px; border-radius:50%; background:${avatarBg}; color:#fff; font-size:16px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0;">${escHtml(initials)}</div>`

  const schoolHtml = schoolLabel
    ? `<div style="font-size:12px; font-weight:400; color:#64748b; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-top:1px;">${escHtml(schoolLabel)}</div>`
    : ""

  // right inset for the text column: clear the rank chip (top) when present, else
  // just clear the ⋮ menu hit-area (bottom-right, ~32px).
  const nameRight = rankLabel ? "82px" : "40px"

  return `
    <div class="card-inner" style="
      position: relative;
      width: 200px;
      min-height: 92px;
      background: #ffffff;
      border-radius: 6px;
      box-shadow: ${shadow};
      overflow: hidden;
    ">
      <div style="position:absolute; top:0; left:0; right:0; height:4px; background-color:${bandColor};"></div>
      ${rankChipHtml}
      <div style="position:absolute; top:12px; left:8px; right:${nameRight}; bottom:8px; display:flex; align-items:flex-start; gap:8px; overflow:hidden;">
        ${avatarHtml}
        <div style="min-width:0; flex:1; display:flex; flex-direction:column; gap:1px; overflow:hidden;">
          <div style="font-size:14px; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#0f172a;">${escHtml(displayName)}</div>
          ${schoolHtml}
          ${badgeHtml}
        </div>
      </div>
      <div data-card-menu role="button" aria-haspopup="menu" tabindex="0" style="position:absolute; bottom:4px; right:4px; min-width:28px; min-height:28px; display:flex; align-items:center; justify-content:center; padding:4px; opacity:0.55; font-size:16px; color:#64748b; cursor:pointer; user-select:none; line-height:1; border-radius:6px;" title="Actions">⋮</div>
    </div>
  `
}

/** Compact +/- depth stepper for ancestry/progeny generations. */
function DepthStepper({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (next: number) => void
}) {
  const btnStyle: React.CSSProperties = {
    minWidth: 28,
    minHeight: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    background: "none",
    cursor: "pointer",
    color: "#475569",
    fontSize: 16,
    lineHeight: 1,
    borderRadius: 6,
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 58, color: "#64748b" }}>{label}</span>
      <button
        type="button"
        aria-label={`Decrease ${label.toLowerCase()} depth`}
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        style={{ ...btnStyle, opacity: value <= 1 ? 0.4 : 1 }}
      >
        −
      </button>
      <span
        style={{
          minWidth: 26,
          textAlign: "center",
          color: "#0f172a",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value >= MAX_DEPTH ? "All" : value}
      </span>
      <button
        type="button"
        aria-label={`Increase ${label.toLowerCase()} depth`}
        onClick={() => onChange(Math.min(MAX_DEPTH, value + 1))}
        disabled={value >= MAX_DEPTH}
        style={{ ...btnStyle, opacity: value >= MAX_DEPTH ? 0.4 : 1 }}
      >
        +
      </button>
    </div>
  )
}

export function LineageViewAIsland({
  members,
  relationships = [],
  defaultRootMemberId,
  profilesById,
  treeSlug,
  isTreeClaimable = false,
  initialFocusId,
  canManage = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMemberId, setDrawerMemberId] = useState<string | null>(null)
  const [showSecondaryLinks, setShowSecondaryLinks] = useState(true)
  // Ref so the afterUpdate closure always reads the current toggle value without remounting
  const showSecondaryLinksRef = useRef(true)
  showSecondaryLinksRef.current = showSecondaryLinks

  // Depth controls — MAX_DEPTH (= "All") by default so nothing regresses from the
  // full-tree baseline; reducing focuses the view (engine trimTree).
  const [ancestryDepth, setAncestryDepth] = useState(MAX_DEPTH)
  const [progenyDepth, setProgenyDepth] = useState(MAX_DEPTH)
  const ancestryDepthRef = useRef(ancestryDepth)
  ancestryDepthRef.current = ancestryDepth
  const progenyDepthRef = useRef(progenyDepth)
  progenyDepthRef.current = progenyDepth
  const depthInitializedRef = useRef(false)

  // Card ⋮ overflow menu — controlled, anchored to the clicked d3 trigger element.
  const [cardMenu, setCardMenu] = useState<{ memberId: string; anchorEl: HTMLElement } | null>(null)
  const [copied, setCopied] = useState(false)

  // member ID → member row (for drawer profile lookup)
  const memberMap = useMemo(() => new Map(members.map(m => [m.id, m])), [members])

  const drawerMember = drawerMemberId ? (memberMap.get(drawerMemberId) ?? null) : null
  const drawerProfile = drawerMember ? (profilesById[drawerMember.nodeId] ?? null) : null

  function openDrawer(memberId: string) {
    setDrawerMemberId(memberId)
    setDrawerOpen(true)
  }

  function copyFocusLink(memberId: string) {
    const sp = new URLSearchParams(window.location.search)
    sp.set("view", "explore")
    sp.set("focus", memberId)
    const url = `${window.location.origin}${window.location.pathname}?${sp.toString()}`
    void navigator.clipboard?.writeText(url)
    setCardMenu(null)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1300)
  }

  const { nodes, secondaryLinks } = useMemo(
    () =>
      toLineageVisual(members, {
        mainMemberId: initialFocusId ?? defaultRootMemberId,
        relationships,
      }),
    [members, initialFocusId, defaultRootMemberId, relationships],
  )

  // member ID → visual node (claimable + nodeId for the ⋮ menu items)
  const nodeByMemberId = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes])
  const activeMenuNode = cardMenu ? (nodeByMemberId.get(cardMenu.memberId) ?? null) : null

  useEffect(() => {
    const cont = containerRef.current
    if (!cont) return

    const data = toFamilyChartData(nodes)
    if (data.length === 0) return

    const focusId = initialFocusId ?? defaultRootMemberId ?? data[0]!.id
    const chart = createChart(cont, data)
    chartRef.current = chart

    const cardHtml = chart.setCardHtml()

    // isFocal is dynamic — check store's current main_id on each render
    cardHtml.setCardInnerHtmlCreator((d: TreeDatum) => {
      const isFocal = d.data.id === chart.store.getMainId()
      return buildCardHtml(d, isFocal)
    })

    cardHtml.setOnCardClick((e: MouseEvent, d: TreeDatum) => {
      const target = e.target as HTMLElement | null
      const menuTrigger = target?.closest("[data-card-menu]") as HTMLElement | null
      if (menuTrigger) {
        // Open the ⋮ menu anchored to the trigger; never re-center.
        setCardMenu({ memberId: d.data.id, anchorEl: menuTrigger })
        return
      }
      // Re-center on clicked node
      chart.store.updateMainId(d.data.id)
      chart.store.updateTree({})
      // Shallow URL sync — no React re-render
      const sp = new URLSearchParams(window.location.search)
      sp.set("focus", d.data.id)
      window.history.replaceState(null, "", "?" + sp.toString())
    })

    cardHtml.setOnHoverPathToMain()

    // Secondary link overlay — re-drawn after every tree update.
    // Reads showSecondaryLinksRef (not state) so toggling never remounts the chart.
    chart.setAfterUpdate(() => {
      const tree = chart.store.getTree()
      if (!tree) return
      if (showSecondaryLinksRef.current && secondaryLinks.length > 0) {
        updateSecondaryLinks(chart.svg, tree.data, secondaryLinks, chart.transition_time)
      } else {
        clearSecondaryLinks(chart.svg)
      }
    })

    chart.setSingleParentEmptyCard(false)
    // Apply current depth (read via ref so depth changes don't remount the chart).
    chart.setAncestryDepth(
      ancestryDepthRef.current >= MAX_DEPTH ? DEPTH_ALL : ancestryDepthRef.current,
    )
    chart.setProgenyDepth(
      progenyDepthRef.current >= MAX_DEPTH ? DEPTH_ALL : progenyDepthRef.current,
    )
    chart.updateMainId(focusId)
    chart.updateTree({ initial: true, tree_position: "fit" })
    depthInitializedRef.current = true

    return () => {
      chartRef.current = null
      depthInitializedRef.current = false
      cont.innerHTML = ""
    }
  }, [nodes, defaultRootMemberId, initialFocusId, secondaryLinks])

  // Toggle effect: apply show/hide instantly without remounting the chart
  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return
    if (showSecondaryLinks && secondaryLinks.length > 0) {
      const tree = chart.store.getTree()
      if (tree) {
        updateSecondaryLinks(chart.svg, tree.data, secondaryLinks, 200)
      }
    } else {
      clearSecondaryLinks(chart.svg)
    }
  }, [showSecondaryLinks, secondaryLinks])

  // Depth effect: re-trim live without remounting. Skips the initial mount run
  // (the create effect already applied the default depth).
  useEffect(() => {
    const chart = chartRef.current
    if (!chart || !depthInitializedRef.current) return
    chart.setAncestryDepth(ancestryDepth >= MAX_DEPTH ? DEPTH_ALL : ancestryDepth)
    chart.setProgenyDepth(progenyDepth >= MAX_DEPTH ? DEPTH_ALL : progenyDepth)
    chart.updateTree({ tree_position: "inherit" })
  }, [ancestryDepth, progenyDepth])

  // Root must stretch to the page column — in a flex-column parent a bare
  // <div> collapses toward content width (≈302px), shrinking the canvas and
  // making the tree tiny. width:100% forces it to the full column. (0386)
  return (
    <div style={{ width: "100%" }}>
      <div style={{ position: "relative", width: "100%" }}>
        <div
          ref={containerRef}
          id="FamilyChartViewA"
          className="f3"
          style={{
            width: "100%",
            height: "min(640px, 75vh)",
            minHeight: 420,
            position: "relative",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            overflow: "hidden",
            background: "#f8fafc",
            // Prevent dark-card bleed from the library's --background-color CSS variable
            ["--background-color" as string]: "#f8fafc",
          }}
        />

        {/* Depth controls — top-right overlay (legend is bottom-left) */}
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 4,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            maxWidth: "calc(100% - 24px)",
            background: "rgba(248,250,252,0.92)",
            border: "1px solid #e2e8f0",
            borderRadius: 6,
            padding: "6px 10px",
            fontSize: 12,
            color: "#64748b",
            userSelect: "none",
          }}
        >
          <DepthStepper label="Ancestry" value={ancestryDepth} onChange={setAncestryDepth} />
          <DepthStepper label="Progeny" value={progenyDepth} onChange={setProgenyDepth} />
        </div>

        {/* Secondary link legend — absolute overlay inside canvas, bottom-left */}
        {secondaryLinks.length > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: 12,
              zIndex: 4,
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(248,250,252,0.92)",
              border: "1px solid #e2e8f0",
              borderRadius: 6,
              padding: "4px 10px",
              fontSize: 11,
              color: "#64748b",
              userSelect: "none",
            }}
          >
            <svg width="24" height="10" style={{ flexShrink: 0 }}>
              <line
                x1="0"
                y1="5"
                x2="24"
                y2="5"
                stroke="#94a3b8"
                strokeWidth="1.5"
                strokeDasharray="4,3"
                strokeOpacity="0.8"
              />
            </svg>
            <span>Secondary promoter</span>
            <button
              type="button"
              onClick={() => setShowSecondaryLinks(v => !v)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 11,
                color: "#64748b",
                padding: "4px 8px",
                minHeight: 28,
                lineHeight: 1,
                textDecoration: "underline",
              }}
            >
              {showSecondaryLinks ? "Hide" : "Show"}
            </button>
          </div>
        )}

        {/* Copy-link confirmation */}
        {copied && (
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 5,
              background: "rgba(15,23,42,0.92)",
              color: "#fff",
              borderRadius: 6,
              padding: "4px 12px",
              fontSize: 12,
            }}
          >
            Link copied
          </div>
        )}
      </div>

      {/* Card ⋮ overflow menu — controlled, anchored to the clicked d3 trigger */}
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
            sideOffset={4}
            className="isolate z-50"
          >
            <Menu.Popup
              className={cx(
                "min-w-44 flex flex-col rounded-md border bg-popover p-1 text-popover-foreground shadow-sm backdrop-blur-xs",
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

              {activeMenuNode?.claimable && isTreeClaimable && (
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
                <LinkIcon />
                Copy link
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
        selectedRankAward={drawerMember?.selectedRankAward ?? null}
        isClaimable={drawerMember?.isClaimable ?? false}
        isTreeClaimable={isTreeClaimable}
        treeSlug={treeSlug}
        nodeId={drawerMember?.nodeId}
        isAdmin={canManage}
      />
    </div>
  )
}
