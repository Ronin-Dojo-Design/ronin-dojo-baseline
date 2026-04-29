---
title: "SESSION 0023 — Schema Wave A migration"
slug: session-0023
type: session
status: closed-full
created: 2026-04-29
updated: 2026-04-29
last_agent: codex-session-0023
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0022.md
  - docs/protocols/WORKFLOW_5.0.md
  - docs/architecture/s2-schema-additions.md
  - docs/runbooks/schema-migration.md
  - do../protocols/project-log.md
  - do../protocols/project-log.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0023 — Schema Wave A migration

## Date

2026-04-29

## Operator

Brian Scott

## Status

closed-full

## Goal

Land Schema Wave A school-operations models into `apps/web/prisma/schema.prisma` with Dirstarter compliance preserved and Prisma validation evidence captured.

## Bow-in audit

- Previous session read: `docs/sprints/SESSION_0022.md`
- Previous goal: schema prep, Pass 4 grill, runbook inventory, migration SOP
- Previous blockers: Pass 4 decisions/sign-off and schema checkboxes. Current repo already has Pass 4 merged and sign-off checkboxes checked in `docs/architecture/s2-schema-additions.md`.
- Current lane: Core platform
- Worktree: `/Users/brianscott/dev/wt-core-platform` on branch `session-0023-core-platform`
- Primary task: implement Wave A models/enums and run schema validation.

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | DB / Prisma schema |
| Extension or replacement | Extension — martial-arts domain models are added alongside Dirstarter's existing auth/template models |
| Why justified | Baseline launch needs programs, schedules, attendance, billing, contracts, notifications, and org settings before school-ops UI can target real backend contracts |
| Risk if bypassed | School-ops UI becomes disconnected mock behavior; migration later would risk route and seed churn |

## Petey plan

### Goal

Implement Wave A schema additions and leave the repo ready for local DB push/seed verification.

### Tasks

#### TASK_01 — Activate core-platform worktree

- **Agent:** Petey + Giddy
- **What:** Create and use the dedicated `wt-core-platform` worktree for this session.
- **Steps:**
  1. Confirm base repo is clean.
  2. Create branch/worktree from `main`.
  3. Record branch and path in this SESSION file.
- **Done means:** `git worktree list` shows `/Users/brianscott/dev/wt-core-platform`.
- **Depends on:** nothing

#### TASK_02 — Implement Wave A schema

- **Agent:** Cody
- **What:** Add Wave A enums/models, relation fields, and the known missing `ProgramWaiver` join model to `schema.prisma`.
- **Steps:**
  1. Add new enums.
  2. Add relation fields to existing models.
  3. Add new Wave A models in dependency-safe order.
  4. Run `prisma format` and validation.
- **Done means:** Prisma schema validates and the diff is limited to Wave A schema/session files.
- **Depends on:** TASK_01

#### TASK_03 — Review and evidence

- **Agent:** Doug + Giddy
- **What:** Run available verification, score against WORKFLOW 5.0, and record residual risk.
- **Steps:**
  1. Run Prisma validation/generation where local dependencies permit.
  2. Run type check if client generation succeeds.
  3. Update this SESSION with files touched, evidence, and next-session handoff.
- **Done means:** SESSION file includes verification commands and pass/fail notes.
- **Depends on:** TASK_02

#### TASK_04 — Add task accountability logs

- **Agent:** Giddy
- **What:** Add durable `TASK_PLAN_LOG` and `TASK_REVIEW_LOG` accountability ledgers and wire them into the rituals.
- **Steps:**
  1. Create standalone protocol log files.
  2. Add current session task IDs and review findings.
  3. Wire opening, closing, and wiki index to the logs.
  4. Run a full close with explicit checklist evidence.
- **Done means:** Logs exist, SESSION_0023 references them, and future sessions have ritual gates for plan/review entries.
- **Depends on:** TASK_03

