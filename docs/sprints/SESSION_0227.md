---
title: "SESSION 0227 - ContentVariant preview, media ordering, clickable post tags"
slug: session-0227
type: session--implement
status: closed-full
created: 2026-05-23
updated: 2026-05-23
last_agent: codex-session-0227
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0226.md
  - docs/architecture/decisions/0018-content-atom-canonical-relations.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0227 - ContentVariant preview, media ordering, clickable post tags

## Date

2026-05-23

## Operator

Brian + codex-session-0227

## Goal

Add Markdown preview for ContentVariant `renderedCopy`, media attachment drag-and-drop sort order, and clickable content post card tag badges on public `/posts`.

## Status

### Status: closed-full

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0226.md`
- Carryover: SESSION_0226 shipped inline ContentVariant management, media attachments, and `/posts` tag filtering. SESSION_0227 completes preview, ordering, and card tag interaction.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `b0c5c1e`

### Project-log waiver

- Project-log entries intentionally skipped for this session. `docs/protocols/project-log.md` is now large enough to degrade Copilot, and recent sessions have been avoiding hot-path writes there.
- Governance follow-up: rotate/archive the project log into a small current index plus historical shard files, or formally retire it in favor of SESSION files.

### Graphify check

- Graph status: current enough for navigation after SESSION_0226 graph update; stats at bow-in: 6990 nodes, 11413 edges, 953 communities, 1323 files tracked.
- Queries used:
  - `opening.md closing.md petey-plan.md graphify-repo-memory.md ritual docs`
  - `ContentVariant renderedCopy atom longFormCopy markdown preview toggle`
  - `media attachments reorder drag drop sort order content variants posts tag badges`
  - `@dnd-kit sortable DndContext SortableContext arrayMove useSortable drag handle`
  - `server admin content actions test upsertContentVariant attachMediaToAtom content-posts queries test`
- Files selected from graph:
  - `apps/web/app/admin/content/_components/content-atom-form.tsx`
  - `apps/web/app/admin/content/_components/content-variant-form.tsx`
  - `apps/web/app/admin/content/_components/content-media-panel.tsx`
  - `apps/web/server/admin/content/actions.ts`
  - `apps/web/server/admin/content/queries.ts`
  - `apps/web/server/admin/content/schema.ts`
  - `apps/web/components/web/content-posts/content-post-card.tsx`
  - `apps/web/server/web/content-posts/payloads.ts`
  - `apps/web/server/web/content-posts/queries.test.ts`
  - `apps/web/app/admin/tournaments/_components/divisions-editor.tsx`
- Verification note: exact files were opened after Graphify; Graphify was used as navigation, not proof.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Admin form patterns, content/blog rendering, storage/media, UI primitives, Prisma relation ordering |
| Extension or replacement | Extension: builds on existing Dirstarter form, media, card, action, and Prisma patterns |
| Why justified | ContentVariant preview and media sort order are required for usable content publishing; clickable card tags complete `/posts` discovery |
| Risk if bypassed | Variant edits can drop fields, media order is unstable, and card tags cannot drive public filtering |

Live docs checked during planning: Content, Blog, Media, Storage, Theming, Prisma.

## Petey plan

### Goal

Implement the full SESSION_0226 next-session goal without schema migration: ContentVariant preview, media attachment ordering, and clickable public post card tags.

### Tasks

#### SESSION_0227_TASK_01 - ContentVariant edit safety and preview

- **Agent:** Cody
- **What:** Fix variant edit hydration, then add Markdown preview toggle for `renderedCopy`.
- **Steps:** Extend atom detail variant select, preserve defaults, mirror atom `longFormCopy` preview UI.
- **Done means:** Existing variants keep editable copy fields on edit; `renderedCopy` can toggle between textarea and Markdown preview.
- **Depends on:** nothing

#### SESSION_0227_TASK_02 - Media attachment ordering

- **Agent:** Cody + Doug
- **What:** Add exact-membership reorder action and dnd-kit sortable admin grid with Save/Reset.
- **Steps:** Add reorder schema/action, append sort order on upload, make query ordering deterministic, update media panel, add focused tests.
- **Done means:** Admin can drag media locally, save order, reset local changes, and invalid reorder submissions are rejected.
- **Depends on:** nothing

#### SESSION_0227_TASK_03 - Clickable post card tag badges

- **Agent:** Cody + Desi
- **What:** Render post atom tags as clickable badges on public `/posts` cards.
- **Steps:** Restructure card to avoid nested anchors, link image/title/excerpt to post, link badges to `/posts?tag=slug`.
- **Done means:** Public post cards show wrapping tag badges and each badge filters `/posts` by that tag.
- **Depends on:** nothing

### Parallelism

TASK_03 can run in parallel because it owns public card files. TASK_01 and TASK_02 both touch admin content files and should run sequentially in the main workspace.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0227_TASK_01 | Cody | Clear admin form/query implementation |
| SESSION_0227_TASK_02 | Cody + Doug | Backend validation plus admin UI and tests |
| SESSION_0227_TASK_03 | Cody + Desi | Public card interaction and visual layout |

### Open decisions

- None. Decisions locked: full session goal, explicit media Save/Reset, exact reorder validation, clickable tag badges.

### Risks

- Existing variant edit hydration can drop fields if not fixed first.
- Reorder must reject partial or foreign attachment ID lists because `MediaAttachment` is shared by multiple owner types.
- Clickable tag badges require avoiding a full-card wrapping link.

### Scope guard

- Do not expand media upload MIME support.
- Do not add raw HTML rendering for `renderedCopy`.
- Do not move tags/media from ContentAtom to ContentVariant.

### Dirstarter implementation template

- **Docs read first:** Content, Blog, Media, Storage, Theming, Prisma live docs checked during planning.
- **Baseline pattern to extend:** Dirstarter/Ronin form primitives, safe action chain, Prisma relation selects, dnd-kit sortable admin pattern, Card/Badge/Link primitives.
- **Custom delta:** Ronin ContentAtom/ContentVariant publishing model, atom-owned media/tags per ADR 0018.
- **No-bypass proof:** This extends existing admin/content and public `/posts` paths rather than replacing Dirstarter content/blog/storage patterns.

## Cody pre-flight

### Pre-flight: ContentVariant renderedCopy preview

#### 1. Existing component scan

- Graphify query used: `ContentVariant renderedCopy atom longFormCopy markdown preview toggle`
- Found: `ContentAtomForm` longFormCopy preview pattern; `ContentVariantForm` target form; shared `Markdown` renderer.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: yes
- Consulted live alignment URLs: yes
- Closest L1 pattern: existing Ronin admin content form pattern in `content-atom-form.tsx`.
- Primitive API spot-check:
  - `Button`: supports `type`, `size`, `variant`, `prefix`, `isPending`, `disabled`, `onClick`.
  - `Stack`: supports layout sizing/wrapping class composition.
  - `TextArea`: standard textarea props.
  - `Markdown`: props `{ code: string }` plus `Prose` component props.
  - `inputVariants`: returns input-like class set for preview frame.

#### 3. Composition decision

- Extending existing component: `ContentVariantForm`
- Composing existing components: `Button`, `Stack`, `TextArea`, `Markdown`, form primitives.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes
- ADR read: `docs/architecture/decisions/0018-content-atom-canonical-relations.md`
- Runbook consulted: `docs/runbooks/graphify-repo-memory.md`

#### 5. Dev environment confirmed

- Dev server command: `pnpm --filter @ronin-dojo/web dev`
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`
- Brand/host for testing: local app host, `/admin/content/[id]` and `/posts`

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001, FS-0008
- Mitigation acknowledged: use existing primitives and exact source reads for primitive APIs and enum/schema fields.

