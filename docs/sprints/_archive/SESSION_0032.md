---
title: "SESSION 0032 - Attendance and check-in write surface"
slug: session-0032
type: session
status: closed-full
created: 2026-05-02
updated: 2026-05-02
last_agent: codex-session-0032
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0031_5.md
  - docs/protocols/WORKFLOW_5.0.md
  - docs/protocols/cody-preflight.md
  - docs/architecture/security-privacy-payments-monitoring-plan.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0032 - Attendance and check-in write surface

## Date

2026-05-02.

## Operator

Brian Scott + Codex playing Petey first, then Cody; Doug + Giddy review.

## Status

closed-full

## Goal

Land the School Operations attendance/check-in write surface adjacent to the
schedule slice: coach/admin records check-ins for a `ClassSession`, attendance
can be marked manually, check-ins can be voided, and every path is brand/org
scoped, role-gated, rate-limited, and audit-logged.

## Bow-in audit

- Latest prior session: `docs/sprints/SESSION_0031_5.md`, status
  `closed-full`, WORKFLOW rubric 10/10, Kaizen aggregate 9/10. SESSION_0032 is
  unblocked.

- Branch/worktree: `/Users/brianscott/dev/wt-school-ops` on
  `session-0032-attendance`. The branch was created from
  `session-0031-class-schedules` and then merged with `main` at `f2270f3`, so
  it contains both the schedule code commits and the closed 0031/0031.5 docs.

- OD-A resolved: SESSION_0031 and SESSION_0031.5 are closed-full.
- OD-B resolved: updated `docs/protocols/cody-preflight.md` is present with
  primitive API and schema spot-check sub-steps.

- OD-C resolved: this branch is based on the closed schedule slice state, not
  the stale pre-close worktree state.

- FAILED_STEPS: FS-0006, FS-0007, and FS-0008 are mitigated. This session keeps
  Petey-first planning, TASK_PLAN_LOG entries before implementation, and direct
  schema spot-check evidence.

- SESSION_0031_5_FINDING_01: subagent tool-call budgets must be explicit. Two
  read-only explorers were dispatched with a stated ~20 tool-call budget each.

- SESSION_0031_5_FINDING_02: malformed `dev-environment.md` frontmatter is a
  small docs debt; this session will fix it while docs are already open.

- Drift register: D-005 remains open. Attendance reads are member-private, so
  no persistent `"use cache"` is allowed. Server helpers may use direct queries
  only; React per-request cache is acceptable only if a read helper needs it.

- Manual boundaries: MB-002 is live for every Attendance/CheckIn query or
  mutation. MB-013 advances through this security slice. MB-014 remains
  owner-gated and does not block this session.

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Better Auth/session actions, Prisma/database, `server/web/*` feature folders, safe-action client, centralized rate limiter, AuditLog surface |
| Extension or replacement | Extension. Build `server/web/attendance/*` beside `server/web/schedule/*`, keep `userActionClient`, `canEditOrganization`, `getRequestBrand`, and Prisma client patterns. |
| Why justified | Attendance is the next launch-critical school-ops step after durable `ClassSession` rows. It advances the Prospect -> Member and Coach -> Admin lifecycles without adding UI or billing scope. |
| Risk if bypassed | Cross-brand attendance leakage, student self-check-in without staff authority, duplicate attendance rows, unaudited roster mutation, and hidden regression of the SESSION_0031 security gates. |

## Petey plan

### Goal

Ship the attendance/check-in write aggregate with no UI expansion: actions,
schemas, payload/query helpers, audit/rate-limit wiring, smoke proof, and close
evidence.

### Tasks

#### SESSION_0032_TASK_01 - Attendance actions, audit, rate limits

- **Agent:** Cody, reviewed by Giddy + Doug.
- **What:** Add `apps/web/server/web/attendance/*` and generic school-ops audit
  support for Attendance/CheckIn.

