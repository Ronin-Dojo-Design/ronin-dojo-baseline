---
title: "SESSION 0310 — Lineage epic Phase 2: node card hover lift refinement (scale + belt-tint glow)"
slug: session-0310
type: session--implement
status: closed
created: 2026-05-30
updated: 2026-05-30
last_agent: claude-session-0310
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0309.md
  - docs/petey-plan-0305.md
  - docs/runbooks/design/motion-system.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0310 — Lineage epic Phase 2: node card hover lift refinement (scale + belt-tint glow)

## Date

2026-05-30

## Operator

Brian + claude-session-0310

## Goal

Advance the lineage tree enhancement epic (`docs/petey-plan-0305.md`) **Phase 2 — Tree animations**:
land the **node card hover lift refinement** — subtle `scale(1.02)` + belt-color glow on hover.
Composes on top of the existing `hover:-translate-y-1 hover:shadow-lg` idiom on the inner
draggable wrapper of `LineageNodeCard` inside `LineageTreeCanvas`. Uses `Rank.colorHex` from the
already-threaded normalized `member.selectedRank` so the glow tint matches the practitioner's belt
(fallback to `--color-primary` when `selectedRank` is null) — brand-neutral, data-driven, no new
token, no schema touch. Phase 2's last "node-level micro-interaction" slice; closes the Phase 2
motion language for the lineage tree before Phase 3 (belt-rail integration + family-tree templates)
begins. Wrapper override stands: phone-smoke is operator-side, not a blocker.

## Status