### Pre-flight: Backend - media attachment reorder

#### 1. Auth predicates planned

- Session auth required: yes, via `adminActionClient`
- Brand column filtered: validate atom through current-brand variant visibility before allowing reorder.
- Authorization approach: admin safe action plus exact attachment membership check.

#### 2. Existing action scan

- Consulted Dirstarter baseline index and live docs: yes
- Graphify query used: `media attachments reorder drag drop sort order content variants posts tag badges`
- Related existing actions: `attachMediaToAtom`, `removeMediaAttachment`
- L1 pattern match: existing `adminActionClient` actions and dnd-kit sortable grid in tournament divisions.

#### 3. Data flow reference

- Relevant flow: ContentAtom owns tags/tools/media; ContentVariant inherits public rendering metadata per ADR 0018.
- Lifecycle stage: content authoring to public content post rendering.

#### 4. FAILED_STEPS check

- Prior failures in this area: FS-0008
- Manual Boundary Registry entries: none blocking found during planning.

### Pre-flight: ContentPostCard clickable tag badges

#### 1. Existing component scan

- Graphify query used: `card nested link badge clickable tags post-card link card render Link`
- Found: `ContentPostCard`, `ContentTagFilter`, `Badge`, `Stack`, `Link`, `Card`.

#### 2. L1 template scan

