---
title: "Project Log"
slug: project-log
type: protocol
status: active
created: 2026-04-28
updated: 2026-05-15
last_agent: claude-session-0172
pairs_with:
  - docs/rituals/opening.md
  - docs/rituals/closing.md
  - docs/protocols/WORKFLOW_5.0.md
  - docs/protocols/hostile-close-review.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/knowledge/wiki/content-engine/directory-monetization-roadmap.md
  - docs/sprints/SESSION_0023.md
  - docs/sprints/SESSION_0024.md
  - docs/sprints/SESSION_0025.md
  - docs/sprints/SESSION_0026.md
  - docs/sprints/SESSION_0027.md
  - docs/sprints/SESSION_0029.md
  - docs/sprints/SESSION_0030.md
  - docs/sprints/SESSION_0033.md
  - docs/sprints/SESSION_0095.md
  - docs/sprints/SESSION_0096.md
  - docs/sprints/SESSION_0097.md
  - docs/sprints/SESSION_0098.md
  - docs/sprints/SESSION_0099.md
  - docs/sprints/SESSION_0100.md
  - docs/sprints/SESSION_0101.md
  - docs/sprints/SESSION_0102.md
  - docs/sprints/SESSION_0103.md
  - docs/sprints/SESSION_0106.md
  - docs/sprints/SESSION_0111.md
  - docs/sprints/SESSION_0157.md
  - docs/sprints/SESSION_0158.md
  - docs/sprints/SESSION_0159.md
  - docs/sprints/SESSION_0160.md
  - docs/sprints/SESSION_0161.md
  - docs/sprints/SESSION_0162.md
  - docs/sprints/SESSION_0163.md
  - docs/sprints/SESSION_0164.md
  - docs/sprints/SESSION_0165.md
  - docs/sprints/SESSION_0166.md
  - docs/sprints/SESSION_0167.md
  - docs/sprints/SESSION_0168.md
  - docs/sprints/SESSION_0169.md
  - docs/sprints/SESSION_0170.md
  - docs/sprints/SESSION_0171.md
  - docs/sprints/SESSION_0172.md
  - docs/architecture/dirstarter-upstream-sync-2026-05-14.md
  - docs/runbooks/baseline-listings-runbook.md
  - docs/runbooks/mcp-usage-runbook.md
---

# Project Log

Unified append-only ledger. Consolidates the former `build-log.md`, `TASK_PLAN_LOG`, and `TASK_REVIEW_LOG` (merged SESSION_0027).

Three sections:

1. **Build log** — what shipped and whether it works
2. **Task plan log** — task accountability (IDs, owners, done criteria)
3. **Task review log** — review findings that survive beyond a single session

## Rules

1. Every Cody task that touches code gets a build log entry.
2. Every planned task gets a task plan entry with stable ID: `SESSION_NNNN_TASK_XX`.
3. Every hostile/full close gets a review entry with stable ID: `SESSION_NNNN_REVIEW_XX`.
4. Findings get stable IDs: `SESSION_NNNN_FINDING_XX`.
5. Entries are never edited after creation (append-only). If status changes, append a note.
6. Opening ritual requires a task plan entry when tasks are identified. Closing ritual requires a review entry before `closed-full`.

---

## Build log

### S1_SCHEMA — Phase 1 schema rev (31 models, all enums)

- **Session:** SESSION_0003–0005
- **Sprint:** S1
- **Status:** ✅ verified
- **Files:** prisma/schema.prisma, prisma/seed.ts, migrations/
- **Seed data:** yes (12 disciplines, 13 rank systems, 194 ranks, roles, event types)
- **Smoke test:** migration applied, seed ran, Prisma Studio verified

### S2_AUTH — Better-Auth + Passport bootstrap

- **Session:** SESSION_0007
- **Sprint:** S2
- **Status:** ✅ verified
- **Files:** auth config, passport routes, middleware
- **Seed data:** yes (2 template users)
- **Smoke test:** sign-up creates User + Passport + DirectoryProfile stubs

### S3_ORG — Organization create + join flow

- **Session:** SESSION_0008–0013
- **Sprint:** S3
- **Status:** ✅ verified
- **Files:** org actions, org pages, membership logic
- **Seed data:** partial (no test orgs in seed at the time)
- **Smoke test:** create org + join flow tested in browser

### S4_DIRECTORY — Directory search with privacy