### Parallelism

- Giddy/Cody schema scout and Doug migration-risk review run as read-only subagents while Cody implements locally.
- Schema editing stays single-writer in `wt-core-platform` to avoid overlapping edits to `schema.prisma`.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Petey + Giddy | Scope, branch, worktree, and Dirstarter alignment |
| TASK_02 | Cody | Clear schema implementation from signed spec |
| TASK_03 | Doug + Giddy | Migration/test evidence and architecture review |
| TASK_04 | Giddy | Accountability governance and ritual wiring |

### Open decisions

- None for Wave A. Pass 4 decisions D1-D8 are signed off in the current spec.
- Implementation note: `ProgramWaiver` is referenced by the spec but not defined. SESSION_0020 explicitly assigns Cody to add it during implementation.

### Risks

- Local database may not be running; if so, schema validation can proceed but `db push`/seed will be blocked.
- Prisma 7 relation validation may require explicit back-relations not shown in the spec snippets.

### Scope guard

Only Wave A school-ops schema lands in this session. Pass 2-4 implementation stays queued unless required solely to make Wave A relations valid.

## Pre-flight: Schema Wave A

### 1. Existing component scan

- UI component scan: not applicable — this is a Prisma schema migration, not a UI component.
- Existing schema scan: `rg "model (Program|ClassSchedule|Attendance|PricingPlan|OrgSettings)|enum ScheduleStatus" apps/web/prisma/schema.prisma`
- Found: no existing Wave A models/enums in `schema.prisma`.

### 2. L1 template scan

- Dirstarter pattern source: existing Dirstarter/Better-Auth Prisma models at the top of `schema.prisma`.
- Closest L1 pattern: `User`, `Session`, `Tool`, and existing Ronin models use explicit FK fields, relation arrays, `@@index`, and `@@unique`.

### 3. Composition decision

- [x] Extending existing schema patterns: explicit relations, cascade behavior, indexed FK fields.
- [ ] New component, no L1 match exists: N/A.

### 4. Lane docs loaded

- [x] Prior SESSION "Next session" section read: `docs/sprints/SESSION_0022.md`
- [x] Wiki/runbook entries for target area read: `docs/runbooks/schema-migration.md`, `docs/protocols/failed-steps-log.md`
- [x] Spec consulted: `docs/architecture/s2-schema-additions.md`

### 5. Dev environment confirmed

- Dev server command: `cd apps/web && bun run dev`
- Prisma command base: `cd apps/web && bunx prisma validate`
- Working directory: `/Users/brianscott/dev/wt-core-platform/apps/web`
- Brand/host for later smoke testing: local Next dev server, host from `docs/runbooks/dev-environment.md`

### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001, FS-0002, FS-0004 are mitigated/closed.
- Mitigation acknowledged: yes — session artifact created before code, runbook consulted, schema implementation follows existing patterns instead of ad hoc shortcuts.

## What landed

- Created dedicated worktree `/Users/brianscott/dev/wt-core-platform` on branch `session-0023-core-platform`.
- Added Wave A school-ops schema to `apps/web/prisma/schema.prisma`:
  - 18 new enums for scheduling, attendance, enrollment, belt testing, billing, notifications, families, and org relationships.
  - 26 new models: programs/schedules/attendance, belt testing, family groups, billing/payments, contracts, notifications, org relationships, and org settings.
  - Existing-model relations/fields for `User`, `Organization`, `Discipline`, `Role`, `RankSystem`, `Rank`, `Course`, and `Waiver`.
- Added the known missing `ProgramWaiver` join model referenced by the signed spec and SESSION_0020 implementation note.
- Added `INSTRUCTOR_STUDENT` to `LineageRelationType`.
- Patched `docs/runbooks/schema-migration.md` so preflight uses `bunx prisma validate` instead of the invalid Prisma 7 `db push --dry-run` command.
- Reset local `ronindojo_dev`, pushed schema, generated Prisma client, and loaded seed data successfully.

