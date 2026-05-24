---
title: "SESSION 0070 — Cody: Public Listing Pages + Server Queries"
slug: session-0070
type: session
status: closed-quick
created: 2026-05-04
updated: 2026-05-04
last_agent: copilot-session-0070
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0069.md
  - docs/knowledge/wiki/concepts/listing-pattern-repurposing.md
  - docs/knowledge/wiki/dirstarter-component-inventory.md
backlinks:
  - docs/knowledge/wiki/index.md
---

## SESSION 0070 — Cody: Public Listing Pages + Server Queries

### Date

2026-05-04

### Operator

Brian Scott + Copilot (Cody, orchestrated by Petey)

### Status

in-progress

### Goal

Build public listing pages (`/members`, `/schools`) with paginated server queries, listing components, and filter integration.

### Context read

- ✅ SESSION_0069 — closed-quick. Cards + filters landed for members/schools.
- ✅ Listing-pattern-repurposing.md §3 data flow, §5 component mapping, §6 route structure.
- ✅ Existing: `getDirectoryProfiles` (no pagination), `getOrganizationsByBrand` (no pagination).
- ✅ Existing: `member-card`, `member-filters`, `school-card`, `school-filters` ready.
- ✅ Technique pattern (technique-query → technique-listing → technique-list) as L1 reference.

### Task log

- `SESSION_0070_TASK_01` — Paginated server queries for members + schools — ✅ done
- `SESSION_0070_TASK_02` — Member listing components (list, listing, query, search) — ✅ done
- `SESSION_0070_TASK_03` — School listing components + public pages (/members, /schools) — ✅ done

## What landed

- ✅ **Member search query** — `searchDirectoryProfiles` in `server/web/directory/search-profiles.ts` with pagination, brand scoping, privacy filtering (PUBLIC/MEMBERS_ONLY), discipline/location/text search.
- ✅ **School search query** — `searchOrganizations` in `server/web/directory/search-organizations.ts` with pagination, brand scoping, type/discipline/text filters.
- ✅ **Member filter schema** — `memberFilterParamsCache` with q, sort, page, perPage, discipline, city, region.
- ✅ **School filter schema** — `schoolFilterParamsCache` with q, sort, page, perPage, type, discipline.
- ✅ **Member listing components** — `member-list`, `member-listing`, `member-search`, `member-query` following technique pattern exactly.
- ✅ **School listing components** — `school-list`, `school-listing`, `school-search`, `school-query` following technique pattern exactly.
- ✅ **Public /members page** — with Intro, Suspense, filters, sort, pagination.
- ✅ **Public /schools page** — with Intro, Suspense, filters, sort, pagination.
- ✅ **Type check** — `tsc --noEmit` passes clean.

## Files touched

| File | Note |
|------|------|
| `apps/web/server/web/directory/member-schema.ts` | New — nuqs filter params for member listing |
| `apps/web/server/web/directory/school-schema.ts` | New — nuqs filter params for school listing |
| `apps/web/server/web/directory/search-profiles.ts` | New — paginated privacy-aware profile search |
| `apps/web/server/web/directory/search-organizations.ts` | New — paginated org/school search |
| `apps/web/components/web/members/member-list.tsx` | New — member grid list + skeleton |
| `apps/web/components/web/members/member-listing.tsx` | New — member listing wrapper with FiltersProvider |
| `apps/web/components/web/members/member-search.tsx` | New — member search bar + filter/sort integration |
| `apps/web/components/web/members/member-query.tsx` | New — server component orchestrator |
| `apps/web/components/web/schools/school-list.tsx` | New — school grid list + skeleton |
| `apps/web/components/web/schools/school-listing.tsx` | New — school listing wrapper with FiltersProvider |
| `apps/web/components/web/schools/school-search.tsx` | New — school search bar + filter/sort integration |
| `apps/web/components/web/schools/school-query.tsx` | New — server component orchestrator |
| `apps/web/app/(web)/members/page.tsx` | New — public members directory page |
| `apps/web/app/(web)/schools/page.tsx` | New — public schools directory page |
| `docs/sprints/SESSION_0070.md` | This file |

## Decisions resolved

- **Query architecture** — Separate `search-profiles.ts` and `search-organizations.ts` rather than extending existing `queries.ts` files, to keep paginated public listing logic isolated from dashboard/detail queries.
- **Privacy in search** — `searchDirectoryProfiles` accepts optional `viewerUserId` to determine PUBLIC vs MEMBERS_ONLY visibility at query layer (not component).
- **Schema separation** — Dedicated `member-schema.ts` / `school-schema.ts` rather than reusing `directoryFilterParams` (which lacked pagination-aware nuqs cache).

## Open decisions / blockers

- **Detail pages** — `/members/[slug]` and `/schools/[slug]` detail pages not yet built.
- **Auth pass-through** — `viewerUserId` not yet wired from session in the `/members` page (currently unauthenticated only = PUBLIC profiles). Needs session helper integration.
- **Technique /techniques page** — Already exists and working; no changes needed.

## Review log

- `SESSION_0070_REVIEW_01` — All 3 tasks executed. Type check passes. L1 components used (Card, Grid, Filters, FiltersProvider, Sort, Pagination, Input, Select, Intro, Suspense, EmptyList, Badge, Avatar, H4, Link, Stack, Skeleton). No raw HTML violations.

## ADR / ubiquitous-language check

- No new ADR needed.
- No new domain terms.

## Next session

### SESSION_0071 — Cody: Detail Pages + Auth Integration

- **Goal:** Build `/members/[slug]` and `/schools/[slug]` detail pages; wire `viewerUserId` from session into member query for MEMBERS_ONLY visibility.
- **Agent:** Cody
- **Inputs:** SESSION_0070, listing-pattern-repurposing.md §3b detail flow, existing `findProfileBySlug` + `getOrganizationBySlug`.
- **First task:** SESSION_0071_TASK_01 — `/members/[slug]` detail page with privacy-aware profile rendering.
- **Prerequisite:** Unblocked.
