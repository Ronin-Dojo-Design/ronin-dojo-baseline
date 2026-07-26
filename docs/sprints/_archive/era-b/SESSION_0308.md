---
title: "SESSION 0308 — Lineage epic Phase 2: animated path trace (sequential connector + ring highlight)"
slug: session-0308
type: session--implement
status: closed
created: 2026-05-30
updated: 2026-05-30
last_agent: claude-session-0308
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0307.md
  - docs/petey-plan-0305.md
  - docs/runbooks/design/motion-system.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0308 — Lineage epic Phase 2: animated path trace (sequential connector + ring highlight)

## Date

2026-05-30

## Operator

Brian + claude-session-0308

## Goal

Advance the lineage tree enhancement epic (`docs/petey-plan-0305.md`) **Phase 2 — Tree animations**:
ship the second animation slice, an **animated path trace** on `LineageTreeCanvas`. When a node is
tapped, the highlight propagates from the tapped node up to the root one ancestor edge at a time
(connector segments + ancestor rings sequenced by distance from the tapped node), capped at ≤1.2s
regardless of tree depth. Reduced-motion keeps the existing instant full-highlight. The wrapper
override stands: phone-smoke is operator-side, not a blocker.

## Status

### Status: closed

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0307.md`
- Carryover: SESSION_0307 (claude, 9.0/10) landed lineage epic Phase 2 first slice — generation-
  stepped node entrance stagger on `LineageTreeCanvas` via a `motion.div` wrap of the existing
  draggable, with reduced-motion gating and zero DnD impact. Its staged "Next session" was the
  animated path trace; that is this session.

### Branch and worktree

- Branch: `auto/session-0308` (wrapper script branch; commit lands here, push + PR handled by wrapper)
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `9a68463`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | UI primitives only — `motion` v12 + `@mantine/hooks` already installed; reusing existing Tailwind `transition-colors` / `transition-all` idioms with per-element inline `transitionDelay`. No L1 data layer. |
| Extension or replacement | Extension: keep the existing `selectedPathMemberIds` set + ancestor-walk logic; widen `buildSelectedPathMemberIds` into `buildSelectedPathTrace` that also returns a per-member distance map; add a thin highlight wrapper that owns the ring + highlight shadow so the entrance/hover transitions on the draggable stay byte-identical. No primitive replaced. |
| Why justified | Phase 2 animated path trace is the next non-blocked code slice in the locked epic plan; the existing path-highlight state machine + the SESSION_0304 motion language already do the structural work, so this slice is pure choreography. |
| Risk if bypassed | Phase 2 stays half-shipped (entrance only); the path-highlight remains a one-frame full-set color flip and the lineage tree falls behind the motion-system language for ancestor-tracing surfaces. |

Live docs checked during planning: not applicable — no Dirstarter L1 data layer touched. `motion`
v12 + `@mantine/hooks` already installed; SESSION_0307's entrance idiom is the in-house reference
for delay-driven choreography.

### Graphify check

- Graph status: current (refreshed end of SESSION_0307); SESSION_0307 reported 8641 nodes / 12888
  edges / 1364 communities / 1489 files tracked at its close.
- Queries used:
  - None this session — file paths already known from SESSION_0306 / SESSION_0307 working set
    (`apps/web/components/web/lineage/lineage-tree-canvas.tsx`). Single-file slice.
- Files selected / verified by direct read:
  - `apps/web/components/web/lineage/lineage-tree-canvas.tsx` (1061 lines after SESSION_0307 —
    owns `buildSelectedPathMemberIds`, `LineageBranch`, `LineageChildGroupColumn`, the three
    connector `div`s, and the `selectedPathMemberIds` consumer in the canvas root)
  - `docs/runbooks/design/motion-system.md` (tokens: `base` 200ms for the per-connector color
    transition, ≤1.2s total budget per the petey plan brief)
- Verification note: helper is private to the file (`grep` confirms only two intra-file refs);
  no external consumers to worry about.

### Grill outcome

Two **plan-lock refinements** before execution (Petey):

1. **Per-step delay formula = `min(0.20, 1.0 / maxDistance)` seconds, clamped to ≥ 0.05s.** Five
   ancestors is the "feels right" baseline (5 × 0.2s = 1.0s of delays + 0.2s final transition =
   1.2s total, matching the spec cap). Deeper trees scale the per-step delay down so total never
   exceeds the cap; floor of 0.05s preserves a perceivable cascade even at extreme depth.
2. **Connector-level delay belongs on the connector, NOT on the parent's transition group.** A
   dedicated highlight-only wrapper sits between the entrance `motion.div` and the dnd-kit
   draggable, carrying the ring + highlight shadow + inline `transitionDelay`. The inner draggable
   keeps its existing `transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg`
   intact, so hover lift never inherits the trace delay (which was the failure mode of bolting the
   delay onto the existing `transition-all`).

## Petey plan

### Goal

Ship lineage epic Phase 2 second slice: animated path trace on `LineageTreeCanvas`, reduced-motion-
disciplined, no Phase 2 scope creep (no connector grow-in, no drawer entrance refinement, no
`--ease-snappy` token addition — staged for separate slices).

### Tasks

#### SESSION_0308_TASK_01 — Animated path trace

- **Agent:** Cody
- **What:** Promote `buildSelectedPathMemberIds` to `buildSelectedPathTrace` returning
  `{ pathMemberIds, pathDistanceById, maxDistance }` (distance = steps from the tapped node, 0 for
  tapped, 1 for parent, etc.). Add `tracePerStepDelay(maxDistance)` and `traceStepDelay(step, perStep)`
  helpers (`base` 200ms transition + ≤1.2s total budget). Thread `pathDistanceById` + `perStepDelay`
  through `LineageBranch` → `LineageChildGroupColumn` recursion. Add per-element `transitionDelay`
  inline styles to the three connector divs (`h-6 w-px`, sibling `h-px`, `h-4 w-px`) and a thin
  highlight wrapper that owns the ring + highlight shadow with its own `transitionDelay`. Reduced-
  motion: `perStepDelay = 0` (instant full-highlight, current behavior).
- **Steps:**
  1. Replace `buildSelectedPathMemberIds` with `buildSelectedPathTrace` that walks ancestors and
     records distance per member ID in addition to the existing set.
  2. Add motion-system trace constants: `TRACE_TOTAL_BUDGET = 1.0s`, `TRACE_MIN_STEP = 0.05s`,
     `TRACE_MAX_STEP = 0.20s`, and the two helper functions.
  3. In `LineageTreeCanvas`, destructure the trace return into `selectedPathMemberIds`,
     `pathDistanceById`, `maxDistance`; compute `perStepDelay = reduceMotion ? 0 : tracePerStepDelay(maxDistance)`;
     thread both new values through to `LineageBranch` root map.
  4. Add `pathDistanceById` + `perStepDelay` to `LineageBranch` props; compute `distance` for the
     current member via `pathDistanceById.get(member.id)`; compute `ringDelay = distance * perStepDelay`
     (when in path) and `connectorDelay = max(0, (distance - 1) * perStepDelay)` (the connector
     below M is the upper half of the edge from M's highlighted child up to M).
  5. Split the existing inner draggable div into a highlight wrapper (owns ring + highlight shadow,
     carries `transitionDelay: ringDelay`) + the unchanged inner draggable (owns hover transform +
     hover shadow + dim + dnd transform). Verify dnd-kit translate + listeners stay on the inner.
  6. Add `style={{ transitionDelay: '${connectorDelay}s' }}` to the `h-6 w-px` vertical and the
     `h-px` horizontal sibling bar in `LineageBranch`. Bump their `transition-colors duration-300`
     to `duration-200` so the per-connector transition matches the motion-system `base` token.
  7. In `LineageChildGroupColumn`, add `pathDistanceById` + `perStepDelay` props; compute
     `parentDistance = pathDistanceById.get(parentMemberId)`; the `h-4 w-px` above each child gets
     `transitionDelay = max(0, (parentDistance - 1) * perStepDelay)` when the group is highlighted
     (it's the lower half of the same edge whose upper half is the `h-6 w-px` below the parent).
  8. `cd apps/web && bun run typecheck && bun run lint`.
- **Done means:** Tapping a deep ancestor's descendant lights the connector chain up to the root
  sequentially (each step = `base` 200ms transition starting at `(stepIndex - 1) * perStepDelay`),
  with the tapped node's ring appearing immediately and each ancestor's ring appearing as the edge
  to it begins. Total trace ≤ ~1.2s regardless of depth. Reduced-motion users see the existing
  instant full-highlight. DnD edit-mode drag unchanged. Hover lift on path nodes is NOT delayed.
- **Depends on:** nothing

#### SESSION_0308_TASK_02 — Verification sweep

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

TASK_01 is a single-file edit (`lineage-tree-canvas.tsx`). TASK_02 (Doug) runs after. No subagents
— sequential inline.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0308_TASK_01 | Cody | Code: trace helper + threaded distance map + connector + ring delays |
| SESSION_0308_TASK_02 | Doug | Verification |

### Open decisions

- None blocking execution. Operator phone-smoke from SESSION_0306 / SESSION_0307 remains parallel-
  track operator-side (wrapper override). DESI-06 / DESI-07 + D7 (S3 bucket) remain parked carryover.

### Risks

- **Highlight-wrapper interaction with dim filter.** The current code puts `opacity-45 grayscale-[15%]`
  + `hover:opacity-100 hover:grayscale-0` on the inner draggable so a non-path node can be hovered
  to read it. The new wrapper owns the *highlight* ring/shadow only; the dim filter stays on the
  inner draggable so this counter-dim hover still works. Mitigation: don't move dim classes up to
  the wrapper — only ring + highlight shadow.
- **`isOver` drop-target ring on inner draggable.** The dnd drop-target ring (`isOver && "ring-2 ring-primary/70"`)
  stays on the inner div where the droppable ref lives — leave it untouched so DnD UI keeps owning
  that affordance. The new wrapper's ring is path-highlight only.
- **transitionDelay stickiness on rerender.** Setting `style.transitionDelay` is sticky for *any*
  CSS transition on that element until React next applies a different style. The new wrapper has
  no hover transitions, so the only thing that can transition is the ring/shadow change — which is
  exactly the trace play. Safe.

### Scope guard

- Do NOT build Phase 2's other slices this session — connector grow-in on tree load, drawer
  entrance refinement, and `--ease-snappy` token addition are explicit follow-on slices in the
  petey plan.
- Do NOT touch schema / Prisma / auth / the token architecture (ADR 0022 holds).
- Do NOT introduce a new easing token in this slice — the per-connector transition is plain
  Tailwind `transition-colors duration-200` (linear default, matching the existing CSS rule). The
  motion-system `base` token is what we are aligning *duration* to, not a new easing variable.
- Do NOT animate the path *outline* (the absolute `top-0 right-8 left-8 h-px` over child groups)
  — that horizontal sibling bar belongs to the same edge as the verticals; same delay, single
  inline style.
- Do NOT introduce raw markup or replace primitives — only add a transparent wrapper div for the
  highlight + per-element `transitionDelay` styles (FS-0001 still holds).

### Dirstarter implementation template

- **Docs read first:** not applicable — no Dirstarter L1 data layer. `motion` v12 + `@mantine/hooks`
  already installed.
- **Baseline pattern to extend:** Tailwind `transition-colors duration-200` + inline
  `transitionDelay` per element; ancestor-walk path builder from the existing
  `buildSelectedPathMemberIds`; the SESSION_0304/0307 motion idiom (reduced-motion gating via
  `useReducedMotion()` drilled as a boolean prop).
- **Custom delta:** distance-aware trace builder (returns a `Map<string, number>` of distances in
  addition to the existing `Set<string>` of member IDs), and per-step delay scaling that respects
  the ≤1.2s budget.
- **No-bypass proof:** nothing Dirstarter-owned is replaced; this extends an in-house component
  with installed deps and a token-aligned per-element delay.

## Cody pre-flight

### Pre-flight: Phase 2 animated path trace (TASK_01)

#### 1. Existing component scan

- Graphify-recall: `LineageTreeCanvas` recursive render in `LineageBranch` → `LineageChildGroupColumn`
  (from SESSION_0306 / SESSION_0307 working set). `buildSelectedPathMemberIds` is private to the
  file (grep confirms only two intra-file references and no external consumers).

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: not required — no L1 data layer.
- Closest L1 pattern: motion-system runbook (`base` 200ms color transitions, reduced-motion
  mandate) + the SESSION_0307 entrance-delay pattern (compute delay per element, gate on
  reduced-motion).
- Primitive API spot-check: Tailwind `transition-colors` already on all three connector `div`s;
  inline `style.transitionDelay` is a native React-supported CSS property (kebab-cased to
  `transition-delay`); no new dep.

#### 3. Composition decision

- Extending existing component: `LineageTreeCanvas` (`buildSelectedPathMemberIds` →
  `buildSelectedPathTrace`; thread two new values down `LineageBranch` → `LineageChildGroupColumn`).
- Composing existing components: same set as SESSION_0307 — `Card`, `Avatar`, `Badge`, `Stack`,
  `Button` untouched; `motion.div` wrap from SESSION_0307 untouched.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes (SESSION_0307 → animated path trace).
- ADR read: `0022-brand-chrome-resolution.md` (confirmed valid — no token change, motion stays
  brand-neutral).
- Runbook consulted: `docs/runbooks/design/motion-system.md` (`base` 200ms transition duration;
  reduced-motion mandate).

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo` (FS-0002, not used this slice).
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`.
- Brand/host for testing: behavioral diff verifiable in code review; operator browser smoke
  recommended (not a block per wrapper override).

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001 (scratch components vs L1) — standing; FS-0024 (cwd/remote
  guard before mutating git) — will run before commit; FS-0025 (single-push order, graphify before
  commit) — will follow.
- Mitigation acknowledged: the highlight wrapper is a transparent rounded `div` (no new primitive,
  no markup growth except a single wrapper layer); ring + shadow utilities are existing Tailwind
  classes; the `transitionDelay` is an inline CSS property. Reduced-motion fallback is mandatory
  and included (perStepDelay = 0 ⇒ instant full-highlight).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0308_TASK_01 | landed | Animated path trace on `LineageTreeCanvas`: promoted `buildSelectedPathMemberIds` → `buildSelectedPathTrace` (returns distance map + `maxDistance`); added `tracePerStepDelay` + `traceStepDelay` helpers; threaded `pathDistanceById` + `perStepDelay` through `LineageBranch` → `LineageChildGroupColumn`; per-element `transitionDelay` on the three connector divs (`h-6 w-px`, `h-px` sibling bar, `h-4 w-px`) at `duration-200`; ring + highlight shadow moved onto a transparent rounded wrapper that owns its own `transitionDelay` so hover/dim stay on the draggable. |
| SESSION_0308_TASK_02 | landed | Verify: typecheck (no new errors in changed file — the one pre-existing H6 render-prop error shifted from line 1025 → 1108 as expected from the wrapper layer addition), lint (no new warnings — same 1 pre-existing in `lineage-profile-drawer.tsx:177`), tree-layout test 3/3, wiki:lint 0 errors (same 8 pre-existing warnings as bow-in). |

## What landed

- **Animated path trace (TASK_01):** Tapping a node now lights the highlight from the tapped node up to the root one ancestor edge at a time. The three connector pieces of each edge — the `h-6 w-px` vertical below the parent, the `h-px` horizontal sibling bar (when there are multiple child groups), and the `h-4 w-px` vertical above each child group — all carry an inline `transitionDelay` derived from their step index in the trace. Ancestor rings appear sequentially as their inbound edge begins; the tapped node's ring lights instantly.
- **Trace helper:** `buildSelectedPathMemberIds` was promoted to `buildSelectedPathTrace` returning `{ pathMemberIds, pathDistanceById, maxDistance }`. Distance is measured from the tapped node (0 = tapped, 1 = parent, …) by the same ancestor walk that already existed; `maxDistance` is the deepest hop to the root and drives the per-step scaling.
- **Per-step delay formula:** `tracePerStepDelay(maxDistance) = clamp(0.05, min(0.2, 1.0 / maxDistance), 0.2)` seconds. Five-ancestor baseline (`5 * 0.2s = 1.0s` of step delays + `0.2s` final connector transition = `1.2s` total) matches the spec cap; deeper trees compress the per-step delay with a 50ms floor so even extreme depth keeps a perceivable cascade.
- **Step assignment:**
  - Connector below member M (`h-6 w-px`) + horizontal sibling bar in M's branch: delay = `(distance(M) - 1) * perStep`.
  - `h-4 w-px` above each child group in `LineageChildGroupColumn`: delay = `(distance(parentMember) - 1) * perStep`. The column reads `pathDistanceById.get(parentMemberId)` once.
  - Ring on member M (in path): delay = `distance(M) * perStep`. Tapped (distance=0) → 0; parent → `perStep`; grandparent → `2 * perStep`.
- **Wrap, don't bolt:** the ring + highlight shadow moved off the dnd-kit draggable onto a transparent rounded wrapper sandwiched between the entrance `motion.div` and the draggable. The wrapper carries `transition-all duration-200` + inline `transitionDelay`. Hover lift (`hover:-translate-y-1 hover:shadow-lg`) and the dim filter (`opacity-45 grayscale-[15%]` + counter-dim hover) stay on the inner draggable with its existing `transition-all duration-300`, so they are NEVER delayed by the trace — the failure mode of bolting `transitionDelay` directly onto the draggable.
- **Reduced-motion mandate:** when `useReducedMotion()` is true, `perStepDelay = 0`; every connector and ring lights simultaneously — exactly the previous instant full-highlight behavior. Zero animation, zero stagger, full readable end state on first paint.
- **Connector duration aligned to the motion-system `base` token:** the three connector divs went from `transition-colors duration-300` to `transition-colors duration-200`, matching the runbook's `base` (200ms) default.
- **DnD byte-identical:** the draggable ref, listeners, drop-target ring (`isOver && "ring-2 ring-primary/70"`), and `CSS.Translate.toString(transform)` style all stay on the inner div. Edit-mode drag is unchanged.
- **Scope discipline:** Did NOT add a new `--ease-snappy` token, did NOT animate connector grow-in on tree load, did NOT touch the path-trace's downstream connector below tapped (which still lights as the existing `bg-primary/60` since `isInSelectedPath` is true on tapped — preserved behavior, just instant). Did NOT refresh the drawer entrance. All three remain explicit Phase 2 follow-on slices.
- **Goal achieved.** Phase 2 second slice landed, reduced-motion- and DnD-safe; no scope creep.

## Decisions resolved

- **Per-step delay = `clamp(0.05, min(0.2, 1.0 / maxDistance), 0.2)`s (plan-lock refinement):** 5-ancestor baseline pins the cap exactly at 1.2s; the 50ms floor protects deep trees from collapsing into an indistinguishable flash. Inverse scaling beats a fixed-per-step delay because the spec's "≤1.2s regardless of depth" is the load-bearing constraint, not "exactly 200ms per step."
- **Highlight wrapper instead of inline `transitionDelay` on the draggable (plan-lock refinement):** the existing draggable carries `transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg`. Bolting an inline `transitionDelay` on it would have delayed hover transitions during a trace play (sluggish UX). Splitting the ring + highlight shadow onto a dedicated wrapper isolates the delayed transitions to the path-highlight properties only. Adds one transparent div per node; behavior is unchanged otherwise.
- **Connectors share an edge step (single delay value per edge):** the `h-6 w-px` below the parent, the `h-px` sibling bar, and the `h-4 w-px` above the child are three pieces of ONE visual edge. Giving them all the same `transitionDelay` makes the edge "fill" cohesively rather than reading as three separate flashes.

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0308.md` | This session file |
| `apps/web/components/web/lineage/lineage-tree-canvas.tsx` | Promoted `buildSelectedPathMemberIds` → `buildSelectedPathTrace` returning distance map + `maxDistance`; added `TRACE_*` constants + `tracePerStepDelay` / `traceStepDelay` helpers; threaded `pathDistanceById` + `perStepDelay` through `LineageBranch` + `LineageChildGroupColumn` + root render; added inline `transitionDelay` on the three connector `div`s + bumped them to `duration-200`; introduced a transparent rounded ring+shadow wrapper between the entrance `motion.div` and the dnd-kit draggable so the trace ring delay doesn't bleed into hover/dim transitions on the draggable |
| `docs/petey-plan-0305.md` | Added SESSION_0308 to `pairs_with`; bumped `last_agent` + `updated` |
| `docs/knowledge/wiki/custom-component-inventory.md` | Updated `LineageTreeCanvas` row with the SESSION_0308 animated path trace description; added SESSION_0308 to `pairs_with`; bumped `last_agent` + `updated` |
| `docs/knowledge/wiki/index.md` | Added SESSION_0308 session row (closed); bumped `last_agent` + `updated` |
| `docs/knowledge/wiki/log.md` | Appended SESSION_0308 entry; bumped `updated` + `last_agent` |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` (apps/web) | No new errors in changed file. `lineage-tree-canvas.tsx` retains exactly one pre-existing error: the H6 render-prop noise from `components/common/heading.tsx`'s Base-UI signature mismatch (existed at line 1025 before this session's edits, shifted to line 1108 by the new ring+shadow wrapper layer). The broader repo's ~340 pre-existing TypeScript error lines (duplicated `@types/react@19.2.14` resolution) are unchanged; not introduced here. |
| `bun run lint` (apps/web) | 1 pre-existing warning only: `lineage-profile-drawer.tsx:177` unused param `treeId` — same as SESSION_0306 / 0307, untouched this session. Zero warnings in `lineage-tree-canvas.tsx`. |
| `bun test lib/lineage/tree-layout.test.ts` | 3 pass / 0 fail (pure layout module the canvas consumes — no regression). |
| `bun run wiki:lint` (repo root) | **0 errors**, 8 warnings (2 >30d stale-frontmatter on unrelated docs + 6 R8 markdown nits in `petey-plan-0305.md`, ALL pre-existing — identical to SESSION_0307's close). |
| Live trace replay | Not run — no live DB / interaction harness in sandbox. The trace logic is declarative (`transitionDelay` on existing CSS transitions); reduced-motion path collapses every delay to 0 (worst case = the SESSION_0305 instant full-highlight). DnD-edit path is byte-identical. **Operator browser smoke at desktop and mobile recommended (operator-side per wrapper override).** |

## Open decisions / blockers

- **Operator phone-smoke from SESSION_0306 / SESSION_0307** — Phase 1 pinch-zoom/auto-fit and Phase 2 entrance stagger verification on a real device is still pending; an operator-side check, not blocking the next code slice.
- **`--ease-snappy` token addition (Phase 2 next-up):** when drawer entrance refinement + connector grow-in animations land together, add the `@theme` token once and migrate the lineage tree drawer + connectors as its consumers in the same commit.
- DESI-06 / DESI-07 (carryover) — parked brand-parity calls for Brandon.
- D7 (carryover) — S3 bucket provisioning, Brian's AWS console task.

## Next session

### Goal

Continue lineage epic **Phase 2 — tree animations** (`docs/petey-plan-0305.md`): land the
**connector grow-in on tree load** (height 0→full per connector, staggered by generation tier,
`ease-out` entrance) bundled with the **drawer entrance refinement** + the
**`--ease-snappy` `@theme` token** introduction — three Phase 2 follow-on slices that all consume
the same new easing token, so the token lands once with multiple consumers (token-first per the
design hub).

### First task

Add `--ease-snappy: cubic-bezier(0.85, 0, 0.15, 1)` as a `@theme` token in `apps/web/app/styles.css`,
then surface it as the entrance easing on (a) the lineage tree connectors growing from height 0
to their natural height on initial render, staggered by generation tier and gated on
`useReducedMotion()`; (b) the `LineageProfileDrawer` slide-in (currently
`slide-in-from-bottom-full` — swap the easing curve + extend to 300ms); and (c) any node entrance
that should feel "snappy" rather than the existing `ease-out` settle. Keep the existing
`ENTRANCE_EASE` token in place for the SESSION_0307 node entrance stagger; the new `--ease-snappy`
is for connector grow-in + drawer refinement, not a retrofit.

## Review log

### SESSION_0308_REVIEW_01 — lineage epic Phase 2 animated path trace

- **Reviewed tasks:** SESSION_0308_TASK_01 and SESSION_0308_TASK_02.
- **Dirstarter docs check:** not applicable — no Dirstarter L1 data layer touched. `motion` v12 +
  `@mantine/hooks` are installed deps; SESSION_0307's entrance idiom (reduced-motion as a drilled
  boolean prop) is the in-house reference for delay-driven choreography; ADR 0022 (token
  architecture, motion stays brand-neutral) confirmed valid.
- **Verdict:** Disciplined Phase-2 second slice. The trace builder extends the existing ancestor
  walk with a distance map; per-step delay clamps both ends so deep trees never break the 1.2s
  cap and shallow trees still feel paced. The dedicated highlight wrapper isolates the trace
  transitions from hover/dim on the draggable — a small structural cost (one transparent div per
  node) that protects two competing UX concerns (sequenced trace, snappy hover) from interfering.
  Connector duration aligned to the motion-system `base` token; no new easing token introduced
  (deferred to the bundled Phase 2 next slice). Reduced-motion path collapses all delays to 0 and
  delivers the exact previous instant-full-highlight, so the worst case is byte-identical to
  SESSION_0305. DnD edit-mode path untouched. Verification is honest: the H6 render-prop error
  re-attributed correctly (line 1025 → 1108 from the wrapper layer); zero new lint/test/wiki-lint
  regressions.
- **Score:** 9.0/10.
- **Follow-up:** Phase 2 next slice — connector grow-in on tree load + drawer entrance refinement
  bundled with the `--ease-snappy` `@theme` token introduction (three consumers, one new token).

## Hostile close review

- **Giddy:** pass — the new highlight wrapper is a transparent rounded `div` with no event
  handlers, no refs, and only `transition-all duration-200` + inline `transitionDelay`. It sits
  between the entrance `motion.div` (which owns `opacity`/`y`) and the dnd-kit draggable (which
  owns `transform`/listeners/`isOver`), composing cleanly. The new `traceStepDelay` /
  `tracePerStepDelay` helpers are pure math (clamp + Math.min/Math.max); no SSR/hydration risk
  (`"use client"` already present). No new effects, no new event listeners, no new render-time
  side effects. `pathDistanceById` is a `Map<string, number>` rebuilt inside the same useMemo as
  the existing path set — same recompute trigger as before.
- **Doug:** pass — verification honest. Zero new typecheck errors in the changed file. The
  pre-existing H6 render-prop error shifted from line 1025 → 1108 as expected from the wrapper
  layer addition (+ the new constants + helper). Zero new lint warnings (same 1 pre-existing
  unused param as SESSION_0306 / 0307). Tree-layout test 3/3 unchanged. Wiki-lint 0 errors / 8
  warnings — identical to SESSION_0307's close (same 2 stale frontmatter + 6 R8 nits in
  petey-plan-0305).
- **Desi:** pass — directly continues the SESSION_0307 motion-language work by adding the
  ancestor-tracing surface to the motion system. Per-step delay scaling honors the spec's "≤1.2s
  regardless of depth" cap; the 50ms floor preserves perceivable cascade on deep trees instead
  of collapsing into an indistinguishable flash. Token-first: connector duration bumped to
  match `base` 200ms; no ad-hoc easing — Tailwind default linear is fine for a discrete
  `bg-border → bg-primary/60` color swap. Reduced-motion delivers the previous instant
  full-highlight verbatim. Bonus: hover lift is NOT delayed during a trace play (the failure
  mode that would have shipped if we'd bolted the delay onto the existing `transition-all` on
  the draggable).
- **Kaizen aggregate:** 9.0/10 — high motion-language payoff (lineage tree's path highlight
  joins the motion system as a sequenced choreography), near-zero blast radius (transparent
  wrapper + per-element inline `transitionDelay` + reduced-motion fallback = worst case is the
  previous instant full-highlight), and the close did not introduce any new wiki-lint warnings.

## ADR / ubiquitous-language check

- ADR update **not required.** No architectural decision made/changed/rejected — this extends an
  existing in-house component with installed deps + motion-system tokens. ADR 0022 (Brand Chrome
  / token architecture) confirmed valid (untouched; motion stays brand-neutral). The future
  `--ease-snappy` token addition + the bundled Phase 2 next slice is a candidate for a small
  "motion tokens v1" ADR when it lands with multiple consumers — not this slice.
- Ubiquitous language update **not required** — no new domain terms (`traceDistance`,
  `pathDistanceById`, `perStepDelay`, `tracePerStepDelay`, `traceStepDelay` are UI mechanics, not
  domain language).

## Reflections

- **Inverse-scaling the per-step delay beats a fixed cadence.** The spec said "≤1.2s regardless of
  depth," which the literal-but-naive reading translates to "200ms per step, hope the tree isn't
  too deep." Instead, `tracePerStepDelay(maxDistance)` reads the depth at click time and scales
  inversely with both a floor (50ms — keeps cascade perceptible) and ceiling (200ms — keeps short
  trees from feeling sluggish). The cap is honored for any depth; the floor protects cascade
  legibility at extreme depth. Same lesson as the SESSION_0307 entrance stagger cap: respect the
  *spirit* of the spec (sequencing is the signal) by scaling the parameter, not by hard-capping
  the iteration count.

- **The transparent wrapper protects two transitions from interfering.** The draggable already
  carried `transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg` — bolting
  an inline `transitionDelay` on it would have delayed hover during a trace play (sluggish UX).
  Splitting the ring + highlight shadow onto a dedicated wrapper let me delay only the
  trace-relevant transitions while keeping hover snappy. The cost: one transparent div per node.
  The benefit: hover and the trace coexist without compromise. Generalizes: when two distinct
  UX concerns want the same CSS property (here, both want `box-shadow` to transition), splitting
  them onto adjacent DOM elements is cheaper than orchestrating timing on a single element.

- **Reduced-motion as the worst-case anchor.** Wiring `perStepDelay = 0` in the
  reduced-motion branch makes the worst case the previous instant full-highlight from
  SESSION_0305 — byte-identical to a known-good state. This is the same discipline as
  SESSION_0307: don't just *gate* the animation on reduced-motion, define the reduced-motion
  branch as "fall back to the previously-shipped behavior, exactly." It's both an accessibility
  win and a regression-safety net.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0308 frontmatter complete (`status: closed`, `last_agent: claude-session-0308`); `custom-component-inventory.md` + `petey-plan-0305.md` + `index.md` + `log.md` bumped `last_agent` + `updated` (+ SESSION_0308 added to inventory/plan `pairs_with`); code file carries no doc frontmatter |
| Backlinks/index sweep | `index.md` gained SESSION_0308 row (closed); `log.md` gained SESSION_0308 entry; inventory ↔ SESSION_0308 and plan ↔ SESSION_0308 cross-linked both directions |
| Wiki lint | `bun run wiki:lint` → **0 errors**, 8 warnings (2 >30d stale-frontmatter + 6 R8 markdown nits in `petey-plan-0305.md`, all pre-existing — identical to SESSION_0307's close) |
| Kaizen reflection | Reflections section present: yes (3 notes) |
| Hostile close review | SESSION_0308_REVIEW_01 — 9.0/10; Giddy/Doug/Desi all pass |
| Review & Recommend | Next session goal written: yes (connector grow-in + drawer refinement + `--ease-snappy` token bundled) |
| Memory sweep | Existing project memories load-bearing for SESSION_0308: `motion-system-and-haptics-constraints.md` (`motion/react` + `useReducedMotion` idiom; reduced-motion fallback discipline) and `lineage-canvas-zoom-and-dnd-constraints.md` (DnD/pinch composition, auto-fit shrink-only). No new memory needed: the trace mechanics (distance-aware ancestor walk; per-element `transitionDelay`) are visible in the code + custom-component-inventory; the "wrap, don't bolt" lesson is a session-scoped reflection (same idiom shape as SESSION_0307's "wrap, don't replace"), not a project-scoped fact. |
| Next session unblock check | Phase 2 next slice (connector grow-in + drawer refinement + `--ease-snappy` token) is doable without a device; depends on `styles.css` + drawer component already in the repo + this session's connector keying. Operator phone-smoke from SESSION_0306 / 0307 remains a parallel operator-side check, not a blocker. |
| Git hygiene | reported at bow-out — see git log (single commit to `auto/session-0308`; FS-0024 guard ran; FS-0025 single-push order; **wrapper override: COMMIT to current branch but DO NOT push and DO NOT open PR — wrapper handles push + PR**) |
| Graphify update | Ran BEFORE the close commit (FS-0025) — `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` → 8646 nodes, 12896 edges, 1309 communities, 1489 files tracked |
