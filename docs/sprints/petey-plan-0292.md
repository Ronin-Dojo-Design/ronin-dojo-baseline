---
title: "Petey Plan 0292 — D9 asset URL wiring + brand-settings Playwright e2e"
slug: petey-plan-0292
type: plan
status: active
created: 2026-05-29
updated: 2026-05-29
last_agent: copilot-session-0292
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0292.md
  - docs/sprints/SESSION_0291.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Petey Plan 0292 — D9 asset URL wiring + brand-settings Playwright e2e

## Context

SESSION_0291 landed `BrandSettings` model, admin CRUD, and runtime CSS injection.
Two open items remain before the brand-settings surface is complete:

- **D9**: `generateMetadata()` in `layout.tsx` still reads logo/favicon/OG from
  static `config/site.ts`. DB `logoUrl`/`faviconUrl`/`ogImageUrl` should override.
- **Playwright e2e**: No test coverage for the brand-settings admin page or
  runtime CSS injection.

## Decisions

- **D9 before Playwright**: Ship the behavior, then test it. Avoids writing a
  test against the static path and immediately invalidating it.
- **D8 deferred**: Org-level theme admin UI is a separate admin surface with
  different auth context. Full page + queries + actions → own session (0293).
- **S3 deferred**: Bucket provisioning needs AWS creds (operator task).

## Tasks

| ID | Description | Agent | Done criteria |
|---|---|---|---|
| SESSION_0292_TASK_01 | D9: Wire DB `logoUrl`/`faviconUrl`/`ogImageUrl` into `generateMetadata()` as override layer | Cody | `generateMetadata` uses DB URLs when present, falls back to `config/site.ts` |
| SESSION_0292_TASK_02 | Playwright e2e: admin brand-settings CRUD + verify runtime CSS injection | Cody | `bun test:e2e e2e/admin/brand-settings.spec.ts` passes |
| SESSION_0292_TASK_03 | Verification — typecheck + biome | Doug | 0 errors |
