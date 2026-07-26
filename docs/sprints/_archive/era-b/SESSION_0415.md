---
title: "SESSION 0415 — BJJ TechniqueGraph and curriculum port"
slug: session-0415
type: session--open
status: closed
created: 2026-06-19
updated: 2026-06-19
last_agent: codex-session-0415
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0414.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0415 — BJJ TechniqueGraph and curriculum port

## Date

2026-06-19

## Operator

Brian + codex-session-0415

## Goal

Port the BJJ-only TechniqueGraph and curriculum-library foundation from the read-only old Vite monorepo into the BBL Next/Prisma app, starting with discovery, schema/data mapping, idempotent import, and compile-safe public routes.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0414.md`
- Carryover: SESSION_0414 fixed the BBL directory/landing blockers, landed the premium directory-card styling, and left the TechniqueGraph + Curriculum port as the next handoff epic. This session continues that content/curriculum lane without regressing the premium card work.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean before creating this SESSION file.
- Current HEAD at bow-in: `3149204b`

### Dirstarter alignment

| Field                       | Answer                                                                                                                                                   |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dirstarter baseline touched | Content, Prisma, theming                                                                                                                                 |
| Extension or replacement    | Extension: reuse existing Technique / TechniquePrerequisite / CurriculumItem models and public route patterns; port only BBL-specific feature UI on top. |
| Why justified               | Curriculum + techniques are explicit BBL product pillars and the old monorepo is the approved L4 UI/data reference.                                      |
| Risk if bypassed            | Static-only UI or ad hoc data shapes would bypass the existing Prisma and public route contracts, creating a second curriculum source of truth.          |

Live docs checked during planning: not applicable; this is an internal Prisma/content port against existing repo models.

### Graphify check

- Graph status: current enough for navigation; stats at bow-in: 13218 nodes, 25754 edges, 1782 communities, 2058 files tracked.
- Queries used:
  - `Technique TechniquePrerequisite CurriculumItem curriculum techniques page seed importer Prisma`
  - `techniques graph canvas FlowCanvas curriculum browser card route`
- Files selected from graph:
  - `apps/web/app/(web)/techniques/page.tsx`
  - `apps/web/app/(web)/techniques/[slug]/page.tsx`
  - `apps/web/components/web/techniques/*`
  - `apps/web/server/web/techniques/queries.ts`
  - `apps/web/prisma/seed.ts`
  - `apps/web/prisma/seed-baseline-lineage.ts`
  - `apps/web/components/web/lineage/lineage-tree-canvas.tsx`
  - `apps/web/app/admin/courses/_components/course-form.tsx`
- Verification note: exact files opened after Graphify; Graphify used as navigation, not proof.

### Grill outcome

- BJJ-only is locked by the user request. Eskrima, muay thai, boxing, and karate source slices are excluded even if present.
- Data must be loaded from Prisma, not source static JS, so source data becomes an idempotent importer/seed path.
- No schema migration unless direct model reads prove a required field is missing.

### Drift logged

- Carry-forward drift relevant to this lane: D-025 R2 key casing is unrelated to this port unless curriculum media imports touch member photos; no mitigation needed for the BJJ static data slice.

## Petey plan

### Goal

Land the first compile-safe BJJ TechniqueGraph + Curriculum port slice, with source discovery and data import first.

### Tasks

#### SESSION_0415_TASK_01 — Discover and map

- **Agent:** Petey/Cody
- **What:** Locate the best source variant and map BJJ source data to current Prisma models.
- **Steps:** Read BBL-variant source first, fall back to tuffbuffs; inspect target Prisma models and existing techniques/curriculum routes; write a short gap list in this SESSION.
- **Done means:** Source paths, selected source variant, target mapping, and gap list are recorded.
- **Depends on:** nothing

#### SESSION_0415_TASK_02 — Import BJJ data

- **Agent:** Cody
- **What:** Add an idempotent importer/seed path for BJJ technique graph and curriculum data.
- **Steps:** Convert BJJ static nodes/edges/curriculum into typed seed data; upsert Techniques, TechniquePrerequisites, and CurriculumItems; avoid migrations unless the schema proves missing fields.
- **Done means:** Import script runs idempotently and typechecks.
- **Depends on:** SESSION_0415_TASK_01

#### SESSION_0415_TASK_03 — Port graph UI

- **Agent:** Cody
- **What:** Port the custom canvas graph to TSX/Next and mount it on the techniques surface.
- **Steps:** Reuse existing design primitives; client component gets Prisma-loaded graph props; preserve zoom/pan/fit, keyboard nodes, modal, and PNG export.
- **Done means:** `/techniques/graph` renders BJJ graph from database data and typechecks.
- **Depends on:** SESSION_0415_TASK_02

#### SESSION_0415_TASK_04 — Port curriculum browser

- **Agent:** Cody
- **What:** Port the BJJ curriculum browser foundation and wire it to CurriculumItem data.
- **Steps:** Build the public route and core browsing/detail interactions; defer non-BJJ and optional gamification panels.
- **Done means:** `/curriculum` or equivalent BJJ route browses Prisma-backed CurriculumItems and typechecks.
- **Depends on:** SESSION_0415_TASK_02

#### SESSION_0415_TASK_05 — Verify

- **Agent:** Doug/Cody
- **What:** Run typecheck/build and browser-check the graph and curriculum route.
- **Steps:** Run `bun run typecheck`, `next build` through the repo script, and browser smoke with preview cookie if local/prod target is available.
- **Done means:** Green gates or explicit blocker recorded.
- **Depends on:** SESSION_0415_TASK_03, SESSION_0415_TASK_04

### Parallelism

Tasks are sequential because discovery determines the data import, and the UI must consume the imported Prisma shape.

### Agent assignments

| Task                 | Agent      | Rationale                                             |
| -------------------- | ---------- | ----------------------------------------------------- |
| SESSION_0415_TASK_01 | Petey/Cody | Discovery must produce the implementation contract.   |
| SESSION_0415_TASK_02 | Cody       | Data import is the foundation for both UI routes.     |
| SESSION_0415_TASK_03 | Cody       | Component port depends on the database shape.         |
| SESSION_0415_TASK_04 | Cody       | Curriculum browser depends on the same data contract. |
| SESSION_0415_TASK_05 | Doug/Cody  | Verification closes the loop.                         |

### Open decisions

- None at plan-lock. If the existing Prisma models cannot represent the source data without lossy hacks, stop before adding a migration.

### Risks

- Source data may contain rich nested curriculum content that does not map cleanly to current `CurriculumItem` columns.
- html2canvas may not be installed in the target app.
- The whole epic may exceed a single session; if so, stop at a green, database-backed graph slice.

### Scope guard

- Do not modify `/Users/brianscott/dev/ronin-dojo-monorepo`.
- Do not import non-BJJ curriculum or graph data.
- Do not hardcode BBL colors; use theme tokens.
- Do not change directory card styling from SESSION_0414.
- Do not start broad single-brand prune work in this session.

### Dirstarter implementation template

- **Docs read first:** BBL SoT set, SESSION_0414, WORKFLOW 5.0, Cody pre-flight, Graphify runbook.
- **Baseline pattern to extend:** existing Prisma models, public techniques route, common component primitives, seed/import scripts.
- **Custom delta:** BBL-only custom graph/curriculum UI and BJJ source data importer.
- **No-bypass proof:** UI consumes Prisma-loaded Techniques/CurriculumItems rather than static JS.

## Cody pre-flight

### Pre-flight: BJJ TechniqueGraph and curriculum port

#### 1. Existing component scan

- Graphify query used: `techniques graph canvas FlowCanvas curriculum browser card route`
- Found: `components/web/techniques/*`, `server/web/techniques/queries.ts`, `components/web/lineage/lineage-tree-canvas.tsx`, admin course form/table patterns.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: pending before component edits.
- Consulted live alignment URLs: not needed unless external docs are required.
- Closest L1 pattern: existing public techniques listing/detail pages and common primitives.
- Primitive API spot-check: pending before component edits.

#### 3. Composition decision

- Extending existing component: techniques public surface and server queries.
- Composing existing components: Button, Card, Badge, Dialog/Drawer, Tabs/filters as confirmed by primitive spot-check.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes.
- ADR read: `docs/product/black-belt-legacy/SOT-ADR.md`.
- Runbook consulted: `docs/runbooks/dev-environment/graphify-repo-memory.md`, `docs/protocols/cody-preflight.md`.

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo`.
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`.
- Brand/host for testing: local BBL app on the active dev-server port; production preview path uses `/preview?token=bob-tony-BBL-preview` if browser proof reaches prod.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001, FS-0006, FS-0008.
- Mitigation acknowledged: Petey plan exists before implementation; Graphify ran before repo-wide discovery; component primitives and Prisma models will be read directly before edits.

## Task log

| ID                   | Status   | Summary                                                                                                                                                                    |
| -------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SESSION_0415_TASK_01 | complete | BBL source had browser/rail but no graph canvas; selected tuffbuffs BJJ FlowCanvas + BJJ data. Mapping/gaps recorded below.                                                |
| SESSION_0415_TASK_02 | complete | Added generated BJJ graph/curriculum snapshots and idempotent Prisma importer; ran twice successfully.                                                                     |
| SESSION_0415_TASK_03 | complete | Added Prisma-backed `/techniques/graph` custom canvas with zoom/pan/fit, keyboard pan, keyboard-focusable nodes, detail modal, technique/curriculum links, and PNG export. |
| SESSION_0415_TASK_04 | complete | Added Prisma-backed `/curriculum` BJJ browser with rank/topic filters, item cards, detail modal, and graph technique links.                                                |
| SESSION_0415_TASK_05 | complete | Importer, typecheck, focused tests, targeted formatting, lint, production build, and browser smoke all passed.                                                             |

## What landed

- Source discovery:
  - BBL current tree: `src/brands/blackbeltlegacy/components/techniques/*`, `BBLCurriculumRail`, `curriculumImporter`, but no TechniqueGraph/FlowCanvas.
  - BBL git history: technique browser/mock technique files only; no graph canvas hit.
  - Selected graph source: `src/brands/tuffbuffs/components/canvas/{TechniqueGraphShell,useFlowCanvas,FlowCanvas,FlowNode,FlowEdge,flowNodeConstants,bjjCanvasData}.js`.
  - Selected curriculum source: `src/brands/tuffbuffs/data/curriculum/bjj.js` only.
- Target mapping:
  - `BJJ_NODES` → `Technique` rows scoped to `Brand.BBL`, `Organization.slug=black-belt-legacy`, `Discipline.slug=bjj`.
  - `BJJ_EDGES` → `TechniquePrerequisite` rows with `edge.from` as prerequisite and `edge.to` as target technique.
  - BJJ curriculum levels → 5 published `Course` rows.
  - BJJ curriculum techniques → 80 stable-id `CurriculumItem` rows.
  - Node `curriculumIds` → `TechniqueCurriculumLink`.
- Gap list:
  - No first-class graph layout fields exist on `Technique` for `x/y`. Decision for this slice: no migration; graph content/edges load from Prisma, while target-side source snapshot supplies layout coordinates.
  - `CurriculumItem` has no slug/source-id column. Decision: use stable imported `id` values (`bbl-bjj-curriculum-*`) for idempotency.
  - `TechniqueCategory` has no `POSITION`; graph positions map to `Technique.position` and retain graph kind through tags.
  - PNG export required adding `html2canvas` to `apps/web`.
- Data/UI:
  - Added `server/web/techniques/graph-query.ts` to load BBL BJJ graph Techniques and TechniquePrerequisites from Prisma, merging target-side layout metadata from the generated graph snapshot.
  - Added `server/web/curriculum/queries.ts` to load BBL BJJ Courses, CurriculumItems, and linked graph Techniques from Prisma.
  - Added `/techniques/graph` and `/curriculum` public routes, with BBL feature/nav/SEO/sitemap integration.
  - Added a graph PNG export compatibility shim: the live graph stays token-themed, but the `html2canvas` capture temporarily uses plain safe inline colors because html2canvas cannot parse Tailwind v4 OKLab `color-mix` output.

## Decisions resolved

- BBL variant preferred but not found for the canvas; tuffbuffs BJJ canvas is the selected source.
- No schema migration in this slice; existing Technique/Curriculum relations can represent the domain data, with layout as presentation metadata.
- Non-BJJ source data remains excluded.

## Files touched

| File                                                                                                                    | Change                                                                     |
| ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `apps/web/package.json` / `bun.lock`                                                                                    | Added `html2canvas` for graph PNG export.                                  |
| `apps/web/prisma/data/bbl-bjj-graph.json`                                                                               | Generated BJJ-only graph snapshot from read-only old monorepo source.      |
| `apps/web/prisma/data/bbl-bjj-curriculum.json`                                                                          | Generated BJJ-only curriculum snapshot from read-only old monorepo source. |
| `apps/web/prisma/import-bbl-bjj-curriculum.ts`                                                                          | New idempotent BBL BJJ graph/curriculum importer.                          |
| `apps/web/server/web/techniques/graph-query.ts`                                                                         | New Prisma graph read model for BBL BJJ Techniques and prerequisites.      |
| `apps/web/components/web/techniques/technique-graph.tsx`                                                                | New custom TSX graph canvas with interactions, modal, and PNG export.      |
| `apps/web/app/(web)/techniques/graph/page.tsx`                                                                          | New public graph route.                                                    |
| `apps/web/server/web/curriculum/queries.ts`                                                                             | New Prisma curriculum read model.                                          |
| `apps/web/components/web/curriculum/bjj-curriculum-browser.tsx`                                                         | New curriculum browser client component.                                   |
| `apps/web/app/(web)/curriculum/page.tsx`                                                                                | New public curriculum route.                                               |
| `apps/web/app/(web)/techniques/_components/techniques-index/index.tsx`                                                  | Added BJJ graph entry point from the techniques index.                     |
| `apps/web/config/brand-features.ts`, `apps/web/config/seo.ts`, `apps/web/messages/en/navigation.json`                   | Enabled BBL curriculum/technique route surfaces and sitemap/nav labels.    |
| `apps/web/components/web/nav/nav-sheet.tsx`, `apps/web/components/web/header.tsx`, `apps/web/components/web/footer.tsx` | Added public curriculum navigation links.                                  |
| `apps/web/config/brand-features.test.ts`, `apps/web/config/seo.test.ts`                                                 | Updated feature-gate and sitemap coverage.                                 |

## Verification

| Command / smoke                                                                         | Result                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cd apps/web && bun run prisma/import-bbl-bjj-curriculum.ts`                            | Pass: courses=5, curriculumItems=80, techniques=61, prerequisites=75.                                                                                                                           |
| `cd apps/web && bun run prisma/import-bbl-bjj-curriculum.ts` (second run)               | Pass: same counts; importer is idempotent.                                                                                                                                                      |
| `cd apps/web && bun run typecheck`                                                      | Pass.                                                                                                                                                                                           |
| `cd apps/web && bun test --parallel=1 config/brand-features.test.ts config/seo.test.ts` | Pass: 10 tests.                                                                                                                                                                                 |
| `cd apps/web && bunx oxfmt --check <touched files>`                                     | Pass: all touched files use correct format.                                                                                                                                                     |
| `cd apps/web && bun run lint:check`                                                     | Pass exit code 0; repo still reports existing warnings outside this port.                                                                                                                       |
| `cd apps/web && bun run build`                                                          | Pass; route list includes `/curriculum`, `/techniques`, and `/techniques/graph`. Existing Turbopack NFT storage-monitoring warning remains.                                                     |
| Browser smoke on `http://bbl.local:3000` with `bbl_preview=bob-tony-BBL-preview`        | Pass: `/curriculum` renders BBL BJJ data, filters to Guard Passing, opens item dialog with graph links, and contains no eskrima/muay thai/boxing/karate copy.                                   |
| Browser smoke on `http://bbl.local:3000` with `bbl_preview=bob-tony-BBL-preview`        | Pass: `/techniques/graph` renders 61 nodes and 75 SVG edges, zooms, keyboard-pans, opens node modal, downloads `bjj-technique-graph.png`, and contains no eskrima/muay thai/boxing/karate copy. |
| `cd apps/web && bun run format:check`                                                   | Known pre-existing caveat: full check fails on unrelated `components/web/directory/facet-result-card.tsx` and `scripts/reconcile-pods.mjs`; not changed in this task.                           |

## Open decisions / blockers

- None blocking this slice.
- Follow-up option: if graph layout should become editable/admin-managed, add first-class layout metadata instead of reading coordinates from the generated source snapshot.
- Follow-up option: port richer curriculum panels (quest/combo/appendix) after the BJJ-only baseline is accepted.

## Next session

### Goal

Review the BJJ graph/curriculum UX in-browser, then decide whether to deepen curriculum detail panels or make graph layout metadata first-class.

### First task

Smoke `/curriculum` and `/techniques/graph` through the BBL preview cookie, then choose the next incremental slice.

## Review log