### Status: closed

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0309.md`
- Carryover: SESSION_0309 (claude, 9.0/10) landed lineage epic Phase 2 third slice — the
  `--ease-snappy` `@theme` token plus three consumers (connector grow-in × 3 pieces × N tiers on
  the lineage tree, plus the shared `DrawerContent` snappy entrance). Its staged "Next session" was
  the node card hover lift refinement — subtle scale + belt-color glow on hover, brand-neutral
  data-driven from `Rank.colorHex`; this session lands the slice.

### Branch and worktree

- Branch: `auto/session-0310` (wrapper script branch; commit lands here, push + PR handled by wrapper)
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `0742004`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Theming (Tailwind v4) — surface-level: a hover-only `--belt-tint` CSS variable + Tailwind v4 arbitrary-value `hover:shadow-[...]` utility + `hover:scale-[1.02]` utility on the inner draggable inside `LineageBranch`. No L1 data layer touched. No new `@theme` tokens, no new keyframes, no new dependencies. |
| Extension or replacement | Extension: the existing `hover:-translate-y-1 hover:shadow-lg` hover cluster on the inner draggable wrapper gains a scale step + a belt-tinted box-shadow override; reduced-motion path falls back to the SESSION_0309 hover cluster verbatim. No primitive replaced. |
| Why justified | Phase 2's node-level micro-interaction (hover lift refinement) is the last remaining Phase 2 slice in the locked epic plan. Belt color is already threaded as `member.selectedRank.colorHex` from SESSION_0306 normalization, so the glow tint is a pure render-time consumer of existing data — no schema, no new prop, no new component. |
| Risk if bypassed | Phase 2 remains incomplete; the lineage tree stays at the generic `shadow-lg` lift on hover with no data-driven tint, missing the brand-aligned "belt becomes the visual identity on hover" that the petey plan calls out as the closing motion-language touch. |

Live docs checked during planning: not applicable — no Dirstarter L1 data layer; Tailwind v4
arbitrary-value utilities + custom CSS properties are standard idioms already used elsewhere in
the same canvas (e.g., the SESSION_0309 `data-open:[...]` arbitrary-property utilities on
`DrawerContent`).

### Graphify check

- Graph status: current (refreshed end of SESSION_0309: 8651 nodes, 12898 edges, 1320 communities,
  1489 files tracked).
- Queries used:
  - None this session — file paths already known from SESSION_0306 / 0307 / 0308 / 0309 working
    set (`apps/web/components/web/lineage/lineage-tree-canvas.tsx`). Single-file slice.
- Files selected / verified by direct read:
  - `apps/web/components/web/lineage/lineage-tree-canvas.tsx` (1196 lines after SESSION_0309 — owns
    the `LineageBranch` recursion + the inner draggable wrapper at line 638 + the
    `member.selectedRank` normalization at line 225)
  - `apps/web/app/styles.css` (309 lines — verified `--color-primary` token name for the fallback;
    no edits this session)
- Verification note: `member.selectedRank?.colorHex` is already in scope inside `LineageBranch`
  (line 657 already destructures it into `selectedRank={member.selectedRank}` for `LineageNodeCard`),
  so the only delta is a CSS variable inline + two hover-state classes on the inner draggable.

### Grill outcome

Two **plan-lock refinements** before execution (Petey):

1. **Resolve the duration mismatch in the petey plan / next-session entry.** The Phase 2 epic
   plan calls hover lift "`quick` 150ms `ease-in-out`," but the SESSION_0309 staged first task
   says "Keep the duration at `quick` 150ms via the existing `transition-all duration-300 ease-out`
   on the draggable (which is already there)." Those contradict — the existing class is `duration-300`.
   Lock: **keep the existing `transition-all duration-300 ease-out`** (single source of truth, no
   new transition declaration, no class churn); the scale + tint ride the existing tween. The plan's
   `quick` 150ms label is a documentation slip; the SESSION_0309 first-task wins because it
   explicitly says "the existing one" and the principle of minimum-delta favors not touching the
   already-shipped transition class. If a per-property duration override is wanted later, it's a
   separate motion-system slice.
2. **Tinted box-shadow replaces `hover:shadow-lg`, doesn't layer on top.** CSS `box-shadow`
   doesn't naturally "layer" two declarations — the later one wins. The petey plan says "layer the
   scale + tinted shadow on top," but the cleanest brand-aligned read is: the tinted shadow IS the
   refined lift shadow (it's a single declaration with the lift offset + the belt-color tint baked
   into one). Lock: **on the full-motion path, the `hover:shadow-lg` class is replaced by
   `hover:shadow-[0_10px_25px_-5px_var(--belt-tint,var(--color-primary))]`** (Tailwind v4
   arbitrary value with `var()` fallback baked into the CSS variable). On the reduced-motion path,
   `hover:shadow-lg` stays verbatim (SESSION_0309 baseline preserved). The `--belt-tint` CSS
   variable is set inline only when `member.selectedRank?.colorHex` is non-null so the `var()`
   fallback path in the class definition resolves to `--color-primary` for rankless members
   automatically.

## Petey plan

### Goal

Ship lineage epic Phase 2 final node-level slice: subtle hover scale + belt-color glow tint on
`LineageBranch`'s inner draggable, gated on `useReducedMotion()`, data-driven from
`member.selectedRank.colorHex`, brand-neutral fallback to `--color-primary`. Single commit, no new
tokens, no schema, no primitive replacement.

### Tasks

#### SESSION_0310_TASK_01 — node card hover scale + belt-tint glow

- **Agent:** Cody
- **What:** In `apps/web/components/web/lineage/lineage-tree-canvas.tsx`, inside `LineageBranch`'s
  inner draggable `<div ref={setDraggableRef}>`: (a) compute `beltTintColor =
  member.selectedRank?.colorHex ?? null`; (b) when `beltTintColor` is non-null, set the
  `--belt-tint` CSS variable on the inline `style` object via a TypeScript-safe cast; (c) bump the
  existing `hover:-translate-y-1 hover:shadow-lg` cluster to a `reduceMotion`-gated pair —
  reduced-motion path keeps the verbatim SESSION_0309 cluster (`hover:-translate-y-1
  hover:shadow-lg`), full-motion path swaps to `hover:-translate-y-1 hover:scale-[1.02]
  hover:shadow-[0_10px_25px_-5px_var(--belt-tint,var(--color-primary))]`. Keep the existing
  `transition-all duration-300 ease-out` so the scale + tinted shadow ride one tween. Do NOT touch
  the highlight wrapper (SESSION_0308 ring + dim layering) — the change is on the inner draggable
  only.
- **Steps:**
  1. In `LineageBranch` (around line 614), after computing `connectorGrowDelaySec` /
     `connectorGrowY` / `connectorGrowX`, add `const beltTintColor = member.selectedRank?.colorHex
     ?? null`.
  2. In the inner draggable's inline `style` prop (line 639), spread a TS-safe custom-property
     object when `beltTintColor` is non-null:
     `...(beltTintColor ? ({ "--belt-tint": beltTintColor } as React.CSSProperties) : null)`.
  3. In the same inner draggable's `className` (line 645), replace the literal `hover:-translate-y-1
     hover:shadow-lg` string with a `reduceMotion`-gated pair via an inline `cx` ternary — full-motion
     gets `"hover:-translate-y-1 hover:scale-[1.02]
     hover:shadow-[0_10px_25px_-5px_var(--belt-tint,var(--color-primary))]"`, reduced-motion gets
     `"hover:-translate-y-1 hover:shadow-lg"`.
  4. `cd apps/web && bun run typecheck && bun run lint`.
- **Done means:** On hover with full motion, a node card rises (translate-y-1), grows subtly
  (scale 1.02), and casts a tinted lift shadow whose color matches the practitioner's belt (e.g.,
  blue belt → blue glow; rankless → primary brand glow). Reduced-motion users see the previous
  SESSION_0309 baseline hover behavior verbatim (translate-y-1 + shadow-lg, no scale, no tint).
  No other hover state changes (drag-over ring, dim-grayscale, drag-active opacity all untouched).
  The highlight wrapper (`ring-1 ring-primary/40 shadow-md shadow-primary/10` from SESSION_0308) is
  untouched.
- **Depends on:** nothing

#### SESSION_0310_TASK_02 — Verification sweep

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

TASK_01 is a single-file inline edit (`lineage-tree-canvas.tsx`). TASK_02 (Doug) runs after. No
subagents — sequential inline.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0310_TASK_01 | Cody | Code: belt-tint CSS variable + hover state bump on inner draggable, reduced-motion-gated |
| SESSION_0310_TASK_02 | Doug | Verification |

### Open decisions

