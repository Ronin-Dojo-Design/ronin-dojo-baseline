---
title: "SESSION 0340 - Lineage Slice 3 carousel rail extension"
slug: session-0340
type: session--open
status: closed
created: 2026-06-04
updated: 2026-06-04
last_agent: codex-session-0340
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0339.md
  - docs/petey-plan-0337-lineage-responsive-carousel.md
  - docs/knowledge/wiki/component-porting/specs/lineage-carousel-rail-port-spec.md
  - docs/knowledge/wiki/component-porting/graphify-component-port-map.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0340 - Lineage Slice 3 carousel rail extension

## Date

2026-06-04

## Operator

Brian + codex-session-0340 (Petey orchestration -> Cody pre-flight/build -> Desi/Doug verify)

## Goal

Bow in against petey-plan-0337 Slice 3, PORTMAP-0004, and the carousel rail port spec; then, after
Petey grill agreement, extend the shared Embla `Carousel` primitive with a dense-rail mode while
preserving every current consumer.

## Status

### Status: closed

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0339.md`.
- Carryover: SESSION_0339 closed Slice 2 green, advanced PORTMAP-0003 to `proven`, and explicitly
  staged Slice 3 for a fresh session because it touches the shared `components/common/carousel.tsx`
  primitive.
- Date note: system clock for this Codex session is 2026-06-04; frontmatter uses 2026-06-04.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean before creating `docs/sprints/SESSION_0340.md`
- Current HEAD at bow-in: `0c9fa2d`
- Remote guard: `origin` is `https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline.git`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | UI primitives only; none of the 10 L1 operational layers. |
| Extension or replacement | Extension: add optional dense-rail affordances to the existing Embla `Carousel` primitive. |
| Why justified | PORTMAP-0004 requires reuse-before-port; the existing carousel is the Dirstarter/Ronin equivalent. |
| Risk if bypassed | High: adding a second carousel or changing defaults would regress existing course/content carousels. |

Live docs checked during planning: not applicable for the 10 mandatory L1 areas; local
`dirstarter-component-inventory.md` and `dirstarter-docs-inventory.md` were consulted.

### Graphify check

- Graph status: current enough for navigation; stats at bow-in: 9201 nodes, 13986 edges, 1365
  communities, 1564 files tracked. `.graphify/graph_report.md` header matches those counts. Current
  HEAD: `0c9fa2d`.
- Queries used:
  - `lineage carousel rail PORTMAP-0004 Embla common carousel component porting`
  - `autonomous codex session setup Petey Cody Desi Doug graphify fallow bow out`
  - Current repo BBL docs: `Black Belt Legacy GAP_MATRIX STORIES PRD lineage grouped promotion rows carousel rails`
  - Old monorepo: `blackbeltlegacy CarouselRail StudentsCarousel SchoolCarousel lineage carousel rail BBLApp`
  - Old monorepo landing: `BlackBeltLegacyLanding sliding cards motion carousel featured black belts CelebrationInstructorCard`
- Files selected from graph:
  - `docs/petey-plan-0337-lineage-responsive-carousel.md`
  - `docs/knowledge/wiki/component-porting/specs/lineage-carousel-rail-port-spec.md`
  - `docs/knowledge/wiki/component-porting/graphify-component-port-map.md`
  - `docs/product/black-belt-legacy/GAP_MATRIX.md`
  - `docs/product/black-belt-legacy/STORIES.md`
  - `docs/product/black-belt-legacy/PRD.md`
  - `docs/runbooks/dev-environment/autonomous-sessions.md`
  - `docs/protocols/petey-plan.md`
  - `docs/protocols/review-recommend.md`
  - `apps/web/components/common/carousel.tsx`
  - `apps/web/components/web/content-posts/content-post-media-carousel.tsx`
  - `apps/web/app/(web)/disciplines/_components/founder-carousel.tsx`
  - `apps/web/app/(web)/disciplines/_components/member-carousel-by-rank.tsx`
  - `apps/web/app/(web)/disciplines/_components/video-carousel.tsx`
  - old monorepo exact legacy sources from the port spec:
    `/Users/brianscott/dev/ronin-dojo-monorepo/src/brands/blackbeltlegacy/components/shared/CarouselRail.jsx`
  - old monorepo exact legacy sources from the port spec:
    `/Users/brianscott/dev/ronin-dojo-monorepo/src/brands/blackbeltlegacy/components/lineage/StudentsCarousel.jsx`
  - old monorepo exact legacy sources from the port spec:
    `/Users/brianscott/dev/ronin-dojo-monorepo/src/brands/blackbeltlegacy/components/lineage/SchoolCarousel.jsx`
  - old monorepo exact legacy sources from the port spec:
    `/Users/brianscott/dev/ronin-dojo-monorepo/src/brands/blackbeltlegacy/components/lineage/ResponsiveTreeContainer.jsx`
  - old monorepo exact legacy sources from the port spec:
    `/Users/brianscott/dev/ronin-dojo-monorepo/src/brands/blackbeltlegacy/components/lineage/MobileLineageList.jsx`
  - old monorepo BBL landing motion/card references:
    `/Users/brianscott/dev/ronin-dojo-monorepo/src/brands/blackbeltlegacy/BlackBeltLegacyLanding.jsx`
  - old monorepo BBL landing motion/card references:
    `/Users/brianscott/dev/ronin-dojo-monorepo/src/brands/blackbeltlegacy/components/FeaturedBlackBelts.jsx`
- Verification note: exact files were opened after Graphify; Graphify used as navigation, not proof.
  `graphify explain "__components_common_carousel"` identified four current consumers. Old monorepo
  Graphify had to be rebuilt; it remained sparse (59 nodes / 145 edges / 14149 tracked files), so exact
  legacy paths from the Slice 3 spec were opened after recording the Graphify miss.

### BBL product-doc alignment

- `STORIES.md`: Slice 3 is infrastructure for BBL-LINEAGE-003 (grouped promotion rows/cohorts) and keeps
  BBL-LINEAGE-001/002 responsive navigation unblocked; it does not itself close a story.
- `PRD.md`: aligns with the public viewer goals for grouped rows, calm/premium lineage browsing, and
  navigability. It stays within the non-goals by avoiding schema, trust-state, drag/drop, and editor
  behavior.
- `GAP_MATRIX.md`: BBL-LINEAGE-003 remains partial until Slice 4 renders grouped/wide rows publicly.
  PORTMAP-0004 should be documented as enabling infrastructure, not marked as closing the grouped-row gap.
  The highest-value GAP_MATRIX next tasks are unchanged.

### Old BBL behavior extraction

- `CarouselRail.jsx`: behaviors to adapt are sized snap items (`168/248/280px` style), md-only controls,
  controls only when scrollable, edge fades, `role="region"` + `aria-label`, and empty-state bypass.
- `StudentsCarousel.jsx`: concept to defer to Slice 4 is belt/rank-grouped collapsible cohorts with
  chunked avatar pages and rail-backed browsing; do not copy legacy belt color constants or raw inputs.
- `SchoolCarousel.jsx`: confirms `emptyState` and `ariaLabel` are practical caller-facing rail props.
- `ResponsiveTreeContainer.jsx`: reinforces that zoom/pan/tree container behavior is not Slice 3 scope.
- `MobileLineageList.jsx`: already adapted in Slice 2; only relevant as a guard against reintroducing
  hardcoded belt color maps.
- BBL landing page reference:
  - `BlackBeltLegacyLanding.jsx` Dirty Dozen showcase uses a CSS infinite marquee (`@keyframes scroll`
    0 -> -50%), duplicated card array for a seamless loop, gradient edge fades, and pause-on-hover via
    `animationPlayState`.
  - `CelebrationInstructorCard` uses fixed-width portrait cards (`240/260px`, featured `300/340px`),
    subtle hover border/shadow, bottom photo gradient, school-logo inset, rank pill, and truncating names.
  - `FeaturedBlackBelts.jsx` uses mobile-only horizontal snap cards with a right gradient hint and dot
    indicators; desktop becomes a grid. Cards use hover lift, photo scale, Dirty Dozen badge, founder badge,
    and arrow micro-motion.
  - Design recommendation: borrow the premium card treatment, edge fades, and snap affordance for the
    honor rail; defer infinite/autoplay marquee motion until after Slice 4 proves the honor rail placement.
    If autoplay is later adopted, it needs reduced-motion handling and pause-on-hover/focus because honor
    rail cards are navigational, not decorative.
- BBL image asset reference:
  - Current app has only brand shell assets under
    `apps/web/public/images/brands/black-belt-legacy/` (`favicon`, `logo`, `opengraph`,
    `rigan-machado-badge.svg`).
  - Old monorepo has the exact lineage/member images SESSION_0263 catalogued under
    `/Users/brianscott/dev/ronin-dojo-monorepo/public/brand/blackbeltlegacy/images/lineage/` and
    `/Users/brianscott/dev/ronin-dojo-monorepo/public/brand/blackbeltlegacy/images/members/`, including
    `carlos-gracie-sr.jpg`, `carlos-gracie-jr.jpg`, `Rigan-Machado.jpg`, and Dirty Dozen member photos.
  - Operator approved pulling these exact images if the honor rail / proof fixture needs real visual cards.
    Petey recommendation: do not bulk-copy in Slice 3 unless the dense-rail proof requires it; use them in
    Slice 4 honor-rail placement.

### Grill outcome

3 forks resolved before code:

1. **Session shape:** inline one-session Slice 3. Do not bundle S3/S4/S5 into an autonomous run; S3 touches
   one shared primitive, S4 depends on S3, and S5 is spike-risky.
2. **Proof shape:** follow the recommendation: keep current consumers back-compatible, add focused dense-rail
   proof without pulling Slice 4 lineage placement forward, then smoke all four current consumers.
3. **Fallow/Farrow:** no install and no `npx` this session. Treat it as a no-install research/recommend
   item during full bow-out only.

### Drift logged

- Relevant existing drift checked: D-016 is closed but still instructive. Common primitives are on the
  Base UI / render-prop era, so Cody must source-check the shared primitive API and avoid legacy `asChild`
  assumptions.
- Relevant failed-step mitigation checked: FS-0024 cwd guard. Mutating git/gh/bun/vercel/graphify work
  stays in `/Users/brianscott/dev/ronin-dojo-app`, with remote guard before close.

## Petey plan

### Goal

Land Slice 3 by extending the existing Embla carousel into a back-compatible dense rail, then prove every
current carousel consumer still behaves.

### Tasks

#### SESSION_0340_TASK_01 - Petey grill, task lock, and pre-flight ledger

- **Agent:** Petey.
- **What:** Resolve the open session-shape decisions, then lock the plan and Cody pre-flight before code.
- **Steps:**
  1. Confirm inline one-session Slice 3 versus autonomous/session bundle.
  2. Confirm the no-install Fallow/Farrow review shape for bow-out.
  3. Record current carousel API and current consumer list from Graphify/source inspection.
  4. Update this SESSION file with final grill outcome and Cody pre-flight.
- **Done means:** Grill decisions are recorded and Cody has a pre-flight artifact before touching
  `carousel.tsx`.
- **Depends on:** nothing.

#### SESSION_0340_TASK_02 - Extend shared Carousel dense-rail API

- **Agent:** Cody.
- **What:** Extend `apps/web/components/common/carousel.tsx` with optional rail behavior while preserving
  defaults.
- **Steps:**
  1. Add optional `emptyState`, `ariaLabel`, `edgeFades`, and wrapper a11y support.
  2. Add slide basis variants to `CarouselSlide` without breaking existing `className` width overrides.
  3. Add a `ResizeObserver`-driven Embla `reInit` path for dynamic content.
  4. Keep chevron behavior back-compatible and desktop-only unless the existing primitive already renders
     otherwise by design.
- **Done means:** Existing imports typecheck unchanged; dense rail supports the PORTMAP-0004 behavior
  states; no second carousel component or dependency exists.
- **Depends on:** SESSION_0340_TASK_01.

#### SESSION_0340_TASK_03 - Proof, docs, full close, graph update, commit, push

- **Agent:** Desi -> Doug -> Petey.
- **What:** Verify the shared primitive plus consumers, update port docs/inventory/session evidence, and
  close fully.
- **Steps:**
  1. Smoke a route or fixture that renders the dense rail at 390, 768, and 1280 with Playwright evidence.
  2. Smoke every current carousel consumer named by Graphify/source inspection.
  3. Run typecheck, Biome, and focused tests if any are added.
  4. Update PORTMAP-0004/spec/inventory/session evidence when proof is green.
  5. Run the full closing ritual including optional evidence, Review & Recommend, component/ADR sweep,
     no-install Fallow/Farrow recommendation, hostile close review, and Graphify refresh after git hygiene.
  6. Stage, commit with a conventional message, and push to `main`.
- **Done means:** Proof is recorded, PORTMAP-0004 is advanced if warranted, `graphify update .` has run
  after git hygiene, and one close commit is pushed to `main`.
- **Depends on:** SESSION_0340_TASK_02.

### Parallelism

Recommendation: keep this inline/sequential. The code task touches one shared primitive and the proof/docs
depend on the exact final API. Subagents or worktrees would add merge/reconciliation cost without enough
independent file ownership. Persona handoff remains Petey -> Cody -> Desi/Doug -> Petey.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0340_TASK_01 | Petey | There are explicit session-shape and bow-out process decisions to grill before code. |
| SESSION_0340_TASK_02 | Cody | A clear shared-primitive extension after pre-flight. |
| SESSION_0340_TASK_03 | Desi/Doug/Petey | Desi checks UX/a11y affordance behavior; Doug proves gates; Petey records and closes. |

### Open decisions

- Whether to run Slice 3 inline as one session now, or bundle S3/S4/S5 into an autonomous run after this
  planning pass. Petey recommendation: run Slice 3 inline only.
- Whether Fallow/Farrow is a no-install research/recommend note during full close, or a new gate/tooling
  lane. Petey recommendation: no-install research/recommend only; do not run `npx` or add dependencies
  without approval.

### Risks

- Shared primitive regression: current consumers use `CarouselSlide className` to override width
  (`100%`, `200px`, `180px`, `300px`).
- Empty-state detection can be wrong if it relies on opaque `children` shapes; implementation needs a
  conservative React.Children check.
- A11y landmark props must not create unlabeled regions on existing consumers.
- The dense rail needs proof before Slice 4 can safely adopt it in lineage surfaces.

### Scope guard

- No Slice 4 placement in honor strips or board child lists.
- No Slice 5 connector/SVG/adaptive bus work.
- No new carousel dependency, second carousel component, or verbatim BBL JSX.
- No schema/server/API changes.
- No hardcoded belt colors.
- No Fallow/Farrow install or `npx` execution without explicit operator approval.
- No autoplay/marquee motion in Slice 3; landing-page motion is Slice 4+ design input for the honor rail.

### Dirstarter implementation template

- **Docs read first:** `docs/petey-plan-0337-lineage-responsive-carousel.md`,
  `docs/knowledge/wiki/component-porting/specs/lineage-carousel-rail-port-spec.md`,
  `docs/knowledge/wiki/component-porting/graphify-component-port-map.md`,
  `docs/product/black-belt-legacy/PRD.md`, `docs/product/black-belt-legacy/STORIES.md`,
  `docs/product/black-belt-legacy/GAP_MATRIX.md`,
  `docs/knowledge/wiki/dirstarter-component-inventory.md`,
  `docs/knowledge/wiki/dirstarter-docs-inventory.md`,
  `docs/protocols/cody-preflight.md`, `docs/runbooks/dev-environment/autonomous-sessions.md`,
  and the old-monorepo BBL carousel/landing files named in the Graphify check.
- **Design reference read:** old-monorepo BBL landing `BlackBeltLegacyLanding.jsx` and
  `FeaturedBlackBelts.jsx` for sliding card motion and portrait-card treatment.
- **Baseline pattern to extend:** `apps/web/components/common/carousel.tsx` backed by Embla and
  `Button`; current consumer contract is `Carousel` + `CarouselSlide`.
- **Custom delta:** optional dense rail affordances: slide basis variants, empty state, edge fades,
  region/a11y labeling, and ResizeObserver re-init.
- **No-bypass proof:** this extends the only existing carousel primitive and records every current
  consumer before changing the API.

## Cody pre-flight

### Pre-flight: Carousel dense rail extension

#### 1. Existing component scan

- Graphify query used: `lineage carousel rail PORTMAP-0004 Embla common carousel component porting`
- Graphify query used: `component lab styleguide playground storybook demo common primitives carousel`
- Found:
  - `apps/web/components/common/carousel.tsx` is the only current carousel primitive.
  - No existing component-lab/styleguide route was found for primitive proof.
  - Current carousel consumers:
    - `apps/web/components/web/content-posts/content-post-media-carousel.tsx`
    - `apps/web/app/(web)/disciplines/_components/founder-carousel.tsx`
    - `apps/web/app/(web)/disciplines/_components/member-carousel-by-rank.tsx`
    - `apps/web/app/(web)/disciplines/_components/video-carousel.tsx`

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md`: yes.
- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md` alignment URLs: yes; no mandatory
  storage/payments/media/content/monetization/blog/auth/theming/Prisma/hosting doc applies.
- Closest L1 pattern: existing `Carousel` + `CarouselSlide` Embla primitive; no second carousel.
- Primitive API spot-check:
  - `Carousel` current props: `options?: EmblaOptionsType`, `children: React.ReactNode`,
    `className?: string`.
  - `CarouselSlide` current props: `children: React.ReactNode`, `className?: string`; default class
    `min-w-0 flex-[0_0_280px]`.
  - `Button` props from source: variants `fancy | primary | secondary | soft | ghost | destructive`;
    sizes `xs | sm | md | lg`; `isPending?: boolean`; `prefix?: ReactNode`; `suffix?: ReactNode`;
    supports native button props through `useRender.ComponentProps<"button">`.
  - Existing consumer width overrides to preserve: `flex-[0_0_100%]`, `flex-[0_0_200px]`,
    `flex-[0_0_180px]`, `flex-[0_0_300px]`.

#### 3. Composition decision

- Extending existing component: `apps/web/components/common/carousel.tsx`.
- Composing existing components: `Button` for chevrons.
- New component: no. No new carousel dependency.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes (`SESSION_0339`).
- Wiki/spec entries read: `lineage-carousel-rail-port-spec.md`, `graphify-component-port-map.md`,
  `dirstarter-component-inventory.md`.
- Product docs read: `docs/product/black-belt-legacy/PRD.md`, `STORIES.md`, `GAP_MATRIX.md`.
- Old BBL references read: `CarouselRail.jsx`, `StudentsCarousel.jsx`, `SchoolCarousel.jsx`,
  `ResponsiveTreeContainer.jsx`, `MobileLineageList.jsx`, `BlackBeltLegacyLanding.jsx`,
  `FeaturedBlackBelts.jsx`, and `featuredBlackBelts.js`.
- Runbook consulted: `docs/runbooks/dev-environment/dev-environment.md`,
  `docs/runbooks/dev-environment/autonomous-sessions.md`, and
  `docs/runbooks/dev-environment/graphify-repo-memory.md`.

#### 5. Dev environment confirmed

- Dev server command: `bun run dev` or direct `npx next dev --turbo` from `apps/web/`.
- Working directory for app commands: `/Users/brianscott/dev/ronin-dojo-app/apps/web`.
- Brand/host for testing: `bbl.local:3000` for BBL lineage routes if host mapping is active; `localhost:3000`
  for baseline/default smoke when brand is not material to the primitive.
- Verification commands confirmed: `bun run typecheck`, `bun run lint`, `bun test` from `apps/web/`;
  Playwright route smoke requires a dev server.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001 (reuse L1 primitives), FS-0008 (primitive API inference), FS-0024
  (cwd drift).
- Mitigation acknowledged: extend the existing `Carousel`, paste source-checked prop/API details before
  import/edit, and keep all mutating commands in `/Users/brianscott/dev/ronin-dojo-app`.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0340_TASK_01 | completed | Bow-in, Graphify-first discovery, old BBL behavior extraction, BBL product-doc alignment, and Petey grill decisions recorded. |
| SESSION_0340_TASK_02 | completed | Extended the shared Embla `Carousel` primitive with back-compatible dense-rail affordances. |
| SESSION_0340_TASK_03 | completed | Verified code gates, Playwright route/dense-rail proof, wiki/spec/inventory updates, close review, and staged Slice 4 handoff. |

## What landed

- `apps/web/components/common/carousel.tsx` now remains the single carousel primitive and supports:
  optional `emptyState`, `ariaLabel`, `role`, `edgeFades`, `controls`, slide `width`, and
  ResizeObserver-driven Embla `reInit`.
- Existing `CarouselSlide className` flex-basis overrides still win, preserving the current `100%`,
  `180px`, `200px`, and `300px` consumers.
- Current consumers were labelled and width-constrained for no-overflow:
  content-post media carousel, founder carousel, member-by-rank carousel, and video carousel.
- PORTMAP-0004 and the lineal carousel port spec advanced from mapped/draft to proven.
- `dirstarter-component-inventory.md` now lists `Carousel`/`CarouselSlide` as the approved shared rail
  primitive so future sessions do not fork a second carousel.
- BBL landing-page motion/card treatment and exact old-monorepo BBL lineage/member image assets were
  captured as Slice 4 design inputs, not pulled into Slice 3.

## Decisions resolved

- Slice 3 ran inline in one session; no autonomous 3-session bundle and no worktrees/subagents.
- Proof stayed on the shared primitive and current consumers; no Slice 4 honor-strip placement was pulled
  forward.
- Fallow/Farrow was treated as no-install research/recommend only; no `npx`, dependency add, or tool install.
- BBL sliding-card/marquee motion is design input for the honor rail after Slice 4 placement is proven; no
  autoplay/marquee motion in Slice 3.
- Exact old-monorepo BBL images are approved for use when Slice 4 needs real honor-rail cards, but not
  bulk-copied in this primitive-only session.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/common/carousel.tsx` | Extended the shared Embla carousel with optional dense-rail props, empty-state bypass, labelled region support, edge fades, desktop/always/no controls, width variants, dynamic slide filtering, event cleanup, and ResizeObserver `reInit`. |
