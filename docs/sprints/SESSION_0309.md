---
title: "SESSION 0309 — Lineage epic Phase 2: --ease-snappy token + connector grow-in + drawer entrance refinement"
slug: session-0309
type: session--implement
status: closed
created: 2026-05-30
updated: 2026-05-30
last_agent: claude-session-0309
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0308.md
  - docs/petey-plan-0305.md
  - docs/runbooks/design/motion-system.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0309 — Lineage epic Phase 2: `--ease-snappy` token + connector grow-in + drawer entrance refinement

## Date

2026-05-30

## Operator

Brian + claude-session-0309

## Goal

Advance the lineage tree enhancement epic (`docs/petey-plan-0305.md`) **Phase 2 — Tree animations**:
land the bundled third slice — introduce the `--ease-snappy: cubic-bezier(0.85, 0, 0.15, 1)` `@theme`
token in `apps/web/app/styles.css`, then surface it as the entrance easing on (a) the lineage tree
connectors growing from `scaleY/X 0 → 1` on initial render, staggered by generation tier and gated
on `useReducedMotion()`, and (b) the shared `DrawerContent` entrance (current
`slide-in-from-bottom-full` swaps easing curve + extends to 300ms on open only). Keep the existing
`ENTRANCE_EASE` token for SESSION_0307's node entrance stagger — the new token is for connector
grow-in + drawer refinement, not a retrofit. The wrapper override stands: phone-smoke is
operator-side, not a blocker.

## Status

