---
title: "SESSION 0405 — Cinematic explorer mobile UX overhaul (badge removal · slim header · dropdown filter bar · canvas-overlay token pass)"
slug: session-0405
type: session--implement
status: closed
created: 2026-06-17
updated: 2026-06-17
last_agent: claude-session-0405
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0400.md
  - docs/agents/desi.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0405 — Cinematic explorer mobile UX overhaul (badge removal · slim header · dropdown filter bar · canvas-overlay token pass)

> **Unattended cloud run.** Executed by claude-session-0405 in an isolated remote container (no Postgres, no
> browser). Per the SESSION_0399/0400 pattern, the static gates (typecheck / oxlint / oxfmt / wiki-lint) + the
> pure unit tests (the extracted filter-match helper) are the in-sandbox proof; CI (full suite + Playwright) on
> the PR is the authoritative behavioural gate. Mobile render proof happens on the operator's device/browser.

## Date

2026-06-17

## Operator

Brian + claude-session-0405 (unattended cloud run)

## Goal

Mobile-first UX overhaul of the cinematic lineage explorer (`lineage-view-a-island.tsx`). Operator-directed
pivot from SESSION_0400's "Next session" (which was operator-machine verification of the rank filter + a
choice between continuing D-023 or BBL-DISCOVER-002). The explorer's top region reads as cluttered and
not mobile-native (see operator screenshot): an "AI-slop" eyebrow badge, a heavy heading/description block,
and one flat wrapping row of pills mixing four filter dimensions. This session: remove the badge, slim the
mobile header to a YouTube-app feel, replace the flat pill row with a clean Apple-style dropdown filter bar
(Group / Belt / School / Year), and align the in-canvas overlay chrome to brand tokens + spacing rhythm —
behaviour-preserving except a deliberate, tested filter-semantics refinement (AND-across-dimension /
OR-within-dimension), extracted to a pure helper so it is unit-verifiable in-sandbox.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0400.md`
- Carryover: SESSION_0400 landed the D-023 shared field primitives + the BBL-DISCOVER rank filter (PR #73,
  merged to `main` at `5fcd4a9`). Its `Next session` named operator-machine verification + a D-023 / BBL-002
  continuation. **Operator pivoted** at this bow-in to a mobile-UX overhaul of the cinematic explorer — a
  pure-presentation lane on `lineage-view-a-island.tsx`, disjoint from the merged work.

### Branch and worktree

- Branch: `claude/cinematic-explorer-mobile-y5kplx` (off `main` at `5fcd4a9`)
- Worktree: remote cloud container clone
- Status at bow-in: clean
- Current HEAD at bow-in: `5fcd4a9` (Merge PR #73 — SESSION_0400 D-023 + rank filter)

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | **UI primitives only** — `components/common/{popover,select,dropdown-menu,sheet}` composed into a new filter bar; no Prisma/storage/payments/auth/media touched. Pure client presentation over already-derived DTO data (`toLineageVisual`). |
| Extension or replacement | **Extension** — compose existing L1 overlay/menu primitives into the filter bar + slimmed header; no primitive replaced, no new design system introduced. |
| Why justified | The current flat-pill filter row is hand-rolled `<button>`s (readability/usability problem on mobile); folding onto dropdown primitives is exactly the FS-0001 "reuse the primitive, don't hand-roll the filter UI" lesson applied. |
| Risk if bypassed | Continued mobile clutter + a hand-rolled filter surface that drifts from the directory's `Select`-based filter language. |

Live docs checked during planning: SESSION_0400 (carryover), `docs/agents/desi.md`, `belt-color.ts` +
`fonts.ts` (brand-token canon), `drift-register.md` (D-DRIFT-0394-1), `failed-steps-log.md` (FS-0001/FS-0008).
No L1 storage/payments/media alignment URLs in scope (presentation-only).

### Grill outcome

3 forks resolved (operator-answered at bow-in via Petey grill):

- **Filter pattern → all dropdowns ("most Apple").** Replace the flat wrapping pill row with a compact bar of
  dropdown menus, one per dimension (Group / Belt / School / Year). No chip carousel. Rationale: lowest visual
  noise, scales to long belt/year/school lists, matches the directory's `Select`-based filter language.
- **Mobile header → slim it down (YouTube-app feel).** Drop the large heading + description paragraph on
  mobile; keep a compact title row + a thin inline metric strip (Members · Verified · Roots); pull the filter
  bar directly under the app nav. Desktop keeps the richer header. The "Black Belt Legacy Explorer" eyebrow
  badge is **removed entirely** (operator: "AI slop giveaway") — no replacement eyebrow.
- **Scope → top + filters + canvas overlays.** Also restyle/reposition the in-canvas depth steppers,
  "Click to recenter" hint, and legend for mobile spacing rhythm + token consistency.

- **Filter semantics (Petey call, flagged for Desi/Doug).** Grouped per-dimension dropdowns imply
  **AND across dimensions, OR within a dimension** (e.g. "Belt: Red **and** Year: 2024"), which is the
  expected mental model for grouped controls and a usability improvement over the current "OR across
  everything" flat-pill behaviour. This is a deliberate behaviour refinement, not a regression; it is
  extracted to a pure helper and unit-tested so the change is provable in-sandbox.

### Drift logged

- D-DRIFT-0394-1 (cinematic explorer cohort grouping) reviewed — **not in scope**; it concerns the legacy
  `to-family-chart-data.ts` engine, superseded by the current `LineageCohortTimeline` + `toLineageVisual`
  path. No new drift introduced by this presentation lane.

## Petey plan

### Goal

Land a behaviour-preserving (except the tested filter-semantics refinement) mobile-UX overhaul of
`lineage-view-a-island.tsx`: badge removed, slim mobile header + metric strip, an Apple-style dropdown filter
bar reusing L1 primitives, and token/spacing-aligned canvas overlays — proven by static gates + a new pure
filter-match unit test; CI + the operator's device are the behavioural gate.

### Tasks

#### SESSION_0405_TASK_01 — Design direction pass (Desi)

- **Agent:** Desi
- **What:** Produce the design spec + prioritized fix list for Cody covering the four sub-surfaces (slim mobile
  header + metric strip, dropdown filter bar, badge removal, canvas-overlay token/spacing pass).
- **Steps:**
  1. Confirm the filter-bar primitive choice: multi-select `Popover` + checkbox rows vs single-value `Select`
     (the engine is multi-select today — pick the faithful primitive and cite it).
  2. Specify the slim mobile header: what stays/hides at each breakpoint, the metric-strip shape, type ramp
     (Poppins heading / Inter body per `fonts.ts`), spacing rhythm.
  3. Specify belt-swatch usage inside the belt dropdown + active-count affordance per dropdown + the Clear
     control; confirm brand-token discipline (`Rank.colorHex` for belts, no brand-red literal, gold stays
     legend-only per `belt-color.ts`).
  4. Specify canvas-overlay (depth steppers, recenter hint, legend) token + spacing + mobile-placement fixes.
- **Done means:** a prioritized fix list (High → Low) recorded in the Review log, with primitive citations.
- **Depends on:** nothing.

#### SESSION_0405_TASK_02 — Extract + unit-test the filter-match engine (Cody)

- **Agent:** Cody
- **What:** Extract the node↔facet matching out of `lineage-view-a-island.tsx` into a pure helper
  (`lib/lineage/filter-facets.ts`) with **AND-across-dimension / OR-within-dimension** semantics, and unit-test
  it.
- **Steps:** Move `FilterDimension`/`FilterFacet`/`nodeMatchesFacet` + a `matchMemberIds(nodes, activeFacets)`
  function into the lib; group active facets by dimension, require a match in every active dimension (AND),
  any value within a dimension (OR); empty selection ⇒ `null` (all lit). Add `filter-facets.test.ts` covering:
  empty ⇒ null, single dimension OR, cross-dimension AND, belt+year intersection, no-match ⇒ empty set.
- **Done means:** `bun test filter-facets` green; helper is pure (no React import).
- **Depends on:** nothing (engine extraction is independent of the visual spec).

#### SESSION_0405_TASK_03 — Dropdown filter bar (Cody)

- **Agent:** Cody
- **What:** Replace the flat pill row (`lineage-view-a-island.tsx` ~L468–507) with a dropdown filter bar — one
  multi-select dropdown per dimension (Group / Belt / School / Year), per Desi's spec, consuming the TASK_02
  helper.
- **Steps:** Build per-dimension dropdowns from the existing `facets` memo grouped by dimension; reuse the L1
  `Popover`/`dropdown-menu` primitives (not hand-rolled — FS-0001); belt rows show `BeltSwatch`; each trigger
  shows an active-count badge; a `Clear` control resets `activeFilters`. Keep the `activeFilters` `Set` state
  shape; route matching through `matchMemberIds`. Dropdowns only render for dimensions that have ≥1 facet.
- **Done means:** flat pill row gone; dropdown bar filters the canvas (dim-not-hide preserved); static gates
  green.
- **Depends on:** SESSION_0405_TASK_01, SESSION_0405_TASK_02.

#### SESSION_0405_TASK_04 — Slim mobile header + remove badge + metric strip (Cody)

- **Agent:** Cody
- **What:** Remove the "Black Belt Legacy Explorer" badge; slim the header for mobile (compact title + thin
  metric strip), keep the richer desktop header, per Desi's spec.
- **Steps:** Delete the `SparklesIcon` eyebrow badge block (~L378–381) and drop the now-unused import; make the
  metric block a thin inline strip on mobile (Members · Verified · Roots) while keeping the `MetricPill` grid on
  desktop; ensure heading/description stay desktop-only (already `hidden … sm:block`) and the title row reads as
  a mobile app header. Preserve the focus panel + "View profile" affordance unchanged.
- **Done means:** badge gone, no dead imports; mobile header is compact; desktop unchanged; static gates green.
- **Depends on:** SESSION_0405_TASK_01.

#### SESSION_0405_TASK_05 — Canvas-overlay token + spacing + mobile pass (Cody)

- **Agent:** Cody
- **What:** Align the in-canvas overlays (depth steppers, recenter hint, legend, copied toast) to brand tokens
  + spacing rhythm and tidy mobile placement, per Desi's spec.
- **Steps:** Normalize overlay padding/gap/radius to the shared `SOLID_PILL`/spacing scale; confirm no
  hardcoded brand-red (belts use `colorHex`, gold stays legend-only); verify mobile placement doesn't collide
  (recenter hint top-left, depth steppers bottom-right on mobile already). No behaviour change to depth/focus.
- **Done means:** overlays consistent + uncluttered on mobile; static gates green.
- **Depends on:** SESSION_0405_TASK_01.

#### SESSION_0405_TASK_06 — Gates + draft PR (Doug)

- **Agent:** Doug
- **What:** Run the static gates + the new unit test; open the draft PR.
- **Steps:** `bun run typecheck`, `lint:check`, `format:check`, `bun test filter-facets`, `wiki:lint`,
  `npx fallow audit`; `oxfmt` touched files; open a draft PR. No DB/browser in sandbox — CI + operator device
  are the behavioural gate.
- **Done means:** gates recorded; PR opened.
- **Depends on:** all prior tasks.

#### SESSION_0405_TASK_07 — Bow-out (Petey)

- **Agent:** Petey
- **What:** Run the closing ritual (`docs/rituals/closing.md`) — hostile close review, evidence table, finding
  router, Review & Recommend, push.
- **Done means:** SESSION file closed; next session staged.
- **Depends on:** SESSION_0405_TASK_06.

### Parallelism

TASK_02 (engine extraction) is independent of the visual spec and runs alongside TASK_01 (Desi). TASK_03/04/05
all edit `lineage-view-a-island.tsx`, so they run **sequentially inline** (single file, one coherent change
set — not sub-agent fan-out) after the spec + engine land. TASK_06/07 gate at the end.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0405_TASK_01 | Desi | Design direction + primitive citations before any code. |
| SESSION_0405_TASK_02 | Cody | Pure engine extraction + unit tests (in-sandbox behavioural proof). |
| SESSION_0405_TASK_03 | Cody | Dropdown filter bar reusing L1 primitives. |
| SESSION_0405_TASK_04 | Cody | Slim header + badge removal. |
| SESSION_0405_TASK_05 | Cody | Canvas-overlay token/spacing pass. |
| SESSION_0405_TASK_06 | Doug | Gates + PR. |
| SESSION_0405_TASK_07 | Petey | Bow-out / closing ritual. |

### Open decisions

- **None requiring further sign-off.** Filter pattern, mobile-header treatment, and scope answered at bow-in;
  filter-semantics refinement is a Petey call (tested, reversible, client-only).

### Risks

- **Filter-semantics change (OR-all → AND-across/OR-within) is a behaviour change.** Mitigated: extracted to a
  pure helper with unit tests; it is the expected model for grouped dropdowns; reversible in one file.
- **`lineage-view-a-island.tsx` is a large (693-line) client component touched by three tasks.** Mitigated:
  sequential inline edits, static gates between, CI Playwright (`/lineage/[treeSlug]`) catches regressions.
- **No mobile browser in sandbox.** Responsive proof deferred to CI + the operator's device.

### Scope guard

- **No schema, action, query, or DTO change.** Pure client presentation over existing `toLineageVisual` data.
- ~~Do **not** touch the canvas engine (`LineageCohortTimeline`, …)~~ **Amended mid-session:** the operator
  clarified the original screenshot shows a **width** problem — the focal card is cut off the right of the
  mobile viewport. Scope expanded (operator-directed) to a minimal width fix in `lineage-cohort-timeline.tsx`
  (responsive card width + scroll padding only). Still **do not** touch the profile drawer, card menu actions,
  connector measurement, or focus/URL-sync logic; the canvas **height** (`clamp(560px,78vh,880px)`) is left
  unchanged (operator: "not height issue but width issue").
- Do **not** add a chip carousel (operator chose all-dropdowns).
- Do **not** re-introduce gold as a brand accent or any brand-red belt literal (`belt-color.ts` canon).
- Adjacent ideas (e.g. persisting filters to URL params, cohort-grouping drift D-DRIFT-0394-1) go under
  `Open decisions / blockers`, not inline.

### Dirstarter implementation template

- **Docs read first:** not applicable (presentation-only; no L1 storage/payments/media/auth surface). Brand
  canon read instead: `lib/lineage/belt-color.ts`, `lib/fonts.ts`.
- **Baseline pattern to extend:** the directory filter language (`components/web/directory/directory-filters.tsx`
  → `Select`-based dropdowns) + L1 `Popover`/`dropdown-menu`/`select` primitives.
- **Custom delta:** a multi-select, swatch-aware dropdown filter bar for the cinematic explorer + a slim
  mobile header; a pure, tested filter-match helper.
- **No-bypass proof:** composes existing overlay/menu primitives rather than hand-rolling — the explicit
  correction for FS-0001 (directory-filters built from scratch).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0405_TASK_01 | landed | Desi design-direction pass (see Review log). Filter primitive corrected at preflight: `DropdownMenu` (base-ui Menu, `closeOnClick=false` checkbox items) not `Popover` — checkbox items need Menu context. |
| SESSION_0405_TASK_02 | landed | `lib/lineage/filter-facets.ts` — pure `deriveFacets`/`matchMemberIds`/`nodeMatchesFacet`/`facetKey` with AND-across/OR-within; `filter-facets.test.ts` (11 cases). |
| SESSION_0405_TASK_03 | landed | Flat pill row → four `DropdownMenu` + `DropdownMenuCheckboxItem` dropdowns (Group/Belt/School/Year), count-badge triggers, belt swatches, per-dimension + global "Clear all". `Stack` layout, 2×2 on mobile. |
| SESSION_0405_TASK_04 | landed | Badge + `SparklesIcon` removed; `sm:hidden` slim title ("Living lineage") + thin `MetricStat` strip; desktop heading/lede + `MetricPill` grid preserved; mobile panel padding `p-3`, header gap `mb-3`. |
| SESSION_0405_TASK_05 | landed | Overlays: "Click"→"Tap to recenter", apologetic helper `hidden sm:inline`, copied toast lifted above mobile steppers. |
| SESSION_0405_TASK_08 | landed | **Operator-directed scope add (width/viewport fix):** `lineage-cohort-timeline.tsx` focal/box card `w-72` → `w-[min(18rem,calc(100vw-4.5rem))] sm:w-72` and scroll padding `px-10 py-12` → `px-4 py-8 sm:…` so the focal card fits the mobile viewport width (was cut off on the right). |
| SESSION_0405_TASK_06 | landed | Gates green (test 11/0 · typecheck 0 · lint/format exit 0 · wiki:lint 0 · fallow exit 0). Draft PR #75 opened. |
| SESSION_0405_TASK_07 | landed | Bow-out / closing ritual complete (hostile review, evidence, R&R, index backfill). |

## What landed

- **Eyebrow badge removed.** The "✨ Black Belt Legacy Explorer" badge + its `SparklesIcon` import are gone
  (operator: "AI slop giveaway"). The "Focal lineage view" mode badge stays.
- **Slim mobile header (YouTube-app feel).** On `<sm` the heavy heading/lede is replaced by a compact
  "Living lineage" title (BBL Poppins) + a thin inline `MetricStat` strip (Members · Verified · Roots);
  `sm+` keeps the full heading, lede, and `MetricPill` grid. Panel padding tightens to `p-3` and the
  header→filter gap to `mb-3` on mobile, pulling the filter bar up under the nav.
- **Apple-style dropdown filter bar.** The flat wrapping pill row is replaced by four labeled multi-select
  dropdowns — Group / Belt / School / Year — composing the L1 `DropdownMenu` + `DropdownMenuCheckboxItem`
  primitives (checkbox items keep the menu open for multi-toggle). Each trigger shows an active-count badge;
  belt rows render `BeltSwatch`; each dropdown has a per-dimension "Clear <dimension>" and the bar has a
  global "Clear all". On mobile the four triggers wrap to a tidy 2×2 (`max-sm:flex-1 basis-[calc(50%-…)]`).
- **Filter semantics refined + extracted.** Matching moved to a pure, unit-tested helper
  `lib/lineage/filter-facets.ts` (`deriveFacets` / `matchMemberIds` / `nodeMatchesFacet` / `facetKey`), now
  **AND-across-dimension / OR-within-dimension** — the expected model for grouped dropdowns (was "OR across
  everything"). Dim-not-hide behaviour preserved.
- **Canvas-overlay polish.** "Click to recenter" → "Tap to recenter"; the apologetic "Best on desktop…"
  sentence is `hidden sm:inline`; the copied toast lifts above the bottom-right depth steppers on mobile.
- **Width/viewport fix (operator-directed scope add).** The focal/box card was a fixed `w-72` (288px) with
  `px-10` scroll padding — on a ~375px phone the card overflowed and was cut off the right edge (the
  operator's actual complaint). Card width is now `w-[min(18rem,calc(100vw-4.5rem))] sm:w-72` and scroll
  padding `px-4 py-8 sm:px-10 sm:py-12`, so the focal card fits the mobile viewport and the `inline:center`
  auto-scroll lands it in view. Canvas **height** left unchanged (operator: width, not height).

## Decisions resolved

- Filter UI = all dropdowns (no chip carousel).
- Mobile header = slimmed (badge removed, thin metric strip), desktop richer.
- Scope = top + filters + canvas overlays.
- Filter semantics refined to AND-across-dimension / OR-within-dimension (tested).

## Files touched

| File | Change |
| --- | --- |
| `apps/web/lib/lineage/filter-facets.ts` | **New** — pure filter model: `deriveFacets`, `matchMemberIds` (AND-across/OR-within), `nodeMatchesFacet`, `facetKey`. |
| `apps/web/lib/lineage/filter-facets.test.ts` | **New** — 11 unit cases (OR-within, AND-across, intersection, empty, year coercion, derive de-dup/sort). |
| `apps/web/components/web/lineage/lineage-view-a-island.tsx` | Badge + `SparklesIcon`/`FilterIcon` removed; `FilterDropdown` + `MetricStat` added; flat pill row → 4 dropdowns; slim mobile header; overlay copy/placement; matching via the new helper. |
| `apps/web/components/web/lineage/lineage-cohort-timeline.tsx` | Width/viewport fix — focal/box card `w-72` → `w-[min(18rem,calc(100vw-4.5rem))] sm:w-72`; scroll padding `px-10 py-12` → `px-4 py-8 sm:px-10 sm:py-12`. |
| `docs/sprints/SESSION_0405.md` | This session record. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun test lib/lineage/filter-facets.test.ts` | PASS — 11 pass / 0 fail. |
| `bun run typecheck` (apps/web, dummy DB env) | PASS — 0 errors. |
| `bun run lint:check` (oxlint) | PASS — exit 0; 0 findings in touched files (pre-existing warnings only). |
| `bun run format:check` (oxfmt) | PASS — exit 0 (after `oxfmt` on touched files). |
| `bun run wiki:lint` (root) | PASS — 0 violations (683 files). |
| `bunx fallow audit` (default gate) | PASS — exit 0. `deriveFacets` (16 cognitive) is relocated existing logic, below the severity gate; no new CRITICAL/HIGH introduced. |
| Mobile render proof (width fix, dropdowns, slim header) | **Deferred to CI + operator device** — no browser in sandbox. CI Playwright (`/lineage/[treeSlug]`) is the behavioural gate. |