- None blocking execution. Operator phone-smoke from SESSION_0306 / 0307 / 0308 / 0309 remains
  parallel-track operator-side (wrapper override). DESI-06 / DESI-07 + D7 (S3 bucket) remain parked
  carryover.

### Risks

- **Belt color contrast against the card background.** The card background is `--color-card` (near
  white in light mode, near black in dark mode). Most belt colors (white, yellow, blue, purple,
  brown, black, red, etc.) cast visible glows on either background, but white belts on light mode
  will produce a near-invisible tint. Acceptable for v1 — the glow is a hover refinement, not the
  primary signal (the brand ring + translate-y still telegraph the hover). If white-belt hover is
  ever judged invisible enough to be a bug, a minimum-luminance floor on `--belt-tint` is a future
  motion-system tweak; not blocking this slice.
- **Tailwind v4 arbitrary-value parsing of `var()` inside `shadow-[...]`.** The class
  `hover:shadow-[0_10px_25px_-5px_var(--belt-tint,var(--color-primary))]` uses an underscore-
  separated value with a nested `var()` fallback. Tailwind v4 handles nested `var()` inside
  arbitrary values, and the comma inside `var(--belt-tint,var(--color-primary))` is interpreted
  correctly inside the bracketed value because it lives inside a `var()` function token. Pattern is
  consistent with existing `hover:[box-shadow:...]` patterns elsewhere in the ecosystem.
- **`as React.CSSProperties` cast for custom property.** React's `CSSProperties` type does not
  natively include `--*` custom properties. The cast is the standard escape hatch and is already
  used in similar shadcn-flavored stacks. No precedent in this file but it's a one-line inline
  cast, no type-system blast radius.

### Scope guard

- Do NOT add hover state to the highlight wrapper (the SESSION_0308 ring + shadow layering stays
  untouched).
- Do NOT modify the existing `transition-all duration-300 ease-out` on the inner draggable
  (settled in grill outcome — minimum-delta principle).
- Do NOT add new tokens, new keyframes, or `@theme` block edits — `--belt-tint` is per-instance,
  not a shared design token.
- Do NOT retrofit the connector grow-in or the path-trace ring choreography from SESSION_0308 /
  0309 — different surfaces, different curves.
- Do NOT touch schema / Prisma / auth / the token color palette (ADR 0022 holds; motion stays
  brand-neutral; the belt color is data, not chrome).
- Do NOT replace `LineageNodeCard` or the inner draggable structure — only one inline style spread
  + one className gating change.

### Dirstarter implementation template

- **Docs read first:** not applicable — no Dirstarter L1 data layer. Tailwind v4 arbitrary-value
  utility syntax matches the existing `data-open:[animation-duration:300ms]` /
  `data-open:[animation-timing-function:var(--ease-snappy)]` patterns in
  `apps/web/components/common/drawer.tsx` from SESSION_0309; CSS custom-property inline-style cast
  is the standard React + Tailwind v4 escape hatch.
- **Baseline pattern to extend:** existing `hover:` variant on the inner draggable + inline `style`
  prop on the same element (already used for `transform`, `zIndex`, and the SESSION_0308 ring/dim
  layering on the wrapper); reduced-motion-gated className via `cx()` ternary already used in
  multiple places in `lineage-tree-canvas.tsx`.
- **Custom delta:** per-instance `--belt-tint` CSS variable sourced from
  `member.selectedRank.colorHex` + Tailwind v4 arbitrary-value `hover:shadow-[...]` consuming the
  variable with a `var()` fallback; the reduced-motion path keeps the SESSION_0309 baseline cluster
  verbatim.
- **No-bypass proof:** nothing Dirstarter-owned is replaced; this extends the inner draggable
  wrapper inside the existing `LineageBranch` with one inline style spread + one className
  reformulation. No new primitive, no new dep, no `@theme` token.

## Cody pre-flight

### Pre-flight: node card hover lift refinement (TASK_01)

#### 1. Existing component scan

- Graphify-recall: `LineageTreeCanvas` recursive render in `LineageBranch` →
  `LineageChildGroupColumn` (from SESSION_0306 / 0307 / 0308 / 0309 working set); the inner
  draggable wrapper on line 638; `member.selectedRank` already normalized on line 225 and threaded
  to `LineageNodeCard` on line 657. Single-file slice; coordinates from prior sessions.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: not required — no L1 data layer.
- Closest L1 pattern: the SESSION_0309 `data-open:[animation-duration:300ms] data-open:[animation-
  timing-function:var(--ease-snappy)]` arbitrary-property utilities on `DrawerContent` (same
  Tailwind v4 arbitrary-value pattern); existing `cx()` reduced-motion ternaries on the same canvas
  (line 1153: `!isPinching && !reduceMotion && "transition-transform duration-300 ease-out"`).
- Primitive API spot-check: Tailwind v4 `shadow-[...]` arbitrary value accepts the underscore-
  separated value tokens and `var()` references with comma-separated fallbacks; React `style` prop
  accepts custom properties via `as React.CSSProperties` cast.

#### 3. Composition decision

- Extending existing component: `LineageBranch` (add `beltTintColor` constant + spread one custom
  property into the existing inline `style` + swap the literal hover cluster string for a
  reduced-motion-gated ternary).