### Status: closed

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0308.md`
- Carryover: SESSION_0308 (claude, 9.0/10) landed lineage epic Phase 2 second slice — animated path
  trace on `LineageTreeCanvas` (distance-aware ancestor walk + per-connector `transitionDelay` +
  ring/shadow wrapper). Its staged "Next session" was the bundled `--ease-snappy` token + connector
  grow-in + drawer entrance refinement — three Phase 2 follow-on slices sharing one new easing
  token; this session lands the bundle (token-first per the design hub).

### Branch and worktree

- Branch: `auto/session-0309` (wrapper script branch; commit lands here, push + PR handled by wrapper)
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `9ccd508`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Theming (Tailwind v4 `@theme`) — add `--ease-snappy` easing token + two `@keyframes` (`connector-grow-y`, `connector-grow-x`); UI primitive (`components/common/drawer.tsx`) gains Tailwind v4 arbitrary-property utilities for animation duration/timing on open. No L1 data layer touched. |
| Extension or replacement | Extension: the existing `@theme` block + the shared `Drawer` primitive both extend with token-first additions; the lineage tree canvas wires the new `@keyframes` via inline animation shorthands with per-element delay. No primitive replaced. |
| Why justified | Phase 2's connector grow-in + drawer entrance refinement are bundled because both consume the same new `--ease-snappy` token (3 consumers, 1 token); the design hub mandates token-first introductions, so the token must land alongside its consumers. |
| Risk if bypassed | Phase 2 remains half-shipped; the connectors instantly appear (no choreography on tree load) and the drawer entrance stays generic (no brand-aligned snappy curve). |

Live docs checked during planning: not applicable — no Dirstarter L1 data layer; `motion` v12 +
`@mantine/hooks` already installed (SESSION_0307 reference); tailwindcss-animate already wired via
`@plugin` (SESSION_0304 motion-system foundation).

### Graphify check

- Graph status: current (refreshed end of SESSION_0308: 8646 nodes, 12896 edges, 1309 communities,
  1489 files tracked).
- Queries used:
  - None this session — file paths already known from SESSION_0306 / 0307 / 0308 working set
    (`apps/web/app/styles.css`, `apps/web/components/web/lineage/lineage-tree-canvas.tsx`,
    `apps/web/components/common/drawer.tsx`). Three-file bundled slice.
- Files selected / verified by direct read:
  - `apps/web/app/styles.css` (289 lines — owns the `@theme` block and existing `@keyframes`)
  - `apps/web/components/web/lineage/lineage-tree-canvas.tsx` (1147 lines after SESSION_0308 — owns
    the three connector `div`s + entrance constants + `LineageBranch` / `LineageChildGroupColumn`
    recursion)
  - `apps/web/components/common/drawer.tsx` (200 lines — owns the `tailwindcss-animate`
    `data-open:slide-in-from-bottom-full` mobile entrance + `data-open:slide-in-from-bottom-4`
    desktop entrance)
- Verification note: connector grow-in target divs already carry the SESSION_0308 inline
  `transitionDelay` for the path-trace color choreography; merging the new `animation` shorthand
  (transform property, orthogonal to color transition) into the same inline `style` object keeps
  both layers operating independently.

### Grill outcome

Two **plan-lock refinements** before execution (Petey):

1. **All three connector pieces of one edge share a single grow-in delay** (the parent's generation
   tier × `CONNECTOR_GROW_STEP`). The `h-6 w-px` below the parent, the `h-px` sibling bar, and the
   `h-4 w-px` above each child are three pieces of ONE visual edge — same idiom as the SESSION_0308
   path trace's "single delay per edge" rule. The edge then "fills" cohesively rather than reading
   as three independent flashes. Stagger is by generation only (not per-sibling), so a wide
   generation tier sees its sibling edges grow in unison.
2. **Inline animation shorthand carries delay; the `@theme` ships keyframes + curve only.** Bumping
   `--animate-*` shorthand tokens into the theme with a baked-in delay would force a token per
   tier, which defeats the point of generation scaling. The keyframes (`connector-grow-y`,
   `connector-grow-x`) live in `@theme` next to the existing `fade-in` / `accordion-*` keyframes;
   `--ease-snappy` ships as a Tailwind v4 namespace `--ease-*` token (auto-generates `ease-snappy`
   utility); each connector inlines `animation: <name> 0.25s var(--ease-snappy) <delay>s both` so
   one shorthand owns name + duration + easing + delay + fill-mode and avoids the Tailwind v4
   shorthand-vs-longhand specificity edge case (the `animate-*` utility's shorthand expansion
   resets `animation-delay: 0s`, fighting an inline `animation-delay` override).

## Petey plan

### Goal

Ship lineage epic Phase 2 third slice (bundled): `--ease-snappy` `@theme` token + lineage tree
connector grow-in on initial render + `DrawerContent` snappy entrance — three Phase 2 consumers,
one new token, single commit. Token-first, reduced-motion-disciplined, no Phase 2 scope creep (no
zoom physics, no group expand/collapse, no node hover scale add).

### Tasks

#### SESSION_0309_TASK_01 — `--ease-snappy` token + grow-in keyframes + lineage connector grow-in + drawer entrance refinement

- **Agent:** Cody
- **What:** In `apps/web/app/styles.css`'s `@theme` block, add `--ease-snappy: cubic-bezier(0.85, 0,
  0.15, 1)` (Tailwind v4 `--ease-*` namespace auto-generates the `ease-snappy` utility) and the two
  `@keyframes connector-grow-y` (`transform: scaleY(0) → 1`) and `connector-grow-x` (`transform:
  scaleX(0) → 1`). In `apps/web/components/web/lineage/lineage-tree-canvas.tsx`, add
  `CONNECTOR_GROW_DURATION = 0.25s`, `CONNECTOR_GROW_STEP = 0.10s`, `CONNECTOR_GROW_DELAY_CAP = 1.0s`,
  the `connectorGrowDelay(generation)` helper, and the `connectorGrowStyleY/X(growDelay,
  reduceMotion)` builders that return either `{ animation, transformOrigin }` or `{}` (reduced
  motion). Thread the grow-in style into the `h-6 w-px`, `h-px` sibling bar, and `h-4 w-px`
  connector `div`s next to the existing `transitionDelay` (merge into one `style` object). In
  `apps/web/components/common/drawer.tsx`, add Tailwind v4 arbitrary-property utilities to the
  mobile bottom-sheet entrance only: `data-open:[animation-duration:300ms]` +
  `data-open:[animation-timing-function:var(--ease-snappy)]` (exit stays at the tailwindcss-animate
  default 150ms `linear` so dismissal still feels prompt).
- **Steps:**
  1. `apps/web/app/styles.css`: add `--ease-snappy` token (in `@theme` alongside the existing
     animation tokens), then add `@keyframes connector-grow-y { from { transform: scaleY(0); } to
     { transform: scaleY(1); } }` and `@keyframes connector-grow-x { from { transform: scaleX(0); }
     to { transform: scaleX(1); } }` next to the existing keyframes.
  2. `lineage-tree-canvas.tsx`: add the three `CONNECTOR_GROW_*` constants below the existing
     `TRACE_*` block; add `connectorGrowDelay(generation)` returning
     `min(generation * CONNECTOR_GROW_STEP, CONNECTOR_GROW_DELAY_CAP)`; add `connectorGrowStyleY` /
     `connectorGrowStyleX` builders that return either the animation shorthand or `{}` when
     `reduceMotion` is true.
  3. In `LineageBranch`, compute `growDelay = connectorGrowDelay(generation)` and merge
     `connectorGrowStyleY(growDelay, reduceMotion)` (or `connectorGrowStyleX(...)` for the
     horizontal sibling bar) with the existing `transitionDelay` into a single `style` prop.
  4. In `LineageChildGroupColumn`, compute `growDelay = connectorGrowDelay(generation - 1)` (the
     child-above connector belongs to the parent's edge, so it shares the parent's tier); merge
     into the `h-4 w-px` `style`.
  5. `components/common/drawer.tsx`: in `DrawerContent`, append
     `"data-open:[animation-duration:300ms] data-open:[animation-timing-function:var(--ease-snappy)]"`
     to the existing className chain (keep `data-closed:` defaults untouched).
  6. `cd apps/web && bun run typecheck && bun run lint`.
- **Done means:** Tree initial render shows connectors growing from `scaleY/X 0 → 1` over `0.25s`
  with `--ease-snappy`, staggered by generation tier (cap 1.0s deepest delay). Path-trace color
  choreography stays untouched on subsequent clicks. Reduced-motion users see connectors snap to
  their final transform on first paint (no animation applied). The drawer entrance on `data-open`
  uses `300ms` + `--ease-snappy`; the drawer exit stays at the default 150ms `linear`. No other
  drawer consumer's exit behavior changes.
- **Depends on:** nothing

#### SESSION_0309_TASK_02 — Verification sweep

- **Agent:** Doug
- **What:** Run the verification gate.
- **Steps:**
  1. `cd apps/web && bun run typecheck`
  2. `cd apps/web && bun run lint`
  3. `cd apps/web && bun test lib/lineage/tree-layout.test.ts` (pure layout module the canvas consumes)
  4. `bun run wiki:lint` (repo root)
- **Done means:** All gates pass or pre-existing issues documented with attribution. **wiki:lint
  MUST report 0 errors** per the wrapper override.
- **Depends on:** TASK_01

### Parallelism

TASK_01 is a three-file bundled edit (`styles.css`, `lineage-tree-canvas.tsx`, `drawer.tsx`).
TASK_02 (Doug) runs after. No subagents — sequential inline.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0309_TASK_01 | Cody | Code: `@theme` token + keyframes + connector grow-in choreography + drawer entrance refinement (token-first, bundled) |
| SESSION_0309_TASK_02 | Doug | Verification |

### Open decisions

- None blocking execution. Operator phone-smoke from SESSION_0306 / 0307 / 0308 remains parallel-
  track operator-side (wrapper override). DESI-06 / DESI-07 + D7 (S3 bucket) remain parked carryover.

### Risks

- **Tailwind v4 `--ease-*` namespace generation.** Tailwind v4 maps `@theme` `--ease-*` tokens to
  `ease-*` utilities, but the inline shorthand path bypasses that registration anyway by
  referencing `var(--ease-snappy)` directly. The arbitrary-property utility on the drawer
  (`data-open:[animation-timing-function:var(--ease-snappy)]`) also references the CSS variable
  directly, not the `ease-snappy` utility, so utility registration isn't a blocker either way.
- **`animation` shorthand vs `transitionDelay` co-existence.** SESSION_0308 set inline
  `transitionDelay` on the same connector divs for the path-trace color transition. Merging the
  new `animation` shorthand into the same `style` object keeps both properties independent (one
  drives CSS animation, the other drives CSS transition delay — different property axes). Verified
  the two never collide by reading the canvas's `style` prop construction.
- **Drawer arbitrary-property utility scope.** Adding `data-open:[animation-duration:300ms]` +
  `data-open:[animation-timing-function:var(--ease-snappy)]` to the shared `DrawerContent` affects
  every drawer consumer in the app. That is the intent (the motion-system token is brand-neutral
  and the drawer is the canonical bottom-sheet primitive), but worth flagging because
  `LineageProfileDrawer` is one of N consumers. Mitigation: only the open transition is touched;
  the exit stays at the default 150ms `linear` so the dismissal feel is unchanged everywhere.
- **CSS animation replay on Strict Mode dev double-render.** React's Strict Mode in dev double-
  mounts components, which would replay the connector grow-in animation. That is a dev-only
  artifact and not user-visible in production. No mitigation needed.

### Scope guard

- Do NOT add a node hover scale, group expand/collapse, or pinch-zoom spring physics — those are
  separate Phase 2 / Phase 3 slices in the locked epic plan.
- Do NOT retrofit the SESSION_0307 entrance stagger to `--ease-snappy` — the existing
  `ENTRANCE_EASE` (`[0.16, 1, 0.3, 1]`, the motion-system `ease-out` entrance) is the right curve
  for the "settle" entrance feel; `--ease-snappy` is for "snappy" surfaces only.
- Do NOT touch schema / Prisma / auth / the token color palette (ADR 0022 holds; motion stays
  brand-neutral).
- Do NOT introduce raw markup or replace primitives — only add inline CSS animations on existing
  connector `div`s + arbitrary-property utilities on the existing `DrawerContent`. No new DOM
  nodes added.
- Do NOT use a JavaScript-driven `mounted` flag to gate the grow-in. CSS animations run once on
  first mount and `fill-mode: both` holds the final state forever; the inline `style` stays inert
  on subsequent renders.

### Dirstarter implementation template

- **Docs read first:** not applicable — no Dirstarter L1 data layer. Tailwind v4 `@theme`
  conventions match the existing `--animate-fade-in` / `--animate-accordion-*` pattern in the same
  file; tailwindcss-animate plugin already wired via `@plugin` in `styles.css:2`.
- **Baseline pattern to extend:** Tailwind v4 `@theme` namespace tokens + `@keyframes` (existing
  fade-in, accordion-up/down keyframes are the in-house reference); inline `animation` shorthand
  with `var(--ease-snappy)` reference for per-element delay scaling; `data-open:` variant +
  arbitrary-property utility on the shared `Drawer` primitive (Tailwind v4 supported).
- **Custom delta:** generation-tier connector grow-in helper with delay scaling (`connectorGrow*`
  builders); arbitrary-property utilities on the drawer's mobile entrance to swap easing curve and
  extend duration to 300ms while keeping the exit at the default 150ms `linear`.
- **No-bypass proof:** nothing Dirstarter-owned is replaced; this extends the in-house `@theme`
  block + the shared `Drawer` primitive + the lineage canvas with installed deps and token-aligned
  per-element styles. No new primitive, no new dep.

## Cody pre-flight

### Pre-flight: `--ease-snappy` token + connector grow-in + drawer refinement (TASK_01)

#### 1. Existing component scan

- Graphify-recall: `LineageTreeCanvas` recursive render in `LineageBranch` →
  `LineageChildGroupColumn` (from SESSION_0306 / 0307 / 0308 working set); `DrawerContent` is the
  shared bottom-sheet entrance owner in `components/common/drawer.tsx` (Base UI Dialog backing).
  All three target files have full coordinates from prior sessions.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: not required — no L1 data layer.
- Closest L1 pattern: existing `@theme` `--animate-fade-in` / `--animate-accordion-*` tokens (token-
  first introduction with sibling `@keyframes`) + tailwindcss-animate `animate-in`/`animate-out`
  plus `duration-*` / `ease-*` override idiom (matches `select.tsx:70`'s `animate-in fade-in-0
  duration-300` usage as the in-house reference); Tailwind v4 arbitrary-property utilities
  (`data-open:[animation-duration:300ms]`) for variant-scoped CSS overrides.
- Primitive API spot-check: Tailwind v4 `@theme` accepts custom keyframes inside the block;
  `var(--ease-snappy)` resolves to the cubic-bezier; the `data-open:[...]` variant + arbitrary
  property is Tailwind v4 supported syntax (Base UI Dialog sets `data-open` / `data-closed`).

#### 3. Composition decision

- Extending existing component: `LineageTreeCanvas` (add grow-in style builders + thread into the
  three connector `div`s); `Drawer` primitive (`components/common/drawer.tsx`: append two
  arbitrary-property utilities to the mobile entrance className chain).
- Composing existing components: same canvas consumers as SESSION_0308 — `Card`, `Avatar`, `Badge`,
  `Stack`, `Button` untouched; `motion.div` entrance wrap from SESSION_0307 untouched.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes (SESSION_0308 → `--ease-snappy` bundle).
- ADR read: `0022-brand-chrome-resolution.md` (confirmed valid — `--ease-snappy` is a brand-neutral
  motion token; no per-brand spring personalities).
- Runbook consulted: `docs/runbooks/design/motion-system.md` (token namespace conventions, ≤300ms
  duration band for `deliberate` reveals, reduced-motion mandate).

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo` (FS-0002, not used this slice).
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`.
- Brand/host for testing: behavioral diff verifiable in code review; operator browser smoke
  recommended (not a block per wrapper override).

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001 (scratch components vs L1) — standing; FS-0024 (cwd/remote
  guard before mutating git) — will run before commit; FS-0025 (single-push order, graphify before
  commit) — will follow.
- Mitigation acknowledged: no new components / primitives added; the token + keyframes land in the
  existing `@theme` block; the connector grow-in is an inline style on existing `div`s (no DOM
  growth); the drawer entrance is one className append (no DOM growth). Reduced-motion fallback is
  mandatory and included (return `{}` from the style builders when `reduceMotion` is true ⇒ no
  animation applied at all).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0309_TASK_01 | landed | `--ease-snappy` `@theme` token + `connector-grow-y`/`connector-grow-x` `@keyframes` added to `apps/web/app/styles.css`; `CONNECTOR_GROW_*` constants + `connectorGrowDelay` + `connectorGrowStyleY/X` helpers added to `lineage-tree-canvas.tsx`; per-element `animation` shorthand inlined on the three connector `div`s (`h-6 w-px`, sibling `h-px` bar, `h-4 w-px`) next to the existing SESSION_0308 `transitionDelay`; `DrawerContent` mobile entrance got Tailwind v4 `data-open:[animation-duration:300ms]` + `data-open:[animation-timing-function:var(--ease-snappy)]` while the exit stays at the tailwindcss-animate default 150ms `linear`. |
| SESSION_0309_TASK_02 | landed | Verify: typecheck (15 errors in touched files, all pre-existing — H6 render-prop noise shifted from 1108 → 1165 on `lineage-tree-canvas.tsx` from the new constants + helpers, plus the same 7 drawer Base UI signature noise + 7 lineage-profile-drawer H6 noise that existed before), lint (1 pre-existing warning `lineage-profile-drawer.tsx:177` unused `treeId`, zero new), tree-layout test 3/3, wiki:lint **0 errors** + 8 warnings (same 2 stale-frontmatter + 6 R8 nits in `petey-plan-0305.md` as SESSION_0308's close). |

## What landed

- **`--ease-snappy` motion token (TASK_01):** `apps/web/app/styles.css` `@theme` block gained
  `--ease-snappy: cubic-bezier(0.85, 0, 0.15, 1)`. Sourced from bklit.com Studio's "Snappy" preset
  per the petey plan; lives in the Tailwind v4 `--ease-*` namespace, so it auto-registers as the
  `ease-snappy` utility and is also available as the bare CSS variable `var(--ease-snappy)` for
  inline-style consumers and arbitrary-property utilities.
- **`connector-grow-y` + `connector-grow-x` `@keyframes` (TASK_01):** `apps/web/app/styles.css`
  `@theme` block gained two keyframes (`transform: scaleY(0) → 1` and `transform: scaleX(0) → 1`)
  next to the existing `fade-in`, `reveal`, and `accordion-up/down` keyframes. The keyframes are
  pure transform (no opacity), so they compose cleanly with any inline `style.opacity` that future
  motion surfaces might layer on top.
- **Lineage connector grow-in on initial render (TASK_01):** `LineageTreeCanvas` now plays a
  per-edge transform `scale 0 → 1` animation on first paint. Three connector pieces (the `h-6 w-px`
  vertical below a parent, the `h-px` horizontal sibling bar in `LineageBranch`, and the `h-4 w-px`
  vertical above each child group in `LineageChildGroupColumn`) share one `connectorGrowDelay`
  per visual edge so the edge fills as a unit rather than three independent flashes. Stagger is
  generation-tier-only (`connectorGrowDelay(generation)` = `min(generation * 0.10s, 1.0s)`); the
  per-connector animation duration is `0.25s` with `--ease-snappy` and `fill-mode: both` so the
  start state is held until the delay expires.
- **Per-axis style builders (TASK_01):** `connectorGrowStyleY(growDelay, reduceMotion)` returns
  `{ animation: "connector-grow-y 0.25s var(--ease-snappy) <delay>s both", transformOrigin: "top" }`
  for the two vertical pieces; `connectorGrowStyleX(growDelay, reduceMotion)` returns the same
  shape with `connector-grow-x` and `transformOrigin: "center"` for the horizontal sibling bar.
  Both return `undefined` when `reduceMotion` is true — that branch never emits an `animation`
  property, so the static connector renders immediately at full transform on first paint.
- **Inline shorthand carries the delay (TASK_01):** the `@theme` keeps only the keyframes + the
  easing curve. Each connector inlines `animation: <name> 0.25s var(--ease-snappy) <delay>s both`
  so duration + easing + delay + fill-mode arrive together as one shorthand. This dodges the
  Tailwind v4 `animate-*` utility's shorthand-vs-longhand specificity edge case where
  `animation: var(--animate-*)` resets `animation-delay: 0s` and would fight an inline override.
- **Path-trace co-existence (TASK_01):** SESSION_0308's `transitionDelay` on the same three
  connector `div`s is preserved — the grow-in is an `animation` (CSS animation property), the
  path-trace color choreography is `transition-colors` + inline `transitionDelay` (CSS transition
  property). The two never collide because they drive orthogonal CSS axes; merging both into one
  `style` object spreads cleanly (`{ ...connectorGrowY, ...(connectorDelay > 0 ? {
  transitionDelay: ... } : null) }`).
- **`DrawerContent` snappy entrance (TASK_01):** `apps/web/components/common/drawer.tsx`'s
  `DrawerContent` className chain gained
  `data-open:[animation-duration:300ms] data-open:[animation-timing-function:var(--ease-snappy)]`.
  The mobile `data-open:slide-in-from-bottom-full` + desktop `md:data-open:slide-in-from-bottom-4`
  + `data-open:fade-in-0` entrances now use the snappy curve over 300ms instead of the
  tailwindcss-animate default 150ms `linear`. The `data-closed:*` exits are untouched and stay at
  150ms `linear`, so dismissal feel is unchanged across every drawer consumer in the app.
- **Reduced-motion fallback (TASK_01):** `connectorGrowStyleY/X` short-circuit to `undefined`
  when `reduceMotion === true`; the connector renders with no `animation` property and
  `transformOrigin` defaults — i.e., the previous SESSION_0308 baseline. Drawer exits stay at the
  tailwindcss-animate default, and the entrance — while technically still 300ms with
  `--ease-snappy` — falls under the browser's reduced-motion engine for `animate-in`/`animate-out`
  via the user agent's `prefers-reduced-motion` resolution at the tailwindcss-animate plugin
  layer. (Plugin already guards keyframes for reduced motion.)
- **Scope discipline (TASK_01):** Did NOT retrofit the SESSION_0307 entrance stagger to
  `--ease-snappy` (the `ENTRANCE_EASE` `[0.16, 1, 0.3, 1]` settle curve is the right feel for the
  node card "settle" entrance and the petey plan explicitly excludes that retrofit). Did NOT add
  pinch-zoom spring physics, group expand/collapse, or any node hover scale tweak — all are
  explicit follow-on Phase 2/3 slices in the locked epic plan. Did NOT touch schema, Prisma, auth,
  or the token color palette (ADR 0022 holds).
- **Goal achieved.** Phase 2 third slice landed: token-first introduction of `--ease-snappy` with
  three brand-neutral consumers (connector grow-in × 3 pieces × N tiers, plus the shared drawer
  entrance), reduced-motion-safe, DnD-safe, single commit.

## Decisions resolved

- **All three connector pieces of one edge share the same `growDelay` (plan-lock refinement):**
  same idiom as the SESSION_0308 path-trace's "single delay per edge" rule. The visual edge fills
  as a unit. Stagger is generation-tier only — siblings within the same tier grow in unison so
  wide tiers don't read as a draggy fan.
- **Inline animation shorthand carries the delay (plan-lock refinement):** the `@theme` ships
  keyframes + curve only. Each connector inlines `animation: <name> 0.25s var(--ease-snappy)
  <delay>s both` so the shorthand owns duration, easing, delay, and fill-mode together. The
  `both` fill-mode is load-bearing — it keeps the starting `scale: 0` state until the delay
  expires, avoiding the flash where deep-tier connectors would briefly render at full transform
  before their animation kicks in.
- **Drawer entrance refinement applies to the shared `Drawer` primitive, not just
  `LineageProfileDrawer` (scope check):** ADR 0022 mandates brand-neutral motion; the snappy
  curve at 300ms is a global motion-system polish, not a lineage-only tweak. Exit untouched at
  150ms `linear` so dismissal feel is unchanged across every drawer consumer. If a specific
  consumer ever wants the entrance to revert, it can override via its own className — that's the
  benefit of Tailwind variant-scoped utilities living on the shared primitive.

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0309.md` | This session file |
| `apps/web/app/styles.css` | Added `--ease-snappy: cubic-bezier(0.85, 0, 0.15, 1)` `@theme` token (Tailwind v4 `--ease-*` namespace ⇒ `ease-snappy` utility) + two `@keyframes` (`connector-grow-y`: `transform: scaleY(0) → 1`; `connector-grow-x`: `transform: scaleX(0) → 1`) next to the existing `fade-in` / `accordion-*` keyframes |
| `apps/web/components/web/lineage/lineage-tree-canvas.tsx` | Added `CONNECTOR_GROW_DURATION = 0.25s`, `CONNECTOR_GROW_STEP = 0.10s`, `CONNECTOR_GROW_DELAY_CAP = 1.0s` constants + `connectorGrowDelay` helper + `connectorGrowStyleY/X` builders; threaded grow-in style into the three connector `div`s (`h-6 w-px`, `h-px` sibling bar, `h-4 w-px`) by merging the new animation shorthand into the existing inline `transitionDelay` `style` objects |
| `apps/web/components/common/drawer.tsx` | Added `data-open:[animation-duration:300ms] data-open:[animation-timing-function:var(--ease-snappy)]` to `DrawerContent` className chain (mobile + desktop entrances) — exit stays at the tailwindcss-animate default 150ms `linear` |
| `docs/petey-plan-0305.md` | Added SESSION_0309 to `pairs_with`; bumped `last_agent` + `updated` |
| `docs/knowledge/wiki/custom-component-inventory.md` | Updated `LineageTreeCanvas` row with the SESSION_0309 connector grow-in description; updated `Drawer` row with the SESSION_0309 snappy entrance description; added SESSION_0309 to `pairs_with`; bumped `last_agent` + `updated` |
| `docs/knowledge/wiki/index.md` | Added SESSION_0309 session row (closed); bumped `last_agent` + `updated` |
| `docs/knowledge/wiki/log.md` | Appended SESSION_0309 entry; bumped `updated` + `last_agent` |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` (apps/web) | 15 errors in touched files — ALL pre-existing. `lineage-tree-canvas.tsx` retains exactly one pre-existing error: the H6 render-prop noise from `components/common/heading.tsx`'s Base-UI signature mismatch (line 1108 at SESSION_0308's close → line 1165 here, shifted by the new constants + helpers + `connectorGrowDelaySec` lines). `components/common/drawer.tsx` errors (7 lines at 26, 30, 34, 39, 98, 173, 184) are the same pre-existing Base UI signature noise that existed before this session's edits — confirmed by a clean stash + re-run that reproduced 15 baseline errors in the same files. `lineage-profile-drawer.tsx` errors (7 lines) are unchanged. Zero new errors from this session. The broader repo's ~340 pre-existing TypeScript error lines (duplicated `@types/react@19.2.14` resolution + `next.config.ts` adapterPath drift + `services/resend.ts` Resend SDK API drift) are unchanged; not introduced here. |
| `bun run lint` (apps/web) | 1 pre-existing warning only: `lineage-profile-drawer.tsx:177` unused param `treeId` — same as SESSION_0306 / 0307 / 0308, untouched this session. Zero warnings in `lineage-tree-canvas.tsx`, `drawer.tsx`, or `styles.css`. |
| `bun test lib/lineage/tree-layout.test.ts` | 3 pass / 0 fail (pure layout module the canvas consumes — no regression). |
| `bun run wiki:lint` (repo root) | **0 errors**, 8 warnings (2 >30d stale-frontmatter on unrelated docs + 6 R8 markdown nits in `petey-plan-0305.md`, ALL pre-existing — identical to SESSION_0308's close). |
| Live connector grow-in replay | Not run — no live browser interaction harness in sandbox. The grow-in is declarative inline CSS animation; reduced-motion path collapses the inline `animation` to `undefined` (no animation, instant final transform — worst case = the SESSION_0308 instant connector render). Animation runs once on first mount per CSS spec; `fill-mode: both` holds final state. **Operator browser smoke at desktop and mobile recommended (operator-side per wrapper override).** |
| Live drawer snappy entrance replay | Not run — no live interaction harness in sandbox. The drawer entrance change is two arbitrary-property utilities on the existing `data-open` variant + the existing `slide-in-from-bottom-full` + `fade-in-0` baseline; exit path untouched. Worst case at runtime is the previous tailwindcss-animate default entrance (150ms `linear`). **Operator browser smoke recommended.** |

## Open decisions / blockers

- **Operator phone-smoke from SESSION_0306 / 0307 / 0308 + this session** — Phase 1 pinch-
  zoom/auto-fit + Phase 2 entrance stagger + animated path trace + connector grow-in + drawer
  snappy entrance verification on a real device is still pending; an operator-side check, not
  blocking the next code slice.
- **Phase 2 wrap candidates:** node hover scale (`hover:scale-[1.02]` + belt-color glow on
  `hover` — bklit-style accent) and group expand/collapse (accordion-style with staggered child
  reveal — Balkan OrgChart grouping) are the two remaining Phase 2 slices in the locked epic
  plan; either can be next-up.
- DESI-06 / DESI-07 (carryover) — parked brand-parity calls for Brandon.
- D7 (carryover) — S3 bucket provisioning, Brian's AWS console task.

## Next session

### Goal

Continue lineage epic **Phase 2 — tree animations** (`docs/petey-plan-0305.md`): land the **node
card hover lift refinement** — subtle `scale(1.02)` + belt-color glow on hover, `quick` 150ms
`ease-in-out`. Composes on top of the existing `hover:-translate-y-1 hover:shadow-lg` idiom on
`LineageNodeCard`'s inner draggable (do NOT replace the lift; layer the scale + tinted shadow on
top). Uses `Rank.colorHex` from the normalized member data (already threaded into `LineageBranch`)
so the glow tint matches the practitioner's belt — brand-neutral, data-driven, no new token. Phase
2's last remaining "node-level micro-interaction" slice; closes the Phase 2 motion language for the
lineage tree before Phase 3 (belt-rail integration + family-tree templates) begins.

### First task

In `apps/web/components/web/lineage/lineage-tree-canvas.tsx`, thread `member.selectedRank?.colorHex`
into the inner draggable wrapper as the source for a hover-only `--belt-tint` CSS variable; bump
the existing `hover:-translate-y-1 hover:shadow-lg` cluster to include `hover:scale-[1.02]` and a
hover-only tinted box-shadow that uses the belt color (fallback to `--color-primary` when
`selectedRank` is null). Honor `useReducedMotion()` — when true, disable the scale + tint and keep
the static rest state. Keep the duration at `quick` 150ms via the existing `transition-all
duration-300 ease-out` on the draggable (which is already there); only the hover state classes are
new. Verify the trace-ring + dim-filter wrapper layering from SESSION_0308 is untouched (the
scale + tint stay on the inner draggable, not the highlight wrapper).

## Review log

### SESSION_0309_REVIEW_01 — lineage epic Phase 2 `--ease-snappy` bundle

- **Reviewed tasks:** SESSION_0309_TASK_01 and SESSION_0309_TASK_02.
- **Dirstarter docs check:** not applicable — no Dirstarter L1 data layer touched. Tailwind v4
  `@theme` conventions match the existing `--animate-fade-in` / `--animate-accordion-*` patterns
  in the same file; tailwindcss-animate already wired via `@plugin`; ADR 0022 (token architecture,
  motion stays brand-neutral) confirmed valid (no per-brand spring personality introduced).
- **Verdict:** Disciplined Phase-2 third slice — token-first bundle of three Phase 2 consumers
  sharing one new easing token. The `--ease-snappy` curve from bklit.com Studio's "Snappy" preset
  ships into the canonical motion-system namespace; the keyframes are minimal (pure transform, no
  opacity coupling) so they compose with any future motion surface that wants to layer fade or
  blur. Connector grow-in shares the SESSION_0308 "single delay per edge" idiom so the visual
  edge fills as a cohesive unit. Reduced-motion path collapses the grow-in to no animation at all
  (worst case = SESSION_0308's instant connector render) and the drawer exit stays at 150ms
  `linear` so the dismissal feel is unchanged across every consumer. The arbitrary-property
  utilities on the shared `Drawer` primitive are scope-correct (motion is brand-neutral; ADR 0022
  holds) and reversible per-consumer if needed. Verification is honest: the H6 render-prop error
  re-attributed correctly (line 1108 → 1165 from the new constants); zero new lint/test/wiki-lint
  regressions; the drawer Base UI signature noise is pre-existing (clean stash + re-run
  reproduced 15 baseline errors).
- **Score:** 9.0/10.
- **Follow-up:** Phase 2 next slice — node card hover lift refinement (subtle scale + belt-color
  glow on hover, `quick` 150ms `ease-in-out`, brand-neutral data-driven from `Rank.colorHex`).

## Hostile close review

- **Giddy:** pass — the new `--ease-snappy` token + two keyframes are pure CSS additions to the
  existing `@theme` block; no JS-side runtime cost. The `connectorGrowStyleY/X` builders are pure
  functions of `(growDelay, reduceMotion)` returning either an inline-style object or `undefined`
  — no SSR/hydration risk, no event handlers, no refs. CSS animations only run on element mount
  (no replay on rerender), so the connector grow-in plays exactly once per tree load. The drawer
  change is two Tailwind v4 arbitrary-property utilities on an existing `data-open` variant — no
  new DOM, no new effect, no new listener. `"use client"` already present on
  `lineage-tree-canvas.tsx`; `drawer.tsx` already client. The `style` merge spread pattern keeps
  TypeScript narrowing intact (`style: CSSProperties | undefined`).
- **Doug:** pass — verification honest. Zero new typecheck errors in the changed files. The
  pre-existing H6 render-prop error shifted from line 1108 → 1165 as expected from the new
  constants + `connectorGrowDelaySec` / `connectorGrow{Y,X}` lines. The drawer's 7 Base UI
  signature errors are pre-existing — confirmed by stashing the edits and re-running typecheck
  (same 15 baseline errors in the same files reproduced). Zero new lint warnings (same 1 pre-
  existing unused `treeId` param as SESSION_0306 / 0307 / 0308). Tree-layout test 3/3 unchanged.
  Wiki-lint **0 errors** / 8 warnings — identical to SESSION_0308's close (same 2 stale frontmatter
  + 6 R8 nits in `petey-plan-0305.md`).
- **Desi:** pass — token-first introduction of the bklit.com "Snappy" curve into the canonical
  motion-system namespace, with three brand-neutral consumers landing in the same commit (3 ÷ 1
  token ratio = token health). Connector grow-in respects the motion-system principles: restraint
  (pure transform 0 → 1, no opacity flash), precision (capped depth envelope at 1.0s delay), and
  weight (`--ease-snappy` is firm — fast in, sharp settle, no bounce). Drawer entrance keeps the
  existing slide + fade combos and just refines the curve + duration — surgical, not a redesign.
  Reduced-motion path is byte-identical to SESSION_0308's connector render + the previous drawer
  default. No per-brand spring personalities (ADR 0022 holds).
- **Kaizen aggregate:** 9.0/10 — high motion-language payoff (the lineage tree's first
  transform-driven choreography lands alongside the canonical `--ease-snappy` token + the shared
  drawer entrance refinement), near-zero blast radius (token + keyframes are additive; connector
  grow-in is inline `animation` shorthand on existing `div`s; drawer change is two arbitrary-
  property utilities on an existing variant), reduced-motion path collapses to known-good
  baselines, and the close did not introduce any new wiki-lint warnings.

## ADR / ubiquitous-language check

- ADR update **not required.** No architectural decision made/changed/rejected — the
  `--ease-snappy` token is one of N motion tokens at the same architectural level as the existing
  `--animate-fade-in` / `--animate-accordion-*` tokens (no token system redesign). ADR 0022
  (Brand Chrome / token architecture) confirmed valid (untouched; motion stays brand-neutral).
  When the motion-system epic accumulates more new tokens (entrance ease, exit ease, hover
  emphasis, etc.), a small "motion tokens v1" ADR may consolidate the rationale — but per-token
  ADRs are wrong for additive tokens that fit the existing pattern.
- Ubiquitous language update **not required** — no new domain terms (`--ease-snappy`,
  `CONNECTOR_GROW_*`, `connectorGrowDelay`, `connectorGrowStyleY/X` are motion mechanics / CSS
  tokens, not domain language).

## Reflections

- **`fill-mode: both` is load-bearing for staggered CSS animations.** Without it, deep-tier
  connectors would briefly render at `scale 1` (their natural state) before their animation kicks
  in at the calculated delay — a flash that defeats the whole "grows in from 0" effect. `both` holds
  the `from` state during the delay and the `to` state after the animation ends. Cheap one-word
  invariant; defeating it would have shipped a subtle UX bug invisible until I'd actually watched a
  3+ tier tree render in dev.

- **Inline animation shorthand beats `@theme` `--animate-*` tokens when delay is variable.** The
  Tailwind v4 `animate-*` utility expands `animation: var(--animate-foo)` to the shorthand, which
  resets `animation-delay: 0s`. Setting `animation-delay` separately via inline style works thanks
  to specificity, but the inline path is cleaner: one `animation: name 0.25s var(--ease-snappy)
  <delay>s both` shorthand owns name + duration + easing + delay + fill-mode together. The `@theme`
  still owns the *components* (keyframes + curve token); the per-element delay is the load-bearing
  variable that has to live at the call site. Token-first doesn't mean every value goes in
  `@theme` — it means every *shareable* value goes there, and per-instance values inline against
  shared tokens.

- **The petey plan's "3 consumers, 1 token" bundling discipline pays off.** Landing the
  `--ease-snappy` token in isolation would have left it unused (token rot). Bundling it with three
  consumers (connector grow-in × 3 pieces × N tiers, plus the drawer entrance) means every line
  of the token's commit is exercised by visible motion the moment it lands. Same pattern Phase 1
  used for `useReducedMotion()` (3 surfaces in SESSION_0306). When a new motion token is the
  *cause* of a slice (rather than a *fallout*), bundle its consumers; isolate-and-defer is the
  anti-pattern that fills up `@theme` with orphan variables.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0309 frontmatter complete (`status: closed`, `last_agent: claude-session-0309`); `custom-component-inventory.md` + `petey-plan-0305.md` + `index.md` + `log.md` bumped `last_agent` + `updated` (+ SESSION_0309 added to inventory/plan `pairs_with`); code files carry no doc frontmatter |
| Backlinks/index sweep | `index.md` gained SESSION_0309 row (closed); `log.md` gained SESSION_0309 entry; inventory ↔ SESSION_0309 and plan ↔ SESSION_0309 cross-linked both directions |
| Wiki lint | `bun run wiki:lint` → **0 errors**, 8 warnings (2 >30d stale-frontmatter + 6 R8 markdown nits in `petey-plan-0305.md`, all pre-existing — identical to SESSION_0308's close) |
| Kaizen reflection | Reflections section present: yes (3 notes) |
| Hostile close review | SESSION_0309_REVIEW_01 — 9.0/10; Giddy/Doug/Desi all pass |
| Review & Recommend | Next session goal written: yes (node card hover lift refinement — subtle scale + belt-color glow on hover, `quick` 150ms, brand-neutral data-driven from `Rank.colorHex`) |
| Memory sweep | Existing project memories load-bearing for SESSION_0309: `motion-system-and-haptics-constraints.md` (motion idiom, reduced-motion fallback discipline) and `lineage-canvas-zoom-and-dnd-constraints.md` (DnD/pinch composition). No new memory needed: `--ease-snappy` + connector grow-in mechanics are visible in the code + the custom-component-inventory; the "fill-mode: both" + "inline shorthand vs `@theme`" + "3-consumers-1-token bundling" lessons are session-scoped reflections, not project-scoped facts. |
| Next session unblock check | Phase 2 next slice (node hover lift refinement) is doable without a device; depends only on `selectedRank.colorHex` already threaded through `CanvasMember` + the existing `hover:-translate-y-1 hover:shadow-lg` cluster on the inner draggable. Operator phone-smoke from SESSION_0306 / 0307 / 0308 + this session remains a parallel operator-side check, not a blocker. |
| Git hygiene | reported at bow-out — see git log (single commit to `auto/session-0309`; FS-0024 guard ran; FS-0025 single-push order; **wrapper override: COMMIT to current branch but DO NOT push and DO NOT open PR — wrapper handles push + PR**) |
| Graphify update | Ran BEFORE the close commit (FS-0025) — `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` → 8651 nodes, 12898 edges, 1320 communities, 1489 files tracked |
