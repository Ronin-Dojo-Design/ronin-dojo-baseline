---
title: "SESSION 0040 — Content + Curriculum surfaces (Recipe 1: Course admin CRUD)"
slug: session-0040
type: session
status: closed-unclean
created: 2026-05-03
updated: 2026-05-03
last_agent: copilot-session-0040
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0039.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0040 — Content + Curriculum surfaces

## Date

2026-05-03

## Operator

Brian Scott + Copilot (Cody — builder)

## Status

closed-quick

## Goal

Build Recipe 1 from LANE-S040: Course + CurriculumItem admin CRUD. Follow Dirstarter admin CRUD pattern (Tools). If context allows, also tackle Recipe 3 (Certificate template admin CRUD).

## Tasks

| ID | Description | Status |
|---|---|---|
| SESSION_0040_TASK_01 | Course + CurriculumItem admin CRUD (server actions, queries, schemas, pages) | ✅ done |
| SESSION_0040_TASK_02 | Certificate template admin CRUD | ✅ done |

## Context

- Lane manifest: `docs/sprints/lanes/LANE-S040-content-curriculum.md`
- Pattern source: `server/admin/tools/` (Dirstarter admin CRUD)
- Schema models already exist (Wave D, SESSION_0026): Course, CurriculumItem, CourseEnrollment, CurriculumItemCompletion
- No migration needed

## What landed

- **Course + CurriculumItem admin CRUD** — full server layer (actions, schema, queries) + 3 pages + 4 components including drag-reorder curriculum items editor with optimistic UI
- **Certificate Template admin CRUD** — full server layer + 3 pages + 3 components with price, delivery method, brand scoping
- All 15 new files pass `tsc --noEmit` with zero errors
- Pattern: exact replica of Dirstarter Tools admin (adminActionClient, after() revalidation, nuqs table params, useHookFormAction)

## Files touched

- `apps/web/server/admin/courses/actions.ts` — New: upsert/delete course + curriculum items, reorder
- `apps/web/server/admin/courses/schema.ts` — New: Zod schemas + nuqs table params
- `apps/web/server/admin/courses/queries.ts` — New: paginated list, by-id with includes
- `apps/web/app/admin/courses/page.tsx` — New: list page
- `apps/web/app/admin/courses/new/page.tsx` — New: create page
- `apps/web/app/admin/courses/[id]/page.tsx` — New: edit page + curriculum editor
- `apps/web/app/admin/courses/_components/courses-table.tsx` — New: data table
- `apps/web/app/admin/courses/_components/courses-table-columns.tsx` — New: columns
- `apps/web/app/admin/courses/_components/course-form.tsx` — New: form
- `apps/web/app/admin/courses/_components/curriculum-items-editor.tsx` — New: reorderable items
- `apps/web/server/admin/certificates/actions.ts` — New: upsert/delete
- `apps/web/server/admin/certificates/schema.ts` — New: Zod schemas + nuqs
- `apps/web/server/admin/certificates/queries.ts` — New: paginated list, by-id
- `apps/web/app/admin/certificates/page.tsx` — New: list page
- `apps/web/app/admin/certificates/new/page.tsx` — New: create page
- `apps/web/app/admin/certificates/[id]/page.tsx` — New: edit page
- `apps/web/app/admin/certificates/_components/certificates-table.tsx` — New: data table
- `apps/web/app/admin/certificates/_components/certificates-table-columns.tsx` — New: columns
- `apps/web/app/admin/certificates/_components/certificate-template-form.tsx` — New: form
- `docs/sprints/SESSION_0040.md` — This file

## Decisions resolved

- **Stack prop is `size` not `gap`** — discovered from source
- **useComputedField prop is `callback` not `compute`** — discovered from source
- **Badge variants: `success`/`soft`** — not `positive`/`default`
- **PageProps generic not needed** — withAdminPage accepts `any`, just use untyped params

## Open decisions / blockers

- Recipe 2 (Technique library public pages) — next session
- Admin sidebar nav links for Courses + Certificates not yet added (need to find sidebar config)
- Organization/Discipline/Rank selectors are plain text ID inputs — could be relation selectors in follow-up

## Next session

**Goal**: Recipe 2 — Technique library public pages (browse/search/filter with media)

**Inputs to read**:
- `docs/sprints/lanes/LANE-S040-content-curriculum.md` Recipe 2 section
- `apps/web/app/(web)/tools/page.tsx` + `components/web/tools/` — public listing pattern
- `apps/web/server/web/tools/queries.ts` — public query pattern

**First task**: Read public Tools listing pattern, then create `app/(web)/techniques/` pages + `server/web/techniques/queries.ts` with brand-scoped, filterable technique listing.
