---
title: "SESSION 0264 — Lineage editor gap fixes (round 1, P0s + select P1s)"
slug: session-0264
type: session
status: closed
created: 2026-05-26
updated: 2026-05-26
last_agent: codex-session-0264
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0263.md
  - docs/architecture/lineage/SESSION_0263_audit_report.md
  - docs/architecture/lineage/bbl-bjj-rank-verification-import-map.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0264 — Lineage editor gap fixes (round 1, P0s + select P1s)

## Date

2026-05-26

## Operator

Brian + claude-session-0264 + codex-session-0264 (Petey orchestrating; Cody implementation on main thread)

## Goal

Close the four P0 gaps from SESSION_0263's audit, plus the operator-confirmed inline pulls:

- **P0-1** Drawer reshape: replace 4 placeholder tabs with `Info | Lineage | Rank History`, and pull in Admin/Edit as a capability-gated **drawer-header overflow menu** (3-dot ellipsis), not a 4th tab.
- **P0-2** Promoter modal: client UI wrapping `updateLineagePromotionRelationship` (rank/verification/audit-note fields). Launch points: drawer overflow menu (Admin/Edit) and a canvas node menu.
- **P0-3** Editor toolbar + drag/reorder: dnd-kit-based interactions on `LineageTreeBoard`; reorder calls `updateLineageMemberPlacement` (visual-only); drag-into-group calls same action with `visualGroupId` change. Toolbar uses base-ui primitives.
- **P0-4** Group management UI (TREE_ADMIN-only): inline group-header form for rename + `showPublicLabel` + `collapseByDefault`. **Adds a new `updateLineageVisualGroup` server action** (the audit said server logic existed; it does not — only the schema fields).
- **Inline-pulled P1s while drawer is open:** Unknown-date rendering when `awardedAt` is null; Verified/Disputed badge rendering on the drawer header.

### Codex pivot note

After bow-in, the operator redirected the first implementation slice to BJJ rank and verification data: "we need all the rank and verification for BJJ focused first" and pointed at the legacy Black Belt Legacy Pods JSON. SESSION_0264 therefore starts by locking the BBL BJJ rank field map, verification semantics, and current rank seed gap before resuming the broader editor UI P0s.

## Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None directly. All work is in Ronin-specific lineage surfaces (`apps/web/components/web/lineage/*`, `apps/web/server/web/lineage/*`, `apps/web/app/(web)/dashboard/lineage/[treeId]/page.tsx`). Uses existing base-ui primitives (Button, Dialog, Select, Textarea, Switch, Tabs, Card, Stack, Tooltip, DropdownMenu) and the app's existing dnd-kit dependencies for accessible drag/reorder. |
| Extension or replacement | Extension only. New client components: `LineageEditorToolbar`, `PromoterChangeModal`, `LineageGroupHeaderForm`, `LineageRankHistoryTab`, plus a drawer-header vertical ellipsis overflow menu. New server action: `updateLineageVisualGroup`. Tabs in `LineageProfileDrawer` are **replaced** (not extended) per operator decision — Belt Story / Tournaments / Achievements stubs removed; spec'd v1 tabs added. |
| Why justified | SESSION_0263 audit measured 4 P0 gaps blocking v1 acceptance; this session closes them. Inline P1 pulls (unknown-date + badges) are token-efficient because the drawer is open anyway. The Admin/Edit-as-overflow-menu reshape avoids creating a 4th tab that would carry empty surface and instead surfaces a single working item (`Change promoter…`) gated by capability. dnd-kit chosen over `@use-gesture` (already imported for pan/zoom) because pan-gesture-as-drag-target hit-testing is poor a11y and adds custom keyboard support cost we don't want to maintain. |
| Risk if bypassed | v1 acceptance gates open; SESSION_0265 (Rigan Machado coral-belt hand-author) would land content into a UI that can't be edited from the dashboard, forcing seed-only edits and blocking SESSION_0266+ feedback loops. |

## Petey plan

### Goal

Close the four P0 audit rows + two inline P1 pulls + reshape Admin/Edit as overflow menu. Single session. Two parallel waves of subagents.

### Pre-flight findings (Petey, before dispatching subagents)

