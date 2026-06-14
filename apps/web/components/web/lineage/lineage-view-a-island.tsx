"use client"

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
import { LineageProfileDrawer } from "~/components/web/lineage/lineage-profile-drawer"
import type {
  LineageNodeProfile,
  LineageRelationshipRow,
  LineageTreeMemberRow,
} from "~/server/web/lineage/payloads"
import type { TreeDatum } from "~/lib/lineage/family-chart/types/treeData"
import "~/lib/lineage/family-chart/styles/family-chart.css"

type Props = {
  members: LineageTreeMemberRow[]
  relationships?: Pick<LineageRelationshipRow, "fromNodeId" | "toNodeId" | "type">[]
  defaultRootMemberId?: string | null
  profilesById: Record<string, LineageNodeProfile>
  treeSlug?: string
  isTreeClaimable?: boolean
  initialFocusId?: string | null
}

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
    avatar?: string | null
    trustStatus?: LineageTrustStatus
    claimable?: boolean
  }

  const displayName = raw.displayName ?? "Unknown"
  const colorHex = raw.colorHex ?? null
  const rankLabel = raw.rankLabel ?? null
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

  // right offset for name area: make room for rank chip when present
  const nameRight = rankLabel ? "82px" : "24px"

  return `
    <div class="card-inner" style="
      position: relative;
      width: 200px;
      min-height: 72px;
      background: #ffffff;
      border-radius: 6px;
      box-shadow: ${shadow};
      overflow: hidden;
    ">
      <div style="position:absolute; top:0; left:0; right:0; height:4px; background-color:${bandColor};"></div>
      ${rankChipHtml}
      <div style="position:absolute; top:12px; left:8px; right:${nameRight}; bottom:20px; display:flex; align-items:center; gap:8px; overflow:hidden;">
        ${avatarHtml}
        <div style="min-width:0; flex:1; overflow:hidden;">
          <div style="font-size:14px; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#0f172a;">${escHtml(displayName)}</div>
          ${badgeHtml}
        </div>
      </div>
      <div data-profile-trigger style="position:absolute; bottom:2px; right:4px; min-width:28px; min-height:28px; display:flex; align-items:center; justify-content:center; padding:4px; opacity:0.4; font-size:12px; color:#64748b; cursor:pointer; user-select:none; line-height:1;" title="View profile">↗</div>
    </div>
  `
}

export function LineageViewAIsland({
  members,
  relationships = [],
  defaultRootMemberId,
  profilesById,
  treeSlug,
  isTreeClaimable = false,
  initialFocusId,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMemberId, setDrawerMemberId] = useState<string | null>(null)
  const [showSecondaryLinks, setShowSecondaryLinks] = useState(true)
  // Ref so the afterUpdate closure always reads the current toggle value without remounting
  const showSecondaryLinksRef = useRef(true)
  showSecondaryLinksRef.current = showSecondaryLinks

  // member ID → member row (for drawer profile lookup)
  const memberMap = useMemo(
    () => new Map(members.map(m => [m.id, m])),
    [members],
  )

  const drawerMember = drawerMemberId ? (memberMap.get(drawerMemberId) ?? null) : null
  const drawerProfile = drawerMember
    ? (profilesById[drawerMember.nodeId] ?? null)
    : null

  function openDrawer(memberId: string) {
    setDrawerMemberId(memberId)
    setDrawerOpen(true)
  }

  const { nodes, secondaryLinks } = useMemo(
    () =>
      toLineageVisual(members, {
        mainMemberId: initialFocusId ?? defaultRootMemberId,
        relationships,
      }),
    [members, initialFocusId, defaultRootMemberId, relationships],
  )

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
      if (target?.closest("[data-profile-trigger]")) {
        openDrawer(d.data.id)
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
    chart.updateMainId(focusId)
    chart.updateTree({ initial: true, tree_position: "fit" })

    return () => {
      chartRef.current = null
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

  return (
    <div>
      <div
        style={{ position: "relative", width: "100%" }}
      >
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
      </div>

      <LineageProfileDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        profile={drawerProfile}
        selectedRankAward={drawerMember?.selectedRankAward ?? null}
        isClaimable={drawerMember?.isClaimable ?? false}
        isTreeClaimable={isTreeClaimable}
        treeSlug={treeSlug}
        nodeId={drawerMember?.nodeId}
      />
    </div>
  )
}
