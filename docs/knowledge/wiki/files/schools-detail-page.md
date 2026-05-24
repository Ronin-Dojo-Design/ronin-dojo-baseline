---
title: "schools/[slug]/page.tsx"
slug: schools-detail-page
type: file
status: active
created: 2026-05-24
updated: 2026-05-24
author: Brian + Claude
last_agent: claude-session-0238
pairs_with:
  - knowledge/wiki/files/schools-queries
  - knowledge/wiki/files/organization-detail-page
  - knowledge/wiki/files/discipline-detail-page
parent: architecture/program-plan
backlinks:
  - sprints/SESSION_0238
wiring:
  - "apps/web/server/web/schools/queries.ts — findSchoolBySlug, findSchoolSlugs, findRelatedSchools"
  - "apps/web/server/web/schools/payloads.ts — SchoolDetail type"
  - "apps/web/lib/brand-context.ts — getRequestBrand"
  - "apps/web/lib/pages.ts — getPageMetadata"
  - "apps/web/lib/structured-data.ts — generateCollectionPage (alongside inline EducationalOrganization literal)"
  - "apps/web/components/web/structured-data.tsx — StructuredData primitive"
tags: [schools, page, detail, type-lens, s6, ui]
---

# schools/[slug]/page.tsx

**Path:** `apps/web/app/(web)/schools/[slug]/page.tsx`

Public-facing brand-scoped **school-specific lens** over `Organization`. Server component. Renders only orgs where `type ∈ {DOJO, SCHOOL}`; `LEAGUE` (tournament orgs) and `CLUB` orgs return `null` from the query layer and trigger `notFound()`.

## Parity surfaces (SESSION_0238)

Uplifted to the tool-listing parity pattern set by SESSION_0235 (Program), SESSION_0236 (Organization), and SESSION_0237 (Discipline + Passport):

- `generateStaticParams` via `findSchoolSlugs()` — cross-brand SSG.
- `generateMetadata` flows through `getPageMetadata` (OG image + canonical URL distinct from `/organizations/[slug]`).
- `getRequestBrand()` everywhere — no raw `headers()` parsing.
- `Section.Content` (About + Address + Disciplines chips) + `Section.Sidebar` (Overview / Contact / Affiliation cards).
- Instructors section, Programs offered section, Related Schools section.
- `StructuredData` JSON-LD: `EducationalOrganization` (inline schema-dts literal) + `generateCollectionPage` in `@graph` envelope.

## Composed sections (top → bottom)

1. `Breadcrumbs` — Schools → {school name}.
2. `Intro` — name + address line + type/discipline/member badges.
3. `Section` with Sidebar:
   - **Content:** About (description), Address card, Disciplines chips.
   - **Sidebar:** Overview card (instructors / members / programs / classes-per-week); Contact card (website / phone / email, conditional); Affiliation card ("Part of [parent]" iterating `parentRelationships` with type-aware route).
4. Instructors grid — `status === "ACTIVE" && roleAssignments.some(ra ∈ {INSTRUCTOR, HEAD_INSTRUCTOR})`.
5. Programs offered grid (conditional).
6. Related Schools grid (`findRelatedSchools` with city/state passed through).
7. `StructuredData` (EducationalOrganization + CollectionPage JSON-LD).

## Type-lens behavior

The 404 path for non-school orgs is enforced at the **query layer**, not the page:

- `findSchoolBySlug({ brand, slug })` filters `where.type ∈ SCHOOL_ORG_TYPES`.
- Non-school orgs (LEAGUE, CLUB) and missing slugs both return `null`.
- The page calls `notFound()` on `null`, producing the canonical 404 for non-school slugs.

This means a `LEAGUE` org like WEKAF USA cannot accidentally render at `/schools/wekaf-usa` — the org is only reachable at `/organizations/wekaf-usa`.

## Affiliation routing

`parentRelationships[].parentOrg` links route by parent type:

- `DOJO` / `SCHOOL` parent → `/schools/${slug}`
- `LEAGUE` / `CLUB` parent → `/organizations/${slug}`

This keeps each parent on its correct lens (e.g., a dojo whose parent is "Black Belt Legacy" affiliation routes to wherever BBL itself is rendered).

## Decision history

SESSION_0238 — page rewritten as school-lens from 110 → 393 lines. Replaced direct `getOrganizationBySlug` (which silently rendered all org types). `EducationalOrganization` JSON-LD vocabulary chosen over `LocalBusiness` (more specific: schools train people). Inline schema-dts literal — no new helper added to `lib/structured-data.ts` until a 2nd consumer (e.g. `/leagues/[slug]`'s `SportsOrganization` schema) appears.
