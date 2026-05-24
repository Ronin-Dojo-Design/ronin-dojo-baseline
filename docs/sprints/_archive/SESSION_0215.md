---
title: "SESSION 0215 — Base UI migration Phase 4 Tooltip"
slug: session-0215
type: session--implement
status: closed-full
created: 2026-05-21
updated: 2026-05-21
last_agent: codex-session-0215
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0214.md
  - docs/sprints/petey-plan-0083.md
  - docs/knowledge/wiki/drift-register.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0215 — Base UI migration Phase 4 Tooltip

## Date

2026-05-21

## Operator

Brian + codex-session-0215 (Petey orchestration, Cody implementation, Doug verification)

## Goal

Execute D-016 Phase 4 by migrating Tooltip from Ronin's Radix wrapper API to the upstream Base UI compound composition.

## Bow-in notes

- **Previous session:** SESSION_0214 closed D-016 Phase 5 and intentionally deferred Tooltip because it was larger than HoverCard + Accordion.
- **Branch/worktree:** `main`; worktree clean at bow-in; active repo is `/Users/brianscott/dev/ronin-dojo-app`.
- **Upstream pin:** `/Users/brianscott/Local Sites/DirStarter /dirstarter_template` @ `7e724b6`; read-only reference copy.
- **FAILED_STEPS check:** FS-0001/FS-0014 (L1 primitive bypass), FS-0008 (primitive API spot-check), FS-0020 (Graphify-first discovery), FS-0024 (Ronin cwd discipline) are in scope. Mitigation: Graphify ran before repo-wide search; upstream + Ronin primitive APIs were read directly; commands run with cwd pinned to `/Users/brianscott/dev/ronin-dojo-app`.
- **Phase decision:** one-pass migration. A compatibility adapter would preserve the old `tooltip=` API and postpone the consumer migration D-016 is meant to complete. Current AST count is broad but mechanically uniform enough to split consumer rewrites by file group.

## Graphify check

- **Graph status:** populated at bow-in; `graphify stats` reported 6855 nodes / 11102 edges / 859 communities / 1297 files. `.graphify/graph_report.md` header does not record a commit; SESSION_0214 states Graphify was refreshed at close.
- **Queries used:**
  - `graphify query "D-016 Tooltip tooltip component migration upstream composition" --budget 3000`
  - `graphify query "petey-plan-0083 tooltip drift register SESSION_0214" --budget 3000`
  - `graphify query "components/common/tooltip.tsx upstream Dirstarter tooltip" --budget 3000`
  - `graphify query "SESSION_0215 TASK_PLAN_LOG TASK_REVIEW_LOG project-log D-016 Tooltip" --budget 2500`
- **Files selected from graph + direct reads:** `docs/sprints/SESSION_0214.md`, `docs/knowledge/wiki/drift-register.md`, `docs/sprints/petey-plan-0083.md`, `docs/architecture/uplift/lane-ledger.md`, `docs/protocols/project-log.md`, upstream `components/common/tooltip.tsx`, Ronin `apps/web/components/common/tooltip.tsx`.
- **Verification note:** Graphify selected the Tooltip primitive and consumer family; exact TypeScript AST inventory over tracked `apps/web` TS/TSX files found 46 Tooltip JSX tags across 25 files.

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | `components/common/tooltip.tsx` from upstream `7e724b6`; common UI primitive. |
| Extension or replacement | Replacement in place. Ronin adopts upstream Base UI runtime and compound composition. |
| Why justified | Continuation of operator-directed `D-016` Radix → Base UI primitive migration. Tooltip still imports the Radix umbrella package and exposes a Ronin-only wrapper API. |
| Risk if bypassed | Radix remains reachable through a high-use common primitive, consumer code stays on a deprecated local API, and Phase 8 dependency cleanup remains blocked. |

## Petey plan

### Goal

Ship D-016 Phase 4 in one pass: migrate Tooltip to the upstream Base UI primitive and rewrite all current Tooltip consumers to compound composition.

### Tasks

#### TASK_01 — Tooltip primitive and provider API

