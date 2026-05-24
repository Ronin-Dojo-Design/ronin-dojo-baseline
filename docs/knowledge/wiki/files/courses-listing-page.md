---
title: "courses/page.tsx"
slug: courses-listing-page
type: file
status: active
created: 2026-05-24
updated: 2026-05-24
author: Brian + Claude
last_agent: claude-session-0238
pairs_with:
  - knowledge/wiki/files/course-detail-page
parent: architecture/program-plan
backlinks:
  - sprints/SESSION_0238
wiring:
  - "apps/web/server/web/courses/queries.ts — searchCourses({ perPage: 10 }, brand) for ItemList top-10 slice"
  - "apps/web/components/web/courses/course-query.tsx — CourseQuery (interactive, sort enabled)"
  - "apps/web/components/web/courses/course-listing.tsx — CourseListingSkeleton (Suspense fallback)"
  - "apps/web/lib/brand-context.ts — getRequestBrand"
  - "apps/web/lib/pages.ts — getPageMetadata"
  - "apps/web/lib/structured-data.ts — generateItemList + generateCollectionPage"
  - "apps/web/components/web/structured-data.tsx — StructuredData primitive"
tags: [courses, page, listing, list-parity, s6, ui]
---

# courses/page.tsx

**Path:** `apps/web/app/(web)/courses/page.tsx`

Public-facing brand-scoped courses **listing** page. Server component. Renders the catalog grid via `CourseQuery` (interactive, nuqs-driven sort + filters) inside a Suspense boundary.

## Parity surfaces (SESSION_0238)

Promoted to tool-listing parity for LIST pages. (SESSION_0234 covered the detail page; this session is the LIST-page parity:)

- `Breadcrumbs` — Courses.
- `generateMetadata` flows through `getPageMetadata({ url: "/courses", ... })`.
- `Section.Content` (CourseQuery) + `Section.Sidebar` (Catalog count chip + filter `Note` + cross-links to Programs / Disciplines / Schools).
- `StructuredData` JSON-LD: `ItemList` (top-10 preview via `generateItemList`) + `CollectionPage` (via `generateCollectionPage`) in `@graph` envelope.
- `CourseQuery` continues to render with sort enabled — wrapped only, not modified.

## Composed sections (top → bottom)

1. `Breadcrumbs` — Courses.
2. `Intro` — title + description.
3. `Section` with Sidebar:
   - **Content:** `Suspense<CourseListingSkeleton><CourseQuery enableSort /></Suspense>`.
   - **Sidebar:** Catalog card (total count chip + `Note` explaining filters live inside CourseQuery); Cross-links card (Programs `/programs`, Disciplines `/disciplines`, Schools `/schools`).
4. `StructuredData` (ItemList + CollectionPage JSON-LD).

## No-double-fetch decision

The page calls `searchCourses({ perPage: 10 }, brand)` once for the ItemList preview slice. `CourseQuery` (inside Suspense) re-calls `searchCourses` with parsed-params (q / sort / page) — distinct cache key, no shared payload. Top-level fetch is also where `numberOfItems` for the ItemList comes from (unfiltered total).

## Filter-chrome decision

Filters live **inside** `CourseQuery` (existing pattern). The sidebar surfaces a `Note` pointing to where filters render, not a duplicated filter UI. Single source of truth.

## Decision history

SESSION_0238 — page rewritten from 32 → 133 lines. `ItemList` JSON-LD chosen for SEO/rich-results on the LIST surface (detail pages use `Course` schema). `searchCourses` reused for the preview fetch (no new query function added).