- **Audit drift caught.** Audit (line 69) said drawer tabs are `Profile + Lineage`. **Reality:** drawer has 4 tabs (`Info | Belt Story | Tournaments | Achievements`); three are `EmptyTabBody` stubs. Operator confirmed reshape to `Info | Lineage | Rank History`.
- **Audit drift caught.** Audit task-3 row says "Server logic already exists; this is form wiring" for group rename/toggle. **Reality:** `editor-actions.ts` exports only `updateLineageMemberPlacement` + `updateLineagePromotionRelationship`. There is no `updateLineageVisualGroup`. Task 3 scope adjusted to include the new action + schema + audit log entry.
- **Editor surface.** Dashboard route is RSC; renders `<LineageTreeBoard>` directly. Board is a 77-line client island that owns drawer state. Plan: introduce `<LineageEditorShell>` as a client wrapper that takes a `capability` + `treeId` prop, hosts the toolbar, and renders `LineageTreeBoard` underneath. `LineageTreeBoard` gets a new optional `capability` prop that it forwards to drawer + canvas children so they can show editor affordances.
- **Drag library.** Operator chose `dnd-kit` over hand-rolled gestures. Adds `@dnd-kit/core` + `@dnd-kit/sortable`.
- **ACL.** Operator chose TREE_ADMIN-only for rename + toggles. Reorder + move keep their existing TREE_EDITOR capability per spec matrix.
- **Carry-forward decisions un-touched this session:** ACL management UI (P1, stays parked), claim-bypass semantics (writeup-only, resolve at SESSION_0265 bow-in), claimant-edit-rights (SESSION_0267+).

### Tasks

#### SESSION_0264_TASK_01 — Editor shell + dnd-kit toolbar + drag/reorder/group-move

- **Agent:** Cody-B (general-purpose subagent, parallel with Cody-A)
- **Surface:**
  - NEW: `apps/web/components/web/lineage/lineage-editor-shell.tsx` (client wrapper).
  - NEW: `apps/web/components/web/lineage/lineage-editor-toolbar.tsx` (client; base-ui Button + Stack + DropdownMenu).
  - EDIT: `apps/web/components/web/lineage/lineage-tree-board.tsx` (accept optional `capability` + `treeId`; pass `capability` to drawer).
  - EDIT: `apps/web/components/web/lineage/lineage-tree-canvas.tsx` (when in edit mode, wrap nodes in dnd-kit `useSortable` adapters; forward drop events to shell callbacks).
  - EDIT: `apps/web/app/(web)/dashboard/lineage/[treeId]/page.tsx` (swap `LineageTreeBoard` → `LineageEditorShell`, pass `capability` + `treeId`).
  - DEPS: `pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/modifiers` in `apps/web`.
- **Server actions used:** `updateLineageMemberPlacement` (existing) for both reorder (visualSortOrder change) and group-move (visualGroupId change).
- **What:**
  1. Install dnd-kit deps in `apps/web`.
  2. Build `LineageEditorShell` (client). Props: `members`, `visualGroups`, `defaultRootMemberId`, `profilesById`, `capability`, `treeId`. Owns the dnd-kit `DndContext`. Wraps `LineageTreeBoard` + renders `LineageEditorToolbar` above.
  3. Build `LineageEditorToolbar`. Items: `Edit mode` toggle (default off when first opened), `Publish/Unpublish` button (disabled if `!capability.canPublish` — UI only, server action wiring is out-of-scope for this session — TODO comment), `New group` button (disabled if `!capability.canManageGroups` — opens group-create modal STUBBED for SESSION_0264b unless trivially small; otherwise the form-wiring covers existing groups only), `Open public view` link (existing).
  4. Wire dnd: in edit mode, each node becomes draggable. Drop target = group container OR sibling slot. On drop:
     - same-group + different-position → call `updateLineageMemberPlacement` with new `visualSortOrder`.
     - different-group → same action with new `visualGroupId`.
     - root-of-branch protected: `BRANCH_EDITOR` cannot move the assigned root (server already enforces this; UI should also visually disable the handle).
  5. Edit-mode disables canvas pan-on-drag (`@use-gesture` keeps zoom + double-tap-frame; drag is taken over by dnd-kit).
  6. Keyboard a11y: dnd-kit's `KeyboardSensor` enabled by default.
- **Done means:** Editor route renders toolbar above canvas. Edit-mode toggle works. Dragging a node to a new position writes to DB; refresh shows new order. Dragging into a new group changes only the group; verification status unaffected. No regressions on public viewer route (no `LineageEditorShell` there).
- **Depends on:** Cody-C TASK_03 for the group-management form (Task 3 lives inside the editor shell visually but is independent code).