- **Steps:**
  1. Cody pre-flight: Backend + Schema spot-check recorded below before backend
     implementation.
  2. Add `attendance/{payloads,queries,schemas,errors,actions}.ts`, mirroring
     the schedule slice without adding UI.
  3. Add `attendance_write` to `apps/web/lib/rate-limiter.ts`.
  4. Add generic `writeSchoolOpsAudit` and keep `writeScheduleAudit` as a
     backward-compatible export for schedule actions.
  5. Implement `recordCheckIn`, `markAttendance`, and `voidCheckIn` on
     `userActionClient`.
- **Done means:** Same-brand staff (admin/owner/org admin/instructor) can record
  check-in, mark attendance, and void a check-in for an active same-org member;
  students and cross-org/cross-brand users cannot; all writes are
  rate-limited, catalog-error-only, idempotent, and audit-logged.

- **Depends on:** nothing.

#### SESSION_0032_TASK_02 - Rejection matrix smoke and monitoring row

- **Agent:** Doug + Cody.
- **What:** Add proof that the attendance write surface preserves the SESSION
  0031 gates and logs monitoring expectations.
- **Steps:**
  1. Add action-level tests for `recordCheckIn`, `markAttendance`, and
     `voidCheckIn` covering audit rows and rate-limit literals.
  2. Add `apps/web/scripts/smoke-attendance.ts` covering admin allow, org
     instructor allow, cross-org deny, cross-brand deny, unauthenticated deny,
     student-self-check-in deny, past session allow, and future session beyond
     the policy window deny.
  3. Add `attendance_write` to the monitoring row in
     `security-privacy-payments-monitoring-plan.md`.
- **Done means:** Tests and smoke can be rerun in the dev DB with tagged
  fixtures and cleanup; monitoring docs name the new rate-limit key.

- **Depends on:** SESSION_0032_TASK_01.

#### SESSION_0032_TASK_03 - Close evidence and handoff

- **Agent:** Petey + Doug.
- **What:** Full closing ritual for this security-sensitive slice.
- **Steps:**
  1. Fix the `dev-environment.md` YAML frontmatter debt from
     SESSION_0031_5_FINDING_02.
  2. Run verification: Prisma validate, attendance tests, smoke, touched-slice
     typecheck or documented fallback, `git diff --check`, and `bun run
     wiki:lint`.
  3. Update this SESSION file, Project Log task/review entries, frontmatter,
     findings, next-session recommendation, and full-close evidence.

- **Done means:** SESSION_0032 status is `closed-full` with concrete proof and
  SESSION_0033 is staged enough for an LLM-agnostic bow-in.

- **Depends on:** SESSION_0032_TASK_01 and SESSION_0032_TASK_02.

### Parallelism

- Two read-only explorer subagents run in parallel before code:
  audit/action shape and schema/smoke strategy. Budget: ~20 tool calls each.

- All writes stay in one worktree/branch (`wt-school-ops` /
  `session-0032-attendance`) because attendance actions, tests, and smoke share
  fixtures and helper contracts. No parallel write worktree is justified until
  TASK_01 stabilizes.

### Agent assignments

| Task | Lead | Reviewers | Rationale |
| --- | --- | --- | --- |
| Pre-flight | Cody | Petey | Mandatory backend/schema gates. |
| TASK_01 | Cody | Giddy + Doug | Implementation + architecture/security review. |
| TASK_02 | Doug + Cody | Giddy | Rejection matrix, tests, monitoring evidence. |
| TASK_03 | Petey | Doug | Full close, score gate, next-session handoff. |
| Deferred | Desi, Brandon | - | No UI, UX, brand, or marketing scope this slice. |

### Decisions

- Audit helper: add `writeSchoolOpsAudit` and re-export
  `writeScheduleAudit` for schedule compatibility.
- Student self-check-in: denied this slice. Staff/coach/admin only.
- Idempotency: `Attendance` is unique on `(userId, classSessionId)`. A matched
  `CheckIn` is unique through `matchedToAttendanceId`; repeated check-in for
  the same attendance returns/updates the existing attendance without creating
  duplicate matched check-ins.

- Target eligibility: active same-org membership is the floor. Program
  enrollment, entitlement, family, waiver, and billing checks are deferred.

- Future policy: past sessions are allowed for staff correction. Future
  sessions more than one day ahead are denied.

### Risks