## Open decisions / blockers

- **None at plan-lock.** (Adjacent ideas parked: filter→URL persistence; cohort-grouping drift D-DRIFT-0394-1.)

## Next session

### Goal

On the operator's device/browser: verify the mobile explorer overhaul against a live tree — the four filter
dropdowns (AND-across/OR-within), the slim header + metric strip, badge gone, and **especially the width fix**
(focal card fully visible, no right-edge clipping, on a real phone). Merge PR #75 once CI (Playwright
`/lineage/[treeSlug]`) is green. Then optionally pick up a parked follow-up: persist active filters to the URL
(`?filter=` nuqs), or escalate any single dimension dropdown to a bottom `Sheet` if its facet count is large.

### First task

Pull `claude/cinematic-explorer-mobile-y5kplx`, run the dev server, open a tree on a narrow viewport (≤390px),
and confirm: focal card fits the viewport (no horizontal clip), the four dropdowns filter the canvas with
AND-across/OR-within behaviour, and the badge is gone. Merge if CI is green.

## Review log

### SESSION_0405_REVIEW_02 — Review & Recommend (Petey)

- **Reviewed tasks:** SESSION_0405_TASK_01–08.
- **What landed vs plan:** all planned tasks landed; one operator-directed scope add (TASK_08, the width fix)
  was absorbed cleanly. The filter-semantics refinement (AND-across/OR-within) is the one deliberate behaviour
  change and is unit-proven (11/0).