| `apps/web/app/(web)/disciplines/_components/member-carousel-by-rank.tsx` | Added full-width/min-width wrapper, accessible carousel label, edge fades, and desktop-only controls for the rank rail. |
| `apps/web/app/(web)/disciplines/_components/founder-carousel.tsx` | Added full-width/min-width wrapper and accessible carousel label. |
| `apps/web/app/(web)/disciplines/_components/video-carousel.tsx` | Added full-width/min-width wrapper and accessible carousel label. |
| `apps/web/components/web/content-posts/content-post-media-carousel.tsx` | Added full-width/min-width wrapper and accessible media-carousel label while preserving `100%` slide basis. |
| `docs/knowledge/wiki/component-porting/specs/lineage-carousel-rail-port-spec.md` | Advanced status to proven and recorded SESSION_0340 proof summary. |
| `docs/knowledge/wiki/component-porting/graphify-component-port-map.md` | Advanced PORTMAP-0004 to proven and recorded proof notes. |
| `docs/knowledge/wiki/dirstarter-component-inventory.md` | Added the shared `Carousel`/`CarouselSlide` primitive row with the SESSION_0340 dense-rail contract. |
| `docs/knowledge/wiki/index.md` | Updated carousel spec status, corrected SESSION_0339 to closed, and added SESSION_0340. |
| `docs/sprints/SESSION_0340.md` | Session ledger, proof, close review, and Slice 4 handoff. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `graphify stats` | 9201 nodes, 13986 edges, 1365 communities, 1564 files tracked. |
| `graphify query "lineage carousel rail PORTMAP-0004 Embla common carousel component porting" --budget 2000` | Identified Slice 3 docs, port map, and common carousel node. |
| `graphify explain "__components_common_carousel"` | Identified four current consumers. |
| `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` in old monorepo | Rebuilt sparse old graph: 59 nodes, 145 edges, 14149 files tracked. |
| `graphify query "blackbeltlegacy CarouselRail StudentsCarousel SchoolCarousel lineage carousel rail BBLApp" --budget 2000` in old monorepo | Surfaced BBL landing graph but missed exact carousel files; exact spec paths were opened afterward. |
| `graphify query "Black Belt Legacy GAP_MATRIX STORIES PRD lineage grouped promotion rows carousel rails" --budget 2000` | Selected BBL PRD, STORIES, GAP_MATRIX, and design-system tear-sheet context. |
| `bun run lint` from `apps/web` | Passed; Biome checked 1170 files and applied no fixes. |
| `bun run typecheck` from `apps/web` | Passed; Next route types generated, `tsc --noEmit` clean. |
| `git diff --check` | Passed. |
| Clean Playwright route smoke: `/disciplines/bjj` at 1280 | Passed: HTTP 200, no console errors, no page errors, `pageScrollWidth === innerWidth`, member rail labelled `role="region"`, two 180px seeded slides, founders carousel label present. Screenshot: `/tmp/ronin-carousel-clean-desktop.png`. |
| Dynamic dense-rail Playwright proof on `/disciplines/bjj` | Passed by cloning seeded rank slides in-page to eight slides: no page overflow at 390 / 768 / 1280; rail viewport stayed constrained; `viewport.scrollWidth > viewport.clientWidth`; controls hidden at 390 and visible at 768/1280; right fade/control at start. Screenshots: `/tmp/ronin-carousel-dynamic-final-mobile.png`, `/tmp/ronin-carousel-dynamic-final-tablet.png`, `/tmp/ronin-carousel-dynamic-final-desktop.png`. |
| End-state Playwright proof | Passed: start state had right control/fade only; end state had left control/fade only and no right control/fade. Screenshot: `/tmp/ronin-carousel-end-state.png`. |
| Accidental bare `bun test` from `apps/web` | Failed as a command mismatch: bare Bun loaded Playwright e2e specs outside Playwright runner and then DB-backed tests saw undefined `db`; replaced with the package script below. |
| `bun run test` from `apps/web` | Failed outside Slice 3 scope: 416 pass, 3 fail. Failures were `server/admin/tools/actions.safe-action.test.ts` tier-transition timeout + cleanup FK issue, and `server/web/billing/drift-audit.test.ts` clean-report expectation. No carousel/component tests failed. |
| `bun run wiki:lint` | Passed: 591 markdown files scanned, no lint violations. |
| `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` + `graphify stats` | Update ran before close commit; current graph stats: 9203 nodes, 14001 edges, 1397 communities, 1564 files tracked. |

