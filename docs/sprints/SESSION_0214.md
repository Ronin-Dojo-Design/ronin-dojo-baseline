---
title: "SESSION 0214 — Base UI migration Phase 5 (HoverCard, Accordion)"
slug: session-0214
type: session--implement
status: closed-full
created: 2026-05-21
updated: 2026-05-21
last_agent: codex-session-0214
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0213.md
  - docs/sprints/petey-plan-0083.md
  - docs/knowledge/wiki/drift-register.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0214 — Base UI migration Phase 5 (HoverCard, Accordion)

## Date

2026-05-21

## Operator

Brian + codex-session-0214 (Petey orchestration, Cody implementation, Doug verification)

## Goal

Execute the smaller next D-016 slice: Phase 5 (`hover-card.tsx`, `accordion.tsx`) instead of Phase 4 Tooltip.

## Bow-in notes

- **Previous session:** SESSION_0213 closed D-016 Phase 3 and staged Tooltip or HoverCard/Accordion, whichever proved smaller.
- **Branch/worktree:** `main`; worktree clean at bow-in; active repo is `/Users/brianscott/dev/ronin-dojo-app`.
- **Upstream pin:** `/Users/brianscott/Local Sites/DirStarter /dirstarter_template` @ `7e724b6`; read-only reference copy.
- **Tooltip comparison first:** upstream Tooltip removes Ronin's legacy `<Tooltip tooltip="...">` wrapper and exposes Base UI compound parts (`Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`) with `TooltipTrigger render={...}` plus `Positioner`/`Popup` content. Ronin has 46 Tooltip JSX tags across 25 files, including provider props still named `delayDuration`.
- **Phase choice:** Phase 5 is smaller: HoverCard has 3 JSX tags in 1 consumer file; Accordion has 4 JSX tags in 1 consumer file. Both primitives have direct upstream equivalents.
- **FAILED_STEPS check:** FS-0001/FS-0014 (L1 primitive bypass), FS-0008 (primitive API spot-check), FS-0020 (Graphify-first discovery), FS-0024 (Ronin cwd discipline) in scope. Mitigation: Graphify ran before repo-wide search; upstream + Ronin primitive APIs were read directly; commands run with cwd pinned to `/Users/brianscott/dev/ronin-dojo-app`.

## Graphify check

- **Graph status:** populated at bow-in; `graphify stats` reported 6849 nodes / 10726 edges / 859 communities / 1297 files. `.graphify/graph_report.md` header did not record a commit; last session stated Graphify was refreshed at close.
- **Queries used:**
  - `graphify query "D-016 Tooltip HoverCard Accordion Radix primitives component porting petey-plan-0083" --budget 2500`
  - `graphify query "tooltip components ui tooltip tooltip-provider tooltip-content tooltip-trigger @radix-ui/react-tooltip" --budget 3000`
  - `graphify query "hover-card accordion components ui @radix-ui/react-hover-card @radix-ui/react-accordion base-ui" --budget 3000`
  - `graphify query "upstream dirstarter tooltip primitive @base-ui/react tooltip common component" --budget 4000`
- **Files selected from graph + direct reads:** `docs/sprints/SESSION_0213.md`, `docs/knowledge/wiki/drift-register.md`, `docs/sprints/petey-plan-0083.md`, `docs/knowledge/wiki/dirstarter-component-inventory.md`, `docs/runbooks/react-to-next-component-porting-runbook.md`, upstream `components/common/{tooltip,hover-card,accordion}.tsx`, Ronin `apps/web/components/common/{tooltip,hover-card,accordion,card}.tsx`, `apps/web/components/web/tools/tool-hover-card.tsx`, `apps/web/components/web/tournaments/bracket-results.tsx`.
- **Verification note:** Graphify selected the primitive families; exact TypeScript AST counts over tracked `apps/web` TS/TSX files produced the Tooltip vs Phase 5 scope counts.

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | `components/common/{hover-card,accordion}.tsx` from upstream `7e724b6`; common UI primitives. |
| Extension or replacement | Replacement in place. Ronin adopts upstream Base UI runtime while preserving existing export names. |
| Why justified | Continuation of operator-directed `D-016` Radix → Base UI primitive migration. These primitives still import Radix packages and block final dependency cleanup. |
| Risk if bypassed | Radix remains reachable through common overlay/disclosure primitives and later popover-family cleanup has a larger mixed-runtime surface. |

## Petey plan

### Goal

Ship D-016 Phase 5: migrate HoverCard and Accordion to upstream Base UI primitives, update the two consumer files, and prove no Phase 5 Radix imports or legacy trigger/content props remain.

### Tasks

#### TASK_01 — HoverCard primitive + ToolHoverCard consumer