- **Boundary registry / program plan:** no manual boundary shifted; this is a presentation + width lane on an
  already-shipped surface. No program-plan deliverable changed.
- **Next-target recommendation:** operator-device verification of the mobile overhaul (esp. the width fix) +
  merge PR #75; then filter→URL persistence as the natural follow-up. Written into `Next session` above.

### SESSION_0405_REVIEW_01 — Desi design-direction pass (cinematic explorer mobile overhaul)

- **Reviewed tasks:** design direction for TASK_02–05 (pre-implementation spec).
- **Verdict:** The locked direction is sound. Headline finding: the flat `flex-wrap` pill row (L470–506) mixes
  four orthogonal dimensions into one undifferentiated mass with unbounded wrap height — collapse to four
  labeled dropdowns. The eyebrow badge (L378–381) + its `SparklesIcon` import (L13) are a clean removal (only
  consumer; keep the "Focal lineage view" mode badge L383–386). Mobile header should drop the h2/paragraph
  cost, add a `sm:hidden` compact title row + a thin inline metric strip (Members · Verified · Roots), keep the
  desktop `MetricPill` grid, and tighten panel padding (`p-3`) + header gap (`mb-3`).
- **Primitive correction (Petey/Cody preflight):** Desi specced "Popover + `DropdownMenuCheckboxItem`", but
  `DropdownMenuCheckboxItem` is a base-ui `Menu.CheckboxItem` and requires the Menu context — it cannot live
  inside a `Popover`. The faithful multi-select primitive is the `DropdownMenu` wrapper itself
  (`DropdownMenu`/`DropdownMenuTrigger`/`DropdownMenuContent`/`DropdownMenuCheckboxItem`), whose checkbox items
  default `closeOnClick={false}` (multi-toggle keeps the menu open). Functionally identical to Desi's intent.
