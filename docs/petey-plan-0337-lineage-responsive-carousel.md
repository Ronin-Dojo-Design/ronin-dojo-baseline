---
title: "Petey Plan 0337 — Lineage Responsiveness + Carousel (adapt-not-port epic)"
slug: petey-plan-0337-lineage-responsive-carousel
type: plan
status: active
created: 2026-06-03
updated: 2026-06-07
last_agent: claude-session-0355
pairs_with:
  - docs/sprints/SESSION_0337.md
  - docs/sprints/SESSION_0338.md
  - docs/sprints/SESSION_0339.md
  - docs/runbooks/porting/react-to-next-component-porting-runbook.md
  - docs/knowledge/wiki/component-porting/graphify-component-port-map.md
  - docs/product/black-belt-legacy/STORIES.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - lineage
  - responsive
  - carousel
  - component-porting
  - epic
---

# Petey Plan 0337 — Lineage Responsiveness + Carousel (adapt-not-port epic)

> **⏸ DORMANT (SESSION_0355).** S0/S1/S2 are done (sessions 0337–0339); **S3 (carousel rail) /
> S4 (generation rails) / S5 (adaptive-connector spike) are paused** and untouched for 15 sessions.
> The plan is structurally valid — this is a *paused*, not abandoned, epic. **Resume pointer:** bow in
> against this doc + the slice's `specs/*.md` + its `PORTMAP-NNNN`, then execute S3 next (operator may
> run S3–S5 as the autonomous 3-session loop per the "Autonomous-run protocol" below). Reviewed dormant
> by Petey at SESSION_0355 bow-in (operator chose "keep deferred").

<!-- dormant banner above; original governing principle below -->

> **Governing principle — features-not-pixels.** Operator (SESSION_0337): *"adapt old features to the
> existing ones… take inspiration and feature behavior from old → new."* This is the porting runbook's
> hard rule. We take BBL's **feature behavior** (browse wide sibling sets via a rail, flatten-and-indent
> on mobile, belt-grouped cohorts) and **adapt it onto existing primitives** — the Embla
> `components/common/carousel.tsx`, `Stack`, `Card`, `Rank.colorHex`, and the SESSION_0336 SVG
> `LineageConnectorLayer`. Every `PORTMAP` strategy is `adapt`/`wrap`, **never `port-verbatim`**. We do
> not copy BBL JSX and we do not create duplicate components.

## Why this epic exists (evidence)

SESSION_0337's Desi pass measured the live lineage viewer (`/lineage/rigan-machado-bjj-lineage`) and
found the tree is **unusable beyond its first generation on anything but a wide desktop**:

| Viewport | Symptom (measured) |
| --- | --- |
| Desktop 1280 | Lineage card blows out to **3672px** (tree intrinsic width); canvas `overflow-x-auto` never engages; app-shell `overflow-clip` clips the right ~2400px **including the right-justified Tree/Board + zoom controls**. |
| Mobile 390 | Card **2893px**; shell clips **2544px** with **no horizontal scroll** — the tree is a left sliver, the rest unreachable. |
| Any | Rank labels (`Coral Belt (Red/Black) - 7th Degree`) overflowed their column by up to **166px** with truncation OFF (hard-clip, no ellipsis). |

**Slice 0 (this session) fixed the two safe bugs** — see "Slice 0" below. Slices 1–5 are the staged
build-out this plan governs. They are runnable **either as an autonomous Claude/Codex run** (execute
slices in order, each is independently shippable + verifiable) **or one session at a time**.

## Product-story alignment (all 4 brands)

The lineage viewer is BBL's surface but the components are **brand-neutral primitives** (ADR 0022) that
must serve Baseline / BBL / WEKAF / Ronin. Belt colour is always **`Rank.colorHex` data, never
hardcoded** (the BBL `BELT_COLORS`/`#CFB87C` maps are exactly what NOT to copy).

| Story | This epic delivers |
| --- | --- |
| `BBL-LINEAGE-001` (view lineage tree) | A tree that is actually viewable at every breakpoint (scroll/rail/mobile-list instead of clip). |
| `BBL-LINEAGE-002` (click → highlight root path) | Path-trace preserved through the adaptive-connector slice; mobile-list shows ancestor chain. |
| `BBL-LINEAGE-003` (grouped promotion rows / cohorts) | Wide sibling generations become browsable rails; belt-grouped buckets idiom available. |
| `BBL-LINEAGE-005` (trust badges on nodes) | Card-contract fix (Slice 0) keeps badges + truncated rank readable in every card surface. |

## Slice map (S0 done → S5 spike)

Risk rises down the table; ship top-down. Each slice = one session / one autonomous step.

