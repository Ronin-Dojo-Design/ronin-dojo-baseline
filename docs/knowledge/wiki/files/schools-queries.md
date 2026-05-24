---
title: "schools/queries.ts"
slug: schools-queries
type: file
status: active
created: 2026-05-24
updated: 2026-05-24
author: Brian + Claude
last_agent: claude-session-0238
pairs_with:
  - knowledge/wiki/files/schools-detail-page
  - knowledge/wiki/files/discipline-queries
parent: architecture/program-plan
backlinks:
  - sprints/SESSION_0238
wiring:
  - "apps/web/server/web/schools/payloads.ts — schoolDetailPayload, schoolManyPayload, SCHOOL_ORG_TYPES"
  - "apps/web/app/(web)/schools/[slug]/page.tsx — sole consumer; uses findSchoolBySlug + findSchoolSlugs + findRelatedSchools"
  - "apps/web/prisma/schema.prisma — Organization model + OrganizationType enum (DOJO | LEAGUE | SCHOOL | CLUB)"
tags: [schools, queries, type-lens, s6]
---

# schools/queries.ts

**Path:** `apps/web/server/web/schools/queries.ts`

Type-lens server module over `Organization`. Exposes school-typed reads (`OrganizationType ∈ {DOJO, SCHOOL}`) so the `/schools/[slug]` route renders a school-specific page while `LEAGUE` and `CLUB` orgs remain on the generic `/organizations/[slug]`.

## Exports

- `findSchoolBySlug({ brand, slug })` — Returns `SchoolDetail | null`. Filters `where.type ∈ SCHOOL_ORG_TYPES`, so non-school orgs (LEAGUE, CLUB) return `null` and the page calls `notFound()`. Payload includes `memberships → roleAssignments → role`, `programs`, `classSchedules`, `parentRelationships → parentOrg`, `disciplines`.
- `findSchoolSlugs()` — No-arg, returns `{ slug, brand }[]` filtered to school-types for cross-brand `generateStaticParams`. Mirrors `findOrganizationSlugs` / `findDisciplineSlugs`.
- `findRelatedSchools({ schoolId, brand, city, state })` — Up to 6 schools, same brand or system, with optional caller-passed locality fallback. Both `city`/`state` null → brand-scoped alphabetical, no `OR` clause. Either present → `OR: [{ city }, { state }]`. Excludes current, alphabetical.

All three are wrapped in Next.js `"use cache"` + sensible `cacheTag` (`school-${slug}` / `school-slugs` / `related-schools-${schoolId}`) + `cacheLife`.

## Why a separate module (not extending `organization/queries`)

The schools surface is a **typed lens** over Organization. Keeping it in its own module means:

- The school-type filter (`SCHOOL_ORG_TYPES`) is a single source of truth — future `/leagues/[slug]` and `/clubs/[slug]` lenses can mirror the same module shape with `LEAGUE_ORG_TYPES` / `CLUB_ORG_TYPES` constants.
- `findSchoolBySlug` can safely return `null` for non-school types without complicating `getOrganizationBySlug` callers (the generic `/organizations/[slug]` page still needs all 4 types).
- The cache-tag namespace (`school-*`) is independent of the org cache namespace, so revalidating a school doesn't cascade.

## Decision history

SESSION_0238 — module created. Replaced the previous `apps/web/app/(web)/schools/[slug]/page.tsx` direct call to `getOrganizationBySlug` (which silently rendered any org type at `/schools/[slug]`).
