---
title: "SESSION 0583 — G-022 Lane A slice S2: neighborhood glow, empty states, difficulty tooltips, WL-P2-65/66"
slug: session-0583
type: session--implement
status: closed
created: 2026-07-20
updated: 2026-07-20
last_agent: claude-session-0583
sprint: S12
lane: bbl
lane_seq:
vault_session:
goal_ids: [G-022]
tickets: []
next_session:
pairs_with:

  - docs/sprints/SESSION_0578.md
  - docs/sprints/SESSION_0581.md
  - docs/sprints/SESSION_0582.md
  - docs/sprints/SESSION_0546.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0583 — G-022 Lane A slice S2: neighborhood glow, empty states, difficulty tooltips, WL-P2-65/66

## Date

2026-07-20

## Operator

Brian + claude-session-0583 (dispatched by the SESSION_0587 overnight orchestrator, operator-authorized; forks pre-pinned at SESSION_0582)

## Goal

LANE A of the G-022 fan-out ("Technique graph out of beta"), **slice S2**: C5 selected/hovered-
node neighborhood glow · D3 empty states (graph type-filter AND the curriculum browser's
topic-filter grid, AUD2-7) · B2 difficulty-term tooltips (graph-side) · WL-P2-65 PNG-export label
clip (disambiguation experiment first) · WL-P2-66 reduced-motion cascade fix in
`lib/utils.ts#popoverAnimationClasses` (shared primitive — affected e2e attempted).

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0581.md` (S1: C4 easing, WL-P2-67, D-4 touch,
  AUD2-3/8/9 — landed, merged to `main`). Also read `docs/epics/technique-graph-ga-fanout.md`
  (lane ownership/disjointness), `docs/sprints/SESSION_0578.md` (full AUD2 audit + the verbatim
  S2 slice prompt), `docs/sprints/SESSION_0546.md` (Desi Wave 2 spec: C5/D3/B2 line items), and
  the goals-ledger G-022 row (read-only) + wiring-ledger WL-P2-65/66 rows.
- Carryover: SESSION_0581 named this slice's scope verbatim in its "Next session" block; S1's
  reflection flagged `motion/react`'s `useReducedMotion()` as returning stale values under a
  flipped/emulated `prefers-reduced-motion` — directly informed WL-P2-66's fix choice (CSS
  `motion-reduce:` idiom, never the hook).

### Branch and worktree

- Branch: `session-0583-technique-s2`
- Worktree: `/Users/brianscott/dev/ronin-0583` (fresh; `git log --oneline main..<branch>` was
  empty before reset — branch existed with no unique commits; reset to `origin/main` per the
  invariant sequence). Bootstrapped: `bun install` (756 packages), `prisma generate`, `.env`
  copied from canonical.
- Status at bow-in: clean.
- Current HEAD at bow-in: `e2ef96a5` (= `origin/main`, "SESSION_0582 full close").

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Content (techniques/curriculum) — UI/interaction polish + one shared-primitive CSS fix; no schema/content-model change |
| Extension or replacement | Extension: `technique-graph.tsx` and `bjj-curriculum-browser.tsx` (existing L1-composed components — Card/Button/Badge/Tooltip/EmptyList); `lib/utils.ts`'s existing `popoverAnimationClasses` array patched, not replaced |
| Why justified | Interaction-quality + accessibility-correctness work on already-shipped components; reuses established L1 primitives and the repo's own `!` important-modifier idiom (already used in this same file) |
| Risk if bypassed | None identified — no new component, no new dependency, no schema change |

Live docs checked during planning: not applicable (no Dirstarter template docs touched).

### Graphify check

- Graph status: canonical checkout graph queried (worktree graph is 0 nodes by design, not a
  negative signal).
- Query used: `graphify query "technique graph neighborhood glow empty states tooltip WL-P2-65
  WL-P2-66 reduced motion popoverAnimationClasses" --budget 1500` (run from
  `/Users/brianscott/dev/ronin-dojo-app`).
- Files selected from graph + direct read: `components/web/techniques/technique-graph.tsx`,
  `server/web/techniques/node-tooltip.ts`, `server/web/techniques/graph-query.ts`,
  `components/web/curriculum/bjj-curriculum-browser.tsx`, `lib/utils.ts`,
  `components/common/tooltip.tsx`, `components/common/dropdown-menu.tsx`,
  `components/common/empty-list.tsx`, `docs/epics/technique-graph-ga-fanout.md`,
  `docs/knowledge/wiki/goals-ledger.md`, `docs/knowledge/wiki/wiring-ledger.md`.
- Verification note: every claim below is backed by a direct file read or a live runtime
  probe — graph output used as navigation only.

### Grill outcome

