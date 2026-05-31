---
title: "SESSION 0312 — Lineage Phase 3a: board-layout mode + LineageCompactChildList"
slug: session-0312
type: session--implement
status: closed
created: 2026-05-31
updated: 2026-05-31
last_agent: claude-session-0312
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0311.md
  - docs/petey-plan-0305.md
  - docs/knowledge/wiki/custom-component-inventory.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0312 — Lineage Phase 3a: board-layout mode + LineageCompactChildList

## Date

2026-05-31

## Operator

Brian + claude-session-0312 (operator-overseen inline build, not the autonomous driver)

## Goal

Land lineage epic Phase 3a: add a `layout="board"` mode to `LineageTreeCanvas` plus a new
`LineageCompactChildList` component — the Org Chart Board "money" cluster (composite root card +
inline, expandable avatar/name/role child rows with descendant counts). Rendering-only on existing
tree data; no schema dependency. Per `docs/petey-plan-0305.md` Phase 3.

## Status

### Status: closed

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0311.md`
- Carryover: Phase 3-0 (`RankAward.organizationId` nullable FK) landed + merged (#51). Phase 3a is
  the staged next slice — pure UI, no schema, flagged safe for the auto-merge driver.

### Branch and worktree

- Branch: `feat/lineage-board-layout` (cut from `main` at close)
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `8a19209`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Theming / UI primitives (composition only) |
| Extension or replacement | Extension: composes existing L1 primitives (`Card`, `Avatar`, `Badge`, `Stack`) into a new domain component + layout mode; no Dirstarter primitive replaced or forked |
| Why justified | The Org Chart Board is a domain visualization (lineage org chart); it is built by composing L1 primitives per the porting spec, not by hand-rolling new primitives |
| Risk if bypassed | Large multi-instructor lineages stay locked to the wide horizontal tree (poor mobile fit); no compact, mobile-first navigation mode |

Live docs checked during planning: not applicable — composition-only UI, no new L1 primitive or
Prisma/auth/payment surface touched.

### Note on session origin

This window first attempted the hands-off auto-merge driver (`scripts/auto-session-automerge.sh 4`).
The driver's per-session headless `claude -p` failed when launched from *inside* the interactive
Bash tool (nested-launch context — git preamble, flags, and trivial nested `claude -p` all tested
clean in isolation, so the failure was the in-chat launch path, not the driver). Per operator
decision (budget-constrained), Phase 3a was built inline instead. The driver remains the correct
path for the remaining slices when run from a plain terminal.

## Petey plan

### Goal

Add `layout="board"` to `LineageTreeCanvas` and build `LineageCompactChildList`, composing existing
primitives; extract shared canvas model so the board list recurses without an import cycle.

### Tasks

#### SESSION_0312_TASK_01 — board-layout mode + LineageCompactChildList

- **Agent:** Cody (operator-overseen)
- **What:** Extract shared canvas types/helpers to `lib/lineage/canvas-model.ts`; build
  `LineageCompactChildList` (recursive inline rows: avatar + name + belt-color rank + descendant
  count + expand caret); add `layout` state + Tree/Board toggle + a `board` render branch
  (`LineageBoardCard`) to `LineageTreeCanvas`.
- **Done means:** Board mode renders root cards with inline expandable child lists; tree mode
  unchanged; biome clean; no new typecheck errors in changed files.
- **Depends on:** nothing (Phase 3-0 schema already merged; not consumed here)

### Scope guard

- Rendering-only on existing tree data — no schema, no server actions, no data migration.
- Do NOT build the Phase 3d persistent panel, the 3c per-row dropdown menus, or the 3b
  collapse-default/auto-collapse logic here.
- Board rows are read/navigate only — drag editing stays a tree-mode feature.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0312_TASK_01 | landed | `layout="board"` mode + Tree/Board toggle on `LineageTreeCanvas`; new `LineageCompactChildList` (recursive inline rows); shared `lib/lineage/canvas-model.ts` extracted from the canvas |

## What landed

- **`lib/lineage/canvas-model.ts`** — new shared module. Pure types (`SelectedRank`, `CanvasMember`,
  `ChildGroup`) + helpers (`nodeDisplayName`, `sortMembers`, `buildChildGroups`, `memberInitials`)
  extracted verbatim from `lineage-tree-canvas.tsx`. Lets the board list reuse normalization
  one-directionally (no canvas ↔ list import cycle). No behavior change to the extracted logic.
- **`LineageCompactChildList`** — new recursive component. Renders a node's direct children as
  compact inline rows (avatar + name + belt-color rank dot + descendant-count badge + expand caret),
  grouped by `LineageVisualGroup` when a public label is set. Caret expands a row's own children
  inline (recursion); row body calls `onSelect` (→ path highlight + drawer). Auto-expands ancestors
  of the selected node until the viewer manually toggles. Depth-guarded (cycle `visited` set + hard
  `MAX_DEPTH`). Composes only L1 `Avatar`/`Badge`/`Stack`.
- **`layout="board"` mode on `LineageTreeCanvas`** — `defaultLayout` prop + in-toolbar Tree/Board
  toggle (`aria-pressed`). Board branch renders `LineageBoardCard` per root (the practitioner's
  `LineageNodeCard` + optional bio `Note` + the compact child list) in a centered, max-width,
  mobile-friendly column. Tree mode is byte-for-byte unchanged; the scale transform + zoom controls
  are gated to tree mode (board is naturally responsive). Reuses the existing normalization,
  selected-path set, and `onSelect` flow.

## Decisions resolved

- Board layout is a **mode on the existing canvas**, not a fork (design-lock SESSION_0306) — reuses
  normalization + path/selection state.
- Layout state is **local `useState`** seeded by `defaultLayout` (default `tree`). No localStorage
  persistence in 3a — deliberately avoided the SSR/hydration footgun (cf. the SESSION_0311 UserMenu
  hydration bug); sticky persistence can come with the 3b/tree-settings work.
- "Expandable to full card on click" = **row body opens the profile drawer** (full profile); the
  **caret** expands children inline. Two distinct affordances.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/lib/lineage/canvas-model.ts` | New — shared canvas types + pure helpers extracted from the canvas |