- **Agent:** Cody
- **What:** Replace the Radix Tooltip wrapper with upstream Base UI Tooltip parts.
- **Steps:**
  1. Rewrite `apps/web/components/common/tooltip.tsx` from upstream `components/common/tooltip.tsx`.
  2. Preserve Ronin export names: `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`.
  3. Do not keep the legacy `tooltip` wrapper prop unless a typecheck failure proves a temporary adapter is required.
  4. Map provider consumers from `delayDuration` to Base UI `delay`.
- **Done means:** `tooltip.tsx` imports `@base-ui/react/tooltip`, exports compound parts, and no longer imports `radix-ui`.
- **Depends on:** nothing.

#### TASK_02 — Tooltip consumer rewrite

- **Agent:** Cody workers
- **What:** Rewrite all `tooltip=` call sites to `<Tooltip><TooltipTrigger render={...}/><TooltipContent>...</TooltipContent></Tooltip>`.
- **Steps:**
  1. Worker A owns admin-side files under `apps/web/app/admin/**` and `apps/web/components/admin/**`.
  2. Worker B owns public/web/shared files under `apps/web/components/web/**` plus `apps/web/app/layout.tsx`.
  3. Convert per-tooltip `delayDuration` to trigger `delay`; convert provider `delayDuration` to provider `delay`.
  4. Convert Radix `disableHoverableContent` intent to Base UI `disableHoverablePopup` on the affected tooltip roots where needed.
- **Done means:** exact AST check reports zero `tooltip` props on imported `Tooltip`, zero `Tooltip.Provider`, and provider props use `delay`.
- **Depends on:** TASK_01.

#### TASK_03 — Verification and full close

- **Agent:** Doug + Petey
- **What:** Run residual checks, verification gates, D-016 docs, and full close.
- **Steps:**
  1. Run exact AST residual checks for Tooltip imports, JSX tags, and legacy props.
  2. Run `pnpm --filter dirstarter typecheck`, `bun run lint`, app tests with `--concurrency=1`, `pnpm --filter dirstarter build`, and `bun run wiki:lint`.
  3. Update D-016 docs: drift register, petey-plan-0083, component inventory if needed, lane ledger, project log, SESSION file, and `.dirstarter-upstream`.
  4. Commit, push `main`, then refresh Graphify after git hygiene.
- **Done means:** verification gates recorded; docs updated; commit pushed to `main`; Graphify refreshed.
- **Depends on:** TASK_01-02.

### Parallelism

TASK_01 is the blocking primitive/API step. TASK_02 can run in parallel after TASK_01 because Worker A and Worker B have disjoint code write sets. TASK_03 is sequential after all code rewrites.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Cody | Primitive API must be established before consumers move. |
| TASK_02 | Cody workers | 25 consumer files split cleanly into admin and web/shared groups. |
| TASK_03 | Doug + Petey | Verification, hostile close review, docs/ledger hygiene. |

### Open decisions

- None. Petey records a one-pass decision; no compatibility adapter is planned.

### Risks

- Tooltip has more consumers than prior Phase 5 and touches interactive buttons/links. Typecheck should catch prop/API drift, but a browser smoke may still be useful if the build is green.
- Base UI uses `delay`, `closeDelay`, `disableHoverablePopup`, and `render`; Radix names like `delayDuration`, `disableHoverableContent`, and `asChild` must not leak through.
- `popoverAnimationClasses` remains Radix-shaped until Phase 7. Upstream Tooltip uses it today; if visual selectors prove incompatible, keep the fix local to Tooltip rather than changing the global constant early.

### Scope guard

Do not migrate Phase 6/7/8 primitives in this session. Do not remove `radix-ui`, `cmdk`, or `cva`; final dependency cleanup remains Phase 8.

### Dirstarter implementation template

- **Docs read first:** live docs not required for this lane; upstream source files are the primitive contract. Local docs read: SESSION_0214, drift register, petey-plan-0083, Graphify runbook, project log.
- **Baseline pattern to extend:** upstream `components/common/tooltip.tsx` at `7e724b6`.
- **Custom delta:** preserve Ronin import paths and export names; rewrite current wrapper consumers into upstream compound composition.
- **No-bypass proof:** replacing an existing common primitive with the upstream runtime, not inventing a new tooltip abstraction.