- **Prioritized fix list handed to Cody (High → Low):**
  - **HIGH** — L470–506: replace flat pill row with four `DropdownMenu` + `DropdownMenuCheckboxItem` dropdowns
    (Group / Belt / School / Year), `Stack direction="row" wrap` layout, count-badge triggers using the
    `SOLID_PILL` token + the existing active token (`border-primary/40 bg-primary/15`), belt rows render
    `BeltSwatch variant="bar"`, reusing `toggleFilter` (L305) verbatim. `max-sm:flex-1` so triggers form a tidy
    2×2 on mobile (mirrors `directory-filters.tsx:65`).
  - **HIGH** — L378–381 + L13: delete the eyebrow badge and the now-dead `SparklesIcon` import.
  - **HIGH** — L373–375 + L400–404: `<sm` slim header — compact title row (BBL heading var) + thin inline
    metric strip; keep desktop heading/paragraph + `MetricPill` grid; tighten `p-4`→`p-3`, `mb-4`→`mb-3` on
    mobile.
  - **MEDIUM** — L497–505: promote global Clear to a top-level "Clear all" shown only when
    `activeFilters.size > 0`; add per-dimension clear inside each dropdown.
  - **MEDIUM** — L604–607: `hidden sm:inline` on the apologetic "Best on desktop…" sentence; keep the
    claimable count.
  - **MEDIUM** — dropdown triggers: `focus-visible:outline-ring` + `min-h-10` tap targets (Select/directory
    parity).
  - **LOW** — L543–549: "Click to recenter" → "Tap to recenter" (touch).
  - **LOW** — L596–600: reposition copied toast clear of the bottom-right steppers on mobile.
  - **LOW (defer)** — escalate a dimension to a `sheet` only if its facet count exceeds ~12 (YAGNI now).
