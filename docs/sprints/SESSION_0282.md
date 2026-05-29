---
title: "SESSION 0282 — BBL red brand token + smoke"
slug: session-0282
type: session--open
status: in-progress
created: 2026-05-29
updated: 2026-05-29
last_agent: copilot-session-0282
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0281.md
  - docs/architecture/decisions/0022-brand-chrome-resolution.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0282 — BBL red brand token + smoke

## Date

2026-05-29

## Operator

Brian + copilot-session-0282 (Petey orchestrating, Cody executing)

## Goal

Update BBL brand chrome primary color from gold to red for `bbl.local`, verify impacted brand surfaces, and stage follow-up for configurable accent color.

## Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Theming (brand token overrides in shell CSS) |
| Extension or replacement | Extension — update brand token values in existing multi-brand chrome pattern |
| Why justified | Product directive changed BBL primary from gold to red |
| Risk if bypassed | BBL launch visuals mismatch expected brand identity |

## Graphify note

Graphify required by ritual for search-heavy work, but CLI is unavailable in this sandbox (`graphify: command not found`). Proceeding with direct source/doc inspection from known paths and SESSION_0281 inputs.

## Petey plan

### Goal

Ship a minimal, safe BBL color-token correction and document the decision/follow-ups.

### Tasks

#### SESSION_0282_TASK_01 — Confirm brand token source-of-truth + target color

- Owner: Petey
- Done: Source docs checked and target BBL primary color decision captured

#### SESSION_0282_TASK_02 — Update BBL web token(s)

- Owner: Cody
- Done: `bbl.local` primary token is red in light/dark brand overrides

#### SESSION_0282_TASK_03 — Validate + document

- Owner: Cody + Petey
- Done: Validation results recorded; session notes updated with blockers/follow-up for admin color picker

## Task log

| ID | Owner | Status | Notes |
| --- | --- | --- | --- |
| SESSION_0282_TASK_01 | Petey | in-progress | Color source lookup in progress |
| SESSION_0282_TASK_02 | Cody | pending | Pending token update |
| SESSION_0282_TASK_03 | Cody + Petey | pending | Pending validation + closure notes |
