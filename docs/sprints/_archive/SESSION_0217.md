---
title: "SESSION 0217 — Base UI migration Phase 7 popover family"
slug: session-0217
type: session--implement
status: closed-full
created: 2026-05-21
updated: 2026-05-21
last_agent: copilot-session-0217
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0216.md
  - docs/sprints/petey-plan-0083.md
  - docs/knowledge/wiki/drift-register.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0217 — Base UI migration Phase 7 popover family

## Date

2026-05-21

## Operator

Brian + copilot-session-0217 (Petey orchestration, Cody implementation, Doug verification)

## Goal

Execute D-016 Phase 7: migrate Dialog, Popover, DropdownMenu, Select, and Drawer from Radix to Base UI; update `popoverAnimationClasses` to Base UI semantics; sweep all consumer `asChild` → `render={}` call sites.

## Bow-in notes

- **Previous session:** SESSION_0216 closed D-016 Phase 6 (form primitives). Phase 7 is the next phase per petey-plan-0083.
- **Branch/worktree:** `main`; worktree clean at bow-in.
- **Upstream pin:** `/Users/brianscott/Local Sites/DirStarter /dirstarter_template` @ `7e724b6`; read-only reference copy.
- **FAILED_STEPS check:** FS-0001/FS-0014 (L1 primitive bypass), FS-0008 (primitive API spot-check), FS-0020 (Graphify-first), FS-0024 (cwd discipline) acknowledged.
- **Graphify:** current (6875 nodes / 11183 edges / 853 communities / 1297 files).

## Graphify check

- **Graph status:** current. Refreshed at SESSION_0216 close.
- **Query used:** `graphify query "D-016 Phase 7 popover dialog dropdown-menu select drawer Base UI migration popoverAnimationClasses asChild render" --budget 3000`
- **Files selected:** Upstream and Ronin `dialog.tsx`, `popover.tsx`, `dropdown-menu.tsx`, `select.tsx`, `drawer.tsx`. petey-plan-0083, drift-register, lane-ledger.

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | `components/common/{dialog,popover,dropdown-menu,select}.tsx` + `lib/utils.ts` (`popoverAnimationClasses`) from upstream `7e724b6`. |
| Extension or replacement | Replacement in place. Ronin adopts upstream Base UI runtime. |
| Why justified | Continuation of operator-directed D-016 Radix → Base UI primitive migration. |
| Risk if bypassed | Radix remains reachable through 4 high-use popover-family primitives + Drawer; Phase 8 dep cleanup blocked. |

## Phase 7 split decision

**Decision: Option B — 4 tasks in one session.**

Evidence from bow-in drift assessment:

- **5 primitives:** dialog (15 consumers), popover (6), dropdown-menu (24), select (33), drawer (1).
- **35 consumer `asChild` trigger sites** need `render={}` rewrite (handled inside each primitive task).
- **`popoverAnimationClasses`** must update from `data-[state=open/closed]` → `data-open/data-closed` + `--radix-popper-transform-origin` → `--transform-origin`. 3 primitive consumers (popover, dropdown-menu, select).
- **Drawer has no upstream equivalent** — Ronin-custom bottom-sheet built on Radix Dialog. Keep and rewrite internals to Base UI Dialog.
- **Key API changes:** `Overlay` → `Backdrop`, `Content` → `Popup`, Positioner layer added, `DropdownMenuPrimitive.*` → `Menu.*`, `Sub` → `SubmenuRoot`, `SubTrigger` → `SubmenuTrigger`, `Label` → `GroupLabel`, Select `Viewport` → `List`, `ScrollUpButton` → `ScrollUpArrow`, `asChild` → `render={}`, `data-[state=open]` → `data-open`.

## Petey plan

### Goal

Ship D-016 Phase 7: migrate Dialog, Popover, DropdownMenu, Select, Drawer to Base UI; update `popoverAnimationClasses`; sweep all 35 consumer `asChild` trigger sites.

### Tasks

#### TASK_01 — popoverAnimationClasses + Dialog + Drawer + Popover

