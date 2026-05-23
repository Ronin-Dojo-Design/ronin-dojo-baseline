---
title: "SESSION 0225 — ContentAtom admin: server layer, list, and form"
slug: session-0225
type: session--implement
status: closed-quick
created: 2026-05-22
updated: 2026-05-23
last_agent: copilot-session-0225
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0224.md
  - docs/architecture/decisions/0018-content-atom-canonical-relations.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/project-log.md
---

# SESSION 0225 — ContentAtom admin: server layer, list, and form

## Date

2026-05-22

## Operator

Brian + copilot-session-0225

## Goal

Build the `/admin/content` management surface for ContentAtom CRUD: server layer (schema, queries, actions), data-table list page, and create/edit form with tags, tools, discipline, style, and status.

## Status

### Status: closed-quick

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0224.md`
- Carryover: product decision locked — admin ContentAtom management surface chosen over public filtering.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean

### Graphify check

- Graph status: available; stats at bow-in: 6955 nodes, 11234 edges, 942 communities, 1307 files tracked.
- Queries used: `ContentAtom admin CRUD`, `content-posts queries payloads`, `ContentAtom ContentVariant public posts navigation filtering`.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Admin patterns (data-table, HOC, actions, relation-selector), Prisma queries |
| Extension or replacement | Extension: new `/admin/content` route; existing `/admin/posts` stays for Dirstarter Post model |
| Why justified | ContentAtom is the Ronin structured content system; needs its own admin surface |
| Risk if bypassed | No way to manage content atoms outside seed scripts; blocks operator workflow |

## Petey plan

### Goal

Ship `/admin/content` with ContentAtom list + create/edit, following existing admin patterns exactly.

### Decisions locked

1. Route: `/admin/content`
2. Server layer mirrors `server/admin/posts/` pattern (schema.ts, queries.ts, actions.ts)
3. Reuse `RelationSelector` for tags, tools, discipline, style
4. Use `FormMedia` pattern for thumbnail/media in SESSION_0226 (not this session)
5. `adminActionClient` HOC chain for auth
6. Dirstarter `/admin/posts` stays untouched

### Tasks

| ID | Agent | Summary |
| --- | --- | --- |
| SESSION_0225_TASK_01 | Cody | Server layer: schema, queries, actions |
| SESSION_0225_TASK_02 | Cody | Admin content list page with data-table |
| SESSION_0225_TASK_03 | Cody | Admin content atom form (create + edit) |
| SESSION_0225_TASK_04 | Cody + Doug | Nav link, verification, close |

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0225_TASK_01 | landed | Server layer: schema, queries, actions |
| SESSION_0225_TASK_02 | landed | Admin content list page with data-table |
| SESSION_0225_TASK_03 | landed | Admin content atom form (create + edit) |
| SESSION_0225_TASK_04 | landed | Nav link, verification, close |

## What landed

- Created `server/admin/content/schema.ts` with Zod validation schema, nuqs table params, and `ContentAtomSchema` type.
- Created `server/admin/content/queries.ts` with `findContentAtoms` (brand-scoped, paginated), `findContentAtomById` (full relations), and `findStyleOptions`.
- Created `server/admin/content/actions.ts` with `upsertContentAtom` (creates atom + default BLOG variant) and `deleteContentAtoms` using `adminActionClient` HOC.
- Created `/admin/content/page.tsx` with `ContentAtomsTable` data-table (title, status, discipline, tag/variant/media counts, row actions).
- Created `/admin/content/new/page.tsx` and `/admin/content/[id]/page.tsx` with `ContentAtomForm` (title, slug, hook, longFormCopy, status, discipline, style, tags, tools via `RelationSelector`).
- Added "Content" nav link to admin sidebar with `FileTextIcon`.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/admin/content/schema.ts` | New: Zod schema, nuqs table params |
| `apps/web/server/admin/content/queries.ts` | New: findContentAtoms, findContentAtomById, findStyleOptions |
| `apps/web/server/admin/content/actions.ts` | New: upsertContentAtom, deleteContentAtoms |
| `apps/web/app/admin/content/page.tsx` | New: list page with data-table |
| `apps/web/app/admin/content/_components/content-atoms-table.tsx` | New: table component |
| `apps/web/app/admin/content/_components/content-atoms-table-columns.tsx` | New: column definitions |
| `apps/web/app/admin/content/_components/content-atoms-table-toolbar-actions.tsx` | New: toolbar bulk actions |
| `apps/web/app/admin/content/_components/content-atom-actions.tsx` | New: row actions (edit, delete) |
| `apps/web/app/admin/content/_components/content-atoms-delete-dialog.tsx` | New: delete confirmation dialog |
| `apps/web/app/admin/content/_components/content-atom-form.tsx` | New: create/edit form |
| `apps/web/app/admin/content/new/page.tsx` | New: create page |
| `apps/web/app/admin/content/[id]/page.tsx` | New: edit page |
| `apps/web/components/admin/sidebar.tsx` | Added Content nav link |
| `docs/sprints/SESSION_0225.md` | Session file |

## Verification

| Command / smoke | Result |
| --- | --- |
| `pnpm --filter @ronin-dojo/web typecheck` | Pass |
| `bun --cwd apps/web biome check --write` | Pass (2 files auto-fixed) |
| `bun --cwd apps/web test -- --concurrency=1` | Pass; 257 tests |
| `pnpm --filter @ronin-dojo/web build` | Pass; `/admin/content`, `/admin/content/[id]`, `/admin/content/new` all in build |

## Decisions resolved

- `/admin/content` route for ContentAtom CRUD; `/admin/posts` stays for Dirstarter Post model.
- `upsertContentAtom` auto-creates a default BLOG variant for the current brand on atom creation.
- Style query uses `status: APPROVED` filter (no brand/isSystem on Style model).
- No media upload UI this session; that's SESSION_0226.

## Next session

### Goal

Add ContentVariant inline tab on atom edit, media attachment management with S3 upload via FormMedia, and public `/posts` tag filtering.

### First task

Add a Variants tab/section on `/admin/content/[id]` with create/edit form for ContentVariant fields.

## Git hygiene

- Branch: `main`
- Commit: `b2d5b55` — `feat(admin): add /admin/content CRUD for ContentAtom`
- Push: `main -> main` on `Ronin-Dojo-Design/ronin-dojo-baseline`
- Graphify update: incremental rebuild — 15 nodes, 139 edges, 931 communities

## Open decisions / blockers

- None for this session.
- SESSION_0226 is unblocked: ContentVariant tab, media uploads, public tag filtering.