- `CheckIn` has no direct brand or org column; every predicate must flow through
  `Attendance -> ClassSession -> ClassSchedule`.
- `canEditOrganization` is not brand-aware by itself, so actions must first
  resolve the `ClassSession` by server-derived brand and organization.

- Shared dev DB tests need tagged fixture cleanup, including zombie sweeps, to
  avoid repeating the SESSION_0031.5 teardown leak.

### Scope guard

Do not add attendance UI, roster screens, `/dashboard/attendance`, student
self-check-in, kiosk UI, QR scanning, family rules, waivers, billing/no-show
fees, entitlement checks, push notifications, public attendance pages, CGR
surfaces, or schema changes.

## Pre-flight output

### Pre-flight: Schema - Attendance/CheckIn write surface (no schema additions)

**1. Petey invocation** - [x] Petey plan exists in this SESSION file with task
IDs SESSION_0032_TASK_01..03. No schema migration is planned.

**2. Design doc check** - `docs/architecture/s2-schema-additions.md`,
`docs/architecture/plan-vs-current.md`, and SESSION_0031/0031.5 were consulted.
The intended chain remains `Program -> ClassSchedule -> ClassSession ->
CheckIn -> Attendance`. Models already exist from Wave A.

**3. Existing schema scan** - direct `schema.prisma` spot-check:

- `Brand` enum: `RONIN_DOJO_DESIGN`, `BASELINE_MARTIAL_ARTS`, `BBL`, `WEKAF`.
- `MembershipStatus` enum: `INVITED`, `PENDING`, `ACTIVE`, `SUSPENDED`,
  `EXPIRED`.
- `ClassSessionStatus` enum: `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`,
  `CANCELLED`.
- `AttendanceStatus` enum: `PRESENT`, `LATE`, `EXCUSED`, `NO_SHOW`.
- `CheckInMethod` enum: `QR_SCAN`, `MANUAL`, `KIOSK_TAP`, `APP`.
- `ClassSchedule` fields used for scope: `brand`, `organizationId`,
  `programId`, `sessions ClassSession[]`; indexes `@@index([brand,
  organizationId])`, `@@index([programId])`.

- `ClassSession` fields used for scope: `date`, `status`, `classScheduleId`,
  `attendances Attendance[]`; unique `@@unique([classScheduleId, date])`.
- `CheckIn` fields: `method`, `deviceId`, `ipAddress`, `timestamp`,
  `matchedToAttendanceId String? @unique`, `userId`; back-relation
  `attendance Attendance?`; index `@@index([userId, timestamp])`. It has no
  brand/org/classSession column, so scope must flow through matched
  Attendance.

- `Attendance` fields: `status`, `notes`, `userId`, `classSessionId`,
  `checkIn CheckIn?`, `gamificationEvents GamificationEvent[]`; unique
  `@@unique([userId, classSessionId])`; indexes `@@index([classSessionId])`,
  `@@index([userId])`.
- `Membership` fields used for target eligibility: `brand`, `status`,
  `userId`, `organizationId`, `disciplineId`, `roleAssignments`; unique
  `@@unique([userId, organizationId, disciplineId])`; indexes
  `@@index([brand, organizationId])`, `@@index([organizationId, status])`,
  `@@index([userId])`.
- `AuditLog` fields: `brand`, `action String`, `entityType String`,
  `entityId`, `before Json?`, `after Json?`, `ipAddress`, `userAgent`,
  `userId`, `organizationId`; indexes `@@index([brand, entityType, entityId])`,
  `@@index([userId, createdAt])`, `@@index([organizationId])`.

**4. Runbook consulted** - `docs/runbooks/schema-migration.md` read. No
migration this slice; verification is Prisma validate/generate only.

**5. Data flow reference** - `docs/runbooks/sop-data-and-wiring-flows.md`
section 1/3: request -> brand context -> Better Auth session -> authz -> Prisma.
`docs/runbooks/sop-e2e-user-lifecycle.md` section 2/7: Membership shell and
staff/admin lifecycle. Attendance extends the existing Program/Schedule chain.

**6. FAILED_STEPS check** - FS-0006/FS-0007/FS-0008 mitigated. The plan exists,
schema values above were read from `schema.prisma` directly, and no inferred
enum spelling is being used.

