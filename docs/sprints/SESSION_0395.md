---
title: "SESSION 0395 — Lineage View A: custom cohort-timeline (Kajukenbo list-boxes), retire family-chart"
slug: session-0395
type: session--open
status: in-progress
created: 2026-06-16
updated: 2026-06-16
last_agent: claude-session-0395
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0394.md
  - docs/architecture/decisions/0027-lineage-view-a-custom-cohort-timeline.md
  - docs/runbooks/domain-features/lineage-hub.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0395 — Lineage View A: custom cohort-timeline (Kajukenbo list-boxes), retire family-chart

## Date

2026-06-16

## Operator

Brian + claude-session-0395 (Petey → Desi → Cody → Doug → Petey)

## Goal

Build the custom View A layout that replaces the vendored `family-chart` genealogy engine (ADR 0027,
decision B). View A becomes `LineageCohortTimeline`: a **Kajukenbo-style tree of list-boxes** — each node is
a card with a cinematic header (avatar / Poppins name / belt-graphic) plus a **vertical list of that person's
children**; a listed child who has their own students sprouts **their own box** joined by a **connector line**
(structural, from `primaryVisualParentMemberId` — no schema), and a leaf child stays a compact row. Keep the
family-chart **focal-recenter** feel (click a node → recenter, `?focus=` URL sync, ⋮ guard), reuse the shipped
`StudentsCarousel` drawer for the deep belt-rank roster drill-down, wire the existing `LineageSearchBar` to
recenter, port the secondary-link overlay + depth controls, and add a **derived multi-select filter bar**
(Dirty Dozen / belt / school / promotion-year — all from existing data, no schema). Then **retire
`family-chart` for View A** — but only after Doug's green browser-proof; if the replacement only partially
lands, family-chart stays as the working fallback and the cut moves to a follow-on. Land green on `main`.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0394.md`
- Carryover: SESSION_0394 brand-polished the cinematic explorer and, on browser review, surfaced
  D-DRIFT-0394-1 (explorer ignores cohort grouping; flat single-row layout). The operator decided **B** —
  retire family-chart for View A, build a custom layout — recorded as **ADR 0027**. This session is that build.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean before creating this session file
- Current HEAD at bow-in: `7e65039`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None — custom Ronin lineage domain; no L1 capability replaced. |
| Extension or replacement | Replacement of a *vendored* engine (`family-chart`) with a custom React layout; same data flow (shared DTO survives). |
| Why justified | family-chart is a genealogy engine on a promotion-lineage domain (no cohort concept, owns card DOM as HTML strings); ADR 0027 retires it for View A. |
| Risk if bypassed | None — no Dirstarter primitive exists for lineage; the engine swap is internal. |

Live docs checked during planning: not applicable — custom lineage UI.

### Graphify check

- Graph status: current (refreshed end of SESSION_0394); stats at bow-in: 12914 nodes, 24514 edges, 1752 communities, 2074 files tracked.
- Queries used (navigation, not proof):
  - `WATERSHED 60B lineage tree roster who is on the tree`
- Files selected from graph (then verified by direct read):
  - `apps/web/server/web/lineage/payloads.ts:351` (`lineageVisualGroupPayload` — `visualGroupId` survives the payload)
  - `apps/web/lib/lineage/to-lineage-visual.ts` (shared DTO — already carries `visualGroupId`)
  - `apps/web/lib/lineage/to-family-chart-data.ts` (the adapter that DROPS `visualGroupId`; dies with family-chart)
  - `apps/web/components/web/lineage/lineage-tree-board.tsx` + `lineage-tree-canvas.tsx` (cohort + measured-SVG
    connector overlay precedent — `connector-geometry.ts`, `:scope > [data-lineage-conn-col]`)
  - `apps/web/components/web/lineage/lineage-view-a-island.tsx` (current View A: `createChart`, `?focus=`
    recenter + ⋮ guard, `updateSecondaryLinks`, drawer + `StudentsCarousel`)
  - `apps/web/components/web/lineage/lineage-search-bar.tsx` (`onSelect(nodeId)` + `findLineageMatches` +
    `scrollMemberIntoView('#lineage-member-…')` — search wiring seam)
  - `apps/web/prisma/seed-baseline-lineage.ts:771` (`DIRTY_DOZEN_KEYS` / `ensureDirtyDozenGroup` — Dirty Dozen
    IS an existing `LineageVisualGroup`, already seeded for the rigan tree)
- Verification note: confirmed the Dirty Dozen cohort already exists as a seeded `LineageVisualGroup`
  (`groupType: PROMOTION_DATE`, 7 members) — so derived filter chips need NO schema. Connector lines are a
  reuse of the existing measured-SVG overlay, not a from-scratch build.

### Grill outcome

Petey grilled the operator across seven forks plus mid-grill corrections, reconciling the pasted Balkan
**Tree-List Layout** reference + the **Kajukenbo family tree** poster into one model. Resolved:

- **Q1 — Layout idiom:** Hybrid. Keep the family-chart **focal zoom/recenter**; the tree can be as wide as it
  needs (B); going *deeper* uses the nested-roster (A) features. Reconciled into the list-box model (Q5).
- **Q2 — Scope:** **A** — build the layout + focal-recenter + cut family-chart; **defer tier-gating** ("who's
  on the tree") — it needs schema/policy (petey-plan-0387 parking lot).
- **Q3 — "Appears twice" interaction:** **A (distinct)** — tree-node click = recenter; roster-avatar click =
  swap the drawer in place (no canvas reflow). Preserves focal zoom + the shipped recursive drawer.
- **Monorepo tier-gating insight (banked for the future session):** eligibility was a *role* concept
  (school-owner with students), NOT a payment tier — a lapsed subscription must never erase someone from the
  tree. Avoid the monorepo's dual `school_roles`/`membership_tier` divergence; derive from one source
  (Affiliation role + has-visual-children). `dirty_dozen_legend`/`isLegacyProfileType` = the honored-non-user
  escape hatch (our placeholders: Carlos Sr/Jr/Rigan).
- **Q5 — Node model (LOCKED):** A node = a card (cinematic header) + a **vertical list of children**; a child
  with their own students → **their own box** joined by a **connector line** (structural, from
  `primaryVisualParentMemberId`); a leaf child = a compact row. Click a node / a row-with-a-box → recenter;
  click a leaf row → drawer (belt-rank `StudentsCarousel`). This unifies the Balkan + Kajukenbo references and
  **redefines ADR 0027's "cohort bands" → "list-boxes + connector lines"** (ADR amendment required at close).
- **Q6 — Positioning:** **A (deterministic top-down flow)** — hierarchical walk + measured connector overlay
  (the Kajukenbo poster is top-down, not force-directed). No physics, no new dependency. Freeform/mind-map
  drag is a clean follow-on if wanted later.
- **Q7 — Grouping → tags pivot:** Drop the *mandatory* cohort sub-headings (org-chart hangover). Within a node,
  list children as a clean ordered vertical list. Add a **derived multi-select filter bar** —
  **Dirty Dozen** (existing `LineageVisualGroup` label) / **belt** (`colorHex`/`rankLabel`) / **school**
  (`schoolLabel`) / **promotion-year** (`awardedAt`) — all from existing data, **no schema**. Render grouping
  via a pluggable `facets(member)` so a real stored `LineageTag` many-to-many is a clean future swap (the only
  thing it buys is one person in two promotion cohorts at once — rarely needed). Real `LineageTag` schema =
  deferred session.
- **family-chart cut = LAST step, GATED** on Doug's green browser-proof. Partial → family-chart stays as
  fallback, cut moves to a follow-on. (SESSION_0394 honesty rule.)

### Drift logged

- D-DRIFT-0394-1 (explorer ignores cohort grouping) is the driver for this build — addressed here, not new.

## Petey plan

### Goal

Replace family-chart for View A with `LineageCohortTimeline` (Kajukenbo list-boxes + connector lines + focal
recenter + derived filter bar), reuse the shipped drawer roster + search, and gate-cut family-chart — landing green on `main`.

### Tasks

#### SESSION_0395_TASK_01 — Design spec the list-box layout + filter bar (Desi)

- **Agent:** Desi
- **What:** Turn the locked grill model into a buildable design spec for Cody (no production code).
- **Steps:**
  1. Node card anatomy: cinematic **header** (focal vs non-focal weight) + the **vertical child list**
     (compact row = avatar + name + belt-graphic). Define spacing/rhythm reusing the SESSION_0394 card system.
  2. Branch-out treatment: how a row-with-a-box reads vs a leaf row (affordance for "this one recenters"); the
     **connector-line** style between a row and its sprouted box (reuse `connector-geometry` stroke idiom).
  3. Deterministic top-down flow: ancestor spine above focal, child boxes below; mobile stacking (vertical
     lists are mobile-friendly — confirm the flow degrades cleanly).
  4. Derived **filter bar**: chip set (Dirty Dozen / belt / school / year), multi-select dim-vs-hide behaviour,
     empty-state, placement that doesn't crowd the canvas (heed the 0394 mobile top-overlay lesson).
  5. Flag any hardcoded color (belt = `Rank.colorHex`, brand = `--primary`); confirm Poppins seam reuse.
- **Done means:** prioritized (must/should/nice) punch-list returned; Cody has a clear spec.
- **Depends on:** nothing.

#### SESSION_0395_TASK_02 — Confirm/seed cohort + Dirty Dozen data for the rigan tree (Cody)

- **Agent:** Cody
- **What:** Verify `LineageVisualGroup` (incl. the Dirty Dozen group) populates for `rigan-machado-bjj-lineage`
  in the local seed; reseed if missing.
- **Steps:**
  1. Confirm `ensureDirtyDozenGroup` ran + the 7 members carry `visualGroupId`; verify `schoolLabel` /
     `awardedAt` resolve for the filter facets.
  2. If thin, extend the seed enough to prove the layout + filter bar (don't over-seed).
- **Done means:** the rigan tree loads with Dirty Dozen + belt + school + year facets derivable.
- **Depends on:** nothing (data-only; parallel to TASK_01).

#### SESSION_0395_TASK_03 — Build `LineageCohortTimeline` (Cody)

- **Agent:** Cody
- **What:** The new custom View A layout per Desi's spec.
- **Steps (MUST):**
  1. New `lineage-cohort-timeline.tsx` reading the shared DTO (`LineageVisualNode[]` + `LineageSecondaryLink[]`)
     + `visualGroups`; derive `children(parent)` + branch-out (`hasChildren(member)`) from
     `primaryVisualParentMemberId` (reuse the board's `descendantMemberIds` walk).
  2. Node = React `<LineageCard>` (cinematic header reusing SESSION_0394 styling) + a vertical child list
     (compact rows); each card `id="lineage-member-${memberId}"`.
  3. Branch-out: a child with `hasChildren` renders its own box; deterministic top-down flow placement.
  4. **Connector lines** between boxes via the measured-SVG overlay (reuse `connector-geometry.ts` +
     `svgRef.parentElement` / `:scope >` pattern); branch-out line = row → its box.
  5. **Focal-recenter** rebuilt: click a node / row-with-a-box → recenter, re-derive spine + lists,
     `?focus=<memberId>` URL sync, preserve the ⋮-menu click guard.
  6. Wire `LineageProfileDrawer` + `StudentsCarousel` unchanged (leaf row / open → belt-rank roster, recursive
     swap in place).
- **Steps (SHOULD):**
  7. Derived **filter bar** (`facets(member)` → Dirty Dozen / belt / school / year; multi-select).
  8. `LineageSearchBar` wired: `onSelect` → focal-recenter (cards' ids make `scrollMemberIntoView` work).
  9. Port the **secondary-link overlay** + **depth controls** onto the new layout.
- **Steps (NICE):**
  10. `motion/react` selection choreography (real React cards can now truly tween); belt-glow/mobile polish.
- **Done means:** typecheck / lint / format clean; View A renders the list-box tree with connector lines +
  focal-recenter + drawer; reduced-motion respected. (family-chart NOT yet cut.)
- **Depends on:** SESSION_0395_TASK_01.

#### SESSION_0395_TASK_04 — Verify: gates + fallow + Chrome browser proof (Doug)

- **Agent:** Doug
- **What:** Prove the new View A renders + is interactive in Chrome, and all static/test gates pass.
- **Steps:**
  1. `npx fallow audit` on touched files; oxc lint; `bun run typecheck`, `lint:check`, `format:check`,
     `bun run test`, `wiki:lint`. Fix any blocker before e2e.
  2. Chrome-verify View A (`?view=explore`, rigan tree): list-box nodes, vertical child lists, branch-out
     boxes + connector lines, focal-recenter (click → recenter + `?focus=` sync + ⋮ guard), drawer +
     `StudentsCarousel` recursive drill, filter chips (Dirty Dozen/belt/school/year), search-to-recenter,
     0 console errors. Confirm reduced-motion path + mobile.
- **Done means:** gates green (or blocker recorded with exact failing command); browser proof captured. **This
  is the gate for TASK_05.**
- **Depends on:** SESSION_0395_TASK_03.

#### SESSION_0395_TASK_05 — Gated family-chart cut (Cody)

- **Agent:** Cody
- **What:** Retire `family-chart` for View A — **only if** TASK_04 is green.
- **Steps:**
  1. Remove the family-chart import path from View A; delete `lib/lineage/family-chart/*`,
     `to-family-chart-data.ts` (+ its test), and the family-chart CSS once nothing imports them (follow the compiler).
  2. If TASK_04 only partially landed: **do NOT cut** — leave family-chart as fallback, record the residual,
     move the cut to a follow-on session.
- **Done means:** either family-chart fully removed + green, or explicitly left as fallback with the reason recorded.
- **Depends on:** SESSION_0395_TASK_04 (green).

#### SESSION_0395_TASK_06 — Close: ADR amend, Graphify, commit/push, CI/deploy (Petey)

- **Agent:** Petey
- **What:** Full bow-out; **amend ADR 0027** ("cohort bands" → "list-boxes + connector lines"; record the
  derived-filter / pluggable-`facets` decision + the deferred `LineageTag` schema); update Graphify before git
  hygiene; stage/commit/push to `main`; follow CI + Vercel deploy to green.
- **Steps:** Full closing.md (reflections, hostile close, evidence table, ADR check, memory sweep, document
  `LineageCohortTimeline` + any new component in the custom-component inventory); `GRAPHIFY_VIZ_NODE_LIMIT=10000
  graphify update .`; FS-0024 guard; commit (conventional) + push; monitor CI + deploy.
- **Done means:** SESSION_0395 closed-full, ADR 0027 amended, pushed, CI/deploy green.
- **Depends on:** SESSION_0395_TASK_05.

### Parallelism

TASK_01 (Desi spec) and TASK_02 (seed verify) are disjoint and run concurrently. TASK_03 gates on TASK_01.
TASK_04 → TASK_05 → TASK_06 are sequential at the end (TASK_05 is gated on a green TASK_04).

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0395_TASK_01 | Desi | List-box/filter-bar design spec + brand consistency. |
| SESSION_0395_TASK_02 | Cody | Seed/data verification (no design dependency). |
| SESSION_0395_TASK_03 | Cody | Build the custom layout. |
| SESSION_0395_TASK_04 | Doug | Gates + Chrome browser proof (the cut gate). |
| SESSION_0395_TASK_05 | Cody | Gated family-chart retirement. |
| SESSION_0395_TASK_06 | Petey | ADR amend, close, graphify, git, CI/deploy. |

### Open decisions

- None. All seven forks resolved in the grill (see Grill outcome).

### Risks

- **Branch-out connector lines across the canvas** (row → a separate box) are longer measured paths than the
  parent→children bands the overlay was built for — same technique, but the measurement may need work. It's
  MUST; if it fights, ship boxes-without-cross-lines and state it plainly rather than block.
- **Deterministic flow placement** of many list-boxes could overlap at high fan-out; cap depth / lean on the
  vertical lists (which collapse many people into few boxes) to keep it readable.
- **The gated cut**: if TASK_04 is only partially green, family-chart must stay — do not push a broken explorer.
- **Seed thinness**: the rigan tree may not have enough branch-out depth to exercise the layout; TASK_02 fixes
  minimally without over-seeding.

### Scope guard

- **No schema this session** — no `LineageTag` model, no tier-gating policy, no `Affiliation` changes. Filter
  chips derive from existing data only.
- **No blue school sub-tree nodes**, no recursion back-stack/breadcrumb polish, no squircle action rows (deferred).
- **No new package** — deterministic flow + reused connector overlay; no react-flow/d3-force.
- **View B (`lineage-tree-canvas.tsx`) untouched.** Do not cut family-chart until TASK_04 is green.
- Belt color is always `Rank.colorHex`; brand glow is the `--primary` token — never hardcode.

### Dirstarter implementation template

- **Docs read first:** SESSION_0394 § Next session, ADR 0027, lineage hub, WATERSHED 60B raw, petey-plan-0387.
- **Baseline pattern to extend:** the board's cohort path + measured-SVG connector overlay
  (`connector-geometry.ts`); the shared DTO (`to-lineage-visual.ts`); the shipped `StudentsCarousel` drawer +
  `LineageSearchBar`.
- **Custom delta:** a new React list-box layout (`LineageCohortTimeline`) replacing the vendored family-chart
  engine for View A; same data flow.
- **No-bypass proof:** lineage is Ronin-custom; no Dirstarter primitive exists for it (ADR 0027).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0395_TASK_01 | landed | Desi punch-list returned. HIGH: port resting/focal header to real React reusing the exact 0394 hierarchy (avatar→Poppins name→belt-bar→school) + `SOLID_PANEL`/`SOLID_PILL`, **delete `buildCardHtml`/`buildBeltSvg`/`escHtml`** (they only fed d3); build the in-card compact child row off `lineage-compact-child-list.tsx` restyled dark; **branch affordance = descendant-count + chevron + hover-lift** (the load-bearing "this recenters vs opens drawer" cue, reuse `descendantCountById`); reuse `LineageConnectorLayer` + `connector-geometry.ts` + the `:scope > [data-lineage-conn-col]` measurement verbatim for box-to-box lines; preserve the ⋮ click-guard + `?focus=` sync. MEDIUM: deterministic top-down flow + auto-center focal on load; `Badge`-based filter chips that **dim non-matches (not hide)** off existing DTO fields; `motion/react` focal tween (now buildable in real React) + reduced-motion; mobile vertical-stack + depth controls on bottom row. LOW: shimmer on focal header only, connector-to-parent highlight on recenter, belt-glow luminance clamp, empty filter state. Brand law: belt=`Rank.colorHex` via `BeltSwatch`, brand=`--primary`, gold confined to secondary-link legend, no `backdrop-blur`. |
| SESSION_0395_TASK_02 | landed | Confirmed the rigan tree loads with the seeded **Dirty Dozen** `LineageVisualGroup` + two **Coral Belt Ceremony** cohorts; belt / school / `awardedAt` resolve for facets. No reseed needed. |
| SESSION_0395_TASK_03 | landed | Built `lineage-cohort-timeline.tsx` (timeline-tree of list-boxes: cinematic header + inline leaf-child rows; branch children sprout own boxes; deterministic top-down flow; measured-SVG **dated** connectors; focal-recenter + `?focus=` sync + ⋮ guard; drawer/StudentsCarousel reuse). Extended DTO (`promotionDate` + `visualGroupLabel`); added shared `lib/lineage/belt-color.ts`. Timeline reframe: promotion provenance ("Promoted by X · date") on cards, year markers on connectors, chronological order, filter chips (group/belt/school/year). Rewrote the island to render it + the derived filter bar; fixed the hero squeeze (2-col → `xl`, inner stack → `2xl`, badge `nowrap`). |
| SESSION_0395_TASK_04 | landed | Gates green: typecheck 0, oxfmt clean, oxlint 0 errors (touched files clean; repo warnings pre-existing in unrelated `*-form.tsx`). Chrome proof (localhost, rigan tree, `?view=explore`): timeline-tree renders — provenance lines, dated connectors (1955/2012/2020/2024…), chronological student rows, Dirty Dozen + ceremony + belt + school + year chips, focal-recenter + URL sync, hero clean; **0 app console errors** (7 "message channel closed" = Chrome-extension artifact). |
| SESSION_0395_TASK_05 | landed | Gated cut (after green proof): deleted `lib/lineage/family-chart/*`, `to-family-chart-data.ts` (+ test), dead `lineage-family-chart-smoke.tsx`, `family-chart.css`; moved `.belt-shimmer` keyframes → `app/styles.css`; fixed stale comments. View B untouched. |
| SESSION_0395_TASK_06 | landed | ADR 0027 amended (bands → timeline-tree of list-boxes + dated connectors + timeline-USP reframe + derived facets); session record; graphify refresh; single commit + push to `main`; CI/deploy follow-through. |

## What landed

- **`LineageCohortTimeline` replaces family-chart for View A** — a Kajukenbo-style **timeline-tree of
  list-boxes**: a node = a cinematic card (avatar / Poppins name / belt-graphic) + a vertical list of its
  children; a child with their own students sprouts **their own box** joined by a measured-SVG **connector
  line**; a leaf child stays a compact row. Deterministic top-down flow, native-scroll canvas, focal-recenter
  (`?focus=` URL sync + ⋮-menu click guard), drawer + `StudentsCarousel` reused unchanged.
- **Timeline reframe (operator USP insight) made concrete** — promotion provenance is first-class:
  "Promoted by {teacher} · {date}" on every card, **promotion-year markers on the connector rails**, children
  ordered **chronologically** (reading down a branch = forward in time).
- **Derived multi-select filter bar (no schema)** — chips from existing data: cohort **group** (the Dirty
  Dozen + two Coral Belt Ceremony cohorts), **belt**, **school**, **promotion year** (1955…2026); OR-match,
  dims non-matches (preserves the spine). Pluggable facet model → future `LineageTag` swap is clean.
- **DTO extended** (`to-lineage-visual.ts`): `promotionDate` (from `selectedRankAward.awardedAt`) +
  `visualGroupLabel` (resolved from `LineageVisualGroup`s passed through from the route). Shared
  `lib/lineage/belt-color.ts` extracted (rgba / luminance / `BBL`) so the card + focus panel share one source.
- **family-chart fully retired for View A** — deleted the vendored engine, the `to-family-chart-data` adapter
  (+ test), the dead smoke component, and `family-chart.css`; `.belt-shimmer` moved to `app/styles.css`.
- **Hero squeeze fixed** — the side focus-panel split moved `lg` → `xl`, the inner text/metrics split → `2xl`,
  and brand badges set `whitespace-nowrap`, so the intro no longer wraps one-word-per-line in the narrow column.

## Decisions resolved

- The seven grill forks (Bow-in § Grill outcome): hybrid → **timeline-tree of list-boxes**; scope **A** (defer
  tier-gating); distinct interactions (node=recenter, roster-avatar=drawer-swap); promotion-date on canvas +
  belt-rank in drawer; node model locked; deterministic top-down flow (no physics/dep); gated family-chart cut.
- **Mid-session reframe (operator):** the lineage is fundamentally a **TIMELINE** — provable promotion
  provenance (by whom, *when*) is the project USP, not "org chart / family tree." Wove time in as: date-first
  card provenance, dated connectors, chronological order, year filter. The three timeline references
  (react-vertical-timeline, flowbite, shadcn-timeline) are all **linear** (can't show the branching tree), so
  we **adopted the timeline vocabulary into the tree** with **no new dependency** (shadcn "own the code" way).
- **Tags → derived facets now, stored `LineageTag` later** — multi-dimensional filtering shipped from existing
  data (no schema); the one thing a real tag model buys (one person in two promotion cohorts at once) is deferred.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/web/lineage/lineage-cohort-timeline.tsx` | **New** — the timeline-tree layout (list-boxes, branch-out, dated connectors, provenance, focal-recenter, chronological order). |
| `apps/web/lib/lineage/belt-color.ts` | **New** — shared `hexToRgb`/`rgba`/`relativeLuminance`/`BBL` (extracted from the island). |
| `apps/web/components/web/lineage/lineage-view-a-island.tsx` | Rewrote: removed family-chart; renders `LineageCohortTimeline`; React focus/menu/depth state; derived filter bar (group/belt/school/year); hero squeeze fix. |
| `apps/web/lib/lineage/to-lineage-visual.ts` | DTO gained `promotionDate` + `visualGroupLabel`; accepts `visualGroups` to resolve labels. |
| `apps/web/app/(web)/lineage/[treeSlug]/page.tsx` | Pass `visualGroups` to the island; updated the stale font-seam comment. |
| `apps/web/app/styles.css` | Moved `.belt-shimmer` keyframes + reduced-motion block here (survive the family-chart.css cut). |
| `apps/web/components/common/belt-swatch.tsx` | Comment: `.belt-shimmer` now lives in `app/styles.css`. |
| `apps/web/lib/lineage/family-chart/**`, `to-family-chart-data.ts` (+ test), `components/web/lineage/lineage-family-chart-smoke.tsx`, `lib/lineage/family-chart/styles/family-chart.css` | **Deleted** — family-chart retired for View A (ADR 0027 cutover). |
| `docs/architecture/decisions/0027-lineage-view-a-custom-cohort-timeline.md` | Amended: timeline-tree of list-boxes + dated connectors + timeline-USP reframe + derived facets + cut record. |
| `docs/sprints/SESSION_0395.md` | Session record. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` | PASS (0 errors). |
| `bun run format:check` (oxfmt) | PASS. |
| `bun run lint:check` (oxlint) | PASS — 0 errors (touched files clean; remaining warnings pre-existing in unrelated `*-form.tsx`). |
| `bun run test` | PASS: **593 pass / 0 fail** (1852 assertions, 102 files). Down 8 from 0394's 601 = the deleted `to-family-chart-data.test.ts`. |
| `bun run wiki:lint` | PASS — 0 violations (675 markdown files). |
| Browser proof (localhost / Baseline brand, `rigan-machado-bjj-lineage`, `?view=explore`, Claude-in-Chrome) | PASS: timeline-tree renders — list-boxes with **"Promoted by … · date"** provenance (Rigan←Carlos Jr·Apr 2026, Bob Bass + Bill Hosken ←Rigan), **dated connector rails** (1955/2012/2020/2024), **chronological** student rows with years, branch-out boxes with own rosters; filter chips = **Dirty Dozen** + 2× Coral Belt Ceremony + belts + school + years (1955…2026); focal-recenter syncs `?focus=` + focus panel; hero reads clean; **0 app console errors** (7 "message channel closed" = Chrome-extension artifact, not the page). |

## Open decisions / blockers

- **Deferred SHOULD/NICE (carried forward):** secondary-link **cross-line overlay** on the new layout (the
  legend shows the count, lines not drawn yet); `motion/react` selection choreography (now buildable on real
  React cards). Neither blocks.
- **Deferred (needs schema/policy):** tier-gating "who's on the tree"; real stored `LineageTag` many-to-many
  (multi-cohort membership). Blue school sub-tree nodes + recursion back-stack/breadcrumb also parked.
- **Unit tests still send live Resend emails** to `@test.local` (pre-existing; see [[unit-tests-send-real-resend-emails]]).

## Next session

### Goal

Finish the View A SHOULD items now that the timeline-tree spine is proven: **draw the secondary-link
cross-lines** on the custom layout (reuse the measured-overlay; the DTO already carries `secondaryLinks`) and
add the **`motion/react` focal selection choreography** (real React cards can finally tween). Optionally start
the **`LineageTag` schema** session (real multi-cohort tags + admin assignment) if the operator prioritises it.

### First task

Port the secondary-link overlay to `lineage-cohort-timeline.tsx`: render a `pointer-events-none` SVG layer over
the scroll canvas, measure the `#lineage-member-…` card rects for each `LineageSecondaryLink`
(`fromMemberId`/`toMemberId`), and draw the dashed gold cross-training links (re-add the legend toggle). Then add
the focal scale/recede tween with a `useReducedMotion` fallback. Read ADR 0027's amendment first.

## Review log

### SESSION_0395_REVIEW_01 — Timeline-tree replaces family-chart; provenance USP made visible

- **Reviewed tasks:** SESSION_0395_TASK_01–06.
- **Dirstarter docs check:** not applicable — custom Ronin lineage UI; no L1 baseline capability touched.
- **Verdict:** The ADR 0027 build landed and went *beyond* the brief in the right direction. The headline gap
  from 0394 (flat single-row, genealogy-engine layout) is gone — View A is now a custom React timeline-tree of
  list-boxes with branch-out, dated connectors, and chronological order, and family-chart is fully retired
  (engine + adapter + dead smoke + CSS), the vendored-tax finally paid off. The mid-session operator reframe
  ("this is a TIMELINE; provenance is the USP") was absorbed without thrashing the working tree: time became
  date-first card provenance, year-stamped rails, chronological ordering, and a year filter — and the three
  cited timeline libraries were correctly judged *linear* and **not** adopted (no new dep). The Dirty Dozen /
  ceremony / belt / school / year filter bar ships from existing data (no schema), with a pluggable facet model
  teeing up a clean `LineageTag` swap. Browser-proven green with 0 app console errors.
- **Score:** 8.5/10 — −1.5 because two SHOULD items (secondary-link cross-lines, selection choreography) are
  deferred and the in-canvas member search wasn't wired this session (the cards carry the `#lineage-member-…`
  ids for it, so it's teed up). Correctly scoped, honestly stated.
- **Follow-up:** SESSION_0396 — secondary-link overlay + focal choreography (+ optional `LineageTag` schema).

## Hostile close review

- **Giddy:** Pass. No schema/migration/auth/payment touched — a presentational engine swap + a DTO read-model
  extension (two derived fields) + a shared color util + dead-vendored-code deletion. Brand law upheld (belt =
  `Rank.colorHex` via `BeltSwatch`; brand = `--primary`; gold confined to the legend; 0 `backdrop-blur`). The
  family-chart deletions are dead vendored code; View B (`lineage-tree-canvas`) untouched; `.belt-shimmer`
  preserved into `styles.css` so the cut orphans nothing.
- **Doug:** Pass with live proof. Static gates green (typecheck 0, oxfmt clean, oxlint 0 errors). Browser proof
  is real Claude-in-Chrome evidence: measured provenance lines, dated rails, chronological rows, the full filter
  chip set, focal-recenter URL sync, and the hero-squeeze before/after — 0 app console errors (the 7 exceptions
  are an extension message-channel artifact, not the page). Gated cut honoured: deletion happened only after the
  green proof.
- **Desi:** Pass. The timeline-tree reads as provenance, not org-chart slop; provenance line + dated rails + the
  belt-graphic + Poppins carry the brand. Honest residual: with `progeny=All` deep trees get tall (native
  scroll + depth controls are the lever), and the secondary-link cross-lines aren't drawn yet.
- **Kaizen aggregate:** 8.5/10 — a structural win (engine retired, USP made visible) shipped green and
  browser-proven, with the remaining polish correctly scoped to the next session.

## ADR / ubiquitous-language check

- ADR update **required and made** — **ADR 0027 amended** with an "Amendment — SESSION_0395 build" section:
  the layout is a **timeline-tree of list-boxes + dated connectors** (not horizontal "cohort bands"); the
  **timeline-USP reframe** (promotion provenance is the differentiator); **grouping → derived filtering** with a
  pluggable facet model; and the **family-chart cut record**. Status line updated to point at the amendment.
- Ubiquitous language — no new domain terms (`LineageCohortTimeline` / `belt-color` are impl names; `facets` is
  presentational; `promotionDate` / `LineageVisualGroup` / cohort are existing terms). "Cohort" still holds —
  promotion-date cohorts remain the model; they're now surfaced as filters rather than forced sub-headings.

## Reflections

- **The operator's eye reframed the whole thing mid-build — and it was right.** Two sessions of "family tree /
  org chart" framing missed that the product's USP is *provable promotion provenance over time*. Naming it a
  **timeline** turned a layout argument into a data argument: date-first cards, year-stamped rails, chronological
  order. The lesson from 0394 repeated and held — surface visual proof early; the operator's eye verifies "the
  right shape," gates only verify "correct/clean."
- **Reframes don't have to mean rewrites.** The instinct on "it's a timeline" could have been a from-scratch
  pivot to a vertical-timeline library. Grounding in the three references showed they're all *linear* and can't
  carry the branching lineage — so the move was to adopt the *vocabulary* into the working tree (no new dep,
  shadcn "own the code" philosophy). Reading the sources beat guessing (the [[fresh-chat-and-read-provided-sources]] lesson).
- **The cheapest data is the data you already have.** Dirty Dozen, ceremony cohorts, belts, schools, and
  promotion years were all already on the wire (`LineageVisualGroup` + `awardedAt`) — the "tags" ask resolved to
  two DTO fields + derived facets, **zero schema**. Reaching for a `LineageTag` model first would have been a
  schema session for a filter bar.
- **Pre-existing chrome bugs surface when the stage changes.** The hero one-word-per-line wrap wasn't my
  regression (identical markup to 0394) — swapping the canvas just exposed how the 2-col hero starves its text
  column at the lineage page's ~740px content width. Fixing the breakpoints (`lg`→`xl`, inner `2xl`) was the
  right call rather than blaming the new component.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0395 stamped `last_agent: claude-session-0395`; ADR 0027 `updated: 2026-06-16`; no other doc frontmatter needed changes. |
| Backlinks/index sweep | `wiki/index.md` SESSION_0395 row added; `custom-component-inventory.md` documents `LineageCohortTimeline` + the retired family-chart; ADR 0027 status line points at the amendment. |
| Wiki lint | `bun run wiki:lint` PASS — 0 violations (675 files). |
| Kaizen reflection | Reflections section present (4 notes). |
| Hostile close review | SESSION_0395_REVIEW_01 + Giddy/Doug/Desi hostile close present; live Chrome proof captured. |
| Review & Recommend | Next session goal written (secondary-link cross-lines + focal choreography; optional `LineageTag` schema). |
| Memory sweep | Updated [[lineage-tree-pivot-donatso]] (timeline reframe + family-chart retirement + ADR 0027) + its MEMORY.md index line. |
| Next session unblock check | Unblocked — the secondary-link overlay first task is doable locally (DTO already carries `secondaryLinks`); no user input required. |
| Git hygiene | Branch `main`; FS-0024 guard run; single push — hash reported at bow-out / see git log. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` run before the close commit — incremental rebuild: 65 nodes / 713 edges changed, 1762 communities; `.graphify/graph_report.md` refreshed. |