- **Brand-token discipline confirmed:** belts use `Rank.colorHex` via `BeltSwatch` (never a literal), gold stays
  legend-only, headings use `--font-bbl-heading` (Poppins italic), body `--font-bbl-body` (Inter).
- **Score:** 9/10.
- **Follow-up:** filter→URL persistence and the sheet-escalation are parked follow-ups, not this session.

<!-- Filled during/at bow-out. -->

## Hostile close review

- **Desi:** pass — the dropdown bar composes L1 primitives (no hand-roll, FS-0001 honoured), belts use
  `BeltSwatch`/`Rank.colorHex` (no literal), gold untouched, brand type vars preserved; badge removal is clean;
  slim-header + width fix are the right mobile moves. One primitive correction caught at preflight (DropdownMenu,
  not Popover, for checkbox items) — applied.
- **Doug:** pass — typecheck 0, filter-facets 11/0, lint/format/wiki exit 0, fallow exit 0; no secrets, lockfile
  untouched, generated/node_modules gitignored. Behavioural (mobile render + DB-join-independent) deferred to CI
  Playwright + operator device, which is the honest gate in a no-browser sandbox.
- **Giddy:** pass — plan→tasks→PR traceable; scope expansion (width fix) documented as operator-directed with the
  superseded scope-guard bullet struck through, not silently widened.
