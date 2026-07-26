---
title: "SESSION 0341 - Lineage Slice 4 generation rails"
slug: session-0341
type: session--open
status: closed
created: 2026-06-04
updated: 2026-06-04
last_agent: codex-session-0341
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0340.md
  - docs/petey-plan-0337-lineage-responsive-carousel.md
  - docs/knowledge/wiki/component-porting/specs/lineage-generation-rail-port-spec.md
  - docs/knowledge/wiki/component-porting/graphify-component-port-map.md
  - docs/knowledge/wiki/test-fail-fix-ledger.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0341 - Lineage Slice 4 generation rails

## Date

2026-06-04

## Operator

Brian + codex-session-0341 (Petey orchestration -> Cody pre-flight/build -> Desi/Doug verify)

## Goal

Begin petey-plan-0337 Slice 4 / PORTMAP-0005 by replacing raw horizontal overflow in connector-free
lineage zones with the now-proven shared `Carousel` primitive, while preserving the existing lineage
selection and board recursion contracts.

## Status

### Status: closed

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0340.md`.
- Carryover: SESSION_0340 landed PORTMAP-0004 by extending the shared Embla `Carousel` primitive with
  dense-rail affordances and staged Slice 4 for connector-free lineage zones.
- Known caveat: `bun run test` currently has 3 unrelated integration failures outside the carousel/lineage
  rail surface. Treat them as an owning-lane follow-up, not as a PORTMAP-0004 or PORTMAP-0005 failure.
- Date note: system clock for this Codex session is 2026-06-04; frontmatter uses 2026-06-04.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean before creating `docs/sprints/SESSION_0341.md`.
- Current HEAD at bow-in: `c9b9c1c`
- Remote guard: `origin` is `https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline.git`.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | UI primitive composition only; none of the 10 L1 operational layers. |
| Extension or replacement | Extension: compose the existing shared `Carousel` primitive into existing lineage components. |
| Why justified | PORTMAP-0005 depends on the proven PORTMAP-0004 carousel rail; reuse prevents a second lineage-only rail. |
| Risk if bypassed | High: duplicating carousel behavior would fork accessibility, snap, and ResizeObserver behavior. |

Live docs checked during planning: not applicable for storage/payments/media/content/monetization/blog/auth/
theming/Prisma/hosting. Local `dirstarter-component-inventory.md` was source-checked for the `Carousel`
contract.

### Graphify check

- Graph status: current enough for navigation; stats at bow-in: 9203 nodes, 14001 edges, 1397 communities,
  1564 files tracked. Current HEAD: `c9b9c1c`.
- Queries used:
  - `lineage generation rail PORTMAP-0005 LineageHonorStrip LineageCompactChildList Carousel`
  - `autonomous codex session setup Petey Cody Desi Doug graphify fallow bow out`
- Files selected from graph:
  - `docs/petey-plan-0337-lineage-responsive-carousel.md`
  - `docs/knowledge/wiki/component-porting/specs/lineage-generation-rail-port-spec.md`
  - `docs/knowledge/wiki/component-porting/graphify-component-port-map.md`
  - `docs/sprints/SESSION_0340.md`
  - `docs/runbooks/dev-environment/autonomous-sessions.md`
  - `docs/protocols/petey-plan.md`
  - `docs/protocols/review-recommend.md`
  - `docs/rituals/closing.md`
  - `docs/agents/petey.md`
- Exact known files opened after Graphify and handoff:
  - `apps/web/components/common/carousel.tsx`
  - `apps/web/components/web/lineage/lineage-honor-strip.tsx`
  - `apps/web/components/web/lineage/lineage-compact-child-list.tsx`
  - `apps/web/components/web/lineage/lineage-tree-canvas.tsx`
  - `apps/web/lib/lineage/canvas-model.ts`
  - `apps/web/components/web/lineage/lineage-node-card.tsx`
  - `apps/web/components/web/lineage/lineage-member-actions-menu.tsx`
  - `docs/knowledge/wiki/dirstarter-component-inventory.md`
  - `/Users/brianscott/dev/ronin-dojo-monorepo/src/brands/blackbeltlegacy/components/lineage/StudentsCarousel.jsx`
  - `/Users/brianscott/dev/ronin-dojo-monorepo/src/brands/blackbeltlegacy/components/lineage/SchoolCarousel.jsx`
  - `/Users/brianscott/dev/ronin-dojo-monorepo/src/brands/blackbeltlegacy/components/shared/CarouselRail.jsx`
- Verification note: exact files were opened after Graphify; Graphify used as navigation, not proof. `graphify
  explain "LineageHonorStrip"` had no direct symbol node, so the exact target files from the handoff were
  opened directly.

### Grill outcome

4 forks resolved before code:

1. **Session shape:** inline one-session Slice 4. Do not bundle a 3-session autonomous run here; the
   autonomous runbook is best for independent PR branches, while this task is a coherent shared lineage
   component change.
2. **Agent orchestration:** Petey -> Cody -> Desi/Doug -> Petey. No subagents/worktrees; the touched files
   overlap and the verification depends on the exact final API/DOM.
3. **Motion decision:** static/snap first. No BBL landing marquee/autoplay in Slice 4; if added later it must
   include reduced-motion handling and pause-on-hover/focus.
4. **Fallow/Farrow:** no install and no `npx` execution this session. Keep it as a no-install review/
   recommend note during full bow-out unless the operator explicitly approves a separate tooling trial.

### Drift logged

- Relevant existing drift checked: D-016 is closed but still instructive for common primitive composition;
  current primitives use Base UI render-prop conventions, not legacy `asChild`.
- Relevant failed-step mitigation checked: FS-0001 (reuse existing primitives), FS-0008 (source-check primitive
  APIs), and FS-0024 (cwd/git guard).
- No new drift discovered at bow-in.

## Petey plan

### Goal

Land PORTMAP-0005 by adapting the shared `Carousel` into the lineage honor strip and wide board child groups,
with connector-free proof and no SVG tree-overlay changes.

### Tasks

#### SESSION_0341_TASK_01 - Bow-in, grill, and pre-flight contract

- **Agent:** Petey -> Cody.
- **What:** Lock Slice 4 scope, record data/selection contracts, and complete Cody pre-flight before code.
- **Steps:**
  1. Run Graphify-first discovery and open exact source/spec files.
  2. Resolve session-shape, motion, Fallow/Farrow, and orchestration decisions.
  3. Record the current `LineageHonorStrip` and `LineageCompactChildList` contracts.
  4. Paste primitive API spot-checks from source.
- **Done means:** This SESSION file contains a Petey plan, task IDs, and Cody pre-flight artifact before code.
- **Depends on:** nothing.

#### SESSION_0341_TASK_02 - Replace raw connector-free overflow with Carousel rails

- **Agent:** Cody.
- **What:** Compose `Carousel`/`CarouselSlide` into the honor strip and wide board child groups.
- **Steps:**
  1. Replace the honor strip's raw `ol.flex.overflow-x-auto` with a labelled, static/snap carousel rail.
  2. Preserve honor selection: `onSelect(member.nodeId)` and `scrollMemberIntoView(member.id, reduceMotion)`.
  3. Rail only wide board child groups in `LineageCompactChildList`; keep narrow groups as compact vertical
     rows and keep recursive expansion unchanged.
  4. Keep board-mode-only behavior connector-free; do not touch `LineageConnectorLayer`, `LineageBranch`, or
     tree-generation SVG overlay behavior.
- **Done means:** Honor strip and wide board child groups use the shared carousel; narrow compact groups,
  recursive expansion, row actions, and selected-path highlighting still work.
- **Depends on:** SESSION_0341_TASK_01.

#### SESSION_0341_TASK_03 - Verify, document, full close, graph update, commit, push

- **Agent:** Desi -> Doug -> Petey.
- **What:** Prove the connector-free rail placement, update PORTMAP/spec/session docs, and close fully.
- **Steps:**
  1. Run `bun run lint`, `bun run typecheck`, and focused tests if added.
  2. Run Playwright geometry/a11y smoke on `/lineage/rigan-machado-bjj-lineage` at 390, 768, and 1280.
  3. Verify no page overflow, labelled carousel regions, reachable controls where scrollable, row click opens
     the existing profile drawer, and tree SVG connector behavior remains untouched.
  4. Update PORTMAP-0005/spec/inventory/session evidence when proof is green.
  5. Run the full closing ritual including optional evidence, Review & Recommend, component/ADR sweep,
     no-install Fallow/Farrow note, hostile close review, and Graphify refresh before the single close commit.
  6. Stage, commit with a conventional message, and push to `main`.
- **Done means:** PORTMAP-0005 is proven if verification passes, `graphify update .` has run before commit, and
  one close commit is pushed to `main`.
- **Depends on:** SESSION_0341_TASK_02.

### Parallelism

Keep this inline/sequential. The code task touches two tightly-related lineage components and the proof/docs
depend on the exact final DOM. Subagents or worktrees would add reconciliation cost without enough independent
file ownership.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0341_TASK_01 | Petey/Cody | Open decisions plus mandatory pre-flight before code. |
| SESSION_0341_TASK_02 | Cody | Clear component implementation using existing primitives. |
| SESSION_0341_TASK_03 | Desi/Doug/Petey | UX/a11y geometry proof, code gates, documentation, and full close. |

### Open decisions

- None for implementation. Static/snap rail is locked for this first placement; autoplay/marquee stays deferred.

### Risks

- Board rail threshold could make small groups feel heavier than the current compact list; start with wide groups
  only and keep narrow groups vertical.
- Nested carousels inside recursive rows must not break selected-path auto-expansion or row action menus.
- `Carousel` controls are md+ when `controls="desktop"`; mobile proof must rely on native horizontal gesture/snap.

### Scope guard

- No `LineageConnectorLayer`, `LineageBranch`, tree-generation rail, SVG overlay, adaptive bus, or connector
  measurement changes.
- No schema, server action, query, or payload changes.
- No new carousel dependency, no second rail primitive, and no verbatim BBL JSX.
- No hardcoded belt color maps; continue using `Rank.colorHex` / `member.selectedRank.colorHex`.
- No BBL image bulk-copy unless real card proof becomes necessary; current data avatars should be enough.
- No Fallow/Farrow install, `npx`, or new tooling dependency.

### Dirstarter implementation template

- **Docs read first:** local plan/spec/port-map/session docs named above; no live Dirstarter operational layer
  applies.
- **Baseline pattern to extend:** `apps/web/components/common/carousel.tsx` (`Carousel` + `CarouselSlide`) plus
  existing lineage components.
- **Custom delta:** connector-free lineage composition for honor strip and wide board child groups.
- **No-bypass proof:** Slice 4 composes the approved shared rail primitive from PORTMAP-0004 and does not create
  a lineage-specific carousel.

## Cody pre-flight

### Pre-flight: Lineage connector-free generation rails

#### 1. Existing component scan

- Graphify query used: `lineage generation rail PORTMAP-0005 LineageHonorStrip LineageCompactChildList Carousel`
- Found:
  - `apps/web/components/common/carousel.tsx` is the shared Embla rail primitive proven in SESSION_0340.
  - `apps/web/components/web/lineage/lineage-honor-strip.tsx` currently renders `ol.flex.overflow-x-auto`
    with top-ranked members, selection, and scroll-into-view.
  - `apps/web/components/web/lineage/lineage-compact-child-list.tsx` currently renders grouped compact board
    child rows vertically and recurses into itself for expanded descendants.
  - `apps/web/components/web/lineage/lineage-tree-canvas.tsx` calls `LineageCompactChildList` only from
    board cards; SVG connectors live in the separate tree branch path.
  - Old BBL behavior references: `StudentsCarousel.jsx` chunks students into 2x2 pages at `w-[168px]`;
    `SchoolCarousel.jsx` uses `w-[280px]`; both sit on `CarouselRail` with aria, snap, controls, and empty state.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md`: yes.
- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md` alignment URLs: yes; no mandatory L1 operational
  alignment target applies.
- Closest L1 pattern: existing shared `Carousel` + `CarouselSlide`; no second carousel.
- Primitive API spot-check from source:
  - `Carousel` props: `options?: EmblaOptionsType`, `children`, `className?`, `emptyState?`, `ariaLabel?`,
    `role?`, `edgeFades?`, `controls?: "always" | "desktop" | "none"`.
  - `CarouselSlide` props: `children`, `className?`, `width?: 168 | 248 | 280`; custom `flex-[...]` or
    `basis-*` in `className` overrides the default width.
  - `Avatar` / `AvatarImage` / `AvatarFallback`: Base UI avatar root/image/fallback props; className pass-through.
  - `Badge`: `variant: primary | soft | outline | success | caution | warning | info | danger`,
    `size: sm | md | lg`, `prefix`, `suffix`, `render`.
  - `Stack`: `size: xs | sm | md | lg`, `direction: row | column`, `wrap`, `render`.
  - `Link`: Next link props with hover-prefetch behavior.
  - `Button` (via `Carousel` controls): `variant: fancy | primary | secondary | soft | ghost | destructive`,
    `size: xs | sm | md | lg`, `isPending`, `prefix`, `suffix`.
  - `LineageMemberActionsMenu`: `displayName`, `onViewProfile`, optional `canChangePromoter`,
    optional `onChangePromoter`, `className`; uses Base UI `DropdownMenuItem onClick`, not `onSelect`.

#### 3. Composition decision

- Extending existing components:
  - `apps/web/components/web/lineage/lineage-honor-strip.tsx`
  - `apps/web/components/web/lineage/lineage-compact-child-list.tsx`
- Composing existing primitives: `Carousel`, `CarouselSlide`, `Avatar`, `Badge`, `Stack`, `Link`, and existing
  `LineageMemberActionsMenu`.
- New component: only if a thin domain wrapper removes real duplication; otherwise keep edits in the two target
  components.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes (`SESSION_0340`).
- Wiki/spec entries read: `lineage-generation-rail-port-spec.md`, `graphify-component-port-map.md`
  (PORTMAP-0005), `dirstarter-component-inventory.md`.
- Product/epic docs read: `docs/petey-plan-0337-lineage-responsive-carousel.md`.
- Runbooks/protocols consulted: `graphify-repo-memory.md`, `autonomous-sessions.md`, `petey-plan.md`,
  `cody-preflight.md`, `review-recommend.md`, and `closing.md`.

#### 5. Dev environment confirmed

- Dev server command: `npx next dev --turbo` from `apps/web`.
- Working directory for app commands: `/Users/brianscott/dev/ronin-dojo-app/apps/web`.
- Brand/host for testing: `bbl.local:3000` for BBL lineage if host mapping is active; `localhost:3000` is an
  acceptable local fallback when brand host resolution is not material to the component proof.
- Verification commands confirmed: `bun run typecheck`, `bun run lint`, `bun run test` from `apps/web`; known
  repo-wide test caveat from SESSION_0340 remains.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001, FS-0008, FS-0024.
- Mitigation acknowledged: use the existing `Carousel` primitive, paste source-checked prop/API details before
  edits, and keep mutating commands in `/Users/brianscott/dev/ronin-dojo-app` with git remote/cwd guard before
  close.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0341_TASK_01 | completed | Bow-in, Graphify-first discovery, Petey grill decisions, and Cody pre-flight contract recorded. |
| SESSION_0341_TASK_02 | completed | Replaced connector-free honor-strip overflow and wide board child groups with shared Carousel rails. |
| SESSION_0341_TASK_03 | completed | Verified geometry/a11y behavior, updated PORTMAP/spec/inventory docs, ran full close, refreshed Graphify, and prepared the single commit/push. |

## What landed

- `LineageHonorStrip` now composes the shared `Carousel` / `CarouselSlide` primitive instead of a raw
  `ol.flex.overflow-x-auto` strip.
- The honor rail remains static/snap only with `controls="desktop"`, `edgeFades`, and `aria-label="Honor
  strip"`; no autoplay or BBL marquee motion was added.
