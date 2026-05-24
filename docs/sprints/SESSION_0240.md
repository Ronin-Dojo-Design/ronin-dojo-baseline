---
title: "SESSION 0240 — Lineage public parity chrome plan"
slug: session-0240
type: session--plan
status: closed
created: 2026-05-24
updated: 2026-05-24
last_agent: copilot-session-0241
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0239.md
  - docs/sprints/SESSION_0241.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0240 — Lineage public parity chrome plan

## Date

2026-05-24

## Operator

Brian + codex-session-0240 (Petey orchestrating; read-only scout agents assigned for parity and canvas-scope review)

## Goal

Apply public parity chrome to `/lineage/[treeSlug]` with strict custom-canvas scope guard.

## Bow-in

### Previous session

- SESSION_0239 (`closed-full`) landed private noindex dashboard chrome and explicitly deferred `/lineage/[treeSlug]` to SESSION_0240 because it is a heavy custom canvas surface.
- SESSION_0239 first task for this session: read `/lineage/[treeSlug]/page.tsx`, identify missing public parity pieces, and plan a minimal page-shell uplift that does not alter lineage canvas behavior.

### Branch and worktree

- Working directory: `/Users/brianscott/dev/ronin-dojo-app`.
- Branch: `main`.
- Status before SESSION_0240 doc creation: `main...origin/main`.
- HEAD before SESSION_0240 doc creation: `2de5aa3`.

### Graphify check

- Graph status: current enough for bow-in discovery (`6881` nodes, `11010` edges, `999` communities, `1336` tracked files).
- Queries used:
  - `graphify repo memory graphify-repo-memory.md`
  - `opening ritual closing ritual bow in bow out`
  - `SESSION_0237 SESSION_0238 public parity lineage tool listing parity chrome`
  - `lineage treeSlug page public parity chrome generateMetadata StructuredData RelatedItems Breadcrumbs Intro Section`
  - `SESSION_0237 Passport public parity StructuredData Breadcrumbs Related items generateStaticParams`
  - `SESSION_0238 schools detail courses listing public parity related items structured data breadcrumbs`
  - `lineage queries getLineageTreeBySlug slugs related lineage server web lineage`
- Files selected from graph and verified by exact-file reads:
  - `docs/rituals/opening.md`
  - `docs/runbooks/graphify-repo-memory.md`
  - `docs/agents/petey.md`
  - `docs/sprints/SESSION_0239.md`
  - `docs/sprints/SESSION_0237.md`
  - `docs/sprints/SESSION_0238.md`
  - `docs/knowledge/wiki/files/discipline-detail-page.md`
  - `docs/knowledge/wiki/files/schools-detail-page.md`
  - `docs/knowledge/wiki/files/courses-listing-page.md`
  - `docs/architecture/lineage/lineage-public-viewer-editor-routes.md`
  - `apps/web/app/(web)/lineage/[treeSlug]/page.tsx`
  - `apps/web/app/(web)/disciplines/[slug]/page.tsx`
  - `apps/web/app/(web)/schools/[slug]/page.tsx`
  - `apps/web/app/(web)/courses/page.tsx`
  - `apps/web/lib/pages.ts`
  - `apps/web/lib/structured-data.ts`
  - `apps/web/server/web/lineage/queries.ts`
  - `apps/web/server/web/lineage/payloads.ts`
  - `apps/web/components/web/lineage/lineage-tree-board.tsx`
  - `apps/web/components/web/lineage/lineage-tree-canvas.tsx`

### Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Content/detail-page public chrome, page metadata helper, structured data, UI primitives (`Breadcrumbs`, `Intro`, `Section`) |
| Extension or replacement | Extension — apply existing public page-shell patterns to the standalone lineage viewer without replacing the custom canvas |
| Why justified | `/lineage/[treeSlug]` is a public detail surface currently using raw metadata and a bare section, while prior sessions established canonical public chrome for details/listings |
| Risk if bypassed | Lineage remains SEO/chrome-inconsistent; over-applying the pattern could squeeze or redesign the custom canvas and regress zoom/scroll/drawer behavior |

### FAILED_STEPS check

- Relevant mitigations acknowledged:
  - FS-0001: use existing L1 primitives; do not create scratch UI.
  - FS-0004 / FS-0005: full close requires concrete evidence.
  - SESSION_0238/0239 cwd + Graphify discipline: current work uses `/Users/brianscott/dev/ronin-dojo-app` and Graphify-first discovery.

### Drift register check

- D-001 through D-016 are resolved/closed. No open drift directly blocks lineage public chrome.

## Petey plan

### Scope pivot note

After the initial parity plan, Brian raised the strategic BBL direction: lineage is the core Black Belt Legacy proof product, not only page chrome. Petey recommendation: use BBL PRD/STORIES as the governing backlog now, but keep SESSION_0240 to one narrow product-foundation slice instead of boiling the full BBL roadmap.

### BBL product read