## Pre-flight: Tooltip primitive

### 1. Existing component scan

- Graphify searched for: Tooltip, D-016, upstream composition, project-log, and petey-plan references.
- Found: `apps/web/components/common/tooltip.tsx` and 25 current consumer files.

### 2. L1 template scan

- Upstream source read: `/Users/brianscott/Local Sites/DirStarter /dirstarter_template/components/common/tooltip.tsx`.
- Ronin source read: `apps/web/components/common/tooltip.tsx`.
- Primitive API spot-check:
  - Upstream `TooltipProvider(props: TooltipPrimitive.Provider.Props)` defaults `delay = 0` and passes Base UI `delay`.
  - Upstream `Tooltip(props: TooltipPrimitive.Root.Props)` is the root only.
  - Upstream `TooltipTrigger(props: TooltipPrimitive.Trigger.Props)` supports `render` and trigger-level `delay`.
  - Upstream `TooltipContent(props: TooltipPrimitive.Popup.Props & Pick<TooltipPrimitive.Positioner.Props, "sideOffset" | "side" | "align"> & size variants)` wraps Portal → Positioner → Popup → Arrow.
  - Current Ronin `Tooltip` is a wrapper that takes `tooltip`, passes `delayDuration` to Radix Root, and wraps children with `TooltipTrigger asChild`.

### 3. Composition decision

- [x] Extending existing component: `tooltip.tsx`.
- [x] Composing existing components: all consumers move to `Tooltip` + `TooltipTrigger` + `TooltipContent`.
- [ ] New component: not applicable.

### 4. Lane docs loaded

- [x] Prior SESSION "Next session" section read.
- [x] Wiki entries for target area read: `drift-register.md`.
- [x] Runbook consulted: `graphify-repo-memory.md`.

### 5. Dev environment confirmed

- Working directory: `/Users/brianscott/dev/ronin-dojo-app`.
- Primary verification: typecheck, lint, tests, build, wiki-lint.

### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001, FS-0008, FS-0014, FS-0020, FS-0024.
- Mitigation acknowledged: yes.

## Tooltip AST inventory

- Total current Tooltip JSX: 46 tags across 25 files.
- Current legacy surface: 44 `tooltip` props, 3 provider delay props (`delayDuration`), 1 per-tooltip `delayDuration`, 1 `Tooltip.Provider` namespace use, and 1 `disableHoverableContent` provider prop.

## Status

closed-full

## What landed

- **D-016 Phase 4 complete in one pass:** Petey chose full primitive + consumer migration instead of a compatibility adapter.
- **Tooltip migrated to Base UI:** `apps/web/components/common/tooltip.tsx` now wraps `@base-ui/react/tooltip` Provider/Root/Trigger/Portal/Positioner/Popup/Arrow and no longer imports `radix-ui`.
- **All current Tooltip consumers migrated:** 43 legacy `tooltip=` wrapper call sites and 3 provider call sites now use `Tooltip`, `TooltipTrigger render={...}`, `TooltipContent`, and `TooltipProvider delay`.
- **Mixed-runtime animation protected:** Tooltip uses local Base UI animation selectors; global `popoverAnimationClasses` remains Radix-shaped until Phase 7.

## Files touched