- Honor selection stayed intact: each card still calls `onSelect(member.nodeId)` and
  `scrollMemberIntoView(member.id, reduceMotion)`.
- `LineageCompactChildList` now rails wide board child groups at the configured sibling threshold while
  smaller groups remain the compact vertical list.
- Recursive board expansion, selected-path auto-expansion, group labels/event links, action menus, and row
  profile selection remain on the existing contracts.
- PORTMAP-0005 and the lineage generation rail spec advanced to `proven` with 1280 / 768 / 390 Playwright
  proof.
- `docs/knowledge/wiki/test-fail-fix-ledger.md` now exists as a lightweight companion to the wiring ledger
  for clustered failing-test pointers and fix status.
- No `LineageConnectorLayer`, `LineageBranch`, tree-generation SVG overlay, schema, server action, query, or
  BBL asset-copy work changed.

## Decisions resolved

- Slice 4 ran inline as one orchestrated Petey -> Cody -> Desi/Doug -> Petey session; no autonomous
  3-session bundle, subagents, or worktrees were used.
- Static/snap placement is the Slice 4 decision. BBL landing marquee/autoplay stays deferred until after
  placement, and would need reduced-motion plus pause-on-hover/focus if ever added.
- Wide board groups rail only when the sibling set reaches the threshold; narrow groups stay vertical to
  preserve dense scan behavior.