## Open decisions / blockers

- No Slice 3 blocker remains.
- Repo test caveat: `bun run test` currently has 3 unrelated integration failures outside this carousel
  surface; do not treat them as PORTMAP-0004 failures, but they should be triaged separately if they are
  not already known.
- Slice 4 needs a placement decision for whether the first honor rail uses static snap only or borrows BBL
  landing marquee motion later. Petey recommendation: static/snap first; add autoplay only after placement,
  with reduced-motion and pause-on-hover/focus.

## Next session

### Goal

Begin petey-plan-0337 Slice 4 / PORTMAP-0005 — Generation rail placement in connector-free zones, using
the now-proven shared `Carousel` primitive.

### Inputs to read

- `docs/petey-plan-0337-lineage-responsive-carousel.md`
- `docs/knowledge/wiki/component-porting/specs/lineage-generation-rail-port-spec.md`
- `docs/knowledge/wiki/component-porting/graphify-component-port-map.md` (PORTMAP-0005)
- `docs/sprints/SESSION_0340.md`
- `apps/web/components/common/carousel.tsx`
- `apps/web/components/web/lineage/lineage-honor-strip.tsx`
- `apps/web/components/web/lineage/lineage-compact-child-list.tsx`
- Old BBL references:
  `/Users/brianscott/dev/ronin-dojo-monorepo/src/brands/blackbeltlegacy/components/lineage/StudentsCarousel.jsx`
  and `SchoolCarousel.jsx`