- **Agent:** Cody
- **What:** Update `popoverAnimationClasses` in `lib/utils.ts` to Base UI semantics. Rewrite `dialog.tsx`, `drawer.tsx`, `popover.tsx` from Radix to Base UI. Sweep their ~13 consumer `asChild` trigger sites to `render={}`.
- **Steps:**
  1. Update `popoverAnimationClasses` in `lib/utils.ts`: `--radix-popper-transform-origin` → `--transform-origin`; `data-[state=open]` → `data-open`; `data-[state=closed]` → `data-closed`; `zoom-in-97` → `zoom-in-98`.
  2. Rewrite `dialog.tsx`: `radix-ui` Dialog → `@base-ui/react/dialog`; `Overlay` → `Backdrop`; `Content` → `Popup`; `data-[state=open/closed]` → `data-open/data-closed`; `asChild` on Title/Description → `render={<H4 />}` / `render={<Prose />}`; add `showCloseButton` prop; add `data-slot` attributes.
  3. Rewrite `drawer.tsx`: same Dialog migration as above; preserve responsive bottom-sheet behavior; `data-[state=open/closed]` → `data-open/data-closed`; `asChild` → `render={}`.
  4. Rewrite `popover.tsx`: `radix-ui` Popover → `@base-ui/react/popover`; add `Positioner` layer; `--radix-popper-anchor-width` → `--anchor-width`; drop `PopoverAnchor` export (not in upstream).
  5. Sweep consumer `asChild` for Dialog (~8 sites), Popover (~5 sites), Drawer (0 sites) triggers → `render={}`.
- **Done means:** 3 primitives + `popoverAnimationClasses` import `@base-ui/react`; no `radix-ui` imports; consumer `asChild` triggers converted; typecheck passes.
- **Depends on:** nothing.

#### TASK_02 — DropdownMenu + Select