| `apps/web/components/web/lineage/lineage-compact-child-list.tsx` | New — recursive Org Chart Board compact child list |
| `apps/web/components/web/lineage/lineage-tree-canvas.tsx` | Import from canvas-model; `LineageLayout` type + `defaultLayout` prop; `layout` state + Tree/Board toggle; `LineageBoardCard` + board render branch; gated scale/zoom to tree mode |
| `docs/sprints/SESSION_0312.md` | This session file |
| `docs/knowledge/wiki/custom-component-inventory.md` | Logged `LineageCompactChildList` + `canvas-model` + board mode |
| `docs/knowledge/wiki/index.md` | SESSION_0312 row |

## Verification

| Command / smoke | Result |
| --- | --- |
| `biome check` (3 changed files) | Clean — no fixes, no errors |
| `bun run typecheck` (filtered to changed files) | Zero new errors. One pre-existing error in the canvas at `lineage-tree-canvas.tsx:1219` — the **unchanged** explore-hint `<H6 render=...>` block, identical `HTMLHeadingElement` skew seen across 30+ untouched files (e.g. `lineage-tree-section.tsx:66`, `black-belt-rail.tsx:45`). Pre-existing heading-`render` type skew, not introduced here. Pre-existing zod/RHF resolver skew (SESSION_0311) also unchanged. |
| Browser smoke (Tree↔Board toggle, expand/collapse, select) | **Pending — operator-side / CI.** Not run inline (no app launch this session). Tracked in this file's `Open decisions / blockers`; CI (Playwright + Vercel) covers the route build on the PR. |

## Open decisions / blockers

- **Browser smoke pending** for the board layout — operator-side or via PR CI. Rendering-only +
  typecheck/biome green, but no interactive smoke ran this session.
- Board mode is view-only in `editMode` (drag editing stays tree-mode) — intended for 3a; revisit if
  3c/3d want board-mode editing affordances.
- Pre-existing carryovers: widespread zod/RHF resolver typecheck skew + the `<H6 render>` heading
  skew (both CI-tolerated); DESI-06/07, D7 (S3 bucket).

## Next session

### Goal

Lineage Phase 3b — collapse/expand subtrees + count badges driven by `isCollapsedDefault`, with
auto-collapse of deep tiers (the large-tree performance open-question). Builds directly on the 3a
board `LineageCompactChildList` expand state + `visited`/depth model.

### First task

Wire `LineageTreeMember.isCollapsedDefault` / `LineageVisualGroup.isCollapsedDefault` into the
compact list's initial expand state (currently `manualExpanded ?? onPath`), and add an auto-collapse
threshold for deep tiers. Both fields are already on the payloads (`payloads.ts`). Rendering-only;
safe for the auto-merge driver (run from a plain terminal, not in-chat).

## Review log