- Composing existing components: same canvas consumers as SESSION_0309 — `Card`, `Avatar`, `Badge`,
  `Stack`, `Button` untouched; `motion.div` entrance wrap from SESSION_0307 untouched; ring + dim
  wrapper from SESSION_0308 untouched.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes (SESSION_0309 → node card hover lift refinement).
- ADR read: `0022-brand-chrome-resolution.md` (confirmed valid — belt color is brand-neutral data
  from `Rank.colorHex`, not a per-brand chrome decision; the glow is a render-time tint not a
  schema or theme change).
- Runbook consulted: `docs/runbooks/design/motion-system.md` (hover micro-interactions, reduced-
  motion mandate, brand-neutral motion principle).

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo` (FS-0002, not used this slice).
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`.
- Brand/host for testing: behavioral diff verifiable in code review; operator browser smoke
  recommended (not a block per wrapper override).

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001 (scratch components vs L1) — standing; FS-0024 (cwd/remote
  guard before mutating git) — will run before commit; FS-0025 (single-push order, graphify before
  commit) — will follow.
- Mitigation acknowledged: no new components / primitives added; the change is one inline-style
  spread + one className gating swap on the existing inner draggable inside `LineageBranch` (no
  DOM growth). Reduced-motion fallback is mandatory and included (`cx()` ternary on `reduceMotion`
  preserves the SESSION_0309 baseline cluster verbatim when reduced motion is true).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0310_TASK_01 | landed | Added `const beltTintColor = member.selectedRank?.colorHex ?? null` in `LineageBranch` after the connector-grow helpers; spread `{ "--belt-tint": beltTintColor } as CSSProperties` into the inner draggable's inline `style` (alongside `transform` / `zIndex`); replaced the literal `hover:-translate-y-1 hover:shadow-lg` cluster on the inner draggable's className with a `reduceMotion` ternary — full-motion path is `"hover:scale-[1.02] hover:shadow-[0_10px_25px_-5px_var(--belt-tint,var(--color-primary))]"`, reduced-motion path is the verbatim SESSION_0309 `"hover:shadow-lg"`. Added `CSSProperties` to the existing `react` named import to keep the cast inline-typed (React isn't default-imported in this file). Existing `transition-all duration-300 ease-out` on the same div carries the scale + tinted-shadow tween — no new transition. No other hover state classes changed (drag-over ring, dim-grayscale, drag-active opacity untouched). Highlight wrapper (SESSION_0308 ring + dim layering) untouched. |
| SESSION_0310_TASK_02 | landed | Verify: typecheck (1 error in `lineage-tree-canvas.tsx` line 1178 — the same pre-existing H6 render-prop noise from `components/common/heading.tsx`'s Base-UI signature mismatch; shifted from line 1165 at SESSION_0309's close → 1178 here from the new `CSSProperties` import token + the comment block + `beltTintColor` const + inline-style spread + the expanded `cx` cluster; zero new errors), lint (1 pre-existing warning `lineage-profile-drawer.tsx:177` unused `treeId`, zero new — biome auto-fixed 1 file formatting only), tree-layout test 3/3, wiki:lint **0 errors** + 8 warnings (same 2 stale-frontmatter + 6 R8 nits in `petey-plan-0305.md` as SESSION_0309's close). |

## What landed

- **`--belt-tint` per-instance CSS variable on the inner draggable (TASK_01):**
  `apps/web/components/web/lineage/lineage-tree-canvas.tsx`'s `LineageBranch` now computes
  `beltTintColor = member.selectedRank?.colorHex ?? null` and (when non-null) spreads
  `{ "--belt-tint": beltTintColor } as CSSProperties` into the inner draggable's existing inline
  `style` prop. Belt color flows from the SESSION_0306 `normalizeMembers` projection
  (`member.selectedRankAward?.rank.colorHex` → `member.selectedRank.colorHex`); no new prop, no
  schema touch, no new threading through the recursion. The `as CSSProperties` cast is the
  standard React + TypeScript escape hatch for custom CSS properties; the file's existing
  `react` named import grew `type CSSProperties` next to the existing hook imports.
- **Hover scale + belt-color glow on the full-motion path (TASK_01):** on the inner draggable's
  className, the literal `hover:-translate-y-1 hover:shadow-lg` cluster split into a `cx()`
  ternary on `reduceMotion`. Full-motion path is `hover:-translate-y-1 hover:scale-[1.02]
  hover:shadow-[0_10px_25px_-5px_var(--belt-tint,var(--color-primary))]` — the Tailwind v4
  arbitrary-value `shadow-[...]` consumes the `--belt-tint` CSS variable with a baked-in
  `var(--color-primary)` fallback, so rankless members get the brand-primary glow with no
  inline-style work needed. Reduced-motion path is the verbatim SESSION_0309 baseline cluster
  (`hover:-translate-y-1 hover:shadow-lg`) — no scale, no tint, no behavior change for users who
  opt out of motion.
- **Single-tween, no new transition (TASK_01):** the existing `transition-all duration-300
  ease-out` on the inner draggable carries the new scale + tinted-shadow alongside the existing
  translate-y, so all three hover deltas tween together. The plan-lock grill outcome resolved the
  petey-plan documentation slip (`quick` 150ms vs. existing `duration-300`) by keeping the
  existing transition — minimum-delta principle, no class churn, no new motion-system token
  introduction.
- **Scope discipline (TASK_01):** Did NOT touch the highlight wrapper (the SESSION_0308 `ring-1
  ring-primary/40 shadow-md shadow-primary/10` + `opacity-45 grayscale-[15%]` layering on the
  rounded wrapper between the entrance `motion.div` and the dnd-kit draggable stays exactly as
  shipped). Did NOT modify the existing `transition-all duration-300 ease-out` (settled in the
  grill). Did NOT add a new `@theme` token, new keyframes, or a per-property duration override —
  `--belt-tint` is per-instance data, not a shared design token. Did NOT retrofit the connector
  grow-in (SESSION_0309) or the path-trace choreography (SESSION_0308). Did NOT touch schema /
  Prisma / auth / the token color palette (ADR 0022 holds; belt color is brand-neutral data, not
  chrome). DnD ref/listeners and the drag-over ring (`isOver`) + drag-active opacity (`isDragging`)
  are unchanged.
- **Goal achieved.** Phase 2 closing slice landed: node card hover lift refinement with belt-color
  glow, brand-neutral data-driven, reduced-motion-safe, single commit. Phase 2 motion language for
  the lineage tree (entrance stagger SESSION_0307, animated path trace SESSION_0308, connector
  grow-in + drawer entrance refinement SESSION_0309, and now hover lift refinement) is complete;
  Phase 3 (belt-rail integration + family-tree templates) is the next epic phase, with its 3-0
  schema slice (`RankAward.organizationId`) staged as the entry-point session.

## Decisions resolved

- **Plan-lock #1 — keep the existing `transition-all duration-300 ease-out`, do not add a `quick`
  150ms override (grill outcome):** the petey plan and SESSION_0309 next-session entry disagreed
  on duration. The next-session entry explicitly said "the existing one (which is already there)";
  the existing class is `duration-300`. Lock: keep the existing transition, ride the scale + tint
  on it. Minimum-delta wins; if a per-property duration override is ever wanted for hover, it's a
  separate motion-system slice (probably alongside an `--ease-out-hover` token in `@theme`).
- **Plan-lock #2 — tinted shadow replaces `hover:shadow-lg`, doesn't layer on top (grill
  outcome):** CSS box-shadow doesn't naturally "layer" two declarations (the later one wins). The
  petey plan said "layer on top," but the cleanest brand-aligned read is: the tinted shadow IS the
  refined lift shadow (single declaration with lift offset + belt-color tint baked in). Lock: on
  the full-motion path, swap `hover:shadow-lg` for
  `hover:shadow-[0_10px_25px_-5px_var(--belt-tint,var(--color-primary))]`. On the reduced-motion
  path, `hover:shadow-lg` stays verbatim. The `--belt-tint` variable is only set inline when the
  member has a selected rank — the `var()` fallback resolves to `--color-primary` automatically
  for rankless members, so no per-rankless branch is needed.
- **`type CSSProperties` named import instead of `as React.CSSProperties` (scope check):** the
  file uses `react/jsx-runtime` automatic JSX and never imports the `React` namespace as a
  default. Importing `React` just for the type cast would be a new top-level dep on the namespace
  for one inline use. Instead, added `type CSSProperties` to the existing
  `import { useEffect, useMemo, useRef, useState } from "react"` line — TS-only, zero runtime
  cost, no namespace pollution. Matches the codebase convention of named-import-everything for
  React types.

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0310.md` | This session file |
| `apps/web/components/web/lineage/lineage-tree-canvas.tsx` | Added `type CSSProperties` to the `react` named import; added `beltTintColor` const + lead-in comment block after the `connectorGrow*` helpers inside `LineageBranch`; spread `{ "--belt-tint": beltTintColor } as CSSProperties` into the inner draggable's existing inline `style` (gated on non-null `beltTintColor`); replaced the literal `hover:-translate-y-1 hover:shadow-lg` cluster with a `reduceMotion`-gated `cx()` ternary — full-motion adds `hover:scale-[1.02]` + `hover:shadow-[0_10px_25px_-5px_var(--belt-tint,var(--color-primary))]`, reduced-motion keeps the SESSION_0309 baseline. Biome auto-fixed 1 formatting nit in the file. |
| `docs/petey-plan-0305.md` | Added SESSION_0310 to `pairs_with`; bumped `last_agent` to `claude-session-0310` |
| `docs/knowledge/wiki/custom-component-inventory.md` | Extended the `LineageTreeCanvas` row with the SESSION_0310 hover-lift refinement description; added SESSION_0310 to `pairs_with`; bumped `last_agent` |
| `docs/knowledge/wiki/index.md` | Added SESSION_0310 session row (closed); bumped `last_agent` |
| `docs/knowledge/wiki/log.md` | Appended SESSION_0310 entry; bumped `last_agent` |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` (apps/web) | Errors in touched files = same pre-existing baseline as SESSION_0309's close. `lineage-tree-canvas.tsx` retains exactly one pre-existing error: the H6 render-prop noise from `components/common/heading.tsx`'s Base-UI signature mismatch (line 1165 at SESSION_0309's close → line 1178 here, shifted by the new `CSSProperties` import token + the new comment block + `beltTintColor` const + the inline-style spread + the expanded `cx` cluster). Zero new errors from this session. The broader repo's ~340 pre-existing TypeScript error lines (duplicated `@types/react@19.2.14` resolution + `next.config.ts` adapterPath drift + `services/resend.ts` Resend SDK API drift) are unchanged. |
| `bun run lint` (apps/web) | 1 pre-existing warning only: `lineage-profile-drawer.tsx:177` unused param `treeId` — same as SESSION_0306 / 0307 / 0308 / 0309, untouched this session. Zero warnings in `lineage-tree-canvas.tsx`. Biome auto-fixed 1 file (formatting only — the new `type CSSProperties` import landed sorted; otherwise idempotent). |
| `bun test lib/lineage/tree-layout.test.ts` | 3 pass / 0 fail (pure layout module the canvas consumes — no regression). |
| `bun run wiki:lint` (repo root) | **0 errors**, 8 warnings (2 >30d stale-frontmatter on unrelated docs + 6 R8 markdown nits in `petey-plan-0305.md`, ALL pre-existing — identical to SESSION_0308 / 0309's close). |
| Live hover replay (full motion) | Not run — no live browser interaction harness in sandbox. The change is declarative: one inline CSS variable + Tailwind v4 arbitrary-value hover utilities ride the existing `transition-all duration-300 ease-out`. Worst case at runtime is the SESSION_0309 baseline hover (translate-y + shadow-lg) if Tailwind v4 fails to register the `hover:shadow-[...]` arbitrary value — and the `hover:scale-[1.02]` + `hover:-translate-y-1` arrive via the same `cx()` cluster, so they degrade independently. **Operator browser smoke at desktop and mobile recommended (operator-side per wrapper override).** |
| Live hover replay (reduced motion) | Not run — same harness gap. The reduced-motion path is byte-equivalent to SESSION_0309's `hover:-translate-y-1 hover:shadow-lg` cluster (no new classes added when `reduceMotion === true`). **Operator browser smoke recommended.** |

## Open decisions / blockers

- **Operator phone-smoke from SESSION_0306 / 0307 / 0308 / 0309 + this session** — Phase 1 pinch-
  zoom/auto-fit + Phase 2 entrance stagger + animated path trace + connector grow-in + drawer
  snappy entrance + node card hover lift refinement verification on a real device is still
  pending; an operator-side check, not blocking the next code slice.
- **Phase 2 wrap-up** — with the hover-lift refinement landed, Phase 2's locked epic-plan slice
  list for the lineage tree is exhausted. Group expand/collapse (accordion-style staggered child
  reveal — Balkan OrgChart grouping) was mentioned in SESSION_0309's "Phase 2 wrap candidates"
  bullet but the locked plan classified it as a Phase 3 slice (`3b`). Next-session entry below
  hands off to Phase 3-0 (the `RankAward.organizationId` schema slice).
- DESI-06 / DESI-07 (carryover) — parked brand-parity calls for Brandon.
- D7 (carryover) — S3 bucket provisioning, Brian's AWS console task.

## Next session

### Goal

Begin lineage epic **Phase 3 — Org Chart Board template + belt-rail integration**
(`docs/petey-plan-0305.md`). Land the **Phase 3-0 schema slice**: add a nullable
`RankAward.organizationId` FK (with `location` retained as free-text fallback) per the
SESSION_0306 grill outcome (extends ADR 0016 — "RankAward is the canonical promotion fact"). This
is the one genuine schema change in Phase 3; it captures the awarding school distinct from the
practitioner's current `Membership → Organization` affiliation. The Phase 3-0 slice routes through
the schema-migration runbook (FS-0006 — Prisma changes go through Petey + ADR amendment); follows
`docs/runbooks/database/schema-migration.md`. Phase 3a (`layout="board"` mode +
`LineageCompactChildList`) depends on this schema slice to source the per-belt awarding-school
data — landing the schema first unblocks the rendering work in subsequent sessions.

### First task

Read `docs/architecture/decisions/0016-*` (RankAward canonical-fact ADR) and
`docs/runbooks/database/schema-migration.md` end-to-end before any Prisma edits. Then in
`prisma/schema.prisma`, add `organizationId String?` + the matching `organization Organization?
@relation("RankAwardAwardingOrganization", fields: [organizationId], references: [id], onDelete:
SetNull)` to the `RankAward` model. Mirror the inverse relation on `Organization` (one-to-many,
named relation). Run `bun prisma migrate dev --name rank_award_awarding_organization` from
`apps/web` (FS-0006 — go through Petey before invoking). Backfill is null-safe; existing rows
remain on the free-text `location` until manually mapped. Regenerate the Prisma client. Verify
typecheck still passes (no consumer code references the new field yet). Stage ADR 0016 amendment
note describing the additive change (Petey approves before adding the amendment row). DO NOT
touch any UI surface in the same slice — the rendering work is Phase 3a in the next session.

## Review log

### SESSION_0310_REVIEW_01 — lineage epic Phase 2 closing slice (hover lift refinement)

- **Reviewed tasks:** SESSION_0310_TASK_01 and SESSION_0310_TASK_02.
- **Dirstarter docs check:** not applicable — no Dirstarter L1 data layer touched. Tailwind v4
  arbitrary-value utility syntax matches the existing `data-open:[animation-duration:300ms]` +
  `data-open:[animation-timing-function:var(--ease-snappy)]` pattern landed on `DrawerContent` at
  SESSION_0309. ADR 0022 (token architecture, motion stays brand-neutral) confirmed valid — belt
  color flows from `Rank.colorHex` (brand-neutral data), not a per-brand chrome decision.
- **Verdict:** Disciplined Phase-2 closing slice — single-file inline edit on the existing
  `LineageBranch` inner draggable: one TypeScript-only import token addition, one comment block,
  one `beltTintColor` const, one inline-style spread on existing `style` prop, one `cx()` ternary
  swap of the existing hover cluster. Belt color reuses already-normalized data
  (`member.selectedRank.colorHex` from SESSION_0306) — no new prop threading, no schema, no new
  Petey/ADR routing. Reduced-motion path collapses to byte-identical SESSION_0309 baseline. The
  `var(--color-primary)` fallback baked into the Tailwind arbitrary-value class removes the need
  for a per-rankless inline-style branch. Plan-lock grill resolved two real petey-plan ambiguities
  (duration mismatch + "layer on top" of box-shadow) with minimum-delta reasoning. Verification
  honest: the H6 render-prop noise re-attributed correctly (line 1165 → 1178, accounting for the
  new `CSSProperties` import token + 4 new logical lines in `LineageBranch`); zero new
  lint/test/wiki-lint regressions; biome auto-fix limited to formatting.
- **Score:** 9.0/10.
- **Follow-up:** Phase 3-0 schema slice (`RankAward.organizationId` nullable FK) — schema-only
  Prisma change, routes through Petey + ADR 0016 amendment, no UI in the same slice.

## Hostile close review

- **Giddy:** pass — the change is one declarative inline CSS variable + Tailwind v4 hover utility
  swap on an existing draggable. No new event handlers, no new effects, no new refs. The
  `beltTintColor` is a pure derived value with no closure or memo overhead. The custom-property
  inline spread is gated on non-null, so rankless members never emit the property — DOM stays
  minimal. The `cx()` ternary on `reduceMotion` keeps both code paths inside the existing
  className construction (no JSX branching, no conditional render). `"use client"` already present;
  TypeScript `CSSProperties` import is type-only and erased at runtime. No SSR/hydration risk
  (the CSS variable is a string identity that doesn't depend on client-only state). The biome
  auto-fix was formatting-only and idempotent.
- **Doug:** pass — verification honest. Zero new typecheck errors in the changed file. The
  pre-existing H6 render-prop error shifted from line 1165 → 1178 as expected from the new
  `CSSProperties` import token + comment block + `beltTintColor` const + the expanded `cx`
  cluster + the inline-style spread. Other touched-file error sets unchanged (drawer + lineage-
  profile-drawer pre-existing Base-UI signature noise). Zero new lint warnings (same 1 pre-
  existing unused `treeId` param as SESSION_0306 / 0307 / 0308 / 0309). Tree-layout test 3/3
  unchanged. Wiki-lint **0 errors** / 8 warnings — identical to SESSION_0309's close (same 2
  stale-frontmatter + 6 R8 nits in `petey-plan-0305.md`, all pre-existing).
- **Desi:** pass — token-light, data-driven brand-aligned hover refinement: the practitioner's
  belt becomes the visual identity on hover without introducing a new design token (per-instance
  data, not a shared shareable). Motion-system principles respected: restraint (subtle 2% scale +
  glow, no spring physics), precision (rides existing 300ms ease-out tween, single declaration),
  weight (the tinted box-shadow is offset + tinted, not just a flat ring). Reduced-motion path is
  byte-identical to SESSION_0309's hover baseline — opt-out users see zero change in feel.
  Fallback to `--color-primary` keeps rankless members brand-aligned without a separate code path.
  ADR 0022 holds (no per-brand chrome introduced; the variable is data, not theme).
- **Kaizen aggregate:** 9.0/10 — high closing-slice payoff (Phase 2 motion language for the
  lineage tree is now complete with belt color as the hover identity), near-zero blast radius
  (single-file inline edit, one TS-only import + one inline-style spread + one cx ternary swap),
  reduced-motion path collapses to byte-identical SESSION_0309 baseline, no new tokens / keyframes
  / schema / Prisma / Petey-ADR routing required, and the close did not introduce any new
  wiki-lint warnings.

## ADR / ubiquitous-language check

- ADR update **not required.** No architectural decision made/changed/rejected — the `--belt-tint`
  CSS variable is a per-instance render-time data binding (member's selected rank color flows to a
  hover-only CSS variable), not a token system change. ADR 0022 (Brand Chrome / token architecture)
  confirmed valid (untouched; motion + belt color stay brand-neutral; the belt color is data, not
  chrome). ADR 0016 (RankAward canonical fact + lineage display rules) confirmed valid (untouched
  this slice; the next-session Phase 3-0 schema slice will append an amendment row for
  `organizationId`).
- Ubiquitous language update **not required** — no new domain terms (`--belt-tint` and
  `beltTintColor` are CSS / motion mechanics, not domain language; `Rank.colorHex` is already in
  the ubiquitous-language reference from the SESSION_0306 normalization).

## Reflections

- **Per-instance data + Tailwind arbitrary-value `var()` fallback removes a whole code branch.**
  The naive sketch had two inline-style branches: (1) set `--belt-tint` when `selectedRank` is
  non-null, (2) set `--belt-tint: var(--color-primary)` when null. By baking the fallback into
  the Tailwind arbitrary value itself
  (`hover:shadow-[0_10px_25px_-5px_var(--belt-tint,var(--color-primary))]`), the second branch
  disappears — CSS's `var()` second argument is the fallback, and an unset custom property
  resolves to that fallback automatically. The inline style only needs to set `--belt-tint` when
  there's a real value to set, and the rankless case takes care of itself. One-step CSS fallback >
  two-step inline-style fallback. Worth remembering whenever a per-instance variable has a sane
  default.

- **`type CSSProperties` named import beats `as React.CSSProperties` when React isn't in scope.**
  The file uses automatic JSX runtime and never imports the `React` namespace. The `as
  React.CSSProperties` cast would require introducing the namespace import (`import type React
  from "react"` or `import * as React from "react"`) just for one inline use — a top-level
  dependency for a single TS-only assertion. Instead, adding `type CSSProperties` to the existing
  named import line keeps the cast inline (`as CSSProperties`), zero runtime cost, no namespace
  pollution. The codebase convention is named-import-everything for React types; this matches.

- **Petey grill's job at bow-in is to find documentation slips, not just to plan execution.** The
  petey plan said `quick` 150ms `ease-in-out`; the SESSION_0309 staged first task said "the
  existing one (which is already there)" — and the existing class was `duration-300`. Both came
  from the same author at different times, and one was wrong. Grilling the plan against the
  actual file caught the slip pre-execution; the alternative was either silently shipping a
  duration drift or post-hoc backfill in the SESSION file. The fix: minimum-delta wins —
  preserving the already-shipped transition costs nothing and avoids a debate that would
  consume time better spent on Phase 3. The grill outcome lives in the SESSION file as a
  plan-lock decision, so the rationale is part of the audit trail.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0310 frontmatter complete (`status: closed`, `last_agent: claude-session-0310`); `custom-component-inventory.md` + `petey-plan-0305.md` + `index.md` + `log.md` bumped `last_agent` + (where applicable) `updated` (+ SESSION_0310 added to inventory/plan `pairs_with`); code files carry no doc frontmatter |
| Backlinks/index sweep | `index.md` gained SESSION_0310 row (closed); `log.md` gained SESSION_0310 entry; inventory ↔ SESSION_0310 and plan ↔ SESSION_0310 cross-linked both directions |
| Wiki lint | `bun run wiki:lint` → **0 errors**, 8 warnings (2 >30d stale-frontmatter + 6 R8 markdown nits in `petey-plan-0305.md`, all pre-existing — identical to SESSION_0309's close) |
| Kaizen reflection | Reflections section present: yes (3 notes) |
| Hostile close review | SESSION_0310_REVIEW_01 — 9.0/10; Giddy/Doug/Desi all pass |
| Review & Recommend | Next session goal written: yes (Phase 3-0 schema slice — `RankAward.organizationId` nullable FK via `prisma migrate dev`, routes through Petey + ADR 0016 amendment, no UI in the same slice) |
| Memory sweep | Existing project memories load-bearing for SESSION_0310: `motion-system-and-haptics-constraints.md` (motion idiom, reduced-motion fallback discipline, belt color = `Rank.colorHex` data) and `lineage-canvas-zoom-and-dnd-constraints.md` (DnD/inner-draggable composition). No new memory needed: `--belt-tint` + the Tailwind v4 arbitrary-value `var()` fallback idiom are visible in the code + the custom-component-inventory; the "named-import `type CSSProperties` over `as React.CSSProperties`" and "fallback-in-var() removes the rankless branch" lessons are session-scoped reflections, not project-scoped facts. |
| Next session unblock check | Phase 3-0 schema slice (`RankAward.organizationId` nullable FK) is doable without a device but DOES require Petey routing per FS-0006 (Prisma schema changes go through Petey + an ADR amendment row). The next-session entry calls this out explicitly. Operator phone-smoke from SESSION_0306 / 0307 / 0308 / 0309 + this session remains a parallel operator-side check, not a blocker. |
| Git hygiene | reported at bow-out — see git log (single commit to `auto/session-0310`; FS-0024 guard ran; FS-0025 single-push order; **wrapper override: COMMIT to current branch but DO NOT push and DO NOT open PR — wrapper handles push + PR**) |
| Graphify update | Ran BEFORE the close commit (FS-0025) — `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` → 8673 nodes, 12925 edges, 1296 communities, 1491 files tracked |
