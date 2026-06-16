"use client"

import { Menu } from "@base-ui/react/menu"
import { useReducedMotion } from "@mantine/hooks"
import {
  CopyIcon,
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
import { BeltSwatch } from "~/components/common/belt-swatch"
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

// Editorial canvas chrome — NOT brand identity. The dark stage is a fixed
// editorial palette for the cinematic surface. Brand color is NOT hardcoded: the
// red brand glow reads the BrandSettings `--primary` token via Tailwind
// `bg-primary` overlays, and belt color always comes from `Rank.colorHex` data
// (never a literal). `slate` is the neutral fallback for a null belt color (no
// brand-red guessing). The museum-gold accent is confined to the secondary-link
// legend only (SESSION_0394 Desi — brand parity: gold is not a brand accent).
const BBL = {
  gold: "#f3c86a",
  slate: "#94a3b8",
} as const

// Solid "legacy/authoritative" chrome — replaces glassmorphism (no backdrop-blur).
// A near-black opaque panel + hairline border + inset top highlight + real drop
// shadow reads as carved/permanent, and is brand-neutral-free (SESSION_0394 Desi HIGH).
const SOLID_PANEL =
  "border border-white/8 bg-[#0c0c0d] shadow-[0_20px_60px_-26px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.045)]"
const SOLID_PILL =
  "border border-white/8 bg-[#101011] shadow-[0_12px_30px_-18px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.04)]"

// Trust state is detail-level metadata — shown only on the focus panel / drawer,
// not on every resting card (SESSION_0394 Desi — de-clutter). Label only.
const TRUST_LABEL: Record<LineageTrustStatus, string> = {
  verified: "Verified",
  disputed: "Disputed",
  "claim-pending": "Claim pending",
  claimed: "Claimed",
  imported: "Imported",
  unverified: "Unverified",
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

// WCAG relative luminance (sRGB). Used to clamp belt-glow bloom on bright belts
// (white/yellow/coral) so they don't halo into an unreadable smear. (SESSION_0394 Desi LOW)
function relativeLuminance(hex: string | null | undefined): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  const channel = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b)
}

/**
 * Belt graphic for the d3 card (HTML string — d3 owns the card DOM, so this is
 * markup, not the <BeltSwatch> React component, but the visual is identical).
 * Belt color is data (`Rank.colorHex`); the shimmer sweep uses the global
 * `.belt-shimmer` rule (reduced-motion aware). The root SVG clips the sweep.
 */
function buildBeltSvg(colorHex: string, width: number): string {
  const height = (width * 12) / 40
  return `<svg viewBox="0 0 40 12" width="${width}" height="${height.toFixed(1)}" style="display:block;overflow:hidden;" aria-hidden="true">
    <rect x="0.5" y="3" width="39" height="6" rx="3" fill="${colorHex}"></rect>
    <rect x="15.5" y="1.5" width="9" height="9" rx="1.6" fill="${colorHex}" stroke="rgba(0,0,0,0.28)" stroke-width="0.6"></rect>
    <rect x="18.4" y="1.5" width="3.2" height="9" fill="rgba(0,0,0,0.2)"></rect>
    <rect class="belt-shimmer" x="0" y="3" width="5" height="6" rx="2.5" fill="rgba(255,255,255,0.5)"></rect>
  </svg>`
}

/**
 * HTML card renderer for the vendored family-chart engine.
 *
 * Inline CSS is required because d3 owns the card DOM. Keep the data public-safe;
 * do not inject private profile fields here. Belt color is data (`Rank.colorHex`),
 * with a neutral slate fallback — no brand-red literals. The card carries identity
 * (avatar -> name -> belt -> school); the rank label + trust state live on the
 * focus panel / drawer where there is room (SESSION_0394 Desi HIGH — de-clutter).
 */