### SESSION_0312_REVIEW_01 — board-layout mode + LineageCompactChildList

- **Reviewed tasks:** SESSION_0312_TASK_01
- **Dirstarter docs check:** not applicable — composition-only UI, no L1 primitive replaced.
- **Verdict:** Clean, focused 3a slice. The canvas-model extraction is a pure, behavior-preserving
  refactor that earns its keep by killing the would-be import cycle. Board mode reuses the existing
  normalization and selection state, and leaves tree mode untouched (the scale/zoom gating is the
  only tree-path edit, and it's additive). The new component composes only L1 primitives — no
  FS-0001 handroll.
  Belt color stays data-driven (`Rank.colorHex`). Honest gap: no interactive browser smoke ran.
- **Score:** 8.8/10 (capped from higher only by the deferred browser smoke).
- **Follow-up:** Phase 3b collapse/count via `isCollapsedDefault`; run the board smoke on the PR.

## Hostile close review

- **Giddy:** pass — rendering-only; no schema/server-action/auth surface touched; tree mode
  unchanged; recursion is cycle- and depth-guarded.
- **Doug:** pass — biome clean; zero new typecheck errors in changed files (the one canvas error is
  the pre-existing, unchanged `<H6 render>` skew, corroborated across 30+ untouched files). Browser
  smoke honestly logged as pending, not claimed.
- **Desi:** pass (with follow-up) — composes L1 primitives, data-driven belt color, mobile-first
  column, `aria-pressed` toggle + `aria-expanded` carets + per-row `aria-label`s. Interactive smoke
  pending before this is "design-confirmed."
- **Kaizen aggregate:** 8.8/10 — clean composition + behavior-preserving extraction; only the
  deferred smoke holds it back.

## ADR / ubiquitous-language check

- ADR update **not required** — no architectural decision made/changed/rejected; board mode is the
  design-locked approach from SESSION_0306 (already recorded in `petey-plan-0305.md`).
- Ubiquitous language update **not required** — `LineageTreeMember`, `LineageVisualGroup`, `Rank`
  are existing terms; "board layout" / "compact child list" are UI surface names, not domain terms.

## Reflections

- The cheap insurance here was the **canvas-model extraction**. Pulling the pure types + helpers into
  their own module before writing the recursive list meant the board list never had to import the
  900-line canvas — which would have created a runtime import cycle (canvas imports list, list
  imports canvas's `buildChildGroups`). Type-only cycles are erased, but `buildChildGroups` is a
  runtime value; the extraction made the dependency one-directional and the change reviewable.
- The IDE's biome diagnostics (inline-style "error", `aria-expanded` "invalid") were **nursery
  rules the real gate does not enforce** — confirmed by running `biome check` directly. Worth
  remembering: trust the gate command, not the editor squiggles, before reworking valid code.
- Keeping tree mode byte-identical (gating scale/zoom behind `layout === "tree"` rather than
  restructuring) kept the blast radius tiny and the diff honest — board is purely additive.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `custom-component-inventory.md` + `wiki/index.md`: bumped `updated` → 2026-05-31, `last_agent` → claude-session-0312. New code files carry author headers (`SESSION_0312`). |
| Backlinks/index sweep | Added `SESSION_0312.md` to `custom-component-inventory.md` `pairs_with`; SESSION_0312 `pairs_with` lists the inventory + plan + SESSION_0311; both directions present. `wiki/index.md` session table row added. |
| Wiki lint | `bun run wiki:lint` → **0 errors, 9 warnings**. All 9 pre-existing in untouched files (R4 stale frontmatter ×3; R8 formatting ×6 all in `petey-plan-0305.md`). Zero introduced by this session; my touched docs are clean. |
| Kaizen reflection | Reflections section present: yes |
| Hostile close review | SESSION_0312_REVIEW_01 + Giddy/Doug/Desi verdicts (8.8/10) |
| Review & Recommend | Next session goal written: yes (Phase 3b — collapse/count via `isCollapsedDefault`) |
| Memory sweep | Updated `[[lineage-canvas-zoom-and-dnd-constraints]]` with the new tree/board layout mode + canvas-model extraction (project-scoped fact future sessions will hit) |
| Next session unblock check | Unblocked — 3b fields (`isCollapsedDefault`) already on payloads; rendering-only |
| Git hygiene | Branch `main`; single commit; **NOT pushed** (operator hold — incoming remote docs work to reconcile first). Hash reported at bow-out / see git log. |
| Graphify update | Ran before commit (FS-0025): Nodes 64, Edges 614, Communities 1399 |