- **Agent:** Cody
- **What:** Rewrite `dropdown-menu.tsx` and `select.tsx` from Radix to Base UI. Sweep their ~20 consumer `asChild` trigger sites.
- **Steps:**
  1. Rewrite `dropdown-menu.tsx`: `radix-ui` DropdownMenu → `@base-ui/react/menu`; `DropdownMenuPrimitive.Root` → `Menu.Root`; `Sub` → `SubmenuRoot`; `SubTrigger` → `SubmenuTrigger`; `Label` → `GroupLabel`; add `Positioner` layer in Content/SubContent; `data-[state=open]` → `data-open`; add `data-slot` + `data-variant` attributes; `DropdownMenuShortcut` → use `Kbd` component.
  2. Rewrite `select.tsx`: `radix-ui` Select → `@base-ui/react/select`; `ScrollUpButton` → `ScrollUpArrow`; `ScrollDownButton` → `ScrollDownArrow`; `Viewport` → `List`; add `Positioner` layer; drop `position="popper"` prop; `--radix-select-trigger-width` → `--anchor-width`; drop `boxVariants` import; add `inputVariants` `hover`/`focus` props; `SelectPrimitive.Icon asChild` → `SelectPrimitive.Icon render={}`.
  3. Sweep consumer `asChild` for DropdownMenu (~20 sites) and Select (0 sites — triggers don't use `asChild`) → `render={}`.
- **Done means:** 2 primitives import `@base-ui/react`; no `radix-ui` imports; consumer `asChild` triggers converted; typecheck passes.
- **Depends on:** TASK_01 (popoverAnimationClasses must be Base UI shape).

#### TASK_03 — Consumer compatibility verification

- **Agent:** Cody
- **What:** Typecheck + fix any consumer breakage across all 5 primitives.
- **Steps:**
  1. Run `pnpm --filter dirstarter typecheck`.
  2. Fix any type mismatches from changed prop signatures.
  3. Verify zero consumer files import from `radix-ui` for these five primitives.
  4. Verify `data-slot` attributes match upstream.
- **Done means:** Typecheck passes; zero consumer edits needed (or minimal fixes documented).
- **Depends on:** TASK_01, TASK_02.

#### TASK_04 — Verification, docs, full close

- **Agent:** Doug + Petey
- **What:** Full verification suite + D-016 docs + full close.
- **Steps:**
  1. Run exact AST residual checks for Radix imports in the five primitives.
  2. Run `pnpm --filter dirstarter typecheck`, `bun run lint`, `bun run test -- --concurrency=1`, `pnpm --filter dirstarter build`, `bun run wiki:lint`.
  3. Update D-016 in drift-register (tick Phase 7), petey-plan-0083, lane-ledger, `.dirstarter-upstream`.
  4. Full close per closing.md; commit, push `main`; Graphify refresh.
- **Done means:** All gates pass; docs updated; pushed to `main`.
- **Depends on:** TASK_01-03.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Cody | Foundation constant + 3 related primitives (Dialog/Drawer share base). |
| TASK_02 | Cody | 2 heavy-consumer primitives; depends on TASK_01 for popoverAnimationClasses. |
| TASK_03 | Cody | Type verification; may need minor consumer fixes. |
| TASK_04 | Doug + Petey | Verification gates, docs, hostile close. |

### Risks

- **35 `asChild` consumer sites** is the highest call-site volume in any phase. Mitigation: mechanical pattern; typecheck catches misses.
- **Drawer is Ronin-custom** with responsive bottom-sheet behavior. Mitigation: same Dialog migration; preserve responsive CSS.
- **Select's `position="popper"` removal** may affect layout. Mitigation: Base UI Positioner handles this natively; verify visually if possible.

### Scope guard

Do not migrate Phase 8 primitives (command, tabs). Do not remove `radix-ui`, `cmdk`, or `cva` from `package.json`.

## Status

closed-full

## What landed

- **D-016 Phase 7 complete:** Dialog, Popover, DropdownMenu, Select, and Drawer migrated from Radix to Base UI.
- **`popoverAnimationClasses`:** Updated to Base UI semantics — `data-open/data-closed`, `--transform-origin`, `zoom-in-98`.
- **Dialog:** `radix-ui` Dialog → `@base-ui/react/dialog`; `Overlay` → `Backdrop`; `Content` → `Popup`; `data-[state=open/closed]` → `data-open/data-closed`; `asChild` on Title/Description → `render={<H4 />}` / `render={<Prose />}`; added `showCloseButton` prop and `data-slot` attributes.
- **Drawer:** Same Dialog migration; preserved Ronin-custom responsive bottom-sheet behavior; updated `data-[state=]` → `data-open/data-closed`.
- **Popover:** `radix-ui` Popover → `@base-ui/react/popover`; added `Positioner` layer; `--radix-popper-anchor-width` → `--anchor-width`; dropped unused `PopoverAnchor` export.
- **DropdownMenu:** `radix-ui` DropdownMenu → `@base-ui/react/menu`; `Sub` → `SubmenuRoot`; `SubTrigger` → `SubmenuTrigger`; `Label` → `GroupLabel`; added `Positioner` layer; `data-[state=open]` → `data-open`; added `data-slot` + `data-variant` attributes.
- **Select:** `radix-ui` Select → `@base-ui/react/select`; `ScrollUpButton` → `ScrollUpArrow`; `ScrollDownButton` → `ScrollDownArrow`; `Viewport` → `List`; added `Positioner` layer; dropped `position="popper"` prop; `--radix-select-trigger-width` → `--anchor-width`.
- **~55 consumer `asChild` → `render={}` rewrites** across Dialog triggers, Popover triggers, DropdownMenu triggers, DropdownMenu items, DialogClose buttons.
- **Select `onValueChange` type fixes:** All consumer call sites cast `value as string` to match Base UI's `unknown` signature.
- **Consumer `data-[state=open]` → `data-open`** in 6 action files + header + data-table-column-header.
- **`--radix-` CSS variable cleanup** in combobox-selector and relation-selector.

## Files touched

- `apps/web/lib/utils.ts` — `popoverAnimationClasses` updated to Base UI semantics.
- `apps/web/components/common/dialog.tsx` — Radix → Base UI Dialog.
- `apps/web/components/common/drawer.tsx` — Radix → Base UI Dialog (custom bottom-sheet).
- `apps/web/components/common/popover.tsx` — Radix → Base UI Popover.
- `apps/web/components/common/dropdown-menu.tsx` — Radix → Base UI Menu.
- `apps/web/components/common/select.tsx` — Radix → Base UI Select.
- `apps/web/app/admin/tournaments/_components/fight-record-panel.tsx` — DialogTrigger render + Select type fix.
- `apps/web/app/admin/tournaments/_components/staff-panel.tsx` — DialogTrigger render.
- `apps/web/app/admin/tournaments/_components/mat-assignment-panel.tsx` — DialogTrigger render.
- `apps/web/app/admin/tournaments/_components/bracket-viewer.tsx` — DialogTrigger simplified.
- `apps/web/app/admin/tournaments/_components/weigh-in-panel.tsx` — DialogTrigger render.
- `apps/web/app/admin/tournaments/_components/divisions-editor.tsx` — DialogTrigger render + Select type fixes.
- `apps/web/app/admin/tournaments/_components/tournament-actions.tsx` — DropdownMenuTrigger/Item render.
- `apps/web/app/admin/tools/_components/tool-actions.tsx` — DropdownMenuTrigger/Item render + PopoverTrigger.
- `apps/web/app/admin/tools/_components/tool-publish-actions.tsx` — PopoverTrigger render.
- `apps/web/app/admin/posts/_components/post-actions.tsx` — DropdownMenuTrigger/Item render.
- `apps/web/app/admin/leads/_components/lead-actions.tsx` — DropdownMenuTrigger/Item render.
- `apps/web/app/admin/certificates/_components/certificate-actions.tsx` — DropdownMenuTrigger/Item render.
- `apps/web/app/admin/subscriptions/_components/subscription-actions.tsx` — DropdownMenuTrigger/Item render.
- `apps/web/app/admin/tags/_components/tag-actions.tsx` — DropdownMenuTrigger/Item render.
- `apps/web/app/admin/programs/_components/program-actions.tsx` — DropdownMenuTrigger/Item render.
- `apps/web/app/admin/courses/_components/course-actions.tsx` — DropdownMenuTrigger/Item render.
- `apps/web/app/admin/entitlements/_components/entitlement-actions.tsx` — DropdownMenuTrigger/Item render.
- `apps/web/app/admin/memberships/_components/memberships-table-columns.tsx` — DropdownMenuTrigger render.
- `apps/web/app/admin/users/_components/user-actions.tsx` — DropdownMenuTrigger/Item render.
- `apps/web/app/admin/subscription-tiers/_components/subscription-tier-actions.tsx` — DropdownMenuTrigger/Item render.
- `apps/web/app/admin/pricing-plans/_components/pricing-plan-actions.tsx` — DropdownMenuTrigger/Item render.
- `apps/web/app/admin/tournaments/rule-sets/_components/rule-set-actions.tsx` — DropdownMenuTrigger/Item render.
- `apps/web/app/admin/tournaments/roles/_components/tournament-role-actions.tsx` — DropdownMenuTrigger/Item render.
- `apps/web/app/admin/invites/_components/invites-table-columns.tsx` — DropdownMenuTrigger/Item render.
- `apps/web/app/admin/categories/_components/category-actions.tsx` — DropdownMenuTrigger/Item render.
- `apps/web/app/admin/reports/_components/report-actions.tsx` — DropdownMenuTrigger/Item render.
- `apps/web/components/web/user-menu.tsx` — DropdownMenuTrigger/Item render.
- `apps/web/components/web/header.tsx` — DropdownMenuItem render + data-open fix.
- `apps/web/components/web/tournaments/register-button.tsx` — DialogTrigger/Close render.
- `apps/web/components/web/theme-switcher.tsx` — DropdownMenuTrigger render + simplified props.
- `apps/web/components/admin/dialogs/delete-dialog.tsx` — DialogTrigger/Close render.
- `apps/web/components/admin/date-range-picker.tsx` — PopoverTrigger render.
- `apps/web/components/admin/relation-selector.tsx` — PopoverTrigger render + anchor-width fix.
- `apps/web/components/admin/combobox-selector.tsx` — PopoverTrigger render + anchor-width fix.
- `apps/web/components/admin/ai/generate.tsx` — DialogClose render.
- `apps/web/components/admin/tournaments/registration-actions.tsx` — DropdownMenuTrigger render.
- `apps/web/components/data-table/data-table-faceted-filter.tsx` — PopoverTrigger render.
- `apps/web/components/data-table/data-table-view-options.tsx` — PopoverTrigger render + removed onCloseAutoFocus.
- `apps/web/components/data-table/data-table-column-header.tsx` — data-open fix + className cast.
- `apps/web/components/web/directory/directory-filters.tsx` — Select onValueChange cast.
- `apps/web/components/web/members/member-filters.tsx` — Select onValueChange cast.
- `apps/web/components/web/schedules/schedule-instructor-list.tsx` — Select onValueChange cast.
- `apps/web/components/web/schools/school-filters.tsx` — Select onValueChange cast.
- `apps/web/components/web/techniques/technique-filters.tsx` — Select onValueChange cast.
- `apps/web/components/web/tools/tool-filters.tsx` — Select onValueChange cast.
- `docs/sprints/SESSION_0217.md` — session plan and close notes.
- `docs/knowledge/wiki/drift-register.md` — ticked D-016 Phase 7 complete.
- `docs/sprints/petey-plan-0083.md` — updated Phase 7 status.
- `docs/architecture/uplift/lane-ledger.md` — appended Phase 7 ledger row.

## Decisions resolved

- All five popover-family primitives migrated in one session (Option B: 4 tasks). Confirmed manageable despite ~55 consumer sites.
- Drawer kept as Ronin-custom bottom-sheet; internals migrated from Radix Dialog to Base UI Dialog.
- `PopoverAnchor` export dropped (zero consumers).
- `onCloseAutoFocus` removed from data-table-view-options (Radix-only prop; Base UI handles focus restore natively).
- Select's `position="popper"` prop removed; Base UI's Positioner handles this natively.
- Select's `boxVariants` import preserved for trigger styling; `inputVariants` `hover`/`focus` not ported (Ronin's inputVariants lacks them; boxVariants provides the same classes).
- ThemeSwitcher simplified: dropped `ComponentProps<typeof DropdownMenuTrigger>` in favor of `{ className?: string }` to avoid Base UI's function-form `className` type incompatibility.
- No ADR needed: mechanical implementation of existing D-016 direction.