| Slice | Title | Risk | Story | PORTMAP | Spec |
| --- | --- | --- | --- | --- | --- |
| **S0** | Overflow + toolbar bugfixes | done (S0337) | -001/-005 | — | inline (this session) |
| **S1** | Responsive mode switch (board < md, tree ≥ md) | done (S0338) | -001 | PORTMAP-0002 | `specs/lineage-responsive-switch-port-spec.md` |
| **S2** | Mobile lineage list (flatten + indent < sm) | done (S0339) | -001/-002 | PORTMAP-0003 | `specs/lineage-mobile-list-port-spec.md` |
| **S3** | Carousel rail extension (adapt Embla `carousel.tsx`) | med | -003 | PORTMAP-0004 | `specs/lineage-carousel-rail-port-spec.md` |
| **S4** | Generation rails in connector-free zones | med | -003 | PORTMAP-0005 | `specs/lineage-generation-rail-port-spec.md` |
| **S5** | Adaptive connector + rails inside wide tree generations | **high (spike)** | -002/-003 | PORTMAP-0006 | `specs/lineage-adaptive-connector-port-spec.md` |

### Slice 0 — Overflow + toolbar bugfixes (DONE, SESSION_0337)

- **What:** `max-w-full` on every truncating name/rank span (`lineage-node-card`, `lineage-honor-strip`,
  `lineage-compact-child-list`) so the `Stack direction="column"` `items-start` shrink-to-content no
  longer defeats `truncate`; and `w-full min-w-0 max-w-full` on the canvas card wrapper so it stops
  blowing out, re-engaging the canvas horizontal scroll and keeping the toolbar in-viewport.
- **Done means:** all truncate spans contained (measured 0/70 over-flowing), tree horizontally
  scrollable, toolbar controls reachable. ✓ verified.

### Slice 1 — Responsive mode switch

**Status:** DONE in SESSION_0338. PORTMAP-0002 is `proven`.

- **Adapt:** BBL's desktop-tree-vs-mobile decision (BBL switches to `MobileLineageList` at **< 640px**).
  We already have **tree** and **board** layouts in `lineage-tree-canvas.tsx` (`layout` state). Add a
  viewport-aware **default**: `board` below `md` (768px), `tree` at/above `md`. Viewer can still override.
- **Files:** `lineage-tree-canvas.tsx` (initial `layout` from a `useMediaQuery`/`@container` check;
  respect an explicit user toggle once set). No new component.
- **Done means:** loading `/lineage/[slug]` at < md defaults to **board** (the compact, vertical,
  always-fits idiom), ≥ md defaults to **tree**; measured: card never exceeds viewport at 390/768/1280;
  user toggle still works and persists for the session.
- **Risk:** low. No connector/zoom change. Watch: don't fight the existing `autoFittedRef` seed.

### Slice 2 — Mobile lineage list (< sm)

**Status:** DONE in SESSION_0339. PORTMAP-0003 is `proven`.

- **Adapt:** BBL `MobileLineageList` **behavior** — `buildFlattenedTree` DFS → flat array with a
  computed `depth`; render `space-y-2` with `marginLeft: min(depth*16, 48)px` and a per-row L-connector
  glyph (div, not SVG). Belt colour from `Rank.colorHex`. Reuses our `LineageNodeCard`/compact-row shape,
  not BBL's card.
- **Files:** `apps/web/components/web/lineage/lineage-mobile-list.tsx`; `apps/web/lib/lineage/flatten-lineage.ts`
  exports pure `flattenLineage(members) → {member, depth}[]` (unit-tested). Wired as the **< sm (640px)**
  render in `lineage-tree-canvas.tsx`.
- **Done means:** at 390px the lineage renders as a single indented column (≤ 3 indent levels), every row
  tappable → drawer, ancestor chain legible (supports `-002`); measured: no horizontal overflow, no clip.
- **Risk:** low–med. New component but pure-list; no zoom/connector interplay.
- **Proof:** SESSION_0339 measured `pageScrollWidth=390`, `canvasScrollWidth=314`, `rowCount=17`,
  `indentLevels=[0,16,32,48]`, `overflowingRows=[]`, `hasSvgConnectorColumns=false`,
  `hasZoomControls=false`, and row click opened the profile drawer for Carlos Gracie Jr.

### Slice 3 — Carousel rail extension (adapt Embla `carousel.tsx`)

- **Adapt:** BBL `CarouselRail` **behaviors** onto the existing Embla primitive — do NOT add a second
  carousel. Extend `components/common/carousel.tsx` with a dense-rail mode: item sizing variants
  (`168/248/280px` widths via `CarouselSlide` flex-basis prop), chevron-when-scrollable (already present),
  empty-state slot, `role="region"`+`aria-label`, edge fade affordance, and a `ResizeObserver` so dynamic
  content re-evaluates scrollability (BBL used scroll+resize listeners — a portability gap we close).
- **Files:** `components/common/carousel.tsx` (extend, keep API back-compatible); inventory entry in
  `dirstarter-component-inventory.md` documenting the rail variant.
- **Done means:** `Carousel` supports a dense rail with sized slides + a11y + empty state, back-compatible
  with existing callers (`/courses`, etc. unaffected — verify); a Storybook/route smoke renders a rail
  that snaps + shows/hides chevrons at the ends.
- **Risk:** med. Touches a shared primitive — must not regress existing carousels. Verify all current
  `Carousel` consumers.

### Slice 4 — Generation rails in connector-free zones

