"use client"

import {
  DownloadIcon,
  EllipsisIcon,
  ExternalLinkIcon,
  FocusIcon,
  LinkIcon,
  MinusIcon,
  PlusIcon,
  RotateCcwIcon,
  WorkflowIcon,
} from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/common/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/common/dropdown-menu"
import { EmptyList } from "~/components/common/empty-list"
import { Prose } from "~/components/common/prose"
import { Stack } from "~/components/common/stack"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/common/tooltip"
import { cx } from "~/lib/utils"
import type {
  BjjTechniqueGraph,
  BjjTechniqueGraphEdge,
  BjjTechniqueGraphNode,
} from "~/server/web/techniques/graph-query"
import {
  deriveNodeTooltip,
  difficultyDefinitionFor,
  difficultyLabelFor,
  typeLabelFor,
} from "~/server/web/techniques/node-tooltip"
import { type ExportRgb, useGraphPngExport } from "./graph-png-export"

export const NODE_WIDTH = 168
export const NODE_HEIGHT = 64
const CANVAS_PADDING = 96
const ZOOM_MIN = 0.35
const ZOOM_MAX = 1.8
const ZOOM_STEP = 0.12
const PAN_STEP = 48
// B3: caps the per-curriculum-item hover peek the same way `node-tooltip.ts`'s KEY_POINT_CAP caps
// the node tooltip — a `notes`-authored list can run long; the peek stays a peek, not the full text.
const CURRICULUM_KEY_POINT_PEEK_CAP = 3
// WL-P2-67: the interactive ZOOM_MIN (0.35) is a legibility floor for manual zoom (wheel/buttons/
// pinch) — it deliberately stays put. `fitToView` needs its OWN floor: at 375px the zoom required
// to frame every node is ~0.17-0.24 (below 0.35), so a fixed clamp there clips nodes off-screen.
// This near-zero floor only guards the degenerate empty-bounds case, never engages in practice.
const FIT_ZOOM_FLOOR = 0.05
// C4: the eased zoom/pan transition (260ms ease-out-expo-like) lives in CSS classes on the node
// layer, with `motion-reduce:transition-none` handling reduced motion at the CSS level — the
// media query applies at computed-value time, immune to useReducedMotion()'s hydration-time
// capture (probed live: motion's hook returned a stale false under an emulated reduce while
// matchMedia said true). Only the drag/pinch gate (isInteracting) is inline — style beats class.

type GraphNodeType = BjjTechniqueGraphNode["type"]
type FilterValue = "all" | GraphNodeType

// ONE source of truth per node type: the four representations (legend dot, node fill, edge
// stroke, PNG-export capture RGB) that were four parallel maps keyed by the same union — they can
// no longer silently drift (Desi P2, SESSION_0588). Solid light/dark node fills are deliberate:
// each tint stays faint but OPAQUE, so overlapping graph nodes never blend into a muddy third
// color and the legend dots stay an exact visual key. `exportRgb` MUST stay literal `rgb()`
// values — html2canvas cannot parse Tailwind v4's OKLab output (see graph-png-export.ts).
const NODE_TYPE_STYLES: Record<
  GraphNodeType,
  { dot: string; node: string; edge: string; exportRgb: ExportRgb }
> = {
  position: {
    dot: "bg-sky-500",
    node: "border-sky-400 bg-sky-50 text-sky-800 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-200",
    edge: "stroke-sky-500",
    exportRgb: { background: "rgb(240 249 255)", border: "rgb(56 189 248)", text: "rgb(7 89 133)" },
  },
  submission: {
    dot: "bg-red-500",
    node: "border-red-400 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-200",
    edge: "stroke-red-500",
    exportRgb: {
      background: "rgb(254 242 242)",
      border: "rgb(248 113 113)",
      text: "rgb(153 27 27)",
    },
  },
  transition: {
    dot: "bg-amber-500",
    node: "border-amber-400 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200",
    edge: "stroke-amber-500",
    exportRgb: {
      background: "rgb(255 251 235)",
      border: "rgb(251 191 36)",
      text: "rgb(120 53 15)",
    },
  },
  counter: {
    dot: "bg-violet-500",
    node: "border-violet-400 bg-violet-50 text-violet-800 dark:border-violet-700 dark:bg-violet-950 dark:text-violet-200",
    edge: "stroke-violet-500",
    exportRgb: {
      background: "rgb(245 243 255)",
      border: "rgb(167 139 250)",
      text: "rgb(91 33 182)",
    },
  },
}