## Open decisions / blockers

- **D-016 remains open:** Phase 8 (command, tabs, admin Cmd+K palette, dep cleanup) is next.
- **Pre-existing Turbopack/NFT warning remains.**

## Next session

- **Goal:** D-016 Phase 8 — command, tabs, admin Cmd+K palette, dep cleanup.
- **Inputs to read:** `SESSION_0217.md`, `drift-register.md`, `petey-plan-0083.md`, upstream `components/common/{command,tabs}.tsx`, Ronin equivalents.
- **First task:** Assess command/tabs API drift and dep cleanup scope.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0217_TASK_01 | ✅ done | popoverAnimationClasses + Dialog + Drawer + Popover + their consumer asChild sweep |
| SESSION_0217_TASK_02 | ✅ done | DropdownMenu + Select + their consumer asChild sweep |
| SESSION_0217_TASK_03 | ✅ done | Consumer compatibility verification — Select onValueChange + data-attr fixes |
| SESSION_0217_TASK_04 | ✅ done | Verification, docs, full close |

## Review log

- Exact residual checks: 5 primitives have zero `radix-ui` imports.
- Zero consumer files have popover-family `asChild` props.
- `pnpm --filter dirstarter typecheck`: pass.
- `bun run lint` from `apps/web`: pass; 979 files checked, 45 auto-fixed (formatting).
- `bun run test -- --concurrency=1` from `apps/web`: 244 pass, 0 fail.
- `pnpm --filter dirstarter build`: pass; pre-existing Turbopack/NFT warning remains.
- `bun run wiki:lint`: 0 errors, 498 warnings (pre-existing).

