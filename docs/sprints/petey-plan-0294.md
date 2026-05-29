---
title: "Petey Plan 0294 — Org-scoped CSS injection + self-service theme (D10/D11)"
slug: petey-plan-0294
type: plan
status: active
created: 2026-05-29
updated: 2026-05-29
last_agent: copilot-session-0294
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0294.md
  - docs/sprints/SESSION_0293.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Petey Plan 0294 — Org-scoped CSS injection + self-service theme (D10/D11)

## Context

SESSION_0293 resolved D8 (super-admin org theme CRUD). OrgSettings theme fields
exist and can be edited by super admins. Two pieces remain:

- **D10**: Org-scoped CSS injection — org pages should render OrgSettings color
  overrides via `[data-org]` scoping. Cascade: `styles.css → BrandSettings → OrgSettings`.

- **D11**: Org admin self-service theme page — org owners (and ORG_ADMIN role
  members) can edit their own org's theme at `/organizations/[slug]/settings/theme`.

## Decisions

- **CSS scoping**: `[slug]/layout.tsx` wraps children in `<div data-org={orgId}>`.
  Injects `<style>` with `[data-org="X"]` selector. Null fields inherit from brand.

- **Color value hardening**: Regex guard `/^[\d.\s,/%]+$/` before CSS injection.
  Blocks any non-HSL characters.

- **Auth model for self-service**: `userActionClient` + inline check for
  `org.ownerId === user.id` OR membership with `ORG_ADMIN` role code.
- **403 page**: Martial-arts-styled "Access Denied" page with personality.

## Tasks

| ID | Description | Agent | Done criteria |
| --- | --- | --- | --- |
| SESSION_0294_TASK_01 | Add `orgSettings` to org detail payload + org-scoped layout with CSS injection | Cody | Org pages show OrgSettings color overrides; null = inherit brand |
| SESSION_0294_TASK_02 | Org-owner/admin auth action for theme update + martial arts 403 page | Cody | Owner/ORG_ADMIN can update; unauthorized users see styled 403 |
| SESSION_0294_TASK_03 | Self-service theme page at `/organizations/[slug]/settings/theme` | Cody | Page renders, form saves, toast confirms |
| SESSION_0294_TASK_04 | Typecheck + biome verification | Doug | 0 errors |