- Screenshot/browser artifacts are local proof artifacts only. Docker cache cleanup does not manage them;
  `/tmp` screenshots are OS-disposable but not deterministic, and `.playwright-mcp/` persists until the tool
  or an explicit cleanup removes it.
- Fallow/Farrow tooling decision: do not install or run `npx` this session. `fallow-rs/fallow` is a plausible
  no-fix trial candidate for dead-code, duplication, circular-dependency, complexity, and boundary analysis.
  Farrow is a TypeScript web framework, not the relevant code-cleanliness scanner for this lane.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/web/lineage/lineage-honor-strip.tsx` | Replaced raw horizontal overflow with a labelled shared Carousel rail while preserving honor-card selection and scroll behavior. |
| `apps/web/components/web/lineage/lineage-compact-child-list.tsx` | Added a shared Carousel rail for wide board child groups, preserved narrow vertical groups, recursive expansion, group labels, profile selection, and action menus. |
| `docs/knowledge/wiki/component-porting/specs/lineage-generation-rail-port-spec.md` | Advanced PORTMAP-0005 spec to proven and recorded SESSION_0341 viewport proof. |
| `docs/knowledge/wiki/component-porting/graphify-component-port-map.md` | Advanced PORTMAP-0005 to proven and recorded connector-free rail proof/guardrails. |
| `docs/knowledge/wiki/custom-component-inventory.md` | Updated lineage component inventory for honor rail and board child group Carousel composition. |
| `docs/knowledge/wiki/index.md` | Updated generation rail spec status and current session row. |
| `docs/knowledge/wiki/test-fail-fix-ledger.md` | Created a minimal row-based ledger for clustered failing-test pointers from the 21-failure run. |
| `docs/knowledge/wiki/wiring-ledger.md` | Added bidirectional relationship to the new test fail fix ledger. |
| `docs/sprints/SESSION_0341.md` | Bow-in, Petey plan, Cody pre-flight, task ledger, verification, close review, and next-session recommendation. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `graphify stats` | 9203 nodes, 14001 edges, 1397 communities, 1564 files tracked. |
| `graphify query "lineage generation rail PORTMAP-0005 LineageHonorStrip LineageCompactChildList Carousel" --budget 2000` | Selected Slice 4 spec and port-map records; exact target files opened afterward. |
| `graphify query "autonomous codex session setup Petey Cody Desi Doug graphify fallow bow out" --budget 2000` | Selected autonomous-session and close/review protocols for the session-shape decision. |
| `graphify query "wiring ledger test failure ledger wiki" --budget 2000` | Located the existing `wiring-ledger.md` pattern before creating `test-fail-fix-ledger.md`. |
| `git diff --check` | Passed. |
| `bun run lint` from `apps/web` | Passed after Biome formatted one touched file on the first run; second run checked 1170 files with no fixes applied. |
| `bun run typecheck` from `apps/web` | Passed; Next route types generated and `tsc --noEmit` completed cleanly. |
| `bun run wiki:lint` from repo root | Passed before final close docs: 592 markdown files scanned, no lint violations. Passed again after adding `test-fail-fix-ledger.md`: 593 markdown files scanned, no lint violations. |
| Playwright desktop smoke at `http://bbl.local:3000/lineage/rigan-machado-bjj-lineage` (1280px) | Passed: no console errors, no page overflow, honor rail labelled `role="region"` with 6 slides and visible right control; board mode exposed 2 labelled child rails (`Dirty Dozen`, `Coral Belt Ceremony`) with 7 / 4 slides and visible controls; profile click opened the existing drawer; connector SVG path count in board proof was 0. Screenshot: `/tmp/lineage-slice4-desktop.png`. |
| Playwright tablet smoke at `http://bbl.local:3000/lineage/rigan-machado-bjj-lineage` (768px) | Passed: no console errors, no page overflow, honor rail and the same 2 board rails were labelled and scrollable with visible controls; profile click opened the existing drawer; connector SVG path count was 0. Screenshot: `/tmp/lineage-slice4-tablet.png`. |
| Playwright mobile smoke at `http://bbl.local:3000/lineage/rigan-machado-bjj-lineage` (390px) | Passed: no console errors, no page overflow, honor rail remained labelled/scrollable with desktop controls hidden by the shared primitive; existing `< sm` mobile lineage list branch rendered 17 rows; board rails and connector SVG paths were absent. Screenshot: `/tmp/lineage-slice4-mobile.png`. |
| Playwright/browser artifact check | No screenshot or `.playwright-mcp` files appeared in git status. Local sizes at close: `.playwright-mcp` 484K; screenshots 124K / 84K / 64K. These are disposable local artifacts, not committed repo output. |
| `bun run test` from `apps/web` | Failed outside this Slice 4 surface: 309 pass, 21 fail, 1 error, 330 tests across 75 files in 110.44s. Failures were broad DB/integration timeouts and fixture-cleanup issues (`dev-login`, Stripe webhooks, billing drift audit, lineage/server queries/actions, lead, attendance, course enrollment, org management, schedule materialize, courses, admin tool tier transition). No carousel or touched component test failed. |
| `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` + `graphify stats` | Update ran before close commit; final graph stats: 9215 nodes, 14013 edges, 1397 communities, 1565 files tracked. |