- Old BBL asset folders if real cards are needed:
  `/Users/brianscott/dev/ronin-dojo-monorepo/public/brand/blackbeltlegacy/images/lineage/` and
  `/Users/brianscott/dev/ronin-dojo-monorepo/public/brand/blackbeltlegacy/images/members/`

### First task

Bow in, then Cody pre-flight `LineageHonorStrip` and `LineageCompactChildList` data/selection contracts
before replacing raw horizontal overflow with the shared `Carousel`. Keep connector-free zones only; do not
touch `LineageConnectorLayer` or tree-generation SVG overlay behavior in Slice 4.

## Review log

| Reviewer | Verdict | Notes |
| --- | --- | --- |
| Desi | pass | Dense rail affordances match the BBL behavior intent without importing the marquee/autoplay motion. Mobile controls are suppressed; md+ controls are reachable; edge fades are visual-only and pointer-safe. |
| Doug | pass with caveat | Lint, typecheck, diff-check, clean route smoke, and Playwright dense-rail proof are green. Repo-wide `bun run test` has 3 unrelated integration failures that should be tracked separately. |
| Petey | pass | Scope stayed on PORTMAP-0004. Slice 4 is unblocked; exact BBL images and landing card treatment are recorded as placement inputs, not primitive scope. |

## Hostile close review

