---
title: "SESSION 0020 — PETEY DEEP DIVE: Production launch plan — all brands May 18"
slug: session-0020
type: session
status: planned
created: 2026-04-28
updated: 2026-04-28
last_agent: session-0019-petey
health: 5
sprint: launch-prep
pairs_with:
  - docs/sprints/SESSION_0019.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION_0020

**Date:** TBD (next session)
**Operator:** Brian + Agent
**Goal:** Petey deep dive — reconcile SCHEMA_NEEDS_MANIFEST.md against current schema, build per-brand feature matrix, lock launch strategy for 2026-05-18, replan sprints S6–S12, finalize cache strategy (ADR 0010).
**Status:** planned
**Role:** Petey (planner)

---

## Bow-in context

- SESSION_0019 completed Dirstarter docs audit, cache risk register, ADR 0010 revert to `proposed`, and gap audit.
- Brian declared hard production launch date: **2026-05-18** for ALL brands (Baseline P1, BBL P2, WEKAF P3, Ronin Dojo Design P4).
- This is no longer MVP. This is full production launch.
- `SCHEMA_NEEDS_MANIFEST.md` committed to repo — contains comprehensive schema gaps from ChatGPT session.
- Launch plan doc created at `docs/architecture/launch/2026_05_18_PRODUCT_LAUNCH_ALL_BRANDS.md` with gap analysis and three launch strategy options.

## Inputs to read

1. `docs/architecture/launch/2026_05_18_PRODUCT_LAUNCH_ALL_BRANDS.md` — launch plan, brand specs, gap analysis
2. `docs/architecture/SCHEMA_NEEDS_MANIFEST.md` — full schema needs from ChatGPT
3. `docs/architecture/program-plan.md` — current 12-sprint plan (needs rewrite)
4. `docs/architecture/cache-risk-register.md` — cache risk register from SESSION_0019
5. `docs/architecture/decisions/0010-cache-strategy.md` — ADR 0010 (status: proposed)
6. `docs/knowledge/wiki/dirstarter-gap-audit.md` — Dirstarter drift findings
7. `apps/web/prisma/schema.prisma` — current schema (31 models)
8. Any additional ChatGPT outputs Brian provides

## PETEY PLAN — Tasks

### TASK_01: Schema needs reconciliation

Read `SCHEMA_NEEDS_MANIFEST.md` line by line. For every entity mentioned, check if it exists in `schema.prisma`. Produce a gap table: entity → exists/missing → fields needed → brand(s) that need it → launch priority.

### TASK_02: Per-brand feature matrix

For each brand (P1–P4), list every feature needed for launch. Mark each as: done, in-progress, not-started, not-in-schema. This is the launch readiness scorecard.

### TASK_03: Launch strategy decision

Present Options A/B/C from the launch plan doc. Get Brian's sign-off. Lock the strategy.

### TASK_04: Sprint replan

Rewrite S6–S12 against the locked strategy and May 18 date. If staggered (Option A), define what ships May 18 vs. later. If hard launch (Option B), define scope cuts.

### TASK_05: Cache strategy finalization

Using SESSION_0019's cache risk register and ADR 0010, make a final production-ready decision. For production launch, we need a locked cache strategy, not a `proposed` one.

### TASK_06: Parallel workstream plan

If multiple agents can work simultaneously, define worktree splits, persona assignments, and merge gates.

---

## What landed

*(pending)*

## Files touched

*(pending)*

## Decisions resolved

*(pending)*

## Open decisions / blockers

- Launch strategy (Option A/B/C) — needs Brian sign-off
- ADR 0010 — needs final lock for production
- Additional ChatGPT outputs — Brian may have more
- Schema additions scope — how much before May 18?

## Next session

*(pending — depends on TASK_03 outcome)*