## Open decisions / blockers

- No PORTMAP-0005 implementation blocker remains.
- Repo test caveat worsened relative to SESSION_0340: this `bun run test` run reported 21 failures and 1
  error, mostly DB/integration timeouts and cleanup/FK issues. Treat this as a separate QA/test-stability
  lane before relying on the full package test as a green release gate.
- Petey recommendation accepted during close: created lightweight
  `docs/knowledge/wiki/test-fail-fix-ledger.md`. Keep it row-based and pointer-heavy like the wiring ledger:
  stable ID, cluster, focused command, owner/lane, last observed result, status, and fix link.
- Fallow remains a no-install candidate only. A future tooling trial should run summary/no-fix modes first
  and decide whether any CI, MCP, or SARIF integration is worth adding.

## Next session

### Goal

Stabilize and classify the repo-wide `bun run test` failures before starting the higher-risk Slice 5
adaptive connector spike.

### Inputs to read

- `docs/sprints/SESSION_0341.md`
- `docs/sprints/SESSION_0340.md`
- `docs/knowledge/wiki/component-porting/specs/lineage-adaptive-connector-port-spec.md`
- `docs/knowledge/wiki/component-porting/graphify-component-port-map.md` (PORTMAP-0006)
- Failing test files from this run:
  `apps/web/app/api/auth/dev-login/route.test.ts`,
  `apps/web/app/api/stripe/webhooks/route.test.ts`,
  `apps/web/server/web/billing/drift-audit.test.ts`,
  `apps/web/server/web/lineage/queries.test.ts`,
  `apps/web/server/web/lineage/node-profile-actions.test.ts`,
  `apps/web/server/web/course-enrollment/actions.safe-action.test.ts`,
  `apps/web/server/web/courses/queries.integration.test.ts`