Not applicable — this is a pinned execution dispatch continuing SESSION_0578's paste-ready Lane A
S2 slice; no open forks in S2's own scope (AUD2-6 multi-art identity remains S4-blocking only, not
touched here).

### Drift logged

- **New finding (not in any ledger row I could find):** the C5 spec's literal wording
  ("selected-node neighborhood glow") most naturally maps to the code's existing `selectedNodeId`
  (the click-opens-dialog state). I built it that way FIRST, then **live-screenshotted it and
  found the dialog's own backdrop (`bg-foreground/10 backdrop-blur-sm`) makes the glow
  imperceptible** — a real, evidence-based reason to diverge from the literal reading. Re-designed
  to trigger on **hover** (live, pre-dialog, visible) with `selectedNodeId` kept as a fallback
  source. Documented as a judgment call, not silently overridden — see "Decisions resolved".
- **New finding (pre-existing, unrelated to this lane's 5 owned files):** `/privacy/request`,
  when visited authenticated via the e2e auth helper (`e2e/helpers/auth.ts`), deterministically
  redirects to `/` instead of rendering the DSR form — reproduced identically across a full
  dev-server restart and two independent `bun run test:e2e:local` invocations. Root-caused as far
  as: `page.tsx`'s only redirect condition (`!session?.user`) is provably NOT the cause (URL
  landed on `/`, not `/auth/login`); `getPageData`'s title is a hardcoded literal, so the
  rendered "Build Your Legacy" H1 can only come from an actual navigation to the homepage, not
  from `/privacy/request`'s own tree. Does not touch any of this lane's owned files (auth/session
  code, `e2e/helpers/*`, and the DSR route are all outside scope) — reported for the ledger, not
  fixed. See "Proposed ledger edits".
- **New finding (local-environment data gap, out of scope):** `/curriculum` 404s on BOTH the
  local `ronindojo_prodsnap` snapshot and the freshly-migrated `ronindojo_e2e` DB —
  `getBjjCurriculumLibrary` requires `Course` rows with `slug` prefixed `bjj-level-`, and
  `db.course.count({ where: { slug: { startsWith: "bjj-level-" } } })` returns **0** on both.
  This predates SESSION_0583 (the importer that seeds this data is Lane C's
  `import-bbl-bjj-curriculum.ts`, explicitly out of my NON-GOALS as "prisma anything") — it
  blocked a live-route runtime proof of AUD2-7, substituted with a component-level test (see
  Verification).

## Petey plan

### Goal

Land S2 exactly as scoped: C5, D3 (graph + AUD2-7 curriculum), B2, WL-P2-65, WL-P2-66 — each with
a computed-value or real-bytes runtime proof, then commit locally and hold at the push gate.

### Tasks

#### SESSION_0583_TASK_01 — C5 selected/hovered-node neighborhood glow

- **Agent:** Cody
- **What:** Highlight a node's 1-hop-connected neighbors (nodes + edges) with a soft primary
  ring/shadow while exploring the graph.
- **Done means:** live computed `box-shadow` on a neighbor node includes an `oklab(...primary
  40%) 0px 0px 0px 1px` ring layer while hovered; a non-neighbor node's `box-shadow` is
  unchanged; the hovered/selected node's own box-shadow is NOT the neighbor-glow class.
- **Depends on:** nothing

#### SESSION_0583_TASK_02 — D3 empty states (graph + AUD2-7 curriculum)

- **Agent:** Cody
- **What:** Graph: an `EmptyList`-style overlay + "Show all techniques" reset when a type filter
  yields zero visible nodes. Curriculum: the SAME idiom (community-feed.tsx's inline text-link
  reset) when a topic filter yields zero items for the selected level.
- **Done means:** conditional render verified by direct code read + (curriculum) a component test
  exercising the reachable branch; graph branch is currently unreachable with real data (all 4
  type filters have ≥11 nodes) — documented honestly, not overclaimed live.
- **Depends on:** nothing

#### SESSION_0583_TASK_03 — B2 difficulty-term tooltips (graph-side)

- **Agent:** Cody
- **What:** Humanize the raw `DifficultyLevel` enum and add a hover/focus tooltip explaining what
  each term means, on the node dialog's difficulty Badge.
- **Done means:** live screenshot shows "Beginner" badge + tooltip "Safe to drill from day one —
  no prior technique required." on a real seeded technique (`triangle`).
- **Depends on:** nothing

#### SESSION_0583_TASK_04 — WL-P2-65 PNG-export label clip (disambiguation experiment first)

- **Agent:** Cody
- **What:** Reproduce the ledger's two candidate variables (font-family pin; fixed node
  height/overflow) in isolation against REAL html2canvas captures, find the actual cause, fix it,
  re-verify with real export bytes from the real "Download PNG" button.
