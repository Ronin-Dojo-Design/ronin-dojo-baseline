---
title: "SESSION 0122 — Disciplines List + Detail Pages (Entity Page Arc Reference)"
slug: session-0122
type: session
status: closed-quick
created: 2026-05-11
updated: 2026-05-11
last_agent: copilot-session-0122
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0121.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0122 — Disciplines List + Detail Pages (Entity Page Arc Reference)

## Date

2026-05-11

## Operator

Brian Scott + Copilot (Petey → Cody)

## Status

in-progress

## Graphify Check

- Deferred — UI-focused session, single entity page arc. Will query if cross-cutting concerns arise.

## Failed Steps / Drift Check

- FS-0001 (component inventory gate): **active** — must read `dirstarter-component-inventory.md` before any UI code.
- Drift register: no open entries relevant to disciplines pages.

## Dirstarter Alignment Table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | `app/(web)/categories/[slug]/page.tsx` pattern replicated for disciplines |
| Extension or replacement | Extension — new entity pages following existing category page layout |
| Why justified | Disciplines are the first entity page; using Dirstarter category pattern as gold standard |
| Risk if bypassed | Inconsistent page layouts, missed SEO/structured data, skeleton/suspense gaps |

## Goal

Build `/disciplines` list page + `/disciplines/[slug]` detail page as the Dirstarter-pattern reference implementation for the entity page arc. Queries, components, skeletons, breadcrumbs, structured data.

---

## First Task

Read component inventory + Discipline schema, then create `findDisciplines()` and `findDisciplineBySlug()` queries.

## Task Plan

- SESSION_0122_TASK_01 — Read component inventory + Discipline schema (pre-flight)
- SESSION_0122_TASK_02 — Create `findDisciplines()` and `findDisciplineBySlug()` queries
- SESSION_0122_TASK_03 — Build discipline list page (Breadcrumbs → Intro → Suspense → Card grid)
- SESSION_0122_TASK_04 — Build discipline detail page (info, rank systems, organizations)
- SESSION_0122_TASK_05 — Discipline card + skeleton components
- SESSION_0122_TASK_06 — Type check + verify

## What Landed

- ✅ **TASK_01 — Pre-flight**: Read component inventory, Discipline schema, Dirstarter category page pattern, existing organization queries. Confirmed `Section.Content`, `Breadcrumbs`, `Intro`, `Card`, `Badge`, `Stack`, `H4`, `Skeleton`, `Link` all available.
- ✅ **TASK_02 — Queries**: Created `server/web/disciplines/queries.ts` with `findDisciplines()`, `findDisciplineSlugs()`, `findDisciplineBySlug()`. Uses `"use cache"` + `cacheTag`/`cacheLife` pattern matching organization queries.
- ✅ **TASK_03 — List page**: Created `app/(web)/disciplines/page.tsx` with Breadcrumbs → Intro → Suspense → DisciplineList pattern (matches Dirstarter category page gold standard).
- ✅ **TASK_04 — Detail page**: Created `app/(web)/disciplines/[slug]/page.tsx` with Breadcrumbs → Intro → Rank Systems → Organizations → Styles → Stats sections.
- ✅ **TASK_05 — Card + Skeleton**: `DisciplineCard` (name, code badge, counts) + `DisciplineListSkeleton` (6-card grid with Skeleton primitives).
- ✅ **TASK_06 — Type check**: `tsc --noEmit` passes with zero errors.
- ✅ **TASK_07 — Nav wiring**: Added "Disciplines" to header browse dropdown (with ShieldIcon), mobile nav, and footer. Added `disciplines` i18n key.
- ✅ **TASK_08 — Structured data**: Added `StructuredData` with `generateCollectionPage` to both list and detail pages (schema.org CollectionPage).

## Files Touched

