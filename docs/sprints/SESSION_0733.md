---
title: "SESSION 0733 — #398 Preview DB isolation proof (unblock #380)"
slug: session-0733
type: session--staged
status: staged
created: 2026-08-01
updated: 2026-08-01
last_agent: codex-session-0732
sprint: S13
lane: bbl
recipe: "pp"
goal_ids: ["G-011"]
tickets: ["#398", "#380"]
pairs_with:
  - docs/sprints/SESSION_0732.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0733 — #398 Preview DB isolation proof (unblock #380)

> **Staged by SESSION_0732.** #377 is complete. Live issue state on 2026-08-01 still marks #398
> MANUAL STEP REQUIRED and #380 blocked; do not begin destructive RankAward schema work first.

## Goal

Close #398's environment/security blocker: scope production DB credentials to Vercel Production,
wire Preview to a Neon branch, ratify an explicit Preview migration mechanism + Deployment Protection,
and prove a throwaway additive migration changes Preview without touching production. Then authorize the
#380 one-table-fold grill as the next lane.

## First task

1. Inspect current Vercel environment scopes and Neon branches without printing credentials; read #398,
   #380, D-058, RISK-16, and `apps/web/scripts/prebuild-migrate.ts`.
2. Grill/ratify the explicit Preview migration mechanism, Deployment Protection, credential rotation,
   and rollback steps with the operator before changing external settings.
3. Run the throwaway additive-migration proof: prod `_prisma_migrations` unchanged, Preview branch migrated
   and rendered, DB identity logged without secrets; close #398 only with captured evidence.

## Next session

### Goal

Run #380's HITL one-table-fold grill and produce the ratified reversible migration plan.

### First task

Re-read #374/#380, ADR 0058, SESSION_0730's four forks, and #398's completed environment proof before
authorizing any schema or destructive migration work.
