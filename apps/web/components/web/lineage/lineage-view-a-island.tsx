"use client"

import { Menu } from "@base-ui/react/menu"
import { useReducedMotion } from "@mantine/hooks"
import {
  CopyIcon,
  EyeIcon,
  FocusIcon,
  NetworkIcon,
  PencilIcon,
  RouteIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserRoundIcon,
  UserRoundPlusIcon,
  UsersRoundIcon,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import { DropdownMenuItem } from "~/components/common/dropdown-menu"
import { Link } from "~/components/common/link"
import { LineageProfileDrawer } from "~/components/web/lineage/lineage-profile-drawer"
import { memberInitials } from "~/lib/lineage/canvas-model"
import { createChart } from "~/lib/lineage/family-chart/index"
import {
  clearSecondaryLinks,
  updateSecondaryLinks,
} from "~/lib/lineage/family-chart/renderers/view-secondary-links"
import "~/lib/lineage/family-chart/styles/family-chart.css"
import type { TreeDatum } from "~/lib/lineage/family-chart/types/treeData"
import { toFamilyChartData } from "~/lib/lineage/to-family-chart-data"
import { toLineageVisual } from "~/lib/lineage/to-lineage-visual"
import type { LineageTrustStatus } from "~/lib/lineage/trust-status"
import type {
  LineageNodeProfile,
  LineageRelationshipRow,
  LineageTreeMemberRow,
} from "~/server/web/lineage/payloads"
import { cx, popoverAnimationClasses } from "~/lib/utils"

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

type CardRawData = {
  displayName?: string
  colorHex?: string | null
  rankLabel?: string | null
  schoolLabel?: string | null
  avatar?: string | null
  trustStatus?: LineageTrustStatus
  claimable?: boolean
}

// Depth control: value === MAX_DEPTH means "All". The engine's trimTree takes a
// numeric depth, so "All" is expressed as a depth larger than any real tree.
const MAX_DEPTH = 6
const DEPTH_ALL = 50

// Editorial canvas chrome — NOT brand identity. The dark stage + neutral grid +
// the museum/medal "gold" accent are a fixed editorial palette for the cinematic
// surface. Brand color is NOT hardcoded here: the red brand glow reads the
// BrandSettings-injected `--primary` token via Tailwind `bg-primary` overlays, and
// belt color always comes from `Rank.colorHex` data (never a literal). `slate` is
// the neutral fallback for a null belt color (no brand-red guessing). (Desi 0393)
const BBL = {
  gold: "#f3c86a",
  slate: "#94a3b8",
} as const

const TRUST_BADGE: Record<
  LineageTrustStatus,
  { bg: string; fg: string; border: string; label: string }
> = {
  verified: {
    bg: "rgba(22,163,74,0.16)",
    fg: "#bbf7d0",
    border: "rgba(187,247,208,0.28)",
    label: "Verified",
  },
  disputed: {
    bg: "rgba(220,38,38,0.18)",
    fg: "#fecaca",
    border: "rgba(248,113,113,0.36)",
    label: "Disputed",
  },
  "claim-pending": {
    bg: "rgba(234,179,8,0.15)",
    fg: "#fde68a",
    border: "rgba(253,230,138,0.28)",
    label: "Claim pending",
  },
  claimed: {
    bg: "rgba(99,102,241,0.16)",
    fg: "#c7d2fe",
    border: "rgba(199,210,254,0.28)",
    label: "Claimed",
  },
  imported: {
    bg: "rgba(148,163,184,0.14)",
    fg: "#cbd5e1",
    border: "rgba(203,213,225,0.22)",
    label: "Imported",
  },
  unverified: {
    bg: "rgba(148,163,184,0.12)",
    fg: "#cbd5e1",
    border: "rgba(203,213,225,0.2)",
    label: "Unverified",
  },
}

function escHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function hexToRgb(hex: string | null | undefined) {
  if (!hex) return null
  const normalized = hex.replace("#", "")
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null

  const value = Number.parseInt(normalized, 16)
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  }
}

