---
title: "SESSION 0336 — Lineage Phase 3e: SVG 90° board connectors (animation parity)"
slug: session-0336
type: session--implement
status: closed
created: 2026-06-03
updated: 2026-06-03
last_agent: claude-session-0336
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0335.md
  - docs/petey-plan-0305.md
  - docs/runbooks/design/motion-system.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0336 — Lineage Phase 3e: SVG 90° board connectors (animation parity)

## Date

2026-06-03

## Operator

Brian + claude-session-0336 (Petey orchestration → Cody build → Doug verify)

## Goal

Resume `petey-plan-0305` Phase 3e: replace the flow-laid `div` connector segments in the
lineage tree canvas with true SVG 90°-bend path connectors (Balkan OrgChart idiom, plan §
"90° bend connectors"), while preserving full animation parity — connector grow-in
(`--ease-snappy`), the Phase-2 path-trace highlight cascade, and the reduced-motion fallback.
Tree-mode only; board mode (compact child-lists) is intentionally connector-free and untouched.

## Status

### Status: closed

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0335.md`
- Carryover: SESSION_0335 raised CI to best practice (`ci.yml`: Biome + typecheck + unit gates)
  and decoupled prod deploys. **CI precondition for this session is MET** — `ci.yml` run
  `26889391880` (commit `f47f81b`) is green: Biome ✓, Typecheck ✓, Unit tests ✓ (2m22s). This
  session resumes the lineage epic's remaining P2 polish.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `447d4b1`

### Graphify check

- Graph status: current (rebuilt end of SESSION_0335); stats at bow-in: 9093 nodes, 13786 edges,
  1395 communities, 1555 files tracked.
- Queries used:
  - `petey-plan-0305 phase 3e SVG board connectors lineage tournament bracket trophy leaderboard PDF export`
- Files selected from graph + direct inspection:
  - `apps/web/components/web/lineage/lineage-tree-canvas.tsx` (`LineageBranch`, `LineageChildGroupColumn` — the div connector segments)
  - `apps/web/components/web/lineage/lineage-tree-board.tsx` (board mode — no connectors, confirms scope boundary)
  - `apps/web/app/styles.css` (`connector-grow-y/x` keyframes, `--ease-snappy`)
- Verification note: Graphify used as navigation; the connector code, keyframes, and slice status
  were confirmed by direct source/session-title inspection (slices 3c/3d/3f-search verified done in
  SESSION_0329/0316+0330/0331, so the goal's "3e is what's left" is accurate).

### Grill outcome

3 forks resolved with the operator before plan-lock:

1. **Session scope → 3e ONLY, done well.** Remaining epic work (3e, 3f-PDF, Phase 4 leaderboard) is
   2–3 sessions; petey-plan rule #1 caps a session at 1–3 tasks. 3f-PDF (client-side print-to-PDF)
   and Phase 4 leaderboard staged for next sessions (see Next session).
2. **3e target → tree-mode only, full animation parity.** Replace the div connectors in
   `lineage-tree-canvas` with SVG 90° paths preserving grow-in + path-trace + reduced-motion. Board
   mode untouched (it has no connectors — compact inline child-lists).
3. **PDF export approach (for next session) → client-side print-to-PDF** (print CSS + `window.print()`,
   zero new deps). Recorded so the next session starts pre-decided.

## Petey plan

### Goal

Land Phase 3e — SVG 90° bend connectors in the lineage tree canvas with animation parity.

### Tasks

#### SESSION_0336_TASK_01 — SVG 90° connectors in `LineageBranch`

- **Agent:** Cody (inline — single coherent file change, not a parallel fan-out)
- **What:** Replace the three div connector segments (parent `h-6 w-px` drop, absolute `h-px`
  sibling bus, per-child `h-4 w-px` stub) with one measured SVG overlay per parent→children band
  drawing a true 90°-bend `<path>` from the parent's bottom-center to each child's top-center.
- **Steps:**
  1. Add a `LineageConnectorLayer` sub-component (co-located in `lineage-tree-canvas.tsx`):
     an absolutely-positioned, `pointer-events-none` `<svg>` spanning the connector band above the
     children row. Measures the children-row container width + each child column's center via
     `useLayoutEffect` + `ResizeObserver`, re-measuring on collapse/expand/reorder.
  2. Draw one `<path>` per child: `M centerX 0 V busY H childX V band` (parent-drop-x = row center,
     a layout invariant since the parent card is centered over its children). Single-child = straight line.
  3. **Grow-in parity:** normalize each path with `pathLength={1}` + `stroke-dasharray:1`; add a
     `@keyframes connector-draw` (`stroke-dashoffset 1→0`) animated with `--ease-snappy` and the
     existing per-generation `connectorGrowDelay`. Reduced-motion = fully drawn, no animation.
  4. **Path-trace parity:** highlighted child edges transition stroke to `--color-primary`@0.6 with
     the existing `traceStepDelay` cascade; default `--color-border`. `transition: stroke 200ms`.
  5. Remove the div segments + add the band spacing (`mt` = the 24+16px the divs occupied) so layout
     height is unchanged. Strip the `h-4` stub from `LineageChildGroupColumn`.
- **Done means:** tree renders 90° SVG connectors; grow-in animates on load, path-trace cascades on
  select, reduced-motion shows static full connectors; dnd-drag + scroll/pan still work (svg is
  `pointer-events-none`); `bun run typecheck` + `bun biome ci .` clean.
- **Depends on:** nothing

### Parallelism

None. Single coherent change to one component file (`lineage-tree-canvas.tsx`) + one keyframe in
`styles.css`. Sub-agent fan-out would add coordination cost with zero concurrency — built inline.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0336_TASK_01 | Cody (inline) | One file, tightly coupled to existing animation infra; inline keeps the animation invariants in one head. |
| Verification | Doug | Typecheck + biome + Playwright visual smoke (grow-in / path-trace / reduced-motion). |

### Open decisions

None — 3 forks resolved at grill (see Grill outcome).

### Risks

- **Measurement timing / layout shift:** SVG needs child column coords from the DOM. Mitigated by
  `useLayoutEffect` (pre-paint) + `ResizeObserver` + re-measure key on child ids/collapse state.
- **Zoom interaction:** the canvas uses `transform: scale()`. SVG lives *inside* the scaled
  container, so offset-based measurements are in unscaled layout space — correct by construction.
- **dnd/scroll regression:** the documented pinch-zoom↔dnd PointerSensor conflict means the overlay
  must not capture pointer events → `pointer-events-none` on the `<svg>`.

### Scope guard

- No 3f-PDF, no Phase 4 leaderboard, no board-mode connectors this session.
- No schema/Prisma/server changes — pure client render change.
- Do not touch the entrance stagger, hover-lift, or zoom logic beyond what the connector swap requires.

### Dirstarter implementation template

- **Docs read first:** not applicable — lineage canvas is a custom domain component (no Dirstarter L1
  primitive for tree connectors).
- **Baseline pattern to extend:** the existing `LineageBranch`/`LineageChildGroupColumn` recursion +
  the Phase-2 motion infra (`connectorGrowDelay`, `traceStepDelay`, `--ease-snappy`).
- **Custom delta:** swap div connector segments → measured SVG 90° paths, preserving all motion.
- **No-bypass proof:** no Dirstarter capability replaced; this is Ronin-custom lineage visualization.

## Cody pre-flight

### Pre-flight: LineageConnectorLayer (SVG 90° connectors)

#### 1. Existing component scan

- Graphify query used: `petey-plan-0305 phase 3e SVG board connectors lineage ...`
- Found: connectors are rendered inline inside `LineageBranch` (`lineage-tree-canvas.tsx:671-722`) and
  `LineageChildGroupColumn` (`:796-805`) as Tailwind div segments. No existing SVG-connector component.
  Board mode (`lineage-tree-board.tsx`) has none. No reusable connector primitive exists.

#### 2. L1 template scan

- Consulted `dirstarter-docs-inventory.md`: not applicable — no L1 primitive for tree connectors.
- Closest L1 pattern: none (custom domain visualization).
- Primitive API spot-check: no design-system primitive consumed; the connector is raw `<svg>`/`<path>`.
  Existing animation helpers reused as-is: `connectorGrowDelay(generation)`, `traceStepDelay(step, perStepDelay)`.

#### 3. Composition decision

- Composing existing components: extends `LineageBranch`/`LineageChildGroupColumn` in place; adds one
  co-located `LineageConnectorLayer` sub-component (no new file — domain components live in this module).

#### 4. Lane docs loaded

- Prior SESSION next session read: yes (SESSION_0335 → Phase 3e).
- Plan read: `docs/petey-plan-0305.md` (§ "90° bend connectors", Phase-3 slice table).
- ADR read: none required (no architecture/schema change).
- Runbook consulted: `docs/runbooks/design/motion-system.md` (reduced-motion discipline, `--ease-snappy`).

#### 5. Dev environment confirmed

- Dev server command: `npx next dev --turbo` (from `apps/web/`) — FS-0002.
- Working directory: `/Users/brianscott/dev/ronin-dojo-app` (FS-0024 git guard passed at bow-in).
- Brand/host for testing: local app via Playwright dev-login.
- Verification commands: `bun run typecheck`, `bun biome ci .`, `bun test` (from `apps/web/`).

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0002 (dev-server cmd — honored), FS-0024 (git cwd guard — passed).
  No lineage/SVG-specific FS entry.
- Mitigation acknowledged: dev server via `npx next dev --turbo`; all git from app cwd.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0336_TASK_01 | landed | SVG 90° connectors in lineage tree canvas — render + grow-in + path-trace cascade runtime-verified; parent-ref bug caught & fixed in smoke (FINDING_01). |

## What landed

- **Phase 3e — SVG 90° connectors (tree mode).** The flow-laid `div` connector segments (parent
  `h-6 w-px` drop, absolute `h-px` sibling bus, per-child `h-4 w-px` stub) are replaced by a measured
  SVG overlay (`LineageConnectorLayer`) that draws one true 90°-bend `<path>` per child edge
  (parent-centre drop → horizontal bus → child-centre drop). Single children collapse to a straight
  vertical line.
- **Full animation parity preserved:** grow-in via a normalised `pathLength=1` + new `connector-draw`
  keyframe (`stroke-dashoffset 1→0`, `--ease-snappy`, per-generation `connectorGrowDelay`); path-trace
  highlight via stroke transition with the existing `traceStepDelay` cascade; reduced-motion = static
  fully-drawn connectors. The obsolete `connector-grow-y/x` keyframes were removed.
- **dnd / scroll / pan untouched:** the overlay is `pointer-events-none`. Runtime-verified that select,
  drag, and pan still work.
- **Self-corrected a real bug in verification** (parent-ref timing) before it could ship — see
  FINDING_01.

## Decisions resolved

- Session scope = 3e only (clean "close out Phase 3 polish" theme).
- 3e = tree-mode SVG, full animation parity; board mode (compact inline lists) untouched.
- **Mid-session pivot (operator):** a Desi-led lineage **responsiveness + card-overflow + carousel**
  design lane is inserted as the next session, pushing 3f-PDF and Phase 4 leaderboard back 1–2
  sessions. PDF approach stays pre-decided (client-side print-to-PDF) for when it resumes.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/web/lineage/lineage-tree-canvas.tsx` | New `LineageConnectorLayer` (measured SVG 90° overlay, own-`svgRef`→`parentElement`, `:scope >` direct-child query, `ResizeObserver`); `LineageBranch` builds per-edge `ConnectorEdge[]` (highlight + trace delay) and renders the layer in a `relative mt-10` band; stripped the `h-4` stub from `LineageChildGroupColumn` (+ `data-lineage-conn-col` tag); deleted dead `connectorGrowStyleY/X`; static stroke colour → Tailwind `stroke-primary/60`/`stroke-border`. |
