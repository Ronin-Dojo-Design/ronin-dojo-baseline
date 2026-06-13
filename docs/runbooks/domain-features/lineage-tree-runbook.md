---
title: "Lineage Tree Runbook — Balkan OrgChart deep-dive + our build plan"
slug: lineage-tree-runbook
type: runbook
status: active
created: 2026-06-13
updated: 2026-06-13
last_agent: claude-session-0380
domain: lineage
pairs_with:
  - docs/runbooks/domain-features/lineage-hub.md
  - docs/petey-plan-0305.md
  - docs/petey-plan-0379.md
  - docs/architecture/decisions/0026-lineage-view-a-engine-donatso-fork.md
  - docs/architecture/source/raw/Brian-Chat-GPT-Session.md
backlinks:
  - docs/runbooks/README.md
  - docs/knowledge/wiki/index.md
tags:
  - lineage
  - orgchart
  - balkan
  - tree
---

# Lineage Tree Runbook — Balkan OrgChart deep-dive + our build plan

Single reference for evolving our lineage tree toward org-chart-grade capability, using
**BALKAN OrgChart (React)** as the feature/UX benchmark. Read [`lineage-hub.md`](lineage-hub.md)
first for the data model; this doc is the **feature gap analysis + build plan**.

## 0. Verdict (SESSION_0379): fork MIT `donatso/family-chart`; Balkan FamilyTreeApp = visual north star