### Pre-flight: Backend - Attendance actions/queries

**1. Auth predicates planned**

- [x] Session auth required via `userActionClient`.
- [x] Brand derived server-side via `getRequestBrand`.
- [x] ClassSession resolved through `classSchedule.brand` and then
  `classSchedule.organizationId`.
- [x] Actor authority checked with `canEditOrganization` after the branded
  session lookup.

- [x] Target student/member checked through active same-brand, same-org
  `Membership`.
- [x] Student self-check-in denied because the actor must be staff for the
  session organization.

Authorization approach: resolve `ClassSession` by server-derived brand, then
authorize the actor against the resolved organization, then validate the target
member under explicit `{ brand, organizationId, status: ACTIVE }` predicates.
`CheckIn` rows never carry brand themselves, so all CheckIn reads/writes are
anchored through the scoped Attendance/ClassSession chain.

**2. Existing action scan**

- Searched `server/web/` for attendance/check-in: no existing action slice.
- Schedule L1 pattern: `server/web/schedule/actions.ts` (`saveSchedule`,
  `assignInstructor`, `unassignInstructor`, `materializeSchedule`).
- Audit pattern: `server/web/schedule/audit.ts` input shape is already generic
  except for the name.

- Error pattern: `server/web/schedule/errors.ts` literal catalog.
- Schema pattern: `server/web/schedule/schemas.ts`, one zod schema per action.
- Payload pattern: `server/web/schedule/payloads.ts`, strict `Prisma.*Select`
  with `satisfies`.

- Test pattern: `server/web/schedule/actions.test.ts`, real Postgres fixtures,
  mocked `getServerSession`, `next/headers`, `next/cache`, and rate limiter.

- Smoke pattern: `scripts/smoke-schedule.ts`, pure DB rejection matrix with
  tagged fixtures and explicit cleanup.

**3. Data flow reference**

- Flow: Schedule -> ClassSession -> Attendance/CheckIn.
- Lifecycle stage: Coach/Admin records training attendance for active org
  members. This advances Prospect -> Member and Coach -> Admin; billing,
  waiver, entitlement, and family checks are deferred by scope guard.

**4. FAILED_STEPS / manual boundaries**

- FS-0006: satisfied by Petey plan and task IDs before implementation.
- FS-0008: schema spot-check included above.
- MB-002: every new Attendance/CheckIn query/mutation must include explicit
  brand and organization scoping through ClassSchedule/ClassSession.

- D-005: no persistent `"use cache"` on attendance/member-private data.

### Pre-flight: Implementation decisions from source scan

- Audit helper shape: add `server/web/school-ops/audit.ts` with
  `writeSchoolOpsAudit`; keep `server/web/schedule/audit.ts` as a
  backward-compatible re-export/wrapper for existing schedule imports.

- Attendance action names: `recordCheckIn`, `markAttendance`, `voidCheckIn`.
- Canonical audit actions: `check_in.recorded`, `attendance.marked`,
  `check_in.voided`.
- Rate-limit key: `attendance_write`.
- Future policy: deny sessions with `ClassSession.date` more than one day in
  the future; allow past sessions for staff correction.

## Task log

| Task ID | Status |
| --- | --- |
| SESSION_0032_TASK_01 | landed |
| SESSION_0032_TASK_02 | landed |
| SESSION_0032_TASK_03 | landed |

## What landed

- **TASK_01 - Attendance actions, audit, and rate limits.**
  `apps/web/server/web/attendance/{actions,errors,payloads,queries,schemas}.ts`
  now provides `recordCheckIn`, `markAttendance`, and `voidCheckIn` on
  `userActionClient`. The actions derive brand server-side, resolve
  `ClassSession` through `ClassSchedule`, check `canEditOrganization`, require
  active same-org target membership, use the `ATTENDANCE_ERROR` catalog, and
  rate-limit through the new `attendance_write` key.

- **TASK_01 audit shape.** New `apps/web/server/web/school-ops/audit.ts`
  exports `writeSchoolOpsAudit`. Existing `server/web/schedule/audit.ts`
  re-exports it as `writeScheduleAudit`, preserving schedule compatibility.