- **Done means:** a real downloaded PNG shows "Closed Guard" (and 2 other spot-checked nodes)
  with intact, unclipped glyphs.
- **Depends on:** nothing

#### SESSION_0583_TASK_05 — WL-P2-66 reduced-motion cascade fix (shared primitive)

- **Agent:** Cody
- **What:** Fix `popoverAnimationClasses` in `lib/utils.ts` so `motion-reduce:animate-none`
  actually wins the cascade; verify on ≥2 consumer surfaces; run the affected e2e.
- **Done means:** computed `animation-name` is `none` under emulated reduce on 2 independent
  Tooltip trigger compositions, `enter` under no-preference (no regression); affected e2e
  attempted (blocked by a pre-existing, unrelated environment issue — documented).
- **Depends on:** nothing

### Parallelism

All five land in the same reviewable diff set (4 files) — sequential by construction (C5→D3→B2
built together in `technique-graph.tsx`/`bjj-curriculum-browser.tsx`, then WL-P2-65 experiment,
then WL-P2-66), not parallelized across sub-agents.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0583_TASK_01–05 | Cody | single-lane interaction/a11y/shared-primitive build; no sub-agent fan-out needed |

### Open decisions

None ratified as forks — S2 scope is fully pinned by the dispatch. One judgment call made and
documented (C5's hover-vs-selection trigger — see Drift logged / Decisions resolved).

### Risks

Sibling worktrees run in parallel on the same host (load average observed 83–287 across the
session) — mitigated by touching only the 5 owned files, running the e2e DB setup in this
worktree's own `.env.e2e` overlay, and treating shared-DB test contention as expected noise per
the SESSION_0581 precedent.

### Scope guard

No beta-flip, no layout JSON edit, no server/prisma/router touch beyond the two owned
`node-tooltip.ts` additions (no DTO/graph-query change was needed — `difficultyLevel` already
existed on the DTO), no new dependency, no curriculum-data seeding/import (Lane C territory).

### Dirstarter implementation template

- **Docs read first:** SESSION_0578 (S2 prompt verbatim), SESSION_0546 (Desi spec), SESSION_0581
  (S1 precedent + the `useReducedMotion` staleness finding), wiring-ledger WL-P2-65/66.
- **Baseline pattern to extend:** `technique-graph.tsx`'s existing node/edge rendering and
  `withExportSafeStyles` snapshot/restore machinery; `bjj-curriculum-browser.tsx`'s existing
  level/topic filter; `community-feed.tsx`'s EmptyList+inline-reset idiom;
  `lineage-tree-canvas/lineage-branch.tsx`'s `isInSelectedPath` ring/shadow idiom (C5's exact
  visual precedent); `verified-badge.tsx`/`product-features.tsx`'s Tooltip-on-non-button-element
  idiom (B2's trigger precedent).
- **Custom delta:** C5's hover-driven neighbor-set computation; the export-capture line-clamp
  substitution (WL-P2-65); the `!` important-modifier fix (WL-P2-66, mirroring this same file's
  own `border-transparent!` precedent).
- **No-bypass proof:** zero new components, zero new dependencies; every new class combination
  used already exists elsewhere in the codebase (`ring-1 ring-primary/40 shadow-md
  shadow-primary/10` is verbatim from `lineage-branch.tsx`).

## Cody pre-flight

### Pre-flight: technique-graph.tsx (C5, D3, B2, WL-P2-65)

#### 1. Existing component scan

- Found: `components/common/empty-list.tsx` (EmptyList, used with the `community-feed.tsx`
  inline-reset idiom), `components/common/tooltip.tsx`, `components/common/card.tsx`,
  `components/common/badge.tsx` — all reused as-is, no new component created.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md`: not applicable — no new UI
  component; existing Badge/Card/Tooltip/EmptyList reused.
- Closest L1 pattern: `lineage-tree-canvas/lineage-branch.tsx`'s `isInSelectedPath` glow (C5);
  `community-feed.tsx`'s `EmptyList` + inline text-link reset (D3); `verified-badge.tsx`'s
  Tooltip-on-non-button trigger (B2).

#### 3. Composition decision

- Extending existing components in place: `TechniqueGraph`, `GraphEdge`, `BjjCurriculumBrowser`.
  No new component files.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes (SESSION_0581).
- ADR read: none required (no architectural decision).
- Runbook consulted: `docs/protocols/fan-out-session-recipe.md` (lane-continuation shape),
  `docs/runbooks/sops/sop-test-writing.md` (component test pattern for the AUD2-7 unit proof).

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo -p 3583`.
- Working directory: `/Users/brianscott/dev/ronin-0583`.
- Brand/host for testing: local, `http://localhost:3583/techniques/graph` +
  `http://localhost:3583/curriculum` (404s locally — see Drift logged).

#### 6. FAILED_STEPS check

- Prior failures in this area: SESSION_0581's `useReducedMotion()` staleness finding (directly
  informed WL-P2-66's fix choice: CSS-only, never the hook).
- Mitigation acknowledged: class presence ≠ behavior — every claim below carries a computed-value
  probe or real bytes, not a source-code read. This mandate caught TWO real bugs in my own first
  cuts this session (see Reflections): C5's dialog-backdrop-hidden glow, and a Playwright
  `.hover()` reliability gotcha that initially made a CORRECT implementation look broken.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0583_TASK_01 | landed | C5: hover-driven (fallback: selection-driven) 1-hop neighbor glow on nodes (`ring-1 ring-primary/40 shadow-md shadow-primary/10`) + edges (opacity/stroke-width boost). Re-designed mid-session after a live screenshot showed the original click/dialog-only trigger invisible behind the backdrop blur. |
| SESSION_0583_TASK_02 | landed | D3: graph type-filter empty overlay (`EmptyList` in a `Card`, "Show all techniques" reset); curriculum topic-filter empty state (`EmptyList` + inline "Show all topics" text-link, mirroring `community-feed.tsx`). Curriculum branch proven via a new component test (live route blocked by a pre-existing local data gap — see Drift logged). |
| SESSION_0583_TASK_03 | landed | B2: `difficultyLabelFor`/`difficultyDefinitionFor` added to `node-tooltip.ts` (+ unit tests); wired into the node dialog's difficulty Badge via a `Tooltip`. No DTO/graph-query change needed — `difficultyLevel` was already on the DTO. |
| SESSION_0583_TASK_04 | landed | WL-P2-65: disambiguation experiment (real html2canvas, 3 variables in isolation: font-pin, node-height, line-clamp) found neither ledger candidate was the cause — `-webkit-line-clamp`/`display:-webkit-box` was: html2canvas mis-renders it, clipping glyph tops even for single-line text. Fixed for the capture only (`display:block; -webkit-line-clamp:none; overflow:visible`). Proven with real bytes from the actual "Download PNG" button on 3 nodes. |
| SESSION_0583_TASK_05 | landed | WL-P2-66: `motion-reduce:animate-none` → `motion-reduce:animate-none!` (Tailwind v4 important modifier, same idiom as this file's own `border-transparent!`) — `data-open:animate-in`'s attribute-selector rule has higher specificity than the plain-class reduce rule, so `!important` was needed to force the win. Verified on 2 independent Tooltip surfaces; affected e2e attempted, blocked by a pre-existing unrelated environment issue (documented, not silently skipped). |

## What landed

- **C5 neighborhood glow:** hovering (or, as a fallback, having selected/opened) a graph node
  highlights its direct prerequisite/dependent neighbors — nodes get a soft primary ring+shadow,
  connecting edges brighten and thicken. Computed-style proof: `open-guard`'s `box-shadow` goes
  from the plain base shadow to `oklab(hsl(1 79% 51%)/0.4) 0px 0px 0px 1px, oklab(.../0.1) 0px 4px
  6px -1px, oklab(.../0.1) 0px 2px 4px -2px` while `closed-guard` is hovered; a non-neighbor
  (`sprawl`) and the source node itself stay unaffected.
- **D3 empty states:** the graph's type-filter grid and the curriculum browser's topic-filter
  grid both get an `EmptyList` fallback with a reset control instead of a silent blank area (the
  AUD2-7 defect). The graph branch is defensive-forward — the current 61-technique dataset never
  actually empties any of the 4 type filters (verified live: Positions 15 / Submissions 20 /
  Transitions 15 / Counters 11) — so it's code-reviewed + typechecked, not live-screenshotted.
- **B2 difficulty-term tooltips:** the node dialog's difficulty Badge now reads "Beginner" (not
  the raw `BEGINNER` enum) and explains the term on hover/focus via a plain-language glossary
  (`node-tooltip.ts`), e.g. "Safe to drill from day one — no prior technique required."
- **WL-P2-65 resolved:** PNG exports no longer clip node-label text. Root cause was NOT either
  ledger-suggested variable (font-family pin, fixed node height) — both were tested in isolation
  against real html2canvas captures and both still clipped. The actual cause is html2canvas's
  known-buggy `-webkit-box`/`-webkit-line-clamp` rendering; the fix swaps to an equivalent
  overflow-visible block box for the capture only.
- **WL-P2-66 resolved:** `motion-reduce:animate-none` now reliably wins the cascade under
  `prefers-reduced-motion: reduce` on every popover/select/dropdown-menu/tooltip built on
  `popoverAnimationClasses` — computed `animation-name` flips from `enter` to `none`.

## Decisions resolved

- **C5 trigger mechanism (judgment call, not a pinned fork):** the ledger/spec text says
  "selected-node neighborhood glow," which maps most literally to the code's existing
  `selectedNodeId` (dialog-open state). Built it that way first; a live screenshot showed the
  dialog's own backdrop blur makes the glow imperceptible in practice. Re-designed to trigger on
  **hover** (visible pre-dialog, where users actually explore the graph), keeping
  `selectedNodeId` as a fallback source so the literal reading still holds when it can matter.
  Flagging for Desi/the operator to confirm this matches original intent — it's a
  evidence-driven divergence from the literal spec wording, not an unreviewed reinterpretation.
- **WL-P2-65 fix shape:** neither of the ledger's two candidate variables was the cause (both
  ruled out empirically); the actual fix targets `-webkit-line-clamp`, a THIRD variable the
  ledger row didn't name. Chosen over patching the font-pin/height purely because it's what the
  real experiment showed — the disambiguation experiment surfaced new information, and the fix
  followed that evidence rather than picking one of the two pre-named options anyway.
