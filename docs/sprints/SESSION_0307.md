---
title: "SESSION 0307 — Lineage epic Phase 2: node entrance stagger (first animation slice)"
slug: session-0307
type: session--implement
status: closed
created: 2026-05-29
updated: 2026-05-29
last_agent: claude-session-0307
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0306.md
  - docs/petey-plan-0305.md
  - docs/runbooks/design/motion-system.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0307 — Lineage epic Phase 2: node entrance stagger (first animation slice)

## Date

2026-05-29

## Operator

Brian + claude-session-0307

## Goal

Advance the lineage tree enhancement epic (`docs/petey-plan-0305.md`) **Phase 2 — Tree
animations**: ship the first animation slice, a generation-stepped node entrance stagger on
`LineageTreeCanvas`. Apply the motion-system language (token-first `ease-out` entrance, `deliberate`
250ms duration, `stagger-base` 60ms per sibling, generation tier compounds the delay) reusing the
`motion/react` + `useReducedMotion` idiom established in `BlackBeltRailList` (SESSION_0304). The
operator phone-smoke handoff from SESSION_0306 (Phase 1 pinch-zoom on a real device) is **operator-
side**, not a blocker — the next automatable code slice is the entrance stagger.

## Status

### Status: closed

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0306.md`
- Carryover: SESSION_0306 (claude, 9.1/10) landed lineage epic Phase 1 — two-finger pinch-to-zoom +
  one-shot auto-fit + responsive node cards on `LineageTreeCanvas`, reduced-motion-disciplined and
  DnD-safe. Its staged "Next session" was (a) operator phone-smoke + (b) start Phase 2 entrance
  stagger. Phone-smoke is operator-side per the wrapper override; this session executes (b).

### Branch and worktree

- Branch: `auto/session-0307` (wrapper script branch; commit lands here, push + PR handled by wrapper)
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `a283c87`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | UI primitives only — `motion` v12 + `@mantine/hooks` already installed (SESSION_0304); composing existing `LineageBranch` recursion. No L1 data layer. |
| Extension or replacement | Extension: wrap the existing draggable inner div in a `motion.div` with token-aligned entrance + reduced-motion gate; thread `generation` / `siblingIndex` through the recursive `LineageBranch` → `LineageChildGroupColumn` chain. No primitive replaced. |
| Why justified | Phase 2 entrance stagger is the next non-blocked code slice in the locked epic plan; the motion-system foundation (SESSION_0304) explicitly stages the lineage tree as a Phase-1-rollout list-stagger consumer. |
| Risk if bypassed | Phase 2 path-trace + connector animations would land without a baseline entrance idiom, forcing a retrofit; lineage tree stays statically rendered and out of sync with the rest of the motion language. |

Live docs checked during planning: not applicable — no Dirstarter L1 data layer touched. `motion`
v12 and `@mantine/hooks` (`useReducedMotion`) are already installed; `BlackBeltRailList` is the
in-house reference idiom.

### Graphify check

- Graph status: current (refreshed end of SESSION_0306); stats at bow-in: 8627 nodes, 12869 edges,
  1311 communities, 1487 files tracked.
- Queries used:
  - `"lineage tree canvas node entrance stagger motion react reduced motion generation tier ease-out"` (memory-resident from session continuity — file paths already known from SESSION_0306).
- Files selected / verified by direct read:
  - `apps/web/components/web/lineage/lineage-tree-canvas.tsx` (1014 lines — owns `LineageBranch` recursion + `LineageChildGroupColumn` group map)
  - `apps/web/app/(web)/disciplines/_components/black-belt-rail-list.tsx` (motion idiom canon: `motion.li` + `useReducedMotion` + `initial`/`animate`/`transition` with reduced-motion = `{ duration: 0 }` and `initial={false}`)
  - `docs/runbooks/design/motion-system.md` (token: ease-out entrance = `cubic-bezier(0.16, 1, 0.3, 1)`, durations: `deliberate` 250–300ms, stagger: `stagger-base` 60ms with 6–8 item cap)
- Verification note: exact files opened after recall; Graphify used as navigation, not proof.

### Grill outcome

Two **plan-lock refinements** before execution (Petey):

1. **Easing token, not the bklit "Snappy" curve.** `petey-plan-0305.md` Phase 2 cites
   `cubic-bezier(0.85, 0, 0.15, 1)` (bklit.com "Snappy"). The authoritative motion-system token
   for entrances is `cubic-bezier(0.16, 1, 0.3, 1)` (`ease-out` entrance). Per the design hub's
   token-first discipline, this slice uses the existing entrance token (also the one
   `BlackBeltRailList` already uses). Introducing `--ease-snappy` as a `@theme` token is a
   separate slice tied to drawer-entrance refinement + connector animations (Phase 2 later
   tasks) — bundling those together keeps the new token defined once with multiple consumers,
   rather than scattered ad-hoc easing strings now.
2. **Stagger formula + cap.** Delay = `generation * 120ms + siblingIndex * 60ms`, clamped to a
   ceiling of 900ms so a deep/wide tree never has a draggy cascade (motion-system caps stagger
   to 6–8 items per row; clamping the *delay* total respects the spirit of that cap across the
   2-D grid). Generation index threads recursively starting at 0 for roots; sibling index is
   local to the parent's child group (already where `group.members.map(child => ...)` runs).

## Petey plan

### Goal

Ship lineage epic Phase 2 first slice: generation-stepped node entrance stagger on
`LineageTreeCanvas`, reduced-motion-disciplined, no Phase 2 scope creep (no path trace, no connector
animations, no drawer easing refresh — staged for separate slices).

### Tasks

#### SESSION_0307_TASK_01 — Node entrance stagger

- **Agent:** Cody
- **What:** Wrap each `LineageBranch` draggable node in a `motion.div` from `motion/react`. Thread a
  `generation` depth (root = 0, increments per recursion) and a `siblingIndex` (local to each
  child group). Compute per-node delay = `clamp(generation * 120 + siblingIndex * 60, 0, 900)` ms.
  Use the motion-system `ease-out` entrance token (`cubic-bezier(0.16, 1, 0.3, 1)`), duration
  `deliberate` 250ms. Reduced-motion: `initial={false}` + `transition: { duration: 0 }` so nodes
  render in their final state on first paint (no stagger, no delay).
- **Steps:**
  1. Import `motion` from `motion/react` in `lineage-tree-canvas.tsx` (the `useReducedMotion` hook
     is already imported).
  2. Add `generation: number` and `siblingIndex: number` props to `LineageBranch`. Thread:
     `LineageTreeCanvas` root map → `generation={0}` + `siblingIndex={index}`; `LineageBranch` →
     `LineageChildGroupColumn` with `generation={generation + 1}`; `LineageChildGroupColumn` →
     nested `LineageBranch` with `siblingIndex={index}` from its `group.members.map((child, index)`.
  3. Inside `LineageBranch`, wrap the existing draggable inner `<div ref={setDraggableRef}>...` in
     a `motion.div` with the entrance config above. Keep the existing `transform: CSS.Translate.toString(transform)`
     style (dnd-kit drag translate) merged with motion's `transform` by letting `motion.div` own the
     entrance and applying the dnd translate via `style` (motion + style co-exist; motion drives
     opacity + y).
  4. Read `useReducedMotion` (already obtained in the parent canvas) — drill it into `LineageBranch`
     as a prop OR access via a local hook call. Prefer prop-drill: the parent canvas already calls
     it; passing the boolean down avoids duplicate hook reads in every recursion node.
  5. Verify dnd-kit drag still works: while `isDragging`, the entrance animation must already be
     complete (delays are capped at 900ms, well before a user could initiate a drag), and the
     `motion.div` should respect the dnd `transform` style.
  6. `cd apps/web && bun run typecheck && bun run lint`.
- **Done means:** On a fresh render of a multi-generation tree, root nodes fade-in-up first
  (`opacity 0→1`, `y: 6→0`) over 250ms `ease-out`, then generation 1 with a 120ms head delay plus
  siblingIndex × 60ms per-item, etc., capped at 900ms total delay. Reduced-motion users see all
  nodes static on first paint. DnD edit-mode drag still functions. Typecheck/lint clean on changed
  files (pre-existing issues attributed).
- **Depends on:** nothing

#### SESSION_0307_TASK_02 — Verification sweep

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
| SESSION_0307_TASK_01 | Cody | Code: `motion.div` wrap + recursive `generation`/`siblingIndex` threading |
| SESSION_0307_TASK_02 | Doug | Verification |

### Open decisions

- None blocking execution. Operator phone-smoke from SESSION_0306 is parallel-track operator-side
  (override). DESI-06 / DESI-07 + D7 (S3 bucket) remain parked carryover.

### Risks

- **Recursive prop drilling.** Threading `generation` + `siblingIndex` + the reduced-motion boolean
  through `LineageBranch` → `LineageChildGroupColumn` → nested `LineageBranch` adds boilerplate to
  three sites. Mitigation: small, localized prop set; no context provider needed for one boolean +
  two numbers.
- **DnD + motion.div composition.** `motion.div` and `@dnd-kit` both set `style.transform`. The dnd
  translate is a strings-only `CSS.Translate.toString(...)` set via `style.transform`; motion
  drives `opacity` and `y` via its own internal style. The entrance animation completes well before
  any drag could start (capped at 900ms), so they don't compete in practice. Mitigation: verify with
  a quick mental walkthrough; if dnd translate breaks, fall back to wrapping the draggable div with
  an outer `motion.div` that owns entrance-only and lets the inner div own dnd transform.
- **Delay cap correctness.** A 900ms ceiling means generation ≥ 8 OR very wide rows still feel
  responsive. For trees larger than that, all late nodes share the cap — they'll appear at the same
  moment, which reads as "the tree settled in" rather than a draggy cascade. Aligned with
  motion-system "intentional stillness" principle.

### Scope guard

- Do NOT build Phase 2's other slices this session — animated path trace, connector line animations,
  drawer entrance refinement, `--ease-snappy` token addition are all separately staged.
- Do NOT touch schema / Prisma / auth / the token architecture (ADR 0022 holds).
- Do NOT add a new motion easing token in this slice — use the existing entrance `ease-out` curve
  (token literal `cubic-bezier(0.16, 1, 0.3, 1)`). The Snappy preset comes when drawer refinement
  also consumes it.
- Do NOT introduce raw markup — only wrap the existing draggable div with `motion.div`, keep
  `Card`/`Avatar`/`Badge`/`Stack` composition unchanged (FS-0001).
- Do NOT animate connectors / group rows — only the node cards themselves get entrance motion.

### Dirstarter implementation template

- **Docs read first:** not applicable — no Dirstarter L1 data layer. `motion` v12 + `@mantine/hooks`
  already installed.
- **Baseline pattern to extend:** `BlackBeltRailList` motion idiom (`motion.<el>` + `useReducedMotion`
  + `initial={reduceMotion ? false : {...}}` + `transition={reduceMotion ? { duration: 0 } : {...}}`)
  applied to the recursive `LineageBranch`.
- **Custom delta:** generation-tier + sibling-index two-axis stagger with a clamped 900ms ceiling,
  threaded recursively (not in `BlackBeltRailList` — that's a flat list).
- **No-bypass proof:** nothing Dirstarter-owned is replaced; this extends an in-house component with
  installed deps and a token-aligned motion config.

## Cody pre-flight

### Pre-flight: Phase 2 node entrance stagger (TASK_01)

#### 1. Existing component scan

- Graphify-recall: `LineageTreeCanvas` recursive render in `LineageBranch` → `LineageChildGroupColumn`
  (from SESSION_0306 working set). Motion idiom canon: `BlackBeltRailList`.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: not required — no L1 data layer.
- Closest L1 pattern: motion-system runbook (entrance ease-out token, stagger-base, reduced-motion
  discipline) + `BlackBeltRailList` reference implementation.
- Primitive API spot-check: `motion.div` accepts `initial`, `animate`, `transition`, plus passthrough
  className/style/ref/props; `useReducedMotion()` returns `boolean | null`.

#### 3. Composition decision

- Extending existing component: `LineageTreeCanvas` (specifically `LineageBranch` + threading two
  numeric props down through `LineageChildGroupColumn`).
- Composing existing components: `motion.div` from `motion/react` (already installed); `Card`,
  `Avatar`, `Badge`, `Stack`, `Button` untouched.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes (SESSION_0306 → Phase 2 entrance stagger).
- ADR read: `0022-brand-chrome-resolution.md` (confirmed valid — no token change, motion stays
  brand-neutral).
- Runbook consulted: `docs/runbooks/design/motion-system.md` (entrance ease-out token, stagger-base
  60ms, 6–8 item cap, reduced-motion mandate).

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo` (FS-0002, not used this slice).
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`.
- Brand/host for testing: behavioral diff verifiable in code review; operator browser smoke
  recommended (not a block per wrapper override).

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001 (scratch components vs L1) — standing; FS-0024 (cwd/remote
  guard before mutating git) — will run before commit; FS-0025 (single-push order, graphify before
  commit) — will follow.
- Mitigation acknowledged: `motion.div` is a primitive composition wrap on the existing draggable
  div; no new UI primitive. Reduced-motion fallback is mandatory and included.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0307_TASK_01 | landed | Node entrance stagger on `LineageTreeCanvas`: `motion.div` wrap of the existing draggable + threaded `generation`/`siblingIndex`/`reduceMotion` props through `LineageBranch` → `LineageChildGroupColumn`; delay = `clamp(generation*0.12 + siblingIndex*0.06, 0, 0.9)` seconds; token-aligned `ease-out` entrance + 250ms duration; reduced-motion gates to final state instantly; DnD untouched. |
| SESSION_0307_TASK_02 | landed | Verify: typecheck (no new errors in changed file — pre-existing H6 render-prop noise shifted line numbers but unchanged), lint (no new warnings — same 1 pre-existing in `lineage-profile-drawer.tsx:177`), tree-layout test 3/3, wiki:lint 0 errors (1 SESSION_0307 R8 nit auto-fixed: rewrapped a `+`-leading line). |

## What landed

- **Node entrance stagger (TASK_01):** Each lineage node card now fades in from `{ opacity: 0, y: 6 }`
  on first paint, generation-by-generation. The existing draggable `<div ref={setDraggableRef}>` is
  wrapped in a `motion.div` (`motion/react`) inside the recursive `LineageBranch` — the wrap owns
  entrance only and does not touch the dnd-kit translate / listeners on the inner div, so the drag
  editor is byte-identical.
- **Delay formula:** `entranceDelay(generation, siblingIndex) = clamp(generation * 0.12 +
  siblingIndex * 0.06, 0, 0.9)` seconds. Root row (gen 0) reads left-to-right at `stagger-base`
  60ms per sibling; gen 1 starts 120ms after the roots and reads its row the same way; etc., with a
  900ms ceiling so deep/wide trees never feel draggy. Roots receive `generation={0}` +
  `siblingIndex={index}` from the canvas root map; `LineageChildGroupColumn` threads
  `generation={generation + 1}` to its nested branches, with `siblingIndex={index}` local to each
  child group.
- **Motion tokens:** `duration: 0.25` (`deliberate`), `ease: [0.16, 1, 0.3, 1]` (motion-system
  `ease-out` entrance), matching the `BlackBeltRailList` idiom established in SESSION_0304.
- **Reduced-motion mandate:** `useReducedMotion()` from `@mantine/hooks` (already read in the
  canvas for zoom-transition gating) drills as a `reduceMotion` boolean prop through
  `LineageBranch` → `LineageChildGroupColumn` recursion. When `true`, the motion wrapper uses
  `initial={false}` (skips the from-state entirely) and `transition: { duration: 0 }` — every node
  renders in its final, accessible state on first paint, no stagger.
- **Scope discipline:** Did NOT add a new `--ease-snappy` token, did NOT animate connector lines,
  did NOT touch the path-trace logic, did NOT refresh the drawer entrance — all four are explicit
  Phase 2 follow-on slices in `petey-plan-0305.md`, staged for a later session that can introduce
  the new token once with multiple consumers.
- **Goal achieved.** Phase 2 first slice landed (node entrance stagger), reduced-motion- and
  DnD-safe; no scope creep into other Phase 2 slices or Phase 3+ work.

## Decisions resolved

- **Easing token, not bklit "Snappy" (plan-lock refinement):** This slice uses the existing
  motion-system `ease-out` entrance curve (`cubic-bezier(0.16, 1, 0.3, 1)`) rather than the
  `[0.85, 0, 0.15, 1]` "Snappy" preset called out in `petey-plan-0305.md` Phase 2. Token-first
  discipline (per the design hub). The Snappy preset gets a single `@theme` token addition when
  drawer entrance refinement + connector animations land together, so the new token is defined
  once with multiple consumers, not scattered ad-hoc.
- **Stagger formula + 900ms cap (plan-lock refinement):** Delay = `generation * 0.12 +
  siblingIndex * 0.06`, clamped to 0.9s. The motion-system caps stagger to 6–8 items per row;
  this two-axis version respects the spirit of the cap across the grid by clamping the total
  delay rather than the per-row count.
- **Wrap, don't replace, the draggable div:** `motion.div` wraps the dnd-kit draggable rather
  than becoming it, so motion drives entrance opacity/y and dnd-kit keeps owning `style.transform`
  + ref + listeners. Zero conflict, zero behavioral change in edit mode.

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0307.md` | This session file |
| `apps/web/components/web/lineage/lineage-tree-canvas.tsx` | Added `motion` import, `ENTRANCE_*` config constants + `entranceDelay()` helper, threaded `generation`/`siblingIndex`/`reduceMotion` through `LineageBranch` + `LineageChildGroupColumn` + root render, wrapped the draggable div with `motion.div` for the generation-stepped entrance |
| `docs/petey-plan-0305.md` | Added SESSION_0307 to `pairs_with`; bumped `last_agent` |
| `docs/knowledge/wiki/custom-component-inventory.md` | Updated `LineageTreeCanvas` row with the SESSION_0307 entrance-motion description; added SESSION_0307 to `pairs_with`; bumped `last_agent` |
| `docs/knowledge/wiki/index.md` | Added SESSION_0307 session row; bumped `last_agent` |
| `docs/knowledge/wiki/log.md` | Appended SESSION_0307 entry; bumped `updated` + `last_agent` |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` (apps/web) | No new errors in changed file. `lineage-tree-canvas.tsx` retains exactly one pre-existing error: the H6 render-prop noise from `components/common/heading.tsx`'s Base-UI signature mismatch (existed at line 981 before our edits, shifted to line 1025 by the `motion.div` wrap). The broader repo has ~340 pre-existing TypeScript error lines from a duplicated `@types/react@19.2.14` resolution that pre-dates this session — SESSION_0306 undercounted these (it reported "2 pre-existing"), but they are not introduced here. |
| `bun run lint` (apps/web) | 1 pre-existing warning only: `lineage-profile-drawer.tsx:177` unused param `treeId` — same as SESSION_0306, untouched this session. Zero warnings in `lineage-tree-canvas.tsx`. |
| `bun test lib/lineage/tree-layout.test.ts` | 3 pass / 0 fail (pure layout module the canvas consumes — no regression) |
| `bun run wiki:lint` (repo root) | **0 errors**, 8 warnings (2 >30d stale-frontmatter on unrelated docs + 6 R8 markdown nits in `petey-plan-0305.md`, all pre-existing). One initial R8 warning on `SESSION_0307.md:68` was auto-fixed by rewrapping a paragraph whose `+` line-start was being parsed as a list bullet. |
| Live render of entrance stagger | Not run — no live DB / animation-frame replay in sandbox. Motion logic is declarative + token-aligned; reduced-motion path renders the static final state (worst case = current static-render behavior). DnD-edit path is untouched. **Operator browser-smoke at desktop and mobile recommended (operator-side per wrapper override).** |

## Open decisions / blockers

- **Operator phone-smoke from SESSION_0306** — Phase 1 pinch-zoom/auto-fit verification on a real
  device is still pending; an operator-side check, not blocking the next code slice.
- **`--ease-snappy` token addition (Phase 2 next-up):** When drawer entrance refinement +
  connector animations land together, add the `@theme` token once and migrate the lineage tree
  + drawer + connectors as its consumers in the same commit.
- DESI-06 / DESI-07 (carryover) — parked brand-parity calls for Brandon.
- D7 (carryover) — S3 bucket provisioning, Brian's AWS console task.

## Next session

### Goal

Continue lineage epic **Phase 2 — tree animations** (`docs/petey-plan-0305.md`): land the
**animated path trace** slice on `LineageTreeCanvas` — when a node is tapped, animate the path
highlight connector-by-connector from the tapped node up to the root (sequential, not all-at-once),
with the existing path-highlight state machine driving it. Reduced-motion stays as the current
instant full-highlight.

### First task

In `LineageTreeCanvas`, transform the connector `div`s (the `h-6 w-px` + `h-4 w-px` + `h-px`
horizontal bar) into individually-keyed elements that can animate their `bg-border → bg-primary/60`
transition on a per-step delay derived from each connector's distance from the tapped node up
through `selectedPathMemberIds`. The trace should complete in ≤1.2s total regardless of depth
(scale per-step delay against ancestor depth). Reduced-motion: keep the current instant
full-highlight. Then either start the **connector grow-in on tree load** (height 0→full, staggered
per generation tier, ease-out entrance — pairs with the SESSION_0307 node entrance stagger), or
batch it with the **drawer entrance refinement + `--ease-snappy` token** so the new token lands
with multiple consumers in one slice.

## Review log

### SESSION_0307_REVIEW_01 — lineage epic Phase 2 entrance stagger

- **Reviewed tasks:** SESSION_0307_TASK_01 and SESSION_0307_TASK_02.
- **Dirstarter docs check:** not applicable — no Dirstarter L1 data layer touched. `motion` v12 +
  `@mantine/hooks` are installed deps; the `BlackBeltRailList` motion idiom (SESSION_0304) is the
  in-house reference; ADR 0022 (token architecture, motion stays brand-neutral) confirmed valid.
- **Verdict:** Disciplined Phase-2 first slice. Petey refused the bklit "Snappy" curve in favor of
  the existing motion-system `ease-out` entrance token, deferring the `--ease-snappy` token to a
  later slice that bundles drawer + connector animations as multiple consumers — token-first per
  the design hub. The `motion.div` wraps the draggable div rather than replacing it, so
  `@dnd-kit` is byte-identical in edit mode. The 900ms delay cap respects the motion-system
  "intentional stillness" + 6–8 item stagger ceiling extended across the 2-D tree. Reduced-motion
  is wired through the recursion as a boolean prop (one hook read, one declarative branch),
  matching the SESSION_0304 idiom. Verification is honest: gesture/animation can't be
  device-tested in the sandbox, and that's marked rather than claimed. Bonus close hygiene
  auto-fixed an R8 wiki-lint nit in this session's own file (a `+` line-start being parsed as a
  list bullet).
- **Score:** 9.0/10.
- **Follow-up:** Phase 2 next slice — animated path trace, then drawer entrance + connector grow
  bundled with the `--ease-snappy` token introduction.

## Hostile close review

- **Giddy:** pass — `motion.div` wraps the draggable without owning its ref, so dnd-kit translate
  + listeners are untouched; the entrance animation completes well within 900ms which is far
  shorter than any plausible drag-initiation window. `useReducedMotion()` is read once at the
  canvas (no duplicate hook reads in every recursion node) and drilled as a boolean prop. The
  one new helper (`entranceDelay`) is a pure clamp — no SSR / hydration risk; `"use client"`
  already present. No new effects, no new event listeners.
- **Doug:** pass — verification honest. Zero new typecheck errors in the changed file (the H6
  render-prop noise pre-existed at line 981 pre-edit and was confirmed by a `git stash`
  re-typecheck). Zero new lint warnings (same 1 pre-existing as SESSION_0306). Tree-layout test
  3/3. Wiki-lint went 1 new warning → 0 after the in-session rewrap; final 0 errors / 8
  warnings (all pre-existing). SESSION_0306's typecheck undercount (it said "2 pre-existing")
  was caught and accurately attributed in the Verification table this session.
- **Desi:** pass — directly extends the SESSION_0304 motion idiom (`BlackBeltRailList`) to the
  lineage canvas, the flagship surface for the epic. The entrance uses motion-system tokens
  (no ad-hoc easing strings), reduced-motion delivers a static, fully-readable tree, and the
  delay cap honors "intentional stillness." The literal-but-sprawling bklit "Snappy" easing was
  rejected in favor of the existing entrance token until `--ease-snappy` can land as a single
  shared token across drawer + connectors — token-first per the design hub.
- **Kaizen aggregate:** 9.0/10 — high motion-language payoff (lineage tree joins the motion
  system), near-zero DnD / desktop / reduced-motion blast radius (wrap-not-replace + propagated
  reduced-motion = the worst case is the current static render), and the close auto-fixed its
  own new R8 wiki-lint nit before commit.

## ADR / ubiquitous-language check

- ADR update **not required.** No architectural decision made/changed/rejected — this extends an
  existing in-house component with already-installed deps + motion-system tokens. ADR 0022 (Brand
  Chrome / token architecture) confirmed valid (untouched; motion stays brand-neutral). The
  future `--ease-snappy` token addition is a candidate for a small "motion tokens v1" ADR when
  it lands with multiple consumers — not this slice.
- Ubiquitous language update **not required** — no new domain terms (`generation`, `siblingIndex`,
  `entranceDelay` are UI mechanics, not domain language).

## Reflections

- **The literal plan said "use the Snappy curve"; the right move was not to.** The bklit "Snappy"
  preset is a fine entrance feel, but introducing a one-off easing string in a component is the
  exact pattern the design hub argues against (token-first, no ad-hoc values). Better to defer it
  to a slice that bundles drawer + connector animations as multiple consumers of the same new
  `--ease-snappy` `@theme` token. Same lesson as SESSION_0306: the reduced-blast-radius slice
  that hits the *goal* beats the literal-but-sprawling implementation.

- **Wrap, don't replace.** Two competing libraries on the same DOM node (`motion` + `@dnd-kit`)
  both want to drive `style.transform` and the ref. Wrapping the draggable in an outer
  `motion.div` (entrance-only) instead of trying to turn the draggable itself into `motion.div`
  costs one extra div per node and zero behavior changes in edit mode. The composability lesson
  generalizes: when two libs both want the ref, a passive wrapper is usually safer than a
  contested ref-merge.

- **Verification honesty caught a prior-session undercount.** SESSION_0306 reported "2
  pre-existing typecheck errors only" — the actual count is ~340 lines across the repo (a
  duplicated `@types/react` resolution problem that long pre-dates this session). The H6
  render-prop error in our changed file pre-existed too. Re-running `bun run typecheck` cleanly
  and stashing my edits to diff the result confirmed zero new errors from this session and
  attributed the noise correctly. The lesson: don't trust the prior session's per-file error
  attribution at face value — re-baseline.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0307 frontmatter complete (`status: closed`, `last_agent: claude-session-0307`); `custom-component-inventory.md` + `petey-plan-0305.md` + `index.md` + `log.md` bumped `last_agent` (+ SESSION_0307 added to inventory/plan `pairs_with`); code file carries no doc frontmatter |
| Backlinks/index sweep | `index.md` gained SESSION_0307 row; `log.md` gained SESSION_0307 entry; inventory ↔ SESSION_0307 and plan ↔ SESSION_0307 cross-linked both directions |
| Wiki lint | `bun run wiki:lint` → **0 errors**, 8 warnings (2 >30d stale-frontmatter + 6 R8 markdown nits in `petey-plan-0305.md`, all pre-existing). One R8 nit on `SESSION_0307.md:68` was self-fixed in-session by rewrapping a `+`-leading line |
| Kaizen reflection | Reflections section present: yes (3 notes) |
| Hostile close review | SESSION_0307_REVIEW_01 — 9.0/10; Giddy/Doug/Desi all pass |
| Review & Recommend | Next session goal written: yes (animated path trace, then drawer + connectors with `--ease-snappy`) |
| Memory sweep | Existing project memory `lineage-canvas-zoom-and-dnd-constraints.md` still load-bearing for SESSION_0307 (pinch + DnD gating + CSS-transform-scroll quirk + auto-fit shrink-only model). No new memory needed: the motion idiom is the same `BlackBeltRailList` pattern already documented in `motion-system-and-haptics-constraints.md`; the wrap-don't-replace lesson is session-scoped reflection, not project-scoped fact |
| Next session unblock check | Animated path trace is doable without a device; relies on the existing `selectedPathMemberIds` state machine. Operator phone-smoke from SESSION_0306 remains a parallel operator-side check, not a blocker |
| Git hygiene | reported at bow-out — see git log (single commit to `auto/session-0307`; FS-0024 guard ran; FS-0025 single-push order; **wrapper override: COMMIT to current branch but DO NOT push and DO NOT open PR — wrapper handles push + PR**) |
| Graphify update | Ran BEFORE the close commit (FS-0025) — 8641 nodes, 12888 edges, 1364 communities, 1489 files tracked |
