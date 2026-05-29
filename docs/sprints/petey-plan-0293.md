---
title: "Petey Plan 0293 — Org-level theme admin UI (D8)"
slug: petey-plan-0293
type: plan
status: active
created: 2026-05-29
updated: 2026-05-29
last_agent: copilot-session-0293
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0293.md
  - docs/sprints/SESSION_0292.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Petey Plan 0293 — Org-level theme admin UI (D8)

## Context

SESSION_0291 added `OrgSettings` theme override fields (7 nullable columns).
No admin UI exists to manage them. Super admin needs a way to set per-org
theme overrides that cascade: `styles.css → BrandSettings → OrgSettings`.

## Decisions

- **D8 resolved**: Super admin UI at `/admin/organizations` (list) →
  `/admin/organizations/[id]/theme` (edit form). Org self-service deferred.
- **Auth model**: `adminActionClient` (super admin only). Org admin self-service
  is SESSION 0294 scope.

- **CSS injection on org pages**: Deferred to SESSION 0294. This session is
  CRUD only.

## Tasks

| ID | Description | Agent | Done criteria |
| --- | --- | --- | --- |
| SESSION_0293_TASK_01 | Server queries + upsert action for OrgSettings theme fields | Cody | `findOrgSettings(orgId)` + `upsertOrgTheme` action work |
| SESSION_0293_TASK_02 | Admin org list page + org theme page with form | Cody | Pages render, form saves, toast confirms |
| SESSION_0293_TASK_03 | Verification — typecheck + biome | Doug | 0 errors |