- `apps/web/components/common/tooltip.tsx` — Radix wrapper → Base UI compound Tooltip primitive.
- `apps/web/app/layout.tsx` — provider `delayDuration` → `delay`.
- `apps/web/app/admin/tools/_components/tool-form.tsx` — legacy Tooltip wrapper → compound composition.
- `apps/web/app/admin/tournaments/_components/bracket-viewer.tsx` — legacy Tooltip wrapper → compound composition.
- `apps/web/app/admin/tournaments/_components/score-forms.tsx` — legacy Tooltip wrapper → compound composition.
- `apps/web/app/admin/tournaments/_components/staff-panel.tsx` — legacy Tooltip wrapper → compound composition.
- `apps/web/app/admin/tournaments/_components/weigh-in-panel.tsx` — legacy Tooltip wrapper → compound composition.
- `apps/web/app/admin/tournaments/roles/_components/tournament-role-actions.tsx` — legacy Tooltip wrapper → compound composition.
- `apps/web/app/admin/tournaments/rule-sets/_components/rule-set-actions.tsx` — legacy Tooltip wrapper → compound composition.
- `apps/web/app/admin/tournaments/rule-sets/_components/rule-sets-table-columns.tsx` — legacy Tooltip wrapper → compound composition.
- `apps/web/components/admin/chart.tsx` — legacy Tooltip wrapper → compound composition.
- `apps/web/components/admin/nav.tsx` — legacy Tooltip wrapper → compound composition.
- `apps/web/components/admin/relation-selector.tsx` — legacy Tooltip wrapper → compound composition.
- `apps/web/components/admin/sidebar.tsx` — legacy Tooltip wrapper → compound composition.
- `apps/web/components/admin/tournaments/registrations-table-columns.tsx` — legacy Tooltip wrapper → compound composition.
- `apps/web/components/admin/tournaments/registrations-table-toolbar-actions.tsx` — legacy Tooltip wrapper → compound composition.
- `apps/web/components/web/ads/ads-calendar.tsx` — legacy Tooltip wrapper → compound composition.
- `apps/web/components/web/ads/ads-picker.tsx` — legacy Tooltip wrapper → compound composition.
- `apps/web/components/web/footer.tsx` — legacy Tooltip wrapper → compound composition.
- `apps/web/components/web/listings/featured-tools-icons.tsx` — legacy Tooltip wrapper → compound composition.
- `apps/web/components/web/listings/listing-bookmark-button.tsx` — legacy Tooltip wrapper → compound composition.
- `apps/web/components/web/nav.tsx` — provider `delayDuration` → `delay`; share link tooltips migrated to compound composition.
- `apps/web/components/web/products/product-features.tsx` — per-tooltip `delayDuration` → trigger `delay`.
- `apps/web/components/web/tools/tool-actions.tsx` — legacy Tooltip wrapper → compound composition.
- `apps/web/components/web/tuffbuffs/affiliate-gear-browser.tsx` — `Tooltip.Provider` namespace → `TooltipProvider`; view mode tooltips migrated.
- `apps/web/components/web/verified-badge.tsx` — legacy Tooltip wrapper → compound composition.
- `apps/web/.dirstarter-upstream` — added SESSION_0215 partial-port note.
- `docs/sprints/SESSION_0215.md` — session plan, evidence, close notes.
- `docs/knowledge/wiki/drift-register.md` — ticked D-016 Phase 4 complete.
- `docs/sprints/petey-plan-0083.md` — updated D-016 phase status and cross-references.
- `docs/knowledge/wiki/dirstarter-component-inventory.md` — updated Tooltip primitive contract.
- `docs/architecture/uplift/lane-ledger.md` — appended Phase 4 ledger row.
- `docs/protocols/project-log.md` — current task plan and review entry.
- `docs/knowledge/wiki/index.md` — added SESSION_0215 row; bumped frontmatter.

## Decisions resolved

- Tooltip could be migrated in one pass. No compatibility adapter was added because it would keep the old wrapper API alive and defer the D-016 consumer migration.
- No ADR needed: this is a mechanical implementation of the existing D-016 Radix → Base UI migration direction.

## Open decisions / blockers

- **D-016 remains open:** Phase 6 form primitives are next (`checkbox.tsx`, `radio-group.tsx`, `switch.tsx`, `label.tsx`) plus `field.tsx` / `button-group.tsx` sanity pass.
- **Pre-existing Turbopack/NFT warning remains:** production build still warns that `server/admin/storage/monitoring/queries.ts` traces through `next.config.ts`. This warning predates SESSION_0215 and is unrelated to Tooltip.

## Next session

- **Goal:** D-016 Phase 6 form primitives.
- **Inputs to read:** `SESSION_0215.md`, `drift-register.md`, `petey-plan-0083.md`, upstream `components/common/{checkbox,radio-group,switch,label}.tsx`, Ronin `apps/web/components/common/{checkbox,radio-group,switch,label,field,button-group}.tsx`, current exact AST consumer counts for those primitives.
- **First task:** Decide the Phase 6 split: either migrate the four primitives together if consumer API drift is small, or split provider/primitive migration from consumer rewrites if `asChild`, `data-state`, or event payload differences are high.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0215_TASK_01 | ✅ done | Tooltip primitive and provider API |
| SESSION_0215_TASK_02 | ✅ done | Tooltip consumer rewrite |
| SESSION_0215_TASK_03 | ✅ done | Verification, docs, full close |

