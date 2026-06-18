// Zoom envelope for the tree layout. The toolbar zoom buttons and the pinch + auto-fit
// hooks all clamp through `clampScale` so scale never escapes [MIN_SCALE, MAX_SCALE].
// MIN/MAX are private — only `clampScale` (below) reads them; SCALE_STEP is the public step.
const MIN_SCALE = 0.5
const MAX_SCALE = 1.35
export const SCALE_STEP = 0.1

export const RESPONSIVE_LAYOUT_QUERY = "(min-width: 768px)"
export const MOBILE_LIST_QUERY = "(max-width: 639.98px)"

// Phase 2 entrance stagger (motion-system tokens — see docs/runbooks/design/motion-system.md).
// Per-tier head start compounds with per-sibling 60ms (stagger-base), clamped so a deep/wide tree
// never feels draggy. Easing is the entrance `ease-out` token.
export const ENTRANCE_DURATION = 0.25
export const ENTRANCE_EASE = [0.16, 1, 0.3, 1] as const
// Private stagger coefficients — only `entranceDelay` (below) composes them.
const GENERATION_STAGGER = 0.12
const SIBLING_STAGGER = 0.06
const ENTRANCE_DELAY_CAP = 0.9

export function entranceDelay(generation: number, siblingIndex: number) {
  return Math.min(
    generation * GENERATION_STAGGER + siblingIndex * SIBLING_STAGGER,
    ENTRANCE_DELAY_CAP,
  )
}

// Phase 2 connector grow-in (motion-system, `--ease-snappy`). On initial render each connector
// segment scales from 0 → 1 along its axis with a generation-tier stagger; all three pieces of one
// edge (parent-below `h-6 w-px`, sibling `h-px` bar, child-above `h-4 w-px`) share the same
// per-edge delay so the edge fills cohesively. The cap keeps deep trees inside a 1.0s envelope on
// top of the 0.25s per-connector animation. Reduced-motion users get no animation at all.
export const CONNECTOR_GROW_DURATION = 0.25

// Phase 3e SVG 90° connectors. The connector band between a parent card and its children row is a
// fixed-height strip (replacing the old `h-6` drop + `h-4` child stub = 24+16px). An absolutely
// positioned, pointer-events-none <svg> draws one 90°-bend <path> per child: down from the parent's
// bottom-centre to a horizontal bus, across to the child's centre, then down to the child's top. The
// parent-drop x is the children-row centre — a layout invariant, since the parent card is centred
// over its children by the column's `items-center`. Drawing in SVG (vs. the prior flow divs) gives
// clean right-angle bends per the Balkan OrgChart idiom while keeping grow-in + path-trace parity.
export const CONNECTOR_BAND_PX = 40
export const CONNECTOR_BUS_PX = CONNECTOR_BAND_PX / 2

export function clampScale(value: number) {
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, Number(value.toFixed(2))))
}
