"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { createChart } from "~/lib/lineage/family-chart/index"
import { toFamilyChartData } from "~/lib/lineage/to-family-chart-data"
import { toLineageVisual } from "~/lib/lineage/to-lineage-visual"
import { memberInitials } from "~/lib/lineage/canvas-model"
import type { LineageTrustStatus } from "~/lib/lineage/trust-status"
import { LineageProfileDrawer } from "~/components/web/lineage/lineage-profile-drawer"
import type { LineageNodeProfile, LineageTreeMemberRow } from "~/server/web/lineage/payloads"
import type { TreeDatum } from "~/lib/lineage/family-chart/types/treeData"
import "~/lib/lineage/family-chart/styles/family-chart.css"

type Props = {
  members: LineageTreeMemberRow[]
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
  "claim-pending": { bg: "#fef3c7", fg: "#92400e", label: "Pending" },
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
      <div data-profile-trigger style="position:absolute; bottom:6px; right:8px; opacity:0.4; font-size:12px; color:#64748b; cursor:pointer; user-select:none; line-height:1;" title="View profile">↗</div>
    </div>
  `
}

export function LineageViewAIsland({
  members,
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

  useEffect(() => {
    const cont = containerRef.current
    if (!cont) return

    const { nodes } = toLineageVisual(members, {
      mainMemberId: initialFocusId ?? defaultRootMemberId,
    })
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

    chart.setSingleParentEmptyCard(false)
    chart.updateMainId(focusId)
    chart.updateTree({ initial: true, tree_position: "fit" })

    return () => {
      chartRef.current = null
      cont.innerHTML = ""
    }
  }, [members, defaultRootMemberId, initialFocusId])

  return (
    <div>
      <div
        ref={containerRef}
        id="FamilyChartViewA"
        className="f3"
        style={{
          width: "100%",
          height: 640,
          position: "relative",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          overflow: "hidden",
          background: "#f8fafc",
        }}
      />

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