## Review log

- Exact residual checks: PASS for 0 legacy `tooltip` props, 0 `delayDuration`, 0 `disableHoverableContent`, 0 `Tooltip.Provider`, 0 primitive `radix-ui` text.
- Current Tooltip-family JSX after migration: 132 tags across 25 files (43 Tooltip roots, 43 Trigger render calls, 43 Content calls, 3 providers).
- Worker A focused checks: admin slice Biome, `git diff --check`, and typecheck passed.
- Worker B focused checks: web/shared slice Biome and typecheck passed.
- `pnpm --filter dirstarter typecheck`: pass.
- `bun run lint` from `apps/web`: pass; 979 files checked, no fixes applied.
- `bun run test -- --concurrency=1` from `apps/web`: 244 pass, 0 fail.
- `pnpm --filter dirstarter build`: pass; pre-existing Turbopack/NFT warning remains.
- `bun run wiki:lint`: 0 errors, 497 warnings (pre-existing warning classes: 2 orphan pages + 495 markdown formatting warnings).
- Project-log gate: Graphify query identified `project-log.md`; exact-file `awk` count for `SESSION_0215` returned 7 before close docs, satisfying the gate.

## Hostile close review

- **Verdict:** pass.
- **Reviewed tasks:** SESSION_0215_TASK_01, SESSION_0215_TASK_02, SESSION_0215_TASK_03.
- **Dirstarter docs check:** live docs not required for this primitive runtime lane; upstream `7e724b6` source file is the contract. Directly compared upstream `components/common/tooltip.tsx` to Ronin before implementation.
- **No P0/P1 findings:** Phase 4 removed the Radix dependency from Tooltip, eliminated the old wrapper API, and kept the global popover animation constant untouched for still-Radix primitives.
- **WORKFLOW score:** 9.8/10. Dirstarter alignment, residual checks, and verification are strong. Residual risk is limited to browser-level hover positioning/animation smoke, which typecheck/build cannot prove.

## ADR / ubiquitous-language check

- No ADR needed. D-016 already records the architectural direction for Radix → Base UI primitive runtime migration.
- No ubiquitous-language update needed. No domain terms changed.

## Reflections

- The one-pass decision worked because every consumer followed the same old wrapper shape. A compatibility adapter would have reduced the patch size today but left the hard part for another session.
- Keeping Tooltip's Base UI animation selectors local avoided repeating the `popoverAnimationClasses` mixed-runtime risk from SESSION_0214.
- Splitting workers by admin vs web/shared gave useful parallelism without write conflicts. The common primitive stayed on the main thread because every consumer depended on that API shape.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Updated current touched docs frontmatter where applicable: `SESSION_0215`, `drift-register`, `petey-plan-0083`, `dirstarter-component-inventory`, `lane-ledger`, `project-log`, `wiki/index`. Code files have no JETTY frontmatter. |
| Backlinks/index sweep | Added `SESSION_0215` backlinks/pairs where touched docs track session references; added SESSION_0215 row to `wiki/index.md`. |
| Wiki lint | `bun run wiki:lint` passed with 0 errors / 497 warnings; warnings are pre-existing orphan/markdown-formatting classes. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | `SESSION_0215_REVIEW_01` recorded in `project-log.md`; session review log records all verification gates. |
| Review & Recommend | Next session goal written: D-016 Phase 6 form primitives, with split decision as first task. |
| Memory sweep | Repo-scoped memory captured in this SESSION, D-016, petey-plan-0083, component inventory, and lane ledger; no operator-side memory update needed. |
| Next session unblock check | Unblocked. Inputs and first task are concrete; no user decision required before bow-in. |
| Git hygiene | Final branch/status/commit/push proof will be reported after git hygiene. |
| Graphify update | Will run after commit/push per closing ritual and report final stats in bow-out response. |