- **WL-P2-66 fix shape:** the repo's own `!` important-modifier idiom (already used in this same
  file for `border-transparent!`) over `motion-reduce:data-open:animate-none` variant-chaining —
  chosen because `!important` deterministically wins regardless of Tailwind's internal
  generation-order tie, where a same-specificity variant-chain fix would still depend on that
  order being favorable.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/web/techniques/technique-graph.tsx` | C5 hover-driven neighbor glow (nodes + edges), D3 graph empty-state overlay, B2 difficulty-tooltip wiring, WL-P2-65 export-capture line-clamp fix. |
| `apps/web/components/web/curriculum/bjj-curriculum-browser.tsx` | AUD2-7 topic-filter empty state (`EmptyList` + "Show all topics" reset). |
| `apps/web/server/web/techniques/node-tooltip.ts` | B2: added `difficultyLabelFor` + `difficultyDefinitionFor` (difficulty-term glossary). |
| `apps/web/server/web/techniques/node-tooltip.test.ts` | Unit tests for the two new B2 helpers. |
| `apps/web/components/web/curriculum/bjj-curriculum-browser.test.tsx` | **New.** Component test for the AUD2-7 empty-state branches (renderToStaticMarkup, this repo's established component-test pattern). |
| `apps/web/lib/utils.ts` | WL-P2-66: `motion-reduce:animate-none` → `motion-reduce:animate-none!`. |
| `docs/sprints/SESSION_0583.md` | This session record (new). |
| `docs/sprints/_assets/SESSION_0583-graph-c5-neighborhood-glow.png` | Runtime screenshot: hover-driven neighbor glow. |
| `docs/sprints/_assets/SESSION_0583-graph-b2-difficulty-tooltip.png` | Runtime screenshot: difficulty badge + tooltip. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` | PASS — route types generated, tsc exit 0. |
| `bun run lint:check` (oxlint) | PASS — 0 errors; pre-existing warning set unchanged, none in touched files. |
| `bun run format:check` (oxfmt, repo-wide) | PASS — "All matched files use the correct format" (after one auto-fix on `node-tooltip.test.ts`'s import line, applied and re-verified). |
| `bun run test server/web/techniques server/web/curriculum components/web/curriculum` (focused) | PASS — 93 pass / 0 fail, 204 assertions, 14 files. |
| `bun run test` (full suite, ×2 runs) | 1562 pass / 1 fail both runs — the SAME failure both times: `server/web/lineage/node-profile-actions.test.ts` `beforeAll` fixture collision (`Discipline` unique `[code,brand]`) from concurrent sibling-lane fixture creation on the shared local `ronindojo_prodsnap` — unrelated domain (lineage, not touched by any of this session's 5 files), matches the SESSION_0581-documented shared-DB contention pattern exactly. Focused in-scope suite 93/93 green both times. |
| `cd apps/web && npx next build` | PASS — exit 0, all routes generated including `/techniques/graph` and `/privacy/request`. |
| Runtime probes (isolated Playwright chromium, dev server `:3583`, host load 83–287 throughout) | ALL PASS — table below. |

### Runtime proof table (computed values / real bytes, not class presence)

| Claim | Probe | Before | After |
| --- | --- | --- | --- |
| C5 neighbor glow engages | hover `closed-guard`, read `open-guard`'s computed `box-shadow` | `rgba(0,0,0,.1) 0 1px 3px, rgba(0,0,0,.1) 0 1px 2px -1px` (no ring) | `oklab(...primary/.4) 0 0 0 1px, oklab(...primary/.1) 0 4px 6px -1px, oklab(...primary/.1) 0 2px 4px -2px` |
| C5 non-neighbor unaffected | same hover, read `sprawl`'s `box-shadow` | base shadow | **unchanged** (base shadow) |
| C5 hovered node itself not double-glowed | same hover, read `closed-guard`'s own `box-shadow` | — | neutral `shadow-md` (no primary tint) — correctly distinct from the neighbor treatment |
| C5 CDP cascade check | `CSS.getMatchedStylesForNode` on `open-guard` while hovered | — | `.shadow-md` and `.ring-1` both matched with the correct `--tw-ring-color`/`--tw-shadow-color` = primary-tinted `color-mix` values |
| B2 tooltip content | live screenshot, node `triangle` (seeded `difficultyLevel=BEGINNER`) | raw `BEGINNER` badge, no tooltip | "Beginner" badge; tooltip "Safe to drill from day one — no prior technique required." (`docs/sprints/_assets/SESSION_0583-graph-b2-difficulty-tooltip.png`) |
| WL-P2-65 disambiguation — control (reproduces the bug) | real html2canvas capture, `closed-guard` node crop | — | "Closed Guard" text tops clipped mid-glyph |
| WL-P2-65 disambiguation — no-font-pin (ledger candidate A) | same, font-family override removed | — | **still clipped** — ruled out |
| WL-P2-65 disambiguation — free-height (ledger candidate B) | same, node height/overflow freed | — | **still clipped** — ruled out |
| WL-P2-65 disambiguation — no-line-clamp (new candidate) | same, `-webkit-line-clamp` removed | — | **fully intact** — identified as the actual cause |
| WL-P2-65 real fix, real bytes | actual "Download PNG" button click, real download, 3 nodes cropped (`closed-guard`, `standing`, `roll-through`) | clipped (391KB baseline capture) | intact on all 3 spot-checks (419KB post-fix capture) |
| WL-P2-66 reduced motion | emulated `reduce`, Tooltip on graph node hover | computed `animation-name: enter`, `0.15s` | `animation-name: none`, `0s` |
| WL-P2-66 reduced motion, 2nd surface | emulated `reduce`, Tooltip on the B2 difficulty badge (structurally different trigger: Badge vs button) | `animation-name: enter` | `animation-name: none` |
| WL-P2-66 no-preference regression check | `reducedMotion: "no-preference"`, same graph Tooltip | — | `animation-name: enter`, `0.15s` (unchanged — no regression) |

Screenshots (committed): `docs/sprints/_assets/SESSION_0583-graph-c5-neighborhood-glow.png`,
`SESSION_0583-graph-b2-difficulty-tooltip.png`.

### Playwright `.hover()` reliability gotcha (methodology finding, not a product bug)

Identical `.hover()` calls on a freshly-loaded page intermittently failed to register (className
showed no state change) unless the mouse first moved to a neutral point (`page.mouse.move(0,
0)`) before the real `.hover()` call. This cost significant debugging time (initially looked like
a REAL bug in the C5 glow — full class-list dumps, CDP cascade inspection, and a `.next` cache
wipe were all used to rule out a Tailwind/Turbopack cause before finding the actual culprit was
the test methodology). Worth a standing note for any future hover-triggered runtime probe in this
repo.

## Open decisions / blockers

- **C5's hover-vs-selection trigger** (see Decisions resolved) is a judgment call made under
  live evidence, not a pinned fork — flag for Desi/operator confirmation that hover-driven glow
  matches original intent, since the spec's literal wording says "selected."
- **D3's graph-side empty state is unverified live** with the current 61-technique dataset (no
  type filter currently empties) — code-reviewed + typechecked, same pattern as the
  live-verified curriculum branch, but not itself screenshotted.
- **`/privacy/request` authenticated-redirect anomaly** (see Drift logged) — reproduced
  deterministically, unrelated to this lane's owned files, not fixed (out of scope). Candidate
  for the failed-steps-log or drift-register (see Proposed ledger edits).
- **`/curriculum` 404s locally** (both `ronindojo_prodsnap` and `ronindojo_e2e`) — the BJJ
  curriculum importer (Lane C's `import-bbl-bjj-curriculum.ts`) has not been run against either
  local DB. Out of scope to fix (NON-GOALS: "prisma anything"); blocks any future lane's live
  verification of `/curriculum` until an operator/Lane-C-owned reseed happens.
- Full-suite `bun run test` cannot be called 100% green locally while sibling lanes share the one
  local Postgres instance (the `node-profile-actions.test.ts` fixture collision, reproduced ×2,
  is squarely in that class per the SESSION_0581 precedent). CI remains the authoritative gate.
- Push gate held per the invariant sequence — commit locally only, no push/PR/deploy.

## Next session

### Goal

Lane A slice S3: Wave 3 — E1 CurriculumJourney scrollytelling (motion-only; F1 Lenis stays
REJECTED) + B3 key-point hover peek + C3 grid stagger + G2 node-modal ellipsis menu (fold
AUD2-12).

### First task

Read `docs/epics/technique-graph-ga-fanout.md` §S3 scope + `docs/sprints/SESSION_0546.md`'s Wave
3 spec before starting; rebase is not yet required (Lanes B/C haven't re-merged since S1). Confirm
with the operator whether S2's C5 hover-vs-selection judgment call should be revisited before S3
builds on top of it.

## Review log

### SESSION_0583_REVIEW_01 — Cody self-review (S2 slice)

- **Reviewed tasks:** SESSION_0583_TASK_01–05
- **Dirstarter docs check:** not applicable (no new component; existing L1 composition
  extended).
- **Verdict:** slice matches the dispatch scope; every behavioral claim carries a computed-value
  probe or real export bytes. The "class presence ≠ behavior" mandate caught two real issues in
  my own first cuts before they shipped: C5's dialog-backdrop-hidden glow (found via a live
  screenshot, not assumed) and the disambiguation experiment correctly ruling out BOTH
  ledger-named candidates for WL-P2-65 before finding the real cause (a third variable neither
  candidate named). Conforms-list surfaces (F4 tints, D-5 roving tabindex, B1 tooltip contract,
  C2 pill, AUD-4 wheel gate, export snapshot machinery, S1's shipped items) are byte-untouched —
  diffed the file section-by-section against the S1 baseline to confirm. One honest gap: the C5
  trigger mechanism is a judgment call (hover, not click-selection) made under live evidence
  after the literal reading proved visually ineffective — flagged explicitly for review, not
  silently substituted.
- **Score:** n/a (self-review; formal scores land in the merge-sweep wave).
- **Follow-up:** proposed ledger edits below for the Giddy sweep; the two out-of-scope
  environment findings (DSR redirect, curriculum 404) are report-only.

## Hostile close review

Deferred to the merge-sweep wave (Desi + Doug on this slice commit), per the fan-out recipe.

### Findings (severity ≥ medium)

#### SESSION_0583_FINDING_01 — `/privacy/request` authenticated redirect anomaly

- **Severity:** medium
- **Task:** discovered incidentally while attempting the WL-P2-66 affected-e2e gate; not caused
  by any task in this session.
- **Evidence:** reproduced via `e2e/privacy/data-subject-request.spec.ts`'s "authenticated submit"
  test (2 full runs, identical failure) AND a standalone repro script
  (`createAuthenticatedUser` → `page.goto("/privacy/request")` → `page.url()` resolves to `/`,
  H1 = the BBL homepage hero "Build Your Legacy", not the DSR page's static
  `"Submit a Data Subject Request"` title). Confirmed `page.tsx`'s only redirect
  (`!session?.user`) is not the cause (no `/auth/login` hit).
- **Impact:** the DSR flow's e2e coverage is currently red for reasons unrelated to any known
  recent change; the authenticated user-facing DSR form may itself be broken (unverified whether
  this reproduces outside the synthetic e2e-cookie auth path).
- **Required follow-up:** a dedicated session should trace whether `useSession()` (client) and
  `getServerSession()` (server) diverge for this specific test-fixture session shape, or whether
  this is an e2e-auth-helper-only artifact.
- **Status:** open

## ADR / ubiquitous-language check

- ADR update not required: no architectural decision; interaction-polish + one shared-primitive
  CSS fix.
- Ubiquitous language update not required: no new domain terms (the difficulty-level glossary is
  UI copy, not a new domain concept).

## Reflections

- **The disambiguation-experiment mandate paid for itself immediately.** Both ledger-suggested
  WL-P2-65 candidates (font-family pin, fixed node height) were plausible-sounding and I could
  have "fixed" either one and declared victory on a source read alone. Running BOTH in isolation
  against a real html2canvas capture — and finding NEITHER changed the clipped output — is what
  forced the investigation toward the actual cause (`-webkit-line-clamp`). A source-level fix
  without the experiment would have shipped a no-op.
- **A live screenshot changed a design decision mid-task.** C5's literal spec reading
  ("selected-node") mapped cleanly to existing code and passed typecheck/lint — but the FIRST
  screenshot showed it was visually pointless (dialog backdrop blur). Building it, screenshotting
  it, and being willing to redesign based on what the screenshot actually showed (rather than
  trusting that "the code matches the spec" is the same as "the feature works") is the same
  discipline the dispatch's "class presence ≠ behavior" mandate is pointing at, just one layer up
  from CSS classes.
- **Playwright's `.hover()` needs a neutral starting point to be reliable — and this masqueraded
  as a real product bug for a while.** When my FIRST computed-style probe showed C5's glow
  classes present in the DOM but the computed `box-shadow` unchanged, I spent real time on CDP
  cascade inspection and a full `.next` cache wipe before finding the actual cause was the
  hover call itself not reliably registering. Worth a standing note for any future
  hover-triggered runtime probe in this repo: `page.mouse.move(0, 0)` before `.hover()`.
- **Shared-local-DB test contention keeps being the dominant full-suite noise source in a
  multi-lane fan-out**, exactly as SESSION_0581 flagged — 1562/1563 both runs, same unrelated
  lineage fixture collision both times. The fan-out recipe's "focused = trustworthy, full suite =
  CI-authoritative" framing held again.
- **Two genuine, out-of-scope environment gaps surfaced along the way** (the `/privacy/request`
  redirect anomaly, and the local-DB `/curriculum` 404) — neither touches this lane's 5 owned
  files, and I resisted the urge to chase either into a fix; naming them precisely for the ledger
  is the correct scope discipline even when the investigation itself was already done.

## Full close evidence

Deferred to the merge-sweep bow-out (this dispatch ends at local commit; Desi+Doug review the
slice in the merge sweep, per the fan-out recipe).

## Proposed ledger edits (NOT applied — shared ledgers untouched per dispatch; Giddy sweep applies)

1. **wiring-ledger WL-P2-65 → RESOLVED (SESSION_0583).** Disambiguation experiment ran first per
   the ledger's own instruction; BOTH named candidates (font-family pin, fixed node
   height/overflow) were ruled out via real html2canvas captures in isolation. Actual cause:
   html2canvas mis-renders `-webkit-box`/`-webkit-line-clamp` (clips glyph tops even for
   single-line text that never needs the clamp at today's label lengths). Fix: swap to
   `display:block; -webkit-line-clamp:none; overflow:visible` for the capture only. Re-verified
   with real bytes from the actual "Download PNG" button on 3 nodes across the type-color
   spectrum (`closed-guard`, `standing`, `roll-through`).
2. **wiring-ledger WL-P2-66 → RESOLVED (SESSION_0583).** `motion-reduce:animate-none` →
   `motion-reduce:animate-none!` in `lib/utils.ts`. Root cause: `data-open:animate-in`'s
   attribute-selector rule has higher CSS specificity than the plain-class reduce rule, so the
   reduce rule needed `!important` to win regardless of generation-order ties. Verified computed
   `animation-name: none` under emulated reduce on 2 independent Tooltip trigger compositions
   (button-based graph-node tooltip; Badge-based B2 difficulty tooltip); no-preference motion
   unaffected (regression-checked). Affected e2e attempted (3 specs: DSR, mobile-shell, smoke) —
   blocked by pre-existing, unrelated environment issues (see finding below); computed-style
   proof stands as the primary verification.
3. **G-022 Lane A children:** mark S2 items DONE — C5 neighborhood glow (hover-driven, see the
   judgment-call note) · D3 empty states (graph type-filter + AUD2-7 curriculum topic-filter) ·
   B2 difficulty-term tooltips · WL-P2-65 · WL-P2-66. S3 (E1/B3/C3/G2) and S4 (multi-art +
   AUD2-4 flip) remain OPEN as ledgered continuations.
4. **New candidate finding (drift-register or failed-steps-log — SESSION_0583_FINDING_01):**
   `/privacy/request` deterministically redirects to `/` for an e2e-authenticated user instead of
   rendering the DSR form; reproduced ×2 across a full dev-server restart; root cause not fully
   traced (confirmed NOT the page's own `!session?.user` guard). Unrelated to any file this lane
   owns. See the Hostile-close-review finding above for full evidence.
5. **New candidate finding (data-and-wiring-flows / feature-data-prerequisites gap):**
   `/curriculum` 404s on both local `ronindojo_prodsnap` and a freshly-migrated
   `ronindojo_e2e` — zero `Course` rows with `slug` prefixed `bjj-level-` on either DB locally,
   despite SESSION_0546 recording a prod import ("61 techniques / 75 prereqs / 80 items" at
   SESSION_0435). Candidate input to `docs/architecture/feature-data-prerequisites.md`'s
   curriculum section, and to whichever session next needs a live `/curriculum` render locally.
6. **New candidate methodology note (sop-test-writing.md or a Playwright-patterns doc):**
   `.hover()` on a Playwright page can silently fail to register without first moving the mouse
   to a neutral point (`page.mouse.move(0, 0)`) — cost real debugging time this session (see
   Reflections). Candidate for §14's Playwright locator-pattern collection.