- **Giddy verdict:** pass. No second carousel, no new dependency, no Slice 4/Slice 5 leakage, no belt-color
  hardcoding, no schema/server changes.
- **Doug verdict:** pass with test-suite caveat. Verification honesty is acceptable because the failing
  package test rows are named and unrelated to the touched surface.
- **Dirstarter docs check:** no live Dirstarter operational layer changed. Local inventory was updated
  because a shared UI primitive contract changed.
- **Security/data integrity:** no auth, payments, database, privacy, or server read/write path changed.
- **Score cap:** cap at 8 until the unrelated `bun run test` failures are resolved or classified in the
  owning lane.

## ADR / ubiquitous-language check

- ADR: not needed. The session extended an existing UI primitive under an already-approved porting plan and
  made no new architectural decision.
- Ubiquitous language: no new domain terms introduced. Existing terms (`Passport`, `Rank`, `Rank.colorHex`,
  lineage, honor rail) were preserved.

## Reflections

- The risky part was not the API itself; it was container width. The dynamic proof initially exposed that a
  dense track could expand the surrounding layout unless the root, viewport, and current discipline
  consumers all carried `w-full min-w-0` constraints.
- Waiting for a clean route smoke after the synthetic DOM-clone proof mattered. The synthetic fixture is
  good for dynamic content, but clean no-error evidence belongs to the unmodified route.
