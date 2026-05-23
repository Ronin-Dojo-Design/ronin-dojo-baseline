---
title: "SESSION 0226 — ContentVariant inline tab, media attachments, public tag filtering"
slug: session-0226
type: session--implement
status: in-progress
created: 2026-05-23
updated: 2026-05-23
last_agent: copilot-session-0226
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0225.md
  - docs/architecture/decisions/0018-content-atom-canonical-relations.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0226 — ContentVariant inline tab, media attachments, public tag filtering

## Date

2026-05-23

## Operator

Brian + copilot-session-0226

## Goal

Add ContentVariant inline tab on atom edit, media attachment management with S3 upload via FormMedia, and public `/posts` tag filtering.

## Status

### Status: in-progress

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0225.md`
- Carryover: SESSION_0225 shipped `/admin/content` CRUD. This session adds variant tab, media, and public tag filtering.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean

### Graphify check

- Graph status: available; stats at bow-in: 6977 nodes, 11356 edges, 931 communities, 1319 files tracked.
- Queries used: `ContentVariant ContentAtom admin edit form variant tab`, `ContentVariant FormMedia S3 upload media attachment`, `content atom form edit page admin`.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Admin form patterns, Tabs component, FormMedia, public content queries |
| Extension or replacement | Extension: adding tabs + variant form to existing `/admin/content/[id]`; extending public `/posts` with tag filter |
| Why justified | ContentVariant CRUD needed for multi-channel publishing; media needed for rich content; tag filtering for discoverability |
| Risk if bypassed | Variants only manageable via seed scripts; no media on atoms; no content discoverability by tag |

## Petey plan

### Goal

Ship three features: (1) ContentVariant inline management on atom edit page, (2) media attachment management with FormMedia/S3 upload, (3) public `/posts` tag filtering.

### Decisions locked

1. Variant management is inline on `/admin/content/[id]` via Tabs component — not a separate route.
2. Use Dirstarter `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` from `components/common/tabs.tsx`.
3. Variant form fields: publicTitle, publicSlug, channel, status, excerpt, renderedCopy, cta, thumbnailUrl, videoUrl, voiceNotes, publishDate.
4. Use `FormMedia` for thumbnailUrl on variant form (same pattern as tool-form).
5. Media attachments on atom edit: list existing + upload new via FormMedia with S3 path `content/{atomId}/media`.
6. `upsertContentVariant` and `deleteContentVariant` actions via `adminActionClient`.
7. Public tag filtering: add `tag` search param to `/posts` page, filter via `atom.tags` relation.
8. `contentPostManyPayload` needs `atom.tags` for tag display on cards.

### Tasks

| ID | Agent | Summary |
| --- | --- | --- |
| SESSION_0226_TASK_01 | Cody | Server layer: variant schema, upsert/delete actions |
| SESSION_0226_TASK_02 | Cody | Variant inline tab on atom edit page with form |
| SESSION_0226_TASK_03 | Cody | Media attachment list + upload on atom edit |
| SESSION_0226_TASK_04 | Cody | Public `/posts` tag filtering |
| SESSION_0226_TASK_05 | Cody + Doug | Verification, lint, typecheck, close |

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0226_TASK_01 | pending | Server layer: variant schema, upsert/delete actions |
| SESSION_0226_TASK_02 | pending | Variant inline tab on atom edit page with form |
| SESSION_0226_TASK_03 | pending | Media attachment list + upload on atom edit |
| SESSION_0226_TASK_04 | pending | Public `/posts` tag filtering |
| SESSION_0226_TASK_05 | pending | Verification, lint, typecheck, close |