- `docs/product/black-belt-legacy/PRD.md`: BBL is the heritage/community brand; the product must prove identity, lineage, rank history, instructors, schools, stories, and trust signals.
- `docs/product/black-belt-legacy/STORIES.md`: story chain is `Profile -> Claim -> Rank History -> Lineage -> Curriculum -> Certification -> Community Trust`.
- `docs/runbooks/lineage-listing-runbook.md`: BBL is the lead brand for lineage monetization; `LINEAGE_TREE` is the highest-value listing type because it sells curation, not only personal identity.
- Current route tree has `/lineage/[treeSlug]`, `/lineage/[treeSlug]/claim`, and `/lineage/[treeSlug]/edit/[nodeId]`; there is no `/lineage` index page yet.

### One task for this session

SESSION_0240_TASK_01: decide and land the first BBL lineage foundation slice: a public published-lineage-tree slug/listing query that unlocks SSG for `/lineage/[treeSlug]` now and can feed a future `/lineage` index without rewriting the query.

### Why this task now

SESSION_0239 intentionally left `/lineage/[treeSlug]` as the next public parity candidate, and the current page is still a bare wrapper around the lineage board.

### Inputs read

- SESSION_0239 close notes.
- SESSION_0237/0238 public parity references.
- `apps/web/app/(web)/lineage/[treeSlug]/page.tsx`.
- `lineage-tree-board.tsx` and `lineage-tree-canvas.tsx` only for layout/scope safety.
- `server/web/lineage/queries.ts` and `payloads.ts` to verify public visibility/published handling and available data.

### Findings

- Target already uses `getRequestBrand()` and `getLineageTreeBySlug({ brand, slug })`.
- `getLineageTreeBySlug` already enforces published/public visibility for unauthenticated reads.
- Target metadata is raw `Metadata`, not `getPageMetadata`.
- Target lacks `Breadcrumbs`.
- Target uses raw `<section className="py-8">` and ad hoc `H4`/`Note` heading instead of `Intro`.
- Target lacks public structured data.
- Target has no `generateStaticParams` helper available today.
- Target has no related-lineage query available today.
- Canvas owns zoom, selection, scroll, transform scaling, badges, and drawer state. It must not be redesigned, narrowed, or wrapped in a sidebar layout that reduces horizontal exploration.

### Recommended implementation steps

1. Add a cached public slug query in `apps/web/server/web/lineage/queries.ts`, e.g. `findPublishedLineageTreeSlugs()`, returning `{ slug, brand }[]` for trees where `isPublished=true` and `visibility=PUBLIC`.
2. Consider adding a lightweight public listing query in the same module, e.g. `findPublishedLineageTrees({ brand, take })`, selecting only public-safe tree summary fields plus counts needed for cards/index JSON-LD. This is the bridge to `/lineage`.
3. Wire `generateStaticParams` on `/lineage/[treeSlug]` through the slug query.
4. Keep the lightweight page chrome from the initial plan: `getPageMetadata`, `Breadcrumbs`, `Intro`, full-width `Section.Content`, and optional `CollectionPage` JSON-LD.
5. Do not implement `/lineage` index, paid tiers, claim workflow, editor changes, or monetization bridge in this session unless Brian explicitly changes the deliverable.

### Scope guard

- Do not edit `lineage-tree-canvas.tsx`.
- Do not edit `lineage-tree-board.tsx`.
- Do not change `LineageTreeBoard` props or placement semantics.
- Do not change lineage query visibility, ACL, published, or profile drawer behavior.
- Do not add claim CTAs unless the current payload already exposes a trustworthy claimable-node flag; otherwise defer.
- Do not add related lineage trees or `generateStaticParams` unless an existing query already supports it; otherwise defer.
- Do not add a sidebar that competes with or narrows the canvas.

### Open decisions

- Does "lineage slug listing query" mean only `findPublishedLineageTreeSlugs()` for static params, or should SESSION_0240 also add the lightweight public tree-card query needed for a future `/lineage` index?
- Should `/lineage/[treeSlug]` get only `CollectionPage` JSON-LD now, or should schema work wait until the `/lineage` index/listing-card query exists?
- Claim CTAs remain deferred unless the current payload exposes a trustworthy claimable-node/tree flag or Brian explicitly approves a separate claim-flow slice.
- Full-width canvas shell remains the recommendation; no sidebar or canvas edits.

### Done means

- `/lineage/[treeSlug]` has `getPageMetadata`, Breadcrumbs, Intro, full-width Section shell, optional CollectionPage JSON-LD if approved, and a matching empty state.
- Existing lineage tree board/canvas behavior is unchanged.
- Targeted Biome and typecheck pass.
- Full close records verification, wiki/index decision, ADR/ubiquitous-language decision, graphify update, commit, and push to `main`.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0240_TASK_01 | done | Lineage public parity chrome + BBL foundation slice — planned in SESSION_0240 (Codex), implemented in SESSION_0241 (Copilot). `findPublishedLineageTreeSlugs`, `findPublishedLineageTrees`, `/lineage/[treeSlug]` public parity uplift, `/lineage` index page. |

## What landed

Work planned in this session was executed in SESSION_0241 (copilot-session-0241). See SESSION_0241 TASK_04 for full details.

## Status

### Status

Closed — work landed in SESSION_0241.

## Open decisions / blockers

None — all resolved in SESSION_0241.
