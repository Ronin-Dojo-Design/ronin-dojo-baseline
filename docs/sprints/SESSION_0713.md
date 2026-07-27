---
title: "SESSION 0713 — Mammoth trim (Phase C in mammoth-metal-buildings)"
slug: session-0713
type: session--staged
status: staged
created: 2026-07-26
updated: 2026-07-26
last_agent: claude-session-0712
sprint: S13
lane: mmb
recipe: "epic-plan"
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0712.md
  - docs/sprints/plans/petey-plan-0711-brand-repo-separation.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0713 — Mammoth trim

> **Staged by SESSION_0712.** Adopt: flip `status:` → `in-progress`. Runs in
> `~/dev/mammoth-metal-buildings` (ADR 0059: session = one repo) — NOT this checkout; this
> repo's copy of the stub exists for backlog visibility only.

## Goal

Phase C (C1–C6) + Phase D (D1–D3) for mammoth-metal-buildings, per
`docs/sprints/plans/petey-plan-0711-brand-repo-separation.md` and the SESSION_0712 Task-log
recipe. Keeps `clients/mammoth-build-crm` (promote toward `apps/`) + `packages/*`; deletes
apps/web · apps/baseline · apps/rdd + other-brand docs. PL-024 cutover 2026-08-05 — the trim
must not eat the MVP runway.

## First task

Restore `~/dev/_secrets-parking/mammoth-build-crm/.env` into the checkout, bootstrap
(settings.shared.json copy lands via post-#343 bootstrap.sh), then C1 deletions.

## Next session

### Goal

### First task