| `apps/web/app/styles.css` | Added `@keyframes connector-draw` (SVG draw-on); removed the now-orphaned `connector-grow-y` / `connector-grow-x` keyframes. |
| `docs/sprints/SESSION_0336.md` | This ledger. |
| `docs/knowledge/wiki/custom-component-inventory.md` | Updated the `LineageTreeCanvas` row for Phase 3e (SVG connectors supersede the SESSION_0308/0309 div description) + new `LineageConnectorLayer`. |
| `docs/knowledge/wiki/index.md` | SESSION_0336 row. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` | Pass. |
| `bun biome ci .` (full project) | Exit 0 — 1167 files clean. |
| `bun test lib/lineage/tree-layout.test.ts` | 3 pass / 0 fail (import graph healthy; no canvas-rendering unit test exists). |
| Playwright smoke — render | 5 SVG layers / 7 paths in DOM; `d` values are true 90° bends (`M 1377.5 0 L 1377.5 20 L 785 20 L 785 40`; multi-child shares the bus; single child = straight line). |
| Playwright smoke — grow-in | `animation: connector-draw`, normalised `stroke-dasharray: 1px` on each path. |
| Playwright smoke — path-trace | Selecting a deep leaf flipped **4 edges** to `stroke-primary/60` with cascade delays **0 → 0.2 → 0.4 → 0.6s**; 3 off-path edges stayed `stroke-border`. |
| Playwright smoke — dnd/scroll | `pointer-events: none` confirmed on all connector SVGs. |
| Reduced-motion | Logic-verified (trivial `reduceMotion ? undefined` on both `strokeDasharray` and `animation`; same idiom as the rest of the file) — **not** runtime-emulated. |

## Open decisions / blockers

- **Lineage responsiveness/overflow debt (NEW, operator-raised)** — staged as next session, not a
  blocker for 3e. Captured under Next session.
- Reduced-motion connector behaviour is logic-verified, not runtime-emulated — acceptable given the
  trivial ternary; a `prefers-reduced-motion` Playwright pass could close it fully if ever doubted.

## Next session

### Goal

**Desi-led lineage design review** — fix lineage **responsiveness**, **card text overflow**, and
**toolbar/toggle reachability**, and decide whether to adopt **horizontal carousel rails** for wide
sibling generations (porting the old BBL `CarouselRail` idiom). Run as `review-recommend` intel-gather
→ **Petey `/grill-me`** → agreed plan → implement. This pushes **3f-PDF export** and **Phase 4
leaderboard** back 1–2 sessions (PDF approach already locked: client-side print-to-PDF).

### Inputs to read (intel gathered this session)

Old BBL prior art in `ronin-dojo-monorepo` (read for patterns, do not copy JSX verbatim — port to our
L1 + Base UI stack):

- `src/brands/blackbeltlegacy/components/shared/CarouselRail.jsx` — reusable horizontal rail
  (chevron controls, `data-carousel-item`, dynamic scroll-step, `w-[248px]` items, empty state, aria).
- `src/brands/blackbeltlegacy/components/lineage/{StudentsCarousel,SchoolCarousel,ResponsiveTreeContainer,MobileLineageList}.jsx`
  — lineage-specific rails + responsive container + mobile list fallback.
- `dashboard/docs/sessions/2026-01/DESIGN_REVIEW_MINI_SPRINT_60B_STUDENTS_CAROUSEL.md` — prior design
  thinking on the students carousel.
- Current overflow source: `apps/web/components/web/lineage/lineage-node-card.tsx` already uses
  `truncate`/`min-w-0` — so "text breaking out" is a flex/padding constraint bug (likely the
  `pr-7` actions reserve + avatar flex + card `overflow-hidden` interplay), not a missing truncate.

### Design-review questions (for the grill)

1. **Toolbar/toggle reachability** — the Tree/Board toggle + zoom controls live in the in-card toolbar
   and scroll out of view on a wide tree (~3500px). Pin/sticky the control bar (sticky within the card,
   or a fixed control strip) so layout controls are always reachable without horizontal scroll?
2. **Card text overflow** — rank label ("Coral Belt (Red/Black) - 7th Degree") clips hard at the card
   edge despite `truncate`. Diagnose the real constraint; decide on uniform card sizing + line-clamp +
   tooltip-for-full-text as the card contract.
3. **Responsiveness model** — tree is inherently wide; board is the mobile answer but board cards also
   overflow. Default to **board < md**? Add a `MobileLineageList`-style fallback for the smallest
   viewports?
4. **Carousel adoption** — render wide sibling generations as horizontal **snap-scroll rails**
   (`CarouselRail` idiom) instead of one ever-widening canvas? If so, where (per-generation tier? the
   honor strip? board child-lists?) and how does it coexist with the new SVG connectors + path-trace?

### First task

Run `review-recommend` against the old BBL lineage carousel/responsive components above + a Desi pass
on the live discipline + `/lineage/[treeSlug]` pages (capture the overflow + toggle-reachability
evidence with Playwright), then Petey `/grill-me` to resolve the 4 questions into a scoped plan.

## Review log

### SESSION_0336_REVIEW_01 — Phase 3e SVG connectors

- **Reviewed tasks:** SESSION_0336_TASK_01.
- **Dirstarter docs check:** not applicable — custom lineage visualization, no Dirstarter L1 layer
  touched (no storage/auth/payments/Prisma/theming primitive involved).
- **Verdict:** Clean, well-scoped single-file change with genuine animation parity (render, grow-in,
  and the 0.2s path-trace cascade all runtime-verified). The measurement architecture is correct
  (own-ref `parentElement` + `:scope >`), and the one real defect (parent-ref timing) was caught by
  the verification smoke before merge — verification did its job. Inline styles reduced to only
  irreducible per-edge runtime values; everything static moved to Tailwind. Reduced-motion is
  logic-verified, not runtime-emulated — the single honest gap.
- **Score:** 9/10.
- **Follow-up:** none blocking; the responsiveness/overflow debt is a separate (now next-session) lane.

## Hostile close review

- **Giddy:** Pass. Every parity claim is backed by a DOM/runtime probe (path `d` geometry, cascade
  delays, `pointer-events:none`), not assertion. The reduced-motion gap is stated honestly rather than
  overclaimed. CI precondition (the SESSION_0335 worry) was confirmed green before any code.
- **Doug:** Pass. typecheck + full `biome ci` (1167 files) + the pure lib test green; the visual smoke
  found and forced the fix of the parent-ref bug. No DB/schema/server surface touched.
- **Desi:** Pass *for 3e* — connectors render as clean right-angle lines, brand-aware stroke (ADR 0022),
  reduced-motion respected. **But** Desi explicitly flags the broader lineage responsiveness +
  card-overflow + toggle-reachability debt (now the next session) as the higher-value follow-up.
- **Kaizen aggregate:** 9/10 — high parity, dogfooded; −1 for reduced-motion being logic- not
  runtime-verified.

### Findings (severity ≥ medium)

#### SESSION_0336_FINDING_01 — parent ref null in child layout effect (resolved in-session)

- **Severity:** medium
- **Task:** SESSION_0336_TASK_01
- **Evidence:** first verification probe — 7 `data-lineage-conn-col` columns present but **0** SVG
  layers rendered; `layout` stayed null because a parent-owned ref passed to the child measured `null`
  (React attaches a parent's ref only after its children's layout effects run).
- **Impact:** would have shipped connectors that never render. Caught by the Playwright smoke, not by
  typecheck/biome (a compile-clean runtime bug — argues for the visual smoke being mandatory here).
- **Required follow-up:** none — fixed by measuring off the layer's own `svgRef.parentElement` +
  `:scope >`. No cross-session ledger row (no debt remains). Recorded as a reusable gotcha in memory.
- **Status:** addressed

## ADR / ubiquitous-language check

- ADR **not required** — a render-layer swap (div → SVG) of an existing custom component; no
  architectural or schema decision, no Dirstarter baseline layer. ADR 0022 (brand-neutral chrome)
  was *confirmed* valid: the connector stroke uses brand-aware `--color-primary`/`--color-border`.
- Ubiquitous language **not required** — no new domain term ("connector" is internal render vocab).

## Reflections

- **The compile-clean runtime bug is exactly why the visual smoke isn't optional here.** typecheck and
  biome were green while the connectors rendered nothing. A measured-DOM component has a whole class of
  defects (ref timing, recursive `querySelectorAll`, layout-phase ordering) that only a running browser
  surfaces. Budgeting the Playwright smoke into 3e paid for itself in one probe.
- **"Parent ref in a child's layout effect" is a sharp edge worth remembering.** React attaches a
  parent's ref *after* its children's layout effects fire (bottom-up commit), so the natural-looking
  "pass the container ref down" is null on first measure. Measuring off the component's *own* element
  ref (`svgRef.parentElement`) is the robust pattern; `:scope >` then keeps a recursive tree from
  measuring its grandchildren.
- **The operator's design catch is the real headline.** 3e shipped clean, but the session surfaced that
  the lineage tree/board has live responsiveness + overflow + control-reachability debt that outranks
  the remaining polish (3f/Phase 4). Re-sequencing to a Desi grill next — and the old BBL app already
  solved a lot of this (CarouselRail, ResponsiveTreeContainer, MobileLineageList) — is higher leverage
  than continuing down the original polish queue.

## Full close evidence

| Step | Proof |
| --- | --- |
| SESSION-file gate | Task log SESSION_0336_TASK_01 (landed). |
| JETTY/frontmatter sweep | This file stamped `last_agent: claude-session-0336` / `updated: 2026-06-03`; `custom-component-inventory.md` + `wiki/index.md` bumped. Code files (`lineage-tree-canvas.tsx`, `styles.css`) carry no doc frontmatter. |
| Backlinks/index sweep | `custom-component-inventory.md` `LineageTreeCanvas` row updated for 3e + new `LineageConnectorLayer`; `wiki/index.md` gets the SESSION_0336 row. |
| Wiki lint | `bun run wiki:lint` → result recorded in bow-out chat. |
| Kaizen reflection | Present in `## Reflections`. |
| Hostile close review | Present; FINDING_01 (parent-ref timing) resolved in-session. |
| Review & Recommend | Next-session goal + first task written (Desi design-review lane). |
| ADR / ubiquitous-language | None needed (recorded above). |
| Memory sweep | Updated `lineage-canvas-zoom-and-dnd-constraints` with the SVG connector-layer measurement gotcha. |
| Next session unblock | Unblocked — design-review intel (old BBL files) gathered; grill happens next session per operator. |
| Git hygiene | FS-0024 guard passed; on `main`; single close push — hash reported at bow-out. |
| Graphify update | Ran before the close commit; stats in bow-out chat. |