- `apps/web/server/web/disciplines/queries.ts` — NEW. `findDisciplines`, `findDisciplineSlugs`, `findDisciplineBySlug` with payloads.
- `apps/web/app/(web)/disciplines/page.tsx` — NEW. List page with StructuredData.
- `apps/web/app/(web)/disciplines/[slug]/page.tsx` — NEW. Detail page with StructuredData.
- `apps/web/app/(web)/disciplines/_components/discipline-card.tsx` — NEW. Card component.
- `apps/web/app/(web)/disciplines/_components/discipline-list.tsx` — NEW. Server component fetching + rendering grid.
- `apps/web/app/(web)/disciplines/_components/discipline-list-skeleton.tsx` — NEW. Loading skeleton.
- `apps/web/components/web/header.tsx` — MODIFIED. Added Disciplines to browse dropdown + mobile nav.
- `apps/web/components/web/footer.tsx` — MODIFIED. Added Disciplines nav link.
- `apps/web/messages/en/navigation.json` — MODIFIED. Added `disciplines` key.

## Decisions Resolved

- **Query location**: New `server/web/disciplines/` directory (not co-located with organization queries). Follows Dirstarter convention of one directory per entity.
- **Brand scoping**: Uses `OR: [{ isSystem: true }, { brand }]` pattern — shows system disciplines + brand-specific ones. Matches existing `getDisciplinesByBrand` logic.
- **Detail page sections**: Info, Rank Systems, Organizations (linked), Styles, Overview stats. Enrichment (founders, carousels, videos) deferred to S0123.
- **Cache strategy**: `"use cache"` with `cacheLife("minutes")` for list/detail, `cacheLife("hours")` for slugs.

## Open Decisions / Blockers

- 🔴 Resend domain DNS pending verification — 6th session carried
- Carried: Migration from SESSION_0121 (`statusHistory` + indexes) not yet applied
- Carried: Rash guard print files not yet uploaded to S3

## Task Log

- SESSION_0122_TASK_01 — ✅ done (pre-flight)
- SESSION_0122_TASK_02 — ✅ done (queries)
- SESSION_0122_TASK_03 — ✅ done (list page)
- SESSION_0122_TASK_04 — ✅ done (detail page)
- SESSION_0122_TASK_05 — ✅ done (card + skeleton)
- SESSION_0122_TASK_06 — ✅ done (type check)
- SESSION_0122_TASK_07 — ✅ done (nav wiring)
- SESSION_0122_TASK_08 — ✅ done (structured data)

## Next Session

**Goal:** SESSION_0123 — Discipline detail enrichment + dynamic population verification.

**Inputs to read:**
- `docs/sprints/SESSION_0122.md` — this session
- `docs/knowledge/wiki/dirstarter-component-inventory.md` — MANDATORY (UI session)
- `docs/knowledge/wiki/content-engine/content-atoms.md` — ContentAtom relation for discipline histories
- `apps/web/prisma/schema.prisma` — Discipline model (confirm `foundedBy`, `yearEstablished`, `history` additions needed)
- `apps/web/prisma/seed.ts` — existing discipline seed data (12 disciplines, 13 rank systems, 194 ranks)

**First task:** Run dev server, navigate to `/disciplines`, verify dynamic population with seeded data. Screenshot or confirm rendering.

**Task plan (Petey pre-loaded):**

| Task | Scope |
|------|-------|
| TASK_01 | Dynamic population test — run dev server, verify `/disciplines` list renders 12 seeded disciplines, verify `/disciplines/[slug]` detail renders rank systems + orgs |
| TASK_02 | Schema additions — add `foundedBy String?`, `yearEstablished Int?`, `history String?` fields to Discipline model. Migration. |
| TASK_03 | Founder carousel — install `embla-carousel-react`, build carousel component for discipline founders (placeholder until real data) |
| TASK_04 | Black belt rail — sidebar component showing top-ranked members in discipline |
| TASK_05 | Member carousel by rank — carousel grouped by belt/rank level |
| TASK_06 | Video carousel — highlights + course videos (placeholder until Mux integration) |
| TASK_07 | Courses + Certifications sections on detail page |
| TASK_08 | Schools section — organizations filtered by type DOJO/SCHOOL |
| TASK_09 | Content atom links — wire `contentAtoms` relation into discipline detail |
| TASK_10 | Sitemap verification — confirm `next-sitemap` auto-includes `/disciplines` routes |
| TASK_11 | Type check + final verify |

**Open decisions for S0123:**
- Carousel library: `embla-carousel-react` confirmed (SESSION_0121 decision)
- Schema migration: combine `foundedBy` + `yearEstablished` + `history` into single migration
- Placeholder strategy: render sections with "Coming soon" if no data vs hide entirely?