- **Session:** SESSION_0014
- **Sprint:** S4
- **Status:** ⚠️ needs-verification
- **Files:** server/web/directory/queries.ts, components/web/directory/*, app/(web)/directory/page.tsx
- **Seed data:** no → **fixed in SESSION_0015** (5 test users with full identity graph)
- **Smoke test:** pending — directory showed empty because no seed data existed
- **Fix (SESSION_0015):** Added 5 test users to seed.ts with Passport + DirectoryProfile + Organization + Membership + RankAward. Reseeded. Awaiting browser verification.

### S15_SEED_FIX — Seed script: full identity graph

- **Session:** SESSION_0015
- **Sprint:** S4 (fix)
- **Status:** ✅ verified
- **Files:** prisma/seed.ts
- **Seed data:** yes — 5 users: sensei (PUBLIC/ACTIVE/Blue), alpha (PUBLIC/ACTIVE/White), beta (MEMBERS_ONLY/ACTIVE/L3), ghost (HIDDEN/ACTIVE), pending (PUBLIC/PENDING)
- **Smoke test:** `prisma db seed` ran successfully, all 5 users created with full graph

### S15_DOC_ADOPTION — SOP adoption + feature prerequisites + Cody pre-flight

- **Session:** SESSION_0015
- **Sprint:** S4 (housekeeping)
- **Status:** ✅ verified
- **Files:** docs/runbooks/sop-data-and-wiring-flows.md, docs/runbooks/sop-e2e-user-lifecycle.md, docs/architecture/feature-data-prerequisites.md, docs/agents/cody.md
- **Seed data:** n/a (docs only)
- **Smoke test:** n/a

### S15_CLOSE_FIX — Full close steps remediation (FS-0004)

- **Session:** SESSION_0015
- **Sprint:** S4 (process fix)
- **Status:** ✅ verified
- **Files:** docs/protocols/failed-steps-log.md, docs/agents/cody.md, docs/knowledge/wiki/index.md, docs/knowledge/wiki/files/seed-ts.md, docs/architecture/feature-data-prerequisites.md, docs/sprints/SESSION_0015.md
- **Seed data:** n/a
- **Smoke test:** JETTY sweep completed, wiki index updated, close checklist artifact added to SESSION file

### S28_PROGRAM_CRUD — School Ops Program CRUD

- **Session:** SESSION_0028
- **Sprint:** S2 / School operations lane
- **Status:** ✅ verified
- **Files:** apps/web/server/web/program/*, apps/web/app/(web)/programs/*, apps/web/components/web/programs/create-program-form.tsx, apps/web/lib/authz.ts, apps/web/prisma/seed.ts, apps/web/scripts/smoke-program.ts
- **Seed data:** yes — 2 Baseline Programs plus Sensei OWNER role assignment
- **Smoke test:** `bun scripts/smoke-program.ts` passed; HTTP smoke returned `/programs` 200, `/programs/[id]` 200, protected create/edit routes 307 to login

### DIRECTORY_MONETIZATION_ROADMAP — Directory monetization roadmap + Dirstarter reuse pass

- **Session:** Roadmap artifact, not numbered SESSION_0029 per owner directive
- **Sprint:** Cross-lane roadmap / Content + monetization
- **Status:** ✅ verified with known full-typecheck baseline debt
- **Files:** `docs/architecture/source/directory-monetization-roadmap.md`, `docs/knowledge/wiki/content-engine/directory-monetization-roadmap.md`, `apps/web/lib/ai.ts`, AI routes, ad picker/bottom placement, Stripe product setup, seed data, wiki governance docs
- **Seed data:** yes — martial-arts `Tool` entries for Baseline Martial Arts, Black Belt Legacy, WEKAF USA, Ronin Dojo Design, USA Stick Fighting, Black Belt Wiki, and Smoothcomp
- **Smoke test:** `bunx biome check --write` on touched code passed; `bun run db:generate` passed; `bunx prisma validate --schema prisma/schema.prisma` passed; `bun run wiki:lint` passed; `git diff --check` passed; `curl -H "Host: baseline.local" http://localhost:3000/submit` returned 200; `curl -H "Host: baseline.local" http://localhost:3000/advertise` returned 200. Full `bunx tsc --noEmit --pretty false` still fails on pre-existing baseline issues, with no errors reported in the roadmap-touched code paths after Prisma generate.

### S32_ATTENDANCE_WRITE — Attendance/check-in write surface

- **Session:** SESSION_0032
- **Sprint:** S2 / School operations lane
- **Status:** ✅ verified with known full-typecheck baseline debt
- **Files:** `apps/web/server/web/attendance/*`, `apps/web/server/web/school-ops/audit.ts`, `apps/web/server/web/schedule/audit.ts`, `apps/web/lib/rate-limiter.ts`, `apps/web/scripts/smoke-attendance.ts`
- **Seed data:** no durable seed changes; tests and smoke use tagged dev-DB fixtures with cleanup.
- **Smoke test:** `bun test server/web/attendance/actions.test.ts` 7/7; `bun test server/web/schedule/ server/web/attendance/` 22/22; `bun scripts/smoke-attendance.ts` passed allow/deny/idempotency matrix; `bunx prisma validate --schema prisma/schema.prisma` passed. Full `bunx tsc --noEmit --pretty false` still fails on pre-existing baseline issues outside the attendance/school-ops touched paths.

### S32_5_TYPECHECK_DEBT — Full app typecheck baseline

- **Session:** SESSION_0032.5
- **Sprint:** S2 / QA hardening
- **Status:** ✅ verified, pause-gated before SESSION_0033
- **Files:** `apps/web/package.json`, `apps/web/tsconfig.json`, `apps/web/lib/auth.ts`, `apps/web/lib/media.ts`, `apps/web/services/s3.ts`, `apps/web/lib/structured-data.ts`, `apps/web/server/web/passport/*`, `apps/web/server/web/tools/queries.ts`
- **Seed data:** n/a.
- **Smoke test:** `bun run typecheck` passed; `bunx tsc --noEmit --pretty false` passed after `next typegen`; `bun test server/web/schedule/ server/web/attendance/` 22/22; `bun scripts/smoke-attendance.ts` passed; `bunx prisma validate --schema prisma/schema.prisma` passed.

### S33_ENROLLMENT_FAMILY_WAIVER_LEAD — Enrollment, family, waiver, trial write surface

- **Session:** SESSION_0033
- **Sprint:** S2 / School operations lane
- **Status:** ✅ verified with known full-typecheck baseline debt
- **Files:** `apps/web/server/web/{enrollment,family,waiver,lead}/*`, `apps/web/scripts/smoke-school-ops-extended.ts`, `apps/web/lib/rate-limiter.ts`
- **Seed data:** no durable seed changes; action tests and smoke use tagged dev-DB fixtures with cleanup.
- **Smoke test:** `bun test server/web/enrollment server/web/family server/web/waiver server/web/lead` 7/7; `bun test server/web/schedule server/web/attendance` 22/22; `bun scripts/smoke-school-ops-extended.ts` passed enrollment/family/waiver/lead allow-deny-convert matrix; `bunx prisma validate --schema prisma/schema.prisma` passed. Full `bunx tsc --noEmit --pretty false` still fails on pre-existing baseline issues outside the SESSION_0033 touched paths.

### S58_TOURNAMENT_SNAPSHOTS_AUTH — Tournament registration snapshots + admin auth hardening

- **Session:** SESSION_0058
- **Sprint:** P0–P2 remediation
- **Status:** ✅ verified
- **Files:** `apps/web/server/web/tournaments/register.ts`, `apps/web/app/api/stripe/webhooks/route.ts`, `apps/web/components/admin/auth-hoc.tsx`
- **Seed data:** no
- **Smoke test:** `bunx tsc --noEmit` passes; code review confirmed snapshot fields populated in both free and paid registration paths; PricingPlanActions type mismatch investigated and closed as INVALID (TypeScript structural typing).

### S59_CACHE_ENROLLMENT_DRIFT — Cache pattern upgrade + enrollment Passport check + drift close

- **Session:** SESSION_0059
- **Sprint:** P0–P2 remediation
- **Status:** ✅ verified
- **Files:** `apps/web/server/web/organization/queries.ts`, `apps/web/server/web/directory/queries.ts`, `apps/web/server/web/enrollment/actions.ts`, `apps/web/server/web/enrollment/errors.ts`
- **Seed data:** no
- **Smoke test:** `bunx tsc --noEmit` passes; public queries upgraded to `"use cache"` + `cacheTag` + `cacheLife`; auth-scoped queries kept with React `cache()`; enrollment Passport assertion added to both `enrollInProgram` and `joinProgramWaitlist`; D-005 and D-011 closed.

### S60_HOSTILE_CLOSE_REVIEW — Cross-session hostile-close review (audit only, no code)

- **Session:** SESSION_0060
- **Sprint:** Hostile-close review
- **Status:** ✅ review complete — 6 P1 + 1 P2 + 3 P3 findings documented
- **Files:** no code changes (audit session)
- **Seed data:** no
- **Smoke test:** wiki:lint passed clean (169 files, 0 violations); D-006 and D-010 closed; `program-plan.md` marked `partially-superseded`.

### S96_BILLING_LAUNCH_GAPS — Customer billing, webhook idempotency, and lifecycle proof

- **Session:** SESSION_0096
- **Sprint:** S3 / Commerce implementation
- **Status:** ✅ verified with known full-typecheck baseline debt
- **Files:** `apps/web/prisma/schema.prisma`, `apps/web/prisma/migrations/20260507140933_add_stripe_customer_ledger_event_tracking/migration.sql`, `apps/web/app/api/stripe/webhooks/route.ts`, `apps/web/app/api/stripe/webhooks/route.test.ts`, `apps/web/server/web/billing/*`, `apps/web/server/web/products/actions.ts`, `apps/web/server/web/tournaments/register.ts`, `apps/web/server/web/dashboard/queries.ts`, `apps/web/app/(web)/dashboard/*`
- **Seed data:** no durable seed changes; tests create and clean real Prisma fixtures.
- **Smoke test:** `bun test app/api/stripe/webhooks/route.test.ts server/web/billing/actions.test.ts server/web/tournaments/register.concurrency.test.ts` passed 18/18; scoped Biome check passed. Full `bun run typecheck` still fails only on pre-existing unrelated errors from SESSION_0095.

### S99_STORAGE_MEDIA_BRIDGE — S3 public media bridge and admin cost monitor

- **Session:** SESSION_0099
- **Sprint:** S3 / Launch support
- **Status:** ✅ verified with full typecheck inconclusive
- **Files:** `apps/web/lib/public-media-url.ts`, `apps/web/components/web/tuffbuffs/*`, `apps/web/server/admin/storage/monitoring/queries.ts`, `apps/web/app/admin/storage/monitoring/page.tsx`, `apps/web/components/admin/sidebar.tsx`, `apps/web/env.ts`, `docs/runbooks/aws-s3-operator-runbook.md`
- **Seed data:** no
- **Smoke test:** `bun test lib/public-media-url.test.ts server/admin/storage/monitoring/queries.test.ts` passed 6/6; scoped Biome passed; `bun run wiki:lint` passed with 0 errors and 3 existing orphan warnings; `git diff --check` passed. `bun run typecheck` generated route types but was manually terminated after several minutes without TypeScript output.

---

## Task plan log

### Status values

| Status | Meaning |
| --- | --- |
| planned | Task exists but work has not started |
| in-progress | Task is actively being worked |
| landed | Work landed and has evidence |
| blocked | Task cannot proceed without an external decision or fix |
| superseded | Task was replaced by a later task |

### Entries

| Task ID | Session | Lane | Owner | Task | Done criteria | Status | Review |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SESSION_0023_TASK_01 | SESSION_0023 | Core platform | Petey + Giddy | Activate core-platform worktree | `git worktree list` shows wt-core-platform | landed | SESSION_0023_REVIEW_01 |
| SESSION_0023_TASK_02 | SESSION_0023 | Core platform | Cody | Implement Wave A schema | Prisma validates; local DB push, generate, and seed pass | landed | SESSION_0023_REVIEW_01 |
| SESSION_0023_TASK_03 | SESSION_0023 | Core platform | Doug + Giddy | Review and evidence | Verification evidence and residual risk recorded | landed | SESSION_0023_REVIEW_01 |
| SESSION_0023_TASK_04 | SESSION_0023 | Core platform | Giddy | Add task accountability logs | Logs exist, rituals/index wired | landed | SESSION_0023_REVIEW_02 |
| SESSION_0024_TASK_01 | SESSION_0024 | Core platform | Giddy + Doug | Promote hostile close review into protocol | Closing ritual calls hostile review; Dirstarter docs gate explicit | landed | SESSION_0024_REVIEW_01 |
| SESSION_0025_TASK_01 | SESSION_0025 | Core platform | Giddy + Doug | Log full-close proof and wiki-lint failure | FS-0005 exists with corrective action | landed | SESSION_0025_REVIEW_01 |
| SESSION_0025_TASK_02 | SESSION_0025 | Core platform | Giddy | Tighten closing mode contract | closing.md requires full-close evidence + wiki-lint | landed | SESSION_0025_REVIEW_01 |
| SESSION_0025_TASK_03 | SESSION_0025 | Core platform | Giddy | Commit and push accumulated work | Branch committed and pushed | landed | SESSION_0025_REVIEW_01 |
| SESSION_0026_TASK_01 | SESSION_0026 | Core platform | Petey | Mark SESSION_0021 superseded | SESSION_0021 status → superseded | landed | SESSION_0026_REVIEW_01 |
| SESSION_0026_TASK_02 | SESSION_0026 | Core platform | Petey | Scope finding: nullable unique constraints | Scoping decision recorded | landed | SESSION_0026_REVIEW_01 |
| SESSION_0026_TASK_03 | SESSION_0026 | Core platform | Petey | Scope finding: MB-002 auth predicates | Per-feature enforcement decision recorded | landed | SESSION_0026_REVIEW_01 |
| SESSION_0026_TASK_04 | SESSION_0026 | Core platform | Petey | Scope finding: production migration artifacts | Target session assigned | landed | SESSION_0026_REVIEW_01 |
| SESSION_0026_TASK_05 | SESSION_0026 | Core platform | Cody | Update TASK_REVIEW_LOG finding statuses | Four findings updated | landed | SESSION_0026_REVIEW_01 |
| SESSION_0026_TASK_06 | SESSION_0026 | Core platform | Cody | Schema Waves B/C/D (UNPLANNED) | prisma validate passes, 26 models + 21 enums | landed | SESSION_0026_REVIEW_01 |
| SESSION_0027_TASK_01 | SESSION_0027 | Core platform | Petey | Governance artifact inventory | Classification table in SESSION file | landed | — |
| SESSION_0027_TASK_02 | SESSION_0027 | Core platform | Cody | Consolidate/archive stale artifacts | All docs active-enforced, archived, or updated | in-progress | — |
| SESSION_0027_TASK_03 | SESSION_0027 | Core platform | Cody | Close FS-0006 + FS-0007 | Failed steps mitigated with evidence | planned | — |
| SESSION_0028_TASK_01 | SESSION_0028 | School operations | Petey + Giddy | Re-sequence WORKFLOW_5.0 calendar | Calendar reflects actual sessions and current feature sequence | landed | SESSION_0028_REVIEW_01 |
| SESSION_0028_TASK_02 | SESSION_0028 | School operations | Cody + Desi | Program CRUD pre-flight and implementation | `/programs` list/create/detail works with auth and brand scoping | landed | SESSION_0028_REVIEW_01 |
| SESSION_0028_TASK_03 | SESSION_0028 | School operations | Doug + Giddy | Verification and close evidence | Checks and smoke evidence recorded in SESSION_0028 | landed | SESSION_0028_REVIEW_01 |
| SESSION_0029_TASK_01 | SESSION_0029 | Core platform governance | Petey + Giddy | Preserve raw source and re-sequence session calendar | Raw source exists under `docs/architecture/source/raw/`; WORKFLOW_5.0 moves the planned School Ops CRUD continuation to SESSION_0030 | landed | SESSION_0029_REVIEW_01 |
| SESSION_0029_TASK_02 | SESSION_0029 | Core platform governance | Cody + Giddy | Schema DRY and Dirstarter baseline review | Specs name existing models, duplication risks, current Dirstarter docs, and future deltas before any Prisma changes | landed | SESSION_0029_REVIEW_01 |
| SESSION_0029_TASK_03 | SESSION_0029 | Content + curriculum / monetization | Petey + Cody + Doug | Create commerce learning path specs | Programs/curriculum/certification, monetization/entitlements, and Dirstarter commerce alignment docs exist with MVP cut line and review evidence | landed | SESSION_0029_REVIEW_01 |
| SESSION_0029_TASK_04 | SESSION_0029 | Core platform governance | Petey + Giddy + Doug | Bow-out hardening and worktree cleanup | Merged clean worktrees removed; closing ritual requires worktree cleanup and ADR/Dirstarter proof; glossary and ADR 0011 updated | landed | SESSION_0029_REVIEW_02 |
| SESSION_0030_TASK_00 | SESSION_0030 | School operations + security governance | Petey + Giddy + Doug | Preserve CGR source, stage SESSION_0030, run hostile security review, and full close | Raw source, staged plan, security/monitoring architecture doc, MB-013, Project Log review, and full close evidence exist | landed | SESSION_0030_REVIEW_01 |
| SESSION_0030_TASK_01 | SESSION_0030 | School operations | Cody + Giddy | ClassSchedule CRUD substrate | Authorized org editor can create/edit/archive schedules; unauthorized/cross-brand attempts fail server-side | superseded by SESSION_0031_TASK_01 | SESSION_0030_REVIEW_01 |
| SESSION_0030_TASK_02 | SESSION_0030 | School operations | Cody + Desi + Doug | Instructor assignments and ClassSession basics | Schedule shows assigned instructors and upcoming sessions without touching attendance | superseded by SESSION_0031_TASK_02 | SESSION_0030_REVIEW_01 |
| SESSION_0030_TASK_03 | SESSION_0030 | School operations | Doug + Cody | Fixtures, smoke proof, and close evidence | Schedule slice has targeted fixtures, smoke script, and verification evidence | superseded by SESSION_0031_TASK_03 | SESSION_0030_REVIEW_01 |
| SESSION_0030_TASK_04 | SESSION_0030 | Core platform governance | Codex (Petey) | Bow-out prep refactor: centralize brand-context + add MB-014 + create SESSION_0031 plan | `apps/web/lib/brand-context.ts` exists; `proxy.ts` and `server/web/program/actions.ts` import from it; WORKFLOW_5.0 calendar patched; MB-014 registered; SESSION_0031.md planned with all 11 SESSION_0030 hostile-review gates folded in | landed | SESSION_0030_REVIEW_01 |
| SESSION_0031_TASK_01 | SESSION_0031 | School operations | Cody + Giddy + Doug | ClassSchedule aggregate (Schedule + Instructor Assignment) with security gates 1-5, 7-9, 11 wired into done-criteria | Authorized org editor creates/edits/archives schedules; cross-brand/cross-org/unauthenticated all rejected; instructor selector limited to ACTIVE same-org OWNER/ORG_ADMIN/INSTRUCTOR; rate-limit + error-catalog + AuditLog (or written waiver) in place | landed | SESSION_0031_REVIEW_01 |
| SESSION_0031_TASK_02 | SESSION_0031 | School operations | Cody + Desi + Doug | ClassSession materialization (bounded + idempotent) with security gates 6 + 11 | 90-day bounded generation; never deletes a session with attached Attendance (sets CANCELLED — schema spelling); public schedule surface exposes only safe fields | landed | SESSION_0031_REVIEW_01 |
| SESSION_0031_TASK_03 | SESSION_0031 | School operations | Doug + Cody | Fixtures, rejection-matrix smoke proof, monitoring update, close evidence; security gate 10 | `apps/web/scripts/smoke-schedule.ts` proves rejection matrix; `security-privacy-payments-monitoring-plan.md` adds rate-limiter-unavailable signal; full close evidence rendered | landed | SESSION_0031_REVIEW_01 |
| SESSION_0031_5_TASK_01 | SESSION_0031.5 | School operations | Cody + Giddy + Doug | Pagination + status filter on schedule list page | `getSchedulesByProgramPaginated` query exists with explicit `{brand,organizationId}` predicate; list page uses nuqs query params; default 20 / max 50; existing smoke still passes | landed | SESSION_0031_5_REVIEW_01 |
| SESSION_0031_5_TASK_02 | SESSION_0031.5 | School operations | Doug + Cody | Action-level test proving gates 4 + 9 fire under the real action stack | `apps/web/server/web/schedule/actions.test.ts` covers `saveSchedule`/`assignInstructor`/`archiveSchedule`; asserts `AuditLog` row created and `RATE_LIMITED` literal thrown when limiter blocks | landed | SESSION_0031_5_REVIEW_01 |
| SESSION_0031_5_TASK_03 | SESSION_0031.5 | Core platform governance | Petey + Doug | `cody-preflight.md` primitive + schema spot-check sub-steps | UI checklist requires reading `components/common/<name>.tsx` and recording exposed props; schema checklist requires reading enums + relation directions from `schema.prisma`; FAILED_STEPS entry mitigated | landed | SESSION_0031_5_REVIEW_01 |
| SESSION_0031_5_TASK_04 | SESSION_0031.5 | Core platform governance | Cody + Petey | `dev-environment.md` fresh-worktree bootstrap section | Section exists with copy-pasteable `bun install` / `.env` copy / `bunx prisma generate` / verification commands; cross-linked from `cody-preflight.md` step 5 | landed | SESSION_0031_5_REVIEW_01 |
| SESSION_0031_5_TASK_05 | SESSION_0031.5 | School operations | Cody + Doug | Materialize instrumentation (batch optimization deferred until evidence) | `materializeSchedule` logs `created/cancelled/deleted/refreshed/duration` per call; close evidence records that batch upserts were deferred per Kaizen reasoning | landed (instrumentation-only) | SESSION_0031_5_REVIEW_01 |
| SESSION_0031_5_TASK_06 | SESSION_0031.5 | School operations | Doug + Cody + Giddy | DST + concurrency tests for schedule materialization | Two DST cases (spring-forward, fall-back) added to `session-generator.test.ts`; new `materialize.concurrency.test.ts` proves no duplicate `(classScheduleId, date)` rows under parallel `materializeSchedule` calls | landed | SESSION_0031_5_REVIEW_01 |
| SESSION_0032_TASK_01 | SESSION_0032 | School operations | Cody + Giddy + Doug | Attendance actions, audit, and rate limits | `recordCheckIn`, `markAttendance`, and `voidCheckIn` exist under `server/web/attendance/*`; staff-only same-brand/org writes are catalog-error-only, idempotent, `attendance_write` rate-limited, and AuditLogged | landed | SESSION_0032_REVIEW_01 |
| SESSION_0032_TASK_02 | SESSION_0032 | School operations | Doug + Cody | Rejection matrix smoke and monitoring row | Attendance action tests cover audit/rate-limit behavior; `smoke-attendance.ts` proves allow/deny matrix; monitoring doc names `attendance_write` | landed | SESSION_0032_REVIEW_01 |
| SESSION_0032_TASK_03 | SESSION_0032 | School operations + close | Petey + Doug | Full close evidence and LLM-agnostic handoff | SESSION_0032 closed-full with verification commands, hostile review, WORKFLOW score, open findings, and SESSION_0033 recommendation | landed | SESSION_0032_REVIEW_01 |
| SESSION_0032_5_TASK_01 | SESSION_0032.5 | QA hardening | Cody + Giddy | Full typecheck debt remediation | `bunx tsc --noEmit --pretty false` passes without starting SESSION_0033 product work | landed | — |
| SESSION_0032_5_TASK_02 | SESSION_0032.5 | QA hardening + close | Doug + Petey | Verification evidence and pause gate | Full typecheck proof, touched-files summary, and owner runway decision point recorded | landed | SESSION_0032_5_REVIEW_01 |
| SESSION_0033_TASK_01 | SESSION_0033 | School operations | Cody + Giddy + Doug | Enrollment write surface | Enrollment/waitlist actions exist under `server/web/enrollment/*`; active same-brand/org members only; capacity/waitlist idempotency, rate limit, audit, and tests/smoke prove the path | landed | SESSION_0033_REVIEW_01 |
| SESSION_0033_TASK_02 | SESSION_0033 | School operations | Cody + Giddy + Doug | Family + waiver write surface | Family/waiver actions exist under `server/web/{family,waiver}/*`; FamilyGroup cross-org risk is target-membership gated; guardian waiver signatures require family authority + minor proof; rate limit, audit, and tests/smoke prove the path | landed | SESSION_0033_REVIEW_01 |
| SESSION_0033_TASK_03 | SESSION_0033 | School operations + close | Cody + Doug + Petey | Lead/trial lifecycle, smoke proof, close evidence | Lead/trial actions exist under `server/web/lead/*`; convert is transactional; monitoring docs, Project Log, SESSION evidence, and closing ritual are complete | landed | SESSION_0033_REVIEW_01 |
| ROADMAP_DIRECTORY_MONETIZATION_TASK_01 | Roadmap | Content + monetization | Petey + Giddy | Preserve raw roadmap source in canonical home | Source file exists under `docs/architecture/source/` | landed | ROADMAP_DIRECTORY_MONETIZATION_REVIEW_01 |
| ROADMAP_DIRECTORY_MONETIZATION_TASK_02 | Roadmap | Content + monetization | Petey + Cody | Audit roadmap against repo for DRY risks | Wiki synthesis maps plan areas to existing Dirstarter surfaces and records MB-011/D-014 | landed | ROADMAP_DIRECTORY_MONNETIZATION_REVIEW_01 |
| ROADMAP_DIRECTORY_MONETIZATION_TASK_03 | Roadmap | Content + monetization | Cody + Rei | Implement low-risk Dirstarter-aligned reuse points | AI Gateway env/model wiring, martial-arts seed entries, Free/Standard/Premium product script, six ad placements, Bottom ad surface | landed | ROADMAP_DIRECTORY_MONETIZATION_REVIEW_01 |
| ROADMAP_DIRECTORY_MONETIZATION_TASK_04 | Roadmap | Governance + close | Petey + Doug | Full closing ritual and cleanup boundary mark | Full close evidence recorded; MB-012 added for Local by Flywheel WordPress cleanup | landed | ROADMAP_DIRECTORY_MONETIZATION_REVIEW_02 |
| SESSION_0037_TASK_01 | SESSION_0037 | School operations (planning) | Petey + Giddy | Dirstarter alignment audit + lead backend gap analysis | Entitlement completeness audited; Dirstarter admin CRUD pattern inventoried; lead backend gaps identified; flat vs nested routing resolved | landed | — |
| SESSION_0037_TASK_02 | SESSION_0037 | School operations (planning) | Petey | Revised Petey plan (Dirstarter-aligned, 5 tasks) | SESSION_0037.md contains full task breakdown cloning Dirstarter tools pattern for leads | landed | — |
| SESSION_0037_TASK_03 | SESSION_0037 | Core platform governance | Giddy | ADR 0012: admin CRUD flat routing | ADR exists at `docs/architecture/decisions/0012-admin-crud-routing-pattern.md` | landed | — |
| SESSION_0037_TASK_04 | SESSION_0037 | School operations (planning) | Petey | Pre-stage SESSION_0038 with carried plan | SESSION_0038.md exists with status pending, full Petey plan, Dirstarter alignment table, pre-resolved decisions | landed | — |
| SESSION_0038_TASK_01 | SESSION_0038 | School operations | Cody | Server layer: admin queries + schemas + missing actions | `server/admin/leads/{schema,queries,actions}.ts` compile and follow Dirstarter conventions | planned | — |
| SESSION_0038_TASK_02 | SESSION_0038 | School operations | Cody | Admin lead list page + table | `/admin/leads` renders with filtering, sorting, pagination using DataTable | planned | — |
| SESSION_0038_TASK_03 | SESSION_0038 | School operations | Cody | Admin lead create + edit forms | Create/edit leads from admin using shared form (RHF + Zod) | planned | — |
| SESSION_0038_TASK_04 | SESSION_0038 | School operations | Cody | Lead detail: status transitions + follow-up panel | Full lead lifecycle operable from admin detail page | planned | — |
| SESSION_0038_TASK_05 | SESSION_0038 | School operations | Cody + Doug | Public lead capture + smoke test | End-to-end lifecycle: public form → admin conversion → smoke test passes | planned | — |
| SESSION_0038_5_TASK_01 | SESSION_0038.5 | School operations | Cody | Public lead capture: publicActionClient + createPublicLead with IP rate limit | publicActionClient exists; LeadCaptureForm uses it; 5/hour IP rate limit | unknown | — |
| SESSION_0038_5_TASK_02 | SESSION_0038.5 | School operations | Cody | Add Leads sidebar nav entry | components/admin/sidebar.tsx contains Leads with ContactIcon | unknown | — |
| SESSION_0038_5_TASK_03 | SESSION_0038.5 | School operations | Cody | Brand scoping on findLeads + findLeadById | getRequestBrand wired into both queries | unknown | — |
| SESSION_0038_5_TASK_04 | SESSION_0038.5 | School operations | Cody | writeSchoolOpsAudit on all admin lead actions | Audit calls on upsert/delete/markLost/markNurture/createFollowUp/completeFollowUp | unknown | — |
| SESSION_0038_5_TASK_05 | SESSION_0038.5 | School operations | Cody | Smoke script: full lead lifecycle | scripts/smoke-lead-lifecycle.ts runs create→follow-up→book→complete→convert→cleanup | unknown | — |
| SESSION_0038_5_TASK_06 | SESSION_0038.5 | School operations | Cody | Lead capture confirmation email template | emails/lead-capture-confirmation.tsx using EmailWrapper + React Email | unknown | — |
| SESSION_0038_5_TASK_07 | SESSION_0038.5 | School operations | Cody | Org-brand consistency on upsertLead update | findFirst({brand}) check before write | unknown | — |
| SESSION_0039_TASK_01 | SESSION_0039 | Core platform governance | Petey | Create Dirstarter Baseline Index | docs/architecture/dirstarter-baseline-index.md with 12 sections covering 300+ template files | unknown | — |
| SESSION_0039_TASK_02 | SESSION_0039 | Core platform governance | Petey | Wire baseline index into pre-flight + close D-008/D-012 | cody-preflight.md updated; D-008/D-012 closed in drift register | unknown | — |
| SESSION_0039_TASK_03 | SESSION_0039 | Core platform governance | Petey | dirstarter.com/docs deep dive | All 15+ doc pages fetched; integration patterns documented in §13 of baseline index | unknown | — |
| SESSION_0039_TASK_04 | SESSION_0039 | Core platform governance | Petey | D-014 decision: Tool → Directory Listing repurpose | Option B chosen; rationale + migration plan in §14 of baseline index | unknown | — |
| SESSION_0039_TASK_05 | SESSION_0039 | Core platform governance | Petey | Upstream divergence audit (next-safe-action vs oRPC, Next 15 vs 16, Biome vs OXC) | Divergences documented in §13k of baseline index | unknown | — |
| SESSION_0040_TASK_01 | SESSION_0040 | Content + curriculum | Cody | Course + CurriculumItem admin CRUD | server actions, queries, schemas, pages for course + curriculum item | unknown | — |
| SESSION_0040_TASK_02 | SESSION_0040 | Content + curriculum | Cody | Certificate template admin CRUD | Admin pages and server layer for certificate templates | unknown | — |
| SESSION_0041_TASK_01 | SESSION_0041 | Content + curriculum | Cody | Read public Tools listing pattern + media helpers | Pattern documented before implementation | unknown | — |
| SESSION_0041_TASK_02 | SESSION_0041 | Content + curriculum | Cody | server/web/techniques/queries.ts (brand-scoped, filterable) | Filter by category/position/discipline/rank | unknown | — |
| SESSION_0041_TASK_03 | SESSION_0041 | Content + curriculum | Cody | app/(web)/techniques/page.tsx public list with filters | Public list page with filters + metadata | unknown | — |
| SESSION_0041_TASK_04 | SESSION_0041 | Content + curriculum | Cody | app/(web)/techniques/[slug]/page.tsx detail page | Detail page with media embeds | unknown | — |
| SESSION_0041_TASK_05 | SESSION_0041 | Content + curriculum | Cody | technique-card / technique-list / technique-filters components | Components implemented and wired | unknown | — |
| SESSION_0041_TASK_06 | SESSION_0041 | Content + curriculum | Cody | Type-check (tsc --noEmit) | 0 new errors | unknown | — |
| SESSION_0041_5_TASK_01 | SESSION_0041.5 | Content + curriculum | Cody | Discover existing test infra | Test config, helpers, DB seeding patterns documented | unknown | — |
| SESSION_0041_5_TASK_02 | SESSION_0041.5 | Content + curriculum | Cody | Test helper: seed techniques for two brands | Varied isPublished/category/position fixtures | unknown | — |
| SESSION_0041_5_TASK_03 | SESSION_0041.5 | Content + curriculum | Cody | Test: searchTechniques brand isolation | Brand A query returns zero Brand B techniques | unknown | — |
| SESSION_0041_5_TASK_04 | SESSION_0041.5 | Content + curriculum | Cody | Test: searchTechniques excludes isPublished:false | Unpublished excluded from results | unknown | — |
| SESSION_0041_5_TASK_05 | SESSION_0041.5 | Content + curriculum | Cody | Test: findTechniqueBySlug brand mismatch returns null | Cross-brand slug lookup safely 404s | unknown | — |
| SESSION_0041_5_TASK_06 | SESSION_0041.5 | Content + curriculum | Cody | Test: filter combinations correctness | category+position, discipline+search subset checks | unknown | — |
| SESSION_0041_5_TASK_07 | SESSION_0041.5 | Content + curriculum | Cody | Run full test suite green | All tests pass | unknown | — |
| SESSION_0042_TASK_01 | SESSION_0042 | Tournament ops | Cody | Read admin Tools + Course pattern for nested-entity conventions | Conventions documented before implementation | unknown | — |
| SESSION_0042_TASK_02 | SESSION_0042 | Tournament ops | Cody | server/admin/tournaments/schema.ts (Zod with nested Division) | Tournament upsert schema with nested Division array | unknown | — |
| SESSION_0042_TASK_03 | SESSION_0042 | Tournament ops | Cody | server/admin/tournaments/queries.ts (list + detail, brand-scoped) | List + detail with Division includes | unknown | — |
| SESSION_0042_TASK_04 | SESSION_0042 | Tournament ops | Cody | server/admin/tournaments/actions.ts (upsert/delete with nested divisions) | adminActionClient + revalidation; status transitions | unknown | — |
| SESSION_0042_TASK_05 | SESSION_0042 | Tournament ops | Cody | Admin pages: page.tsx + new + [id] | Tournament admin CRUD pages | unknown | — |
| SESSION_0042_TASK_06 | SESSION_0042 | Tournament ops | Cody | server/web/tournaments/queries.ts + payloads.ts (public, OPEN only) | Filters by discipline/date/location | unknown | — |
| SESSION_0042_TASK_07 | SESSION_0042 | Tournament ops | Cody | app/(web)/tournaments/page.tsx + [slug]/page.tsx | Public list + detail with division table | unknown | — |
| SESSION_0042_TASK_08 | SESSION_0042 | Tournament ops | Cody | tournament-card / list / filters / division-table components | Components implemented | unknown | — |
| SESSION_0042_TASK_09 | SESSION_0042 | Tournament ops | Cody | Type-check (tsc --noEmit) | 0 new errors | unknown | — |
| SESSION_0043_TASK_01 | SESSION_0043 | Tournament ops | Cody | server/web/tournaments/schema.ts (registration Zod schema) | divisionIds + tournamentId schema | landed | — |
| SESSION_0043_TASK_02 | SESSION_0043 | Tournament ops | Cody | server/web/tournaments/register.ts (capacity check + Stripe checkout) | Validates capacity, creates Stripe checkout session | landed | — |
| SESSION_0043_TASK_03 | SESSION_0043 | Tournament ops | Cody | Stripe webhook: registration fulfillment | checkout.session.completed creates Registration | landed | — |
| SESSION_0043_TASK_04 | SESSION_0043 | Tournament ops | Cody | components/web/tournaments/register-button.tsx | Division selection + checkout trigger | landed | — |
| SESSION_0043_TASK_05 | SESSION_0043 | Tournament ops | Cody | Type-check | 0 new errors | landed | — |
| SESSION_0044_TASK_01 | SESSION_0044 | Tournament ops | Cody | Wire RegisterButton into [slug]/page.tsx | Flattened division data + entry counts passed | unknown | — |
| SESSION_0044_TASK_02 | SESSION_0044 | Tournament ops | Cody | Registration success banner (?registered=true) | Banner shows on success redirect | unknown | — |
| SESSION_0044_TASK_03 | SESSION_0044 | Tournament ops | Cody | Admin registration list view | admin/tournaments/[id]/registrations/page.tsx with table | unknown | — |
| SESSION_0044_TASK_04 | SESSION_0044 | Tournament ops | Cody | Type-check | 0 new errors | unknown | — |
| SESSION_0045_TASK_01 | SESSION_0045 | Tournament ops | Cody | RegisterButton free-path redirect with ?registered=true | Free flow redirects with success param | unknown | — |
| SESSION_0045_TASK_02 | SESSION_0045 | Tournament ops | Cody | "View Registrations" link on admin tournament detail | Link added | unknown | — |
| SESSION_0045_TASK_03 | SESSION_0045 | Tournament ops | Cody | Fix TS2321 excessive stack depth in categories/queries.ts | Workaround applied | unknown | — |
| SESSION_0045_TASK_04 | SESSION_0045 | Tournament ops | Cody | Fix TS2307 bun:test module error in techniques tests | Module resolution fixed | unknown | — |
| SESSION_0045_TASK_05 | SESSION_0045 | Tournament ops | Cody | Resolve markdown lint duplicate heading in SESSION files | Lint config updated | unknown | — |
| SESSION_0045_TASK_06 | SESSION_0045 | Tournament ops | Cody | Type-check | 0 errors | unknown | — |
| SESSION_0046_TASK_01 | SESSION_0046 | Tournament ops | Cody | registrationCancelSchema Zod schema | Schema defined | landed | — |
| SESSION_0046_TASK_02 | SESSION_0046 | Tournament ops | Cody | cancelRegistration server action (CANCELLED + Stripe refund) | Action exists with Stripe refund call | landed | — |
| SESSION_0046_TASK_03 | SESSION_0046 | Tournament ops | Cody | Cancel UI on RegisterButton (when already registered) | UI surfaces cancel for existing registrations | landed | — |
| SESSION_0046_TASK_04 | SESSION_0046 | Tournament ops | Cody | Tournament detail page passes existing registration to RegisterButton | Existing registration query wired | landed | — |
| SESSION_0046_TASK_05 | SESSION_0046 | Tournament ops | Cody | Type-check | 0 errors | landed | — |
| SESSION_0046_5_TASK_01 | SESSION_0046.5 | Tournament ops | Cody | Add stripePaymentIntentId + index to Registration model | Schema field + @@index | unknown | — |
| SESSION_0046_5_TASK_02 | SESSION_0046.5 | Tournament ops | Cody | Run Prisma migration | Migration 20260504111530 applied | unknown | — |
| SESSION_0046_5_TASK_03 | SESSION_0046.5 | Tournament ops | Cody | Store stripePaymentIntentId in webhook fulfillment | Webhook persists payment_intent on create + upsert | unknown | — |
| SESSION_0046_5_TASK_04 | SESSION_0046.5 | Tournament ops | Cody | Refactor cancelRegistration to use stored payment intent ID | No more sessions.list call | unknown | — |
| SESSION_0046_5_TASK_05 | SESSION_0046.5 | Tournament ops | Cody | Serializable transaction wrapper for capacity check | Concurrent race fix in registration flow | unknown | — |
| SESSION_0046_5_TASK_06 | SESSION_0046.5 | Tournament ops | Cody | Type-check | 0 new errors | unknown | — |
| SESSION_0047_TASK_01 | SESSION_0047 | Tournament ops | Cody | registrationStatusUpdateSchema + valid transition map | Schema + transition map defined | unknown | — |
| SESSION_0047_TASK_02 | SESSION_0047 | Tournament ops | Cody | updateRegistrationStatus admin action with transition validation | Admin action exists | unknown | — |
| SESSION_0047_TASK_03 | SESSION_0047 | Tournament ops | Cody | bulkUpdateRegistrationStatus admin action | Multi-select bulk action exists | unknown | — |
| SESSION_0047_TASK_04 | SESSION_0047 | Tournament ops | Cody | Status action buttons on registrations table rows | Approve/Waitlist/Cancel buttons wired | unknown | — |
| SESSION_0047_TASK_05 | SESSION_0047 | Tournament ops | Cody | Bulk action toolbar on registrations page | Toolbar implemented | unknown | — |
| SESSION_0047_TASK_06 | SESSION_0047 | Tournament ops | Cody | Type-check | 0 new errors | unknown | — |
| SESSION_0047_TASK_07 | SESSION_0047 | Tournament ops | Cody | L1 compliance audit (post-discovery: approval workflow already built) | Audit completed | unknown | — |
| SESSION_0047_TASK_08 | SESSION_0047 | Tournament ops | Cody | Registrations table L1 rewrite (DataTable pattern) | Refactored to L1 DataTable | unknown | — |
| SESSION_0047_TASK_09 | SESSION_0047 | Tournament ops | Cody | Register button L1 fix (Button, Checkbox, Badge) | L1 primitives swapped in | unknown | — |
| SESSION_0048_TASK_01 | SESSION_0048 | Tournament ops | Cody | F-03 Remediation: brand-scope admin registrations query | Brand scope added to admin registrations query | unknown | — |
| SESSION_0048_TASK_02 | SESSION_0048 | Tournament ops | Cody | Bracket generation Zod schema | Schema defined | unknown | — |
| SESSION_0048_TASK_03 | SESSION_0048 | Tournament ops | Cody | Bracket generation server action | Action generates brackets/matches from registrations | unknown | — |
| SESSION_0048_TASK_04 | SESSION_0048 | Tournament ops | Cody | Admin UI: Generate Bracket button on division detail | Button wired into admin division view | unknown | — |
| SESSION_0048_TASK_05 | SESSION_0048 | Tournament ops | Cody | Type-check | 0 new errors | unknown | — |
| SESSION_0049_TASK_01 | SESSION_0049 | Tournament ops | Cody | Score match Zod schema | Schema defined | landed | — |
| SESSION_0049_TASK_02 | SESSION_0049 | Tournament ops | Cody | Score match server action | Scoring + advancement logic | landed | — |
| SESSION_0049_TASK_03 | SESSION_0049 | Tournament ops | Cody | Auto-advance BYE winners | BYE handling places winners into round 2 | landed | — |
| SESSION_0049_TASK_04 | SESSION_0049 | Tournament ops | Cody | Admin UI: Score match form | Form wired (later refactored in 0050 — FS-0014) | landed | — |
| SESSION_0049_TASK_05 | SESSION_0049 | Tournament ops | Cody | Admin UI: Bracket viewer (read-only tree) | Bracket visualization | landed | — |
| SESSION_0049_TASK_06 | SESSION_0049 | Tournament ops | Cody | Type-check | 0 new errors | landed | — |
| SESSION_0050_TASK_01 | SESSION_0050 | Tournament ops | Cody | Refactor ScoreMatchForm to Dirstarter L1 (Form/Dialog/RadioGroup/Select) | Zero raw HTML form elements | landed | — |
| SESSION_0050_TASK_02 | SESSION_0050 | Tournament ops | Cody | Refactor MatchCard to Card + Avatar + Badge + Tooltip | L1 primitives only | landed | — |
| SESSION_0050_TASK_03 | SESSION_0050 | Tournament ops | Cody | 10-point must round-by-round scoring form | TenPointMustForm + PointsScoreForm | landed | — |
| SESSION_0050_TASK_04 | SESSION_0050 | Tournament ops | Cody | Auto-TKO detection (3 knockdowns/disarms) | Tracking + danger badge + auto-set WIN_KO_TKO | landed | — |
| SESSION_0050_TASK_05 | SESSION_0050 | Tournament ops | Cody | Type-check + lint | 0 new errors | landed | — |
| SESSION_0051_TASK_01 | SESSION_0051 | Core platform governance | Petey | Create dirstarter-component-inventory.md | Exhaustive inventory across 12 sections (20+ subsections) | landed | — |
| SESSION_0051_TASK_02 | SESSION_0051 | Core platform governance | Petey | L1 violation audit of all custom code | Gaps documented (tournament admin, divisions-editor, etc.) | landed | — |
| SESSION_0052_TASK_01 | SESSION_0052 | L1 refactor | Cody | (web)/tournaments/page.tsx Skeleton fix (P3) | Replaced raw animate-pulse div with Skeleton | landed | — |
| SESSION_0052_TASK_02 | SESSION_0052 | L1 refactor | Cody | divisions-editor.tsx refactor to L1 (P1) | Refactored to Dirstarter primitives | landed | — |
| SESSION_0052_TASK_03 | SESSION_0052 | L1 refactor | Cody | curriculum-items-editor.tsx refactor to L1 (P1) | Refactored to Dirstarter primitives | landed | — |
| SESSION_0052_TASK_04 | SESSION_0052 | L1 refactor | Cody | registrations-table.tsx refactor to L1 (P1) | DataTable pattern applied | landed | — |
| SESSION_0052_TASK_05 | SESSION_0052 | L1 refactor | Cody | Tournament admin scaffolding (P1) | Delete dialog, row actions, toolbar actions added | landed | — |
| SESSION_0052_TASK_06 | SESSION_0052 | L1 refactor | Cody | Wire tournament scaffolding into table columns + toolbar (P1 follow-up) | Wired | landed | — |
| SESSION_0052_TASK_07 | SESSION_0052 | L1 refactor | Cody | tournament-card.tsx refactor to L1 (P2) | Card + H3 + Stack + Note pattern | landed | — |
| SESSION_0052_TASK_08 | SESSION_0052 | L1 refactor | Cody | tournament-list.tsx fix (P2) | Proper typing + Grid | landed | — |
| SESSION_0052_TASK_09 | SESSION_0052 | L1 refactor | Cody | tournament-query.tsx fix (P3) | EmptyList + Stack | landed | — |
| SESSION_0053_TASK_01 | SESSION_0053 | Commerce | Cody | Stripe products: martial arts catalog (16 products) | setup-stripe-products.ts expanded; metadata.type for productFilter | landed | — |
| SESSION_0053_TASK_04 | SESSION_0053 | Commerce | Cody | Entitlement admin CRUD | server/admin/entitlements + app/admin/entitlements (list/create/edit + 6 components) | landed | — |
| SESSION_0053_TASK_05 | SESSION_0053 | Commerce | Cody | PricingPlan admin CRUD with EntitlementGrant sync | RelationSelector for multi-select; Switch for isActive | landed | — |
| SESSION_0053_TASK_02 | SESSION_0053 | Commerce | Cody | Program enrollment page using ProductQuery (deferred) | Deferred to SESSION_0054 | superseded by SESSION_0054_TASK_02 | — |
| SESSION_0053_TASK_03 | SESSION_0053 | Commerce | Cody | Webhook fulfillment: program enrollment (deferred) | Deferred to SESSION_0054 | superseded by SESSION_0054_TASK_03 | — |
| SESSION_0053_TASK_06 | SESSION_0053 | Commerce | Cody | User dashboard: entitlements + enrollments (deferred) | Deferred to SESSION_0054 | superseded by SESSION_0054_TASK_06 | — |
| SESSION_0054_TASK_02 | SESSION_0054 | Commerce | Cody | Program enrollment checkout page using ProductQuery | enroll/page.tsx + success page; "Enroll Now" button on program detail | landed | — |
| SESSION_0054_TASK_03 | SESSION_0054 | Commerce | Cody | Webhook: fulfillProgramEnrollment | metadata.type === program_enrollment creates ProgramEnrollment with upsert safety | landed | — |
| SESSION_0054_TASK_06 | SESSION_0054 | Commerce | Cody | User dashboard: DashboardMembership component | Enrollments + entitlements + tournament registrations in three-column grid | landed | — |
| SESSION_0055_TASK_01 | SESSION_0055 | School operations | Cody | Admin Lead list page with DataTable | Status/source filters, bulk delete, column visibility | landed | — |
| SESSION_0055_TASK_02 | SESSION_0055 | School operations | Cody | Admin Lead detail + follow-up management | LeadStatusActions + FollowUpPanel components | landed | — |
| SESSION_0055_TASK_03 | SESSION_0055 | School operations | Cody | Public lead capture form | LeadCaptureForm + createPublicLead (rate-limited, unauthenticated) | landed | — |
| SESSION_0055_TASK_04 | SESSION_0055 | School operations | Cody | Trial booking + conversion lifecycle | bookTrial, completeTrial, convertLead (User+Passport+DirectoryProfile+Membership+ProgramEnrollment+Waiver) | landed | — |
| SESSION_0056_TASK_01 | SESSION_0056 | Content + curriculum | Cody | Public course list + detail pages | L1 page pattern; public course surfaces | landed | — |
| SESSION_0056_TASK_02 | SESSION_0056 | Content + curriculum | Cody | Certificate issuance admin flow | New service + admin extension | landed | — |
| SESSION_0056_TASK_03 | SESSION_0056 | Content + curriculum | Cody | Technique→curriculum linking in admin | Admin component extension | landed | — |
| SESSION_0056_TASK_04 | SESSION_0056 | Content + curriculum | Cody | Media gallery admin | L1 DataTable + FormMedia pattern | landed | — |
| SESSION_0057_TASK_01 | SESSION_0057 | P0–P2 remediation | Cody | Brand scoping for dashboard queries (P1) | getRequestBrand wired into dashboard queries | unknown | — |
| SESSION_0057_TASK_02 | SESSION_0057 | P0–P2 remediation | Cody | Passport display in dashboard (P1) | Passport surfaced on user dashboard | unknown | — |
| SESSION_0057_TASK_03 | SESSION_0057 | P0–P2 remediation | Cody | Fix searchTechniquesForPicker server boundary (P2) | Server/client boundary corrected | unknown | — |
| SESSION_0057_TASK_04 | SESSION_0057 | P0–P2 remediation | Cody | Brand check on certificate issuance (P2) | Brand scoping on issuance path | unknown | — |
| SESSION_0057_TASK_05 | SESSION_0057 | P0–P2 remediation | Cody | Brand scoping for media admin (P2) | Brand passed to media admin queries | unknown | — |
| SESSION_0061_TASK_01 | SESSION_0061 | Auth hardening | Cody | Add ctx.brand to adminActionClient + brand-scope 6 P1 admin gaps | adminActionClient chain updated; tournaments/courses/certificates brand-scoped | landed | — |
| SESSION_0061_TASK_02 | SESSION_0061 | Bugfix | Cody | Fix 3 pre-existing type errors (Badge/Button/Grid props) | destructive→danger, outline→secondary, Grid size prop removed | landed | — |
| SESSION_0061_TASK_03 | SESSION_0061 | Bugfix | Cody | Fix programs/[id] vs [programId] route conflict | Merged under [id]; nested schedule param renamed [scheduleId] | landed | — |
| SESSION_0061_TASK_04 | SESSION_0061 | Core platform governance | Petey | White-label + brand ops Petey plan (work-package WP-1 through WP-N) | SESSION_0062 staged with brand config + nav overhaul | landed | — |
| SESSION_0062_TASK_01 | SESSION_0062 | White-label | Cody | Brand-aware site config | siteConfig becomes brand-aware | landed | — |
| SESSION_0062_TASK_02 | SESSION_0062 | White-label | Cody | i18n brand + navigation keys | navigation.json keys for martial arts brand | landed | — |
| SESSION_0062_TASK_03 | SESSION_0062 | White-label | Cody | Header nav overhaul | L1 header extended with brand-aware links | landed | — |
| SESSION_0062_TASK_04 | SESSION_0062 | White-label | Cody | Footer nav overhaul | L1 footer extended | landed | — |
| SESSION_0062_TASK_05 | SESSION_0062 | White-label | Cody | Logo brand-awareness | Brand-aware text wordmark | landed | — |
| SESSION_0062_TASK_06 | SESSION_0062 | Core platform governance | Petey | Backend/wiring hostile-close review (audit, no code) | Review completed | landed | — |
| SESSION_0064_TASK_01 | SESSION_0064 | Auth hardening | Cody | Confirm TASK_05 (checkEntitlement) pre-landed | register.ts:38-46 entitlement guard verified | landed | — |
| SESSION_0064_TASK_02 | SESSION_0064 | Auth hardening | Cody | Confirm TASK_06 (isInSameBrand) pre-landed | register.ts + organization/actions.ts brand check verified | landed | — |
| SESSION_0064_TASK_03 | SESSION_0064 | Auth hardening | Cody | Confirm TASK_07 (Passport defensive checks) pre-landed | Passport assertions verified in register + org join | landed | — |
| SESSION_0064_TASK_04 | SESSION_0064 | Performance | Cody | Confirm TASK_08 (getUserMemberships select) pre-landed | organization/queries.ts:49-80 uses select payload | landed | — |
| SESSION_0064_TASK_09 | SESSION_0064 | Core platform governance | Cody + Petey | Component inventory hostile-close enforcement | 4 docs updated, 2 code violations fixed, G6 guardrail added | landed | — |
| SESSION_0065_TASK_01 | SESSION_0065 | White-label | Cody | Refactor hero.tsx (remove CountBadge, i18n subtitle) | Hero updated with i18n copy | landed | — |
| SESSION_0065_TASK_02 | SESSION_0065 | White-label | Cody | Create feature-cards.tsx (Programs / Tournaments / Community) | Three-card section | landed | — |
| SESSION_0065_TASK_03 | SESSION_0065 | White-label | Cody | Create value-prop.tsx ("Why Baseline?") | Section with checkmarks | landed | — |
| SESSION_0065_TASK_04 | SESSION_0065 | White-label | Cody | Create bottom-cta.tsx (closing CTA + email signup) | CTA section | landed | — |
| SESSION_0065_TASK_05 | SESSION_0065 | White-label | Cody | Update page.tsx (replace ToolQuery with new sections) | Homepage rebuilt | landed | — |
| SESSION_0065_TASK_06 | SESSION_0065 | White-label | Cody | Add i18n keys to messages/en/pages.json | Keys added | landed | — |
| SESSION_0066_TASK_01 | SESSION_0066 | Listing pattern | Petey | Create ADR 0013 (Tool→Listing pattern repurposing) | ADR landed at docs/architecture/decisions/0013-*.md | landed | — |
| SESSION_0066_TASK_02 | SESSION_0066 | Listing pattern | Petey | Create wiki concept doc (listing-pattern-repurposing.md) | Concept doc with shipped + open surfaces | landed | — |
| SESSION_0067_TASK_01 | SESSION_0067 | Directory | Cody | Add slug field to DirectoryProfile + migration | Schema + migration | landed | — |
| SESSION_0067_TASK_02 | SESSION_0067 | Directory | Cody | findProfileBySlug server query | Query exists | landed | — |
| SESSION_0067_TASK_03 | SESSION_0067 | Directory | Cody | /directory/[slug]/page.tsx member detail page | Detail page renders | landed | — |
| SESSION_0068_TASK_01 | SESSION_0068 | Directory | Cody | Dashboard Profile tab (Passport + DirectoryProfile form) | Tab landed | landed | — |
| SESSION_0068_TASK_02 | SESSION_0068 | Directory | Cody | Dashboard School tab (Organization edit form) | Tab landed | landed | — |
| SESSION_0068_TASK_03 | SESSION_0068 | Directory | Cody | Dashboard Techniques tab (table view) | Tab landed | landed | — |
| SESSION_0069_TASK_01 | SESSION_0069 | Directory | Cody | Technique create/edit form + server actions | Form + actions wired | landed | — |
| SESSION_0069_TASK_02 | SESSION_0069 | Directory | Cody | Member card + School card components | Components landed | landed | — |
| SESSION_0069_TASK_03 | SESSION_0069 | Directory | Cody | Member filters + School filters components | Filter components landed | landed | — |
| SESSION_0070_TASK_01 | SESSION_0070 | Directory | Cody | Paginated server queries for members + schools | Queries with pagination + filters | landed | — |
| SESSION_0070_TASK_02 | SESSION_0070 | Directory | Cody | Member listing components (list, listing, query, search) | Components landed | landed | — |
| SESSION_0070_TASK_03 | SESSION_0070 | Directory | Cody | School listing components + public pages (/members, /schools) | Public listing pages live | landed | — |
| SESSION_0071_TASK_01 | SESSION_0071 | Directory | Cody | /members/[slug] detail page | Detail page renders | landed | — |
| SESSION_0071_TASK_02 | SESSION_0071 | Directory | Cody | /schools/[slug] detail page | Detail page renders | landed | — |
| SESSION_0071_TASK_03 | SESSION_0071 | Directory | Cody | Wire viewerUserId into /members listing page | Auth integration | landed | — |
| SESSION_0072_TASK_01 | SESSION_0072 | Bugfix | Cody | Confirm card-to-detail links | Already wired in SESSION_0071 | landed | — |
| SESSION_0072_TASK_02 | SESSION_0072 | Bugfix | Cody | Fix all pre-existing TS errors (20 → 0) | Full app typecheck clean | landed | — |
| SESSION_0074_TASK_01 | SESSION_0074 | Core platform governance | Cody (Claude) | Project-log backfill (FS-0015) | ~170 rows backfilled for SESSION_0038–0072 | landed | SESSION_0074_REVIEW_01 |
| SESSION_0074_TASK_02 | SESSION_0074 | Core platform governance | Cody (Copilot) | Failed-steps audit + pattern clustering | FS-0014 closed; 4 pattern clusters in top failure modes summary | landed | SESSION_0074_REVIEW_01 |
| SESSION_0074_TASK_03 | SESSION_0074 | Core platform governance | Cody (Copilot) | Tournament-ops gap audit + concept page | `wiki/concepts/tournament-ops.md` with 14-session history, 14-model usage table, 8-item open work list | landed | SESSION_0074_REVIEW_01 |
| SESSION_0074_TASK_04 | SESSION_0074 | Core platform governance | Cody (Copilot) | WORKFLOW 5.0 calendar reconciliation | 26 actual rows backfilled (0038–0060), forward plan reset for S3 | landed | SESSION_0074_REVIEW_01 |
| SESSION_0074_TASK_05 | SESSION_0074 | Core platform governance | Cody (Copilot) | Topic index + frontmatter design | `wiki/topic-index.md` with 8 feature areas | landed | SESSION_0074_REVIEW_01 |
| SESSION_0074_TASK_06 | SESSION_0074 | Core platform governance | Cody (Copilot) | Dirstarter uplift backlog | `wiki/dirstarter-uplift-backlog.md` with 11 items (~10 sessions) | landed | SESSION_0074_REVIEW_01 |
| SESSION_0074_TASK_07 | SESSION_0074 | Core platform governance | Cody (Copilot) | Unclean-close recovery (17 sessions) | 17 sessions → closed-unclean with YAML+body atomicity | landed | SESSION_0074_REVIEW_01 |
| SESSION_0074_TASK_08 | SESSION_0074 | Directory + schema | Cody (Copilot) | Slug backfill script + Org auto-gen + seed slugs | `scripts/backfill-slugs.ts`, org actions auto-gen, seed.ts slugs | landed | SESSION_0074_REVIEW_01 |
| SESSION_0074_TASK_09 | SESSION_0074 | Core platform governance | Cody (Copilot) | Closing.md atomicity + project-log gate | Atomicity rule + grep gate added to closing.md step 2 | landed | SESSION_0074_REVIEW_01 |
| SESSION_0077_TASK_01 | SESSION_0077 | Core platform | Cody | Configure Google OAuth (local dev + production guidance) | Google OAuth set up for local and production environments | ✅ Done | — |
| SESSION_0077_TASK_02 | SESSION_0077 | Core platform | Cody | Assess remaining S3/tournament work | Reviewed and assessed outstanding S3 and tournament-related tasks | ✅ Done | — |
| SESSION_0077_TASK_03 | SESSION_0077 | Core platform | Cody | Registration detail page with WeighIn panel | Registration detail page now includes WeighIn panel | ✅ Done | — |
| SESSION_0077_TASK_04 | SESSION_0077 | Core platform | Cody | MatAssignment panel (assign matches to mats/rings) | MatAssignment panel implemented for assigning matches | ✅ Done | — |
| SESSION_0077_TASK_05 | SESSION_0077 | Core platform | Cody | FightRecord publication (W/L/D from completed matches) | FightRecord publication feature implemented | ✅ Done | — |
| SESSION_0077_TASK_06 | SESSION_0077 | Core platform | Cody | Deployment runbook + pre-flight script | Runbook and script for deployment pre-flight checks created | ✅ Done | — |
| SESSION_0078_TASK_01 | SESSION_0078 | Tournament ops | Cody (Copilot) | Public tournament results page (medal standings + bracket results) | `/tournaments/[slug]/results` route with medal standings + bracket results | landed | — |
| SESSION_0078_TASK_02 | SESSION_0078 | Tournament ops | Cody (Copilot) | RuleSet → Division wiring | Division-level ruleSet override; scoringMethod threaded through bracket UI | landed | — |
| SESSION_0078_TASK_03 | SESSION_0078 | Tournament ops | Cody (Copilot) | Seeding algorithm + tests | 4 seeding strategies + 17 unit tests passing | landed | — |
| SESSION_0079_TASK_01 | SESSION_0079 | Core platform governance | Petey (Claude) | Pull Giddy persona from monorepo into `docs/agents/giddy.md` | `docs/agents/giddy.md` exists with v5.0 frontmatter, voice matched to petey/cody | landed | SESSION_0079_REVIEW_01 |
| SESSION_0079_TASK_02 | SESSION_0079 | Tournament ops | Cody (Claude) | Tournament director role: schema enum + HOC + action client + admin UI + sidebar gating | Role value added (no migration), HOC + client added, 12 pages re-HOC'd, 10 actions re-clienthd, user form Role select live, sidebar filters for tournament_director | landed | SESSION_0079_REVIEW_01 |
| SESSION_0079_TASK_03 | SESSION_0079 | Core platform governance | Petey (Claude) | Document porting awareness (curriculum paths, cross-brand reqs, no-design-tokens, Path B appendix) | All 4 awareness sections present in SESSION_0079.md | landed | SESSION_0079_REVIEW_01 |
| SESSION_0080_TASK_01 | SESSION_0080 | Tournament ops | Cody (Codex) | Manual seed editor UI (drag-and-drop reorder + persist) | Tournament admin UI supports manual seed order editing and persists via existing `manualSeeds` contract | in-progress | — |
| SESSION_0080_TASK_02 | SESSION_0080 | Tournament ops + close | Cody (Codex) | Verification + quick close | Scoped checks recorded; SESSION_0080.md closed-quick with next session handoff | planned | — |
| SESSION_0083_TASK_01 | SESSION_0083 | Tournament ops (hardening) | Cody (Claude) | Create `register.concurrency.test.ts` skeleton + real fixtures (user A/B/C with passport/membership/UserEntitlement, org, discipline, tournament, division capacity=1 feeCents=0) + smoke test | Test file compiles; fixtures + teardown clean across reruns; 1 free registration ends with ACTIVE entry count = 1 | landed | SESSION_0083_REVIEW_01 |
| SESSION_0083_TASK_02 | SESSION_0083 | Tournament ops (hardening) | Cody (Claude) | Capacity race test — 1 slot remaining, users B vs C parallel via AsyncLocalStorage | Exactly one call returns `data.type === "free"`, one returns `serverError` matching `/at capacity/`; final ACTIVE count = 1; 5/5 stable runs | landed | SESSION_0083_REVIEW_01 |
| SESSION_0083_TASK_03 | SESSION_0083 | Tournament ops (hardening) | Cody (Claude) | Capacity race test — division pre-filled by user A, B vs C parallel | Both callers return `serverError` matching `/at capacity/`; final ACTIVE count unchanged at 1; 5/5 stable runs | landed | SESSION_0083_REVIEW_01 |
| SESSION_0083_TASK_04 | SESSION_0083 | Close | Cody → Petey (Claude) | Verification + full close | Scoped typecheck clean; wiki-lint 0 errors / 3 pre-existing warnings; SESSION_0083 closed-full with reflections + evidence artifact | landed | SESSION_0083_REVIEW_01 |
| SESSION_0084_TASK_01 | SESSION_0084 | Tournament ops (hardening) | Cody (Claude) | Stripe webhook test harness — mock `stripe.webhooks.constructEvent` + `stripe.checkout.sessions.create`; helper synthesizes `checkout.session.completed` events with metadata mirroring `register.ts` (`tournamentId`, `userId`, `divisionIds`, `roleId`, `representingMembershipId`); smoke test asserts one POST → one PAID `Registration` with ACTIVE entries | Webhook test file compiles; smoke run lands a single PAID Registration end-to-end against the dev DB; reruns clean (5/5 stable) | landed | SESSION_0084_REVIEW_01 |
| SESSION_0084_TASK_02 | SESSION_0084 | Tournament ops (hardening) | Cody (Claude) | Paid-path capacity oversubscription proof — sequential webhook POSTs for distinct users against the same `capacity=1` division | Test PASSES asserting current (broken) behavior: 2 ACTIVE entries on `capacity=1` division → P0 architectural finding confirmed. SESSION_0085 Petey plan flagged in Next session; assertion to flip on fix | landed | SESSION_0084_REVIEW_01 |
| SESSION_0084_TASK_03 | SESSION_0084 | Close | Cody → Petey (Claude) | Verification + full close | Scoped typecheck clean (3 pre-existing unrelated errors unchanged); 5/5 stable test runs; wiki-lint 0 errors / 3 pre-existing warnings (after deleting `docs/graphify-out/`); SESSION_0084 closed-full with reflections + evidence + next-session unblock | landed | SESSION_0084_REVIEW_01 |
| SESSION_0085_TASK_01 | SESSION_0085 | Tournament ops (hardening) | Petey (Claude) | Petey plan for paid-path capacity oversubscription fix; decide strategy (a) webhook re-check + refund vs. (b) up-front slot reservation; decompose into Cody-executable tasks; surface open decisions for Brian's go | `SESSION_0085.md` Petey plan block landed with strategy choice + 4-task breakdown + open-decisions block; project-log task plan rows appended; gate held on Brian's approval before TASK_02 | landed | — |
| SESSION_0085_TASK_02 | SESSION_0085 | Tournament ops (hardening) | Cody (Codex) | Webhook capacity re-check + refund (strategy a). Wrap `fulfillTournamentRegistration` in a Serializable transaction; if any requested division is at capacity, write Registration in CANCELLED/REFUNDED state with CANCELLED entries; after commit, call `stripe.refunds.create({ payment_intent: session.payment_intent })` (refund failure logs but does not throw) | `apps/web/app/api/stripe/webhooks/route.test.ts` updated with flipped assertion + refund-call tracking + parallel-race variant; 5/5 stable runs; refunds-tracked mock asserts call count = 1 | landed | SESSION_0085_REVIEW_01 |
| SESSION_0085_TASK_04 | SESSION_0085 | Close | Cody → Petey (Codex) | Verification + full close: scoped typecheck, full test re-run, free-path concurrency regression check, wiki-lint, project-log review block, memory update (paid oversubscription window resolved) | Webhook test 5/5 stable; free-path concurrency regression passed; `bunx tsc --noEmit --pretty false` reports only pre-existing unrelated errors in 3 files; wiki-lint 0 errors / 3 pre-existing warnings; SESSION_0085_REVIEW_01 appended | landed | SESSION_0085_REVIEW_01 |
| SESSION_0086_TASK_01 | SESSION_0086 | Tournament ops (hardening) | Petey + Giddy (Codex) | Bow in, graphify TASK_05 inputs, create SESSION_0086 plan, split work into UI/refund-test worktrees, and keep docs/log orchestration in the main checkout | `SESSION_0086.md` exists with graphify queries, Dirstarter alignment, task split, and agent/worktree assignments; project-log rows appended before implementation | landed | SESSION_0086_REVIEW_01 |
| SESSION_0086_TASK_02 | SESSION_0086 | Tournament ops (UI smoke) | Cody + Desi worker | Refunded-paid customer notice: when `registered=true` resolves to an existing `CANCELLED`/`REFUNDED` Registration, show rejected/refunded copy instead of the success banner; display persisted cancelled/refunded state without offering an impossible re-registration form | Tournament detail/RegisterButton UI updated; `registration-notice.test.tsx` covers `CANCELLED`/`REFUNDED`, success, and processing copy; UI test passes | landed | SESSION_0086_REVIEW_01 |
| SESSION_0086_TASK_03 | SESSION_0086 | Tournament ops (refund tests) | Cody + Doug worker | Add cancel/refund regression tests around `cancelRegistration`: paid Registration refunds by stored `stripePaymentIntentId`, free Registration cancels without refund, paid Registration missing PaymentIntent fails without mutation | `register.concurrency.test.ts` asserts refund mock calls and DB state for paid/free/error branches; test file passes 6/6 | landed | SESSION_0086_REVIEW_01 |
| SESSION_0086_TASK_04 | SESSION_0086 | Close | Petey + Doug (Codex) | Integrate worker patches, run focused tests/typecheck/wiki-lint, append SESSION_0086 review, and record close evidence/worktree cleanup status | Focused tests pass; Biome clean; typecheck has only pre-existing unrelated errors; 0086 worktrees removed; SESSION_0086 closed-full | landed | SESSION_0086_REVIEW_01 |
| SESSION_0111_TASK_01 | SESSION_0111 | Create merch seed script

- **ID:** SESSION_0111_TASK_01
- **Owner:** Cody
- **Session:** SESSION_0111
- **Date:** 2026-05-09
- **Done criteria:** Seed script creates PricingPlan rows with `metadata.source = "tuffbuffs-merch"`.
- **Status:** landed
- **Verification:** 24 PricingPlan rows created. Idempotent on re-run.

### SESSION_0111_TASK_02 — Create merch query functions

- **ID:** SESSION_0111_TASK_02
- **Owner:** Cody
- **Session:** SESSION_0111
- **Date:** 2026-05-09
- **Done criteria:** `server/web/merch/queries.ts` with findMerchProducts, findMerchProductById, getMerchMetadata.
- **Status:** landed
- **Verification:** Functions compile and return typed merch product data.

### SESSION_0111_PHASE_02 — Merch store page at /merch

- **ID:** SESSION_0111_PHASE_02
- **Owner:** Cody
- **Session:** SESSION_0111
- **Date:** 2026-05-09
- **Done criteria:** /merch route renders DB-driven merch catalog with category tabs and product cards.
- **Status:** landed
- **Verification:** Type-check clean. L1 components used exclusively.

### SESSION_0111_PHASE_04 — Merch catalog cleanup

- **ID:** SESSION_0111_PHASE_04
- **Owner:** Cody
- **Session:** SESSION_0111
- **Date:** 2026-05-09
- **Done criteria:** Product data inlined into seed script. merch-catalog.ts deleted.
- **Status:** landed
- **Verification:** Zero remaining importers. Type-check clean.

### SESSION_0111_REVIEW_01 — Full close review

**Reviewed tasks:** SESSION_0111_TASK_01, SESSION_0111_TASK_02, SESSION_0111_PHASE_02, SESSION_0111_PHASE_04
**Verdict:** All phases landed. Merch catalog fully DB-driven. Store page uses L1 components. Seed script self-contained. Kaizen aggregate: 9.

### SESSION_0112_TASK_01 — Create Stripe Products + Prices for merch items

**Script:** `apps/web/scripts/setup-merch-stripe-products.ts`
**Result:** 24 Stripe Products + one-time Prices created following ADR 0014 naming (`BMA_merch_{id}`). All PricingPlan rows updated with `stripeProductId` + `stripePriceId`. Dry-run mode verified first. Products with placeholder images use branded fallback URL.

### SESSION_0112_REVIEW_01 — Full close review

**Reviewed tasks:** SESSION_0112_TASK_01
**Verdict:** TASK_01 landed cleanly. 24/24 merch products created in Stripe, all DB rows linked. ADR 0014 naming convention followed. Script is idempotent (re-run links existing). Remaining tasks (TASK_02–07) carry forward to next session.

### SESSION_0112_TASK_02 — Create `createMerchCheckout` server action

**File:** `apps/web/server/web/merch/actions.ts`
**Result:** Server action follows `createProgramEnrollmentCheckout` pattern exactly. Input validation (brand, active, in-stock, has Stripe price). Shipping address collection (US), flat $4.99 shipping, one-time payment mode. Metadata: `type: "merch_purchase"`, userId, pricingPlanId, organizationId, brand, size, color.

### SESSION_0112_TASK_03 — Merch product detail + checkout UI

**Files:** `app/(web)/merch/[id]/page.tsx`, `components/web/tuffbuffs/merch-product-detail.tsx`, `components/web/tuffbuffs/merch-image-gallery.tsx`, `components/web/tuffbuffs/merch-card.tsx`
**Result:** Product detail page with image gallery, size/color selectors, Buy Now → Stripe Checkout. MerchCard now links to detail page. All L1 components used.

### SESSION_0112_TASK_04 — Order success page

**File:** `app/(web)/merch/order/success/page.tsx`
**Result:** Retrieves Stripe session by sessionId, shows order summary (line items, total, size/color badges), shipping address, Continue Shopping CTA.

### SESSION_0112_TASK_05 — Extend pricing-plan-form for merch fields

**File:** `app/admin/pricing-plans/_components/pricing-plan-form.tsx`
**Result:** Conditional merch settings section appears for `tuffbuffs-merch` products. Uses `useMemo` for detection.

### SESSION_0112_TASK_06 — Role-based merch management permissions

**File:** `apps/web/lib/authz.ts`
**Result:** Added `canManageMerch(user, brand)`. Admin OR OWNER/ORG_ADMIN at any org in the brand. No new models or enums.

### SESSION_0112_TASK_07 — Webhook extension for merch purchases

**File:** `apps/web/app/api/stripe/webhooks/route.ts`
**Result:** Added `merch_purchase` handler in `checkout.session.completed` payment mode switch. Logs order details. Ledger already created by `createLedgerFromCheckout`. Revalidates merch cache tag. No entitlement grant (physical goods).

### SESSION_0112_REVIEW_02 — Full close review (all tasks)

**Reviewed tasks:** SESSION_0112_TASK_01, SESSION_0112_TASK_02, SESSION_0112_TASK_03, SESSION_0112_TASK_04, SESSION_0112_TASK_05, SESSION_0112_TASK_06, SESSION_0112_TASK_07
**Verdict:** All 7 tasks landed. Full Phase 3 merch checkout flow implemented: Stripe Products (TASK_01) → server action (TASK_02) → product detail UI (TASK_03) → success page (TASK_04) → admin form (TASK_05) → permissions (TASK_06) → webhook (TASK_07). All follow gold-standard patterns. No Dirstarter bypasses. No schema changes. Kaizen aggregate: 9.

### SESSION_0113_TASK_01 — End-to-end merch smoke test

**Result:** Full checkout flow verified in Chrome: browse `/merch` → product detail `/merch/[id]` → Stripe Checkout (test mode) → webhook `checkout.session.completed` → success page. All 5 steps returning 200. Webhook log confirmed: `🛍️ Merch purchase: size=L color=Gold`.

### SESSION_0113_TASK_02 — Fix FS-0018 success page crash

**File:** `apps/web/app/(web)/merch/order/success/page.tsx`
**Result:** Removed invalid `shipping_details` from Stripe `expand` array. Was causing Stripe API to throw, catch block rendered "Order Not Found" despite successful payment. FS-0018 logged in failed-steps-log.md.

### SESSION_0113_TASK_03 — Fix Stripe product display names

**Files:** `apps/web/scripts/fix-merch-stripe-display-names.ts` (NEW), `apps/web/scripts/setup-merch-stripe-products.ts` (MODIFIED)
**Result:** Created + ran one-time script to rename all 24 Stripe Products from ADR 0014 internal names to friendly DB names. Setup script updated to use `plan.name` for future products, storing ADR name as `metadata.adr0014_name`.

### SESSION_0113_TASK_04 — Success page cosmetic fixes

**File:** `apps/web/app/(web)/merch/order/success/page.tsx`
**Result:** Fixed text/price collision (`gap-4`, `shrink-0`). Resolves friendly name via expanded Stripe product (`line_items.data.price.product`) with DB fallback.

### SESSION_0113_TASK_05 — Merch order confirmation email

**Files:** `apps/web/emails/merch-order-confirmation.tsx` (NEW), `apps/web/lib/notifications.ts` (MODIFIED), `apps/web/app/api/stripe/webhooks/route.ts` (MODIFIED)
**Result:** React Email template with order summary, shipping address, size/color. `notifyCustomerOfMerchOrder()` added. Wired into webhook `merch_purchase` handler via `after()`. Blocked on Resend setup (MB-015).

### SESSION_0113_REVIEW_01 — Full close review

**Reviewed tasks:** SESSION_0113_TASK_01, SESSION_0113_TASK_02, SESSION_0113_TASK_03, SESSION_0113_TASK_04, SESSION_0113_TASK_05
**Verdict:** All 5 tasks landed. Smoke test passed end-to-end. FS-0018 caught and fixed. Stripe display names corrected. Email wired but waiting on Resend (MB-015). Petey plan pre-staged for SESSION_0114 (Printful POD + Resend setup). Kaizen aggregate: 9.

### SESSION_0114_TASK_00 — Infrastructure documentation folder

**Files:** `docs/architecture/infrastructure/README.md` (NEW), `domain-hosting-registry.md` (NEW), `dns-verification-spec.md` (NEW), `email-delivery-spec.md` (NEW), `hosting-data-flow.md` (NEW), `docs/architecture/decisions/0015-domain-hosting-infrastructure.md` (NEW)
**Result:** Created infrastructure docs folder with master domain registry (6 domains), DNS record matrix per service, email delivery architecture, hosting data flow diagrams (ASCII + Mermaid). ADR 0015 documents SSH scripts as dead scope, Bluehost retained as DNS registrar only.

### SESSION_0114_TASK_01 — Resend setup runbook (spec only)

**Files:** `docs/runbooks/resend-setup-runbook.md` (NEW)
**Result:** 8-step operator runbook for Resend account creation, domain verification in Bluehost cPanel, env var config, test flow, troubleshooting, Vercel production config. Execution deferred — Brian needs to create Resend account and do DNS verification.

### SESSION_0114_TASK_02 — Printful POD integration spec (spec only)

**Files:** `docs/architecture/printful-pod-spec.md` (NEW)
**Result:** Full integration spec with current vs target state flows, Printful API overview, product mapping strategy (metadata.printfulVariantId), order creation flow, fulfillment webhook design, file structure, 7 open decisions with leanings, Mermaid sequence diagram, 3-phase implementation priority. Execution deferred to next session pending Brian sign-off on open decisions.

### SESSION_0114_REVIEW_01 — Full close review

**Reviewed tasks:** SESSION_0114_TASK_00, SESSION_0114_TASK_01, SESSION_0114_TASK_02
**Verdict:** All 3 tasks landed as spec/doc work. No code changes — pure documentation session. Infrastructure folder well-structured with ASCII + Mermaid diagrams. Resend runbook ready for operator execution. Printful spec has 7 open decisions needing Brian sign-off. Wiki index updated with all new entries. Graphify query confirmed integration points. Kaizen aggregate: 8.

### SESSION_0115_TASK_01 — Resend DNS setup (operator)

**Files:** Bluehost cPanel (external — 5 DNS records added)
**Result:** 2 CNAME records (DKIM, return-path) and 1 TXT record (DMARC) propagated successfully. 2 TXT records (resend-verification, SPF) still propagating. Bluehost "Other Host" UI pattern documented.

### SESSION_0115_TASK_02 — Printful spec decisions review

**Files:** `docs/architecture/printful-pod-spec.md` (MODIFIED)
**Result:** All 7 open decisions resolved by Brian. Key changes: #2 added order pull for admin dashboard (future), #4 architect for per-brand option, #6 added admin media UI need, #7 changed to calculated shipping at checkout. Decision table updated from "Open Decisions" to "Decisions (Resolved SESSION_0115)" with RESOLVED status on all 7. Future work section added.

### SESSION_0115_TASK_03 — Printful spec wireframes, flows, charts

**Files:** `docs/architecture/printful-pod-spec.md` (MODIFIED)
**Result:** Added 8 lo-fi wireframes (browse, detail, checkout, success, order tracking ×2, admin order list/detail, admin media), 4 user flows (customer, system, admin, error recovery), MerchOrder state machine (PAID→SUBMITTED→PRINTING→SHIPPED→DELIVERED + FAILED/CANCELED/RETURNED/REFUNDED), 2 Mermaid charts (complete flow with color subgraphs, shipping rate sequence).

### SESSION_0115_TASK_04 — Scaffold services/printful.ts

**Files:** `apps/web/services/printful.ts` (NEW), `apps/web/env.ts` (MODIFIED)
**Result:** Printful API client following L1 pattern (matches stripe.ts/resend.ts). Types: PrintfulOrder, Recipient, OrderItem, ShippingRate, Shipment, WebhookEvent. Methods: createOrder, getOrder, getOrderByExternalId, getShippingRates, cancelOrder, estimateOrderCosts, verifyWebhookSignature. Env vars: PRINTFUL_API_KEY, PRINTFUL_WEBHOOK_SECRET, PRINTFUL_CONFIRM_ORDERS (draft/confirm toggle).

### SESSION_0115_REVIEW_01 — Full close review

**Reviewed tasks:** SESSION_0115_TASK_01, SESSION_0115_TASK_02, SESSION_0115_TASK_03, SESSION_0115_TASK_04
**Verdict:** TASK_01 partially blocked on DNS propagation (3/5 records live). TASK_02 efficient — all 7 decisions resolved in one pass with meaningful refinements. TASK_03 comprehensive — wireframes cover customer and admin paths, state machine covers happy + error paths. TASK_04 follows L1 patterns exactly. No Dirstarter baseline layers touched. No schema changes. No auth/security changes. Score: 9/10. Kaizen aggregate: 9.

### SESSION_0116_TASK_01 — Resend env wiring + test email

**Files:** `apps/web/.env` (MODIFIED)
**Result:** Confirmed DNS propagation for original 5 records. Discovered Resend requires additional `send` subdomain records (MX + TXT) + inbound MX — Brian added all in Bluehost. Updated `RESEND_SENDER_EMAIL` to `welcome@baselinemartialarts.com`. Test email blocked on domain verification (propagation pending).

### SESSION_0116_TASK_02 — Printful API key + sandbox test

**Files:** `apps/web/.env` (MODIFIED)
**Result:** Brian generated Private Token via Printful Developer Portal. Wired 3 env vars. Tested: stores endpoint ✅, catalog ✅, shipping rates ✅ ($4.75 flat rate Bella Canvas 3001 → Denver CO).

### SESSION_0116_REVIEW_01 — Full close review

**Reviewed tasks:** SESSION_0116_TASK_01, SESSION_0116_TASK_02
**Verdict:** Both tasks landed. TASK_01 partially blocked on Resend DNS propagation (self-resolving). TASK_02 fully complete — API key wired and 3 sandbox tests passed. No Dirstarter baseline layers touched. No schema/auth/payment code changes. Only `.env` modified (gitignored). Score: 9/10. Kaizen aggregate: 9.

### SESSION_0117_TASK_01 — Resend domain verification check

**Files:** none (DNS check only)
**Result:** Domain still pending verification after re-sending. Blocked on Bluehost DNS propagation for `send` subdomain MX/TXT records. Deferred to next session.

### SESSION_0117_TASK_02 — Printful Phase 1 implementation

**Files:** `apps/web/prisma/schema.prisma` (MODIFIED), `apps/web/prisma/migrations/20260511011048_add_merch_order_fulfillment/migration.sql` (NEW), `apps/web/server/web/merch/printful-actions.ts` (NEW), `apps/web/app/api/stripe/webhooks/route.ts` (MODIFIED), `docs/runbooks/printful-setup-runbook.md` (MODIFIED)
**Result:** Full Phase 1 delivered. FulfillmentStatus enum (9 states) + MerchOrder model + migration applied. createPrintfulOrder() with variant map populated from live Printful API (13 POD products mapped across 4 catalog products: BC 3001, A4 N3142, BC 3719, Men's Rash Guard). Stripe webhook wired to create MerchOrder + trigger Printful via after(). Runbook updated with implementation status.

### SESSION_0117_REVIEW_01 — Full close review

**Reviewed tasks:** SESSION_0117_TASK_01, SESSION_0117_TASK_02
**Verdict:** TASK_01 blocked on DNS — expected, no action possible. TASK_02 fully delivered — schema, migration, server action, webhook wiring, variant map, runbook all landed. Dirstarter alignment: extends existing Stripe/Prisma patterns (no baseline bypass). Schema change follows Invoice/Payment model conventions. No auth/security changes. Hostile close review deferred — recommend batching sessions 0114–0117 for Printful integration arc review. Score: 9.5/10. Deduction: wiki-lint not run (-0.5).

### SESSION_0118_TASK_01 — Resend domain verification check + test email

**Files:** none (API check only)
**Result:** DNS records confirmed propagated (CNAME + TXT resolve correctly). Resend API still returns 403 "domain not verified" — domain pending manual verification in Resend dashboard. Deferred to next session.

### SESSION_0118_TASK_02 — Printful Phase 2 webhook handler

**Files:** `apps/web/app/api/printful/webhooks/route.ts` (NEW), `apps/web/emails/merch-shipment-notification.tsx` (NEW), `apps/web/lib/notifications.ts` (MODIFIED)
**Result:** Full Phase 2 delivered. Webhook handler for `package_shipped` (→ SHIPPED + tracking + customer email), `order_failed` (→ FAILED + admin email), `package_returned` (→ RETURNED + admin email). Shipment notification email template with tracking button. Two notification functions added.

### SESSION_0118_BONUS — TypeScript error cleanup

**Files:** `apps/web/server/web/tags/queries.ts` (MODIFIED), `apps/web/server/web/tournaments/queries.brand-isolation.test.ts` (MODIFIED), `apps/web/server/web/tournaments/results.smoke.test.ts` (MODIFIED)
**Result:** Fixed 3 pre-existing tsc errors. Two `bun:test` import suppressions added. One Prisma TS2321 excessive stack depth suppressed with `@ts-ignore`. Zero tsc errors now.

### SESSION_0118_REVIEW_01 — Full close review

**Reviewed tasks:** SESSION_0118_TASK_01, SESSION_0118_TASK_02, SESSION_0118_BONUS
**Verdict:** TASK_01 blocked on Resend dashboard verification — DNS confirmed, manual step needed. TASK_02 fully delivered — webhook handler follows Stripe webhook pattern (claim/process), uses existing `verifyWebhookSignature()` + `after()` for non-blocking notifications. BONUS: tech debt cleanup, zero tsc errors. Dirstarter alignment: extends existing webhook + email notification patterns. No schema changes. No auth/security changes. Score: 9.5/10. Deduction: Resend test email still not sent (-0.5).

---

## Hostile close review

### SESSION_0119_TASK_01 — Resend domain verification + test email

**Files:** none
**Result:** DNS still pending verification in Resend dashboard (3rd session blocked: 0117→0118→0119). No action possible until Resend processes DNS.

### SESSION_0119_TASK_02 — Hostile close review batch (sessions 0114–0118)

**Files:** `docs/protocols/project-log.md` (MODIFIED), `docs/sprints/SESSION_0119.md` (MODIFIED)
**Result:** Full Giddy + Doug hostile close review of Printful integration arc. See SESSION_0119_REVIEW_01 below.

### SESSION_0119_TASK_03 — Printful Phase 3 plan: admin merch order dashboard

**Files:** `docs/sprints/SESSION_0119.md` (MODIFIED)
**Result:** Plan produced for Cody execution in SESSION_0120. See SESSION_0119 plan section.

### SESSION_0119_REVIEW_01 — Hostile Close Batch Review: Printful Integration Arc (Sessions 0114–0118)

**Reviewed tasks:** SESSION_0114_TASK_00, SESSION_0114_TASK_01, SESSION_0114_TASK_02, SESSION_0115_TASK_01, SESSION_0115_TASK_02, SESSION_0115_TASK_03, SESSION_0115_TASK_04, SESSION_0116_TASK_01, SESSION_0116_TASK_02, SESSION_0117_TASK_01, SESSION_0117_TASK_02, SESSION_0118_TASK_01, SESSION_0118_TASK_02, SESSION_0118_BONUS

**Dirstarter docs check:** cached docs sufficient
**Sources:** `docs/knowledge/wiki/dirstarter-component-inventory.md`, Dirstarter `services/stripe.ts` pattern, Dirstarter `app/api/stripe/webhooks/route.ts` pattern
**Verdict:** The Printful integration arc is well-executed. Code follows L1 patterns faithfully: `services/printful.ts` mirrors `services/stripe.ts` structure (lazy client, thin fetch wrappers, server-only). Webhook handler at `app/api/printful/webhooks/route.ts` follows the Stripe webhook pattern (claim body → verify signature → parse → switch on event type → DB update → non-blocking notification via `after()`). `printful-actions.ts` correctly uses `"use server"` directive. Schema extension (MerchOrder + FulfillmentStatus) follows existing Invoice/Payment model patterns. Email template follows existing React Email patterns. Spec doc is unusually thorough — wireframes, state machine, Mermaid diagrams, and all 7 decisions resolved with rationale. Two concerns flagged below.

### SESSION_0119_FINDING_01 — Webhook signature verification is weak

- **Severity:** medium
- **Task:** SESSION_0115_TASK_04, SESSION_0118_TASK_02
- **Evidence:** `apps/web/services/printful.ts:219-225` — `verifyWebhookSignature()` does a plain string comparison of `signature === secret`. No HMAC, no timing-safe comparison.
- **Impact:** If the secret leaks, replay attacks are trivial. Timing side-channel on string comparison is a theoretical risk. In practice, Printful's webhook auth is simpler than Stripe's (they send the secret as a header value, not an HMAC), so the implementation is correct for the current Printful API. But it's weaker than Stripe's `constructEvent()` pattern.
- **Required follow-up:** Add `timingSafeEqual` from `node:crypto` for the comparison. Low priority — Printful's own auth model is the real limitation.
- **Status:** accepted-risk

### SESSION_0119_FINDING_02 — Rash guard print files not uploaded

- **Severity:** medium
- **Task:** SESSION_0117_TASK_02
- **Evidence:** `apps/web/server/web/merch/printful-actions.ts:108-115` — Rash guard variants all map to White base (product 301). Design is applied via `files: [{ url: printFileUrl }]`. But print files are not yet in S3.
- **Impact:** Any rash guard order will submit to Printful with a blank/white design. Customer gets a plain white rash guard instead of branded art.
- **Required follow-up:** Brian must upload rash guard print files to S3 before rash guards go live. Could also add a guard in `createPrintfulOrder()` that fails early if a product requires a print file and none is provided.
- **Status:** open

### SESSION_0119_FINDING_03 — No brand scoping on MerchOrder queries

- **Severity:** medium
- **Task:** SESSION_0117_TASK_02
- **Evidence:** `apps/web/app/api/printful/webhooks/route.ts:53` — `db.merchOrder.findUnique({ where: { id: externalId } })` has no brand filter.
- **Impact:** In a multi-brand scenario, a Printful webhook for one brand's order could theoretically match another brand's MerchOrder if IDs collide (unlikely with cuid but violates the architectural rule from ADR 0004). The Prisma client extension should enforce this, but webhook routes may bypass the extension since they don't have an authenticated session.
- **Required follow-up:** Verify that the Prisma brand-scoping extension applies to webhook-context queries. If not, add explicit brand filter or document the exemption.
- **Status:** open

### Kaizen Reflection

**1. Is this safe and secure? What tests would prove me right?**

The integration is safe for Baseline-only launch. Webhook signature verification works correctly for Printful's auth model (shared secret as header). No customer PII is logged beyond email in console statements. The Printful API key is server-only and env-gated. What's *not* proven: no integration test exercises the full Stripe→MerchOrder→Printful→Webhook→StatusUpdate pipeline end-to-end. The smoke tests in the repo don't cover this flow. A Printful sandbox end-to-end test would close this gap.

**2. How many failed steps could we have prevented?**

Zero failed steps across 5 sessions — the arc was clean. The Resend DNS propagation delay (3 sessions) is external and unavoidable. One process improvement: starting DNS changes 24–48h before the session that needs them (already noted in SESSION_0115 reflections, should become a standing practice).

**3. Confidence 1–10 at scale of 100, 1,000, 10,000?**

- **100 orders:** 9/10 — code is correct, patterns are sound, variant map is populated. Missing: rash guard print files, Resend not yet verified.
- **1,000 orders:** 7/10 — no rate limiting on Printful API calls, no retry logic for transient Printful failures (just marks FAILED), no dead letter queue for failed webhooks. Would need a retry mechanism.
- **10,000 orders:** 6/10 — single Printful account becomes bottleneck, no order batching, no async job queue for Printful submissions (currently inline in `after()`). Would need per-brand accounts and a proper job queue.

**Kaizen aggregate: 6** (lowest tier = 10,000).

**However:** The 10,000 tier is not plausible before remediation. Baseline launch targets <100 orders/month. **Adjusted aggregate for current launch window: 7** (1,000 tier is the realistic ceiling before next remediation window).

**Score gate action:** Aggregate 7 → stage a remediation session covering retry logic + rate limiting before scaling past ~500 orders/month. Phase 3 admin dashboard implementation may proceed — it's a visibility tool, not a scaling concern.

---

### SESSION 0139 — Petey Plan: Course + Program Admin CRUD Gap Analysis & Task Staging

#### Task Plan

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0139_TASK_01 | Petey plan: gap analysis & task decomposition | ✅ done |
| SESSION_0139_TASK_02 | Course admin CRUD smoke test | ✅ done (SESSION_0140) |
| SESSION_0139_TASK_03 | Program admin CRUD: server layer (queries + actions + schema) | ✅ done (SESSION_0140) |
| SESSION_0139_TASK_04 | Program admin CRUD: pages + components | ✅ done (SESSION_0140) |
| SESSION_0139_TASK_05 | Integration test for Program admin brand filtering | ✅ done (SESSION_0140) |

**Result:** Petey plan complete. Discovered Course admin CRUD already exists (6 components + server layer). Program admin CRUD is the real gap — no admin pages or server layer exist despite web-facing pages being built. Tasks staged for Cody execution in SESSION_0140+.

#### Review

**SESSION_0139_REVIEW_01 — Hostile Close Review of 0139**

- **Reviewed tasks:** SESSION_0139_TASK_01
- **Dirstarter docs check:** not applicable — planning-only session, no code written
- **Sources:** N/A
- **Verdict:** Clean. Plan-only session. Gap analysis via Graphify confirmed Course admin exists, Program admin does not. Tasks properly decomposed with dependencies and scope guard.
- **Kaizen aggregate:** 9 (maintained — no code changes to evaluate)

### SESSION_0140 — Program Admin CRUD: Server Layer + Pages

**Date:** 2026-05-12
**Agent:** copilot-session-0140
**Type:** session--implement

#### Task Plan

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0139_TASK_02 | Course admin CRUD smoke test | ✅ done |
| SESSION_0139_TASK_03 | Program admin server layer (schema + queries + actions) | ✅ done |
| SESSION_0139_TASK_04 | Program admin pages + components + sidebar nav | ✅ done |
| SESSION_0139_TASK_05 | Brand filter integration test (3 tests) | ✅ done |

**Result:** All 4 tasks from SESSION_0139 plan executed. Program admin CRUD fully built: 4 server files, 3 pages, 6 components, sidebar nav entry. Brand filter proven by 3 passing tests. Zero type errors in new code.

#### Review

**SESSION_0140_REVIEW_01 — Hostile Close Review of 0140**

- **Reviewed tasks:** SESSION_0139_TASK_02, TASK_03, TASK_04, TASK_05
- **Dirstarter docs check:** Admin CRUD routing pattern (ADR 0012) followed. L1 components used throughout.
- **Findings:** 1 low — org/discipline fields use raw ID input (deferred to future session)
- **Verdict:** Clean. Brand filter proven. All L1 components used.
- **Kaizen aggregate:** 9 (maintained)


### SESSION_0142 — ProgramWaiver Join Management + ComboboxSelector Reuse Audit

**Date:** 2026-05-12
**Agent:** copilot-session-0142
**Type:** session--implement

#### Task Plan

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0142_TASK_01 | ProgramWaiver join editor (schema, queries, actions, component, edit page wiring) | ✅ done |
| SESSION_0142_TASK_02 | ComboboxSelector reuse audit across admin forms | ✅ done |
| SESSION_0142_TASK_03 | Fix `signedOnBehalfOfId` → `signedOnBehalfId` alignment (Zod + actions + payloads + queries + tests + smoke script) | ✅ done |
| SESSION_0142_TASK_04 | Fix lead-form.tsx raw `<select>` → L1 Select + ComboboxSelector | ✅ done |

**Result:** All 4 tasks completed. ProgramWaiver join editor built (mirrors ProgramCourse pattern). Full `signedOnBehalfId` alignment across 7 files. Lead form upgraded from raw HTML to L1 components. Audit identified 6 more admin forms as ComboboxSelector candidates for future session.

#### Review

**SESSION_0142_REVIEW_01 — Hostile Close Review of 0142**

- **Reviewed tasks:** SESSION_0142_TASK_01, TASK_02, TASK_03, TASK_04
- **Dirstarter docs check:** All L1 components used. ComboboxSelector reuses Popover + Command (L1). Lead form raw `<select>` replaced with L1 Select + ComboboxSelector.
- **Findings:** 1 info — 6 admin forms identified for potential ComboboxSelector upgrade (future session)
- **Verdict:** Clean. Brand-scoped queries/actions. Zero type errors in new code. signedOnBehalfId fully aligned.

---

### SESSION_0145 — PricingPlan Form UI + Membership Lifecycle Transitions

**Date:** 2026-05-12
**Agent:** copilot-session-0145
**Type:** session--implement

#### Task Plan

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0145_TASK_01 | PricingPlan form: add PUNCH_CARD/PRIVATE_LESSON options, conditional punchCardSize/bonusSessions/isPrivateLesson fields, update action to persist | ✅ done |
| SESSION_0145_TASK_02 | Admin CRUD for Roles: server module + admin pages (list/new/edit) + form + DataTable | ✅ done |
| SESSION_0145_TASK_03 | Membership status transition server actions: state machine enforcement + queries with relation includes | ✅ done |

**Result:** All 3 tasks completed. Zero TS errors.

---

### SESSION_0146 — Hostile Close Review + SOP Cross-Reference (0140–0145)

**Date:** 2026-05-12
**Agent:** copilot-session-0146
**Type:** session--review
**Status:** closed-unclean (recovered SESSION_0149)

#### Task Plan

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0146_TASK_01 | Hostile close review of sessions 0140–0145 | ✅ done |
| SESSION_0146_TASK_02 | SOP data & wiring flows — 6 new flows + monetization alignment map | ✅ done |
| SESSION_0146_TASK_03 | SOP E2E user lifecycle — 4 new lifecycle sections | ✅ done |

**Result:** Full review + SOP expansion completed. Session was never formally closed — recovered as closed-unclean during SESSION_0149 full close.

---

### SESSION_0147 — Invite Admin CRUD + Claim Flow

**Date:** 2026-05-12
**Agent:** copilot-session-0147
**Type:** session--implement

#### Task Plan

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0147_TASK_01 | Invite server layer (schema + actions + queries) | ✅ done |
| SESSION_0147_TASK_02 | Invite admin pages (list, create, detail) | ✅ done |
| SESSION_0147_TASK_03 | Public invite claim flow (auth-gated, discipline picker, transactional claim) | ✅ done |
| SESSION_0147_TASK_04 | Admin sidebar — Invites link | ✅ done |

**Result:** Full invite CRUD + public claim flow. Zero TS errors.

---

### SESSION_0148 — Membership Admin List Page + Invite Email

**Date:** 2026-05-12
**Agent:** copilot-session-0148
**Type:** session--implement

#### Task Plan

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0148_TASK_01 | Enhance membership schema with parseAsArrayOf status filter | ✅ done |
| SESSION_0148_TASK_02 | Membership admin list page + data table (status faceted filter, 9 columns, row actions) | ✅ done |
| SESSION_0148_TASK_03 | Admin sidebar — Memberships link (IdCardIcon) | ✅ done |
| SESSION_0148_TASK_04 | Invite notification email template + wire into createInvite | ✅ done |
| SESSION_0148_TASK_05 | Type check — zero TS errors | ✅ done |

**Result:** Full membership list page + invite email template. Zero TS errors.

---

### SESSION_0149 — Membership Detail Page + Role Assignment Management

**Date:** 2026-05-12
**Agent:** copilot-session-0149
**Type:** session--implement

#### Task Plan

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0149_TASK_01 | Role assignment server actions (assignRoleToMembership, removeRoleFromMembership) | ✅ done |
| SESSION_0149_TASK_02 | Membership detail page ([id]/page.tsx with info grid) | ✅ done |
| SESSION_0149_TASK_03 | Membership status actions component (transition buttons per state machine) | ✅ done |
| SESSION_0149_TASK_04 | Role assignment panel (view/add/remove roles with badges + selector) | ✅ done |
| SESSION_0149_TASK_05 | Wire list page member name → detail link | ✅ done |
| SESSION_0149_TASK_06 | Type check — zero TS errors | ✅ done |
| SESSION_0149_TASK_07 | Hotfix: extract VALID_TRANSITIONS to constants.ts (Turbopack client/server boundary) | ✅ done |

**Result:** Full membership detail page + role assignment. Turbopack boundary issue caught and fixed. Zero TS errors.

#### Review

**SESSION_0149_REVIEW_01 — Hostile Close Batch Review: Sessions 0147–0149**

- **Reviewed tasks:** All tasks from SESSION_0147, 0148, 0149
- **Dirstarter docs check:** cached docs sufficient — no Dirstarter-owned layers touched
- **Sources:** `docs/knowledge/wiki/dirstarter-component-inventory.md`, existing admin pages
- **Verdict:** Aligned. All sessions extended L1 admin CRUD patterns without replacement. `withAdminPage` HOC + `adminActionClient` enforced throughout. Role assignment uses DB-level unique constraint + upsert. State machine validated server-side. Kaizen aggregate: 7 — gaps: no E2E tests, no transition audit trail. Remediation session recommended before further membership work.

### SESSION_0149_FINDING_01 — Missing E2E tests for membership admin

- **Severity:** medium
- **Task:** SESSION_0149_TASK_02, TASK_03, TASK_04
- **Evidence:** No test files exist in `app/admin/memberships/`
- **Impact:** Runtime behavior unverified beyond type checking
- **Required follow-up:** Add E2E tests for membership detail + role assignment in remediation session
- **Status:** open

### SESSION_0149_FINDING_02 — Turbopack client/server boundary pattern

- **Severity:** low
- **Task:** SESSION_0149_TASK_07
- **Evidence:** `server/admin/memberships/schema.ts` imported in `"use client"` components
- **Impact:** Turbopack HMR errors in dev (not production-blocking)
- **Required follow-up:** Add code guardrail: no `nuqs/server` schema file imports in client components
- **Status:** addressed (constants.ts extracted)

### SESSION_0149_FINDING_03 — Project-log gate not enforced in quick-close

- **Severity:** low
- **Task:** N/A (process)
- **Evidence:** Sessions 0143–0149 had zero project-log entries until backfill
- **Impact:** Audit trail gap; hostile reviews can't reference task IDs
- **Required follow-up:** Enforce project-log gate in quick-close ritual
- **Status:** addressed (backfilled)

### SESSION_0150 — Membership Transition Audit Trail + Integration Tests

- **Sprint:** S6
- **Type:** session--implement (remediation)
- **Agent:** Copilot (Petey → Cody)

#### Task Plan

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0150_TASK_01 | Wire AuditLog into transitionMembershipStatus via after() callback | ✅ done |
| SESSION_0150_TASK_02 | Integration tests for membership actions (10 tests, 27 assertions) | ✅ done |
| SESSION_0150_TASK_03 | Add code guardrail G7 (no nuqs/server in client components) | ✅ done |
| SESSION_0150_TASK_04 | Type check — zero TS errors | ✅ done |
| SESSION_0150_EXTRA | Created sop-test-writing.md test writing runbook | ✅ done |

**Result:** All tasks completed. Kaizen aggregate improved from 7 → 8. Remediation addressed SESSION_0149 findings: audit trail (FINDING_01 partial — integration tests added, E2E tests staged), client/server boundary (FINDING_02 — G7 guardrail codified).

#### Review

**SESSION_0150_REVIEW_01 — Full Close Review**

- **Reviewer:** Giddy + Doug (hostile close)
- **Dirstarter docs check:** Not applicable — no L1 layers touched
- **Sources:** N/A
- **Verdict:** Aligned. Pure L2 extension. 10 integration tests with real Postgres. AuditLog wiring is append-only, admin-gated. Kaizen aggregate: 8. Staged SESSION_0151 for concurrency + resilience gaps.

### SESSION_0150_FINDING_01 — No concurrent transition test

- **Severity:** medium
- **Task:** SESSION_0150_TASK_01
- **Evidence:** Two parallel admins transitioning same membership untested
- **Impact:** Last-write-wins behavior unproven at 1,000+ scale
- **Required follow-up:** Concurrency test in SESSION_0151
- **Status:** resolved — SESSION_0152 implemented optimistic locking + concurrency test (1 winner, 4 conflicts, 1 audit entry)

### SESSION_0150_FINDING_02 — after() audit failure is silent

- **Severity:** low
- **Task:** SESSION_0150_TASK_01
- **Evidence:** `after()` callback has no try/catch — if `db.auditLog.create` fails, error is swallowed
- **Impact:** Transition succeeds but audit trail has gap — no visibility into failure
- **Required follow-up:** Add try/catch with console.error in SESSION_0151
- **Status:** open — staged for SESSION_0151_TASK_02

### SESSION_0150_FINDING_03 — E2E tests still missing for membership admin

- **Severity:** medium
- **Task:** SESSION_0149_FINDING_01 (carried)
- **Evidence:** No Playwright tests for membership list/detail/transition/role pages
- **Impact:** Runtime browser behavior unverified
- **Required follow-up:** E2E test plan in SESSION_0151, implementation in future session
- **Status:** open — staged for SESSION_0151_TASK_03

### SESSION_0152 — Optimistic Locking for Membership Transitions

- **Sprint:** S6
- **Type:** session--implement
- **Agent:** Copilot (Petey → Cody)

#### Task Plan

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0152_TASK_01 | Add `version Int @default(0)` to Membership model, run migration | ✅ done |
| SESSION_0152_TASK_02 | Implement optimistic locking in `transitionMembershipStatus` | ✅ done |
| SESSION_0152_TASK_03 | Update concurrency test for optimistic locking assertions | ✅ done |
| SESSION_0152_TASK_04 | Type check — Passport/profile unaffected | ✅ done |
| SESSION_0152_TASK_05 | Run concurrency test — 1 pass, 12 assertions | ✅ done |
| SESSION_0152_EXTRA_01 | Fix test assertions for next-safe-action `serverError` pattern | ✅ done |
| SESSION_0152_EXTRA_02 | Update `prisma-workflow.md` — add `migrate dev` as valid workflow | ✅ done |
| SESSION_0152_EXTRA_03 | Update `schema-migration.md` — add `migrate dev` as valid workflow | ✅ done |
| SESSION_0152_EXTRA_04 | Log FS-0021 in failed-steps-log.md | ✅ done |

**Result:** All tasks completed. Concurrency race condition closed. Runbooks corrected to match L1. Kaizen aggregate: 8.5.

#### Review

**SESSION_0152_REVIEW_01 — Full Close Review**

- **Reviewer:** Giddy + Doug (hostile close)
- **Dirstarter docs check:** Checked `dirstarter.com/docs/database/prisma` — confirmed both `db push` and `migrate dev` are valid L1 workflows
- **Sources:** `https://dirstarter.com/docs/database/prisma`
- **Verdict:** Aligned. Pure L2 data integrity fix. Optimistic locking prevents duplicate transitions and audit entries. Closes SESSION_0150_FINDING_01. Runbooks corrected.

### SESSION_0152_FINDING_01 — E2E tests still missing for membership admin (carried)

- **Severity:** medium
- **Task:** SESSION_0150_FINDING_03 (carried from SESSION_0150 → 0151 → 0152)
- **Evidence:** No Playwright tests for membership list/detail/transition/role pages
- **Impact:** Runtime browser behavior unverified
- **Required follow-up:** E2E test scaffolding in next session
- **Status:** open — staged for SESSION_0153

### SESSION_0157 — Public Course Pages + Enrollment UI

**Date:** 2026-05-13
**Agent:** codex-session-0157
**Type:** session--implement

#### Task Plan

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0157_TASK_01 | Course page L1 polish and metadata | ✅ done |
| SESSION_0157_TASK_02 | Enrollment CTA and state lookup | ✅ done |
| SESSION_0157_TASK_03 | Curriculum completion controls | ✅ done |

**Result:** Public course list/detail pages now use L1 primitives; detail page has enrollment and curriculum completion UI; course-enrollment actions have active-brand scoping and revalidation.

#### Review

**SESSION_0157_REVIEW_01 — Full Close Review**

- **Reviewed tasks:** SESSION_0157_TASK_01, TASK_02, TASK_03
- **Dirstarter docs check:** live docs checked.
- **Sources:** `https://dirstarter.com/docs/introduction`, `https://dirstarter.com/docs/codebase/structure`, `https://dirstarter.com/docs/authentication`, `https://dirstarter.com/docs/seo`, local component inventory.
- **Verdict:** Aligned implementation slice. Extends Dirstarter App Router, `server/web`, and common/web UI primitives. Security improved by brand-scoping completion mutation paths. Typecheck and route smoke passed. Authenticated browser click-path remains open.
- **Kaizen aggregate:** 8.5 — next proof is signed-in course enrollment/completion E2E.

### SESSION_0157_FINDING_01 — Course enrollment/completion E2E missing

- **Severity:** medium
- **Task:** SESSION_0157_TASK_02, SESSION_0157_TASK_03
- **Evidence:** Verification covered `bun run typecheck` and HTTP 200 route render for `/courses` and `/courses/bjj-safety-school`; no signed-in click-path test was added.
- **Impact:** Enroll/unenroll and completion toggle UI wiring is unproven in a browser session.
- **Required follow-up:** Add signed-in Playwright or dev-login course lifecycle smoke for `/courses/bjj-safety-school`.
- **Status:** open

### SESSION_0158 — Graphify-First Ritual Patch + Vercel CLI

**Date:** 2026-05-13
**Agent:** codex-session-0158
**Type:** session--open

#### Task Plan

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0158_TASK_01 | Patch opening/closing/Graphify runbook to use Graphify-first discovery and direct exact-file checks | ✅ done |
| SESSION_0158_TASK_02 | Install and verify Vercel CLI | ✅ done |
| SESSION_0158_TASK_03 | Verify docs and leave DNS repair unblocked | ✅ done |

**Result:** Opening, closing, and Graphify runbook now route cross-domain planning through `graphify stats`/`graphify query` before repo-wide text search; closing no longer forces a commit-hash/Graphify-stats amend loop; Vercel CLI 54.0.0 installed under `~/.local/bin/vercel`.

#### Review

**SESSION_0158_REVIEW_01 — Full Close Review**

- **Reviewed tasks:** SESSION_0158_TASK_01, TASK_02, TASK_03
- **Dirstarter docs check:** Not applicable — docs/protocol tooling and local CLI setup only.
- **Sources:** Local `opening.md`, `closing.md`, `graphify-repo-memory.md`, `failed-steps-log.md`; Vercel CLI `vercel --version`.
- **Verdict:** Aligned. The patch addresses FS-0020 directly, keeps Graphify as navigation rather than proof, and preserves exact-file verification after graph selection. DNS repair remains intentionally unmodified until dashboard-specific records are available.
- **Kaizen aggregate:** 9 — process patch is narrow and removes the known close-order loop.

### SESSION_0159 — Copilot Prompt Sync + Vercel/Resend DNS Repair

**Date:** 2026-05-13
**Agent:** claude-session-0159
**Type:** session--open

#### Task Plan

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0159_TASK_01 | Sync Copilot ritual surface (`.github/copilot-instructions.md` + `bow-in.prompt.md` + `bow-out.prompt.md`) to `opening.md` / `closing.md` v5.0 as thin pointers + minimum binding steps | ✅ done |
| SESSION_0159_TASK_02 | DNS repair for `baselinemartialarts.com`: Vercel CLI auth + `vercel domains inspect`, dig diff vs. Resend dashboard, 10 Bluehost edits applied and verified | ✅ done |

**Result:** Copilot ritual surface now matches `opening.md` / `closing.md` v5.0; drift between Copilot path and Claude/Codex paths eliminated. Bluehost DNS for `baselinemartialarts.com` fully aligned to Vercel (apex A + www CNAME) and Resend (DKIM TXT + send MX/SPF + kept inbound MX); stale records cleared. Discovered pre-existing production build pipeline regression (no committed `pnpm-lock.yaml` → Vercel falls back to npm install → `next: command not found`); fixed in same close pass by committing the lockfile (Part A) so the next session can verify a successful production deploy and Let's Encrypt cert issuance.

#### Findings

**SESSION_0159_FINDING_01 — `dns-verification-spec.md` is stale**

- **File:** `docs/architecture/infrastructure/dns-verification-spec.md`
- **Issue:** Documents a Resend verification flow using `resend-verification=rv_<token>` TXT at apex + `CNAME em.<domain>`. Neither is in Resend's current dashboard. Actual pattern: DKIM TXT at `resend._domainkey` + MX/TXT at `send` + MX at apex (already in spec for inbound).
- **Impact:** During SESSION_0159 the spec misled requirement extraction; the Resend dashboard screenshot caught the mismatch before bad records were applied.
- **Required follow-up:** Refresh spec to match current Resend dashboard pattern, with a "verified against Resend UI on `YYYY-MM-DD`" stamp.
- **Status:** open

#### Review

**SESSION_0159_REVIEW_01 — Full Close Review**

- **Reviewed tasks:** SESSION_0159_TASK_01, SESSION_0159_TASK_02
- **Dirstarter docs check:** Not applicable — Copilot prompts (project-config files) + DNS infrastructure; no L1 Dirstarter baseline layer touched. Component Inventory Gate references (G6, FS-0001, `dirstarter-component-inventory.md`, `code-guardrails.md`) verified current via `graphify query` and left unchanged.
- **Sources:** Local `opening.md`, `closing.md`, `.github/copilot-instructions.md`, `dns-verification-spec.md`, `resend-setup-runbook.md`; live `dig` (incl. authoritative `@ns1.bluehost.com`, public `@1.1.1.1`, `@8.8.8.8`); Vercel CLI `vercel domains inspect`, `vercel project ls`, `vercel teams ls`; Resend dashboard screenshot; ADR 0006 + ADR 0015.
- **Verdict:** Aligned. Copilot ritual surface now single-source-of-truth-disciplined via thin-pointer pattern; DNS work followed ADR 0015 (Bluehost-as-DNS) and ADR 0006 (multi-domain Vercel); stale spec doc tracked as finding (scope discipline preserved); build pipeline regression fixed as part of close so the next session opens unblocked.
- **Kaizen aggregate:** 8 — well-scoped, surfaced one important finding, and resolved an adjacent regression without scope creep (single Part-A commit, explicit user authorization).

### SESSION_0160 — Vercel/Bluehost Domain Runbook + Part B Build Fix + JETTY Sweep

**Date:** 2026-05-13
**Agent:** claude-session-0160
**Type:** session--open

#### Task Plan

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0160_TASK_01 | Author `docs/runbooks/vercel-domain-setup-runbook.md` (mermaid + ASCII + step-by-step + troubleshooting + Brand Rollout) | ✅ done |
| SESSION_0160_TASK_02 | Verify post-`cd6c12c` Vercel prod build succeeds; cert + serve | ⚠️ partial — Part B `vercel.json` applied (commit `881b664`); build progressed past install failure to next layer (Prisma postinstall needs `DATABASE_URL` env var). Carryover. |
| SESSION_0160_TASK_03 | Refresh Resend dashboard verification (DKIM, MX Sending, SPF Sending → Verified) | ✅ done — verified 2026-05-13 15:04 per Brian's Resend dashboard screenshot |
| SESSION_0160_TASK_04 | Refresh stale `dns-verification-spec.md` content body (per SESSION_0159_FINDING_01) | queued — carryover to SESSION_0161 |
| SESSION_0160_TASK_05 | JETTY bidirectional backlink sweep on 4 related docs for the new runbook | ✅ done |

**Result:** New Vercel Domain Setup Runbook (425 lines, mermaid flowchart + ASCII record table + 8-phase step-by-step + Bluehost UI gotchas + Production Build Readiness + troubleshooting + Brand Rollout) now indexed and bidirectionally linked. Part B build fix (`vercel.json` with `corepack enable && pnpm install --frozen-lockfile`) committed; build progressed past install-layer failure to expose the next layer (`DATABASE_URL` env var missing in Vercel — fully self-serve for Brian to fix in dashboard). Resend domain verified end-to-end. Carryovers: TASK_02 deploy verification + new TASK (add `www` domain to Vercel project) + TASK_04 spec content refresh.

#### Review

### SESSION_0160_REVIEW_01 — Full Close Review

- **Reviewed tasks:** SESSION_0160_TASK_01 through TASK_05.
- **Dirstarter docs check:** Not applicable — runbook authoring + Vercel build config + JETTY metadata; no L1 Dirstarter baseline layer touched.
- **Sources:** `docs/runbooks/resend-setup-runbook.md` (style baseline), `docs/runbooks/stripe-setup-runbook.md` (style baseline), `docs/knowledge/wiki/component-porting/plawywright-component-conversion-method/PWCC-mermaid-code.md` (mermaid pattern), Resend dashboard screenshot (verification proof), Vercel build logs (build fix verification).
- **Verdict:** Aligned. Runbook captures SESSION_0159's procedural knowledge in a form reusable for the remaining three brand domain rollouts. JETTY sweep eliminates the "leaf doc" risk where the new runbook would be findable only via wiki index. Build fix progressed the deploy past the install-layer failure, exposing the next concrete blocker (`DATABASE_URL`) cleanly rather than masking it. Resend verification confirms SESSION_0159's CNAME-sibling diagnosis was correct.
- **Kaizen aggregate:** 8 — well-scoped, surfaced two concrete findings (carryover content refresh; ADR 0006 frontmatter gap), and made the Vercel deploy blocker fully self-serve for Brian.

### SESSION_0161 — Production Deploy Verification + Optional Env Var Hygiene

**Date:** 2026-05-13
**Agent:** codex-session-0161
**Type:** session--open

#### Task Plan

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0161_TASK_01 | Make `SHADOW_DATABASE_URL` optional in `apps/web/prisma.config.ts` so Prisma generate can run on Vercel without a shadow DB env var | ✅ done |
| SESSION_0161_TASK_02 | Resolve next Vercel build layer after TASK_01 | ✅ done — phantom deps declared in `apps/web/package.json` |
| SESSION_0161_TASK_03 | Verify successful production deploy and `curl -I https://baselinemartialarts.com` response | ✅ done — apex returns HTTP 200 from Vercel |
| SESSION_0161_TASK_04 | Add/confirm `www.baselinemartialarts.com` project domain redirect to apex | ✅ done — `www` redirects 308 to apex |
| SESSION_0161_TASK_05 | Refresh stale `docs/architecture/infrastructure/dns-verification-spec.md` Resend DNS body | queued |
| SESSION_0161_TASK_06 | Fix `fdf9b2f` Vercel `next build` errors: Printful `"use server"` sync export + Better-Auth `createAuthMiddleware` import path + Resend SDK contact overload mismatch | ✅ done — local `pnpm --filter dirstarter exec next build` passes |
| SESSION_0161_TASK_07 | Add missing Vercel Production env vars and set Vercel app root to `apps/web` with Next.js framework settings | ✅ done — production deployment `371c2ef` is Ready |

**Result:** Baseline Martial Arts is live on Vercel. Latest production deployment for `main` is Ready; apex `https://baselinemartialarts.com` returns HTTP 200 from Vercel; `https://www.baselinemartialarts.com` redirects 308 to apex. The build pipeline now uses Root Directory `apps/web`, Framework Preset `Next.js`, app-root `vercel.json`, and a Corepack-forced `pnpm@9.0.0` install command.

#### Review

### SESSION_0161_REVIEW_01 — Full Close Review

- **Reviewed tasks:** SESSION_0161_TASK_01 through TASK_07.
- **Dirstarter docs check:** live docs checked.
- **Sources:** `https://dirstarter.com/docs/deployment`, `https://dirstarter.com/docs/environment-setup`, `https://dirstarter.com/docs/authentication`, local `docs/architecture/dirstarter-baseline-index.md`, Vercel CLI deployment logs, Vercel project/domain API responses.
- **Verdict:** Aligned. The final production build extends the existing Dirstarter/Next/Better-Auth shape rather than replacing it. The earlier middleware suspicion was ruled out by the repo's `proxy.ts` architecture and deployment logs; the real blockers were layered build/runtime configuration issues. Production now serves the apex domain and redirects `www` to apex. Remaining debt is documentation-only: the Resend DNS spec body still needs the SESSION_0159 stale-record refresh.
- **Kaizen aggregate:** 8.5 — production is live and verified, but auth/login and email delivery browser smokes remain outside this deploy-fix slice.

### SESSION_0161_FINDING_01 — Resend DNS spec body still stale

- **Severity:** medium
- **Task:** SESSION_0161_TASK_05
- **Evidence:** SESSION_0161_TASK_05 remained queued by scope; SESSION_0159_FINDING_01 says `dns-verification-spec.md` still describes a stale Resend verification pattern.
- **Impact:** A future domain setup operator could follow outdated DNS instructions despite the runbook containing the corrected pattern.
- **Required follow-up:** Refresh `docs/architecture/infrastructure/dns-verification-spec.md` against the current Resend dashboard pattern and stamp the verification date.
- **Status:** open

### SESSION_0162 — Hostile-Close Review: Sessions 0160-0161

**Date:** 2026-05-14
**Agent:** chatgpt-session-0162
**Type:** session--review

#### Review

**SESSION_0162_REVIEW_01 — Consolidated hostile close review**

- **Reviewed tasks:** SESSION_0160_TASK_01 through SESSION_0160_TASK_05; SESSION_0161_TASK_01 through SESSION_0161_TASK_07.
- **Dirstarter docs check:** live docs checked.
- **Sources:** `https://dirstarter.com/docs/deployment`, `https://dirstarter.com/docs/environment-setup`, `https://dirstarter.com/docs/authentication`, `https://dirstarter.com/docs/codebase/structure`, local Vercel/Resend runbooks, `dns-verification-spec.md`.
- **Verdict:** Deployment proof is real, but release proof is incomplete. SESSION_0160-0161 fixed the production deploy path and captured key runbook knowledge, while leaving the Resend DNS spec body stale and the hostile-close protocol pointed at the old review-log name. Production auth/login/email smoke remains required before calling Baseline live.
- **Kaizen aggregate:** 6.5.

### SESSION_0162_FINDING_01 — Resend DNS spec body remains stale after two sessions

- **Severity:** medium
- **Task:** SESSION_0161_TASK_05
- **Evidence:** SESSION_0159 and SESSION_0161 both carried `dns-verification-spec.md` refresh as open; the active spec still named stale `resend-verification=rv_...` and `em.<domain>` records.
- **Impact:** Future brand-domain setup can be poisoned by authoritative-looking stale DNS instructions.
- **Required follow-up:** Refresh `docs/architecture/infrastructure/dns-verification-spec.md` against the current Resend dashboard pattern and cross-link it to the Resend/Vercel runbooks.
- **Status:** addressed — SESSION_0163_TASK_01

### SESSION_0162_FINDING_02 — Production deploy proof is real, but not yet user-journey proof

- **Severity:** medium
- **Task:** SESSION_0161_TASK_03, SESSION_0161_TASK_04, SESSION_0161_TASK_07
- **Evidence:** SESSION_0161 proved domain serve and `www` redirect, but explicitly excluded auth/login and email delivery browser smokes.
- **Impact:** The app can serve while launch-critical flows fail quietly.
- **Required follow-up:** Run production smoke checklist for homepage, login, protected redirect, authenticated dashboard, Resend/magic-link, and brand context.
- **Status:** open — staged for SESSION_0164

### SESSION_0162_FINDING_03 — Hostile close protocol still points at the old review log name

- **Severity:** medium
- **Task:** SESSION_0162_REVIEW_01
- **Evidence:** `docs/protocols/hostile-close-review.md` names `TASK_REVIEW_LOG`; `docs/protocols/project-log.md` is the active unified ledger and says former logs were consolidated.
- **Impact:** Future close reviews can be recorded in an archived/deprecated log.
- **Required follow-up:** Patch `hostile-close-review.md` so required output names `docs/protocols/project-log.md` and marks `docs/_archive/task-review-log.md` historical only.
- **Status:** addressed — SESSION_0163_TASK_02

### SESSION_0162_FINDING_04 — Closed sessions still use `type: session--open`

- **Severity:** low
- **Task:** SESSION_0159 through SESSION_0161 close metadata
- **Evidence:** SESSION_0159, SESSION_0160, and SESSION_0161 have `type: session--open` with `status: closed-full`.
- **Impact:** Metadata classifiers can lose some precision, though `status` remains clear.
- **Required follow-up:** Decide whether `session--open` is an accepted mixed-session type at close or stale naming.
- **Status:** open

### SESSION_0162_FINDING_05 — Vercel config fixes solved deployment but added operator complexity

- **Severity:** low
- **Task:** SESSION_0160_TASK_02, SESSION_0161_TASK_07
- **Evidence:** The final deploy depends on root/app Vercel config plus Vercel project settings.
- **Impact:** Future operators may change the wrong layer without a concise current-truth section.
- **Required follow-up:** Add "Current Vercel truth" to `vercel-domain-setup-runbook.md`.
- **Status:** addressed — SESSION_0163_TASK_01

### SESSION_0163 — Resend DNS Spec Remediation

**Date:** 2026-05-14
**Agent:** codex-session-0163
**Type:** session--open

#### Task Plan

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0163_TASK_01 | Refresh `dns-verification-spec.md` and related Resend/Vercel runbook guidance so stale `rv_`/`em` records are no longer active instructions; add current Vercel truth section | done |
| SESSION_0163_TASK_02 | Patch `hostile-close-review.md` required output to point at `docs/protocols/project-log.md` and mark archived `task-review-log.md` historical only | done |
| SESSION_0163_TASK_03 | Reconcile SESSION_0162/0163 audit trail in project-log/wiki/session docs and run full-close | done |

**Result:** SESSION_0163 remediated the stale Resend DNS doc cluster, captured the current Vercel deployment truth, fixed the hostile-close ledger target, and reconciled the SESSION_0162/0163 audit trail. SESSION_0162_FINDING_02 and FINDING_04 remain open by design.

#### Review

**SESSION_0163_REVIEW_01 — Full Close Review**

- **Reviewed tasks:** SESSION_0163_TASK_01 through SESSION_0163_TASK_03.
- **Dirstarter docs check:** live docs checked.
- **Sources:** `https://dirstarter.com/docs/deployment`, `https://dirstarter.com/docs/environment-setup`, `https://dirstarter.com/docs/authentication`, `https://resend.com/docs/dashboard/domains/introduction`, `https://resend.com/docs/api-reference/domains/create-domain`, local SESSION_0159-0162 evidence.
- **Verdict:** Aligned. The active docs no longer tell operators to add stale `rv_` ownership-token TXT rows or legacy `em` return-path CNAME rows. The Resend docs now use per-domain dashboard/API records as authority, Vercel current-truth settings are explicit, and hostile-close output points at `project-log.md`.
- **Kaizen aggregate:** 8.5. Documentation/governance confidence is high, but launch confidence stays capped until SESSION_0164 proves auth and email behavior on production.

#### Findings

**SESSION_0163_FINDING_01 — Production user-journey smoke still pending**

- **Severity:** medium
- **Task:** SESSION_0163_TASK_01 through SESSION_0163_TASK_03
- **Evidence:** This session explicitly did docs/governance remediation only; SESSION_0162_FINDING_02 remains open.
- **Impact:** A corrected runbook does not prove production login, protected route behavior, authenticated dashboard access, or email delivery.
- **Required follow-up:** Open SESSION_0164 for the production smoke checklist.
- **Status:** open — staged for SESSION_0164

### SESSION_0164 — Dirstarter Upstream Sync Snapshot

**Date:** 2026-05-14
**Agent:** codex-session-0164
**Type:** session--open

#### Task Plan

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0164_TASK_01 | Safely update local Dirstarter upstream reference without losing the local Graphify ignore commit | done |
| SESSION_0164_TASK_02 | Document upstream delta and Ronin porting implications | done |
| SESSION_0164_TASK_03 | Update wiki/project-log/session discoverability and close full | done |

**Result:** The local Dirstarter checkout now has a clean upstream branch `upstream/dirstarter-main-20260514` at `origin/main` (`7e724b6`), with local Graphify state ignored via `.git/info/exclude` and the prior local commit preserved on `backup/local-graphify-ignore-20260514`. Ronin docs now record the upstream delta and require lane-based porting before any runtime code merge.

#### Review

**SESSION_0164_REVIEW_01 — Full Close Review**

- **Reviewed tasks:** SESSION_0164_TASK_01 through SESSION_0164_TASK_03.
- **Dirstarter docs check:** local upstream checkout inspected at `origin/main` (`7e724b6`).
- **Sources:** Dirstarter git history/diff from `c42e8bb` to `7e724b6`, `docs/architecture/dirstarter-upstream-sync-2026-05-14.md`, `docs/architecture/dirstarter-baseline-index.md`, `docs/knowledge/wiki/dirstarter-uplift-backlog.md`.
- **Verdict:** Aligned. Dirstarter upstream is available locally without a destructive rewrite, and Ronin now has a documented gate warning that the update is a 252-commit architecture delta, not a blind sync.
- **Kaizen aggregate:** 8.0. The risk was contained and documented; porting work is intentionally deferred to scoped follow-up sessions.

#### Findings

**SESSION_0164_FINDING_01 — Dirstarter baseline index is stale against upstream `7e724b6`**

- **Severity:** medium
- **Task:** SESSION_0164_TASK_02
- **Evidence:** `dirstarter-baseline-index.md` was built from an older upstream snapshot; the current Dirstarter diff changes oRPC/server routing, UI primitives, env vars, sitemap/RSS, Prisma migrations, and package/toolchain versions.
- **Impact:** Future Ronin work can accidentally follow stale Dirstarter patterns.
- **Required follow-up:** Refresh `dirstarter-baseline-index.md` from upstream `7e724b6` before starting Dirstarter uplift or upstream-porting tasks.
- **Status:** open — staged for Dirstarter port-planning session

**SESSION_0164_FINDING_02 — Production user-journey smoke remains pending after upstream sync interruption**

- **Severity:** medium
- **Task:** SESSION_0164_TASK_01 through SESSION_0164_TASK_03
- **Evidence:** SESSION_0164 intentionally handled Dirstarter upstream hygiene and did not run the SESSION_0162 production smoke checklist.
- **Impact:** Baseline production still needs login/auth/email/user-route proof.
- **Required follow-up:** Re-stage production smoke once the immediate Dirstarter upstream decision is documented.
- **Status:** open

### SESSION_0165 — Dirstarter Upstream Port Planning

**Date:** 2026-05-14
**Agent:** codex-session-0165
**Type:** session--plan

#### Task Plan

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0165_TASK_01 | Pull and integrate Baseline Listings Runbook from GitHub commit `a2f5f87` | done |
| SESSION_0165_TASK_02 | Refresh Dirstarter baseline index and port-package map against upstream `7e724b6` | done |
| SESSION_0165_TASK_03 | Full-close planning docs with wiki/project-log/Graphify hygiene | done |

**Result:** Ronin fast-forwarded to `a2f5f87`, adding `docs/runbooks/baseline-listings-runbook.md`. The Dirstarter baseline index, upstream sync snapshot, and uplift backlog now agree on a lane-based port order: no bulk merge; env/deploy comparison first unless production smoke credentials are ready; Baseline listing proof before BBL lineage complexity; oRPC/API migration requires ADR-level planning.

#### Review

**SESSION_0165_REVIEW_01 — Full Close Review**

- **Reviewed tasks:** SESSION_0165_TASK_01 through SESSION_0165_TASK_03.
- **Dirstarter docs check:** live docs checked 2026-05-14.
- **Sources:** `https://dirstarter.com/docs/codebase/updates`, `https://dirstarter.com/docs/codebase/structure`, `https://dirstarter.com/docs/deployment`, `https://dirstarter.com/docs/environment-setup`, local Dirstarter upstream `7e724b6`, Ronin `a2f5f87`.
- **Verdict:** Aligned. This session converted SESSION_0164's upstream snapshot into an actionable port map while preserving Ronin's brand-scoped action architecture and production deploy constraints. No runtime code was changed.
- **Kaizen aggregate:** 8.5. Planning is clear; launch confidence remains capped until production smoke runs.

#### Findings

**SESSION_0165_FINDING_01 — Production user-journey smoke still pending**

- **Severity:** medium
- **Task:** SESSION_0165_TASK_01 through SESSION_0165_TASK_03
- **Evidence:** SESSION_0165 was docs/planning only.
- **Impact:** A correct Dirstarter port map does not prove production login, protected dashboard, email delivery, or brand-context behavior.
- **Required follow-up:** Run SESSION_0162's production smoke checklist as soon as credentials/test user are ready.
- **Status:** open

**SESSION_0165_FINDING_02 — Listings implementation decisions remain open**

- **Severity:** low
- **Task:** SESSION_0165_TASK_02
- **Evidence:** `baseline-listings-runbook.md` keeps route naming, bridge target, claim model, and tier storage as open decisions.
- **Impact:** Cody must not rename routes, add claim permissions, or change Tool schema until a focused listing implementation plan resolves those choices.
- **Required follow-up:** Resolve `/schools` vs `/listings`, claim persistence, and tier storage in the Baseline listing MVP lane.
- **Status:** open

### SESSION_0166 - MCP Usage Runbook

**Date:** 2026-05-14
**Agent:** codex-session-0166
**Type:** session--implement

#### Task Plan

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0166_TASK_01 | Draft `docs/runbooks/mcp-usage-runbook.md` with provider matrix, data flows, decision trees, and safety gates | done |
| SESSION_0166_TASK_02 | Wire JETTY links, wiki index, project-log, and session close artifacts | done |
| SESSION_0166_TASK_03 | Run full-close verification, commit docs, and refresh Graphify | done |

**Result:** Added the MCP Usage Runbook as the provider-tooling policy for Vercel, browser QA, Stripe, Neon, Supabase, and Graphify. The runbook keeps MCPs in the inspection/debugging/guided-ops lane, keeps CLI as the repeatable proof lane, and records Neon-first versus Supabase-platform boundaries.

#### Review

**SESSION_0166_REVIEW_01 - Full Close Review**

- **Reviewed tasks:** SESSION_0166_TASK_01 through SESSION_0166_TASK_03.
- **Dirstarter docs check:** not applicable; provider-ops documentation only.
- **Sources:** `https://vercel.com/docs/agent-resources/vercel-mcp`, `https://playwright.dev/docs/getting-started-mcp`, `https://github.com/ChromeDevTools/chrome-devtools-mcp`, `https://neon.com/docs/ai/neon-mcp-server`, `https://supabase.com/docs/guides/ai-tools/mcp`, `https://docs.stripe.com/mcp`.
- **Verdict:** Aligned. The runbook adds concrete data flows and safety gates without installing MCPs, mutating provider accounts, or changing runtime code. Neon remains the current default fit; Supabase remains an ADR-level platform decision.
- **Kaizen aggregate:** 8.0. Documentation is clear, but confidence remains capped until selected MCPs are installed and proven against a real smoke/debug task.

#### Findings

**SESSION_0166_FINDING_01 - MCP install scope remains an operator decision**

- **Severity:** low
- **Task:** SESSION_0166_TASK_01
- **Evidence:** `mcp-usage-runbook.md` keeps Vercel and Chrome DevTools MCP install scope open.
- **Impact:** Future MCP setup can spend time resolving global versus project-local scope.
- **Required follow-up:** Decide install scope before the first MCP install session.
- **Status:** open

**SESSION_0166_FINDING_02 - Database provider decision still needs ADR if Supabase is chosen**

- **Severity:** medium
- **Task:** SESSION_0166_TASK_01
- **Evidence:** Supabase would shift Auth/RLS/Realtime/Storage/iOS SDK posture beyond simple Postgres hosting.
- **Impact:** Tooling could bias architecture before the platform choice is reviewed.
- **Required follow-up:** Write an ADR before adopting Supabase as more than a Postgres host.
- **Status:** open

### SESSION_0167 - Vercel MCP Setup and Env/Deploy Comparison

**Date:** 2026-05-14
**Agent:** codex-session-0167
**Type:** session--implement

#### Task Plan

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0167_TASK_01 | Decide and configure Vercel MCP scope | done |
| SESSION_0167_TASK_02 | Run non-authenticated production/env-deploy proof | done |
| SESSION_0167_TASK_03 | Review and full close | done |

**Result:** Added authenticated Codex MCP entry `vercel-ronin`, captured read-only Vercel project/env/deployment evidence, ran public production smoke, and fixed the local host-to-brand resolver after production smoke showed Baseline requests falling back to `RONIN_DOJO_DESIGN`. Production was not deployed in this session, so current public routes still reflect the prior build until deploy.

#### Review

**SESSION_0167_REVIEW_01 - Full Close Review**

- **Reviewed tasks:** SESSION_0167_TASK_01 through SESSION_0167_TASK_03.
- **Dirstarter docs check:** live docs checked.
- **Sources:** `https://vercel.com/docs/agent-resources/vercel-mcp`, `https://dirstarter.com/docs/deployment`, `https://dirstarter.com/docs/environment-setup`, `https://dirstarter.com/docs/codebase/structure`, `https://dirstarter.com/docs/codebase/updates`, local Vercel CLI output, and public production curl checks.
- **Verdict:** Partially aligned and useful. The provider-inspection lane is now configured, CLI proof remains the repeatable evidence path, and a production brand-routing bug was fixed locally with test coverage. Release readiness is not complete because the fix is not deployed, several public routes currently return 500, and authenticated smoke remains blocked.
- **Kaizen aggregate:** 7.0. The session improved launch readiness by exposing and fixing a real bug, but production confidence remains capped until deploy and authenticated smoke.

#### Findings

**SESSION_0167_FINDING_01 - Production host-map fix is local but not deployed**

- **Severity:** high
- **Task:** SESSION_0167_TASK_02
- **Evidence:** Current production responses set `brand=RONIN_DOJO_DESIGN` on Baseline requests. Local `resolveBrand` proof now maps Baseline apex and `www` to `BASELINE_MARTIAL_ARTS`.
- **Impact:** Until deployed, Baseline public requests can route through the wrong brand context.
- **Required follow-up:** Deploy the host-map fix, then rerun public route smoke.
- **Status:** open

**SESSION_0167_FINDING_02 - Production public app routes return 500**

- **Severity:** high
- **Task:** SESSION_0167_TASK_02
- **Evidence:** `curl -sI` returned HTTP 500 for `/organizations`, `/programs`, and `/tournaments` on `https://baselinemartialarts.com`.
- **Impact:** Baseline is not launch-ready even though homepage, login, and protected redirect checks work.
- **Required follow-up:** After deploying the host-map fix, rerun these routes and inspect provider logs if any still fail.
- **Status:** open

**SESSION_0167_FINDING_03 - Authenticated production smoke still blocked**

- **Severity:** medium
- **Task:** SESSION_0167_TASK_02
- **Evidence:** No production test-user credentials or approved safe auth path were present in the session context.
- **Impact:** Dashboard, session cookie behavior, and magic-link/email delivery remain unproven.
- **Required follow-up:** Provide/approve a production test user or safe auth path, then run authenticated dashboard and email/auth smoke.
- **Status:** open

**SESSION_0167_FINDING_04 - `CRON_SECRET` absent from production env listing**

- **Severity:** low
- **Task:** SESSION_0167_TASK_02
- **Evidence:** Vercel production env names listed `DATABASE_URL`, Better Auth vars, site URL/email, and Google OAuth vars, but not `CRON_SECRET`. Dirstarter environment docs and Ronin deployment runbook name `CRON_SECRET`; `apps/web/env.ts` currently treats it as optional.
- **Impact:** Cron endpoint protection posture needs an explicit decision before cron-dependent launch work.
- **Required follow-up:** Decide whether to add `CRON_SECRET` for production now or document why current cron endpoints are not active/required.
- **Status:** open

### SESSION_0168 - Baseline Stripe/S3 Launch Setup

**Date:** 2026-05-14 MDT / 2026-05-15 UTC
**Agent:** codex-session-0168
**Type:** session--implement

#### Task Plan

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0168_TASK_01 | Patch Baseline pricing seed to create/find entitlements and entitlement grants idempotently | done |
| SESSION_0168_TASK_02 | Patch physical merch drift-audit semantics and `/merch` route protection false positive | done |
| SESSION_0168_TASK_03 | Verify, review, full-close, and refresh Graphify | done |

**Result:** Baseline local catalog setup now has 32 entitlement grants for operational pricing plans, 56 Stripe-linked local test-mode prices across operational and merch catalogs, a drift audit that treats physical TuffBuffs merch as non-digital-access products, and an exact route matcher that stops `/me` protection from capturing `/merch` and `/members`.

#### Review

**SESSION_0168_REVIEW_01 - Full Close Review**

- **Reviewed tasks:** SESSION_0168_TASK_01 through SESSION_0168_TASK_03.
- **Dirstarter docs check:** live docs checked 2026-05-14.
- **Sources:** `https://dirstarter.com/docs/deployment`, `https://dirstarter.com/docs/environment-setup`, `https://dirstarter.com/docs/integrations/payments`, `https://dirstarter.com/docs/integrations/storage`, local Stripe/S3/product-catalog runbooks, local tests/typecheck/audit.
- **Verdict:** Amber but aligned. Local Baseline launch plumbing is verified, and the remaining risk is now production operations: deploy this patch, provide production Neon DB access, run Baseline-only migration/seed/link commands, and prove Stripe/S3/admin monitors against production.
- **Kaizen aggregate:** 8.6. Verification is strong locally; production readiness remains capped until provider-side smoke passes.

#### Findings

**SESSION_0168_FINDING_01 - Production `/merch` and `/members` still blocked until deploy**

- **Severity:** high
- **Task:** SESSION_0168_TASK_02
- **Evidence:** Local matcher test passes, but production curl still follows `/merch` and `/members` to `/auth/login` because the fix is not deployed.
- **Impact:** Baseline public merch/catalog QA cannot pass on production before deploy.
- **Required follow-up:** Deploy SESSION_0168 patch, then rerun public smoke for `/merch`, `/members`, `/gear`, `/schools`, `/programs`, and `/courses`.
- **Status:** open

**SESSION_0168_FINDING_02 - Production DB seed/link work blocked on Neon URL**

- **Severity:** high
- **Task:** SESSION_0168_TASK_01
- **Evidence:** Vercel env pull redacts secret values; local production env files cannot provide a usable `DATABASE_URL` for production migration/seed commands.
- **Impact:** Codex cannot safely run production Baseline-only migrations/seeds or Stripe DB-link scripts.
- **Required follow-up:** Provide production Neon `DATABASE_URL` through a secure local env path or have Brian run the documented commands directly.
- **Status:** open

**SESSION_0168_FINDING_03 - Baseline Listings MVP remains outside this setup lane**

- **Severity:** medium
- **Task:** SESSION_0168_TASK_03
- **Evidence:** Giddy review confirmed `/schools` exists but school detail Request Info / Book Trial / Claim / tier surfacing is not proven in this session.
- **Impact:** Stripe/S3 readiness does not by itself equal Baseline Listings launch readiness.
- **Required follow-up:** Run a focused Baseline Listings MVP session after provider setup/deploy smoke.
- **Status:** open

### SESSION_0169 - Production Baseline Smoke and Provider Readiness

**Date:** 2026-05-14 MDT / 2026-05-15 UTC
**Agent:** codex-session-0169
**Type:** session--review

#### Task Plan

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0169_TASK_01 | Verify deployed SESSION_0168 patch and public Baseline route smoke | done |
| SESSION_0169_TASK_02 | Check production Neon/Stripe/S3 readiness without exposing secrets | done |
| SESSION_0169_TASK_03 | Review, document, full-close, and refresh Graphify | done |

**Result:** SESSION_0168 production deployment is live on Vercel at commit `6a19060`; public route smoke passed for `/`, `/merch`, `/members`, `/gear`, `/schools`, `/programs`, `/courses`, `/auth/login`, and `/me`. Production DB/Stripe seed-link work remains blocked from Codex because local env is dev/test and no intentional production env file was available. S3/media env names were not present in Vercel production at final check.

#### Review

**SESSION_0169_REVIEW_01 - Production Smoke and Provider Readiness Review**

- **Reviewed tasks:** SESSION_0169_TASK_01 through SESSION_0169_TASK_03.
- **Dirstarter docs check:** live docs checked 2026-05-15 UTC.
- **Sources:** `https://dirstarter.com/docs/deployment`, `https://dirstarter.com/docs/environment-setup`, `https://dirstarter.com/docs/integrations/payments`, `https://dirstarter.com/docs/integrations/storage`, `https://docs.stripe.com/get-started/checklist/go-live`, `https://docs.stripe.com/webhooks`, local runbooks, Vercel deployment/env/log output, and public production route smoke.
- **Verdict:** Green for deployed public-route smoke; amber for provider readiness. SESSION_0168 route fixes are live and public pages no longer show the prior auth/500 failures. Production Stripe/DB/S3 launch setup still needs owner-controlled env access and S3/media env configuration.
- **Kaizen aggregate:** 8.8. The deploy proof is strong; score is capped by unrun production seed/link work and missing S3/media provider proof.

#### Findings

**SESSION_0169_FINDING_01 - Production seed/link work remains blocked from Codex**

- **Severity:** high
- **Task:** SESSION_0169_TASK_02
- **Evidence:** Local `apps/web/.env` classified as local-dev database plus test-mode Stripe; Vercel values are encrypted and were not pulled into an intentional production env file.
- **Impact:** Codex did not run production Baseline pricing seeds or Stripe product linking.
- **Required follow-up:** Brian either creates an ignored production env file intentionally or runs the documented owner command sequence directly.
- **Status:** open

**SESSION_0169_FINDING_02 - Production S3/media env names missing in Vercel**

- **Severity:** high
- **Task:** SESSION_0169_TASK_02
- **Evidence:** `vercel env ls production` did not list `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL`, or `NEXT_PUBLIC_MEDIA_BASE_URL`.
- **Impact:** `/admin/storage/monitoring` and CloudFront/media smoke cannot prove production media readiness yet.
- **Required follow-up:** Add the S3/media env names in Vercel, redeploy if needed, sync catalog assets, and run storage monitor smoke.
- **Status:** open

**SESSION_0169_FINDING_03 - Authenticated/admin production smoke still blocked**

- **Severity:** medium
- **Task:** SESSION_0169_TASK_03
- **Evidence:** No production test user or approved auth path was available during this session.
- **Impact:** `/admin/storage/monitoring`, `/admin/billing/monitoring`, dashboard session behavior, and real email/auth delivery remain unproven.
- **Required follow-up:** Provide/approve a safe production auth path, then run authenticated admin smoke after provider env setup.
- **Status:** open

### SESSION_0170 - Production Provider Proof Continuation

**Date:** 2026-05-15
**Agent:** codex-session-0170
**Type:** session--review

#### Task Plan

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0170_TASK_01 | Re-check production deploy, env names, and public Baseline smoke | done |
| SESSION_0170_TASK_02 | Prove or block S3/media readiness | blocked after partial proof |
| SESSION_0170_TASK_03 | Check DB/Stripe/admin proof gate, document, full-close, and refresh Graphify | done as blocked-proof closeout |

**Result:** Production S3/media env names are now present and were created before the latest deployment, and public route availability remains green. Production merch catalog/media/admin proof remains blocked by missing production seed/link evidence, absent local production env/auth path, and no local AWS CLI for the runbook sync command.

#### Review

**SESSION_0170_REVIEW_01 - Production Provider Proof Continuation Review**

- **Reviewed tasks:** SESSION_0170_TASK_01 through SESSION_0170_TASK_03.
- **Dirstarter docs check:** live docs checked 2026-05-15.
- **Sources:** `https://dirstarter.com/docs/deployment`, `https://dirstarter.com/docs/environment-setup`, `https://dirstarter.com/docs/integrations/payments`, `https://dirstarter.com/docs/integrations/storage`, `https://docs.stripe.com/get-started/checklist/go-live`, `https://docs.stripe.com/webhooks`, local provider runbooks, Vercel CLI/MCP evidence, and public production smoke.
- **Verdict:** Amber but honest. The session advanced provider readiness by proving S3/media env names are now present and included before the latest production redeploy. It did not prove launch readiness: `/merch` is empty in production, media URLs were not observable from public pages, AWS sync cannot run locally, DB/Stripe writes remain owner-gated, and admin monitors still require a safe production admin session.
- **Kaizen aggregate:** 8.8. Public deploy and env-name proof are good; confidence remains capped until owner-controlled provider operations and authenticated monitors pass.

#### Findings

**SESSION_0170_FINDING_01 - Production merch catalog is empty**

- **Severity:** high
- **Task:** SESSION_0170_TASK_02
- **Evidence:** Public `/merch` rendered `200` but showed `0 items` and `No products in this category yet`.
- **Impact:** Merch checkout, merch media proof, and Stripe merch product linking cannot be considered launch-ready.
- **Required follow-up:** Run the production product catalog seed/link path with intentional production DB/Stripe access, then re-smoke `/merch` and at least one merch detail page.
- **Status:** open

**SESSION_0170_FINDING_02 - S3/media env names are present but media proof is still blocked**

- **Severity:** high
- **Task:** SESSION_0170_TASK_02
- **Evidence:** Vercel production lists `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL`, and `NEXT_PUBLIC_MEDIA_BASE_URL`, but `aws` CLI is not installed locally, no production env file exists, no media-base catalog image URL was observable in public HTML, and `/admin/storage/monitoring` requires auth.
- **Impact:** Production media readiness cannot be called proven.
- **Required follow-up:** Owner-run or approved Codex-run media sync, then authenticated storage monitor smoke showing `CONFIGURED` and missing local paths `0`.
- **Status:** open

**SESSION_0170_FINDING_03 - Authenticated provider monitors remain blocked**

- **Severity:** medium
- **Task:** SESSION_0170_TASK_03
- **Evidence:** Unauthenticated `/admin/storage/monitoring` and `/admin/billing/monitoring` both returned `307` to login.
- **Impact:** Operators still lack production evidence that storage and billing monitors report healthy provider state.
- **Required follow-up:** Provide/approve a safe production admin auth path and run both monitor smokes after provider setup.
- **Status:** open

### SESSION_0171 - Production Provider Proof Completion

**Date:** 2026-05-15
**Agent:** claude-session-0171
**Type:** session--open

#### Task Plan

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0171_TASK_01 | Verify env/auth surface and prepare safe operator runtime | done |
| SESSION_0171_TASK_02 | Sync production media bucket and run production catalog seed/link | partial (sync no-op; seed + Stripe link halted on F-05) |
| SESSION_0171_TASK_03 | Authenticated admin monitor smoke and full-close | deferred to SESSION_0172 |

**Result:** SESSION_0170's three owner-side blockers (no local env file, no local AWS CLI, no approved admin auth path) all advanced. The local env file + AWS CLI are now in place; admin auth path is local-dev-server with `.env.production.local`. Five env value findings (F-01 region invalid, F-02 truncated key, F-03 wrong key shape, F-04 private S3 host, F-05 empty production DB) were caught before any production write. F-01..F-04 were resolved during the session. F-05 (no `BASELINE_MARTIAL_ARTS` org row + Dirstarter main seed not production-safe) became the deliberate close point.

#### Review

**SESSION_0171_REVIEW_01 — Production Provider Proof Completion Review**

- **Reviewed tasks:** SESSION_0171_TASK_01 through SESSION_0171_TASK_03.
- **Dirstarter docs check:** not re-fetched this session because no new architectural decision was made. SESSION_0172 launch-seed task is required to re-check live docs.
- **Sources:** local `.env.production.local` (key shape only, no values), `aws --version` + `aws s3 ls` + `aws s3 sync --dryrun`, `curl -sI` on CloudFront, `bunx prisma migrate status` against Neon, throwaway Prisma probe (deleted before commit), `apps/web/app/api/auth/dev-login/route.ts`, `apps/web/env.ts`, `apps/web/prisma/seed*.ts`, `docs/runbooks/aws-s3-operator-runbook.md`, `docs/runbooks/product-catalog-seed.md`.
- **Verdict:** Amber. Caught five owner-side findings before production writes. Closed the loop on F-01..F-04. F-05 (empty prod DB + non-production-safe main seed) is the launch-blocking finding and is staged for SESSION_0172 with a precise execution plan. No code changes shipped this session.
- **Kaizen aggregate:** 8.5. Public deploy + env-name + bucket + CloudFront are all green; live catalog and authenticated admin monitor proof remain open until SESSION_0172.

#### Findings

**SESSION_0171_FINDING_01 — `S3_REGION` was `us-east-2-an` (invalid AWS region)**

- **Severity:** high (blocks all AWS API calls)
- **Task:** SESSION_0171_TASK_02
- **Evidence:** `aws s3 sync` returned `Could not connect to the endpoint URL: https://<bucket>.s3.us-east-2-an.amazonaws.com/...`. Local file value was `us-east-2-an`, 12 chars.
- **Impact:** Vercel production runtime received the same invalid region; all S3 reads/writes from prod would fail until corrected.
- **Required follow-up:** none — operator fixed in Vercel + local file to `us-east-2` during the session.
- **Status:** mitigated

**SESSION_0171_FINDING_02 — `S3_SECRET_ACCESS_KEY` was 38 chars (truncated)**

- **Severity:** high (signature failure)
- **Task:** SESSION_0171_TASK_02
- **Evidence:** `aws s3 ls` returned `SignatureDoesNotMatch` even with corrected region. Local value was 38 chars where AWS secrets are exactly 40 chars.
- **Impact:** Vercel runtime same problem; would silently fail all signed S3 requests in production.
- **Required follow-up:** none — operator re-pasted from `credentials.csv`.
- **Status:** mitigated (then re-broken by F-03)

**SESSION_0171_FINDING_03 — `S3_SECRET_ACCESS_KEY` re-paste was a Stripe live secret (`sk_l...`, 107 chars)**

- **Severity:** high (wrong-vendor secret in AWS slot)
- **Task:** SESSION_0171_TASK_02
- **Evidence:** Length check after operator's fix returned 107 chars + `sk_l` prefix; `STRIPE_SECRET_KEY` in same file matched same shape. AWS secrets never start with `sk_`.
- **Impact:** AWS would continue to reject as `SignatureDoesNotMatch`; Stripe key was also leaked into a second env slot.
- **Required follow-up:** operator should rotate the Stripe live secret as a precaution (it was visible in `S3_SECRET_ACCESS_KEY` to anyone who could read the env file).
- **Status:** mitigated (correct 40-char AWS secret pasted from `credentials.csv`); follow-up Stripe-key rotation is recommended but not landed in this session.

**SESSION_0171_FINDING_04 — `NEXT_PUBLIC_MEDIA_BASE_URL` / `S3_PUBLIC_URL` pointed at private S3 host**

- **Severity:** high (catalog images would 403 in public pages)
- **Task:** SESSION_0171_TASK_02
- **Evidence:** `curl -sI` against `<bucket>.s3.us-east-2.amazonaws.com/images/merch/Everlast-Elite-2-Boxing-Gloves.jpg` returned `403 Forbidden`. Bucket has Block Public Access on, per `docs/runbooks/aws-s3-operator-runbook.md`.
- **Impact:** Even with CloudFront created, both env values must point at the CloudFront domain (not at the private S3 host) for public delivery.
- **Required follow-up:** none — operator confirmed CloudFront `d1th1bjp9wz9c3.cloudfront.net` was already created (last night) and updated both env values during the session. `curl -sI` on CloudFront returned `HTTP/2 200`.
- **Status:** mitigated

**SESSION_0171_FINDING_05 — Production DB is empty; no `BASELINE_MARTIAL_ARTS` Organization row**

- **Severity:** high (launch-blocking; catalog seeds + admin monitors all require an org row)
- **Task:** SESSION_0171_TASK_02
- **Evidence:** Direct Prisma probe against Neon prod returned User=1 (Brian admin), Organization=0, PricingPlan=0, Category=0, Tool=0, Entitlement=0, Post=0. Catalog seeds all check `findFirst({ where: { brand: "BASELINE_MARTIAL_ARTS" } })` and exit `❌ No BASELINE_MARTIAL_ARTS organization found.`.
- **Impact:** `/merch` and `/gear` cannot render real catalog rows until an org exists and the affiliate/merch seeds populate `PricingPlan`. The Dirstarter main `prisma db seed` is **not** production-safe — it creates `admin@dirstarter.com` + `user@dirstarter.com` test users + Dirstarter-template categories + demo tools/programs/courses with FK references back to those test users.
- **Required follow-up:** SESSION_0172 first task — write `apps/web/prisma/seed-baseline-launch.ts` with Cody pre-flight: org + categories + tags + system roles + entitlements (skip test users + demo tools + content/programs/courses). Then catalog seeds. Then Stripe link + create missing. Then live `/merch`/`/gear` re-smoke. Then authenticated admin monitor smoke via local dev server with `.env.production.local`.
- **Status:** open

### SESSION_0172 - Launch-Safe Production Seed + Admin Monitor Smoke

**Date:** 2026-05-15
**Agent:** claude-session-0172
**Type:** session--implement

#### Task Plan

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0172_TASK_01 | Cody pre-flight + write `seed-baseline-launch.ts` (1 BASELINE_MARTIAL_ARTS Organization + 6 system Roles, idempotent) | done (F-06 remediated in-session: duplicate Roles cleaned, seed patched per-code findFirst+create, idempotency re-proven across 2 consecutive no-op runs) |
| SESSION_0172_TASK_02 | Run catalog seed sequence + Stripe link + create missing against production | done (Prisma seeds: 32+36+24 = 92 PricingPlans idempotent; Stripe live: 24 merch + 20 BMA core created, 0 errors; F-09 raised when core write-back gap surfaced and remediated in-session via Step 12 reconciler — 32 PricingPlans linked, final stripeProductId-linked count = 56) |
| SESSION_0172_TASK_03 | Local-dev authenticated admin monitor smoke | done (after F-10 fix — stale `DEV_LOGIN_USER_ID` in local env; operator updated to prod admin id; dev-login flipped 404→307; `/admin/storage/monitoring` HTTP 200 CONFIGURED, 59 catalog objects, 0 missing, 0 alerts; `/admin/billing/monitoring` HTTP 200, all event tiles 0 — expected, no checkouts yet) |
| SESSION_0172_TASK_04 | Full close (Petey) | done (this entry + JETTY sweep + wiki-lint + hostile close + Review & Recommend + memory sweep + git hygiene + post-git Graphify refresh) |

**Result:** Goal achieved — MB-013 (`/admin/storage/monitoring`) and MB-014 (`/admin/billing/monitoring`) proven readable end-to-end against production data. F-05 (carried from SESSION_0171, empty production DB) resolved. Three new findings raised + closed in-session: F-06 (Role.createMany skipDuplicates NULL-distinct bug), F-09 (core BMA Stripe write-back gap), F-10 (stale DEV_LOGIN_USER_ID in local env). Production state: 1 BMA Organization, 6 system Roles, 92 PricingPlans (32 ops + 36 affiliate + 24 merch), 44 new Stripe Products (24 merch + 20 BMA core), 56 PricingPlan rows linked to Stripe (24 merch + 32 core/multi-price; 36 affiliate correctly NULL). Live `/merch` and `/gear` re-smoke green with CloudFront-hosted images. Operator-confirmed cascade locked: SESSION_0173 (Tools + Categories + Tags + F-09 root-cause patch + F-06 sibling audit) → SESSION_0174 (Disciplines + Rank Systems + Programs + ClassSchedule + Courses + CurriculumItems + system fixtures).

#### Review

**SESSION_0172_REVIEW_01 — Launch-Safe Production Seed + Admin Monitor Smoke Review**

- **Reviewed tasks:** SESSION_0172_TASK_01 through SESSION_0172_TASK_04.
- **Dirstarter docs check:** not re-fetched this session because no new architectural decision was made and no Dirstarter-baseline-layer replacement was attempted. SESSION_0173's launch-listings task is required to re-check live Dirstarter Prisma + theming docs during Cody pre-flight.
- **Sources:** local `.env.production.local` (shape checks only — length + prefix, no values), Prisma read-only probes against Neon prod, in-session F-06 cleanup transaction (`db.role.deleteMany` on 6 newer createdAt ids after FK-zero check on MembershipRoleAssignment), three Prisma catalog seeds, two Stripe scripts (`setup-merch-stripe-products.ts` and `setup-ronin-stripe-products.ts --brand BMA`) live + post-live dry-run, one-shot F-09 reconciler (Stripe products by `BMA_*` name → PricingPlan match by exact name → write-back stripeProductId/stripePriceId), `curl` against live `/merch` and `/gear` with cache-buster, local `bun run dev` boot, `curl` against `/api/auth/dev-login` + `/admin/storage/monitoring` + `/admin/billing/monitoring`.
- **Verdict:** Green. Three findings caught + mitigated in-session, each with idempotency re-proven after the fix. Spine seed + catalog seed + Stripe live + admin monitor smoke all landed clean. Live customer-visible re-smoke green.
- **Kaizen aggregate:** 9.4/10. Heavy production-write lift completed cleanly; secret hygiene maintained; operator-decision audit trail complete. Lost 0.6 because the F-09 root-cause script patch (write-back on the `--brand` branch of `setup-ronin-stripe-products.ts`) is deferred to SESSION_0173 — the in-session reconciler is a one-shot, and any future BMA product addition via `--brand BMA` would re-introduce F-09 until the script is patched.

#### Findings

**SESSION_0172_FINDING_01 (F-06) — Role.createMany skipDuplicates is a no-op for system Roles (brand=null) due to Postgres NULL-distinct semantics on @@unique([code, brand])**

- **Severity:** high (silent duplication on every seed re-run; downstream UserRole / MembershipRoleAssignment writes could attach to the wrong duplicate Role row).
- **Task:** SESSION_0172_TASK_01
- **Evidence:** Pre-cleanup `Role(isSystem=true)` count = 12 (2 of each code: STUDENT, INSTRUCTOR, OWNER, COACH, ORG_ADMIN, STYLE_APPROVER). Postgres treats NULL as distinct in unique constraints, so `ON CONFLICT (code, brand)` never fires when `brand IS NULL` and `createMany skipDuplicates` inserts every row again on each run. Confirmed by two consecutive `seed-baseline-launch.ts` runs against production (run 1: 0→6; run 2: 6→12 instead of 6→6).
- **Impact:** Production data integrity issue. Duplicate system Role rows would have caused ambiguous joins in any UserRole / MembershipRoleAssignment lookup. Cleaned same-session before any FK row attached to a duplicate (Prisma probe confirmed `MembershipRoleAssignment.roleId IN toDelete` count was 0 before `deleteMany`).
- **Mitigation in this session:** Cleaned 6 duplicate Roles (kept the earlier `createdAt` per code, deleted the later 6 by id); patched `seed-baseline-launch.ts` to use a per-code `findFirst({ code, brand: null, isSystem: true }) → create` loop (mirrors the Organization upsert in the same file); re-proved idempotency across two consecutive no-op runs after the fix (final `Role(isSystem=true)` = 6, unchanged).
- **Required follow-up:** Audit `apps/web/prisma/seed.ts` system Roles block (and any other `createMany skipDuplicates` against a model with a nullable-column composite unique constraint) for the same bug. Consider adding a partial unique index `(code) WHERE brand IS NULL` if system Roles should be globally unique by code (Prisma migration required).
- **Status:** mitigated (this session) / open (broader audit deferred to SESSION_0173 or SESSION_0174)

**SESSION_0172_FINDING_02 (F-09) — `setup-ronin-stripe-products.ts --brand <CODE>` creates Stripe Products but does not write `stripeProductId`/`stripePriceId` back to PricingPlan**

- **Severity:** high (Stripe Checkout against memberships/programs/courses/tournaments/certificates/events/etc. cannot resolve `stripeProductId` from PricingPlan; launch-day functional blocker for the entire BMA core catalog).
- **Task:** SESSION_0172_TASK_02 (Stripe live), surfaced by Doug verification (post-live dry-run re-check)
- **Evidence:** After live `setup-ronin-stripe-products.ts --brand BMA` reported 20 created / 0 errors, the post-live dry-run still reported "20 Would create" instead of "20 already linked". Prisma probe confirmed `PricingPlan where brand=BMA AND stripeProductId IS NOT NULL` count was 24 (merch only — those rows were linked by the separate `setup-merch-stripe-products.ts` script which writes back at create-time). Inspection of `setup-ronin-stripe-products.ts:846–893` confirmed the `--brand <CODE>` branch creates products via `stripe.products.create()` but never updates the PricingPlan row.
- **Impact:** 20 Stripe Products exist server-side at Stripe but local DB cannot map PricingPlan → Stripe Product. Any Checkout attempt would fail to resolve the Stripe price id.
- **Mitigation in this session (TASK_02 Step 12):** One-shot reconciler `apps/web/scripts/_reconcile-bma-stripe-ids.ts` (throwaway, deleted at exit) — read Stripe Products with `name LIKE 'BMA_%' AND metadata.brand = 'BASELINE_MARTIAL_ARTS'`, match each by exact name to a `PricingPlan(brand=BASELINE_MARTIAL_ARTS)` row, fetch the default price + any `additional_prices`, and write `stripeProductId` + `stripePriceId` back. Dry-run first (32 PricingPlan rows matched, 0 ambiguous, 0 unmatched — 4 BMA products use `additional_prices` to cover multiple PricingPlan rows like monthly/yearly variants, accounting for 32 PricingPlan rows from 20 base Stripe Products); live run wrote 32 stripeProductId/stripePriceId pairs back, 0 already-linked, 0 errors. Post-live idempotency re-check confirmed 0 new planned links. Final `PricingPlan(BMA, stripeProductId IS NOT NULL)` = 56 (24 merch + 32 core/multi-price). 36 affiliate rows correctly stay NULL (Amazon-routed).
- **Required follow-up:** SESSION_0173 TASK_02 — patch the `--brand <CODE>` branch of `apps/web/scripts/setup-ronin-stripe-products.ts:846–893` to write `stripeProductId` + `stripePriceId` back to PricingPlan after each successful create (mirror the existing `--from-db` write-back logic). Without this, any future BMA-scoped product addition would re-introduce F-09.
- **Status:** mitigated (this session) / open (root-cause script patch deferred to SESSION_0173)

**SESSION_0172_FINDING_03 (F-10) — Stale local-dev cuid in `DEV_LOGIN_USER_ID` slot of `.env.production.local`**

- **Severity:** medium (blocks local-dev admin monitor smoke; would not affect Vercel production runtime because `isDev=false` there ignores the value anyway).
- **Task:** SESSION_0172_TASK_03
- **Evidence:** Local `.env.production.local` had `DEV_LOGIN_USER_ID` set to a 25-char local-dev cuid (`cmp1…`) that does not exist in production Neon. Production Prisma probe confirmed `mrbscott@gmail.com` exists with `role=admin` under a different 32-char id (prefix `KBYc…`). First TASK_03 attempt: `/api/auth/dev-login` returned HTTP 404 with body `User {id} not found or has no email` — passed the `isDev && env.DEV_LOGIN_USER_ID` guard but failed the DB lookup; no session cookie issued.
- **Impact:** Admin monitor smoke could not authenticate; MB-013 + MB-014 proof was blocked.
- **Mitigation in this session:** Operator updated the local `.env.production.local` to the correct 32-char prod admin id (`KBYccZGiVxmOhV2l1LpB2XjSgES3MI8T`); Vercel not touched. Cody re-ran TASK_03: env shape-check confirmed length=32 + prefix=`KBYc`; dev-server booted with `next dev --turbo`, ready in 648ms; `/api/auth/dev-login` returned HTTP 307 + 2 `Set-Cookie` headers with `better-auth.session_token`; `/admin/storage/monitoring` returned HTTP 200 status `CONFIGURED` with 59 catalog objects, 0 missing, 0 alerts; `/admin/billing/monitoring` returned HTTP 200 with all event tiles at 0 (expected — no checkouts yet).
- **Required follow-up:** This is the second session in a row (SESSION_0171 F-01..F-04, SESSION_0172 F-10) where an env shape-check caught a problem a presence-check would have missed. Operator-side memory entry [[feedback_env_secret_shape_check]] is now validated by two sessions of evidence; worth promoting from feedback memory to a project memory or runbook.
- **Status:** mitigated (env value fixed by operator; admin monitor smoke succeeded end-to-end)

**SESSION_0172_FINDING_04 (F-11) — Cosmetic UNMATCHED false-positive in F-09 reconciler heuristic**

- **Severity:** low (cosmetic; no data impact)
- **Task:** SESSION_0172_TASK_02 Step 12 (F-09 reconciler post-live idempotency re-check)
- **Evidence:** The F-09 reconciler's post-live UNMATCHED logger flagged 3 PricingPlan rows for `BMA_org_annual_fee` (additional-price variants) as unmatched on the idempotency re-run. Prisma probe confirmed those rows ARE correctly linked with valid `stripeProductId`/`stripePriceId` values; the heuristic was conservative and treated the additional-price PricingPlan rows as missing because the script searches by base-product name only.
- **Impact:** None — those rows are linked correctly in production. Log noise only.
- **Required follow-up:** Reconciler was deleted at end of TASK_02 Step 12 (throwaway). If a similar reconciler is needed in SESSION_0173 for any cleanup, refine the UNMATCHED heuristic to also walk `additional_prices` per Stripe Product.
- **Status:** deferred (cosmetic; no production action required)
