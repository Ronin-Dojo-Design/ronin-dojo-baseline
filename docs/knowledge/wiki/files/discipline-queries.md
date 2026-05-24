---
title: "disciplines/queries.ts"
slug: discipline-queries
type: file
status: active
created: 2026-04-27
updated: 2026-05-24
author: Brian + Copilot
last_agent: claude-session-0237
pairs_with:
  - knowledge/wiki/files/discipline-detail-page
  - knowledge/wiki/files/organization-new-page
  - knowledge/wiki/files/schema-prisma
parent: architecture/program-plan
backlinks:
  - sprints/SESSION_0012
  - sprints/SESSION_0237
  - docs/knowledge/wiki/files/create-organization-form.md
wiring:
  - "apps/web/services/db.ts — PrismaClient"
  - "apps/web/prisma/schema.prisma — Discipline model (isSystem, brand columns)"
tags: [discipline, query, s3, s6]
---

# disciplines/queries.ts

**Path:** `apps/web/server/web/disciplines/queries.ts`

Cached discipline-area queries.

## Exports

- `findDisciplines(brand)` — list page; returns `isSystem=true` OR brand-matching disciplines with counts.
- `findDisciplineSlugs()` — no-arg; returns `{ slug, brand }[]` for cross-brand `generateStaticParams` (SESSION_0237).
- `findDisciplineBySlug(brand, slug)` — detail page; system-or-brand match.
- `findRelatedDisciplines({ disciplineId, brand })` — up to 6, alphabetical, excludes current, system-or-brand (SESSION_0237).
- `findDisciplineVideos(disciplineId)` — variants with `videoUrl` mapped to carousel shape.
- `findDisciplineMembersByRank(disciplineId)` — public directory members sorted by rank.

## Decision

Filter by brand + `isSystem=true` (decided SESSION_0012). Cross-brand system disciplines are visible to all brands; brand-specific disciplines are brand-scoped. SSG slug query intentionally omits the brand filter so static params cover every brand (matches `findOrganizationSlugs`).