- **TASK_02 tests and smoke proof.** New
  `apps/web/server/web/attendance/actions.test.ts` covers audit/rate-limit
  behavior for all three actions plus duplicate check-in idempotency. New
  `apps/web/scripts/smoke-attendance.ts` covers admin allow, org instructor
  allow, cross-org deny, cross-brand deny, unauthenticated/no-membership deny,
  student self-check-in deny, past session allow, future >1 day deny, and
  duplicate check-in idempotency.

- **TASK_02 monitoring row.**
  `security-privacy-payments-monitoring-plan.md` now includes
  `attendance_write` in the rate-limiter-unavailable signal.
- **TASK_03 docs cleanup.** Fixed the pre-existing malformed YAML in
  `docs/runbooks/dev-environment.md` (`use_count: 0backlinks:` -> separate
  fields). `docs/knowledge/wiki/index.md` now lists SESSION_0031.5 as
  closed-full and SESSION_0032 as closed-full.

## Files touched

| Path | Note |
| --- | --- |
| `apps/web/server/web/attendance/actions.ts` | Attendance/check-in safe actions. |
| `apps/web/server/web/attendance/actions.test.ts` | Action-level audit/rate-limit/idempotency tests. |
| `apps/web/server/web/attendance/errors.ts` | Literal action error catalog. |
| `apps/web/server/web/attendance/payloads.ts` | Strict Prisma select payloads. |
| `apps/web/server/web/attendance/queries.ts` | Member-private read helper with explicit brand/org scope. |
| `apps/web/server/web/attendance/schemas.ts` | Zod input schemas. |
| `apps/web/server/web/school-ops/audit.ts` | Generic school-ops AuditLog writer. |
| `apps/web/server/web/schedule/audit.ts` | Backward-compatible re-export to generic audit writer. |
| `apps/web/lib/rate-limiter.ts` | Added `attendance_write`. |
| `apps/web/scripts/smoke-attendance.ts` | Rejection-matrix smoke proof. |
| `docs/architecture/security-privacy-payments-monitoring-plan.md` | Monitoring row updated for `attendance_write`. |
| `docs/protocols/project-log.md` | Build/task/review ledger updated. |
| `docs/runbooks/dev-environment.md` | Frontmatter YAML fixed. |
| `docs/knowledge/wiki/index.md` | Session index updated. |
| `docs/sprints/SESSION_0032.md` | Bow-in, pre-flight, close evidence, handoff. |

## Decisions resolved

- Audit helper shape: `writeSchoolOpsAudit` generic helper plus
  `writeScheduleAudit` compatibility export.
- Student self-check-in: explicitly denied for this slice; staff/admin actions
  only.

- Idempotency: duplicate `recordCheckIn` keeps one `Attendance` and one matched
  `CheckIn`.
- Void behavior: `voidCheckIn` unlinks `CheckIn.matchedToAttendanceId` and keeps
  the Attendance row, updating it to `NO_SHOW` or `EXCUSED` for correction.

- Future policy: past sessions allowed; sessions more than one day ahead denied.

## Verification

| Command | Result |
| --- | --- |
| `bun biome check --write ...attendance/schedule/rate-limiter/smoke files` | passed after formatter fixes |
| `bunx prisma validate --schema prisma/schema.prisma` | passed |
| `bun test server/web/attendance/actions.test.ts` | 7 pass / 0 fail |
| `bun scripts/smoke-attendance.ts` | passed full allow/deny/idempotency matrix |
| `bun test server/web/schedule/ server/web/attendance/` | 22 pass / 0 fail |
| `git diff --check` | passed |
| `bunx tsc --noEmit --pretty false` | failed on pre-existing baseline issues outside attendance/school-ops touched paths; no new attendance paths reported |
| `bun run wiki:lint` | passed; 126 markdown files, no lint violations |

## Hostile close review

**Reviewed tasks:** SESSION_0032_TASK_01, SESSION_0032_TASK_02,
SESSION_0032_TASK_03.

**Score: 10.0/10** - no hard caps triggered.

