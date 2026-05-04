---
title: "SESSION 0042 — Tournament Operations: Admin CRUD + Public Discovery"
slug: session-0042
type: session
status: in-progress
created: 2026-05-03
updated: 2026-05-03
last_agent: copilot-session-0042
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0041_5.md
  - docs/sprints/lanes/LANE-S042-tournament-ops.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0042 — Tournament Operations: Admin CRUD + Public Discovery

## Date

2026-05-03

## Operator

Brian Scott + Copilot (Petey — planner)

## Status

in-progress

## Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Admin CRUD (Tools pattern), public listing/detail (Tools pattern), Stripe checkout |
| Extension or replacement | **Extension** — no tournament equivalent in Dirstarter; reuses admin + public patterns |
| Why justified | WEKAF's core differentiator; Baseline events need registration; calendar target May 6–7 |
| Risk if bypassed | WEKAF launches without tournaments; Baseline has no event registration |

## Goal

Build Recipes 1 + 2 from LANE-S042 (Tournament Operations): Tournament + Division admin CRUD, and public event discovery pages. Recipe 3 (Registration checkout with Stripe) deferred to a follow-up session to keep scope tight.

## Plan (Petey)

### Task breakdown

| ID | Description | Agent | Depends on |
| --- | --- | --- | --- |
| SESSION_0042_TASK_01 | Read admin Tools pattern + existing Course admin (our own prior art) for nested-entity conventions | Cody | — |
| SESSION_0042_TASK_02 | Create `server/admin/tournaments/schema.ts` — Zod schemas for tournament upsert (with nested Division array) | Cody | TASK_01 |
| SESSION_0042_TASK_03 | Create `server/admin/tournaments/queries.ts` — list + detail with Division includes, brand-scoped | Cody | TASK_01 |
| SESSION_0042_TASK_04 | Create `server/admin/tournaments/actions.ts` — upsert/delete tournament with nested divisions, status transitions, `adminActionClient`, revalidation | Cody | TASK_02, TASK_03 |
| SESSION_0042_TASK_05 | Create admin pages: `app/admin/tournaments/page.tsx`, `new/page.tsx`, `[id]/page.tsx` | Cody | TASK_04 |
| SESSION_0042_TASK_06 | Create `server/web/tournaments/queries.ts` + `payloads.ts` — public queries (OPEN status only), filters by discipline/date/location | Cody | TASK_01 |
| SESSION_0042_TASK_07 | Create `app/(web)/tournaments/page.tsx` + `[slug]/page.tsx` — public list + detail with division table | Cody | TASK_06 |
| SESSION_0042_TASK_08 | Create components: `tournament-card.tsx`, `tournament-list.tsx`, `tournament-filters.tsx`, `division-table.tsx` | Cody | TASK_06 |
| SESSION_0042_TASK_09 | Type-check all new files (`tsc --noEmit`) | Cody | TASK_05–08 |

### Delta from Dirstarter Tools admin pattern

- **Entity:** `Tournament` with nested `Division` (like Course → CurriculumItem)
- **Status workflow:** DRAFT → OPEN → CLOSED → IN_PROGRESS → COMPLETED (enum transitions enforced in action)
- **Date fields:** startDate, endDate, registrationDeadline
- **Division fields:** name, format, gender, ageMin/Max, weightMin/Max, discipline, maxCompetitors
- **Public filter:** only `status = OPEN` shown; sorted by startDate ASC
- **Brand scoping:** all queries `where: { brand }` (L3)

### Open decisions (for Cody to resolve during TASK_01)

1. Division `format` enum values — confirm from schema (SINGLE_ELIM, DOUBLE_ELIM, ROUND_ROBIN, etc.)
2. Admin pages: use tabs for tournament info vs divisions, or single scrollable form? → Mirror Course pattern (inline nested editor)
3. Public tournament card: what metadata to show? → Name, date range, location, discipline count, spots remaining

### Acceptance criteria

- Admin can create a Tournament with name, dates, location, brand
- Admin can add Divisions with format, gender, age/weight rules, discipline link
- Admin can transition tournament status (DRAFT → OPEN, etc.)
- Public page at `/tournaments` lists OPEN tournaments, brand-scoped
- Public detail at `/tournaments/[slug]` shows divisions + availability
- All queries brand-scoped
- All files pass `tsc --noEmit`