### First task

Bow in, open `docs/knowledge/wiki/test-fail-fix-ledger.md`, use Graphify to cluster the failing
DB/integration tests by shared fixture/setup path, then reproduce one representative timeout and one
representative cleanup/FK failure with the smallest focused Bun command before deciding whether Slice 5 can
safely proceed.

### Candidates

1. **Recommended:** Doug/Cody test-stability triage session — the full test baseline expanded from 3 known
   failures to 21 failures + 1 error, and Slice 5 will touch higher-risk connector behavior.
2. **Alternative:** Begin PORTMAP-0006 Slice 5 spike — acceptable only if the operator accepts the repo-wide
   test baseline as temporarily red and wants to continue lineage UI work with focused verification.

## Review log

| Reviewer | Verdict | Notes |
| --- | --- | --- |
| Desi | pass | Rail placement is restrained and usable: honor rail and wide board groups get the shared snap affordance, mobile controls stay hidden, no one-note motion/marquee behavior was introduced, and narrow child groups remain dense vertical rows. |
| Doug | pass with caveat | Lint, typecheck, diff-check, wiki-lint, and Playwright viewport proof are green for the touched surface. Full `bun run test` is red with broad DB/integration instability outside the Slice 4 files. |
| Petey | pass with next-session remediation | PORTMAP-0005 scope stayed clean. Because the package test baseline widened from 3 failures to 21 failures + 1 error, recommend a test-stability session before PORTMAP-0006. |