## Files touched

- `apps/web/prisma/schema.prisma` — Wave A schema additions, relation fields, and `ProgramWaiver`.
- `docs/runbooks/schema-migration.md` — fixed invalid Prisma 7 dry-run command; bumped `updated`, `last_agent`, and `use_count`.
- `docs/sprints/SESSION_0023.md` — session artifact, plan, pre-flight, verification, and handoff.
- `do../protocols/project-log.md` — new numbered task ledger from SESSION_0023 forward.
- `do../protocols/project-log.md` — new review/finding ledger from SESSION_0023 forward.
- `docs/rituals/opening.md` — added task-plan-log gate during bow-in.
- `docs/rituals/closing.md` — added task-review-log gate during full close.
- `docs/knowledge/wiki/index.md` — added SESSION_0022/0023 and task log links.
- `docs/knowledge/wiki/manual-boundary-registry.md` — updated MB-002 with Wave A authorization boundary.

## Decisions resolved

- Brian's "execute immediately according to plan" was treated as authorization to proceed with the already-signed Pass 4 decisions and Wave A implementation.
- `ProgramWaiver` is implemented as a `Program` ↔ `Waiver` join table with `required` and `createdAt`, matching SESSION_0020's instruction to add it during Cody implementation.
- Prisma 7 preflight uses `prisma validate`; `prisma db push --dry-run` is not valid in this repo.
- Giddy placement decision: task logs live in `docs/protocols/` and are referenced by rituals and wiki index. They are not embedded directly in `opening.md` or `closing.md` because rituals should stay executable, not become append-only history files.

## Verification

- `bunx prisma format` — passed.
- `bunx prisma validate` — passed.
- `/Applications/Postgres.app/Contents/Versions/latest/bin/psql ronindojo_dev -c "SELECT 1;"` — passed.
- `bunx prisma db push --accept-data-loss` — passed against clean local `ronindojo_dev`.
- `bunx prisma generate --no-hints` — passed.
- `bunx prisma db seed` — passed after clean local DB reset.
- `bunx prisma db pull --print | awk '/^model /{m++} /^enum /{e++} END{print "models=" m; print "enums=" e}'` — `models=71`, `enums=44`.
- `git diff --check` — passed.
- `bunx tsc --noEmit --pretty false` — failed on known pre-existing baseline issues, not Wave A model usage:
  - missing generated Next globals (`PageProps`, `LayoutProps`, `RouteContext`)
  - missing content-collections generated modules
  - Better Auth session `role` typing
  - existing enum mismatches: `DirectoryVisibility.PRIVATE` vs schema `HIDDEN`, `Gender.NON_BINARY` vs schema `NONBINARY`
  - optional S3/media env typing
  - existing Prisma stack-depth query in `server/web/tools/queries.ts`

## Review score

- **8.9 / 10 after hostile review**
- Dirstarter alignment: 2.5 / 2.5 — schema extends Dirstarter/Prisma conventions without replacing baseline layers.
- Data and architecture integrity: 1.3 / 2.0 — Prisma validates, local DB push succeeds, and seed loads, but nullable unique constraints do not enforce the intended business rules in PostgreSQL.
- Lifecycle coverage: 1.4 / 1.5 — Wave A backend contracts cover school-ops lifecycle foundations; UI/service wiring remains future work.
- Test evidence: 1.8 / 2.0 — schema/push/generate/seed evidence is clean; TypeScript remains red due known baseline issues.
- Merge and docs readiness: 0.9 / 1.0 — session, runbook, task logs, rituals, and wiki index updated; changes are intentionally uncommitted pending user instruction.
- Launch usefulness: 1.0 / 1.0 — school-ops backend substrate is now present for Baseline launch work.

Hard cap applied: data integrity has open findings, so the score is capped at 8.9 under WORKFLOW 5.0.