- **Agent:** Cody worker
- **What:** Replace Radix HoverCard with upstream `@base-ui/react/preview-card` shape and update `ToolHoverCard`.
- **Steps:**
  1. Rewrite `apps/web/components/common/hover-card.tsx` to upstream PreviewCard root/trigger/content with Portal + Positioner + Popup.
  2. Preserve Ronin export names: `HoverCard`, `HoverCardTrigger`, `HoverCardContent`.
  3. Update `components/web/tools/tool-hover-card.tsx`: `asChild` → `render={...}` where needed; remove content `asChild` because Base UI Popup cannot wrap the card that way.
  4. Handle mixed-runtime animation safely without changing Radix `popoverAnimationClasses` consumers.
- **Done means:** `hover-card.tsx` no longer imports `radix-ui`; ToolHoverCard typechecks; no `<HoverCardTrigger asChild>` or `<HoverCardContent asChild>` remains.
- **Depends on:** nothing.

#### TASK_02 — Accordion primitive + consumer check

- **Agent:** Cody worker
- **What:** Replace Radix Accordion with upstream `@base-ui/react/accordion` shape.
- **Steps:**
  1. Rewrite `apps/web/components/common/accordion.tsx` to upstream `AccordionBase.Root/Item/Header/Trigger/Panel`.
  2. Preserve Ronin export names, including `AccordionContent`, as an alias over Base UI `Panel`.
  3. Update state selectors from `data-[state=*]` to Base UI `data-open` / `data-closed`.
  4. Verify `components/web/tournaments/bracket-results.tsx` compiles unchanged or adjust only if Base UI props require it.
- **Done means:** `accordion.tsx` no longer imports `@radix-ui/react-accordion`; no `data-[state=*]` selectors remain in the primitive.
- **Depends on:** Phase 3 Card render API already landed in SESSION_0213.

#### TASK_03 — Verification and docs close

- **Agent:** Doug + Petey
- **What:** Run residual checks and full close documentation.
- **Steps:**
  1. Run exact AST residual checks for Phase 5 primitives and call sites.
  2. Run `pnpm --filter dirstarter typecheck`, `bun run lint`, app tests with `--isolate`, `pnpm --filter dirstarter build`, and `bun run wiki:lint`.
  3. Update D-016 docs: drift register, petey-plan-0083, component inventory, lane ledger, project log, SESSION file, and `.dirstarter-upstream`.
  4. Commit, push `main`, then refresh Graphify after git hygiene.
- **Done means:** Verification gates recorded; docs updated; commit pushed to `main`; Graphify refreshed.
- **Depends on:** TASK_01–02.

### Parallelism

TASK_01 and TASK_02 have disjoint code write sets and can run in parallel. TASK_03 runs after both.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Cody worker | Isolated HoverCard primitive + single consumer file. |
| TASK_02 | Cody worker | Isolated Accordion primitive + consumer compatibility check. |
| TASK_03 | Doug + Petey | Verification, hostile close review, docs/ledger hygiene. |

### Open decisions

- None. Phase 5 is the smaller slice and the upstream files give a direct implementation template.

### Risks

- Ronin's `popoverAnimationClasses` remains Radix-shaped until the popover-family phase. HoverCard needs Base UI-compatible animation classes without breaking still-Radix Popover/Dropdown/Select.
- `ToolHoverCard` currently uses `asChild` on both trigger and content. Base UI supports trigger `render`, but content should render `ToolCard` as Popup children instead of replacing the Popup element.

### Scope guard

Do not migrate Tooltip in this session. Do not update Radix-family `popoverAnimationClasses` globally until Phase 7 unless a separate Base UI constant is added without changing existing Radix consumers.

### Dirstarter implementation template

- **Docs read first:** live docs not required for this lane; upstream source files are the primitive contract. Local docs read: component inventory, component porting SOP/runbook, D-016 drift register, petey-plan-0083.
- **Baseline pattern to extend:** upstream `components/common/{hover-card,accordion}.tsx` at `7e724b6`.
- **Custom delta:** preserve Ronin export names and existing consumer paths; account for mixed Radix/Base UI animation period.
- **No-bypass proof:** replacing existing common primitives with upstream L1 runtime, not inventing new component APIs.

## Pre-flight: Phase 5 primitives

### 1. Existing component scan

- Graphify searched for: Tooltip, HoverCard, Accordion, Base UI, Radix primitives.
- Found: `apps/web/components/common/hover-card.tsx`, `apps/web/components/common/accordion.tsx`, `apps/web/components/web/tools/tool-hover-card.tsx`, `apps/web/components/web/tournaments/bracket-results.tsx`.

### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md`: yes.
- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md` alignment URLs: not applicable; this is upstream source-file primitive migration, not one of the 10 live-doc layers.
- Searched Dirstarter template directly for: `components/common/{tooltip,hover-card,accordion}.tsx`.
- Closest L1 pattern: upstream `components/common/hover-card.tsx` and `components/common/accordion.tsx`.
- **Primitive API spot-check:**
  - HoverCard: `HoverCard(props: PreviewCard.Root.Props)`, `HoverCardTrigger(props: PreviewCard.Trigger.Props)`, `HoverCardContent(props: PreviewCard.Popup.Props & Pick<PreviewCard.Positioner.Props, "align" | "sideOffset">)`. No variants.
  - Accordion: `Accordion(props: AccordionBase.Root.Props)`, `AccordionItem(props: AccordionBase.Item.Props)`, `AccordionTrigger(props: AccordionBase.Trigger.Props)`, `AccordionContent(props: AccordionBase.Panel.Props)`. No variants.
  - Card dependency: `Card(render?: useRender render prop, hover?: boolean, focus?: boolean, isRevealed?: boolean, isHighlighted?: boolean)`.

### 3. Composition decision

- [x] Extending existing component: `hover-card.tsx`, `accordion.tsx`.
- [x] Composing existing components: `ToolHoverCard` continues composing `HoverCard*` + `ToolCard`; `AccordionItem` continues composing `Card`.
- [ ] New component: not applicable.

### 4. Lane docs loaded

- [x] Prior SESSION "Next session" section read.
- [x] Wiki entries for target area read: `drift-register.md`, `dirstarter-component-inventory.md`.
- [x] Runbook consulted: `graphify-repo-memory.md`, `react-to-next-component-porting-runbook.md`, `component-porting-sop.md`.

### 5. Dev environment confirmed

- Working directory: `/Users/brianscott/dev/ronin-dojo-app`.
- Primary verification: typecheck, lint, tests, build, wiki-lint.

### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001, FS-0008, FS-0014, FS-0020, FS-0024.
- Mitigation acknowledged: yes.

## Status

closed-full

## What landed

- **D-016 Phase 5 complete, executed before Phase 4 by Petey scope decision**: exact AST counts showed Tooltip at 46 JSX tags across 25 files, while HoverCard + Accordion were 7 JSX tags across 2 files.
- **HoverCard migrated to Base UI**: `apps/web/components/common/hover-card.tsx` now wraps `@base-ui/react/preview-card` Root/Trigger/Portal/Positioner/Popup and keeps Ronin export names.
- **ToolHoverCard consumer migrated**: `components/web/tools/tool-hover-card.tsx` no longer uses Radix `asChild`; valid element children are passed through Base UI `render`, and `ToolCard` renders inside the popup.
- **Accordion migrated to Base UI**: `apps/web/components/common/accordion.tsx` now uses `@base-ui/react/accordion` Root/Item/Header/Trigger/Panel, with `AccordionContent` preserving the old export name over Base UI `Panel`.
- **Mixed-runtime animation protected**: HoverCard uses local Base UI animation classes; global `popoverAnimationClasses` stays Radix-shaped until Phase 7 so Popover/Dropdown/Select remain stable.

## Files touched

- `apps/web/components/common/hover-card.tsx` — Radix HoverCard → Base UI PreviewCard wrapper.
- `apps/web/components/web/tools/tool-hover-card.tsx` — consumer update from `asChild` to Base UI `render` and popup children.
- `apps/web/components/common/accordion.tsx` — Radix Accordion → Base UI Accordion wrapper with `type="multiple"` compatibility for the current consumer.
- `apps/web/.dirstarter-upstream` — added SESSION_0214 partial-port note.
- `docs/sprints/SESSION_0214.md` — session plan, evidence, close notes.
- `docs/knowledge/wiki/drift-register.md` — ticked D-016 Phase 3 and Phase 5; noted Phase 5 ran before Tooltip because it was smaller.
- `docs/sprints/petey-plan-0083.md` — updated D-016 phase status and cross-references.
- `docs/knowledge/wiki/dirstarter-component-inventory.md` — updated HoverCard/Accordion primitive status.
- `docs/architecture/uplift/lane-ledger.md` — appended Phase 5 ledger row.
- `docs/protocols/project-log.md` — current task plan entries, build/review entry.
- `docs/knowledge/wiki/index.md` — added SESSION_0213 and SESSION_0214 rows; bumped frontmatter.

## Decisions resolved

- Phase 5 selected over Tooltip because exact counts show the Tooltip migration is substantially larger.
- No ADR needed: this is a mechanical implementation of existing D-016 migration direction.

## Open decisions / blockers

- **Tooltip remains open:** Phase 4 still has 46 JSX tags across 25 files plus provider prop migration (`delayDuration` → `delay`). It should be planned as a focused session and split if the consumer rewrite gets noisy.
- **Pre-existing Turbopack/NFT warning remains:** production build still warns that `server/admin/storage/monitoring/queries.ts` traces through `next.config.ts`. This was deferred in SESSION_0213 and is unrelated to Phase 5.

## Next session

- **Goal:** D-016 Phase 4 Tooltip migration.
- **Inputs to read:** `SESSION_0214.md`, `drift-register.md`, `petey-plan-0083.md`, upstream `components/common/tooltip.tsx`, Ronin `apps/web/components/common/tooltip.tsx`, current Tooltip AST count output in this SESSION.
- **First task:** Decide whether Tooltip can be migrated in one pass or should split into primitive/provider compatibility first and consumer rewrites second. Preserve the D-016 direction toward upstream composition unless Petey explicitly records a compatibility adapter decision.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0214_TASK_01 | ✅ done | HoverCard primitive + ToolHoverCard consumer |
| SESSION_0214_TASK_02 | ✅ done | Accordion primitive + consumer compatibility |
| SESSION_0214_TASK_03 | ✅ done | Verification, docs, full close |

## Review log

- Exact residual checks: PASS for no `radix-ui` text in Phase 5 primitives, no Radix `data-[state=*]` selectors in Accordion, no `asChild` in ToolHoverCard.
- Current Phase 5 JSX call sites after migration: HoverCard 3 tags in `components/web/tools/tool-hover-card.tsx`; Accordion 4 tags in `components/web/tournaments/bracket-results.tsx`.
- `pnpm --filter dirstarter typecheck`: pass.
- `bun run lint` from `apps/web`: pass; Biome formatted 2 files.
- `bun run test -- --concurrency=1` from `apps/web`: 244 pass, 0 fail.
- `pnpm --filter dirstarter build`: pass; pre-existing Turbopack/NFT warning remains.
- `bun run wiki:lint`: 0 errors, 497 warnings (pre-existing warning classes: 2 orphan pages + 495 markdown formatting warnings).
- Project-log gate: Graphify query identified `project-log.md`; exact-file `awk` count for `SESSION_0214` returned 3 before close docs, satisfying the gate.

## Hostile close review

- **Verdict:** pass.
- **Reviewed tasks:** SESSION_0214_TASK_01, SESSION_0214_TASK_02, SESSION_0214_TASK_03.
- **Dirstarter docs check:** live docs not required for this primitive runtime lane; upstream `7e724b6` source files are the contract. Directly compared upstream `components/common/{tooltip,hover-card,accordion}.tsx` to Ronin counterparts before implementation.
- **No P0/P1 findings:** Phase 5 stayed inside the selected scope, did not alter global Radix animation classes, and did not touch Tooltip.
- **WORKFLOW score:** 9.8/10. Dirstarter alignment, verification, and docs are strong. Residual risk is limited to unbrowser-smoked hover/accordion interaction; typecheck/build and consumer counts are clean.

## ADR / ubiquitous-language check

- No ADR needed. D-016 already records the architectural direction for Radix → Base UI primitive runtime migration.
- No ubiquitous-language update needed. No domain terms changed.

## Reflections

- Tooltip looked tempting because it was the planned next phase, but exact counts made it the wrong first target for this session. Counting before coding prevented a 25-file consumer rewrite from sneaking into a small migration slot.
- Keeping HoverCard's Base UI animation classes local was the right mixed-runtime compromise. Updating `popoverAnimationClasses` globally would have broken still-Radix popover-family primitives before Phase 7.
- Base UI Accordion's API is simpler than Radix's current consumer shape. The small `type="multiple"` compatibility bridge lets the one current consumer remain stable while moving the primitive runtime forward.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Updated current touched docs frontmatter where applicable: `SESSION_0214`, `drift-register`, `petey-plan-0083`, `dirstarter-component-inventory`, `lane-ledger`, `project-log`, `wiki/index`. Code files have no JETTY frontmatter. |
| Backlinks/index sweep | Added `SESSION_0214` backlinks/pairs where the touched docs already track session references; added `SESSION_0213` and `SESSION_0214` rows to `wiki/index.md`. |
| Wiki lint | `bun run wiki:lint` passed with 0 errors / 497 warnings; warnings are pre-existing orphan/markdown-formatting classes. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | `SESSION_0214_REVIEW_01` recorded in `project-log.md`; session review log records all verification gates. |
| Review & Recommend | Next session goal written: D-016 Phase 4 Tooltip migration, with split decision as first task. |
| Memory sweep | Repo-scoped memory captured in this SESSION, D-016, petey-plan-0083, component inventory, and lane ledger; no operator-side memory update needed. |
| Next session unblock check | Unblocked. Inputs and first task are concrete; no user decision required before bow-in. |
| Git hygiene | Final branch/status/commit/push proof will be reported after git hygiene. |
| Graphify update | Will run after commit/push per closing ritual and report final stats in bow-out response. |