## Hostile close review

### SESSION_0341 - Lineage Slice 4 generation rails

#### Review

**SESSION_0341_REVIEW_01 - Connector-free rail placement**

- **Reviewed tasks:** SESSION_0341_TASK_01, SESSION_0341_TASK_02, SESSION_0341_TASK_03
- **Dirstarter docs check:** cached docs/local inventory sufficient
- **Sources:** `docs/knowledge/wiki/dirstarter-component-inventory.md`,
  `apps/web/components/common/carousel.tsx`, local Slice 4 spec/PORTMAP docs
- **Verdict:** Pass with a test-suite caveat. The implementation extends the existing shared Carousel
  primitive instead of forking a lineage rail, preserves selection/action contracts, and keeps connector SVG
  code out of scope. Verification proved the user-facing claim at desktop/tablet/mobile. Merge readiness is
  capped by the unrelated repo-wide test instability, not by PORTMAP-0005 behavior.

#### Findings

**SESSION_0341_FINDING_01 - Repo-wide package test is not currently a trustworthy green gate**

- **Severity:** medium
- **Task:** SESSION_0341_TASK_03
- **Evidence:** `bun run test` from `apps/web` ended with 309 pass, 21 fail, 1 error across 75 files.
- **Impact:** A future Slice 5 connector change would be harder to release confidently if the full package test
  cannot distinguish introduced regressions from broad fixture/timeouts.
- **Required follow-up:** Run a Doug/Cody test-stability session that clusters and fixes or classifies the
  failing DB/integration tests before relying on full package test green.
- **Status:** open

#### Hostile questions

- **Plan sanity:** good. The plan forced Cody pre-flight and kept Slice 4 in connector-free zones only.
- **Dirstarter compliance:** aligned. The shared Carousel primitive was composed; no Dirstarter/Ronin UI
  primitive was bypassed.
- **Security:** no sensitive data path changed.
- **Data integrity:** no schema/query/action mutation changed; selection contracts stayed client-side.
- **Lifecycle proof:** credible for this slice. The honor rail and board rails were proven on the real BBL
  lineage route and profile click still opened the existing drawer.
- **Verification honesty:** mixed but named. Slice proof is strong; full package test is red and explicitly
  recorded.
- **Workflow honesty:** pass with one low process slip. During close, the SESSION frontmatter `status` was
  changed just before the body `### Status` line and corrected immediately before any verification, graph
  update, commit, or push. The final artifact is consistent, but future closes should patch both fields in one
  hunk.
- **Merge readiness:** ready to merge for PORTMAP-0005; not ready to claim full package test health.

#### Kaizen

- **Safe and secure?** Safe for the touched UI lane: no auth, server, database, or private payload surface
  changed. The exact tests that would further improve confidence are focused component/route tests for rail
  threshold behavior and a recovered full package test baseline.