> **Supersedes two earlier same-session verdicts** (kept as the decision trail): (1) the original
> "build our own tidy-tree engine," then (2) "adopt Balkan OrgChartReact community + extend." Final
> operator decision SESSION_0379, after reviewing four candidate bases: **fork the MIT-licensed
> TypeScript/D3 library [`donatso/family-chart`](https://github.com/donatso/family-chart) into our repo
> and extend it ourselves.** It is a *genealogy* engine — the right shape for lineage (not an org chart).
> We own the data, the card content, privacy/RBAC, and belt-color; the fork hands us the layout engine,
> HTML cards, focal-person ancestry+progeny, privacy, and edit/history. **Balkan FamilyTreeApp** is the
> visual/UX north star (look + the build / invite-collaborate / claim / focus-a-member / share feel).

- **Approach: fork + own the work (SESSION_0379, RESOLVED).** Vendor the MIT `donatso/family-chart`
  `src/` into a workspace-local module we own (e.g. `apps/web/lib/lineage/family-chart/` or a
  `packages/family-chart`), keeping the upstream `LICENSE` + the forked commit SHA recorded. We edit
  internals freely (the secondary-overlay needs `layout/create-links.ts` + `renderers/view-links.ts`
  changes — not just composition). Dependency: **plain `d3@7`** (not lean submodules — room for more
  features later). **Gate:** read-only source review + IoC sweep of the vendored files before commit
  (operator supply-chain caution). Not an npm dependency; not redistributing a built bundle.
- **Engine base — DECIDED: `donatso/family-chart` (MIT, TypeScript, D3 v7).** Candidate review:
  - **`donatso/family-chart` ✅ CHOSEN** — MIT (`Copyright (c) 2026 donatso`), TS, one dep (`d3`). Real
    layout engine `src/layout/calculate-tree.ts`: `calculateTree(data, { main_id, node_separation:250,
    level_separation:150, ancestry_depth, progeny_depth, is_horizontal, … }) → { data:TreeData(x,y,depth),
    dim }`. **Genealogy data model fits multi-promoter lineage:** `Datum.rels = { parents:string[],
    spouses:string[], children:string[] }` — `parents` is an **array → N promoters** (beats FamilyTreeJS's
    fixed `mid`/`fid`); `data:{ gender, [k]:any }` carries our display fields. **HTML card renderer**
    (`renderers/card-html.ts`) → rich belt cards, no SVG-only ceiling. Built-in: focal `main_id`
    ancestry↑+progeny↓, **privacy** (`is_private`/`private_cards_config`), edit, add/remove-relative,
    **history (undo/redo)**, autocomplete, duplicate-person handling.
  - Balkan **OrgChartReact** — proprietary community lib; org-chart not genealogy; SVG-only nodes. Rejected as base (kept as a feature/UX reference; demos at `/tmp/OrgChartReact-Demos`).
  - Balkan **FamilyTreeJS** — genealogy, but vanilla-JS, proprietary, only 2 native parents. Rejected.
  - `ooanishoo/family-tree`, `rayaanr/FamLine` — **unlicensed** (all-rights-reserved), tutorial-scale,
    naive recursive-CSS layout (no auto-layout engine). Rejected as base; pattern footnotes only.
- **Integration:** the d3 lib renders into a DOM container → wrap in a React client island (`useRef` +
  effect; the old d3-org-chart wrapper pattern). Adapter: materialized public payload (`LineageTreeMember`
  + `RankAward` + `LineageRelationship`) → `Datum[]` — `rels.parents` = all promoters, `rels.children` =
  promotees, `rels.spouses` = co-promoters/partners; `data` = belt color (`Rank.colorHex`), rank, avatar,
  school, claim/verification — **allowlisted public fields only** (privacy materializer unchanged).
  Node-click → our `LineageProfileDrawer`. `main_id` = focal practitioner → shareable focus URLs.
- **Two coexisting views (operator decision SESSION_0379):**
  - **View B — whole-tree org chart = the EXISTING `LineageTreeCanvas` (kept, NOT rewired).** Remains the
    full-lineage overview ("the entire Rigan Machado tree"). No forced changes; this is the (B) option.
  - **View A — focal genealogy explorer = NEW, built on the `donatso/family-chart` fork.** Additive;
    `main_id` defaults to the tree root, every node re-centers, depth-limited, shareable focus URLs
    (`/lineage/[slug]?focus=[person]`). This is where the FamilyTreeApp "explore from a person" feel lives.
  - **They link:** View B (overview) → click a person → opens View A focused on them. (Back-link TBD.)
- **What View A reuses:** `LineageNodeCard` *content* + belt color from `Rank.colorHex`,
  `LineageProfileDrawer`, `search.ts`, `rank-progression.ts`, the materialized public payload +
  **privacy/RBAC guards** (never regress hub §"Privacy invariants"). View A is additive, so the
  "v2 alongside" posture holds — now for a product reason (two complementary views), not just safety.

> **MAPPING — RESOLVED (SESSION_0379, operator-agreed): single-primary-line + secondary-overlay.**
> - `rels.parents` = the **single primary promoter** (`primaryVisualParentMemberId`) → one clean lineage
>   line up. Set `single_parent_empty_card = false` (no phantom co-parent card — promoters aren't couples).
> - `rels.children` = students this person promoted (direct map).
> - **Secondary / cross-belt promoters** (`LineageRelationship` provenance beyond the primary) are NOT
>   `rels.parents`; they render as a **secondary-link overlay we add to the fork** (slink/clink idiom
>   ported onto `create-links`/`view-links`) + appear in the drawer's rank history. Tree stays readable;
>   provenance preserved.
> - `rels.spouses` = reserved for true co-equals (co-founders / co-promoters); unused in v1.
> - `main_id` = focal practitioner; ancestry↑ = "who promoted me", progeny↓ = "whom I promoted";
>   `main_id` drives shareable focus URLs.

> **Re-grounding (SESSION_0379, DONE):** the authoritative design is now **§0 (verdict) + §0a
> (integration spec)** here, plus the rewritten [`petey-plan-0379`](../../petey-plan-0379.md) slice
> sequence. §1 stays valid as **View B's** current ground truth. §2/§2b (the Balkan OrgChart matrix) are
> kept as a **feature/UX reference only** — we chose `donatso/family-chart`, not Balkan. §3/§4 below are
> **historical** (the superseded "build our own" plan); defer to §0a + petey-plan-0379.
>
> ✅ **PATH LOCKED (SESSION_0380, [ADR 0026](../../architecture/decisions/0026-lineage-view-a-engine-donatso-fork.md)).**
> The fresh-chat grill confirmed candidate-A and refined it: **one shared engine-agnostic DTO, two layout
> engines** — donatso (focal View A) + the existing canvas (overview View B, untouched; copy →
> `lineage-tree-canvas-v2.tsx` only when View B work begins). Candidate-B contributes its **design**, not
> code or any Balkan package. Two grounding corrections (verified in code): the secondary multi-parent
> edges are **already materialized** in the public payload (`relationshipsTo`/`relationshipsFrom`), and the
> trust vocabulary **already exists** (`lib/lineage/trust-status.ts` — reuse, don't reinvent).

## 0a. View A integration spec (accruing — SESSION_0379)

Build-ready mechanics for the new family-chart-fork focal explorer, recorded as the grill resolves them.

- **Card content (RESOLVED):** family-chart cards are **HTML divs** positioned by d3. Render our belt
  card via **`cardInnerHtmlCreator: (d) => htmlString`** — belt band `div` colored inline from
  `data.colorHex` (`Rank.colorHex`), avatar `<img>` via `cardImageField` (`data.avatar`) with initials
  fallback, name + rank label + verified/claimable badge. **HTML-string template, not React-in-card**
  (per-card React roots inside d3-managed/transitioning DOM are fragile). React is reserved for the drawer.
- **Drawer (RESOLVED):** keep `LineageProfileDrawer` (React), rendered once *outside* the d3 container,
  opened from a card interaction (state lifted to the React wrapper). Claim / rank-history live here.
- **Path highlight (RESOLVED — free reuse):** family-chart's built-in `setOnHoverPathToMain`
  (`f3-path-to-main` class) replaces our `connector-geometry` selected-path trace.
- **Expand hidden relatives (RESOLVED — built-in):** the mini-tree icon (`mini_tree`/`all_rels_displayed`)
  is the focal load-on-demand affordance.
- **Click semantics (RESOLVED — A):** click a card = **re-center** on that person (`updateMainId`,
  focal); a "View profile" control (button on the card / tapping the already-focal center card) opens
  `LineageProfileDrawer`. Mini-tree icon expands hidden relatives. Explore is the primary gesture.
- **Privacy (RESOLVED — A):** keep the materializer's **drop** behavior — non-PUBLIC members never
  reach View A; it consumes the *same* materialized public payload as View B. `single_parent_empty_card
  = false` (lineage lines through a dropped member break, no phantom card). Do **not** use family-chart
  `is_private`/`private_cards_config` to surface hidden members — that would regress
  `queries.visibility.test.ts` and loosen the privacy policy. Privacy guarantee unchanged.
- **Adapter (RESOLVED — A):** a **client-side pure** `toFamilyChartData(payload) → { data: Datum[],
  secondaryLinks }` in `lib/lineage/` (unit-tested, like `canvas-model.ts`). Server keeps emitting the
  **existing materialized payload, shared with View B** — no new oRPC contract, no d3-lib shape leaking
  server-side. `rels.parents = [primaryVisualParentMemberId]`, `rels.children = [promotees]`,
  `data = { colorHex (Rank.colorHex), avatar, displayName, rankLabel, slug, claimable, verified }`,
  `gender` → unset (`card-genderless`; belt color is the signal, not gender).
- **Secondary-overlay (RESOLVED — rec):** secondary/cross-belt promoters (`LineageRelationship`
  PROMOTED_BY beyond primary) render via an extended `create-links`/`view-links`: belt-colored,
  **labelled** (belt awarded), **dashed/curved**, visually subordinate to the primary edge. Drawn
  **only when both endpoints are in the current focal view**; out-of-view secondary promoters surface
  in the drawer's rank history instead. Default-on, **toggleable**, with a legend.
- **Routing/mount (RESOLVED — rec):** View A is a `"use client"`, **dynamically-imported** family-chart
  island on the **existing route via a view toggle + focus param**: `/lineage/[treeSlug]?view=explore&
  focus=[person]` (shares the page's data fetch + structured-data/SEO). `main_id` ← `?focus=` else tree
  root; re-center updates `?focus=` (shallow routing) for shareable focus URLs. **B→A link** = View B
  card click sets `?view=explore&focus=`. d3 is client-only → SSR skeleton fallback; cleanup on unmount.

**§0a status: integration spec COMPLETE (SESSION_0379).** All forks resolved; build-ready.

## 0b. Candidate comparison + decision (SESSION_0379 → RESOLVED SESSION_0380)

> ✅ **RESOLVED (SESSION_0380, ADR 0026):** Option 1 (**A — donatso fork**) chosen as the View A engine,
> refined to "one shared DTO, two engines" (donatso focal A + existing canvas overview B, untouched).
> Cherry-picks (a) two-step neutral DTO and (b) trust vocabulary **all adopted** — and (b) was found to
> already exist in `trust-status.ts`. The comparison below is kept as the decision trail.

Two paths were worked up this session; the decision was **deferred to a fresh chat** (resolved above). **All
sources are lift-and-adapt — we own the resulting code; no license purchase, no runtime dependency on
any vendor package.** "Balkan-labeled" code is just a pattern/code source we adapt into our own.

- **Candidate-A — fork `donatso/family-chart` (FRONT-RUNNER).** MIT, TS, D3; genealogy-native; focal
  ancestry+progeny; HTML cards; the **View A focal explorer**. Recorded design = §0 + §0a + the rewritten
  [`petey-plan-0379`](../../petey-plan-0379.md).
- **Candidate-B — lift + adapt Balkan community patterns.** Captured verbatim in §"Brian-ChatGPT-Session"
  + [`raw/Brian-Chat-GPT-Session.md`](../../architecture/source/raw/Brian-Chat-GPT-Session.md). Strong on
  **native grouped cohorts** (`stpid`/`subTreeConfig`), `slinks`/`clinks`, partner/assistant, minimap/
  toolbar/search out-of-box; SVG card templates. We lift the *patterns/code*, not the package.
  _(Neutral note for the fresh agent: lifting MIT donatso is unambiguously permitted; lifting/adapting a
  proprietary community source has a different license profile — operator's call, already decided.)_
- **Independent agreement (strong signal):** both models converged on — adapter pattern (never feed
  Prisma directly), one clean primary tree + secondary relationships as **overlays**, additive (don't
  rewrite canonical truth), privacy/brand-scope sacred, and "complementary overview + focal views."

**Three options for the fresh session to choose from (A leans front-runner):**

1. **A:** donatso fork = View A focal explorer; cherry-pick B's ideas (below). _Front-runner._
2. **B:** lift + adapt Balkan patterns for the overview (and/or both views) — most out-of-box features.
3. **Hybrid:** both as complementary views — **View A** (donatso focal) + **View B** (Balkan-style
   overview). Matches the two-view decision (§0) and ChatGPT's own option C.

**Cherry-pick from B regardless of engine:** (a) a **two-step neutral visual DTO**
(`LineageVisualNode` + `LineageSecondaryLink` → engine-agnostic, then engine projection) instead of a
single `toFamilyChartData`; (b) the **role + trust-status visual vocabulary** (verified / pending /
disputed / imported); (c) **native grouped-cohort** framing (the Dirty Dozen).

## 1. Our current capability (ground truth, 2026-06-13)

| Area | Today | File |
| --- | --- | --- |
| Layout | **1D depth-bucket BFS**, rows by generation, **±5 depth clamp**, sort-by-name. Not a 2D tidy-tree. | `lib/lineage/tree-layout.ts` |
| Canvas model | `CanvasMember` (single `primaryVisualParentMemberId` + `visualGroupId` + `selectedRank` + `isCollapsedDefault`); child grouping; **descendant counts** for collapse badges; belt color / avatar / school resolution. | `lib/lineage/canvas-model.ts` |
| Connectors | SVG overlay edges + **selected-path trace** animation + connector grow-in (reduced-motion gated). | `lib/lineage/connector-geometry.ts` |
| Canvas UI | Pinch-zoom (mobile), dnd-kit **reparent** in edit mode, generation-stagger entrance, auto-fit. | `components/web/lineage/lineage-tree-canvas.tsx` |
| Node card | Belt-color band (data-driven `Rank.colorHex`), avatar, rank label, claim CTA. | `components/web/lineage/lineage-node-card.tsx` |
| Board mode | Compact child list / org-chart board (Phase 3a–3d). | `lineage-tree-board.tsx`, `canvas-model.ts` |
| Drawer | Profile drawer + rank-history tab, belt progress header. | `lineage-profile-drawer.tsx` |
| Search | Privacy-aware member search (only materializer-passed nodes). | `lib/lineage/search.ts` |
| Editor + RBAC | Placement/promotion edits gated by `LineageTreeAccess`; audit-on-mutation. | `server/web/lineage/editor-*.ts` |
| Provenance | `RankAward` canonical (multi-parent); `LineageRelationship(PROMOTED_BY)` mirror. **Multi-parent exists in DATA but display picks ONE visual parent.** | schema + hub |

**The headline gap:** the data is multi-parent and rich; the **layout is 1D and the display is
single-parent.** Everything below is about closing that.

## 2. Balkan feature → our state → gap → build (the matrix)

Legend: ✅ have · 🟡 partial · ❌ missing. **All ~28 Balkan Docs pages were fetched + verified
this session** (the "ref" tags below are now doc-confirmed — see §2b for the extracted API detail).
Only the React `MultipleTemplates` page is broken on Balkan's side (used the `OrgChartJS` variant);
`OrgScribe` is an AI authoring notation, not relevant.

| # | Balkan feature | What it gives (verified unless noted) | Our state | Build approach |
| --- | --- | --- | --- | --- |
| 1 | **Layout** (`Docs/Layout`) | normal / **mixed** (V+H space optimization) / tree / treeLeft/Right / offset / grid; `tags.subLevels` for per-node depth; layout-switch by child count | 🟡 1D buckets only | **Highest value.** Replace `tree-layout.ts` with a real **tidy-tree (Reingold–Tilford / d3-hierarchy-style) 2D layout** producing `{x,y}` per member; keep it pure TS + unit-tested. Add a `mixed` mode that flips wide sibling rows to columns. |
| 2 | **SubTrees** (`Docs/SubTrees`) | `stpid` sub-tree roots + per-subtree `subTreeConfig.orientation`; "group" template | ❌ | Per-`LineageVisualGroup` / per-branch orientation override in the layout engine (a branch can render left-stacked while the trunk is top-down). |
| 3 | **Clinks** (curved cross-links, `Docs/Clinks`) | non-hierarchical curved links `{from,to,label,template}`, `CLINK_CURVE`, add/remove + redraw | ❌ (data exists) | **Surface multi-parent provenance.** Render secondary `PROMOTED_BY` parents (cross-school promotions) as **curved clinks** distinct from the primary tree edge. We already store them as `LineageRelationship`; the display just drops them today. |
| 4 | **Slinks** (second links, `Docs/Slinks`) | straight multi-parent links **within one tree**; `{from,to,label,template}` | ❌ (data exists) | Same data source as #3; use **slinks for in-tree** secondary parents, **clinks for cross-tree**. |
| 5 | **Partner** (`Docs/Partner`) | co-equal nodes via `tags:['partner']` + `ppid`; left/right partner | ❌ | Co-promoters / co-founders / spouse-instructors side-by-side. Maps cleanly to a `PromotionEvent` with multiple awarders or a co-founder relation. |
| 6 | **Assistant** (`Docs/Assistant`) | side node beside parent (`tags:['assistant']`, `assistantSeparation`) | ❌ | Assistant-instructor / branch-rep nodes positioned beside a master without being "below" them. |
| 7 | **Drag & Drop** (`Docs/DragAndDrop`) | reparent; `movable: node\|tree\|detachTree`; cancellable `onDrop` | ✅ dnd-kit reparent | Add **subtree move** + **detach** modes (today = single-node reparent). Keep dnd-kit; add the move-mode toggle. |
| 8 | **Custom template** (`Docs/CreatingCustomTemplate`) | `renderNode` → SVG; data-driven bands/fills; `baseTemplateName` inheritance | ✅ belt band | Already data-driven via `Rank.colorHex`. Extend with verification/ceremony badges. |
| 9 | **Multiple templates** (`Docs/MultipleTemplates`, doc errored — re-fetch) | per-node-type card templates | 🟡 one card | Distinct templates for **placeholder vs claimed vs deceased vs root/grandmaster** nodes. |
| 10 | **Load on demand** (`Docs/LoadOnDemand`) | `cids` + `onDemand` → fetch → `addNodes()`; "billions of nodes" | ❌ (±5 clamp instead) | Lazy-load collapsed subtrees from the server; **removes the ±5 depth clamp**. Pairs with expand/collapse (#11). |
| 11 | **Expand / Collapse** (`Docs/ExpandCollapse`, ref) | collapse subtrees, count badges | 🟡 `isCollapsedDefault` + descendant counts | Wire interactive expand/collapse to the new layout + load-on-demand. We already compute `buildDescendantCounts`. |
| 12 | **Filter** (`Docs/Filter`) | `filterBy` field/tag/`"all"`; hide via `dot` template or CSS blur | ❌ | Filter by rank/belt, school (Affiliation), verification status, generation. Reuse the privacy-safe member set. |
| 13 | **Search / Highlight / Navigation** (`Docs/Search`,`HighlightNodes`,`Navigation`, ref) | jump-to-node, highlight matches, pan/center | 🟡 `search.ts` (privacy) | Add **highlight + center-on-result** to the canvas (we have the privacy-safe search already). |
| 14 | **Tags** (`Docs/Tags`, ref) | per-node tag → style/template/behavior | 🟡 visual groups | Generalize `LineageVisualGroup` into a tag system (belt tier, verified, branch). |
| 15 | **Undo / Redo** (`Docs/UndoRedo`, ref) | editor history | ❌ | Editor command stack over the placement/promotion mutations (audit log already records transitions). |
| 16 | **Export PNG / PDF** (`Docs/ExportingPNG`, ref) | export the chart | ❌ (Phase 3f queued) | Already on the petey-plan-0305 roadmap (3f). SVG → canvas → PNG; print CSS → PDF. |
| 17 | **Create programmatically / State / Importing** (`Docs/CreateProgrammatically`,`State`,`Importing`, ref) | build/restore chart from data; CSV/XML import | ✅ server-driven | We're already fully data-driven from Prisma; an **importer** (CSV → placeholder nodes) is the useful slice for onboarding a lineage. |
| 18 | **CSS customization / Scale & padding** (`Docs/CSSCustomization`,`ScaleAndPadding`, ref) | theme + spacing knobs | 🟡 brand tokens | Expose spacing/scale as layout options; keep belt colors data-driven (never hardcode). |

## 2b. Extracted API detail (all doc-verified this session)

The concrete knobs/methods to replicate per feature — so a build session doesn't re-fetch:

- **Layout / spacing** (`Layout`,`ScaleAndPadding`): spacing knobs `levelSeparation`,
  `siblingSeparation`, `subtreeSeparation`, `mixedHierarchyNodesSeparation`. `scaleInitial` fit-modes:
  `boundaryIfOutside` (default), `boundary`, `height`, `width`, or numeric. Our 2D engine should expose
  these as options.
- **TreeListLayout**: a compact, scrollable **list** rendering of the hierarchy (`layout: treeList` +
  `treeListItem` template via `subTreeConfig`) — a strong fit for our mobile/board list mode.
- **Search** (`Search`): `search(term)` → results; `center(id)` to fly-to; `searchFields` +
  `searchFieldsWeight`. We already have privacy-safe `search.ts`; add `center` + result list.
- **Highlight** (`HighlightNodes`): `highlightOnHover: "parents" | "children" | "sameLevel"` +
  `highlightNode(id, mode)`; uses CSS classes (`boc-hover`). Maps to our selected-path trace — extend
  to ancestor/descendant/sibling dim modes.
- **Expand/Collapse** (`ExpandCollapse`): `collapse:{level}`, `expand:{nodes:[…]}`, methods
  `expand()/collapse()/expandCollapse()`, event `onExpandCollapseButtonClick`. We have
  `isCollapsedDefault` + `buildDescendantCounts`; wire interactive toggles.
- **Undo/Redo** (`UndoRedo`): command history in `sessionStorage` (`undoRedoStorageName`); `undo()`,
  `redo()`, `undoRedoUI.onChange({undoStepsCount,redoStepsCount})`, persist via `onUpdated`. Our
  audit-log already records transitions — build the in-editor stack on top.
- **Edit form** (`Edit`): `editUI.show()`; auto-generates inputs from fields
  (`generateElementsFromFields`), types text/date/checkbox/select/multiselect + validators;
  `editForm:{readOnly}`. We have our own node-profile form — keep it; borrow the details/readOnly split.
- **Export** (`ExportingPNG`): `exportToPNG/PDF/SVG/PowerPoint`, `pngPreviewUI.show()`,
  `onExportStart/onExportEnd` (inject styles, headers/footers with `{current-page}`), base64 image
  flag. For sensitive data, self-host the export server. (Aligns with petey-plan-0305 3f.)
- **Import** (`Importing`): `importCSV() / importXML() / importJSON()`. The CSV path = batch
  placeholder-Passport create — coordinate with Phase 3 identity.
- **Tags + Multiple templates** (`Tags`,`OrgChartJS/Docs/MultipleTemplates`): a node's `tags:[…]`
  selects a per-tag **template + CSS + menu + sublevels**. This is how we get distinct cards for
  placeholder / claimed / deceased / root — generalize our `LineageVisualGroup` into this.
- **Performance** (`Performance`): **only visible nodes are rendered** (virtualization); demoed at
  100k+ nodes with a minimap. Our canvas should virtualize off-screen nodes once load-on-demand lands.
- **Navigation** (`Navigation`): pan (always on), `scroll.smooth/speed`, **minimap** (colors/opacity/
  position/draggable), `moveNodesToVisibleArea(ids)`, `center(id)`. Minimap is high-value for big trees.
- **State** (`State`): persist expanded/scale/position to localStorage / IndexedDB / **URL params**;
  `stateToUrl()` → **shareable lineage-view links** (open a tree focused on a person). Nice product win.
- **Programmatic CRUD** (`CreateProgrammatically`,`APICall`): `add/update/remove` (+ `draw()`) or
  `addNode/updateNode/removeNode` (auto-draw). We're already Prisma-driven; this is the client mirror.
- **CSS hooks** (`CSSCustomization`): node `[data-n-id]`, link `[data-l-id]`, control selectors
  (`[data-ctrl-ec-id]`); keep belt color data-driven, never hardcoded.
- **Menus** (`Menus`): node context-menu (right-click), in-node button menu, top toolbar (export/
  layout/zoom). Map to our RBAC-gated node actions.

## 3. What to actually build (prioritized)

Ordered by value-to-effort for the lineage product, not Balkan's doc order:

1. **2D tidy-tree layout engine** (matrix #1) — the foundation everything else hangs off. Pure TS,
   `{x,y}` per member, unit-tested, replaces the ±5-clamped bucket layout. Add `mixed` mode.
2. **Multi-parent display: slinks + clinks** (#3, #4) — the single biggest *product* differentiator;
   surfaces cross-school promotion provenance we already store but hide. Curved SVG secondary edges,
   visually subordinate to the primary tree edge, with a legend.
3. **Expand/collapse + load-on-demand** (#10, #11) — removes the depth clamp; makes big lineages real.
4. **Partner + assistant nodes** (#5, #6) — co-promoters / assistant instructors; needs a small
   display-projection extension (not necessarily schema).
5. **Filter + highlight/center search** (#12, #13) — navigation for large trees.
6. **Subtree orientation, multiple templates, undo/redo, export** (#2, #9, #15, #16) — polish wave.

## 4. Data-model impact (what needs schema vs pure display)

- **Pure display (no schema):** layout engine, expand/collapse, filter, highlight, search-center,
  subtree orientation, multiple templates, export. These read the existing read-model + `canvas-model`.
- **Display projection extension (small):** slinks/clinks render existing `LineageRelationship`
  multi-parent edges — **the data is already there**; we add them to the *public payload* (respecting
  the privacy materializer) and to `canvas-model`. Partner/assistant may add a `displayRole` enum on
  `LineageTreeMember` (projection only — provenance stays in `RankAward`).
- **New backing (only if needed):** load-on-demand needs a paginated subtree query; importer needs a
  CSV→placeholder-Passport path (coordinate with the **Phase 3 person-rooted identity** work — a CSV
  import is exactly an accountless-Passport batch create; see `PHASE3_USER_CARRY_PREFLIGHT.md`).

⚠ **Guardrails:** never break the hub's privacy invariants (public payload allowlist, materializer,
rank-progression projection). Belt color stays `Rank.colorHex` data. Any schema touch waits for the
Phase 3 identity re-root window (don't open a second schema migration).

## 5. Relationship to the existing epic

This **extends** [petey-plan-0305](../../petey-plan-0305.md) (Phase 3 Org Chart Board → 3e SVG
connectors → 3f export → Phase 4 trophy). The 2D layout engine + slinks/clinks are the natural
continuation of the "Org Chart Board" direction. The executable breakdown lives in
[petey-plan-0379](../../petey-plan-0379.md).

## 6. Balkan doc index (all fetched + verified SESSION_0374)

Every page below was read this session and its API folded into §2/§2b (exceptions: the React
`MultipleTemplates` page is broken — used `OrgChartJS/Docs/MultipleTemplates`; `OrgScribe` is an AI
authoring notation, not relevant; the full `OrgChartJS/API/interfaces/OrgChart.options` reference was
not dumped — open it directly when wiring a specific option). All under
`https://balkan.app/OrgChartReact/Docs/`: GettingStarted, Layout, TreeListLayout, SubTrees,
ScaleAndPadding, Edit, Assistant, Partner, Clinks, Slinks, CreatingCustomTemplate, MultipleTemplates,
CSSCustomization, Search, Filter, HighlightNodes, ExpandCollapse, DragAndDrop, UndoRedo, Navigation,
Menus, Importing, Tags, State, Performance, CreateProgrammatically, LoadOnDemand, ExportingPNG,
APICall, OrgScribe. (`OrgChartJS/Docs/` has Link / MultipleTemplates variants + the full API reference
`OrgChartJS/API/interfaces/OrgChart.options`.) Each page ships copyable code.

## 7. Cross-references

- [Lineage Domain Hub](lineage-hub.md) — data model, file map, privacy invariants (read first).
- [Petey Plan 0379](../../petey-plan-0379.md) — the executable build breakdown.
- [Petey Plan 0305](../../petey-plan-0305.md) — the lineage enhancement epic this extends.
- [PHASE3_USER_CARRY_PREFLIGHT](../../product/black-belt-legacy/PHASE3_USER_CARRY_PREFLIGHT.md) — identity re-root window (gate any schema touch here).

**Honor the Lineage. Build the Future. OSSS.**

---

## Brian-ChatGPT-Session

_Verbatim ChatGPT session pasted by Brian (SESSION_0379), captured as **candidate-B** for the lineage-tree path comparison — a Balkan `balkan-orgchart-js-community` visual-parity spike. Source material, **not** synthesized spec; the canonical design remains §0/§0a + `petey-plan-0379` (candidate-A, donatso fork). Also stored verbatim at [`Brian-Chat-GPT-Session.md`](../../architecture/source/raw/Brian-Chat-GPT-Session.md). Some repo claims below (package manager, session history, package names) are ChatGPT's and **unverified**._

I’ll treat this as a buildable visual-parity spike, borrowing Balkan TSX behaviors without making it the final engine. The prototype will keep Ronin lineage truth separate while modeling partners, assistants, and grouped student subtrees.
The repo already has a React-first lineage canvas with drawers, paths, forest support, node cards, and editor drag/drop, so this should be an adapter/visual-language layer. Useful Balkan ideas map to pid, ppid, stpid, tags, slinks, and clinks without changing schema.
Looking for available tools

Thought for 8m 10s
According to a document from 2026-06-10, SESSION_0360 already normalized Ronin to Bun as the only package manager, removed the pnpm/npm drift, moved lint/format to Oxc, and left SESSION_0361 as the next oRPC scaffold session. So for this Balkan visual-parity spike, use bun add, keep this isolated, and do not let it mutate the canonical lineage data model yet.
The right move is:

Build Balkan-style lineage visual parity as an isolated renderer spike.

Do not replace canonical lineage truth.
Do not add free x/y editing.
Do not let Balkan's org/family semantics become the database model.
Use it to prove:
  - partners / co-promoters
  - assistants
  - grouped student cohorts under instructors
  - secondary lineage overlays
  - BBL card styling

That aligns with BBL’s active stories: public lineage trees need public members, profile drawer behavior, root-path clarity, grouped promotion rows, unknown-date handling, and trust badges. The PRD says BBL’s lineage view should answer who promoted whom, who belongs to which branch, and where a person sits in the larger tree.
One important caution: Balkan OrgChart is a product with Community and Commercial licensing paths, so treat this as a spike unless you confirm the license/package choice is acceptable for production. Their docs explicitly distinguish Community and Commercial licenses.

What to build first
Create this as a Balkan parity route:

apps/web/
  app/(web)/lineage/balkan-demo/page.tsx

  components/web/lineage/balkan/
    balkan-lineage-org-chart.tsx
    balkan-lineage-demo-data.ts
    balkan-lineage-types.ts
    to-balkan-orgchart.ts

This should not replace:

apps/web/components/web/lineage/lineage-org-chart.tsx
apps/web/components/web/lineage/lineage-tree-board.tsx

For now, it is a visual/UX proving ground.

Install
Because SESSION_0360 made Bun canonical, use:

cd /Users/brianscott/dev/ronin-dojo-app

bun add balkan-orgchart-js-community

If you decide to use the commercial/full package instead:

bun add balkan-orgchart-js

The official docs show npm package installs for balkan-orgchart-js and balkan-orgchart-js-community, and import examples for both.

Why Balkan maps well to your lineage problem
Balkan’s key data fields line up cleanly with the visual language you want:
Balkan field / feature	Lineage meaning
id	visual node ID
pid	primary visual parent / primary promoter
tags: ["assistant"]	assistant instructor / steward / non-promoting coach
tags: ["partner"] / left-partner / right-partner	co-promoter, co-founder, school partner, association peer
ppid	child belongs under a specific partner/co-promoter lane
stpid	subtree group under an instructor
slinks	secondary lineage links, cross-training, alternate promoter
clinks	curved/context links for special relationships
tags + subTreeConfig	group-specific layout, template, spacing
Balkan’s docs say assistant nodes are declared with tags: ["assistant"]. Partner nodes can use partner, left-partner, or right-partner, and partner children can use pid plus ppid. Subtrees use stpid instead of pid, and subTreeConfig can control orientation, layout, columns, and spacing. Balkan also supports slinks for second links and clinks for curved links, which is exactly the right visual mechanism for secondary promoters/cross-training without corrupting the main tree.

Design decision for your lineage semantics
Use this mapping:

Primary lineage:
  pid = primaryVisualParentId

Assistant instructor:
  tags: ["assistant"]
  pid = instructorId

Co-promoter / co-founder / actual peer partner:
  tags: ["partner"]
  pid = primary instructor / shared anchor

Child promoted by a partner lane:
  pid = main instructor
  ppid = partnerId

Grouped student cohort:
  group node:
    stpid = instructorId
    tags = ["student-group"]
  students:
    pid = groupNodeId

Secondary promoter / cross-training / association:
  slinks or clinks

Do not use partner for every secondary promoter. It visually implies a peer/couple/partnership relationship. For martial arts, most secondary relationships should be overlays, not parent/partner structure.

File 1 — balkan-lineage-types.ts

// apps/web/components/web/lineage/balkan/balkan-lineage-types.ts

export type LineageVisualRole =
  | "ROOT"
  | "INSTRUCTOR"
  | "STUDENT"
  | "ASSISTANT"
  | "PARTNER"
  | "GROUP"

export type LineageTrustStatus = "VERIFIED" | "PENDING" | "DISPUTED" | "IMPORTED"

export type LineageSecondaryLinkKind =
  | "PROMOTED_BY"
  | "TRAINED_WITH"
  | "AFFILIATED_UNDER"
  | "CO_PROMOTER"
  | "ASSISTED_BY"
  | "HONORARY"

export type LineageVisualNode = {
  id: string
  passportId?: string
  slug: string
  displayName: string
  initials: string
  role: LineageVisualRole

  /**
   * The main visual lineage parent.
   * This is the clean readable line.
   */
  primaryParentId?: string

  /**
   * For partner/co-promoter lanes.
   * Balkan uses ppid to place a child under a specific partner.
   */
  partnerParentId?: string

  /**
   * For grouped cohorts.
   * Balkan uses stpid to make a node the root of a subtree under another node.
   */
  subtreeParentId?: string

  rankLabel?: string
  rankColorHex?: string
  organizationName?: string
  disciplineLabel?: string
  avatarUrl?: string | null

  trustStatus: LineageTrustStatus

  groupLabel?: string
  groupKind?: "PROMOTION_DATE" | "RANK" | "GENERATION" | "TEAM" | "CUSTOM"
  promotionDateLabel?: string
  showPublicLabel?: boolean

  sortOrder?: number
}

export type LineageSecondaryLink = {
  id: string
  fromId: string
  toId: string
  kind: LineageSecondaryLinkKind
  label?: string
  verified?: boolean
}

export type LineageBalkanGraph = {
  nodes: LineageVisualNode[]
  secondaryLinks: LineageSecondaryLink[]
  rootIds?: string[]
}

export type BalkanNode = {
  id: string
  pid?: string
  ppid?: string
  stpid?: string
  tags?: string[]

  name: string
  initials: string
  title?: string
  rankLabel?: string
  rankColorHex?: string
  organizationName?: string
  disciplineLabel?: string
  avatarUrl?: string
  trustStatus: LineageTrustStatus
  groupLabel?: string
  promotionDateLabel?: string
  sortOrder?: number
}

export type BalkanLink = {
  from: string
  to: string
  label?: string
  template?: string
}

export type BalkanProjection = {
  nodes: BalkanNode[]
  slinks: BalkanLink[]
  clinks: BalkanLink[]
  roots?: string[]
}


File 2 — balkan-lineage-demo-data.ts
This gives you the visual parity proof: instructor, assistant, partner/co-promoter, grouped student cohorts, and secondary overlays.

// apps/web/components/web/lineage/balkan/balkan-lineage-demo-data.ts

import type { LineageBalkanGraph } from "./balkan-lineage-types"

export const balkanLineageDemoGraph: LineageBalkanGraph = {
  rootIds: ["rigan-machado"],

  nodes: [
    {
      id: "rigan-machado",
      slug: "rigan-machado",
      displayName: "Rigan Machado",
      initials: "RM",
      role: "ROOT",
      rankLabel: "Red Belt",
      rankColorHex: "#dc2626",
      organizationName: "Machado Jiu-Jitsu",
      disciplineLabel: "Brazilian Jiu-Jitsu",
      avatarUrl: null,
      trustStatus: "VERIFIED",
      sortOrder: 0,
    },

    /**
     * Partner/co-promoter lane.
     * Use this for true co-promoter/co-founder/peer lineage roles.
     */
    {
      id: "co-promoter-anchor",
      slug: "co-promoter-anchor",
      displayName: "Co-Promoter",
      initials: "CP",
      role: "PARTNER",
      primaryParentId: "rigan-machado",
      rankLabel: "Senior Black Belt",
      rankColorHex: "#111827",
      organizationName: "Promotion Panel",
      disciplineLabel: "BJJ",
      avatarUrl: null,
      trustStatus: "VERIFIED",
      sortOrder: 1,
    },

    /**
     * Assistant node.
     * Good for non-primary instructor, steward, historian, program assistant.
     */
    {
      id: "lineage-steward",
      slug: "lineage-steward",
      displayName: "Lineage Steward",
      initials: "LS",
      role: "ASSISTANT",
      primaryParentId: "rigan-machado",
      rankLabel: "Black Belt",
      rankColorHex: "#111827",
      organizationName: "Black Belt Legacy",
      disciplineLabel: "BJJ",
      avatarUrl: null,
      trustStatus: "VERIFIED",
      sortOrder: 2,
    },

    {
      id: "bob-bass",
      slug: "bob-bass",
      displayName: "Bob Bass",
      initials: "BB",
      role: "INSTRUCTOR",
      primaryParentId: "rigan-machado",
      rankLabel: "Coral Belt",
      rankColorHex: "#991b1b",
      organizationName: "Machado Lineage",
      disciplineLabel: "BJJ",
      avatarUrl: null,
      trustStatus: "VERIFIED",
      sortOrder: 10,
    },
    {
      id: "chris-haueter",
      slug: "chris-haueter",
      displayName: "Chris Haueter",
      initials: "CH",
      role: "INSTRUCTOR",
      primaryParentId: "rigan-machado",
      rankLabel: "Coral Belt",
      rankColorHex: "#991b1b",
      organizationName: "Combat Base",
      disciplineLabel: "BJJ",
      avatarUrl: null,
      trustStatus: "VERIFIED",
      sortOrder: 20,
    },
    {
      id: "erik-paulson",
      slug: "erik-paulson",
      displayName: "Erik Paulson",
      initials: "EP",
      role: "INSTRUCTOR",
      primaryParentId: "rigan-machado",
      rankLabel: "Coral Belt",
      rankColorHex: "#991b1b",
      organizationName: "CSW",
      disciplineLabel: "BJJ / CSW",
      avatarUrl: null,
      trustStatus: "VERIFIED",
      sortOrder: 30,
    },

    /**
     * Subtree group under Bob Bass.
     * This is the important grouped-students visual.
     */
    {
      id: "bob-bass-students-black-belts",
      slug: "bob-bass-students-black-belts",
      displayName: "Bob Bass Black Belt Students",
      initials: "BB",
      role: "GROUP",
      subtreeParentId: "bob-bass",
      groupLabel: "Black Belt Students",
      groupKind: "RANK",
      showPublicLabel: true,
      promotionDateLabel: "Grouped by rank",
      rankLabel: "Student Cohort",
      rankColorHex: "#111827",
      organizationName: "Bob Bass Branch",
      disciplineLabel: "BJJ",
      avatarUrl: null,
      trustStatus: "VERIFIED",
      sortOrder: 100,
    },
    {
      id: "legacy-student-1",
      slug: "legacy-student-1",
      displayName: "Legacy Student 1",
      initials: "L1",
      role: "STUDENT",
      primaryParentId: "bob-bass-students-black-belts",
      rankLabel: "Black Belt",
      rankColorHex: "#111827",
      organizationName: "Bob Bass Branch",
      disciplineLabel: "BJJ",
      avatarUrl: null,
      trustStatus: "VERIFIED",
      sortOrder: 101,
    },
    {
      id: "legacy-student-2",
      slug: "legacy-student-2",
      displayName: "Legacy Student 2",
      initials: "L2",
      role: "STUDENT",
      primaryParentId: "bob-bass-students-black-belts",
      rankLabel: "Brown Belt",
      rankColorHex: "#7c2d12",
      organizationName: "Bob Bass Branch",
      disciplineLabel: "BJJ",
      avatarUrl: null,
      trustStatus: "PENDING",
      sortOrder: 102,
    },

    /**
     * A student placed under a specific partner/co-promoter lane.
     */
    {
      id: "co-promoted-student",
      slug: "co-promoted-student",
      displayName: "Co-Promoted Student",
      initials: "CS",
      role: "STUDENT",
      primaryParentId: "rigan-machado",
      partnerParentId: "co-promoter-anchor",
      rankLabel: "Black Belt",
      rankColorHex: "#111827",
      organizationName: "Promotion Panel",
      disciplineLabel: "BJJ",
      avatarUrl: null,
      trustStatus: "VERIFIED",
      sortOrder: 200,
    },

    /**
     * Subtree group under Chris Haueter.
     */
    {
      id: "haueter-combat-base-group",
      slug: "haueter-combat-base-group",
      displayName: "Combat Base Branch",
      initials: "CB",
      role: "GROUP",
      subtreeParentId: "chris-haueter",
      groupLabel: "Combat Base Branch",
      groupKind: "TEAM",
      showPublicLabel: true,
      rankLabel: "Branch",
      rankColorHex: "#1f2937",
      organizationName: "Combat Base",
      disciplineLabel: "BJJ",
      avatarUrl: null,
      trustStatus: "VERIFIED",
      sortOrder: 300,
    },
    {
      id: "combat-base-student-1",
      slug: "combat-base-student-1",
      displayName: "Combat Base Student",
      initials: "CB",
      role: "STUDENT",
      primaryParentId: "haueter-combat-base-group",
      rankLabel: "Black Belt",
      rankColorHex: "#111827",
      organizationName: "Combat Base",
      disciplineLabel: "BJJ",
      avatarUrl: null,
      trustStatus: "VERIFIED",
      sortOrder: 301,
    },
  ],

  secondaryLinks: [
    {
      id: "legacy-student-2-secondary-promoter",
      fromId: "lineage-steward",
      toId: "legacy-student-2",
      kind: "ASSISTED_BY",
      label: "assisted / reviewed",
      verified: true,
    },
    {
      id: "erik-to-combat-base-student-cross-training",
      fromId: "erik-paulson",
      toId: "combat-base-student-1",
      kind: "TRAINED_WITH",
      label: "cross-training",
      verified: true,
    },
  ],
}


File 3 — to-balkan-orgchart.ts
This is the most important file. It keeps your Ronin lineage truth separate from the Balkan rendering shape.

// apps/web/components/web/lineage/balkan/to-balkan-orgchart.ts

import type {
  BalkanLink,
  BalkanNode,
  BalkanProjection,
  LineageBalkanGraph,
  LineageSecondaryLink,
  LineageVisualNode,
} from "./balkan-lineage-types"

const roleToTags = (node: LineageVisualNode): string[] => {
  const tags: string[] = []

  if (node.role === "ROOT") tags.push("lineage-root")
  if (node.role === "INSTRUCTOR") tags.push("lineage-instructor")
  if (node.role === "STUDENT") tags.push("lineage-student")
  if (node.role === "ASSISTANT") tags.push("assistant", "lineage-assistant")
  if (node.role === "PARTNER") tags.push("partner", "lineage-partner")

  if (node.role === "GROUP") {
    tags.push("node-with-subtrees", "lineage-group")
  }

  if (node.trustStatus === "VERIFIED") tags.push("verified")
  if (node.trustStatus === "PENDING") tags.push("pending")
  if (node.trustStatus === "DISPUTED") tags.push("disputed")
  if (node.trustStatus === "IMPORTED") tags.push("imported")

  return tags
}

const toTitle = (node: LineageVisualNode) => {
  if (node.role === "GROUP") {
    return node.showPublicLabel
      ? (node.groupLabel ?? node.displayName)
      : "Student Group"
  }

  return [node.rankLabel, node.organizationName].filter(Boolean).join(" · ")
}

const toBalkanNode = (node: LineageVisualNode): BalkanNode => ({
  id: node.id,

  /**
   * Primary readable tree line.
   */
  pid: node.primaryParentId,

  /**
   * Partner/co-promoter lane.
   */
  ppid: node.partnerParentId,

  /**
   * Grouped subtree lane.
   */
  stpid: node.subtreeParentId,

  tags: roleToTags(node),

  name: node.displayName,
  initials: node.initials,
  title: toTitle(node),
  rankLabel: node.rankLabel,
  rankColorHex: node.rankColorHex,
  organizationName: node.organizationName,
  disciplineLabel: node.disciplineLabel,
  avatarUrl: node.avatarUrl ?? undefined,
  trustStatus: node.trustStatus,
  groupLabel: node.groupLabel,
  promotionDateLabel: node.promotionDateLabel,
  sortOrder: node.sortOrder,
})

const toBalkanSecondaryLink = (link: LineageSecondaryLink): BalkanLink => ({
  from: link.fromId,
  to: link.toId,
  label: link.label ?? link.kind.replaceAll("_", " ").toLowerCase(),
  template: link.verified ? "secondaryVerified" : "secondaryPending",
})

export const toBalkanProjection = (graph: LineageBalkanGraph): BalkanProjection => {
  const nodes = graph.nodes
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map(toBalkanNode)

  return {
    nodes,
    roots: graph.rootIds,
    slinks: graph.secondaryLinks
      .filter(link => link.kind !== "CO_PROMOTER")
      .map(toBalkanSecondaryLink),
    clinks: graph.secondaryLinks
      .filter(link => link.kind === "CO_PROMOTER")
      .map(toBalkanSecondaryLink),
  }
}


File 4 — balkan-lineage-org-chart.tsx
This is a Next-safe client component. It dynamically imports Balkan only in the browser.

// apps/web/components/web/lineage/balkan/balkan-lineage-org-chart.tsx

"use client"

import type { ComponentType } from "react"
import { useEffect, useMemo, useRef } from "react"
import type { BalkanNode, LineageBalkanGraph } from "./balkan-lineage-types"
import { toBalkanProjection } from "./to-balkan-orgchart"

type OrgChartLike = {
  load: (nodes: BalkanNode[]) => void
  on?: (eventName: string, callback: (...args: unknown[]) => void) => void
  destroy?: () => void
  fit?: () => void
  center?: (nodeId: string) => void
}

type BalkanLineageOrgChartProps = {
  graph: LineageBalkanGraph
  className?: string
  onSelectNode?: (nodeId: string) => void
}

/**
 * Keep Balkan types loose in this spike.
 * If this becomes production, add a tiny local wrapper type for only the API we use.
 */
type OrgChartConstructor = new (
  element: HTMLElement,
  options: Record<string, unknown>,
) => OrgChartLike

export function BalkanLineageOrgChart({
  graph,
  className,
  onSelectNode,
}: BalkanLineageOrgChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<OrgChartLike | null>(null)

  const projection = useMemo(() => toBalkanProjection(graph), [graph])

  useEffect(() => {
    let mounted = true

    const init = async () => {
      if (!containerRef.current) return

      const module = await import("balkan-orgchart-js-community")
      if (!mounted || !containerRef.current) return

      const OrgChart = module.default as OrgChartConstructor & Record<string, any>

      defineBblTemplates(OrgChart)

      chartRef.current?.destroy?.()

      const chart = new OrgChart(containerRef.current, {
        nodes: projection.nodes,
        roots: projection.roots,

        template: "bblLineage",
        mode: "dark",

        /**
         * Useful immediately for large BBL lineages.
         */
        enableSearch: true,
        searchDisplayField: "name",
        searchFields: ["name", "rankLabel", "organizationName", "disciplineLabel"],

        /**
         * Balkan visual controls.
         */
        mouseScroll: OrgChart.action?.ctrlZoom,
        scaleInitial: OrgChart.match?.boundaryIfOutside,
        scaleMin: 0.2,
        scaleMax: 3,

        showXScroll: true,
        showYScroll: true,
        miniMap: true,

        siblingSeparation: 34,
        subtreeSeparation: 54,
        assistantSeparation: 120,
        partnerNodeSeparation: 34,
        partnerChildrenSplitSeparation: 50,
        levelSeparation: 110,

        nodeBinding: {
          field_0: "name",
          field_1: "title",
          field_2: "trustStatus",
          img_0: "avatarUrl",
        },

        /**
         * Secondary/cross-training overlays.
         */
        slinks: projection.slinks,
        clinks: projection.clinks,

        tags: {
          "lineage-root": {
            template: "bblRoot",
          },
          "lineage-instructor": {
            template: "bblLineage",
          },
          "lineage-student": {
            template: "bblStudent",
          },
          "lineage-assistant": {
            template: "bblAssistant",
          },
          assistant: {
            template: "bblAssistant",
          },
          partner: {
            template: "bblPartner",
          },
          "lineage-partner": {
            template: "bblPartner",
          },
          "lineage-group": {
            template: "bblGroup",
          },
          "node-with-subtrees": {
            template: "bblGroup",
            subTreeConfig: {
              orientation: OrgChart.orientation?.left,
              layout: OrgChart.mixed,
              columns: 2,
              levelSeparation: 84,
              siblingSeparation: 18,
              subtreeSeparation: 38,
              collapse: {
                level: 2,
              },
            },
          },
          verified: {
            template: "bblLineage",
          },
          pending: {
            template: "bblPending",
          },
          disputed: {
            template: "bblDisputed",
          },
        },

        toolbar: {
          fit: true,
          zoom: true,
          layout: true,
          expandAll: false,
          fullScreen: true,
        },

        nodeMenu: {
          details: { text: "View profile" },
          focus: {
            text: "Center here",
            onClick: (nodeId: string) => {
              chart.center?.(nodeId)
            },
          },
        },
      })

      chart.on?.("click", (_sender: unknown, args: any) => {
        const nodeId = String(args?.node?.id ?? "")
        if (nodeId) onSelectNode?.(nodeId)
        return false
      })

      chartRef.current = chart
      chart.load(projection.nodes)

      window.setTimeout(() => chart.fit?.(), 60)
    }

    init()

    return () => {
      mounted = false
      chartRef.current?.destroy?.()
      chartRef.current = null
    }
  }, [projection, onSelectNode])

  return (
    <div className={className}>
      <div
        ref={containerRef}
        className="h-[78vh] min-h-[720px] w-full overflow-hidden rounded-2xl border border-border bg-background"
      />
    </div>
  )
}

function defineBblTemplates(OrgChart: Record<string, any>) {
  const base = OrgChart.templates?.ana ?? OrgChart.templates?.base
  if (!base || OrgChart.templates?.bblLineage) return

  OrgChart.templates.bblLineage = {
    ...base,
    size: [250, 126],
    node: `
      <rect x="0" y="0" width="250" height="126" rx="18" ry="18"
        fill="#070707" stroke="#2f2f2f" stroke-width="1"></rect>
      <rect x="0" y="0" width="250" height="126" rx="18" ry="18"
        fill="none" stroke="#dc2626" stroke-opacity="0.35" stroke-width="1"></rect>
      <rect x="0" y="0" width="250" height="8" rx="4" ry="4"
        fill="{val:rankColorHex}"></rect>
    `,
    img_0: `
      <clipPath id="{randId}">
        <circle cx="38" cy="46" r="24"></circle>
      </clipPath>
      <image preserveAspectRatio="xMidYMid slice" clip-path="url(#{randId})"
        x="14" y="22" width="48" height="48" href="{val}"></image>
      <circle cx="38" cy="46" r="25" fill="none" stroke="#ffffff" stroke-opacity="0.24"></circle>
    `,
    field_0: `
      <text data-width="160" style="font-size: 18px; font-weight: 700;"
        fill="#ffffff" x="76" y="40" text-anchor="start">{val}</text>
    `,
    field_1: `
      <text data-width="160" style="font-size: 12px;"
        fill="#b8b8b8" x="76" y="62" text-anchor="start">{val}</text>
    `,
    field_2: `
      <text data-width="210" style="font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase;"
        fill="#f4c96b" x="20" y="104" text-anchor="start">{val}</text>
    `,
  }

  OrgChart.templates.bblRoot = {
    ...OrgChart.templates.bblLineage,
    size: [285, 140],
    node: `
      <rect x="0" y="0" width="285" height="140" rx="22" ry="22"
        fill="#070707" stroke="#f4c96b" stroke-opacity="0.62" stroke-width="1.5"></rect>
      <rect x="0" y="0" width="285" height="10" rx="5" ry="5"
        fill="{val:rankColorHex}"></rect>
    `,
    field_0: `
      <text data-width="185" style="font-size: 21px; font-weight: 800;"
        fill="#ffffff" x="82" y="44" text-anchor="start">{val}</text>
    `,
    field_1: `
      <text data-width="185" style="font-size: 12px;"
        fill="#e7cf8a" x="82" y="68" text-anchor="start">{val}</text>
    `,
  }

  OrgChart.templates.bblStudent = {
    ...OrgChart.templates.bblLineage,
    size: [220, 112],
    node: `
      <rect x="0" y="0" width="220" height="112" rx="16" ry="16"
        fill="#0b0b0b" stroke="#2f2f2f" stroke-width="1"></rect>
      <rect x="0" y="0" width="220" height="7" rx="4" ry="4"
        fill="{val:rankColorHex}"></rect>
    `,
    field_0: `
      <text data-width="138" style="font-size: 16px; font-weight: 700;"
        fill="#ffffff" x="72" y="38" text-anchor="start">{val}</text>
    `,
    field_1: `
      <text data-width="138" style="font-size: 11px;"
        fill="#b8b8b8" x="72" y="58" text-anchor="start">{val}</text>
    `,
  }

  OrgChart.templates.bblAssistant = {
    ...OrgChart.templates.bblLineage,
    size: [220, 104],
    node: `
      <rect x="0" y="0" width="220" height="104" rx="16" ry="16"
        fill="#111111" stroke="#f4c96b" stroke-opacity="0.38" stroke-dasharray="4 4" stroke-width="1.25"></rect>
      <rect x="14" y="12" width="72" height="20" rx="10" fill="#f4c96b" fill-opacity="0.14"></rect>
      <text x="50" y="26" text-anchor="middle" fill="#f4c96b" style="font-size: 9px; font-weight: 700;">ASSIST</text>
    `,
    field_0: `
      <text data-width="130" style="font-size: 15px; font-weight: 700;"
        fill="#ffffff" x="74" y="52" text-anchor="start">{val}</text>
    `,
    field_1: `
      <text data-width="130" style="font-size: 11px;"
        fill="#b8b8b8" x="74" y="72" text-anchor="start">{val}</text>
    `,
  }

  OrgChart.templates.bblPartner = {
    ...OrgChart.templates.bblLineage,
    size: [230, 112],
    node: `
      <rect x="0" y="0" width="230" height="112" rx="18" ry="18"
        fill="#090909" stroke="#7dd3fc" stroke-opacity="0.45" stroke-width="1.25"></rect>
      <rect x="14" y="12" width="86" height="20" rx="10" fill="#7dd3fc" fill-opacity="0.14"></rect>
      <text x="57" y="26" text-anchor="middle" fill="#7dd3fc" style="font-size: 9px; font-weight: 700;">CO-LINE</text>
    `,
    field_0: `
      <text data-width="140" style="font-size: 15px; font-weight: 700;"
        fill="#ffffff" x="74" y="52" text-anchor="start">{val}</text>
    `,
    field_1: `
      <text data-width="140" style="font-size: 11px;"
        fill="#b8b8b8" x="74" y="72" text-anchor="start">{val}</text>
    `,
  }

  OrgChart.templates.bblGroup = {
    ...OrgChart.templates.bblLineage,
    size: [260, 72],
    node: `
      <rect x="0" y="0" width="260" height="72" rx="18" ry="18"
        fill="#160707" stroke="#dc2626" stroke-opacity="0.5" stroke-width="1.25"></rect>
      <rect x="14" y="14" width="92" height="20" rx="10" fill="#dc2626" fill-opacity="0.16"></rect>
      <text x="60" y="28" text-anchor="middle" fill="#ffb4b4" style="font-size: 9px; font-weight: 700;">GROUP</text>
    `,
    img_0: "",
    field_0: `
      <text data-width="220" style="font-size: 16px; font-weight: 800;"
        fill="#ffffff" x="20" y="52" text-anchor="start">{val}</text>
    `,
    field_1: "",
    field_2: "",
  }

  OrgChart.templates.bblPending = {
    ...OrgChart.templates.bblLineage,
    node: `
      <rect x="0" y="0" width="250" height="126" rx="18" ry="18"
        fill="#090909" stroke="#eab308" stroke-opacity="0.45" stroke-dasharray="5 5" stroke-width="1.25"></rect>
      <rect x="0" y="0" width="250" height="8" rx="4" ry="4"
        fill="{val:rankColorHex}"></rect>
    `,
  }

  OrgChart.templates.bblDisputed = {
    ...OrgChart.templates.bblLineage,
    node: `
      <rect x="0" y="0" width="250" height="126" rx="18" ry="18"
        fill="#090909" stroke="#ef4444" stroke-opacity="0.7" stroke-dasharray="7 4" stroke-width="1.5"></rect>
      <rect x="0" y="0" width="250" height="8" rx="4" ry="4"
        fill="{val:rankColorHex}"></rect>
    `,
  }

  OrgChart.templates.secondaryVerified = {
    ...OrgChart.templates.ana?.link,
    stroke: "#f4c96b",
  }

  OrgChart.templates.secondaryPending = {
    ...OrgChart.templates.ana?.link,
    stroke: "#eab308",
  }
}


File 5 — page.tsx

// apps/web/app/(web)/lineage/balkan-demo/page.tsx

import dynamic from "next/dynamic"
import { balkanLineageDemoGraph } from "~/components/web/lineage/balkan/balkan-lineage-demo-data"

const BalkanLineageOrgChart = dynamic(
  () =>
    import("~/components/web/lineage/balkan/balkan-lineage-org-chart").then(
      mod => mod.BalkanLineageOrgChart,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[78vh] min-h-[720px] items-center justify-center rounded-2xl border border-border bg-background">
        <p className="text-sm text-muted-fg">Loading lineage chart…</p>
      </div>
    ),
  },
)

export default function BalkanLineageDemoPage() {
  return (
    <main className="mx-auto w-full max-w-[1800px] px-4 py-6">
      <div className="mb-5 max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          Black Belt Legacy · Balkan visual parity spike
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Lineage Tree: grouped students, assistants, partners, and overlays
        </h1>
        <p className="mt-3 text-muted-fg">
          This page is a renderer spike only. It proves Balkan-style visual behavior
          without changing canonical lineage data or editor semantics.
        </p>
      </div>

      <BalkanLineageOrgChart
        graph={balkanLineageDemoGraph}
        onSelectNode={nodeId => {
          console.log("selected lineage node", nodeId)
        }}
      />
    </main>
  )
}


Optional type shim
Only add this if TypeScript complains about the package import:

// apps/web/types/balkan-orgchart-js-community.d.ts

declare module "balkan-orgchart-js-community" {
  const OrgChart: unknown
  export default OrgChart
}

If you use the commercial package instead:

// apps/web/types/balkan-orgchart-js.d.ts

declare module "balkan-orgchart-js" {
  const OrgChart: unknown
  export default OrgChart
}


How this should look conceptually

                       Rigan Machado
                            │
        ┌───────────────────┼────────────────────┐
        │                   │                    │
   Bob Bass            Chris Haueter        Erik Paulson
        │                   │                    │
        │              [Combat Base]             │
        │                   │                    │
 [Black Belt Students]      └─ Combat Base Student
        │
   ┌────┴────┐
 Student 1  Student 2

Assistant:
  Lineage Steward sits near Rigan as assistant/steward.

Partner:
  Co-Promoter sits beside Rigan as partner/co-lineage node.

Secondary overlays:
  Lineage Steward -> Student 2
  Erik Paulson -> Combat Base Student

That is exactly the kind of visual language you were asking for: one clean primary tree, grouped subtrees under instructors, and extra relationship truth as secondary overlays instead of corrupting the main parent chain.

Data wiring later
When you wire this to real data, keep this flow:

Prisma lineage models
  ↓
server-side public lineage payload
  ↓
Ronin lineage visual DTO
  ↓
toBalkanProjection()
  ↓
Balkan renderer

Do not let the Balkan component consume Prisma rows directly.
Ronin’s current SoT is explicit that public payloads and brand-scope/audit/rate-limit guarantees matter, and oRPC must preserve brand scope before later surfaces migrate. SESSION_0361 is also already defined as the oRPC scaffold + brand-aware context session, with no entity routers yet. So this Balkan page should stay mock/local until either the existing lineage read payload or the oRPC read pilot is ready.

What to verify
Run:

cd /Users/brianscott/dev/ronin-dojo-app

bun run --filter @ronin-dojo/web typecheck
bun run --filter @ronin-dojo/web lint:check
bun run --filter @ronin-dojo/web format:check
bun test
bun run wiki:lint

Then:

cd apps/web
bun run dev

Open:

http://bbl.local:3000/lineage/balkan-demo

Check:

[ ] Rigan/root card is visually dominant.
[ ] Assistant card appears beside/under root as assistant, not as child lineage.
[ ] Partner/co-promoter card appears as partner/co-lineage, not ordinary student.
[ ] Bob Bass has a grouped student subtree.
[ ] Chris Haueter has a grouped branch subtree.
[ ] Secondary overlay links render without changing the primary tree.
[ ] Search works for names/ranks/orgs.
[ ] Scrollbars/minimap/fit are usable.
[ ] No server-render crash.
[ ] No global lineage route was replaced.


My read on whether this is smart
Yes — as a visual parity spike.
No — as the canonical lineage engine yet.
Balkan is excellent for proving the visual behaviors you want: assistants, partners, subtrees, minimap, toolbar, search, and secondary links. The docs show those capabilities are first-class: assistant tags, partner tags/ppid, subtree stpid, subTreeConfig, scrollbars, minimap, and toolbar.
But the product truth still has to remain Ronin’s:

Passport/person identity
RankAward / promotion facts
LineageNode / LineageTreeMember
primary visual parent
secondary relationship overlays
trust status
claim/review/audit
brand-scoped public payloads

That matters because BBL’s active mission is not just “draw a pretty tree.” It is a verified martial-arts legacy platform with claim/review, identity, lineage, rank history, and trust workflows.
So build this spike. Use it to learn which Balkan behaviors deserve to survive. Then later either:

A. keep Balkan as the public whole-tree renderer,
B. port the useful behavior back into your owned D3/donatso path,
C. or run Balkan overview + donatso focal explorer as complementary views.

For this week, the goal is simpler:
Prove the visual language for grouped instructor subtrees without touching canonical lineage truth.