- **Adapt:** wide sibling sets become horizontal rails using the Slice-3 carousel — but ONLY where there
  are **no SVG connectors**: the **honor strip** (already a horizontal `overflow-x-auto` strip → swap to
  the rail for chevrons/snap/a11y) and **board child-lists** (`lineage-compact-child-list` wide groups).
  Optionally the belt-grouped bucket idiom (StudentsCarousel behavior) for large single-rank cohorts,
  belt colour from `Rank.colorHex`.
- **Files:** `lineage-honor-strip.tsx` (use the rail), `lineage-compact-child-list.tsx` (rail for wide
  groups), maybe new `lineage-generation-rail.tsx` wrapper.
- **Done means:** honor strip + wide board groups scroll as snap rails with reachable chevrons + aria;
  connector layer untouched (board mode has none; honor strip has none). Measured: no overflow; keyboard +
  screen-reader operable.
- **Risk:** med. No connector interaction by construction (connector-free zones only).

### Slice 5 — Adaptive connector + rails inside wide tree generations (SPIKE)

- **The hard one.** Operator chose rails **inside** connector-bearing tree generations. A rail scrolls
  child X-position; the SVG `LineageConnectorLayer` anchors a path to each child's fixed centre — so the
  connector behavior must **adapt** when a generation rails:
  - **Adaptive connector:** when a generation's measured width exceeds its band, the connector degrades
    from per-child fan to **one horizontal "bus"** across the rail viewport + a `"N students →"` scroll
    cue. Only **currently-visible** children get short vertical stubs, **re-measured on scroll**
    (rAF-throttled, hooked to the rail's scroll + the existing `ResizeObserver`). Reduced-motion = static
    (bus + stubs, no animated re-draw).
  - Preserves the lineage meaning + path-trace highlight (the on-path child's stub still flips to
    `stroke-primary/60`) while honoring the rail. Protects the SESSION_0336 measured-overlay model
    (measure off the layer's own `svgRef.parentElement` + `:scope >`; never anchor to content inside the
    rail scroller).
- **Files:** `lineage-tree-canvas.tsx` (`LineageBranch` + `LineageConnectorLayer`), `app/styles.css`
  (bus/stub keyframes). Gated behind a width/count threshold so narrow generations keep the current fan.
- **Done means:** a generation past the threshold renders as a rail with the adaptive bus + visible-child
  stubs that re-track on scroll; path-trace still cascades to the on-path child; reduced-motion static;
  narrow generations unchanged; dnd-drag + pan still work (overlay stays `pointer-events-none`).
- **Risk:** **high.** Start with a throwaway spike to prove rAF re-measure performance + the bus geometry
  before committing. If the spike shows the bus is confusing or janky, fall back to the
  **connector-free-when-railed** alternative (documented in SESSION_0337 grill, option 3) — a label+frame
  conveys the relationship and connectors drop for that generation only.

## Autonomous-run protocol

To run S1–S5 as an autonomous Claude/Codex loop (or one session at a time):

1. **Per slice, bow in** against this plan + the slice's `specs/*.md` + its `PORTMAP-NNNN` record.
2. **Cody pre-flight** (component scan, L1 inventory, data boundary) per the porting runbook §0–4.
3. **Build the adapt** — extend/compose existing primitives; no verbatim BBL JSX; `Rank.colorHex` only.
4. **Verify with measured Playwright evidence** (the SESSION_0337 idiom): navigate the live page, resize
   to 390 / 768 / 1280, `browser_evaluate` the geometry assertions in the slice's "Done means", screenshot
   before/after. typecheck + `biome ci` + `bun test` must be green.
5. **Update the PORTMAP record** status (`porting → proven`) + the SESSION file; document any new component
   in `custom-component-inventory.md`.
6. **One push per session at close** (FS-0024 git guard; `vercel.json` ignoreCommand decides deploy).
7. **Stop the loop** if a slice's spike fails its "Done means" — escalate the fallback decision to the
   operator rather than shipping a regression.

## Scope guard

- This plan does **not** touch schema/Prisma/server — pure client render/responsive work.
- No new carousel dependency (reuse Embla). No hardcoded belt colours. No duplicate components.
- 3f-PDF export + Phase 4 leaderboard remain deferred until this epic lands (PDF approach pre-decided:
  client-side print-to-PDF).

## Cross-references

- [SESSION_0337](sprints/SESSION_0337.md) — the design review + Slice 0 + this plan.
- [Porting runbook](runbooks/porting/react-to-next-component-porting-runbook.md) — the 8-step pipeline.
- [Component port map](knowledge/wiki/component-porting/graphify-component-port-map.md) — PORTMAP-0002..0006.
- [BBL STORIES](product/black-belt-legacy/STORIES.md) / [GAP_MATRIX](product/black-belt-legacy/GAP_MATRIX.md).
- BBL prior art (read for behavior, in `ronin-dojo-monorepo`):
  `src/brands/blackbeltlegacy/components/shared/CarouselRail.jsx`,
  `.../lineage/{StudentsCarousel,SchoolCarousel,ResponsiveTreeContainer,MobileLineageList}.jsx`.
