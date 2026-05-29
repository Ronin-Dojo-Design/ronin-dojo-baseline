---
title: "disciplines/[slug]/page.tsx"
slug: discipline-detail-page
type: file
status: active
created: 2026-05-24
updated: 2026-05-24
author: Brian + Claude
last_agent: claude-session-0237
pairs_with:
  - knowledge/wiki/files/discipline-queries
  - knowledge/wiki/files/organization-detail-page
  - knowledge/wiki/files/schools-detail-page
parent: architecture/program-plan
backlinks:
  - sprints/SESSION_0237
wiring:
  - "apps/web/server/web/disciplines/queries.ts — findDisciplineBySlug, findDisciplineSlugs, findRelatedDisciplines, findDisciplineVideos, findDisciplineMembersByRank"
  - "apps/web/lib/brand-context.ts — getRequestBrand"
  - "apps/web/lib/pages.ts — getPageMetadata"
  - "apps/web/lib/structured-data.ts — generateCollectionPage"
tags: [discipline, page, detail, s6, ui]
---

# disciplines/[slug]/page.tsx

**Path:** `apps/web/app/(web)/disciplines/[slug]/page.tsx`

Public-facing brand-scoped discipline detail page. Server component.

## Parity surfaces (SESSION_0237)

Uplifted to the tool-listing parity pattern set by SESSION_0235 (Program) and SESSION_0236 (Organization):

- `generateStaticParams` via `findDisciplineSlugs()` — cross-brand SSG.
- `generateMetadata` flows through `getPageMetadata` (OG image + canonical URL).
- `getRequestBrand()` everywhere — no raw `headers()` parsing.
- `Section.Content` + `Section.Sidebar` on the first section (Rank Systems + Overview/History cards).
- Related Disciplines section near the bottom via `findRelatedDisciplines`.
- `StructuredData` JSON-LD (`generateCollectionPage`) preserved at the bottom.

## Composed sections (top → bottom)

1. `Breadcrumbs` — Disciplines → {discipline name}.
2. `Intro` — name + code badge + member/organization counts.
3. `Section` with Sidebar — Rank Systems grid (Content) + Overview/History cards (Sidebar).
4. Organizations grid.
5. Styles chip cloud (conditional).
6. `CoursesSection` (discipline-scoped).
7. `SchoolsSection` (discipline-scoped).
8. `BlackBeltRail` (discipline-scoped).
9. `ContentAtomsSection` (discipline-scoped).
10. `VideoCarousel` (conditional).
11. `MemberCarouselByRank` (conditional).
12. `LineageTreeSection` (Baseline-only).
13. Related Disciplines (conditional).
14. `StructuredData` (CollectionPage JSON-LD).