- Consulted alignment URLs: yes
- Closest L1 pattern: existing `Card` + `Link` + `Badge` composition in public web components.
- Primitive API spot-check:
  - `Card`: supports `render` but should remain a `div` for clickable nested badge links.
  - `Badge`: variants include `primary`, `soft`, `outline`, `success`, `caution`, `warning`, `info`, `danger`; sizes include `sm`, `md`, `lg`; supports `render`.
  - `Link`: Next link wrapper with hover prefetch.
  - `Stack`: supports wrapping tag rows.

#### 3. Composition decision

- Extending existing component: `ContentPostCard`
- Composing existing components: `Card`, `Badge`, `Stack`, `Link`.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes
- ADR read: ADR 0018
- Runbook consulted: Graphify repo memory.

#### 5. Dev environment confirmed

- Dev server command: `pnpm --filter @ronin-dojo/web dev`
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`
- Brand/host for testing: local `/posts`

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001
- Mitigation acknowledged: compose existing primitives; do not use raw card/badge replacements.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0227_TASK_01 | landed | ContentVariant edit safety and Markdown preview |
| SESSION_0227_TASK_02 | landed | Media attachment ordering |
| SESSION_0227_TASK_03 | landed | Clickable post card tag badges |

## What landed

- Fixed ContentVariant edit hydration by selecting all editable variant fields on the atom detail query: `renderedCopy`, `excerpt`, `cta`, `thumbnailUrl`, `videoUrl`, and `voiceNotes`.
- Added a Markdown preview toggle for `ContentVariant.renderedCopy` using the atom `longFormCopy` pattern.
- Added deterministic media attachment ordering by `sortOrder` then `createdAt`.
- Added `reorderContentAtomMediaAttachments` with exact-membership validation for duplicate, stale, missing, foreign, and cross-owner attachment IDs.
- Updated `attachMediaToAtom` to validate the atom against the current brand and append new media at `max(sortOrder) + 1`.
- Converted the admin content media panel into a dnd-kit sortable grid with drag handles, local order state, Save, Reset, pending states, and toasts.
- Restructured public `ContentPostCard` to avoid a wrapping card link and render clickable tag badges linking to `/posts?tag=<slug>`.
- Added server tests for media reorder/append behavior and a content post payload test for card tag data.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/app/admin/content/_components/content-variant-form.tsx` | Added `renderedCopy` Markdown preview toggle and preserved editable variant defaults |
| `apps/web/app/admin/content/_components/content-media-panel.tsx` | Added sortable media grid with Save/Reset ordering controls |
| `apps/web/components/web/content-posts/content-post-card.tsx` | Restructured card links and added clickable tag badges |
| `apps/web/server/admin/content/actions.ts` | Added media reorder action, exact validation, current-brand attach validation, upload append sort order |
| `apps/web/server/admin/content/queries.ts` | Hydrated editable variant fields; made media ordering deterministic |
| `apps/web/server/admin/content/actions.safe-action.test.ts` | Added media reorder and upload append tests |
| `apps/web/server/web/content-posts/queries.test.ts` | Added list payload tag assertion |
| `docs/sprints/SESSION_0227.md` | Session record |
| `docs/knowledge/wiki/index.md` | Added SESSION_0225 through SESSION_0227 rows and bumped metadata |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun --cwd apps/web biome check --write app/admin/content/_components/content-variant-form.tsx app/admin/content/_components/content-media-panel.tsx components/web/content-posts/content-post-card.tsx server/admin/content/actions.ts server/admin/content/queries.ts server/admin/content/actions.safe-action.test.ts server/web/content-posts/queries.test.ts` | Pass after semantic list fix; no remaining fixes |
| `bun --cwd apps/web test server/admin/content/actions.safe-action.test.ts --concurrency=1` | Pass; 4 tests |
| `bun --cwd apps/web test server/web/content-posts/queries.test.ts --concurrency=1` | Pass; 14 tests |
| `pnpm --filter @ronin-dojo/web typecheck` | Pass |
| `bun --cwd apps/web test -- --concurrency=1` | Pass; 262 tests |
| `pnpm --filter @ronin-dojo/web build` | Pass; existing workspace-root and NFT warnings only |
| `curl -I http://localhost:3000/posts` | Pass; 200 OK |
| `curl -s http://localhost:3000/posts` tag/post link check | Pass; found `/posts?tag=` links and `/posts/` links |
| `bun run wiki:lint` | Pass; 0 errors, 500 warnings (pre-existing orphan/R8 warnings; no SESSION_0227 warnings) |

