---
title: "Lineage Tree Runbook — Balkan OrgChart deep-dive + our build plan"
slug: lineage-tree-runbook
type: runbook
status: active
created: 2026-06-13
updated: 2026-06-13
last_agent: claude-session-0374
domain: lineage
pairs_with:
  - docs/runbooks/domain-features/lineage-hub.md
  - docs/petey-plan-0305.md
  - docs/petey-plan-0379.md
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
> ⚠ **Candidate-A baseline:** this design is committed for comparison against a parallel ChatGPT-authored
> approach; the final path may cherry-pick between the two.

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