const NODE_TYPES: { value: FilterValue; label: string; dotClass: string }[] = [
  { value: "all", label: "All", dotClass: "bg-foreground" },
  { value: "position", label: "Positions", dotClass: NODE_TYPE_STYLES.position.dot },
  { value: "submission", label: "Submissions", dotClass: NODE_TYPE_STYLES.submission.dot },
  { value: "transition", label: "Transitions", dotClass: NODE_TYPE_STYLES.transition.dot },
  { value: "counter", label: "Counters", dotClass: NODE_TYPE_STYLES.counter.dot },
]

const clampZoom = (value: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value))

const nodeTypeClass = (type: GraphNodeType) => NODE_TYPE_STYLES[type].node
const edgeTypeClass = (type: GraphNodeType) => NODE_TYPE_STYLES[type].edge
// Export path reads node type from a `data-*` string, so fall back to `transition` for anything
// off-union (matches the pre-consolidation `EXPORT_CAPTURE_STYLES[type] ?? …transition`).
const exportRgbFor = (type: string): ExportRgb =>
  (NODE_TYPE_STYLES[type as GraphNodeType] ?? NODE_TYPE_STYLES.transition).exportRgb

type Point = { x: number; y: number }

// D-4 cooperative touch: two-finger pinch math (distance → zoom scale, midpoint → pan delta).
// Module-scope pure helpers — no component state, safe to unit-reason-about independently.
function distanceBetween(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function midpointBetween(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

function buildEdgePath(from: BjjTechniqueGraphNode, to: BjjTechniqueGraphNode) {
  const x1 = from.x + NODE_WIDTH / 2
  const y1 = from.y + NODE_HEIGHT / 2
  const x2 = to.x + NODE_WIDTH / 2
  const y2 = to.y + NODE_HEIGHT / 2
  const dx = Math.abs(x2 - x1) * 0.5

  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`
}

function GraphEdge({
  edge,
  nodeById,
  isHighlighted,
}: {
  edge: BjjTechniqueGraphEdge
  nodeById: Map<string, BjjTechniqueGraphNode>
  isHighlighted: boolean
}) {
  const from = nodeById.get(edge.from)
  const to = nodeById.get(edge.to)

  if (!from || !to) return null

  return (
    <path
      d={buildEdgePath(from, to)}
      data-graph-edge-type={edge.type}
      // C5: an edge touching the selected node brightens + thickens (the "neighborhood glow"
      // reaching along the connection, not just sitting on the neighbor node itself).
      className={cx(
        "fill-none transition-[stroke-width,opacity] duration-200 motion-reduce:transition-none",
        isHighlighted ? "stroke-[3] opacity-90" : "stroke-2 opacity-55",
        edgeTypeClass(edge.type),
      )}
      strokeLinecap="round"
    />
  )
}

export function TechniqueGraph({ graph }: { graph: BjjTechniqueGraph }) {
  const [pan, setPan] = useState({ x: 48, y: 48 })
  const [zoom, setZoom] = useState(1)
  // C5: `selectedNodeId` is the ACTIVE node — it drives the strong ring, the glow fallback source,
  // and (on touch) the first-tap "primed" state — but NO LONGER opens the detail dialog on its
  // own. `dialogNodeId` is the separate signal for the open detail dialog. Splitting them is what
  // makes two-stage touch possible: first tap sets `selectedNodeId` (glow, no dialog), second tap
  // on the already-selected node sets `dialogNodeId` (opens the dialog). Mouse/keyboard set both
  // at once, so desktop opens the dialog on a single click exactly as before.
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [dialogNodeId, setDialogNodeId] = useState<string | null>(null)
  // C5: hovered node id, LIVE (not sticky like rovingNodeId below) — the neighborhood glow's
  // primary trigger. Runtime-probed: the dialog's own backdrop (bg-foreground/10 + blur-sm) is
  // heavy enough at typical zoom that a selectedNodeId-only glow is invisible once the dialog is
  // open, so hover (before the dialog opens) is where the glow actually reads. selectedNodeId
  // stays a fallback source (harmless, occasionally visible through the blur).
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  // APG roving tabindex over the node layer (D-5): the last-active node id. Persists across
  // Tab-out/Tab-in so re-entering the layer returns to where the user left off.
  const [rovingNodeId, setRovingNodeId] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<FilterValue>("all")
  const prefersReducedMotion = useReducedMotion()
  const canvasRef = useRef<HTMLDivElement>(null)
  const exportRef = useRef<HTMLDivElement>(null)
  const isPanning = useRef(false)
  const lastPointer = useRef({ x: 0, y: 0 })
  // C5: pointer type of the most recent press on a node button, so the click handler can tell a
  // touch tap (→ two-stage) from a mouse click (→ open immediately). Per-interaction detection
  // (not a device media query) so a hybrid touch-laptop's mouse and touch each behave correctly.
  const nodePointerType = useRef<string>("mouse")
  // C4: true only for the duration of an active mouse-drag pan or two-finger pinch — the ONE
  // switch that disables the eased zoom/pan transition below so it never fights a live drag.
  const [isInteracting, setIsInteracting] = useState(false)
  // D-4 cooperative touch: active touch pointers by id. Size 1 = a casual single-finger touch —
  // deliberately untouched (no capture, no preventDefault) so the page scrolls over the canvas
  // exactly like any other content. Size 2 = the two-finger gesture that pans/zooms the graph.
  const touchPointers = useRef(new Map<number, Point>())
  const pinchStart = useRef<{ distance: number; midpoint: Point; zoom: number; pan: Point } | null>(
    null,
  )

  const bounds = useMemo(() => {
    // @why Math.max(...) spread is bounded by graph size: a curated BJJ technique graph is O(100s)
    // of nodes, three orders of magnitude below the ~100k-arg spread limit that would overflow the
    // call stack. If this ever renders an unbounded/user-generated graph, switch to a `reduce`.
    const width = Math.max(...graph.nodes.map(node => node.x), 0) + NODE_WIDTH + CANVAS_PADDING
    const height = Math.max(...graph.nodes.map(node => node.y), 0) + NODE_HEIGHT + CANVAS_PADDING
    return { width, height }
  }, [graph.nodes])

  const visibleNodes = useMemo(
    () =>
      activeType === "all" ? graph.nodes : graph.nodes.filter(node => node.type === activeType),
    [activeType, graph.nodes],
  )
  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map(node => node.id)), [visibleNodes])
  const visibleEdges = useMemo(
    () => graph.edges.filter(edge => visibleNodeIds.has(edge.from) && visibleNodeIds.has(edge.to)),
    [graph.edges, visibleNodeIds],
  )
  const nodeById = useMemo(() => new Map(visibleNodes.map(node => [node.id, node])), [visibleNodes])
  // Derive tooltip DTOs once per nodes-array identity — not per node per render, which re-ran
  // deriveNodeTooltip on every pan pointermove (SESSION_0569 Desi P3 + Doug P3). Sorted into
  // LINEAR reading order (y, then x) so DOM order, screen-reader order and the roving-tabindex
  // arrow order are the same sequence.
  const visibleNodesWithTooltips = useMemo(
    () =>
      [...visibleNodes]
        .sort((a, b) => a.y - b.y || a.x - b.x)
        .map(node => ({ node, tooltip: deriveNodeTooltip(node) })),
    [visibleNodes],
  )
  // The layer's ONE tab stop: the last-active node when it is still visible, else the first node
  // in reading order (e.g. after a type-filter change hid it).
  const rovingActiveId =
    rovingNodeId && visibleNodeIds.has(rovingNodeId)
      ? rovingNodeId
      : visibleNodesWithTooltips[0]?.node.id
  const allNodeById = useMemo(
    () => new Map(graph.nodes.map(node => [node.id, node])),
    [graph.nodes],
  )
  const dialogNode = dialogNodeId ? allNodeById.get(dialogNodeId) : undefined
  // C5: the active node's directly-connected neighbors (1-hop, either edge direction), over ALL
  // edges (not just visibleEdges) — a neighbor hidden by the current type filter simply has no
  // rendered button to glow, so filtering the set further would be dead code either way. On
  // desktop, hover wins (live, visible pre-dialog) and selectedNodeId is the fallback; on touch
  // there is no hover, so the first-tap selectedNodeId IS the glow source (the whole point of the
  // two-stage tap — the glow is now visible before the dialog opens).
  const glowSourceId = hoveredNodeId ?? selectedNodeId
  const neighborNodeIds = useMemo(() => {
    const neighbors = new Set<string>()
    if (!glowSourceId) return neighbors
    for (const edge of graph.edges) {
      if (edge.from === glowSourceId) neighbors.add(edge.to)
      else if (edge.to === glowSourceId) neighbors.add(edge.from)
    }
    return neighbors
  }, [graph.edges, glowSourceId])

  const fitToView = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // WL-P2-67: bypass the interactive ZOOM_MIN floor here on purpose — Fit must be able to zoom
    // out past 0.35 on narrow viewports so every node lands inside the viewport. Only ZOOM_MAX and
    // the near-zero degenerate-bounds floor apply; manual zoom (wheel/buttons/pinch) keeps clampZoom.
    const nextZoom = Math.max(
      FIT_ZOOM_FLOOR,
      Math.min(
        ZOOM_MAX,
        1,
        (canvas.clientWidth - 48) / Math.max(bounds.width, 1),
        (canvas.clientHeight - 48) / Math.max(bounds.height, 1),
      ),
    )

    setZoom(nextZoom)
    setPan({
      x: Math.max(24, (canvas.clientWidth - bounds.width * nextZoom) / 2),
      y: Math.max(24, (canvas.clientHeight - bounds.height * nextZoom) / 2),
    })
  }, [bounds.height, bounds.width])

  useEffect(() => {
    const raf = requestAnimationFrame(fitToView)
    return () => cancelAnimationFrame(raf)
  }, [fitToView])

  const updateZoom = (nextZoom: number) => setZoom(clampZoom(nextZoom))

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return

    // D-4 cooperative touch: a single finger is left completely alone here — no capture, no
    // preventDefault — so `touch-pan-y` (below) lets the browser scroll the page over the canvas
    // exactly like a casual swipe over any other section. Only the SECOND touch (a genuine
    // two-finger gesture) engages graph pan/zoom.
    if (event.pointerType === "touch") {
      touchPointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
      if (touchPointers.current.size !== 2) return

      for (const pointerId of touchPointers.current.keys()) {
        event.currentTarget.setPointerCapture(pointerId)
      }
      const [a, b] = Array.from(touchPointers.current.values())
      pinchStart.current = {
        distance: distanceBetween(a, b),
        midpoint: midpointBetween(a, b),
        zoom,
        pan,
      }
      setIsInteracting(true)
      return
    }

    isPanning.current = true
    setIsInteracting(true)
    lastPointer.current = { x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") {
      if (!touchPointers.current.has(event.pointerId)) return
      touchPointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
      if (touchPointers.current.size !== 2 || !pinchStart.current) return

      // Two active touches: this IS the two-finger gesture, so take over from native touch
      // handling for these events only (the CSS `touch-pan-y` already keeps native pinch/pan off).
      event.preventDefault()
      const [a, b] = Array.from(touchPointers.current.values())
      const scale = distanceBetween(a, b) / pinchStart.current.distance
      const midpoint = midpointBetween(a, b)
      setZoom(clampZoom(pinchStart.current.zoom * scale))
      setPan({
        x: pinchStart.current.pan.x + (midpoint.x - pinchStart.current.midpoint.x),
        y: pinchStart.current.pan.y + (midpoint.y - pinchStart.current.midpoint.y),
      })
      return
    }

    if (!isPanning.current) return
    const dx = event.clientX - lastPointer.current.x
    const dy = event.clientY - lastPointer.current.y
    lastPointer.current = { x: event.clientX, y: event.clientY }
    setPan(current => ({ x: current.x + dx, y: current.y + dy }))
  }

  const stopPanning = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") {
      touchPointers.current.delete(event.pointerId)
      if (touchPointers.current.size < 2) pinchStart.current = null
      if (touchPointers.current.size === 0) setIsInteracting(false)
      return
    }
    isPanning.current = false
    setIsInteracting(false)
  }

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    // Zoom only on an explicit gesture: ctrl/cmd + wheel, or a trackpad pinch (which browsers
    // report as a ctrlKey wheel). A plain wheel falls through to normal page scroll.
    if (!event.ctrlKey && !event.metaKey) return
    event.preventDefault()
    updateZoom(zoom + (event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP))
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!event.key.startsWith("Arrow")) return
    event.preventDefault()
    setPan(current => {
      if (event.key === "ArrowLeft") return { ...current, x: current.x + PAN_STEP }
      if (event.key === "ArrowRight") return { ...current, x: current.x - PAN_STEP }
      if (event.key === "ArrowUp") return { ...current, y: current.y + PAN_STEP }
      return { ...current, y: current.y - PAN_STEP }
    })
  }

  // Roving tabindex keyboard model (APG), LINEAR over reading order — deliberately NOT 2D
  // spatial nav. Right/Down = next, Left/Up = prev, Home/End = first/last, clamped at the ends
  // (no wrap). stopPropagation keeps these arrows from ALSO panning the canvas (whose own
  // keydown handler pans when the canvas itself is focused); Enter/Space fall through to the
  // node button's click → dialog, and focus itself opens the tooltip instantly (B1 unchanged).
  const handleNodeLayerKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const { key } = event
    const isRovingKey =
      key === "ArrowRight" ||
      key === "ArrowDown" ||
      key === "ArrowLeft" ||
      key === "ArrowUp" ||
      key === "Home" ||
      key === "End"
    if (!isRovingKey || visibleNodesWithTooltips.length === 0) return

    event.preventDefault()
    event.stopPropagation()

    const lastIndex = visibleNodesWithTooltips.length - 1
    const currentIndex = visibleNodesWithTooltips.findIndex(
      ({ node }) => node.id === rovingActiveId,
    )
    const nextIndex =
      key === "Home"
        ? 0
        : key === "End"
          ? lastIndex
          : key === "ArrowRight" || key === "ArrowDown"
            ? Math.min(lastIndex, Math.max(0, currentIndex) + 1)
            : Math.max(0, currentIndex - 1)

    const next = visibleNodesWithTooltips[nextIndex]?.node
    if (!next) return

    setRovingNodeId(next.id)
    // Focus synchronously (tabIndex flips on the re-render; programmatic focus works either way).
    // Node ids are slugs ([a-z0-9-]), safe inside an attribute selector.
    canvasRef.current?.querySelector<HTMLButtonElement>(`[data-node-id="${next.id}"]`)?.focus()
  }

  // C5-adjacent: the PNG-export subsystem now lives in the `useGraphPngExport` hook (Desi P2,
  // SESSION_0588) — same crop math + html2canvas capture, just lifted out of the component.
  const { isExporting, exportPng } = useGraphPngExport({
    exportRef,
    pan,
    zoom,
    bounds,
    exportRgbFor,
  })

  return (
    <>
      <Card className="gap-3 p-3 md:p-4">
        <Stack direction="row" wrap size="sm" className="w-full items-center justify-between">
          <Stack direction="row" wrap size="xs" className="items-center">
            <Badge variant="soft" prefix={<WorkflowIcon />}>
              {graph.nodes.length} techniques
            </Badge>
            <Badge variant="soft">{graph.edges.length} links</Badge>
            {NODE_TYPES.map(type => {
              const isActive = activeType === type.value

              return (
                // ONE visual family — the sliding pill is the single active indicator (a variant
                // flip on top would be a redundant double indicator). The pill lives at -z-10
                // inside the isolated Button, so it paints above the Button's own background but
                // below its label and never occludes the focus-visible ring. overflow-visible
                // lets the pill stay visible mid-slide between chips (cross-row slides included).
                <Button
                  key={type.value}
                  type="button"
                  size="sm"
                  variant="secondary"
                  aria-pressed={isActive}
                  className={cx(
                    "relative isolate overflow-visible",
                    // border-transparent! kills the secondary variant's 1px muted frame (and its
                    // hover darken) on the already-active chip — the pill is the only indicator.
                    isActive &&
                      "z-10 border-transparent! text-primary-foreground hover:border-transparent! hover:text-primary-foreground",
                  )}
                  onClick={() => setActiveType(type.value)}
                >
                  <span
                    aria-hidden="true"
                    className={cx(
                      "size-2 shrink-0 rounded-full ring-1 ring-black/10",
                      type.dotClass,
                      isActive && "bg-primary-foreground",
                    )}
                  />
                  {type.label}
                  {isActive && (
                    // Mirrors the layoutId pill precedent in
                    // components/web/products/product-interval-switch.tsx:55-61 (unique layoutId —
                    // "indicator" is taken). Animates only on activeType change; keyboard
                    // Enter/Space hits the same onClick, so the pill moves identically.
                    <motion.span
                      aria-hidden="true"
                      layoutId="graph-type-pill"
                      className="absolute inset-0 -z-10 rounded-md bg-primary"
                      transition={{
                        type: "tween",
                        duration: prefersReducedMotion ? 0 : 0.125,
                        ease: "easeOut",
                      }}
                    />
                  )}
                </Button>
              )
            })}
          </Stack>

          {/* AUD2-3: labels hide below sm so five controls fit the toolbar row without crowding
              the mobile viewport the graph itself needs to frame (bundled with the WL-P2-67
              ZOOM_MIN clamp fix as one decision, not two). aria-label keeps the accessible name —
              `hidden` removes text from the a11y tree too, not just the viewport. */}
          <Stack direction="row" wrap size="xs">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              prefix={<MinusIcon />}
              aria-label="Zoom out"
              onClick={() => updateZoom(zoom - ZOOM_STEP)}
            >
              <span className="hidden sm:inline">Out</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              prefix={<PlusIcon />}
              aria-label="Zoom in"
              onClick={() => updateZoom(zoom + ZOOM_STEP)}
            >
              <span className="hidden sm:inline">In</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              prefix={<RotateCcwIcon />}
              aria-label="Reset zoom"
              onClick={() => {
                setZoom(1)
                setPan({ x: 48, y: 48 })
              }}
            >
              <span className="hidden sm:inline">Reset</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              prefix={<FocusIcon />}
              aria-label="Fit to view"
              onClick={fitToView}
            >
              <span className="hidden sm:inline">Fit</span>
            </Button>
            {/* AUD2-9: demoted to secondary — PNG export was the page's only primary button; the
                live graph (SVG edges + HTML nodes) stays the primary surface, export is secondary. */}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              prefix={<DownloadIcon />}
              aria-label="Download PNG"
              isPending={isExporting}
              onClick={exportPng}
            >
              <span className="hidden sm:inline">PNG</span>
            </Button>
          </Stack>
        </Stack>

        <div
          ref={exportRef}
          className="relative h-[72vh] min-h-[520px] w-full overflow-hidden rounded-lg border bg-background"
        >
          <div
            ref={canvasRef}
            tabIndex={0}
            role="application"
            aria-label="BJJ technique graph"
            // AUD2-8: `hsl(var(--border))` referenced a variable that was never defined (the
            // token is `--color-border`, itself already a full `hsl(...)` value) — the whole
            // background-image declaration was invalid and painted nothing. `var(--color-border)`
            // is the live idiom.
            // D-4: `touch-pan-y` (not `touch-none`) lets the browser keep handling single-finger
            // vertical scroll natively — the page scrolls over the canvas — while still blocking
            // native pinch-zoom/horizontal-pan so the two-finger gesture below can own those.
            className="relative size-full cursor-grab touch-pan-y bg-[radial-gradient(circle,_var(--color-border)_1px,_transparent_1px)] bg-[length:28px_28px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopPanning}
            onPointerLeave={stopPanning}
            onPointerCancel={stopPanning}
            onWheel={handleWheel}
            onKeyDown={handleKeyDown}
          >
            {/* One provider for the whole node layer: ~250ms hover-open (the L1 wrapper defaults
                delay to 0), while keyboard focus still opens instantly (Base UI focus-open is
                not delayed and the wrapper's data-instant:duration-0 skips the animation). */}
            <TooltipProvider delay={250}>
              {/* role="group" (NOT a partially-implemented grid role): the node buttons form one
                  composite widget whose single tab stop is the roving tabIndex=0 node below. */}
              <div
                role="group"
                aria-label="Technique nodes"
                // C4: eased zoom/fit + zoom-control transitions via CSS (see the constant-block
                // comment). motion-reduce is handled here — NOT via useReducedMotion, whose
                // hydration-time capture proved stale under a live emulated-reduce probe.
                className="absolute left-0 top-0 transition-transform duration-[260ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
                style={{
                  width: bounds.width,
                  height: bounds.height,
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: "0 0",
                  // C4: NEVER ease during an active drag or pinch — inline style beats the class.
                  ...(isInteracting ? { transition: "none" } : null),
                }}
                onKeyDown={handleNodeLayerKeyDown}
              >
                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 overflow-visible"
                  width={bounds.width}
                  height={bounds.height}
                >
                  {visibleEdges.map(edge => (
                    <GraphEdge
                      key={edge.id}
                      edge={edge}
                      nodeById={nodeById}
                      isHighlighted={
                        glowSourceId !== null &&
                        (edge.from === glowSourceId || edge.to === glowSourceId)
                      }
                    />
                  ))}
                </svg>

                {visibleNodesWithTooltips.map(({ node, tooltip }) => {
                  return (
                    // Force-closed once a node is selected (Base UI also closes on trigger press,
                    // but `disabled` makes it deterministic). On desktop a node is selected only
                    // when its dialog opens, so this still reads as "closed while the dialog is
                    // open". Hover-open is mouse-only in Base UI, so touch never shows a tooltip —
                    // its C5 two-stage tap (first tap selects/glows, second opens the dialog) is
                    // unaffected by this disable.
                    <Tooltip key={node.id} disabled={selectedNodeId !== null}>
                      <TooltipTrigger
                        render={
                          <button
                            type="button"
                            className={cx(
                              "absolute flex flex-col justify-center gap-1 overflow-hidden rounded-lg border-2 px-3 text-left shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:z-10 hover:-translate-y-0.5 hover:shadow-md active:translate-y-px active:shadow-sm motion-reduce:transform-none motion-reduce:transition-none focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              selectedNodeId === node.id && "z-10 ring-2 ring-ring",
                              // C5: the hovered/selected node's 1-hop neighbors glow — a soft
                              // primary ring + shadow, the SAME idiom `lineage-branch.tsx` uses
                              // for "isInSelectedPath" (never the active node's own stronger
                              // ring). Hover-driven so it's visible WHILE exploring, before the
                              // dialog's backdrop blur would otherwise hide it (runtime-probed).
                              node.id !== glowSourceId &&
                                neighborNodeIds.has(node.id) &&
                                "z-10 ring-1 ring-primary/40 shadow-md shadow-primary/10",
                              nodeTypeClass(node.type),
                            )}
                            data-graph-node-type={node.type}
                            data-node-id={node.id}
                            // Roving tabindex: ONE node is the layer's tab stop, arrows move it.
                            tabIndex={node.id === rovingActiveId ? 0 : -1}
                            style={{
                              left: node.x,
                              top: node.y,
                              width: NODE_WIDTH,
                              height: NODE_HEIGHT,
                            }}
                            aria-label={`${node.label}, ${typeLabelFor(node.type)}`}
                            aria-pressed={selectedNodeId === node.id}
                            onFocus={() => {
                              setRovingNodeId(node.id)
                              setHoveredNodeId(node.id)
                            }}
                            onBlur={() =>
                              setHoveredNodeId(current => (current === node.id ? null : current))
                            }
                            onMouseEnter={() => setHoveredNodeId(node.id)}
                            onMouseLeave={() =>
                              setHoveredNodeId(current => (current === node.id ? null : current))
                            }
                            // C5: record the press's pointer type so the click can distinguish a
                            // touch tap from a mouse click (a hybrid device may do both).
                            onPointerDown={event => {
                              nodePointerType.current = event.pointerType
                            }}
                            onClick={event => {
                              event.stopPropagation()
                              // C5 two-stage tap (ratified SESSION_0588): on TOUCH, the first tap on
                              // an unselected node only SELECTS it — revealing the neighborhood glow
                              // that hover shows on desktop — WITHOUT opening the detail dialog; a
                              // second tap on the already-selected node opens the dialog. Keyboard
                              // activation (synthetic click, `detail === 0`) and mouse clicks are
                              // unchanged: they select AND open in one action. `detail === 0` guards
                              // the case where the last pointer press was a touch but this activation
                              // is a keyboard Enter/Space, so keyboard never gets stuck one-tap-short.
                              const isKeyboard = event.detail === 0
                              const isTouchTap = !isKeyboard && nodePointerType.current === "touch"
                              if (isTouchTap && selectedNodeId !== node.id) {
                                setSelectedNodeId(node.id)
                                return
                              }
                              setSelectedNodeId(node.id)
                              setDialogNodeId(node.id)
                            }}
                          >
                            <span className="text-[0.625rem] font-semibold uppercase leading-none tracking-normal opacity-80">
                              {typeLabelFor(node.type)}
                            </span>
                            <span className="line-clamp-2 text-sm font-semibold leading-tight">
                              {node.label}
                            </span>
                            {node.beltLevelMin?.colorHex && (
                              <>
                                <span
                                  aria-hidden="true"
                                  data-graph-belt-hairline
                                  className="absolute inset-x-0 bottom-[3px] h-px bg-border"
                                />
                                <span
                                  aria-hidden="true"
                                  data-graph-belt-color={node.beltLevelMin.colorHex}
                                  className="absolute inset-x-0 bottom-0 h-[3px]"
                                  style={{ backgroundColor: node.beltLevelMin.colorHex }}
                                />
                              </>
                            )}
                          </button>
                        }
                      />
                      {/* TEXT ONLY (strict no-media contract, see node-tooltip.ts) — never render
                        img/iframe/video or links/buttons in here. Portals to body, outside
                        exportRef, so the PNG export never captures an open tooltip. */}
                      <TooltipContent
                        side="top"
                        size="md"
                        className="flex-col items-start gap-1 text-left"
                      >
                        <span className="font-semibold">{tooltip.heading}</span>
                        <span className="text-[0.625rem] font-medium uppercase tracking-wide opacity-70">
                          {tooltip.typeLabel}
                        </span>
                        {tooltip.definition && (
                          <span className="opacity-90">{tooltip.definition}</span>
                        )}
                        {tooltip.keyPoints.length > 0 && (
                          <ul className="list-disc space-y-0.5 pl-4 opacity-90">
                            {tooltip.keyPoints.map((point, index) => (
                              // Index-safe key: cue text is data-authored and can repeat.
                              <li key={`${node.id}-${index}`}>{point}</li>
                            ))}
                          </ul>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </TooltipProvider>
          </div>

          {/* D3 / AUD2-7: a type filter with zero matches used to leave a silent, blank canvas —
              same "reset the filter" idiom as `community-feed.tsx`'s EmptyList, sized to sit over
              the dot-grid without blocking pan/drag on the empty canvas underneath. */}
          {visibleNodesWithTooltips.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
              <EmptyList
                render={
                  <Card className="pointer-events-auto w-auto max-w-xs items-center gap-3 text-center" />
                }
              >
                {activeType === "all"
                  ? "No techniques in this graph yet."
                  : `No ${NODE_TYPES.find(type => type.value === activeType)?.label.toLowerCase()} techniques in this graph yet.`}
                {activeType !== "all" && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="mt-2"
                    onClick={() => setActiveType("all")}
                  >
                    Show all techniques
                  </Button>
                )}
              </EmptyList>
            </div>
          )}
        </div>
      </Card>

      <Dialog
        open={!!dialogNode}
        onOpenChange={open => {
          if (!open) {
            // C5: closing the dialog clears BOTH the dialog target and the active selection, so a
            // touch user returns to a clean, unglowed graph (and desktop behaves exactly as before).
            setDialogNodeId(null)
            setSelectedNodeId(null)
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          {dialogNode && (
            <>
              <DialogHeader>
                <DialogTitle>{dialogNode.label}</DialogTitle>
                <DialogDescription>
                  {dialogNode.description ?? "No description recorded."}
                </DialogDescription>
              </DialogHeader>

              <Stack direction="row" wrap size="xs">
                <Badge variant="primary">{typeLabelFor(dialogNode.type)}</Badge>
                {dialogNode.position && <Badge variant="soft">{dialogNode.position}</Badge>}
                {dialogNode.difficultyLevel && (
                  // B2: the raw enum ("BEGINNER") never faced members — humanize it, and explain
                  // what the term means on hover/focus (glossary lives in node-tooltip.ts; the
                  // Base UI Tooltip.Trigger works on a plain non-button element, same idiom as
                  // `verified-badge.tsx`/`product-features.tsx`'s Ping trigger).
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Badge variant="outline" className="cursor-help">
                          {difficultyLabelFor(dialogNode.difficultyLevel)}
                        </Badge>
                      }
                    />
                    <TooltipContent>
                      {difficultyDefinitionFor(dialogNode.difficultyLevel) ??
                        difficultyLabelFor(dialogNode.difficultyLevel)}
                    </TooltipContent>
                  </Tooltip>
                )}
                {dialogNode.isFoundational && <Badge variant="success">Foundational</Badge>}
              </Stack>

              {dialogNode.teachingCues.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Teaching cues</p>
                  <Prose className="prose-sm max-w-none">
                    <ul>
                      {dialogNode.teachingCues.map(cue => (
                        <li key={cue}>{cue}</li>
                      ))}
                    </ul>
                  </Prose>
                </div>
              )}

              {dialogNode.curriculumItems.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Curriculum links</p>
                  <Stack direction="column" size="xs">
                    {dialogNode.curriculumItems.map(item => (
                      // B3: a hover/focus "peek" at that curriculum item's parsed key points
                      // (`keyPointsFromNotes` — TEXT ONLY, same no-media contract as the B1/B2
                      // tooltips). This data already reached the client for the B1 node-tooltip
                      // fallback path but was never itself surfaced here — a real content gap, not
                      // a rebuild of the do-not-touch B1 tooltip contract. `disabled` skips the
                      // trigger entirely for items with no authored key points.
                      <Tooltip key={item.id} disabled={item.keyPoints.length === 0}>
                        <TooltipTrigger
                          render={
                            <Link
                              href={`/courses/${item.courseSlug}`}
                              className="rounded-md border bg-card px-3 py-2 text-sm transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <span className="font-medium">{item.title}</span>
                              <span className="block text-xs text-muted-foreground">
                                {item.courseTitle}
                              </span>
                            </Link>
                          }
                        />
                        <TooltipContent
                          side="top"
                          size="md"
                          className="flex-col items-start gap-1 text-left"
                        >
                          <span className="text-[0.625rem] font-medium uppercase tracking-wide opacity-70">
                            Key points
                          </span>
                          <ul className="list-disc space-y-0.5 pl-4 opacity-90">
                            {item.keyPoints
                              .slice(0, CURRICULUM_KEY_POINT_PEEK_CAP)
                              .map((point, index) => (
                                // Index-safe key: notes-authored key points can repeat (same as B1).
                                <li key={`${item.id}-${index}`}>{point}</li>
                              ))}
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </Stack>
                </div>
              )}

              <DialogFooter>
                {/* G2 (folds AUD2-12): the overflow actions live behind an ellipsis menu, same
                    shell idiom as `community-share-menu.tsx` — freeing "Technique Detail" to be
                    the ONE primary CTA below instead of sharing top billing with a secondary
                    style it never earned. */}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        type="button"
                        variant="secondary"
                        prefix={<EllipsisIcon />}
                        aria-label="More technique actions"
                      />
                    }
                  />
                  <DropdownMenuContent align="start" sideOffset={8}>
                    <DropdownMenuItem
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            `${window.location.origin}${dialogNode.href}`,
                          )
                          toast.success("Link copied")
                        } catch {
                          toast.error("Couldn't copy the link")
                        }
                      }}
                    >
                      <LinkIcon /> Copy link
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        window.open(
                          `${window.location.origin}${dialogNode.href}`,
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                    >
                      <ExternalLinkIcon /> Open in new tab
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="primary"
                  render={<Link href={dialogNode.href} />}
                  onClick={() => {
                    setDialogNodeId(null)
                    setSelectedNodeId(null)
                  }}
                >
                  Technique Detail
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