## Task log

- [SESSION_0023_TASK_01](../protocols/project-log.md) — landed
- [SESSION_0023_TASK_02](../protocols/project-log.md) — landed
- [SESSION_0023_TASK_03](../protocols/project-log.md) — landed
- [SESSION_0023_TASK_04](../protocols/project-log.md) — landed

## Review log

- [SESSION_0023_REVIEW_01](../protocols/project-log.md#session_0023_review_01---schema-wave-a-hostile-review)
- [SESSION_0023_REVIEW_02](../protocols/project-log.md#session_0023_review_02---accountability-log-review)

## Hostile review findings

- **High:** `BeltTestPrerequisiteConfig` and `NotificationPreference` use nullable fields inside unique constraints. PostgreSQL will not enforce the intended singleton default rows when those fields are `NULL`.
- **Medium:** WORKFLOW 5.0 was followed for lane/worktree/review mechanics, but the calendar is drifting because `SESSION_0021` remains planned while this Wave A work landed in `SESSION_0023`.
- **Medium:** The schema creates tenant and billing data structures, but no authorization logic landed. Nothing is exposed yet, but future routes/actions must prove brand and org membership checks before touching these rows.
- **Medium:** Dirstarter dev flow is aligned. Production migration is not complete because no durable migration files or production rollback path exist yet.

## Open decisions / blockers

- Nullable unique business rules need a production-grade fix before deploy: scope-key fields, split models, or raw SQL partial unique indexes.
- `SESSION_0021` remains stale/planned and should be marked superseded or recovered in a cleanup.
- Typecheck remains blocked by pre-existing baseline issues listed under Verification.
- Changes are uncommitted in `session-0023-core-platform`; no push was performed because the user did not explicitly authorize commit/push.

## Next session

**Goal:** Execute Schema Wave B migration from the signed S2 spec: invites, generic events, registrations, bracket/match foundations, audit log, lead CRM, rulesets, weigh-ins, and mat assignments.

**Inputs to read:**
1. `docs/architecture/s2-schema-additions.md` — sections 7 and 10
2. `docs/runbooks/schema-migration.md` — corrected Prisma 7 workflow
3. `apps/web/prisma/schema.prisma` — current Wave A baseline
4. `docs/sprints/SESSION_0023.md` — verification notes and known baseline typecheck failures

**First task:** Cross-check Wave B model names against the current schema, then add Wave B enums/models in dependency order with Prisma validation before any DB push.

**Unblocked:** yes.

## Reflections

- The plan was good enough to land the local schema substrate, but it was too optimistic about database integrity. Prisma validation proves syntax and relation consistency, not every business invariant.
- The `ProgramWaiver` catch was a good example of implementation reviewing the spec instead of blindly pasting it.
- The runbook correction mattered. `db push --dry-run` is not accepted by Prisma 7 here, so keeping that command would waste every future migration session.
- The session numbering drift is not harmless. Leaving `SESSION_0021` planned while `SESSION_0023` lands Wave A weakens the whole WORKFLOW 5.0 calendar as an audit artifact.

## Close checklist

- [x] Step 1: paused work and let verification commands finish.
- [x] Step 2: updated SESSION file with landed work, files touched, decisions, blockers, task log, review log, and next session.
- [x] Step 3: ran JETTY/frontmatter sweep on touched docs and updated wiki index for new logs and sessions.
- [x] Step 4: checked branch/status; changes remain uncommitted because commit/push was not explicitly authorized.
- [x] Step 5: bow-out line prepared.
- [x] Step 6: added reflections.
- [x] Step 6.5: ran review/recommend and wrote review findings into `TASK_REVIEW_LOG`.
- [x] Step 7: memory sweep considered; durable project memory is captured in protocol logs, no separate operator memory update needed.
- [x] Step 8: confirmed next session is technically unblocked, with open findings listed as pre-deploy blockers.