- **Preventable failed steps:** one small process slip: the status atomicity edit was split and immediately
  corrected. The practical fix is to always patch frontmatter/body status together as the first close hunk.
- **Scale confidence:** 100 users: 9; 1,000 users: 8; 10,000 users: 8. Lowest-tier aggregate is 8 because the
  rail itself is UI-only and responsive-proofed, but full repo integration tests are currently noisy.
- **Score cap:** cap at 8 until `bun run test` failures are fixed or explicitly classified in the owning lane.

## ADR / ubiquitous-language check

- ADR: not needed. The session implemented an already-planned component-porting slice and made no new
  architectural decision.
- Ubiquitous language: no new domain terms introduced. Existing lineage, Rank, Rank.colorHex, Passport,
  Organization, and honor rail language stayed intact.
- Component documentation: updated `custom-component-inventory.md`, the PORTMAP, the generation rail spec, and
  the wiki index.

## Reflections

- The correct Slice 4 behavior was narrower than the old BBL references: this codebase already has normalized
  avatar/rank data and a shared Embla primitive, so importing BBL's full carousel/marquee treatment would have
  added risk without proof value.
- The board rail threshold mattered. Railing every grouped row would make small child groups feel heavier than
  the current compact board list; wide groups are where the Carousel earns its space.
- Artifact hygiene is simple but worth documenting: screenshots under `/tmp` and `.playwright-mcp/` browser
  run data are local/disposable and not handled by Docker cache monitoring.
- The test-fail-fix ledger paid for itself enough to create during close. The full test output is too
  expensive to rediscover each bow-in; a row-based pointer doc keeps the next session focused on shared fixture
  roots rather than retelling every failing assertion.
- Fallow/Farrow no-install review: current Fallow materials describe a TS/JS codebase-analysis tool for unused
  code, duplication, circular dependencies, complexity, architecture drift, SARIF, CI, VS Code, and agent/MCP
  workflows. That could complement Biome/TypeScript/Playwright, but it is not a replacement for any of them.
  Farrow is a TypeScript full-stack/web framework, so it is not the relevant tool for this cleanup gate.
  Recommendation: if tried, do a separate no-fix audit session using explicit approval for any `npx` or
  dependency install.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Touched docs checked. `lineage-generation-rail-port-spec.md`, `graphify-component-port-map.md`, `custom-component-inventory.md`, `test-fail-fix-ledger.md`, `wiring-ledger.md`, `wiki/index.md`, and this SESSION have current `updated: 2026-06-04` and `last_agent: codex-session-0341` where applicable. |
| Backlinks/index sweep | PORTMAP/spec/inventory/index now reference SESSION_0341 where applicable. `wiki/index.md` includes the current session row, generation rail spec status, and new Test Fail Fix Ledger row. `wiring-ledger.md` and `test-fail-fix-ledger.md` cross-link. |
| Wiki lint | `bun run wiki:lint` passed before final close docs: 592 markdown files scanned, no lint violations. Final post-edit rerun passed after `test-fail-fix-ledger.md`: 593 markdown files scanned, no lint violations. |
| Kaizen reflection | Present in `## Reflections` and Hostile close `#### Kaizen`. |
| Hostile close review | `SESSION_0341_REVIEW_01` present with `SESSION_0341_FINDING_01` open for repo-wide test instability. |
| Review & Recommend | Next session recommendation written: test-stability triage before PORTMAP-0006, with Slice 5 as an explicit alternative. |
| Memory sweep | No operator memory update needed; session-scoped behavior is recorded in SESSION_0341, PORTMAP-0005, spec, inventory, test-fail-fix ledger, and wiki index. |
| Next session unblock check | Unblocked if operator accepts the test-stability recommendation; Slice 5 remains possible but carries the red full-test baseline risk. |
| Git hygiene | Guard complete: cwd `/Users/brianscott/dev/ronin-dojo-app`, branch `main`, remote `https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline.git`, one worktree at this path. Single push only; close commit hash reported at bow-out / see git log. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` ran before the close commit; final stats captured: 9215 nodes, 14013 edges, 1397 communities, 1565 files tracked. |