#### SESSION_0264_TASK_02 — Promoter change modal

- **Agent:** Cody-A (general-purpose subagent, parallel with Cody-B)
- **Surface:**
  - NEW: `apps/web/components/web/lineage/promoter-change-modal.tsx` (client; base-ui Dialog).
  - NEW: `apps/web/components/web/lineage/promoter-member-combobox.tsx` (client; if `Combobox` base-ui primitive doesn't exist, fall back to `Select` + filter input — Cody pick the lightest valid path).
- **Server action used:** `updateLineagePromotionRelationship` (existing, `editor-actions.ts:497–511`).
- **What:**
  1. Build `<PromoterChangeModal>` as a controlled Dialog. Props: `open`, `onOpenChange`, `member` (the member whose promoter is changing), `candidates` (other members in tree, excluding self + descendants — caller filters), `onSuccess` (revalidates).
  2. Form fields (all required for sensitive-action audit per permissions spec §Sensitive Actions):
     - **Promoter** (combobox of candidates; "Clear promoter" option requires TREE_EDITOR — server enforces; UI just shows the option and lets the action 4xx).
     - **Verification status** (Select: `PENDING | VERIFIED | DISPUTED`). Default `PENDING`. Note: server currently hard-codes new relationships to `PENDING`; modal sends whatever the user picks but the server may override. Cody: if the server doesn't accept verificationStatus in the input schema, omit the field and add a TODO referencing a future server-side schema extension.
     - **Audit note** (Textarea, required, min 4 chars).
  3. Use `DialogTrigger render={…}` pattern (per `feedback_biome_unsafe_jsx_blindspot` + SESSION_0262 nested-button lesson) on the parent so the launching control's role isn't a button-inside-button.
  4. On submit: call `updateLineagePromotionRelationship` action. Toast on success. Surface server errors (`LINEAGE_EDITOR_ERROR.*`) inline.
- **Done means:** Modal opens from `<LineageProfileDrawer>` overflow menu (wired in TASK_04) and from `<LineageTreeCanvas>` node context menu (wired by Cody-B in TASK_01 as a node action). Happy-path submission updates the relationship and writes the audit log row.
- **Depends on:** none (self-contained client component); consumed by TASK_01 + TASK_04.

#### SESSION_0264_TASK_03 — Group management UI + new `updateLineageVisualGroup` server action

- **Agent:** Cody-C (general-purpose subagent, sequential after Wave 1 starts; depends on TASK_01 surface choices)
- **Surface:**
  - NEW: `apps/web/server/web/lineage/editor-schemas.ts` (append `updateLineageVisualGroupSchema`).
  - NEW: `apps/web/server/web/lineage/editor-actions.ts` (append `applyLineageVisualGroupUpdate` + `updateLineageVisualGroup` exported action).
  - NEW: `apps/web/server/web/lineage/editor-actions.test.ts` (append happy-path + TREE_EDITOR-denied test).
  - NEW: `apps/web/components/web/lineage/lineage-group-header-form.tsx` (client; rename input + 2x Switch).
  - EDIT: `lineage-tree-canvas.tsx` (when `capability.canManageGroups`, render `<LineageGroupHeaderForm>` inline above each group cluster).
- **Server action contract:**
  - Input: `{ treeId, groupId, name?, showPublicLabel?, collapseByDefault? }` (all updatable fields optional; at least one required).
  - ACL: requires `TREE_ADMIN` (not `TREE_EDITOR`). Use existing `hasTreeAdminGrant(grants)` helper if present; otherwise add via the same pattern as `hasTreeEditorGrant`.
  - Audit: writes `AuditLog` row with `action: "lineage.group.updated"`, before/after on the three fields.
  - Revalidates: `/lineage/[slug]` + `/dashboard/lineage/[treeId]` + tag `lineage`.
- **Done means:** Each group cluster on the canvas shows a small header form in edit mode (TREE_ADMIN). Rename submits → group renames live. Toggling showPublicLabel persists and the public route reflects it on next request. CollapseByDefault toggle persists (UI behavior of collapsing groups remains a future polish — only the setting is wired now). Unit test covers happy path + TREE_EDITOR deny.
- **Depends on:** TASK_01 shell exposes the `capability` + `treeId` props this form needs.

#### SESSION_0264_TASK_04 — Drawer reshape: Info | Lineage | Rank History + overflow menu + P1 pulls

- **Agent:** Cody-A (sequential after TASK_02 — same agent, same drawer surface area)
- **Surface:**
  - EDIT: `apps/web/components/web/lineage/lineage-profile-drawer.tsx` (replace tab list; add header overflow menu; pull-in P1s).
  - NEW: `apps/web/components/web/lineage/lineage-rank-history-tab.tsx` (client; renders the user's `rankAwards` list).
  - NEW: `apps/web/components/web/lineage/lineage-lineage-tab.tsx` (client; renders the promotion-chain: parent → self → children, using `profile.relationshipsTo` + `relationshipsFrom` if available; if a thin server query is needed, add to `node-profile-queries.ts`).
  - EDIT: `apps/web/server/web/lineage/payloads.ts` if needed to ensure `LineageNodeProfile` payload carries `relationshipsFrom` + full `rankAwards` history (not just the latest).
- **What:**
  1. **Tab replacement.** `TabsList`: drop Belt Story / Tournaments / Achievements. Keep current `info` tab (rename to `Info` label). Add `Lineage` tab (children/parent summary, base-ui Stack of node cards). Add `Rank History` tab (table of `RankAward` rows joined to user — date / rank / awardedBy / verification badge).
  2. **Overflow menu.** Add a 3-dot button in the `DrawerHeader` right of the title, visible only when `capability.canEditNode(profile.nodeId)` (UI helper; capability check resolved server-side already). Menu items (DropdownMenu / Menu primitive):
     - `Change promoter…` → launches `<PromoterChangeModal>` (from TASK_02) targeting `profile.nodeId`. ✅ THIS is the working item this session.
     - Future-stub items (disabled, marked `TODO SESSION_0267+`): `Edit profile…`, `Manage verification…`, `Archive node…`. Keep them visually present so the surface is discoverable; tooltip explains "available in a later session."
  3. **P1 pulls (token-efficient while drawer is open):**
     - **Unknown-date rendering.** `Promoted On` section: when `currentAward.awardedAt` is null, render the literal text `"Unknown date"` (not `"No promotion date on record."`) — this matches the public-viewer spec exactly. Gate behind `tree.showPromotionDatePublic` for public route (`isEditor` always shows actual value).
     - **Verified / Disputed badge.** Header currently shows `Verified` (success) or `Unverified` (outline) only. Add a `Disputed` variant (destructive) when `profile.verificationStatus === "DISPUTED"`. Three-state mapping: `VERIFIED → Verified/success`, `PENDING → Unverified/outline`, `DISPUTED → Disputed/destructive`.
  4. **Capability prop.** `LineageProfileDrawer` accepts optional `capability` prop (from `LineageTreeBoard`). When undefined (public viewer), overflow menu is hidden.
- **Done means:** Drawer shows exactly 3 tabs. Overflow menu appears for editors, launches PromoterChangeModal. Unknown-date renders correctly. Disputed badge renders when status is DISPUTED.
- **Depends on:** TASK_02 (`PromoterChangeModal` consumed here).

#### SESSION_0264_TASK_05 — Playwright e2e: promoter modal happy path

- **Agent:** Petey (main thread, after Waves 1 + 2 land)
- **Surface:**
  - NEW: `apps/web/e2e/lineage/editor-promoter-modal.spec.ts`.
- **What:** Single spec. Seeds a tree with 2 members, signs in as TREE_ADMIN, opens drawer for member-B, opens overflow → `Change promoter…`, picks member-A, fills audit note, submits, asserts toast + reopens drawer + sees member-A as instructor.
- **Done means:** Spec passes locally + on CI. Brings lineage editor e2e coverage from 0 to 1; total suite from 28/29 to 29/30 OR holds at 28/29 if the carry-forward 0262_FINDING_01 (`<h1>` 20s timeout in privacy spec) is still failing.
- **Depends on:** TASK_01 + TASK_02 + TASK_04 all landed.

### Parallelism

- **Wave 1 (parallel, 2 agents):**
  - **Cody-A:** TASK_02 (promoter modal) → then TASK_04 (drawer reshape) on the same agent (drawer imports modal).
  - **Cody-B:** TASK_01 (editor shell + dnd-kit toolbar/drag).
- **Wave 2 (sequential after Cody-A returns, 1 agent):**
  - **Cody-C:** TASK_03 (group mgmt + new server action) — depends on TASK_01's shell shape being clear.
- **Wave 3 (Petey on main thread):** TASK_05 (e2e), validation, bow-out.

Non-overlapping file edits between Cody-A and Cody-B:

- Cody-A: drawer + new modal + new tab files + (maybe) payloads.ts.
- Cody-B: shell + toolbar + tree-board + canvas + dashboard page + package.json deps.
- Only shared touch is conceptually `capability` prop on `LineageTreeBoard` — Cody-B owns the prop addition; Cody-A consumes via type import.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Cody-B (general-purpose) | Largest task; touches deps + 4 components + dashboard page. General-purpose has write access; Explore is read-only. |
| TASK_02 | Cody-A (general-purpose) | Self-contained client modal; same agent continues to TASK_04 so it doesn't repaint context across drawer territory. |
| TASK_03 | Cody-C (general-purpose) | Server action + form. Sequential to land after Wave 1 stabilizes the shell. |
| TASK_04 | Cody-A (continues) | Drawer reshape; consumes TASK_02's modal. Same agent = no second cold-start. |
| TASK_05 | Petey (main thread) | E2E spec is small; main thread can use the e2e patterns from existing `apps/web/e2e/lineage/*` files directly. |

### Open decisions

- **Combobox primitive availability.** If `apps/web/components/common/combobox.tsx` exists, Cody-A uses it; otherwise falls back to native `Select` + a filter input. Decision delegated to Cody-A on first look at the components folder.
- **`new group` button in toolbar.** Stubbed-or-shipped? Cody-B's call — if the existing schema supports group-create trivially (~30 min of work) ship it; otherwise stub with `disabled + tooltip` and add to SESSION_0264b backlog.
- **`verificationStatus` field in promoter modal.** If the server action's input schema (`updateLineagePromotionRelationshipSchema`) doesn't accept verificationStatus, Cody-A omits the field, adds a TODO, and leaves the server's `PENDING` hard-code in place.

### Risks

- **dnd-kit + @use-gesture conflict.** Both want pointer events on the same canvas. Mitigation: edit-mode flag disables `@use-gesture` drag handlers (keeps zoom + double-tap-frame); dnd-kit takes over drag.
- **Server-action schema mismatch on verification status.** Spec requires it; current schema may not expose it. Mitigation: TODO + omit, do not break the happy path.
- **Audit drift recurring.** Task 3 audit row was wrong about "server logic exists." Petey already corrected scope. Watch for similar drift in TASK_04 (e.g., does `node-profile-queries` already return full `rankAwards` history? If not, Cody-A adds a thin read).
- **Playwright flake on dnd-kit.** dnd-kit drag in headless requires specific mouse-down/move/up sequencing. TASK_05 covers modal only — not drag — to keep the deterministic happy-path predictable. Drag-flow e2e is a SESSION_0264b candidate.

### Scope guard

- No ACL management UI this session (P1, parked).
- No `Edit profile…` overflow menu wiring (claimant-edit-rights, SESSION_0267+).
- No discipline-page embedding e2e (P1, parked).
- No mobile gesture e2e (P1, parked).
- No claim-bypass semantics code (writeup-only at SESSION_0265 bow-in).
- No Belt Story / Tournaments / Achievements work — those tab stubs are deleted, not extended.

## Task log

| ID | Owner | Status | Notes |
| --- | --- | --- | --- |
| SESSION_0264_TASK_00 | Codex/Petey | done | Bow-in used Graphify for current-app discovery; legacy monorepo root graph was empty, so discovery used scoped BBL Graphify where available plus targeted legacy paths. Verified the BBL Pods exports are schema exports, not member row dumps. |
| SESSION_0264_TASK_00A | Codex/Petey | done | Added the BBL BJJ rank/verification import map, tests, and current BJJ seed correction for the base `Black Belt` rank (`BK0`). |
| SESSION_0264_TASK_01 | Codex/Petey | done | Added editor toolbar and edit-mode dnd-kit drag/drop handlers in `LineageTreeBoard`/`LineageTreeCanvas`; drops call `updateLineageMemberPlacement` for same-parent visual reorder/group changes. |
| SESSION_0264_TASK_02 | Codex/Petey | done | Added `PromoterChangeModal`, extended promoter server schema/action for rank award + verification status, and added server-side rank-award ownership validation. |
| SESSION_0264_TASK_03 | Codex/Petey | done | Added TREE_ADMIN-only inline group header form and `updateLineageVisualGroup` server action with audit logging and tests. |
| SESSION_0264_TASK_04 | Codex/Petey | done | Replaced drawer tabs with `Info`, `Lineage`, `Rank History`; added vertical ellipsis action menu, tooltip affordances, unknown-date text, and disputed/verified badges. |
| SESSION_0264_TASK_04A | Codex/Petey | done | Hostile security pass on drawer rank surface: removed `RankAward.notes` from payloads/rendering, honored public `DirectoryProfile.showRanks`, and added visibility tests. |
| SESSION_0264_TASK_05 | Codex/Petey | done | Added Playwright promoter-modal happy path inside the existing serial lineage lifecycle spec and extended the fixture state read to assert the persisted `PROMOTED_BY` relationship. |

## What landed

- BBL-first rank/verification mapping for legacy Black Belt Legacy BJJ Pods fields, including white through 10th-degree ranks, source-level verification normalization, and a BK0 `Black Belt` seed correction.
- Drawer rank surface now has `Info | Lineage | Rank History`, three-state verification badges, unknown-date rendering, and privacy hardening so public lineage reads do not send rank awards when `showRanks` is false.
- Promoter modal is wired from a tooltip-backed vertical ellipsis drawer menu. It requires rank award, verification status, and audit note, and the server verifies the selected rank award belongs to the edited member before writing a `PROMOTED_BY` relationship.
- Editor toolbar and edit-mode drag/drop are wired to the audited placement action. The handler only permits same-parent visual reorder/group moves so it does not silently rewrite lineage parentage.
- TREE_ADMIN inline group management is wired for label rename, public-label toggle, and collapse-by-default persistence through a new audited `updateLineageVisualGroup` action.
- E2E lineage lifecycle coverage now includes the promoter modal happy path and DB assertion.

## Files touched

- `apps/web/app/(web)/dashboard/lineage/[treeId]/page.tsx` — passes editor capability and public link into the lineage board.
- `apps/web/components/web/lineage/lineage-tree-board.tsx` — owns edit-mode state, toolbar rendering, and promoter context gating.
- `apps/web/components/web/lineage/lineage-tree-canvas.tsx` — adds dnd-kit edit-mode drag/drop, group drop targets, and group header form slots.
- `apps/web/components/web/lineage/lineage-editor-toolbar.tsx` — new tooltip-backed editor toolbar.
- `apps/web/components/web/lineage/lineage-group-header-form.tsx` — new TREE_ADMIN group rename/toggle form.
- `apps/web/components/web/lineage/lineage-profile-drawer.tsx` — drawer tab replacement, verification badges, ellipsis menu, and promoter modal launcher.
- `apps/web/components/web/lineage/lineage-rank-history-tab.tsx` — new rank history tab without notes exposure.
- `apps/web/components/web/lineage/promoter-change-modal.tsx` — new Base UI dialog wrapping the promoter server action.
- `apps/web/server/web/lineage/editor-actions.ts`, `editor-schemas.ts`, `editor-errors.ts`, `editor-queries.ts`, `editor-actions.test.ts` — editor action schemas, permission alignment, visual group action, promoter verification/rank validation, and tests.
- `apps/web/server/web/lineage/payloads.ts`, `queries.ts`, `queries.visibility.test.ts` — rank payload allowlist and public `showRanks` redaction tests.
- `apps/web/server/web/lineage/bbl-bjj-rank-map.ts`, `bbl-bjj-rank-map.test.ts` — BBL BJJ rank extraction and verification normalization.
- `apps/web/prisma/seed.ts` — adds base BJJ `Black Belt` (`BK0`) rank.
- `apps/web/e2e/lineage/authenticated-lifecycle.spec.ts`, `apps/web/e2e/helpers/seed-lineage-lifecycle*.ts` — promoter modal e2e and fixture state assertion.
- `docs/architecture/lineage/bbl-bjj-rank-verification-import-map.md` — new BBL BJJ import map.
- `docs/architecture/lineage/SESSION_0263_audit_report.md`, `docs/knowledge/wiki/index.md`, `docs/sprints/SESSION_0264.md` — audit/session/wiki close updates.

## Decisions resolved

- BBL legacy verification is source/profile-level, not per-rank-award; current mapping carries it to `LineageNode`/`LineageRelationship`, not `RankAward`.
- Legacy BJJ `black_belt_promotion_date` requires a base `Black Belt` rank (`BK0`), not collapse into `BK1`.
- Drawer Admin/Edit surface is a vertical ellipsis menu with tooltip affordance, not a fourth tab.
- Group rename/public-label/collapse controls are TREE_ADMIN-only.
- Public drawer rank history must respect `DirectoryProfile.showRanks`; `RankAward.notes` are not selected or rendered in lineage public payloads.

## Open decisions / blockers

- Canvas node context-menu launch for `Change promoter...` remains a follow-up affordance. The P0 modal path is covered through the drawer ellipsis menu and E2E.
- Group creation and collapse behavior are not implemented; SESSION_0264 only persists settings for existing groups.
- Drawer `Lineage` tab still does not load/render student relationship lists; it shows current instructor summary only.
- Full Playwright suite was not run; the lineage lifecycle spec was run and passed. Existing broader-suite baseline risk from SESSION_0262 remains.
- Claim approval bypass semantics (`bypassReason` vs duplicate-node hard guard) remain deferred to SESSION_0265 bow-in.

## Verification

- `cd apps/web && bun test server/web/lineage/editor-actions.test.ts server/web/lineage/queries.visibility.test.ts server/web/lineage/bbl-bjj-rank-map.test.ts` — 29 pass, 0 fail.
- `cd apps/web && bun run typecheck` — pass.
- `cd apps/web && bunx playwright test e2e/lineage/authenticated-lifecycle.spec.ts --project=chromium --grep "tree editor updates"` — 1 pass.
- `cd apps/web && bunx playwright test e2e/lineage/authenticated-lifecycle.spec.ts --project=chromium` — 4 pass.
- `bun run wiki:lint` — failed with 232 errors and 552 warnings; failures are broad pre-existing wiki/index/archive debt, with touched-file G8 warnings in `SESSION_0263_audit_report.md` cleaned during close.

## Review log

### SESSION_0264 - Lineage editor P0 close

#### Review

**SESSION_0264_REVIEW_01 - P0 editor close and drawer rank privacy**

- **Reviewed tasks:** SESSION_0264_TASK_00, SESSION_0264_TASK_00A, SESSION_0264_TASK_01, SESSION_0264_TASK_02, SESSION_0264_TASK_03, SESSION_0264_TASK_04, SESSION_0264_TASK_04A, SESSION_0264_TASK_05
- **Dirstarter docs check:** cached docs sufficient
- **Sources:** local Dirstarter-aligned Base UI components under `apps/web/components/common/*`; no Dirstarter baseline layer changed.
- **Verdict:** The four SESSION_0263 P0 editor gaps are closed in the app surface with focused tests. The drawer rank surface had the highest leakage risk; it now uses explicit payload allowlists, omits rank-award notes, and redacts rank awards for public users who opt out of rank display.

#### Findings

**SESSION_0264_FINDING_01 - Full Playwright suite still not rerun**

- **Severity:** medium
- **Task:** SESSION_0264_TASK_05
- **Evidence:** Verification ran the full lineage lifecycle spec only, not `bunx playwright test`.
- **Impact:** The session proves the touched lineage lifecycle path, but not the entire 29-spec suite baseline.
- **Required follow-up:** Run full Playwright suite in SESSION_0264b/next validation slot.
- **Status:** open

**SESSION_0264_FINDING_02 - Canvas node context menu still missing**

- **Severity:** low
- **Task:** SESSION_0264_TASK_02
- **Evidence:** `Change promoter...` is available from drawer ellipsis menu; no node-card context menu was added.
- **Impact:** Acceptance path exists, but there is one fewer editor shortcut than the original Claude plan wanted.
- **Required follow-up:** Add node-card overflow menu if operator still wants canvas-local promoter changes.
- **Status:** accepted-risk

## Hostile close review

### SESSION_0264 - Lineage editor P0 close

#### Review

**Plan sanity:** The Claude plan had two invalid assumptions: group server logic did not exist, and the session pivoted midstream to BBL rank/verification first. Both were corrected in implementation.

**Dirstarter compliance:** Aligned. This extends Ronin lineage-specific surfaces and uses existing common Base UI primitives, tooltips, dropdown menus, dialogs, selects, switches, and buttons.

**Security:** Drawer rank surface received a hostile pass. Public reads now honor `DirectoryProfile.showRanks`, `RankAward.notes` are not selected or rendered, profile visibility filtering remains server-side, and promoter updates validate rank-award ownership before writing relationships.

**Data integrity:** Stronger than entry state. Promoter updates persist selected verification status, reject unrelated rank awards, write audit logs, and visual-group updates require TREE_ADMIN. Editor actions now align global/org-admin capability with server action grants.

**Lifecycle proof:** The promoter modal happy path is proven by Playwright and DB assertion. Drag/drop/group UI has server tests and type proof, but no browser drag e2e yet.

**Verification honesty:** Good for touched server contracts and the lineage lifecycle. Not a full-suite proof.

**Workflow honesty:** Bow-in, Graphify-first discovery, task log, audit update, wiki index, hostile review, and close ritual were followed. `apps/web/test-results/.last-run.json` is left unstaged as generated Playwright state.

**Merge readiness:** Ready to merge with one medium follow-up: full Playwright suite rerun.

#### Kaizen

1. **Is this safe and secure? What tests would prove me right?** The drawer rank path is materially safer: notes are not in the payload, rank awards redact when `showRanks` is false, and visibility materializer tests cover the public path. A future browser-level privacy e2e should open a public drawer for a `showRanks=false` profile and assert no rank text or rank metadata appears in DOM/source.
2. **Failed steps we could have prevented:** Two. The dnd wrapper initially exposed a duplicate accessible button; Playwright caught it. The server action file exported a non-async constant from `"use server"`; Playwright caught it. Better preflight: after adding client imports from a server-action file, inspect all value exports before browser testing.
3. **Confidence at scale:** 100 records: 8.5/10. 1,000 records: 8/10. 10,000 records: 7/10. Lowest-tier aggregate is 7 because drag/drop rendering remains a client-side tree view and needs larger visual/performance proof before 10k-scale confidence.

Score cap: 8.9 due missing full-suite Playwright proof and no drag e2e.

## ADR / ubiquitous-language check

No ADR required. The session applies existing ADR 0016 lineage promotion source-of-truth rules and adds a field map doc, not a new architectural decision. No ubiquitous-language update required beyond existing `RankAward`, `LineageRelationship`, and lineage verification terms.

## Reflections

- The BBL Pods files located this session are schema/mapping sources, not member row dumps. Future importer work should not assume full historical data is present there.
- The most useful security improvement was not a new UI control; it was narrowing the rank payload and honoring `showRanks` in public lineage reads.
- Playwright caught two issues that typecheck could not: duplicate accessible node buttons and Next's runtime server-action export rule.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Updated `SESSION_0264.md`, `SESSION_0263_audit_report.md`, `bbl-bjj-rank-verification-import-map.md`, and wiki index with current date/agent. |
| Backlinks/index sweep | Added BBL import map to wiki architecture index; SESSION_0264 is linked from wiki and audit report. |
| Wiki lint | `bun run wiki:lint` failed with 232 errors and 552 warnings; broad pre-existing broken-link/G8 debt remains outside touched-file scope. |
| Kaizen reflection | Present in `Hostile close review` and `Reflections`. |
| Hostile close review | Present: `SESSION_0264_REVIEW_01`, findings 01–02. |
| Review & Recommend | Next session section present below. |
| Memory sweep | No operator memory update needed; durable facts are captured in architecture/session docs. |
| Next session unblock check | Unblocked; first task is concrete. |
| Git hygiene | Pending final stage/commit/push after this SESSION update. |
| Graphify update | Pending after git hygiene. |

## Next session

- **Goal:** SESSION_0264b validation/polish: full Playwright baseline, drag/group browser proof, and public rank-redaction browser privacy proof.
- **Inputs to read:** `docs/sprints/SESSION_0264.md`, `docs/architecture/lineage/SESSION_0263_audit_report.md`, `apps/web/components/web/lineage/lineage-tree-canvas.tsx`, `apps/web/e2e/lineage/authenticated-lifecycle.spec.ts`, `apps/web/server/web/lineage/queries.visibility.test.ts`.
- **First task:** Run `cd apps/web && bunx playwright test`; triage any failures before adding new editor drag/privacy e2e.

## Status

closed