## Decisions resolved

- Full three-deliverable session.
- Media ordering uses drag locally plus explicit Save/Reset.
- Reorder validation requires exact membership match.
- Public card tag badges are clickable filters.

## Open decisions / blockers

- Governance follow-up: `docs/protocols/project-log.md` should be rotated/archived into smaller shards or formally retired. It is too large for hot-path Copilot use, so SESSION_0227 skipped project-log writes by user direction.

## Next session

### Goal

Governance cleanup for the oversized project log, then continue Content Engine polish if time remains.

### First task

Plan and execute a project-log rotation/retirement approach: keep a small current index, move historical entries into sharded archives, and update closing/opening references so agents stop appending to the monolith.

## Review log

### SESSION_0227_REVIEW_01 - Full-close review

- **Reviewed tasks:** SESSION_0227_TASK_01, SESSION_0227_TASK_02, SESSION_0227_TASK_03.
- **Dirstarter docs check:** Content, Blog, Media, Storage, Theming, and Prisma docs checked during planning. Implementation extends existing form/action/media/card patterns and does not replace Dirstarter layers.
- **Verdict:** Pass. No P0/P1 findings.
- **Score:** 9.7/10. Project-log waiver is intentional and recorded; follow-up is governance cleanup.
- **Follow-up:** Project-log rotation/retirement is the next best session target.

## Hostile close review

- **Giddy:** Pass. No schema migration; media ordering uses existing `MediaAttachment.sortOrder`; public tag links preserve ADR 0018 ContentAtom-owned metadata.
- **Doug:** Pass. New reorder action has exact-membership tests; full unit suite and build pass; `/posts` smoke verified tag links and post links.
- **Desi:** Pass with note. Clickable tag badges required removing the full-card anchor, avoiding nested links while preserving image/title/excerpt navigation.

## ADR / ubiquitous-language check

- ADR update not required. ADR 0018 remains valid because tags and media stay owned by `ContentAtom`; no ContentVariant media/tag override model was introduced.
- Ubiquitous language update not required. No new domain term was introduced.

## Reflections

- The important bug was not the preview toggle; it was that editing an existing variant could blank fields because the atom detail query did not hydrate the full edit payload.
- The media model already had the right ordering field. The work was enforcing exact ownership and order membership so the UI cannot save stale or foreign attachment lists.
- The public tag decision was correct, but it forced a card structure change. Keeping a full-card anchor would have produced invalid nested links.
- The project log has become operational drag. The SESSION file is doing the useful per-session record work; the log needs sharding or retirement.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `SESSION_0227.md` created with JETTY frontmatter; `wiki/index.md` metadata bumped to 2026-05-23 / codex-session-0227 |
| Backlinks/index sweep | `wiki/index.md` now includes SESSION_0225, SESSION_0226, and SESSION_0227 rows; no new wiki pages created |
| Wiki lint | `bun run wiki:lint` passed with 0 errors and 500 warnings; warnings are pre-existing orphan/R8 cleanup debt, no SESSION_0227 warnings |
| Kaizen reflection | Reflections section present |
| Hostile close review | `SESSION_0227_REVIEW_01` in this SESSION file; project-log write intentionally waived |
| Review & Recommend | Next session goal written |
| Memory sweep | No operator memory update needed; project-log governance issue recorded as next-session target |
| Next session unblock check | Unblocked; first task is a governance cleanup plan for project-log rotation/retirement |
| Git hygiene | Pending final commit/push; final response will report commit hash |
| Graphify update | Pending after git hygiene; final response will report stats |
