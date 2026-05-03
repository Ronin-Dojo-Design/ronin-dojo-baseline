---
title: "ADR 0012 — Admin CRUD routing: flat with filter, not nested under orgs"
slug: adr-0012
type: decision
status: accepted
created: 2026-05-03
updated: 2026-05-03
last_agent: copilot-session-0037
pairs_with:
  - docs/architecture/decisions/0004-multi-brand-as-column.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0037.md
---

# ADR 0012 — Admin CRUD routing: flat with filter, not nested under orgs

## Context

Dirstarter's admin panel uses flat routing for all entities: `/admin/tools/`, `/admin/categories/`, `/admin/tags/`, `/admin/users/`. Each entity's list page handles filtering via URL query params (nuqs).

Our domain entities (Leads, Schedules, Enrollments, etc.) are organization-scoped and brand-scoped. Two routing options were considered:

- **(A) Flat:** `/admin/leads/` with org and brand filter columns in the data table.
- **(B) Nested:** `/admin/organizations/[orgId]/leads/` — more RESTful but has no Dirstarter precedent.

## Decision

**Option A — flat routing.** All admin CRUD pages live at `/admin/<entity>/` with organization as a filterable column.

## Rationale

1. **Dirstarter alignment.** The entire admin layer (auth HOC, data-table hooks, searchParams caching, toolbar patterns) assumes flat `/admin/<feature>/` routes. Fighting this creates maintenance debt on every upstream update.
2. **Consistency.** All future admin entities (schedules, enrollments, entitlements, events) follow the same pattern — one convention to learn.
3. **Brand scoping via ADR 0004.** Brand is already enforced server-side via the `brand` column predicate. The admin table adds org as a query-param filter, not a route segment.
4. **Super-admin visibility.** Flat routing naturally supports a super-admin viewing leads across all orgs, with org as a faceted filter.

## Consequences

- Every `findX(search)` admin query must accept an optional `organizationId` filter param.
- The `server/admin/<feature>/schema.ts` nuqs config includes an `organizationId` parser.
- Detail pages use `/admin/<entity>/[id]/` (by cuid), not `/admin/<entity>/[slug]/`.
- No nested `[orgId]` segments in admin routes.

## Applies to

All admin CRUD surfaces from SESSION_0037 forward: leads, schedules, enrollments, entitlements, attendance, events, etc.
