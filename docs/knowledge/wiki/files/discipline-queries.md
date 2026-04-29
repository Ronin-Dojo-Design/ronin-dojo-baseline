---
title: "discipline-queries.ts"
slug: discipline-queries
type: file
status: active
created: 2026-04-27
updated: 2026-04-29
author: Brian + Copilot
last_agent: codex-session-0025
pairs_with:
  - knowledge/wiki/files/organization-new-page
  - knowledge/wiki/files/schema-prisma
parent: architecture/program-plan
backlinks:
  - sprints/SESSION_0012
  - docs/knowledge/wiki/files/create-organization-form.md
wiring:
  - "apps/web/services/db.ts — PrismaClient"
  - "apps/web/prisma/schema.prisma — Discipline model (isSystem, brand columns)"
tags: [organization, discipline, query, s3]
---

# discipline-queries.ts

**Path:** `apps/web/server/web/organization/discipline-queries.ts`

Cached query function: `getDisciplinesByBrand(brand)`.

Returns disciplines where `isSystem=true` OR `brand` matches the given brand. Used by the organization create form to populate the discipline checkbox picker.

## Decision

Filter by brand + `isSystem=true` (decided SESSION_0012). Cross-brand system disciplines are visible to all brands; brand-specific disciplines are brand-scoped.
