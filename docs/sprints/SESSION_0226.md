---
title: "SESSION 0226 — ContentVariant inline tab, media attachments, public tag filtering"
slug: session-0226
type: session--implement
status: closed-quick
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

### Status: closed-quick

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
| SESSION_0226_TASK_01 | landed | Server layer: variant schema, upsert/delete actions |
| SESSION_0226_TASK_02 | landed | Variant inline tab on atom edit page with form |
| SESSION_0226_TASK_03 | landed | Media attachment list + upload on atom edit |
| SESSION_0226_TASK_04 | landed | Public `/posts` tag filtering |
| SESSION_0226_TASK_05 | landed | Verification, lint, typecheck, close |

## What landed

- Added `contentVariantSchema` Zod schema (channel, status, publicTitle, publicSlug, renderedCopy, excerpt, cta, thumbnailUrl, videoUrl, voiceNotes, publishDate).
- Added `upsertContentVariant`, `deleteContentVariant`, `attachMediaToAtom`, `removeMediaAttachment` server actions.
- Added `findContentVariantById` query.
- Refactored `/admin/content/[id]/page.tsx` to use `Tabs` with Details, Variants, and Media tabs.
- Created `ContentVariantForm` — inline create/edit form for ContentVariant with channel, status, public title/slug, excerpt, rendered copy, CTA, publish date, thumbnail/video URLs, voice notes.
- Created `ContentVariantsPanel` — list/create/edit/delete variants inline on atom edit.
- Created `ContentMediaPanel` — upload media via S3, list attached media with thumbnails, delete attachments.
- Created `ContentTagFilter` — badge-based tag filter on `/posts` page using `?tag=` search param.
- Updated `findPublishedContentPosts` to accept optional `tagSlug` filter.
- Added `findPublishedContentTags` query for published-content-aware tag list.
- Extended `contentPostManyPayload` with `atom.tags` for card-level tag display.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/admin/content/schema.ts` | Added `contentVariantSchema`, `ContentVariantSchema` |
| `apps/web/server/admin/content/actions.ts` | Added upsertContentVariant, deleteContentVariant, attachMediaToAtom, removeMediaAttachment |
| `apps/web/server/admin/content/queries.ts` | Added findContentVariantById |
| `apps/web/app/admin/content/[id]/page.tsx` | Refactored to Tabs (Details, Variants, Media) |
| `apps/web/app/admin/content/_components/content-variant-form.tsx` | New: variant create/edit form |
| `apps/web/app/admin/content/_components/content-variants-panel.tsx` | New: variants list panel |
| `apps/web/app/admin/content/_components/content-media-panel.tsx` | New: media upload/list panel |
| `apps/web/components/web/content-posts/content-tag-filter.tsx` | New: tag filter badges |
| `apps/web/app/(web)/posts/page.tsx` | Added tag filtering + ContentTagFilter |
| `apps/web/server/web/content-posts/queries.ts` | Extended findPublishedContentPosts with tagSlug; added findPublishedContentTags |
| `apps/web/server/web/content-posts/payloads.ts` | Added atom.tags to contentPostManyPayload |
| `docs/sprints/SESSION_0226.md` | Session file |

## Verification

| Command / smoke | Result |
| --- | --- |
| `pnpm --filter @ronin-dojo/web typecheck` | Pass |
| `bun --cwd apps/web biome check --write` | Pass (6 files auto-fixed) |
| `bun --cwd apps/web test -- --concurrency=1` | Pass; 257 tests |
| `pnpm --filter @ronin-dojo/web build` | Pass; all admin/content routes and /posts in build |

## Decisions resolved

- ContentVariant inline management on `/admin/content/[id]` via Tabs — no separate variant routes.
- Media attachments: two-step create (Media record → MediaAttachment link) for Prisma compatibility.
- Tag filtering on `/posts` uses `?tag=slug` search param with badge-based UI.
- `contentPostManyPayload` extended with tags to support card-level tag rendering.

## Next session

### Goal

ContentVariant `renderedCopy` preview with Markdown renderer, media attachment reordering (drag-and-drop sort order), and content post card tag badges on public `/posts`.

### First task

Add Markdown preview toggle on ContentVariant `renderedCopy` field (same pattern as atom longFormCopy).

## Git hygiene

- Branch: `main`
- Commit: `b097bfe` — `feat(admin): add ContentVariant inline tab, media attachments, public tag filtering`
- Push: `main -> main` on `Ronin-Dojo-Design/ronin-dojo-baseline`
- Graphify update: incremental rebuild — 6990 nodes, 11413 edges, 953 communities, 1323 files tracked

## Open decisions / blockers

- None for this session.