- **Kaizen aggregate:** 9/10 — clean, well-scoped overhaul; the only residual is sandbox-deferred mobile render
  proof (CI-covered). Half-point off for `deriveFacets` sitting 1 over the cognitive threshold (relocated logic,
  below the severity gate; left as-is rather than over-refactoring).

### Findings (severity ≥ medium)

None.

## ADR / ubiquitous-language check

- ADR update **not required** — no architectural decision made/changed/rejected. Pure presentation + a width
  fix; the filter-semantics refinement is a UI behaviour choice, not an architecture decision. ADR 0027 (custom
  View-A engine) confirmed still valid and unaffected.
- Ubiquitous language update **not required** — no new domain terms (filter dimensions reuse existing labels:
  group/belt/school/year).

## Reflections

- **The operator's two clarifications reframed the task twice.** First "all dropdowns, not a carousel"; then
  "it's a *width* issue, not height." My initial instinct on the second was to reach for canvas height +
  `scrollIntoView` — wrong. Reading the screenshot literally (the focal card clipped on the right) pointed at a
  fixed `w-72` card vs the mobile viewport. Lesson: when an operator says "can't be seen in the viewport," check
  the fixed-width layout math before assuming scroll/height.
- **Desi's "Popover + DropdownMenuCheckboxItem" wasn't buildable as written** — checkbox items need the base-ui
  Menu context. Caught it at primitive spot-check (Cody preflight #2) before writing code, not after. The
  preflight API spot-check earns its keep.
- **Extracting the matcher to a pure helper turned an un-provable client behaviour change into an 11-case unit
  test.** In a no-browser sandbox that's the difference between "trust me" and a green gate.
- **Index drift:** sessions 0399 + 0400 were never added to `wiki/index.md`. Backfilled here. The FS-0019
  "spot-check the last 5" gate is what caught it — worth keeping.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `wiki/index.md` + `custom-component-inventory.md` bumped `updated: 2026-06-17`, `last_agent: claude-session-0405`; SESSION_0405 frontmatter `status: closed`. No code-file wiki annotations needed changes. |
| Backlinks/index sweep | `wiki/index.md` gained rows for 0399/0400 (backfill) + 0405; component inventory lineage note added. No new pairs_with needed (SESSION_0405 pairs_with SESSION_0400 + desi.md, both extant). |
| Wiki lint | `bun run wiki:lint` → 0 violations (re-run post doc edits). |
| Kaizen reflection | Reflections section present: yes. |
| Hostile close review | SESSION_0405_REVIEW_01 (Desi) + SESSION_0405_REVIEW_02 (R&R) + Hostile close (Desi/Doug/Giddy) above. |
| Review & Recommend | Next session goal written: yes. |
| Memory sweep | None needed — no project-scoped constraint/preference change; all session-scoped (captured here). |
| Next session unblock check | Unblocked — first task is operator-device verification + merge; doable without further input. |
| Git hygiene | Branch `claude/cinematic-explorer-mobile-y5kplx`; code committed `574f10a` + pushed; close-docs commit hash reported at bow-out — see git log. Single additional push for docs. No force-push. |
| Graphify update | Skipped — `graphify` not installed in this remote sandbox. |