### Scope guard

**IN:** Tournament admin CRUD, Division admin CRUD, public discovery pages.

**OUT (next session):** Registration checkout, Stripe payment, brackets, scoring, mat assignments, officials.

## Context

- Lane manifest: `docs/sprints/lanes/LANE-S042-tournament-ops.md`
- Pattern source: `server/admin/tools/`, `server/admin/courses/` (our own nested-entity prior art)
- Schema: `Tournament`, `TournamentDiscipline`, `Division` models (Wave C — landed SESSION_0026)
- Prior art: SESSION_0040 Course admin (nested CurriculumItems) is the closest pattern match

## What landed

- **Tournament + Division admin CRUD** — full server layer (schema, queries, actions with status transitions) + 4 admin components + 3 admin pages
- **Public tournament discovery** — server queries (PUBLISHED only, brand-scoped) + payloads + 2 public pages + 4 components
- **Status transition enforcement** — DRAFT→PUBLISHED→CLOSED→ARCHIVED with validation guard in action
- **Division display** — full table with format, gender, age, weight, fee, capacity/spots
- All new files pass `tsc --noEmit` (0 new errors; 2 pre-existing unrelated errors)

## Files touched

- `apps/web/server/admin/tournaments/schema.ts` — New: Zod schemas + nuqs table params + filter params
- `apps/web/server/admin/tournaments/queries.ts` — New: findTournaments, findTournamentById, findTournamentBySlug
- `apps/web/server/admin/tournaments/actions.ts` — New: upsert/delete tournament, status transitions, discipline CRUD, division CRUD
- `apps/web/server/web/tournaments/payloads.ts` — New: Prisma select payloads (card + detail)
- `apps/web/server/web/tournaments/queries.ts` — New: searchTournaments + findTournamentBySlug (public, cached)
- `apps/web/app/admin/tournaments/page.tsx` — New: admin list page
- `apps/web/app/admin/tournaments/new/page.tsx` — New: create page
- `apps/web/app/admin/tournaments/[id]/page.tsx` — New: edit page with divisions
- `apps/web/app/admin/tournaments/_components/tournaments-table.tsx` — New: data table
- `apps/web/app/admin/tournaments/_components/tournaments-table-columns.tsx` — New: column defs
- `apps/web/app/admin/tournaments/_components/tournament-form.tsx` — New: form with all fields
- `apps/web/app/admin/tournaments/_components/divisions-editor.tsx` — New: inline division management
- `apps/web/app/(web)/tournaments/page.tsx` — New: public list page
- `apps/web/app/(web)/tournaments/[slug]/page.tsx` — New: public detail page
- `apps/web/components/web/tournaments/tournament-query.tsx` — New: async server orchestrator
- `apps/web/components/web/tournaments/tournament-list.tsx` — New: grid list
- `apps/web/components/web/tournaments/tournament-card.tsx` — New: card with date/location/disciplines
- `apps/web/components/web/tournaments/division-table.tsx` — New: division table for detail page

## Decisions resolved

- **TournamentStatus enum**: DRAFT/PUBLISHED/CLOSED/ARCHIVED (not OPEN/IN_PROGRESS/COMPLETED as lane manifest assumed — confirmed from schema)
- **Status transitions**: enforced server-side in action (DRAFT→PUBLISHED→CLOSED→ARCHIVED, PUBLISHED↔DRAFT allowed)
- **Division nesting**: Division → TournamentDiscipline → Tournament (not directly on Tournament)
- **Public filter**: `status: "PUBLISHED"` (matches schema enum; lane manifest said "OPEN" which doesn't exist)
- **Slug auto-generation**: from `name` field via `slugify` (same as Course/Tool pattern)

## Open decisions / blockers

- None blocking start — Stripe registration deferred to follow-up session

## Next session

**Goal**: Tournament Registration checkout (Recipe 3 from LANE-S042) — Stripe payment, capacity check, Registration + RegistrationEntry creation

**Inputs to read**: This session's patterns, `server/web/entitlement/grant-entitlement.ts`, webhook route

**First task**: Read Stripe webhook pattern and build registration action
