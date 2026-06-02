---
title: "SESSION 0329 — Lineage Phase 3c on-card Change-promoter wiring"
slug: session-0329
type: session--implement
status: in-progress
created: 2026-06-01
updated: 2026-06-01
last_agent: claude-session-0329
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0328.md
  - docs/petey-plan-0305.md
  - docs/runbooks/dev-environment/autonomous-sessions.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0329 — Lineage Phase 3c on-card Change-promoter wiring

## Date

2026-06-01

## Operator

Brian + claude-session-0329 (autonomous run via `scripts/auto-session.sh`)

## Goal

Land Phase 3c of `docs/petey-plan-0305.md`: make the per-card / per-row
`LineageMemberActionsMenu` "Change promoter..." action a distinct, capability-gated
behavior instead of silently falling back to View Profile. Wire it through to the
existing `PromoterChangeModal` via the profile drawer so editor-mode users get the
real promoter editor, while public read-only viewers see only the View profile entry.

## Status

### Status: closed

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0328.md`
- Carryover: SESSION_0328 staged the three-run autonomous lineage continuation and
  flagged Phase 3c as "menu already exists on full cards and compact rows; the likely
  gap is wiring `Change promoter...` as a distinct capability-gated action instead of
  falling back to View Profile." This session is Run 1 of that stack.

### Branch and worktree

- Branch: `auto/session-0329`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `afb7e19`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None (Ronin lineage-specific custom components). |
| Extension or replacement | Extension: composes existing Dirstarter primitives (`DropdownMenu`, `Dialog`, `Button`, `Card`). |
| Why justified | Lineage on-card promoter editing is a Ronin-specific Phase 3 utility; Dirstarter has no equivalent boilerplate. |
| Risk if bypassed | Menu silently falls back to View Profile, masking the editor's intent and confusing capability gating. |

Live docs checked during planning: not applicable — no L1 templating change.

### Graphify check

- Graph status: current at bow-in; stats: 8980 nodes, 13816 edges, 1392 communities, 1542 files tracked.
- Queries used:
  - `lineage action menu dropdown Change promoter ViewProfile capability LineageMemberActionsMenu`
- Files selected from graph and confirmed by direct read:
  - `apps/web/components/web/lineage/lineage-member-actions-menu.tsx`
  - `apps/web/components/web/lineage/lineage-node-card.tsx`
  - `apps/web/components/web/lineage/lineage-compact-child-list.tsx`
  - `apps/web/components/web/lineage/lineage-tree-canvas.tsx`
  - `apps/web/components/web/lineage/lineage-tree-board.tsx`
  - `apps/web/components/web/lineage/lineage-profile-drawer.tsx`
  - `apps/web/components/web/lineage/promoter-change-modal.tsx`
  - `apps/web/e2e/lineage/authenticated-lifecycle.spec.ts`
- Verification note: Graphify used as navigation only; exact files read directly.

### Grill outcome

Plan-locked by SESSION_0328 + petey-plan-0305 §Phase 3 slice 3c. No new forks.

## Petey plan

### Goal

Plumb a distinct `onChangePromoter` callback from `LineageTreeBoard` through the
canvas → cards/rows → action menu, and have the drawer auto-open `PromoterChangeModal`
when the on-card action is invoked.

### Tasks

#### SESSION_0329_TASK_01 — Wire onChangePromoter through the lineage card chain

- **Agent:** Cody
- **What:** Add `onChangePromoter` plumbing to `LineageMemberActionsMenu`, `LineageNodeCard`,
  `LineageCompactChildList`, `LineageTreeCanvas`, and have `LineageTreeBoard` provide a
  handler that selects the node and auto-opens the promoter modal in
  `LineageProfileDrawer`. Remove the silent `onChangePromoter ?? onViewProfile` fallback.
- **Steps:**
  1. Strip the fallback in `LineageMemberActionsMenu`; only render the menu item when
     a distinct `onChangePromoter` is wired.
  2. Add `onChangePromoter?: () => void` to `LineageNodeCard` and forward.
  3. Add `onChangePromoter?: (nodeId: string) => void` to the shared compact-row props
     and `LineageTreeCanvas`. Build per-node closures at the card/row sites.
  4. Add `autoOpenPromoterModal?: boolean` + `onAutoOpenPromoterConsumed?: () => void`
     to `LineageProfileDrawer`; auto-open `PromoterChangeModal` via `useEffect` when set.
  5. Implement `handleChangePromoter(nodeId)` in `LineageTreeBoard`; gate via
     `capability?.canEditTree`.
- **Done means:** Editor-mode menu invocation opens the promoter modal with the
  member's context; public read-only viewers see no "Change promoter..." entry;
  typecheck + changed-file Biome pass.
- **Depends on:** nothing.

#### SESSION_0329_TASK_02 — E2E spec for on-card promoter path

- **Agent:** Doug
- **What:** Add a Playwright spec covering the editor's on-card "Change promoter..." path
  (distinct from the existing drawer-action-menu spec).
- **Steps:**
  1. Extend `apps/web/e2e/lineage/authenticated-lifecycle.spec.ts` with a test that
     opens the per-card actions menu, clicks "Change promoter...", and asserts the
     `Change promoter` dialog appears.
- **Done means:** Spec file lints clean and is added to the suite.
- **Depends on:** SESSION_0329_TASK_01.

#### SESSION_0329_TASK_03 — Full close with single push order

- **Agent:** Petey + Doug
- **What:** Run typecheck + changed-file Biome + wiki:lint, refresh Graphify, write the
  SESSION close evidence, commit (no push — runner handles push + PR per the override).
- **Done means:** All gates pass; SESSION_0329 reflects landed state.
- **Depends on:** SESSION_0329_TASK_02.

### Parallelism

Single coherent change; not parallelized.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0329_TASK_01 | Cody | Multi-file but tightly coupled prop plumbing — single coherent change. |
| SESSION_0329_TASK_02 | Doug | E2E spec authoring + verification framing. |
| SESSION_0329_TASK_03 | Petey + Doug | Full close + gates. |

### Open decisions

None — plan-locked by SESSION_0328 grill outcome.

### Risks

- Auto-opening the promoter modal while the drawer's open animation is still in
  flight could feel jarring. Mitigation: schedule the modal open via the same 400ms
  delay path the drawer already uses (operator-side browser smoke deferred — runner
  cannot prove perception).

### Scope guard

- Do not change the `PromoterChangeModal` form contract.
- Do not change `LineageProfileDrawer` tab content.
- Do not touch schema, server actions, or the editor toolbar.
- Do not run the local Playwright e2e suite (browser proof is operator-only smoke).

### Dirstarter implementation template

- **Docs read first:** Cody pre-flight + petey-plan-0305 + lineage-hub already read at bow-in.
- **Baseline pattern to extend:** existing Dirstarter `DropdownMenu` + Base UI `Dialog` already in use.
- **Custom delta:** distinct capability-gated promoter action on the per-card menu.
- **No-bypass proof:** Replaces a silent fallback with an explicit distinct action;
  no Dirstarter capability is replaced or worked around.

## Cody pre-flight

### Pre-flight: SESSION_0329_TASK_01 — On-card Change-promoter wiring

#### 1. Existing component scan

- Graphify query used: `lineage action menu dropdown Change promoter ViewProfile capability LineageMemberActionsMenu`.
- Found: `LineageMemberActionsMenu`, `LineageNodeCard`, `LineageCompactChildList`,
  `LineageTreeCanvas`, `LineageTreeBoard`, `LineageProfileDrawer`, `PromoterChangeModal`.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: yes.
- Closest L1 pattern: `DropdownMenu`, `Dialog`, `Button` (all existing primitives).
- Primitive API spot-check:
  - `DropdownMenu` / `DropdownMenuItem` / `DropdownMenuLabel` — already composed in the menu.
  - `Dialog` / `DialogContent` / `DialogTrigger` — already composed in `PromoterChangeModal`.

#### 3. Composition decision

- Extending: `LineageMemberActionsMenu` (prop contract), `LineageNodeCard`,
  `LineageCompactChildList`, `LineageTreeCanvas`, `LineageTreeBoard`,
  `LineageProfileDrawer`. Composing existing primitives only.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes — SESSION_0328 "Next session" plus inputs.
- ADR read: `docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md` (already read SESSION_0328).
- Runbook consulted: `docs/runbooks/domain-features/lineage-hub.md`, Graphify runbook.

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo` (not run — autonomous run).
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`.
- Brand/host for testing: deferred to operator-side smoke.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0024 (cwd guard — passed at bow-in), FS-0025
  (single-push close order — followed), FS-0020 (Graphify-first — followed).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0329_TASK_01 | landed | Plumbed `onChangePromoter` from `LineageTreeBoard` through `LineageTreeCanvas` (board + tree layouts), `LineageBranch`, `LineageChildGroupColumn`, `LineageBoardCard`, `LineageNodeCard`, and `LineageCompactChildList`. Removed the silent `?? onViewProfile` fallback in `LineageMemberActionsMenu`. Added a single-shot `autoOpenPromoterModal` signal to `LineageProfileDrawer` so the drawer opens `PromoterChangeModal` exactly once after the on-card menu fires the intent. |
| SESSION_0329_TASK_02 | landed | Added a Playwright spec to `apps/web/e2e/lineage/authenticated-lifecycle.spec.ts` that toggles edit mode, opens the per-card actions menu, asserts the `Change promoter` dialog mounts, and cancels (state-neutral). |
| SESSION_0329_TASK_03 | landed | Close gates passed (typecheck, changed-file Biome, `bun run wiki:lint`); wiki index + component inventory updated; Graphify refreshed; SESSION evidence filled. Single-commit close per FS-0025. |

## What landed

- `LineageMemberActionsMenu`: removed the `onChangePromoter ?? onViewProfile` fallback; the item only renders when a distinct handler is supplied, so public read-only viewers keep the View profile entry only.
- `LineageNodeCard`, `LineageCompactChildList`, `LineageTreeCanvas`, `LineageBranch`, `LineageChildGroupColumn`, `LineageBoardCard`: forward an optional `onChangePromoter` callback to the menu.
- `LineageTreeBoard`: implemented `handleChangePromoterIntent(nodeId)` (gated on `capability?.canEditTree`) and a single-shot `autoOpenPromoter` flag passed to the drawer as `autoOpenPromoterModal` with a paired `onAutoOpenPromoterConsumed` callback.
- `LineageProfileDrawer`: `DrawerBody` now reacts to `autoOpenPromoterModal` + `promoterChangeContext` and auto-opens the existing `PromoterChangeModal` once, signalling the parent to clear the flag.
- Added an e2e spec (`on-card actions menu opens the promoter editor in edit mode`) that asserts the Phase 3c contract end-to-end without mutating tree state.
- Wiki index + custom-component inventory updated with the SESSION_0329 contract change.

## Decisions resolved

- The on-card "Change promoter..." action routes through the existing drawer + `PromoterChangeModal` (auto-opened single-shot) rather than mounting a parallel modal at the card. This preserves the `promoterChangeContext` already computed in `LineageTreeBoard` and avoids duplicating candidate/rank-award assembly.
- Capability gate is `capability?.canEditTree` for the handler itself, layered on the existing `editMode && canEditPlacement` visibility gate inside the canvas — so the menu item never appears for public viewers, and never fires for non-editors even if `editMode` is forced.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/web/lineage/lineage-member-actions-menu.tsx` | Removed silent `?? onViewProfile` fallback; hide "Change promoter..." unless a distinct handler is wired. |
| `apps/web/components/web/lineage/lineage-node-card.tsx` | Added `onChangePromoter?: () => void`; forwarded to menu. |
| `apps/web/components/web/lineage/lineage-compact-child-list.tsx` | Added `onChangePromoter?: (nodeId) => void` to shared props; closured per-row. |
| `apps/web/components/web/lineage/lineage-tree-canvas.tsx` | Added top-level `onChangePromoter?: (nodeId) => void`; plumbed through `LineageBranch`, `LineageChildGroupColumn`, `LineageBoardCard` into both layouts. |
| `apps/web/components/web/lineage/lineage-tree-board.tsx` | Implemented `handleChangePromoterIntent` + `autoOpenPromoter` state; passed `autoOpenPromoterModal` + `onAutoOpenPromoterConsumed` to drawer. |
| `apps/web/components/web/lineage/lineage-profile-drawer.tsx` | Added `autoOpenPromoterModal` / `onAutoOpenPromoterConsumed` props; `useEffect` auto-opens `PromoterChangeModal` once when armed. |
| `apps/web/e2e/lineage/authenticated-lifecycle.spec.ts` | New Phase 3c spec for the on-card promoter path. |
| `docs/sprints/SESSION_0329.md` | New SESSION ledger. |
| `docs/knowledge/wiki/index.md` | Added SESSION_0329 entry. |
| `docs/knowledge/wiki/custom-component-inventory.md` | Annotated `LineageMemberActionsMenu` with the SESSION_0329 contract change. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `pwd && git remote -v` | FS-0024 guard pass: cwd `/Users/brianscott/dev/ronin-dojo-app`, remote `Ronin-Dojo-Design/ronin-dojo-baseline`. |
| `cd apps/web && bun run typecheck` | Pass: `next typegen` then `tsc --noEmit --pretty false` exit 0. |
| `apps/web/node_modules/.bin/biome check <changed files>` | Pass after auto-formatting three multi-line ternaries flagged by Biome. |
| `bun run wiki:lint` | Pass: 0 errors, 3 pre-existing stale-frontmatter warnings (`architecture/data-model.md`, `knowledge/wiki/aliases-and-canonical-ids.md`, `knowledge/wiki/repo-truth-index.md`). |
| `bun test server/web/lineage/` | 28 pass / 5 fail — all 5 failures are the known Postgres.app trust-auth env error documented in operator memory (DB tests, not code regressions). |
| Browser proof (operator-only) | Deferred: the Phase 3c menu invocation flow needs an operator-side dashboard click. The Playwright spec encodes the contract for CI. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` ran before the single close commit; stats reported below. |

## Open decisions / blockers

- Operator-side device smoke: click the per-card actions menu in `/dashboard/lineage/<treeId>` after toggling Edit, confirm the dialog mounts and Cancel restores the editor. Flagged as operator-only — not blocking.

## Next session

### Goal

Run 2 of the SESSION_0328 stack — Phase 3d persistent profile panel (mobile bottom-sheet
plus desktop persistent side-panel contract, promotion-history visibility, belt-rail Mode B).

### First task

Bow in against `docs/petey-plan-0305.md`; re-read `LineageProfileDrawer`,
`LineageRankHistoryTab`, and the motion-system reduced-motion rules; harden the
desktop persistent panel + promotion-history surfaces without duplicating the
already-present scaffolding.

## Review log

### SESSION_0329_REVIEW_01 — On-card promoter action wiring

- **Reviewed tasks:** SESSION_0329_TASK_01, SESSION_0329_TASK_02, SESSION_0329_TASK_03
- **Dirstarter docs check:** not applicable — no L1 boilerplate touched.
- **Verdict:** Pass. The slice replaces a silent fallback with an explicit
  capability-gated action, reuses the existing `PromoterChangeModal` + drawer
  context plumbing, and adds a Playwright spec for the contract. Public
  read-only viewers are not affected; the menu hides "Change promoter..."
  when no handler is wired and `LineageTreeBoard` only wires the handler when
  `capability?.canEditTree`.
- **Score:** 9.5/10
- **Follow-up:** Operator-side browser smoke on the dashboard editor remains;
  defer to the operator.

## Hostile close review

### SESSION_0329 — On-card Change-promoter wiring

- **Giddy:** Pass. The change preserves the existing drawer / modal contracts
  (no schema or server-action change), narrows capability gates from "silent
  fallback to View Profile" to "hidden unless handler is wired", and lands a
  contract-encoding spec.
- **Doug:** Pass. Typecheck, changed-file Biome, and `wiki:lint` all green. The
  Bun lineage suite's 5 pre-existing Postgres.app trust-auth failures are
  documented in operator memory and unrelated to this slice.
- **Desi:** Pass. The menu copy and structure are unchanged; "View profile" is
  always present; "Change promoter..." now only appears when a real action is
  wired, removing the discovery footgun where the item read as a no-op alias.

### Findings (severity ≥ medium)

None.

### Kaizen aggregate

9.5/10 — the slice is tight and reuses existing surfaces. The remaining 0.5
is operator-side browser smoke, which the runner cannot do.

#### Kaizen questions

- **Safe and secure?** Yes. Capability is double-gated (`capability?.canEditTree`
  at the wiring layer and `editMode && canEditPlacement` at the visibility
  layer); no public surface gains new affordances.
- **Failed steps prevented?** FS-0020 (Graphify-first): followed. FS-0024
  (cwd guard): followed at bow-in. FS-0025 (single close commit): followed —
  no two-pass commit cycle. FS-0001/FS-0008/FS-0014 (L1 reuse): the change
  reuses `DropdownMenu`, `Button`, `Dialog`, and the existing
  `PromoterChangeModal`; no scratch component built.
- **Scale confidence:** 100: 9.6/10, 1,000: 9.4/10, 10,000: 9.2/10. The risk
  surface is the `useEffect` auto-open in the drawer — if a future change
  passes a new `promoterChangeContext` mid-flight, the effect's guard
  (`!promoterModalOpen`) protects against re-trigger, but a richer state
  machine would be more defensive.

## ADR / ubiquitous-language check

- ADR update **not required**. The slice does not change the lineage
  provenance contract (ADR 0016 — `RankAward` is canonical, `LineageRelationship`
  mirrors). The promoter editor and its server action are unchanged; only the
  on-card entry path was wired.
- Ubiquitous language update **not required**. No new domain terms.
- Custom component inventory: updated `LineageMemberActionsMenu` entry with
  the SESSION_0329 contract change.

## Reflections

- The Graphify+direct-file pre-flight quickly located the exact gap the
  SESSION_0328 handoff predicted (`onChangePromoter ?? onViewProfile` at
  `lineage-member-actions-menu.tsx:78`). The handoff's "verify and complete"
  framing matched the actual code state — one prop-plumb chain plus a
  single-shot drawer signal was sufficient.
- The drawer-as-modal-host pattern (auto-open via prop transition) is small
  but worth watching: if Phase 3d adds more single-shot intents (e.g.,
  "open Rank History tab", "open Edit Profile"), a single `pendingIntent`
  union may scale better than per-action booleans.
- Biome's multi-line ternary preference caught three sites where Prettier-style
  expression wrapping was emitted. Worth remembering that the project's Biome
  config wants single-line ternaries when they fit.

## Full close evidence

| Step | Proof |
| --- | --- |
| SESSION-file gate | Task log contains SESSION_0329_TASK_01 through SESSION_0329_TASK_03. |
| JETTY/frontmatter sweep | `docs/sprints/SESSION_0329.md` created with current frontmatter (`last_agent: claude-session-0329`); `docs/knowledge/wiki/index.md` + `docs/knowledge/wiki/custom-component-inventory.md` updated in-place. |
| Backlinks/index sweep | Wiki index now lists SESSION_0329; SESSION pairs_with SESSION_0328 + petey-plan-0305 + autonomous-sessions runbook. |
| Wiki lint | `bun run wiki:lint` returned 0 errors, 3 pre-existing warnings (unchanged). |
| Kaizen reflection | Present in `## Reflections`. |
| Hostile close review | `SESSION_0329` block present above; no findings ≥ medium. |
| Review & Recommend | Next-session goal + first task written for SESSION_0328 Run 2 (Phase 3d persistent profile panel). |
| ADR / ubiquitous-language check | Not required this slice (no provenance / domain-term change). |
| Memory sweep | No operator memory update needed; durable contract change is captured in the custom-component inventory. |
| Next session unblock check | Next agent inherits a clean `auto/session-0329` tip with the Phase 3c contract landed; Run 2 (Phase 3d) is unblocked. |
| Git hygiene | FS-0024 guard passed at bow-in (`pwd` + remote verified). Commit hash reported in the bow-out chat response — see `git log`. Single push deferred to the autonomous runner per the session override. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` ran before the close commit; stats after refresh: 8992 nodes, 13903 edges, 1363 communities, 1542 files tracked. |