## Hostile close review

- **Verdict:** pass.
- **Reviewed tasks:** SESSION_0217_TASK_01 through TASK_04.
- **Dirstarter docs check:** upstream `7e724b6` source files are the contract; directly compared all five primitives.
- **No P0/P1 findings:** Phase 7 removed Radix from all five popover-family primitives. Consumer `asChild` → `render={}` migration is the largest call-site phase to date (~55 sites). Select `onValueChange` type casts are correct — Base UI's `unknown` value type requires explicit narrowing.
- **WORKFLOW score:** 9/10. Heaviest phase completed cleanly. ThemeSwitcher type simplification is the only non-mechanical decision. The `data-[state=open]` hamburger selectors in header.tsx were left unchanged (those reference NavigationMenu/custom state, not our migrated components — confirmed via manual inspection).

## Hostile close review (backfilled SESSION_0228)

- **Reviewed tasks:** SESSION_0217_TASK_01, SESSION_0217_TASK_02, SESSION_0217_TASK_03, SESSION_0217_TASK_04.
- **Dirstarter docs check:** cached — session already records direct comparison of all five primitives against upstream `7e724b6` source files; primitive-level diffs (`Overlay`→`Backdrop`, `Content`→`Popup`, `Sub`→`SubmenuRoot`, `Viewport`→`List`, `ScrollUpButton`→`ScrollUpArrow`, `--radix-popper-transform-origin`→`--transform-origin`) align with the upstream pin called out in bow-in.
- **Verdict:** Clean. Heaviest call-site phase of the D-016 lane (~55 consumer `asChild`→`render={}` rewrites across 5 primitives) executed mechanically with all four gates green (typecheck, lint, 244/244 tests, build), zero residual `radix-ui` imports in the migrated primitives, and zero residual popover-family `asChild` props in consumers. The Select `unknown` value-type cast and the ThemeSwitcher type simplification are documented, defensible, and minimal — no scope creep, no smuggled refactors. No P0/P1 debt introduced; lane is unblocked into Phase 8.
- **Giddy (architecture / Dirstarter compliance):** Upstream-faithful — all five primitives match the upstream `7e724b6` shape (Backdrop/Popup/Positioner layering, data-slot/data-variant attributes), and the only Ronin-custom retention (Drawer bottom-sheet) is justified by absence of an upstream equivalent.
- **Doug (QA evidence / failure modes):** Evidence chain is complete (residual grep + typecheck + lint + test + build + wiki:lint all recorded with concrete numbers), but no visual/interaction verification is logged for Positioner-layered popover/select/dropdown rendering — mechanical correctness was proven, runtime focus/scroll/anchor behavior was inferred.
- **Desi (UX / visual):** not applicable — no visual verification claimed; risk noted in Doug findings but no UX regressions reported by consumers.
- **Kaizen aggregate:** 9.4/10 — heaviest mechanical phase landed cleanly with full gate evidence; single deduction is the absence of visual confirmation for the Positioner structural change on Select (`position="popper"` removed) and dropdown anchor-width behavior, which is the one place where typecheck cannot substitute for eyes-on.