| Category | Weight | Score | Note |
| --- | ---: | ---: | --- |
| Dirstarter alignment | 2.5 | 2.5 | Extension of existing safe-action, Prisma, rate-limiter, and server feature-folder patterns. |
| Data and architecture integrity | 2.0 | 2.0 | No schema changes; brand/org scope flows through ClassSchedule; idempotency anchored in existing unique constraints. |
| Lifecycle coverage | 1.5 | 1.5 | Coach/admin can record, mark, and void attendance for active same-org members. |
| Test evidence | 2.0 | 2.0 | Action tests, schedule+attendance suite, and smoke all pass. |
| Merge and docs readiness | 1.0 | 1.0 | SESSION, Project Log, wiki index, monitoring doc, and runbook updated. |
| Launch usefulness | 1.0 | 1.0 | Advances Baseline school-ops member lifecycle after schedules. |
| **Total** | **10.0** | **10.0** | No cap. |

**Findings:** SESSION_0032_FINDING_01 - full app typecheck remains blocked by
pre-existing baseline debt (`PageProps`/`RouteContext`, content-collections
generated types, auth role typing, passport enum drift, S3 env typing). This
does not block the attendance slice; it should be considered for a dedicated
hardening session.

## Reflections

- The generic audit wrapper was the right small abstraction. It removed the
  schedule-specific name from new attendance code while preserving the schedule
  import contract and tests.

- `CheckIn` being unscoped by brand/org is the load-bearing risk. Keeping every
  query anchored through Attendance/ClassSession/ClassSchedule is mandatory
  until a future schema change adds direct scope fields or a richer event model.

- The one-day future window is intentionally conservative. It supports next-day
  class prep and timezone slop while rejecting arbitrary future check-ins.

- Full repo typecheck debt is now the loudest residual quality issue. It is not
  from this slice, but it does reduce confidence in broad refactors.

## Open decisions / blockers

- MB-002 remains open globally. SESSION_0032 complies locally through explicit
  ClassSchedule/ClassSession brand/org scope.

- MB-013 remains open but advanced by this slice.
- MB-014 remains owner-gated and does not block local SESSION_0033 work.
- SESSION_0032_FINDING_01: full app typecheck baseline debt remains open.

## Next session

**SESSION_0033 - Program enrollments, family groups, waivers, and trial
lifecycle.**

Inputs to read: `docs/sprints/SESSION_0032.md`,
`docs/protocols/WORKFLOW_5.0.md`, `docs/protocols/cody-preflight.md`,
`docs/architecture/security-privacy-payments-monitoring-plan.md`, and the
Membership/ProgramEnrollment/FamilyGroup/Waiver models in
`apps/web/prisma/schema.prisma`.

First task: Petey plan the enrollment/family/waiver slice and decide whether
SESSION_0032_FINDING_01 (full typecheck debt) should preempt it.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0032 frontmatter created and set to `closed-full`; `security-privacy-payments-monitoring-plan.md`, `project-log.md`, `dev-environment.md`, and `wiki/index.md` updated with `updated: 2026-05-02` / `last_agent: codex-session-0032` where touched. Code files carry no frontmatter. |
| Backlinks/index sweep | `docs/knowledge/wiki/index.md` updated: SESSION_0031.5 -> closed-full and SESSION_0032 -> closed-full. SESSION_0032 backlinks to wiki index; no new wiki concept pages created. |
| Wiki lint | `bun run wiki:lint` -> 126 markdown files scanned, no lint violations. |
| Kaizen reflection | `## Reflections` section present. |
| Hostile close review | Inline review above; `SESSION_0032_REVIEW_01` appended to `docs/protocols/project-log.md`. |
| Review & Recommend | `## Next session` recommends SESSION_0033 enrollment/family/waiver slice, with typecheck-debt decision surfaced. |
| Memory sweep | None needed; persistent lessons are captured in SESSION_0032 and Project Log findings. |
| Next session unblock check | Unblocked unless owner chooses to prioritize full typecheck debt first. |
| Git hygiene | Branch `session-0032-attendance`; `git diff --check` passed; staged files reviewed for no `.env`, secrets, or `node_modules`; local commit created, not pushed. |