- For Slice 4, use the exact old BBL images only where they prove the honor rail presentation. The primitive
  does not need image assets.
- Fallow/Farrow no-install review: Fallow appears useful as an additional TS/JS codebase-intelligence layer
  for dead code, duplication, circular deps, complexity, architecture boundaries, SARIF, and MCP/agent
  workflows. It is not a replacement for Biome, TypeScript, Playwright, or security scanning. Recommendation:
  trial it in a separate tooling session with owner approval, starting with no-fix summary/audit modes and
  no dependency install until the findings quality is evaluated. Sources checked: `https://github.com/fallow-rs/fallow`
  and `https://docs.fallow.tools/quickstart`.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Updated touched wiki/spec/inventory/index/session docs to `updated: 2026-06-04` and `last_agent: codex-session-0340`; code files have no frontmatter. |
| Backlinks/index sweep | Added SESSION_0340 to wiki index; corrected SESSION_0339 index status to `closed`; added SESSION_0340 pairing to PORTMAP and component inventory. `wiki/log.md` is explicitly superseded and not used for routine changes. |
| Wiki lint | `bun run wiki:lint` passed: 591 markdown files scanned, no lint violations. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | Present; PASS with unrelated test-suite caveat and score cap 8. |
| Review & Recommend | Next session staged for petey-plan-0337 Slice 4 / PORTMAP-0005. |
| Memory sweep | No operator-memory update needed; persistent facts are captured in PORTMAP-0004, the port spec, and component inventory. |
| Next session unblock check | Unblocked: Slice 4 can start from the proven Carousel primitive and recorded BBL image/motion inputs. |
| Git hygiene | Branch `main`; single worktree at `/Users/brianscott/dev/ronin-dojo-app`; `origin` = `https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline.git`; `HEAD...origin/main` divergence `0 0` after fetch; status limited to Slice 3 code/docs/session files; single push planned, hash reported at bow-out / see git log. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` ran before close commit; `graphify stats` reports 9203 nodes, 14001 edges, 1397 communities, 1564 files tracked. |
