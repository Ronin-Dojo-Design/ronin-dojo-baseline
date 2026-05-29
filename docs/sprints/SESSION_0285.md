---
title: "SESSION 0285 — Brand-aware page metadata + JSON-LD"
slug: session-0285
type: session--open
status: in-progress
created: 2026-05-28
updated: 2026-05-28
last_agent: copilot-session-0285
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0284.md
  - docs/sprints/petey-plan-0285.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0285 — Brand-aware page metadata + JSON-LD

## Date

2026-05-28

## Operator

Brian + copilot-session-0285 (Petey orchestrating, Cody executing)

## Goal

Make page `og:site_name` and JSON-LD organization/website names brand-aware across all pages by brand-threading the two `lib/pages.ts` helpers — no per-page metadata logic duplicated. Execute petey-plan-0285.

## Status

### Status: in-progress

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0284.md`
- Carryover: SESSION_0284 converted 30/48 `siteConfig.name` refs to brand-aware. Remaining leak: `og:site_name` (from static `metadataConfig`) and JSON-LD org/website names (from `getOrganization()`/`getWebSite()`). Both funnel through `lib/pages.ts` helpers.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | content/SEO (metadata pipeline), theming (brand chrome) |
| Extension or replacement | Extension — brand-threads existing Dirstarter metadata pipeline |
| Why justified | White-label SaaS demo (RDD) and BBL launch require per-brand og:site_name + JSON-LD |
| Risk if bypassed | All brand subpages leak "Baseline Martial Arts" in og:site_name + JSON-LD |

### FAILED_STEPS check

- FS-0001/0008/0014 (L1 component gate): N/A — no UI components this session
- No open/mitigated entries in the metadata/SEO area

## Petey plan

Pre-staged: `docs/sprints/petey-plan-0285.md`. Three tasks:

1. SESSION_0285_TASK_01 — Brand-thread the central metadata/JSON-LD helpers (Cody)
2. SESSION_0285_TASK_02 — Await the 46 callers (Cody)
3. SESSION_0285_TASK_03 — Verify brand isolation (Doug)

## Task log

| ID | Status | Description |
| --- | --- | --- |
| SESSION_0285_TASK_01 | in-progress | Brand-thread metadata/JSON-LD helpers |
| SESSION_0285_TASK_02 | pending | Await 46 callers |
| SESSION_0285_TASK_03 | pending | Verify brand isolation |