function buildCardHtml(d: TreeDatum, isFocal: boolean): string {
  const raw = d.data.data as CardRawData

  const displayName = raw.displayName ?? "Unknown"
  const colorHex = raw.colorHex ?? BBL.slate
  const schoolLabel = raw.schoolLabel ?? null
  const avatar = raw.avatar ?? null
  const claimable = raw.claimable ?? false
  const initials = memberInitials(displayName)

  const safeName = escHtml(displayName)
  const safeSchool = schoolLabel ? escHtml(schoolLabel) : ""

  // Clamp glow bloom by luminance so bright belts don't halo. (SESSION_0394 Desi LOW)
  const bright = relativeLuminance(colorHex) > 0.6
  const glow = rgba(colorHex, isFocal ? (bright ? 0.26 : 0.42) : bright ? 0.12 : 0.2)
  const cardBorder = isFocal ? rgba(colorHex, 0.7) : "rgba(255,255,255,0.1)"
  const cardShadow = isFocal
    ? `0 0 0 1px ${cardBorder}, 0 22px 60px -24px ${glow}`
    : `0 0 0 1px ${cardBorder}, 0 14px 34px -20px rgba(0,0,0,0.7)`

  const avatarHtml = avatar
    ? `<img src="${escHtml(avatar)}" alt="${safeName}" style="width:52px;height:52px;border-radius:999px;object-fit:cover;display:block;" />`
    : `<div style="width:52px;height:52px;border-radius:999px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,${rgba(colorHex, 0.9)},rgba(255,255,255,0.14));color:#fff;font-size:16px;font-weight:800;">${escHtml(initials)}</div>`

  // Claimable cards keep one quiet corner marker (it drives a real action); other
  // trust states are no longer shown on the resting card (moved to focus/drawer).
  const claimDot = claimable
    ? `<div title="Claimable" style="position:absolute;top:16px;right:52px;display:inline-flex;align-items:center;gap:4px;border-radius:999px;border:1px solid rgba(199,210,254,0.3);background:rgba(99,102,241,0.16);color:#dbeafe;padding:2px 7px;font-size:8.5px;line-height:1.2;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">Claimable</div>`
    : ""

  const schoolHtml = schoolLabel
    ? `<div style="max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:rgba(255,255,255,0.5);font-size:11px;line-height:1.3;font-weight:500;">${safeSchool}</div>`
    : ""

  const focalAttr = isFocal ? "data-bbl-focal" : "data-bbl-recede"

  return `
    <div data-bbl-card ${focalAttr} style="position:relative;width:${isFocal ? "256px" : "230px"};min-height:${isFocal ? "138px" : "126px"};overflow:hidden;border-radius:20px;background:radial-gradient(circle at 16% 8%, ${rgba(colorHex, 0.16)} 0, transparent 36%),linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.012) 42%, #060606);box-shadow:${cardShadow};transform:translateZ(0);">
      <div style="position:absolute;top:14px;left:14px;width:56px;height:56px;border-radius:999px;padding:2px;background:linear-gradient(135deg, ${colorHex}, rgba(255,255,255,0.22));box-shadow:0 0 18px ${rgba(colorHex, bright ? 0.18 : 0.26)};">
        <div style="width:52px;height:52px;border-radius:999px;background:#0a0a0a;overflow:hidden;">${avatarHtml}</div>
      </div>

      <div data-card-menu role="button" aria-haspopup="menu" tabindex="0" title="Actions" style="position:absolute;top:15px;right:14px;width:28px;height:28px;border-radius:999px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.62);cursor:pointer;user-select:none;font-size:17px;line-height:1;">⋮</div>
      ${claimDot}

      <div style="position:absolute;left:15px;right:15px;bottom:14px;display:flex;flex-direction:column;gap:7px;">
        <div style="max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#fff;font-size:${isFocal ? "17px" : "15px"};line-height:1.1;font-style:italic;font-weight:800;font-family:var(--font-bbl-heading),system-ui,sans-serif;">${safeName}</div>
        <div style="display:flex;align-items:center;gap:8px;min-width:0;">
          ${buildBeltSvg(colorHex, 36)}
          ${schoolHtml}
        </div>
      </div>
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

function PremiumPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cx("rounded-3xl p-4", SOLID_PANEL, className)}>{children}</div>
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

  // "Click to recenter" hint auto-dismisses after the first focus interaction —
  // training-wheels chrome that earns its keep then leaves. (SESSION_0394 Desi LOW)
  const [hasInteracted, setHasInteracted] = useState(false)

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
      setHasInteracted(true)

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

  const focusTrustLabel = focusNode
    ? (TRUST_LABEL[focusNode.trustStatus] ?? focusNode.trustStatus)
    : null

  return (
    <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/8 bg-[#050505] text-white shadow-2xl shadow-black/60 [font-family:var(--font-bbl-body),system-ui,sans-serif]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* One light source (brand `--primary`) + one vignette — no stacked blobs/grids. (Desi KISS) */}
        <div className="absolute left-1/2 top-[-14rem] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_28rem)]" />
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

                  <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-[#141415] px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/60">
                    <RouteIcon className="size-3.5" />
                    Focal lineage view
                  </span>
                </div>

                {/* Marketing copy collapses on mobile so the canvas is above the fold. (Desi 0393) */}
                <h2 className="mt-4 hidden text-balance text-3xl uppercase italic tracking-[0.01em] text-white [font-family:var(--font-bbl-heading),system-ui,sans-serif] sm:block sm:text-4xl lg:text-5xl">
                  Explore the living lineage.
                </h2>

                <p className="mt-3 hidden max-w-3xl text-pretty text-sm/6 text-white/60 sm:block sm:text-base/7">
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

        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/8 bg-black/60 shadow-2xl shadow-black/50">
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
                // Dark editorial stage. The brand glow lives in the `bg-primary`
                // overlay below — no hardcoded brand red here.
                background: "#050505",
                "--background-color": "#050505",
              } as CSSProperties
            }
          />

          {/* One brand-primary glow + one grid on the canvas (tracks BrandSettings). */}
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
                Click to recenter
              </div>
            )}

            {secondaryLinks.length > 0 && (
              <button
                type="button"
                onClick={() => setShowSecondaryLinks(value => !value)}
                className={cx(
                  "inline-flex items-center gap-2 rounded-full px-3 py-2 text-[0.68rem] font-black uppercase tracking-[0.18em] transition",
                  showSecondaryLinks
                    ? "border border-primary/30 bg-primary/15 text-white"
                    : cx("text-white/56 hover:text-white", SOLID_PILL),
                )}
              >
                <RouteIcon className="size-3.5" />
                {showSecondaryLinks ? "Secondary links on" : "Secondary links off"}
              </button>
            )}
          </div>

          {/* Depth controls: bottom-right on mobile so they never crowd the
              top-left recenter/secondary cluster; back to top-right on sm+.
              (SESSION_0394 Desi — mobile top-overlay crowding) */}
          <div className="absolute bottom-3 right-3 z-20 flex max-w-[calc(100%-1.5rem)] flex-row gap-2 sm:bottom-auto sm:right-4 sm:top-4 sm:flex-col">
            <DepthStepper label="Ancestry" value={ancestryDepth} onChange={setAncestryDepth} />
            <DepthStepper label="Progeny" value={progenyDepth} onChange={setProgenyDepth} />
          </div>

          {/* Legend hides on mobile (canvas space is precious); the depth
              controls take the mobile bottom row instead. */}
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
