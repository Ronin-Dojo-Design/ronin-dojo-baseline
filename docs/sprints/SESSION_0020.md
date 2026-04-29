---
title: "SESSION 0020 — PETEY DEEP DIVE: Production launch plan — all brands May 18"
slug: session-0020
type: session
status: closed-full
created: 2026-04-28
updated: 2026-04-28
last_agent: copilot-session-0020
sprint: launch-prep
pairs_with:
  - docs/sprints/SESSION_0019.md
  - docs/architecture/s2-schema-additions.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION_0020

**Date:** 2026-04-28
**Operator:** Brian + Agent
**Goal:** Petey deep dive — reconcile SCHEMA_NEEDS_MANIFEST.md against current schema, build per-brand feature matrix, lock launch strategy for 2026-05-18, replan sprints S6–S12, finalize cache strategy (ADR 0010).
**Status:** closed-full
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

- **TASK_01 COMPLETE**: Schema needs reconciliation — grilled Brian through 3 rounds of questions, identified 10 operational gaps ALL confirmed as launch blockers
- **S2 schema additions spec produced**: `docs/architecture/s2-schema-additions.md` — 33 new models, 25 new enums, 1 enum modification, ~10 existing models modified
- **Pass 1 (24 models)**: Programs & scheduling, belt testing, family/guardian, payments/invoicing, contracts, notifications, org network, org settings
- **Pass 2 (9 models)**: Invitations/QR invite, generic events (seminars/camps/parties), tournament brackets & matches, fight records, audit log
- **Architecture decisions locked**: Stripe Express Connect default, iCal RRULE + parsed fields, CheckIn→Attendance→Gamification chain, full notification granularity, per-org configurability for everything
- **Brian approved**: All pass 1 + pass 2 models, pending final sign-off checkbox

## Files touched

- `docs/architecture/s2-schema-additions.md` — NEW: complete schema additions spec (pass 1 + pass 2), 33 new models, 25 new enums
- `docs/sprints/SESSION_0020.md` — session tracking, status updates

## Decisions resolved

- All 10 operational gaps are launch blockers (class scheduling, belt testing, family, payments, check-in, notifications, contracts, programs, instructor assignment, recurring schedules)
- Stripe Express Connect default, Standard Connect for independent clients
- iCal RRULE + parsed day/time columns for schedule storage
- Instructor title hierarchy: Discipline default → Org override → ClassInstructorAssignment override
- CheckIn → ClassSession match → Attendance → GamificationEvent chain confirmed
- Waiver enforcement: configurable per org (at enrollment, first check-in, annual renewal)
- Notification granularity: full (per-category × per-channel × per-program)
- Family billing: both models (one sub for all kids OR per-kid with family discount)
- Org modes: owner-operated, affiliation, white-label — modeled via SubscriptionTier + OrgRelationship
- Payment models: monthly, annual, drop-in, class pack, per-test, free trial, intro pack, barter/comp — all supported
- All features must be configurable per-org (SaaS platform, not single-school app)

## Open decisions / blockers

- Launch strategy (Option A/B/C) — still needs Brian sign-off (TASK_03 not reached)
- ADR 0010 cache strategy — still `proposed`, needs final lock (TASK_05 not reached)
- Sprint replan S6–S12 — blocked on launch strategy decision (TASK_04)
- `ProgramWaiver` join table referenced in Program model but not fully defined — Cody should add during implementation
- Schema sign-off checkboxes in s2-schema-additions.md — Brian to check off

## Next session

**Goal:** Deep research pass in ChatGPT or Codex — validate s2-schema-additions.md against real-world martial arts SaaS platforms, stress-test edge cases, then return to lock launch strategy (TASK_03) and replan sprints (TASK_04).

**Inputs to read:**
1. `docs/architecture/s2-schema-additions.md` — the schema spec to validate
2. `docs/architecture/launch/2026_05_18_PRODUCT_LAUNCH_ALL_BRANDS.md` — launch strategy options
3. `docs/architecture/decisions/0010-cache-strategy.md` — cache strategy to finalize

**First task:** Feed s2-schema-additions.md into ChatGPT deep research mode or Codex for validation against competitive martial arts SaaS platforms (Zen Planner, Kicksite, Spark Membership, etc.) — identify any missing patterns before Cody starts implementing.

---

## Reflections

This session was pure Petey planning — no code touched, which is exactly right. The grill rounds surfaced that the schema was modeled for "what things ARE" but not "how the school OPERATES." The 10 gaps (class scheduling, attendance, belt testing, family accounts, payments, check-in, notifications, contracts, programs, instructor assignment) were all hiding in plain sight — the SCHEMA_NEEDS_MANIFEST.md hinted at them but didn't make them explicit enough.

Key insight: Brian's platform is a **SaaS for martial arts schools**, not a single-school app. Every answer was "both, all, customizable" — which is the correct answer for a platform. This means every feature needs a configurable default with per-org overrides, which is why OrgSettings exists as a model.

The schema went from 36 models to ~69 models. That's a lot, but it's the right scope for a production martial arts SaaS covering scheduling, billing, tournaments, gamification, and multi-org networking. Nothing is over-engineered — every model maps to a real operational need.

Risk: 33 new models + 25 new enums is a large migration. Cody should implement in batches, not one giant migration. Suggested batches: (1) Programs + Scheduling + Attendance, (2) Payments + Contracts, (3) Belt Testing + Events + Invites, (4) Brackets + Fight Records + Audit.
