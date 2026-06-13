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

## 0. Verdict: build our own (don't ship Balkan)

- **License (verified `Docs/GettingStarted`):** two tiers — a feature-limited **Community Edition**
  and a **Commercial** license (paid) for the full feature set. Several capabilities are CE-locked.
  Operator decision: **do not pay.** So Balkan is a **reference, not a dependency.**
- **Why building our own is the right call anyway:** our lineage is NOT a generic org chart — it's a
  **dual-model genealogy** (provenance vs display, see hub) with belt-color semantics, RBAC-scoped
  editing, privacy materialization, and claim/verification. Balkan's data binding (`id`/`pid`) can't
  express our `RankAward`-rooted multi-parent provenance. We mine Balkan's **layout math + display
  vocabulary + interaction patterns** (their docs include code) and implement on our own model.
- **What we keep from today:** `LineageTreeCanvas` (pinch-zoom, dnd-kit reparent, `motion` stagger),
  `LineageNodeCard` (belt color from `Rank.colorHex`), `LineageProfileDrawer`, the pure libs
  (`canvas-model.ts`, `connector-geometry.ts`, `tree-layout.ts`, `search.ts`, `rank-progression.ts`),
  and the privacy/RBAC guards. **No regressions to the guarded invariants** (hub §"Privacy invariants").

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