function rgba(hex: string | null | undefined, alpha: number, fallback = BBL.slate) {
  const rgb = hexToRgb(hex ?? fallback) ?? hexToRgb(fallback)!
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`
}

// WCAG relative luminance (sRGB), used to pick a foreground that actually clears
// 4.5:1 contrast against an arbitrary belt color — a brightness midpoint fails for
// mid-luminance belts (yellow/orange). (Desi 0393 HIGH)
function relativeLuminance(hex: string | null | undefined): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  const channel = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b)
}

/** Pick black or white text for legibility over an arbitrary belt-color background. */
function readableTextColor(hex: string | null | undefined): string {
  const lum = relativeLuminance(hex)
  const contrastWhite = 1.05 / (lum + 0.05)
  const contrastBlack = (lum + 0.05) / 0.05
  return contrastBlack >= contrastWhite ? "#050505" : "#ffffff"
}

/**
 * HTML card renderer for the vendored family-chart engine.
 *
 * Inline CSS is required because d3 owns the card DOM. Keep the data public-safe;
 * do not inject private profile fields here. Belt color is data (`Rank.colorHex`),
 * with a neutral slate fallback — no brand-red literals.
 */
function buildCardHtml(d: TreeDatum, isFocal: boolean): string {
  const raw = d.data.data as CardRawData

  const displayName = raw.displayName ?? "Unknown"
  const colorHex = raw.colorHex ?? BBL.slate
  const rankLabel = raw.rankLabel ?? null
  const schoolLabel = raw.schoolLabel ?? null
  const avatar = raw.avatar ?? null
  const trustStatus = raw.trustStatus ?? "unverified"
  const claimable = raw.claimable ?? false
  const initials = memberInitials(displayName)

  const badge = claimable
    ? {
        bg: "rgba(99,102,241,0.18)",
        fg: "#dbeafe",
        border: "rgba(219,234,254,0.32)",
        label: "Claimable",
      }
    : TRUST_BADGE[trustStatus]

  const safeName = escHtml(displayName)
  const safeRank = rankLabel ? escHtml(rankLabel) : ""
  const safeSchool = schoolLabel ? escHtml(schoolLabel) : ""

  const rankTextColor = readableTextColor(colorHex)
  const glow = rgba(colorHex, isFocal ? 0.45 : 0.24)
  const softGlow = rgba(colorHex, isFocal ? 0.22 : 0.12)
  const cardBorder = isFocal ? rgba(colorHex, 0.78) : "rgba(255,255,255,0.14)"
  const cardShadow = isFocal
    ? `0 0 0 1px ${cardBorder}, 0 18px 55px ${glow}, 0 0 80px ${softGlow}`
    : `0 0 0 1px ${cardBorder}, 0 12px 30px rgba(0,0,0,0.35)`

  const avatarHtml = avatar
    ? `<img src="${escHtml(avatar)}" alt="${safeName}" style="width:54px;height:54px;border-radius:999px;object-fit:cover;display:block;" />`
    : `<div style="width:54px;height:54px;border-radius:999px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,${rgba(colorHex, 0.92)},rgba(255,255,255,0.16));color:#fff;font-size:17px;font-weight:900;letter-spacing:-0.04em;">${escHtml(initials)}</div>`

  const rankPill = rankLabel
    ? `<span style="display:inline-flex;max-width:92px;align-items:center;justify-content:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border-radius:999px;background:${colorHex};color:${rankTextColor};padding:3px 8px;font-size:9px;line-height:1.25;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;box-shadow:0 0 18px ${rgba(colorHex, 0.35)};">${safeRank}</span>`
    : ""

  const schoolHtml = schoolLabel
    ? `<div style="margin-top:3px;max-width:138px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:rgba(255,255,255,0.58);font-size:11px;line-height:1.35;font-weight:500;">${safeSchool}</div>`
    : ""

  return `
    <div data-bbl-card style="position:relative;width:${isFocal ? "258px" : "232px"};min-height:${isFocal ? "142px" : "128px"};overflow:hidden;border-radius:22px;background:radial-gradient(circle at 15% 10%, ${rgba(colorHex, 0.22)} 0, transparent 32%),linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.025) 45%, rgba(0,0,0,0.38)),#070707;box-shadow:${cardShadow};transform:translateZ(0);">
      <div style="position:absolute;inset:0;background:linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px),linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px);background-size:38px 38px;opacity:0.18;pointer-events:none;"></div>
      <div style="position:absolute;inset:0;border-radius:22px;border:1px solid rgba(255,255,255,0.09);pointer-events:none;"></div>
      <div style="position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg, ${colorHex}, ${rgba(colorHex, 0.22)}, ${BBL.gold});"></div>

      <div style="position:absolute;top:15px;left:15px;width:58px;height:58px;border-radius:999px;padding:2px;background:linear-gradient(135deg, ${colorHex}, rgba(255,255,255,0.28));box-shadow:0 0 24px ${rgba(colorHex, 0.28)};">
        <div style="width:54px;height:54px;border-radius:999px;background:#0a0a0a;overflow:hidden;">${avatarHtml}</div>
      </div>

      <div style="position:absolute;top:16px;right:14px;display:flex;gap:6px;align-items:center;">
        ${rankPill}
        <div data-card-menu role="button" aria-haspopup="menu" tabindex="0" title="Actions" style="width:30px;height:30px;border-radius:999px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.7);cursor:pointer;user-select:none;font-size:18px;line-height:1;">⋮</div>
      </div>

      <div style="position:absolute;left:15px;right:15px;bottom:14px;display:grid;grid-template-columns:62px minmax(0,1fr);gap:10px;align-items:end;">
        <div style="display:flex;height:34px;align-items:center;">
          <span style="display:inline-flex;align-items:center;gap:5px;border-radius:999px;border:1px solid ${badge.border};background:${badge.bg};color:${badge.fg};padding:3px 7px;font-size:8.5px;line-height:1.15;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;white-space:nowrap;">
            <span style="width:5px;height:5px;border-radius:999px;background:${badge.fg};box-shadow:0 0 10px ${badge.fg};"></span>
            ${badge.label}
          </span>
        </div>

        <div style="min-width:0;text-align:left;">
          <div style="max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#fff;font-size:${isFocal ? "17px" : "15px"};line-height:1.05;font-weight:950;letter-spacing:-0.055em;">${safeName}</div>
          ${schoolHtml}
        </div>
      </div>

      ${
        isFocal
          ? `<div style="position:absolute;left:16px;top:82px;color:${BBL.gold};font-size:9px;font-weight:950;letter-spacing:0.18em;text-transform:uppercase;">Focused</div>`
          : ""
      }
    </div>
  `
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
    <div className="flex min-w-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-2 py-1 text-white shadow-black/20 shadow-sm backdrop-blur-xl">
      <span className="w-16 truncate text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/48">
        {label}
      </span>

      <button
        type="button"
        aria-label={`Decrease ${label.toLowerCase()} depth`}
        disabled={value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
        className="flex size-7 items-center justify-center rounded-full text-white/72 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
      >
        −
      </button>

      <span className="min-w-8 text-center text-xs font-black tabular-nums text-white">
        {value >= MAX_DEPTH ? "All" : value}
      </span>

      <button
        type="button"
        aria-label={`Increase ${label.toLowerCase()} depth`}
        disabled={value >= MAX_DEPTH}
        onClick={() => onChange(Math.min(MAX_DEPTH, value + 1))}
        className="flex size-7 items-center justify-center rounded-full text-white/72 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 shadow-black/20 shadow-lg backdrop-blur-xl">
      <div className="flex items-center gap-2 text-white/48">
        <span className="[&_svg]:size-4">{icon}</span>
        <span className="text-[0.62rem] font-bold uppercase tracking-[0.22em]">{label}</span>
      </div>
      <div className="mt-2 text-xl font-black tracking-[-0.06em] text-white">{value}</div>
    </div>
  )
}

function PremiumPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        "rounded-3xl border border-white/10 bg-black/35 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl",
        className,
      )}
    >
      {children}
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
  const reduceMotion = useReducedMotion()
  const reduceMotionRef = useRef(reduceMotion)
  reduceMotionRef.current = reduceMotion

  const initialMemberId = initialFocusId ?? defaultRootMemberId ?? members[0]?.id ?? null
  const [focusMemberId, setFocusMemberId] = useState<string | null>(initialMemberId)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMemberId, setDrawerMemberId] = useState<string | null>(null)
  const [showSecondaryLinks, setShowSecondaryLinks] = useState(true)
  const showSecondaryLinksRef = useRef(true)
  showSecondaryLinksRef.current = showSecondaryLinks

  const [ancestryDepth, setAncestryDepth] = useState(MAX_DEPTH)
  const [progenyDepth, setProgenyDepth] = useState(MAX_DEPTH)
  const ancestryDepthRef = useRef(ancestryDepth)
  const progenyDepthRef = useRef(progenyDepth)
  const depthInitializedRef = useRef(false)
  ancestryDepthRef.current = ancestryDepth
  progenyDepthRef.current = progenyDepth

  const [cardMenu, setCardMenu] = useState<{ memberId: string; anchorEl: HTMLElement } | null>(null)
  const [copied, setCopied] = useState(false)

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
      }),
    [members, initialMemberId, relationships],
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

  const openDrawer = useCallback((memberId: string) => {
    setDrawerMemberId(memberId)
    setDrawerOpen(true)
  }, [])

  // Tap a student avatar in the drawer carousel → swap the drawer to them
  // (recursive drill-down). Guard against a student with no loaded profile.
  const selectStudent = useCallback(
    (memberId: string) => {
      const member = memberMap.get(memberId)
      if (member && profilesById[member.nodeId]) {
        setDrawerMemberId(memberId)
      }
    },
    [memberMap, profilesById],
  )

  const updateFocusUrl = useCallback((memberId: string) => {
    const sp = new URLSearchParams(window.location.search)
    sp.set("view", "explore")
    sp.set("focus", memberId)
    window.history.replaceState(null, "", `?${sp.toString()}`)
  }, [])

  const focusMember = useCallback(
    (memberId: string, options: { syncUrl?: boolean } = { syncUrl: true }) => {
      const chart = chartRef.current
      if (!chart) return

      chart.store.updateMainId(memberId)
      chart.store.updateTree({})
      setFocusMemberId(memberId)

      if (options.syncUrl) {
        updateFocusUrl(memberId)
      }
    },
    [updateFocusUrl],
  )

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

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const data = toFamilyChartData(nodes)
    if (data.length === 0) return

    const resolvedFocusId = initialFocusId ?? defaultRootMemberId ?? data[0]!.id
    const chart = createChart(container, data)
    chartRef.current = chart

    // Reduced-motion honor: collapse both the engine's tree transition (store state)
    // and the secondary-link redraw (chart.transition_time) to instant. (Desi 0393)
    if (reduceMotionRef.current) {
      chart.setTransitionTime(0)
      chart.transition_time = 0
    }

    const cardHtml = chart.setCardHtml()

    cardHtml.setCardInnerHtmlCreator((d: TreeDatum) => {
      const isFocal = d.data.id === chart.store.getMainId()
      return buildCardHtml(d, isFocal)
    })

    cardHtml.setOnCardClick((event: MouseEvent, d: TreeDatum) => {
      const target = event.target as HTMLElement | null
      // Preserve the ⋮ guard: a menu-trigger click opens the menu, never recenters.
      const menuTrigger = target?.closest("[data-card-menu]") as HTMLElement | null

      if (menuTrigger) {
        setCardMenu({ memberId: d.data.id, anchorEl: menuTrigger })
        return
      }

      focusMember(d.data.id)
    })

    cardHtml.setOnHoverPathToMain()

    // Secondary link overlay — re-drawn after every tree update. Reads refs (not
    // state) so toggling/depth never remounts the chart.
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
    chart.setAncestryDepth(
      ancestryDepthRef.current >= MAX_DEPTH ? DEPTH_ALL : ancestryDepthRef.current,
    )
    chart.setProgenyDepth(
      progenyDepthRef.current >= MAX_DEPTH ? DEPTH_ALL : progenyDepthRef.current,
    )
    chart.updateMainId(resolvedFocusId)
    chart.updateTree({ initial: true, tree_position: "fit" })

    setFocusMemberId(resolvedFocusId)
    depthInitializedRef.current = true

    return () => {
      chartRef.current = null
      depthInitializedRef.current = false
      container.innerHTML = ""
    }
  }, [nodes, defaultRootMemberId, initialFocusId, secondaryLinks, focusMember])

  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return

    const tree = chart.store.getTree()

    if (showSecondaryLinks && secondaryLinks.length > 0 && tree) {
      updateSecondaryLinks(chart.svg, tree.data, secondaryLinks, reduceMotion ? 0 : 200)
    } else {
      clearSecondaryLinks(chart.svg)
    }
  }, [showSecondaryLinks, secondaryLinks, reduceMotion])

  useEffect(() => {
    const chart = chartRef.current
    if (!chart || !depthInitializedRef.current) return

    chart.setAncestryDepth(ancestryDepth >= MAX_DEPTH ? DEPTH_ALL : ancestryDepth)
    chart.setProgenyDepth(progenyDepth >= MAX_DEPTH ? DEPTH_ALL : progenyDepth)
    chart.updateTree({ tree_position: "inherit" })
  }, [ancestryDepth, progenyDepth])

  return (
    <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#050505] text-white shadow-2xl shadow-black/60">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* Brand glow reads the BrandSettings `--primary` token (not a hardcoded red). */}
        <div className="absolute left-1/2 top-[-14rem] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-primary/25 blur-[130px]" />
        <div className="absolute right-[-10rem] top-[8rem] h-[28rem] w-[28rem] rounded-full bg-[#f3c86a]/12 blur-[120px]" />
        <div className="absolute bottom-[-12rem] left-[-10rem] h-[26rem] w-[26rem] rounded-full bg-[#7dd3fc]/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_28rem)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:76px_76px] opacity-20" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black to-transparent" />
      </div>

      <div className="relative z-10 p-4 sm:p-5 lg:p-6">
        <div className="mb-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <PremiumPanel>
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.22em] text-white">
                    <SparklesIcon className="size-3.5 text-primary" />
                    Black Belt Legacy Explorer
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full border border-[#f3c86a]/25 bg-[#f3c86a]/10 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.22em] text-[#f3c86a]">
                    <RouteIcon className="size-3.5" />
                    Focal lineage view
                  </span>
                </div>

                {/* Marketing copy collapses on mobile so the canvas is above the fold. (Desi 0393) */}
                <h2 className="mt-4 hidden text-balance text-3xl font-black tracking-[-0.07em] text-white sm:block sm:text-4xl lg:text-5xl">
                  Explore the living lineage.
                </h2>

                <p className="mt-3 hidden max-w-3xl text-pretty text-sm/6 text-white/62 sm:block sm:text-base/7">
                  Click any practitioner to recenter the tree, trace their path, inspect their
                  profile, and share a direct focus link. Secondary promoter links stay visible
                  without corrupting the clean primary lineage.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 md:min-w-[25rem]">
                <MetricPill icon={<UsersRoundIcon />} label="Members" value={members.length} />
                <MetricPill icon={<ShieldCheckIcon />} label="Verified" value={verifiedCount} />
                <MetricPill icon={<NetworkIcon />} label="Roots" value={rootCount} />
              </div>
            </div>
          </PremiumPanel>

          {/* Current-focus panel — hidden on mobile to keep the canvas above the fold. (Desi 0393) */}
          <PremiumPanel className="hidden flex-col justify-between gap-4 lg:flex">
            <div>
              <div className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-white/42">
                Current focus
              </div>

              <div className="mt-3 flex items-start gap-3">
                <div
                  className="flex size-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm font-black text-white shadow-lg"
                  style={{
                    boxShadow: focusNode?.colorHex
                      ? `0 0 24px ${rgba(focusNode.colorHex, 0.26)}`
                      : undefined,
                  }}
                >
                  {memberInitials(focusNode?.displayName ?? "Lineage")}
                </div>

                <div className="min-w-0">
                  <div className="truncate text-lg font-black tracking-[-0.05em] text-white">
                    {focusNode?.displayName ?? "Select a practitioner"}
                  </div>
                  <div className="mt-1 truncate text-xs text-white/52">
                    {[focusNode?.rankLabel, focusNode?.schoolLabel].filter(Boolean).join(" · ") ||
                      "Tap a card to focus their lineage."}
                  </div>

                  {focusNode && (
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.055] px-2 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white/62">
                      <EyeIcon className="size-3" />
                      {TRUST_BADGE[focusNode.trustStatus]?.label ?? focusNode.trustStatus}
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
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.065] px-3 text-xs font-bold text-white transition hover:bg-white/[0.11] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <UserRoundIcon className="size-4" />
              View profile
            </button>
          </PremiumPanel>
        </div>

        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/50 shadow-2xl shadow-black/50">
          <div
            ref={containerRef}
            id="FamilyChartViewA"
            className="f3"
            style={
              {
                width: "100%",
                height: "clamp(560px, 78vh, 880px)",
                minHeight: 560,
                position: "relative",
                overflow: "hidden",
                // Dark editorial stage + museum-gold accent. The brand glow lives in
                // the Tailwind `bg-primary` overlays above — no hardcoded brand red here.
                background:
                  "radial-gradient(circle at 78% 16%, rgba(243,200,106,0.10), transparent 24rem), #050505",
                "--background-color": "#050505",
              } as CSSProperties
            }
          />

          {/* Brand-primary glow inside the canvas (tracks BrandSettings). */}
          <div className="pointer-events-none absolute left-1/2 top-[-8rem] h-80 w-80 -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/70 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />

          <div className="absolute left-3 top-3 z-20 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-2 sm:left-4 sm:top-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/55 px-3 py-2 text-[0.68rem] font-black uppercase tracking-[0.18em] text-white/72 shadow-xl backdrop-blur-xl">
              <FocusIcon className="size-3.5 text-primary" />
              Click to recenter
            </div>

            {secondaryLinks.length > 0 && (
              <button
                type="button"
                onClick={() => setShowSecondaryLinks(value => !value)}
                className={cx(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[0.68rem] font-black uppercase tracking-[0.18em] shadow-xl backdrop-blur-xl transition",
                  showSecondaryLinks
                    ? "border-[#f3c86a]/30 bg-[#f3c86a]/15 text-[#f3c86a]"
                    : "border-white/10 bg-black/55 text-white/56 hover:text-white",
                )}
              >
                <RouteIcon className="size-3.5" />
                {showSecondaryLinks ? "Secondary links on" : "Secondary links off"}
              </button>
            )}
          </div>

          <div className="absolute right-3 top-3 z-20 flex max-w-[calc(100%-1.5rem)] flex-col gap-2 sm:right-4 sm:top-4">
            <DepthStepper label="Ancestry" value={ancestryDepth} onChange={setAncestryDepth} />
            <DepthStepper label="Progeny" value={progenyDepth} onChange={setProgenyDepth} />
          </div>

          <div className="absolute bottom-3 left-3 z-20 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-2 sm:bottom-4 sm:left-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/55 px-3 py-2 text-[0.68rem] font-bold text-white/58 shadow-xl backdrop-blur-xl">
              <span className="size-2 rounded-full bg-primary shadow-[0_0_12px] shadow-primary/70" />
              Primary lineage
            </div>

            {secondaryLinks.length > 0 && (
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/55 px-3 py-2 text-[0.68rem] font-bold text-white/58 shadow-xl backdrop-blur-xl">
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
                Secondary promoter / cross-training
              </div>
            )}
          </div>

          {copied && (
            <div className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/10 bg-white px-4 py-2 text-xs font-black text-black shadow-2xl">
              Focus link copied
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-white/42">
          <span>
            Best on desktop with trackpad/pan. Fully usable on mobile: tap cards, pinch/drag inside
            the canvas, and use depth controls to simplify.
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
                "flex min-w-48 flex-col rounded-xl border border-white/10 bg-[#080808]/95 p-1 text-white shadow-2xl shadow-black/50 backdrop-blur-xl",
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
        selectedRankAward={drawerMember?.selectedRankAward ?? null}
        isClaimable={drawerMember?.isClaimable ?? false}
        isTreeClaimable={isTreeClaimable}
        treeSlug={treeSlug}
        nodeId={drawerMember?.nodeId}
        isAdmin={canManage}
        students={drawerStudents}
        onSelectStudent={selectStudent}
      />
    </div>
  )
}