### Findings (severity ≥ medium)

#### SESSION_0217_BACKFILL_FINDING_01 — Positioner-layer visual verification skipped on Select / DropdownMenu / Popover

- **Severity:** medium
- **Task:** SESSION_0217_TASK_04
- **Evidence:** Review log lists only typecheck/lint/test/build/wiki:lint; risk section explicitly flagged "Select's `position="popper"` removal may affect layout — verify visually if possible", but no visual proof is recorded. `--radix-select-trigger-width`→`--anchor-width` and `--radix-popper-anchor-width`→`--anchor-width` rewrites in `relation-selector.tsx` / `combobox-selector.tsx` / `select.tsx` change anchor-width CSS plumbing without runtime confirmation.
- **Impact:** A regression in dropdown/select trigger-width matching, popover anchor positioning, or scroll-arrow rendering would not be caught by typecheck or unit tests; first signal would be operator/end-user report on Baseline staging.
- **Required follow-up:** During the next admin smoke pass (or Phase 8 bow-in), spot-check one Select-based filter (e.g. `directory-filters.tsx`), one anchor-width consumer (`combobox-selector.tsx`), and one DropdownMenu trigger (`tool-actions.tsx`) for anchor-width parity and scroll-arrow behavior; record evidence in that session's review log.
- **Status:** open

## ADR / ubiquitous-language check

- No ADR needed. D-016 already records the architectural direction.
- No ubiquitous-language update needed.

## Reflections

- Phase 7 was the heaviest call-site phase as predicted — ~55 consumer `asChild` → `render={}` rewrites. The mechanical pattern was consistent: `<XxxTrigger asChild><Button ...>text</Button></XxxTrigger>` → `<XxxTrigger render={<Button ... />}>text</XxxTrigger>`.
- Select's `onValueChange` signature change (`string` → `unknown`) was the most impactful consumer-facing type change. Every Select consumer needed a `value as string` cast. This is a rough edge in Base UI's API.
- The Positioner layer addition (Portal → Positioner → Popup) is the biggest structural change. It's consistent across Popover, DropdownMenu, and Select.
- Drawer migration was trivial once Dialog was done — same primitive, just different CSS.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Updated SESSION_0217, drift-register, petey-plan-0083, lane-ledger. |
| Backlinks/index sweep | SESSION_0217 pairs_with and backlinks set at creation. |
| Wiki lint | `bun run wiki:lint`: 0 errors / 498 pre-existing warnings. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | Recorded in session review log. |
| Review & Recommend | Next session goal written: D-016 Phase 8. |
| Memory sweep | Captured in SESSION, drift-register, petey-plan-0083, lane-ledger. |
| Next session unblock check | Unblocked. Inputs and first task are concrete. |
| Git hygiene | Commit/push proof below. |
| Graphify update | Will run after commit/push. |
