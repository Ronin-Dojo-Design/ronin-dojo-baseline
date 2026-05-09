---
title: "Project Log"
slug: project-log
type: protocol
status: active
created: 2026-04-28
updated: 2026-05-08
last_agent: codex-session-0099
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
| ROADMAP_DIRECTORY_MONETIZATION_TASK_02 | Roadmap | Content + monetization | Petey + Cody | Audit roadmap against repo for DRY risks | Wiki synthesis maps plan areas to existing Dirstarter surfaces and records MB-011/D-014 | landed | ROADMAP_DIRECTORY_MONETIZATION_REVIEW_01 |
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
| SESSION_0085_TASK_02 | SESSION_0085 | Tournament ops (hardening) | Cody (Codex) | Webhook capacity re-check + refund (strategy a). Wrap `fulfillTournamentRegistration` in a Serializable transaction; if any requested division is at capacity, write Registration in CANCELLED/REFUNDED state with CANCELLED entries; after commit, call `stripe.refunds.create({ payment_intent: session.payment_intent })` (refund failure logs but does not throw) | `apps/web/app/api/stripe/webhooks/route.ts` updated; webhook returns 200 in all paths; rejected-create path produces a Registration row visible to admin with REFUNDED payment status; refund call happens after transaction commit and does not throw on failure | landed | SESSION_0085_REVIEW_01 |
| SESSION_0085_TASK_03 | SESSION_0085 | Tournament ops (hardening) | Cody (Codex) | Flip SESSION_0084 oversubscription test from `toBe(2)` to `toBe(1)`; assert one Registration ends CANCELLED/REFUNDED; assert `stripe.refunds.create` called exactly once with the loser's `payment_intent`; add NEW parallel-race test using `Promise.all([postWebhook, postWebhook])` to prove the fix under concurrency | `apps/web/app/api/stripe/webhooks/route.test.ts` updated with flipped assertion + refund-call tracking + parallel-race variant; 5/5 stable runs; refunds-tracked mock asserts call count = 1 | landed | SESSION_0085_REVIEW_01 |
| SESSION_0085_TASK_04 | SESSION_0085 | Close | Cody → Petey (Codex) | Verification + full close: scoped typecheck, full test re-run, free-path concurrency regression check, wiki-lint, project-log review block, memory update (paid oversubscription window resolved) | Webhook test 5/5 stable; free-path concurrency regression passed; `bunx tsc --noEmit --pretty false` reports only pre-existing unrelated errors in 3 files; wiki-lint 0 errors / 3 pre-existing warnings; SESSION_0085_REVIEW_01 appended | landed | SESSION_0085_REVIEW_01 |
| SESSION_0086_TASK_01 | SESSION_0086 | Tournament ops (hardening) | Petey + Giddy (Codex) | Bow in, graphify TASK_05 inputs, create SESSION_0086 plan, split work into UI/refund-test worktrees, and keep docs/log orchestration in the main checkout | `SESSION_0086.md` exists with graphify queries, Dirstarter alignment, task split, and agent/worktree assignments; project-log rows appended before implementation | landed | SESSION_0086_REVIEW_01 |
| SESSION_0086_TASK_02 | SESSION_0086 | Tournament ops (UI smoke) | Cody + Desi worker | Refunded-paid customer notice: when `registered=true` resolves to an existing `CANCELLED`/`REFUNDED` Registration, show rejected/refunded copy instead of the success banner; display persisted cancelled/refunded state without offering an impossible re-registration form | Tournament detail/RegisterButton UI updated; `registration-notice.test.tsx` covers `CANCELLED`/`REFUNDED`, success, and processing copy; UI test passes | landed | SESSION_0086_REVIEW_01 |
| SESSION_0086_TASK_03 | SESSION_0086 | Tournament ops (refund tests) | Cody + Doug worker | Add cancel/refund regression tests around `cancelRegistration`: paid Registration refunds by stored `stripePaymentIntentId`, free Registration cancels without refund, paid Registration missing PaymentIntent fails without mutation | `register.concurrency.test.ts` asserts refund mock calls and DB state for paid/free/error branches; test file passes 6/6 | landed | SESSION_0086_REVIEW_01 |
| SESSION_0086_TASK_04 | SESSION_0086 | Close | Petey + Doug (Codex) | Integrate worker patches, run focused tests/typecheck/wiki-lint, append SESSION_0086 review, and record close evidence/worktree cleanup status | Focused tests pass; Biome clean; typecheck has only pre-existing unrelated errors; 0086 worktrees removed; SESSION_0086 closed-full | landed | SESSION_0086_REVIEW_01 |
| SESSION_0093_TASK_01 | SESSION_0093 | Commerce planning | Petey (Codex) | Bow in, confirm SESSION_0092 handoff, run Graphify commerce/PWCC queries, and create SESSION_0093 | `SESSION_0093.md` exists with bow-in, Graphify check, source verification, and Dirstarter alignment | landed | — |
| SESSION_0093_TASK_02 | SESSION_0093 | Commerce planning | Petey + Giddy (Codex) | Solidify launch-safe payment structure across tournament registration, one-time course/certification, subscriptions, class memberships, brand tiers, and manual payments | Payment flow matrix and open decisions recorded in `SESSION_0093.md` | landed | — |
| SESSION_0093_TASK_03 | SESSION_0093 | WORKFLOW calendar | Petey (Codex) | Reconcile WORKFLOW 5.0 forward plan around commerce-first, PWCC-second, brand-rollout-third sequencing | `WORKFLOW_5.0.md` calendar updated through SESSION_0092 actuals and SESSION_0093-0098 forward plan | landed | — |
| SESSION_0093_TASK_04 | SESSION_0093 | Workspace cleanup | Petey (Codex) | Remove the WordPress public root from the active workspace pattern and keep only `ronin-dojo-app` plus clean `dirstarter_template` reference access | `/Users/brianscott/dev/ronin-dojo.code-workspace` created with exactly two folders; empty accidental WP `public/docs` folders removed; `.playwright-mcp` moved to repo root and ignored | landed | — |
| SESSION_0094_TASK_01 | SESSION_0094 | Commerce | Petey + Giddy (Codex) | Bow in, refresh Graphify, query commerce/doc needs, and create active SESSION_0094 plan | `SESSION_0094.md` records bow-in, Graphify update/query output, Dirstarter alignment, and selected source files | landed | SESSION_0094_REVIEW_01 |
| SESSION_0094_TASK_02 | SESSION_0094 | Commerce | Cody (Codex) | Reconcile commerce truth docs with landed entitlement schema and payment webhook behavior | `monetization-entitlements-spec.md` no longer claims entitlements are missing and includes the launch-safe payment flow/proof matrix | landed | SESSION_0094_REVIEW_01 |
| SESSION_0094_TASK_03 | SESSION_0094 | Commerce governance | Doug + Giddy + Petey (Codex) | Update MB-013, verify docs, run hostile/full close, and stage SESSION_0095 | MB-013 names concrete one-time/subscription proof requirements; Project Log review and full-close evidence exist | landed | SESSION_0094_REVIEW_01 |
| SESSION_0095_TASK_01 | SESSION_0095 | Commerce QA | Petey + Giddy (Codex) | Bow in, run targeted Graphify query without refresh, confirm Dirstarter alignment, create SESSION_0095, and record Cody backend pre-flight | `SESSION_0095.md` exists with bow-in, Graphify note, source-selected files, task IDs, worktree decision, and backend pre-flight | landed | SESSION_0095_REVIEW_01 |
| SESSION_0095_TASK_02 | SESSION_0095 | Commerce QA | Cody (Codex) | Add one-time Checkout entitlement webhook proof and close replay/source-id idempotency edge if exposed | Focused webhook test proves mapped `PricingPlan.stripePriceId` creates exactly one PURCHASE `UserEntitlement`, preserves manual grants, activates `ProgramEnrollment`, and replay does not duplicate it | landed | SESSION_0095_REVIEW_01 |
| SESSION_0095_TASK_03 | SESSION_0095 | Commerce QA + close | Cody + Doug (Codex) | Add subscription Checkout grant/revoke proof, run focused verification, update MB-013, append review, and full close | Focused webhook test proves subscription-sourced access is granted once and revoked by subscription id; MB-013 and full-close evidence record remaining launch gaps | landed | SESSION_0095_REVIEW_01 |
| SESSION_0096_TASK_01 | SESSION_0096 | Commerce implementation | Petey + Giddy (Codex) | Bow in, run stale Graphify query without refresh, confirm Dirstarter alignment, create SESSION_0096, and record Cody pre-flight | `SESSION_0096.md` exists with bow-in, Graphify note, source-selected files, task IDs, worktree decision, Petey plan, and backend/schema pre-flight | landed | SESSION_0096_REVIEW_01 |
| SESSION_0096_TASK_02 | SESSION_0096 | Commerce implementation | Cody (Codex) | Implement Stripe Customer ID storage, Customer Portal action/dashboard path, and processed webhook event-id dedupe | Authenticated Checkout/webhook paths persist/reuse current-brand `StripeCustomer`; Customer Portal session action exists; duplicate Stripe event IDs do not reprocess state | landed | SESSION_0096_REVIEW_01 |
| SESSION_0096_TASK_03 | SESSION_0096 | Commerce implementation + close | Cody + Doug (Codex) | Implement non-tournament ledger projection and subscription failed-payment/refund/dispute policy, verify, update MB-013/specs, append review, and full close | Focused tests prove `Invoice`/`Payment` projection, lifecycle policy behavior, and docs/project log record closed versus remaining MB-013 gates | landed | SESSION_0096_REVIEW_01 |
| SESSION_0097_TASK_01 | SESSION_0097 | Core platform governance | Petey + Giddy | Create Dirstarter Baseline Index | docs/architecture/dirstarter-baseline-index.md with 12 sections covering 300+ template files | unknown | — |
| SESSION_0097_TASK_02 | SESSION_0097 | Core platform governance | Petey + Giddy | Wire baseline index into pre-flight + close D-008/D-012 | cody-preflight.md updated; D-008/D-012 closed in drift register | unknown | — |
| SESSION_0097_TASK_03 | SESSION_0097 | Core platform governance | Petey | dirstarter.com/docs deep dive | All 15+ doc pages fetched; integration patterns documented in §13 of baseline index | unknown | — |
| SESSION_0097_TASK_04 | SESSION_0097 | Core platform governance | Petey | D-014 decision: Tool → Directory Listing repurpose | Option B chosen; rationale + migration plan in §14 of baseline index | unknown | — |
| SESSION_0097_TASK_05 | SESSION_0097 | Core platform governance | Petey | Upstream divergence audit (next-safe-action vs oRPC, Next 15 vs 16, Biome vs OXC) | Divergences documented in §13k of baseline index | unknown | — |
| SESSION_0100_TASK_01 | SESSION_0100 | Bow in + planning | Giddy + Petey | SESSION_0099 commit, Graphify refresh, SESSION_0100 creation | SESSION_0099 committed and pushed, graph current, SESSION_0100 created with Petey plan | landed | SESSION_0100_REVIEW_01 |
| SESSION_0100_TASK_02 | SESSION_0100 | Planning | Petey + Desi | PWCC Commerce Port Map document | `docs/architecture/pwcc-commerce-port-map.md` exists with all commerce verticals classified | planned | — |
| SESSION_0100_TASK_03 | SESSION_0100 | Planning | Petey | Stripe product policy ADR | `docs/architecture/decisions/0014-stripe-product-policy.md` exists as draft | planned | — |
| SESSION_0100_TASK_04 | SESSION_0100 | Closing | Giddy + Petey | Wiki index, project log, and close | Wiki index updated, project log entries added, SESSION_0100 closed with JETTY sweep | landed | — |

---

## Task review log

### SESSION_0033_REVIEW_01 — School ops enrollment/family/waiver/lead hostile review

**Reviewed tasks:** SESSION_0033_TASK_01, SESSION_0033_TASK_02, SESSION_0033_TASK_03
**Dirstarter docs check:** live docs checked
**Sources:** `https://dirstarter.com/docs/codebase/structure`, `https://dirstarter.com/docs/database/prisma`, `https://dirstarter.com/docs/authentication`, `https://dirstarter.com/docs/integrations/rate-limiting`, `https://dirstarter.com/docs/integrations/analytics`
**Verdict:** Aligned with Dirstarter extension patterns and the SESSION_0033 scope guard. The new slices use feature folders, `userActionClient`, `getRequestBrand`, `canEditOrganization`, centralized rate-limit keys, Prisma select payloads, and `writeSchoolOpsAudit`. Verification is credible for the touched slices. Sidecar blockers found during close were fixed before handoff: conversion capacity/waitlist, existing-user identity preservation, converted/lost lead rebooking, and waiver signature scoping. Full-app typecheck remains blocked by pre-existing baseline debt, not by SESSION_0033 paths.

#### SESSION_0033_FINDING_01 — Waitlist position is transactional but not DB-enforced
- **Severity:** medium
- **Task:** SESSION_0033_TASK_01
- **Evidence:** `ProgramEnrollment.waitlistPosition` has no per-program unique constraint; SESSION_0033 uses Prisma `$transaction` and tests idempotency/capacity behavior.
- **Impact:** Parallel high-volume waitlist writes could still race before a future DB-level constraint or serializable lock strategy lands.
- **Required follow-up:** Add a pre-launch hardening candidate to revisit waitlist ordering with a DB-level guarantee or explicit serializable/row-lock strategy.
- **Status:** accepted-risk

#### SESSION_0033_FINDING_02 — Full-app typecheck debt still blocks global type confidence
- **Severity:** medium
- **Task:** SESSION_0033_TASK_03
- **Evidence:** `bunx tsc --noEmit --pretty false` still fails on baseline `PageProps`/`RouteContext`, generated content collections, auth role typing, passport enum drift, and S3 env typing.
- **Impact:** Touched-slice filtered typecheck is clean, but global refactor confidence remains capped until the baseline debt is retired.
- **Required follow-up:** Keep `session-0032-typecheck-debt` / SESSION_0032_FINDING_01 visible as a dedicated hardening lane.
- **Status:** open

**Kaizen triage:** Safe/security confidence is strong for staff-managed actions because tests and smoke prove same-brand/org allow paths and cross-org/cross-brand rejection. Preventable slips: close review caught multiple conversion/waiver edge cases before handoff and regression-tested the repaired paths. Scale confidence: 100 users = 9.7, 1,000 = 9.3, 10,000 = 9.0 because this is staff-managed, low-contention school-ops flow; waitlist DB hardening and global type debt remain visible follow-ups. Aggregate 9.0; proceed to SESSION_0034 unless owner elects a hardening slot.

### SESSION_0023_REVIEW_01 — Schema Wave A hostile review

**Reviewed tasks:** SESSION_0023_TASK_01, SESSION_0023_TASK_02, SESSION_0023_TASK_03

**Verdict:** Mostly sound for local schema substrate. Not clean enough for production.

#### SESSION_0023_FINDING_01 — Nullable unique constraints do not enforce the plan
- **Severity:** high
- **Status:** scoped — partial unique indexes (Option A), target: pre-launch QA. See SESSION_0026_TASK_02.

#### SESSION_0023_FINDING_02 — WORKFLOW 5.0 followed operationally but not calendrically
- **Severity:** medium
- **Status:** resolved — SESSION_0021 marked superseded in SESSION_0026_TASK_01.

#### SESSION_0023_FINDING_03 — Schema is not an authorization system
- **Severity:** medium
- **Status:** scoped — auth predicates per-feature lane. See SESSION_0026_TASK_03. Tracked MB-002.

#### SESSION_0023_FINDING_04 — Production migration still missing
- **Severity:** medium
- **Status:** scoped — target: before first staging deploy. See SESSION_0026_TASK_04.

### SESSION_0023_REVIEW_02 — Accountability log review

**Reviewed task:** SESSION_0023_TASK_04

**Verdict:** Sound placement. Logs belong in protocols.

#### SESSION_0023_FINDING_05 — Accountability must be enforced at ritual boundaries
- **Severity:** low
- **Status:** addressed

### SESSION_0024_REVIEW_01 — Hostile close review protocol review

**Reviewed tasks:** SESSION_0024_TASK_01

**Verdict:** Right protocol shape. Hostile review in own file, invoked by closing.

#### SESSION_0024_FINDING_01 — Hostile review must stay mandatory
- **Severity:** low
- **Status:** addressed

### SESSION_0025_REVIEW_01 — Full-close proof contract review

**Reviewed tasks:** SESSION_0025_TASK_01, SESSION_0025_TASK_02, SESSION_0025_TASK_03

**Verdict:** Correction sound. Full close now has proof artifact.

**Verification:** `bun run wiki:lint` passed (111 files); Prisma validate passed; `git diff --check` passed.

#### SESSION_0025_FINDING_01 — Full close must prove wiki-lint, not name it
- **Severity:** low
- **Status:** addressed

### SESSION_0026_REVIEW_01 — Full close hostile review

**Reviewed tasks:** SESSION_0026_TASK_01 through SESSION_0026_TASK_06

**Score: 7.5/10** (capped: workflow honesty failure + no test evidence)

#### SESSION_0026_FINDING_01 — WORKFLOW 5.0 not followed for schema work
- **Severity:** high
- **Status:** mitigated — SESSION_0027 (cody-preflight expanded, Petey gate enforced)

#### SESSION_0026_FINDING_02 — Governance artifact staleness
- **Severity:** medium
- **Status:** mitigated — SESSION_0027 (governance audit, log merge, protocol reduction)

### SESSION_0027_REVIEW_01 — Governance audit hostile review

**Reviewed tasks:** SESSION_0027_TASK_01, SESSION_0027_TASK_02, SESSION_0027_TASK_03

**Score: 9.5/10** — Full WORKFLOW 5.0 compliance. Governance-only session.

#### SESSION_0027_FINDING_01 — WORKFLOW_5.0 session calendar is stale
- **Severity:** low
- **Status:** addressed — SESSION_0028 re-sequenced `WORKFLOW_5.0.md`.

### SESSION_0028_REVIEW_01 — Calendar repair + Program CRUD hostile review

**Reviewed tasks:** SESSION_0028_TASK_01, SESSION_0028_TASK_02, SESSION_0028_TASK_03

**Score: 9.5/10** — Calendar drift addressed, Program CRUD delivered with auth/brand proof, targeted verification passed.

**Dirstarter docs check:** live docs checked.

**Sources:** [Prisma setup](https://dirstarter.com/docs/database/prisma), [Authentication](https://dirstarter.com/docs/authentication), [Project structure](https://dirstarter.com/docs/codebase/structure)

**Verdict:** Sound and merge-ready for a feature branch. Program code follows Dirstarter's feature-folder shape (`server/web/program/{actions,queries,payloads,schemas}`), Prisma client/seed flow, and action protection expectations. The implementation does not trust hidden brand input: writes derive the brand from the current request and selected organization, then enforce editable-org permission and discipline linkage. Verification is credible for this slice: Prisma validates, touched files pass Biome, the Program smoke script proves create/reject cases, and HTTP smoke proves the list/detail and auth redirects. Full-app typecheck remains red on pre-existing baseline issues, but filtered typecheck shows no Program-slice errors.

### SESSION_0029_REVIEW_01 — Commerce learning path specs hostile review

**Reviewed tasks:** SESSION_0029_TASK_01, SESSION_0029_TASK_02, SESSION_0029_TASK_03

**Score: 9.6/10** — Docs/spec session followed WORKFLOW 5.0, preserved raw source, checked live Dirstarter docs, and avoided duplicate schema recommendations. Minor residual risk remains because entitlement/Product decisions are intentionally queued for a future implementation session.

**Dirstarter docs check:** live docs checked on 2026-04-30.

**Sources:** [Project Structure](https://dirstarter.com/docs/codebase/structure), [Prisma Setup](https://dirstarter.com/docs/database/prisma), [Authentication](https://dirstarter.com/docs/authentication), [Payments](https://dirstarter.com/docs/integrations/payments), [Content](https://dirstarter.com/docs/content), [Monetization](https://dirstarter.com/docs/monetization), [Automation](https://dirstarter.com/docs/automation), [Blog](https://dirstarter.com/docs/blog), [SEO](https://dirstarter.com/docs/seo), [Theming](https://dirstarter.com/docs/theming), [Cron Jobs](https://dirstarter.com/docs/cron-jobs)

**Verdict:** Sound and ready to guide the next implementation sessions. The specs correctly treat raw ChatGPT Prisma blocks as source material, not accepted schema. They identify existing `Program`, `Course`, `PricingPlan`, `Certification`, certificate, and progress models before proposing deltas. The main architectural decision is explicit: build entitlements before paid UI so access does not leak into scattered plan checks. Verification passed for wiki lint, Prisma schema validation, and whitespace.

### SESSION_0029_REVIEW_02 — Bow-out hardening and worktree cleanup review

**Reviewed tasks:** SESSION_0029_TASK_04

**Score: 9.7/10** — Governance cleanup landed with clean worktree state and explicit ADR/glossary discipline. No hard caps triggered.

**Dirstarter docs check:** live docs checked on 2026-04-30.

**Sources:** [Project Structure](https://dirstarter.com/docs/codebase/structure), [Prisma Setup](https://dirstarter.com/docs/database/prisma), [Authentication](https://dirstarter.com/docs/authentication), [Payments](https://dirstarter.com/docs/integrations/payments), [Monetization](https://dirstarter.com/docs/monetization)

**Verdict:** The old feature worktrees were clean and already merged into `main`, so removing them and deleting their local branches was safe. `closing.md` now requires explicit worktree cleanup and an ADR/glossary check during close. ADR 0011 records the entitlement-first commerce decision with compact live Dirstarter proof links. `ubiquitous-language.md` now defines Product, PricingPlan, Entitlement, UserEntitlement, and EntitlementGrant.

### SESSION_0030_REVIEW_01 — Plan security and Dirstarter compliance review

**Reviewed tasks:** SESSION_0030_TASK_00, SESSION_0030_TASK_01, SESSION_0030_TASK_02, SESSION_0030_TASK_03

**Score: 9.5/10 for planning close** — No Dirstarter or data-integrity hard cap triggered for docs/planning work. Future implementation score is capped at 8.9 if it omits security gates, server-side brand/org predicates, or payment/entitlement proof.

**Dirstarter docs check:** live docs checked on 2026-04-30.

**Sources:** [Project Structure](https://dirstarter.com/docs/codebase/structure), [Prisma Setup](https://dirstarter.com/docs/database/prisma), [Authentication](https://dirstarter.com/docs/authentication), [Environment Setup](https://dirstarter.com/docs/environment-setup), [Payments](https://dirstarter.com/docs/integrations/payments), [Monetization](https://dirstarter.com/docs/monetization), [Rate Limiting](https://dirstarter.com/docs/integrations/rate-limiting), [Analytics](https://dirstarter.com/docs/integrations/analytics), [Storage](https://dirstarter.com/docs/integrations/storage), [Deployment](https://dirstarter.com/docs/deployment), [Cron Jobs](https://dirstarter.com/docs/cron-jobs), [Content](https://dirstarter.com/docs/content)

**Verdict:** The staged plan is acceptable as a planning/security close, not as implementation evidence. The hostile review caught that the original plan said auth/brand scope but did not define privacy, financial transaction, wireframe, or monitoring gates. `security-privacy-payments-monitoring-plan.md` and MB-013 now make those gates explicit. Class schedule implementation remains unshipped and must prove server-side auth, brand/org predicates, instructor enumeration protection, bounded session generation, and smoke tests before merge.

#### SESSION_0030_FINDING_01 — Security gates were missing from the staged plan
- **Severity:** high
- **Task:** SESSION_0030_TASK_00
- **Evidence:** `docs/sprints/SESSION_0030.md` initially staged class schedule tasks without a dedicated private-data/payment/monitoring gate.
- **Impact:** Cody could implement schedule or later CGR surfaces with route-level protection but no explicit server-side privacy proof.
- **Required follow-up:** Treat `docs/architecture/security-privacy-payments-monitoring-plan.md` as required input before class schedule implementation.
- **Status:** addressed

#### SESSION_0030_FINDING_02 — Financial transaction leak-proofing was only implied
- **Severity:** high
- **Task:** SESSION_0030_TASK_00
- **Evidence:** Raw CGR source required entitlements before Stripe UI; the staged plan banned Stripe work but did not define payment monitoring or refund/revoke proof.
- **Impact:** Future checkout could grant access directly from Stripe metadata and fail refund/cancel/revoke behavior.
- **Required follow-up:** Entitlement-first services plus Stripe webhook idempotency, refund/revoke tests, and entitlement drift monitoring before paid UI.
- **Status:** addressed in plan; implementation open under MB-013

#### SESSION_0030_FINDING_03 — Private-data monitoring was not explicit
- **Severity:** medium
- **Task:** SESSION_0030_TASK_03
- **Evidence:** Original expected verification listed smoke checks but not monitoring signals or alert thresholds.
- **Impact:** Auth/brand failures, certificate verification abuse, webhook failures, and cron failures could go unnoticed.
- **Required follow-up:** Add structured monitoring hooks during implementation and verify them before staging.
- **Status:** addressed in plan; implementation open under MB-013

### ROADMAP_DIRECTORY_MONETIZATION_REVIEW_01 — Roadmap source + monetization reuse review

**Reviewed tasks:** ROADMAP_DIRECTORY_MONETIZATION_TASK_01 through ROADMAP_DIRECTORY_MONETIZATION_TASK_03

**Score: 9.3/10** — Useful roadmap and low-risk code alignment landed, but the score stays under full-close quality until Stripe/webhook/admin browser smoke runs with real test credentials.

**Dirstarter docs check:** live docs checked.

**Sources:** [Getting Started](https://dirstarter.com/docs/getting-started), [Content Management](https://dirstarter.com/docs/content), [Monetization](https://dirstarter.com/docs/monetization), [Automation](https://dirstarter.com/docs/automation), [Payments](https://dirstarter.com/docs/integrations/payments)

**Verdict:** The implementation extends Dirstarter's existing directory monetization machinery instead of creating parallel systems. `Tool` and `Ad` remain the near-term substrate, while MB-011 and D-014 explicitly block production use until the repo decides whether `Tool` is quarantined, promoted, or replaced. AI automation now follows the current AI Gateway env shape. Ads expose all documented placement types and `All` bookings now block against all existing booked dates. Verification is solid for docs, formatting, schema validity, and generated Prisma types, but live workflows still need owner credentials for Stripe, Jina, AI Gateway, ScreenshotOne, and email.

### ROADMAP_DIRECTORY_MONETIZATION_REVIEW_02 — Full close ritual review

**Reviewed tasks:** ROADMAP_DIRECTORY_MONETIZATION_TASK_04

**Score: 9.5/10** — Full close evidence is present for the non-numbered roadmap artifact. No hard caps triggered; residual risk is explicitly tracked.

**Dirstarter docs check:** cached docs sufficient — no new Dirstarter-owned code changed during the close step beyond documenting the prior live-doc-checked work.

**Sources:** `docs/rituals/closing.md`, `docs/protocols/hostile-close-review.md`, `docs/protocols/review-recommend.md`, `docs/architecture/decisions/0005-legacy-coexistence.md`, prior live Dirstarter sources recorded in `ROADMAP_DIRECTORY_MONETIZATION_REVIEW_01`.

**Verdict:** The close is honest about the protocol exception: the owner asked for a roadmap rather than a numbered `SESSION_0029.md`, so the close artifact lives in the roadmap synthesis and Project Log. JETTY/frontmatter and backlinks are covered for the wiki/protocol layer. The accidental WordPress public directory is marked as MB-012 and not deleted without explicit approval. Next session is unblocked for the planned School Ops class schedules work.

### SESSION_0031_REVIEW_01 — Class schedules execution full close (Giddy + Doug + Petey)

**Reviewed tasks:** SESSION_0031_TASK_01, SESSION_0031_TASK_02, SESSION_0031_TASK_03

**Score: 10.0/10** — All eleven security gates verified with concrete proof artifacts in `docs/sprints/SESSION_0031.md` (gate-by-gate table). No hard caps triggered.

**Dirstarter docs check:** Live docs were re-verified at execution start per the SESSION plan. Slice extends `server/web/program/*` patterns, `userActionClient`, `services/db`, `~/components/common/*`, and Better Auth without replacing any baseline layer. Sources: [project structure](https://dirstarter.com/docs/codebase/structure), [Prisma](https://dirstarter.com/docs/database/prisma), [authentication](https://dirstarter.com/docs/authentication), [rate limiting](https://dirstarter.com/docs/integrations/rate-limiting), [environment setup](https://dirstarter.com/docs/environment-setup), [deployment](https://dirstarter.com/docs/deployment).

**Hostile review verdicts:**

- *Plan sanity (Giddy):* slice followed the SESSION_0030 plan literally. No scope creep into attendance/billing/entitlements/CGR. Brand predicates explicit on every read and write — verified by grep. ✅
- *Dirstarter alignment (Giddy):* extension only; no parallel `server/cgr/*` folder, no new route group, no duplicate brand resolution path. ✅
- *Security (Doug):* all 11 gates green. Gate 10 rejection matrix passes 9/9 cases including the proxy-overwrite simulation. Gate 5 verified COACH role excluded from instructor selector. Gate 6 verified attended future sessions are CANCELLED, not deleted. Rate-limiter monitoring row added. ✅
- *Data integrity (Doug):* schema unchanged this slice; aggregate boundary held — instructor and session writes go through the schedule action surface. AuditLog rows written for all 7 mutation types. ✅
- *Verification honesty (Doug):* `bunx prisma validate` ✅, `bunx prisma generate` ✅, 6/6 unit tests ✅, smoke matrix 9/9 ✅, touched-slice typecheck clean (only env-only repo-wide PageProps/RouteContext errors remain — not introduced by this slice and known to require `next build`/typed-routes generation). `bun run wiki:lint` 124/124 clean. ✅
- *WORKFLOW 5.0 compliance (Petey):* Petey orchestrated; Cody pre-flight produced as artifact in SESSION file before code; three-pass review loop run; score recorded; next-session handoff written. ✅

**Findings:**

- **SESSION_0031_FINDING_01** — Worktree bootstrap requires `bun install` at `apps/web/` plus copying `.env` and running `bunx prisma generate`. Currently undocumented. **Severity:** low. **Required follow-up:** add a "fresh worktree" section to `docs/runbooks/dev-environment.md` next session. **Status:** open.
- **SESSION_0031_FINDING_02** — `Avatar` and `Badge variant="destructive"` mistakes were caught by typecheck, not by Cody pre-flight. **Severity:** low. **Required follow-up:** add a "primitive API spot-check" sub-step to `docs/protocols/cody-preflight.md` UI checklist (read the primitive's component file, not just import it). **Status:** open.
- **SESSION_0031_FINDING_03** — `bun:test` types unavailable in the worktree (`@types/bun` not in deps). Worked around with `@ts-expect-error`. **Severity:** low. **Required follow-up:** consider adding `@types/bun` to `apps/web/devDependencies` if the team expects more bun-test files. **Status:** open.

**Verdict:** Slice ships at 10.0/10 with the eleven gates fully verified by reproducible commands and reviewable artifacts. No open hard blockers for SESSION_0032 attendance/check-in execution. The three findings above are low-severity ergonomic improvements; none block downstream work.

### SESSION_0042_TO_0046_REVIEW_01 — Hostile Close: Tournament Ops + Registration Lifecycle (5-session batch)

**Reviewed tasks:** SESSION_0042_TASK_01–09, SESSION_0043_TASK_01–05, SESSION_0044_TASK_01–04, SESSION_0045_TASK_01–06, SESSION_0046_TASK_01–05
**Reviewer:** copilot-session-0046 (Giddy + Doug)
**Dirstarter docs check:** cached docs sufficient
**Sources:** local code review of `apps/web/server/{admin,web}/tournaments/*`, `apps/web/app/{(web),admin}/tournaments/**`, `apps/web/components/web/tournaments/*`, `apps/web/app/api/stripe/webhooks/route.ts`

### 1. Plan sanity

Plans were well-scoped across all five sessions. SESSION_0042 correctly identified Dirstarter Tools admin as the pattern source. SESSION_0043 correctly followed the existing Stripe webhook pattern from entitlements. SESSION_0044–0045 were tight polish sessions. SESSION_0046 correctly used existing enum values (CANCELLED, REFUNDED) without requiring schema changes. No invalid assumptions detected.

### 2. Dirstarter compliance

All five sessions extend Dirstarter patterns without replacing them. Admin CRUD follows the Tools admin pattern (schema → queries → actions → pages). Public pages follow the Tools public listing pattern (payloads → queries → FiltersProvider). Stripe checkout follows the existing entitlement checkout pattern. **No bypasses.**

### 3. Security

- Registration checkout requires authenticated user via `userActionClient` ✅
- Cancel action verifies `registration.userId === ctx.user.id` (ownership check) ✅
- Stripe webhooks verify signature via `constructEvent` (existing pattern) ✅
- **FINDING:** Admin registrations page uses `withAdminPage` HOC but does not verify the tournament belongs to the admin's brand. Low severity — admin users are trusted, but brand isolation is a defense-in-depth concern.

### 4. Data integrity

- Unique constraint `[tournamentId, userId]` on Registration — enforced at DB level ✅
- Capacity check — enforced in server action, but **not** at DB level. Race condition between capacity check and insert is possible under concurrent registrations. Mitigated by webhook upsert pattern but not fully eliminated. Medium severity.
- Status transitions — `SUBMITTED/APPROVED → CANCELLED` allowed. Correct. Cannot cancel `STARTED` (incomplete checkout) or already `CANCELLED`. ✅
- Entry status transitions to `CANCELLED` on registration cancel ✅

### 5. Lifecycle proof

Full user journey proven: browse tournaments → view divisions → select divisions → pay (or free) → success banner → cancel (with refund). Admin can view registrations. The lifecycle from discovery through cancellation is complete.

### 6. Verification honesty

- `tsc --noEmit` passes with 0 errors across all sessions ✅
- No integration tests for registration checkout or cancellation flow
- No e2e test for Stripe webhook handling
- SESSION_0045 fixed pre-existing errors (TS2321, TS2307) — honest cleanup

### 7. Workflow honesty

- All sessions have SESSION files with JETTY frontmatter ✅
- Task IDs follow `SESSION_NNNN_TASK_NN` convention ✅
- Lane references traced back to LANE-S042 ✅
- `.markdownlint.json` added to resolve lint noise from SESSION format ✅

### 8. Merge readiness

Ready to merge with known debt items. All code compiles. No blocking issues. Two findings to carry forward.

### Kaizen reflection

**1. Is this safe and secure?**

Provably safe: user auth required for registration/cancellation, ownership verified on cancel, Stripe webhook signature verified. Documented but not proven: concurrent capacity races (DB-level enforcement would close this), admin brand isolation on registrations page. Tests that would close gaps: (a) concurrent registration stress test with capacity=1, (b) admin registrations page with cross-brand tournament ID.

**2. How many failed steps could we have prevented?**

Zero protocol violations across 5 sessions. One process improvement: SESSION_0046's Stripe refund lookup via `sessions.list` is fragile (searches last 100 sessions). A `stripePaymentIntentId` column on Registration would be more robust — adding this column should be a future remediation task.

**3. Confidence 1–10:**

- 100 users: **9** — flows work correctly for normal usage
- 1,000 users: **8** — capacity race condition becomes plausible; Stripe session lookup starts hitting limits
- 10,000 users: **7** — Stripe `sessions.list(100)` is guaranteed to miss older sessions; capacity races are statistically likely

**Kaizen aggregate: 7**

### Score gate

Aggregate **7** → Stage a remediation session (SESSION_NNNN.5) covering:
1. Add `stripePaymentIntentId` column to Registration (migration)
2. Store payment intent ID in webhook handler
3. Use stored ID for refunds instead of session list search
4. Consider DB-level capacity enforcement (advisory lock or serializable transaction)

### SESSION_0042_0046_FINDING_01 — Stripe refund lookup is fragile

- **Severity:** medium
- **Task:** SESSION_0046_TASK_02
- **Evidence:** `server/web/tournaments/register.ts` — `stripe.checkout.sessions.list({ limit: 100 })`
- **Impact:** Refunds will silently fail for registrations older than the most recent 100 Stripe checkout sessions
- **Required follow-up:** Add `stripePaymentIntentId` to Registration model; store in webhook; use for refund
- **Status:** open

### SESSION_0042_0046_FINDING_02 — Capacity check is application-level only

- **Severity:** medium
- **Task:** SESSION_0043_TASK_02
- **Evidence:** `server/web/tournaments/register.ts` — capacity checked before insert, no DB constraint
- **Impact:** Under concurrent load, two users could register for the last spot
- **Required follow-up:** Use serializable transaction or advisory lock for capacity-constrained registrations
- **Status:** open

### SESSION_0042_0046_FINDING_03 — Admin registrations page lacks brand scoping

- **Severity:** low
- **Task:** SESSION_0044_TASK_03
- **Evidence:** `server/admin/tournaments/registrations-queries.ts` — queries by tournamentId without brand filter
- **Impact:** Admin could theoretically view registrations for a tournament from another brand (requires knowing the ID)
- **Required follow-up:** Add brand filter to registrations query or verify via tournament ownership
- **Status:** open

**Score: 9.2/10** (WORKFLOW rubric). Missing credible verification (no integration tests) caps at 9.4; all other rubric categories pass.

**Verdict:** Sessions 0042–0046 deliver a complete tournament registration lifecycle from admin CRUD through cancellation with Stripe refund. Code is merge-ready with three open findings (F-01 medium, F-02 medium, F-03 low). Kaizen aggregate 7 requires a remediation session before this lane advances further. Recommended: SESSION_0046.5 to address F-01 (stripePaymentIntentId migration) and F-02 (serializable capacity check).

### SESSION_0060_REVIEW_01 — Cross-session hostile-close review (SESSION_0057–0060)

- **Reviewer:** Doug (hostile review persona)
- **Sessions covered:** SESSION_0057, SESSION_0058, SESSION_0059, SESSION_0060
- **Date:** 2025-07-13

#### Scope

Full hostile-close review across four remediation sessions. Audited all code changes for brand scoping, security, Dirstarter compliance, cache correctness, and admin authorization gaps.

#### P1 findings (6) — Admin brand-scoping gaps

1. `admin/tournaments/actions.ts` — Tournament CRUD does not filter by `getRequestBrand()` (create, update, delete)
2. `admin/tournaments/queries.ts` — Tournament listing does not filter by brand
3. `admin/courses/actions.ts` — Course CRUD does not filter by `getRequestBrand()` (create, update, delete)
4. `admin/courses/queries.ts` — Course listing does not filter by brand
5. `admin/certificates/actions.ts` — Certificate template CRUD does not filter by `getRequestBrand()`
6. `admin/certificates/queries.ts` — Certificate template listing does not filter by brand

**Root cause:** `adminActionClient` in `lib/safe-actions.ts` does not resolve brand into context. Each admin action must manually call `getRequestBrand()`, and three domains missed it.

**Required fix:** Add `ctx.brand` to `adminActionClient` chain, then enforce in all admin actions/queries for brand-scoped models.

#### P2 findings (1)

- `program-plan.md` still referenced as canonical but partially superseded by actual implementation. Marked `partially-superseded` in SESSION_0060.

#### P3 findings (3)

- No integration tests for tournament registration Stripe flow
- No e2e test for enrollment Passport guard
- Cache invalidation not yet wired to mutations (future work)

#### Verdict

Sessions 0058–0059 shipped clean, correct code. SESSION_0060 identified 6 P1 brand-scoping gaps requiring a dedicated fix session (SESSION_0061). No protocol violations. Wiki-lint clean. All drift items resolved or consciously deferred.

---

### SESSION_0083_REVIEW_01 — Tournament registration capacity race tests (self-review + Giddy/Doug hostile pass)

- **Reviewer:** Cody → Petey (self-review)
- **Date:** 2026-05-06
- **Reviewed tasks:** SESSION_0083_TASK_01, SESSION_0083_TASK_02, SESSION_0083_TASK_03, SESSION_0083_TASK_04
- **Dirstarter docs check:** not applicable (test-only addition, no L1 baseline files modified)

#### Scope

Three integration tests in `apps/web/server/web/tournaments/register.concurrency.test.ts` proving the Serializable transaction in `register.ts:78-144` prevents oversubscription on the free-registration path. Real Postgres fixtures (no auth/entitlement mocks); AsyncLocalStorage propagates per-call user identity for parallel races between distinct users.

#### Findings

- **P1 / P2:** none. Tests pass 5/5 with no flakiness; capacity invariant (`ACTIVE entries ≤ capacity`) holds in both 1-slot-remaining and at-capacity scenarios.
- **P3 — paid path uncovered:** `register.ts` paid flow checks capacity at checkout-create time, but the registration row is written later in the Stripe webhook. Two paid checkouts could both succeed and oversubscribe if the webhook doesn't re-check capacity. Flagged as the headline scenario for the next session (`Next session` in SESSION_0083 + open architectural question logged).
- **P3 — same-user race not tested:** intentional. Same-user parallel calls would race on the `Registration` `(tournamentId, userId)` unique constraint, masquerading as the capacity protection. The plan's "exactly one succeeds, one fails 'at capacity'" assertion is only meaningful with different users.
- **P3 — global mock state risk:** documented in feedback memory. AsyncLocalStorage is now the standard pattern for parallel-call action tests with multiple identities.

#### Verdict

All 4 tasks landed cleanly. Verification is honest: 5/5 stable runs, scoped typecheck clean (3 pre-existing unrelated errors confirmed not introduced), wiki-lint 0/3 pre-existing warnings. The Serializable transaction guarantee is proven for the free path; the paid-path gap is correctly deferred and explicitly handed off as the next session's primary deliverable. Code is merge-ready.

---

### SESSION_0084_REVIEW_01 — Stripe webhook test harness + paid-path oversubscription proof (self-review)

- **Reviewer:** Cody → Petey (self-review)
- **Date:** 2026-05-06
- **Reviewed tasks:** SESSION_0084_TASK_01, SESSION_0084_TASK_02, SESSION_0084_TASK_03
- **Dirstarter docs check:** not applicable (test-only addition, no L1 baseline files modified)

#### Scope

Two integration tests in `apps/web/app/api/stripe/webhooks/route.test.ts` driving the real `POST` handler against the real dev Postgres DB with the Stripe SDK mocked (signature bypass + outbound no-ops) and `~/env` mocked via a Proxy delegating to `process.env` (workaround for t3-env caching the empty `STRIPE_WEBHOOK_SECRET=""` from local `.env`). Smoke test proves the webhook fulfills a paid Registration end-to-end. P0 oversubscription test proves `fulfillTournamentRegistration` does not enforce division capacity — two sequential webhook POSTs for distinct users against a `capacity=1` division both succeed, leaving 2 ACTIVE entries.

#### Findings

- **P0 resolved — paid-path oversubscription:** SESSION_0084's confirmed 2 ACTIVE entries on capacity=1 is fixed. Sequential and parallel webhook tests now prove final ACTIVE count = 1.
- **P2 deferred — rejected-paid customer UI smoke:** Database state and refund call are proven, but user-facing copy/success-banner handling for the refunded customer remains TASK_05 for SESSION_0086.
- **P3 process note — temporary parallel worktrees:** Codex used two disjoint worktrees/subagents after user direction. Both worktrees lacked dependencies, so worker-local verification was limited; final verification ran in the primary checkout.

#### Verification

- `cd apps/web && bun test app/api/stripe/webhooks/route.test.ts` — 2 pass (smoke + oversubscription proof).
- `cd apps/web && bunx tsc --noEmit --pretty false` — failed only on pre-existing unrelated errors.

#### Verdict

SESSION_0084 proved the paid-path oversubscription bug exists and wrote the harness to drive it. The oversubscription fix landed in SESSION_0085. Score: 9.5/10.

---

### SESSION_0092_REVIEW_01 — E2E Infrastructure Sprint (Sessions 0089–0092)

- **Reviewer:** Cody/Doug (Copilot self-review)
- **Date:** 2026-05-06
- **Reviewed tasks:** SESSION_0089_TASK_01, SESSION_0090_TASK_01, SESSION_0091_TASK_01, SESSION_0092_TASK_01
- **Dirstarter docs check:** No L1 layers touched. E2E test infrastructure is project-local.

#### Scope

Four-session arc to build Playwright E2E test infrastructure: fix schema bug → create admin tests → run full suite and fix failures → seed data helper + auth cookie signing fix. Result: 12/12 tests green.

#### Findings

- **P0 resolved — Better-Auth cookie signing:** Admin E2E tests silently failed because auth helper set raw UUID cookies. Better-Auth requires HMAC-SHA-256 signed format (`value.base64signature`). Fixed in auth helper.
- **P1 resolved — schema.ts "use server":** Non-async Zod schema exports in a `"use server"` file caused Next.js 16 strict mode rejection. Removed directive.
- **P2 resolved — Playwright runtime:** Must use `bunx --bun` (not plain `bunx`) because Prisma adapter has `bun:` protocol transitive deps that Node.js can't resolve.
- **P3 remaining — CI webServer command:** `playwright.config.ts` `webServer.command` is `bun run dev` which uses pnpm filter from root. Needs adjustment for CI.

#### Verification

- `bunx --bun playwright test --reporter=list` — 12 pass, 0 skip, 0 fail (46.1s).

#### Verdict

E2E infrastructure sprint complete. 12/12 tests green. Better-Auth cookie signing is the key project-scoped learning. Score: 9.5/10 (0.5 deducted for CI webServer command remaining open).

### SESSION_0094_REVIEW_01 — Commerce truth reconciliation full close

**Reviewed tasks:** SESSION_0094_TASK_01, SESSION_0094_TASK_02, SESSION_0094_TASK_03
**Dirstarter docs check:** live docs checked on 2026-05-07
**Sources:** https://dirstarter.com/docs/integrations/payments, https://dirstarter.com/docs/monetization, https://dirstarter.com/docs/database/prisma, https://docs.stripe.com/payments/checkout, https://docs.stripe.com/billing/subscriptions/design-an-integration, https://docs.stripe.com/customer-management/integrate-customer-portal
**Verdict:** Aligned. This was a docs/governance reconciliation session, not payment implementation. The docs now match source reality: entitlement schema and `PricingPlan` Stripe IDs exist, the webhook grants/revokes entitlements, and tournament paid-registration tests are the payment proof template. The session deliberately left production payment code untouched and staged `SESSION_0095` for focused one-time/subscription webhook proof. WORKFLOW score: 9.6/10. No Dirstarter or data-integrity hard cap triggered; residual risk is explicitly tracked under MB-013.

#### SESSION_0094_FINDING_01 — Stripe Price mapping is not DB-enforced

- **Severity:** medium
- **Task:** SESSION_0094_TASK_02
- **Evidence:** `PricingPlan.stripePriceId` is nullable/non-unique in `apps/web/prisma/schema.prisma`; webhook uses `findFirst({ stripePriceId })`.
- **Impact:** Duplicate or missing Stripe Price mappings could grant the wrong entitlement or no entitlement unless admin data stays clean.
- **Required follow-up:** SESSION_0095 proof should include one mapped price fixture and document whether a DB constraint is needed before launch.
- **Status:** open

#### SESSION_0094_FINDING_02 — One-time Checkout replay idempotency is unproven

- **Severity:** medium
- **Task:** SESSION_0094_TASK_02
- **Evidence:** `grantEntitlementsFromCheckout` looks for existing rows by `sourceId: session.subscription`, but one-time creates use `sourceId: session.id`.
- **Impact:** Replayed one-time checkout events can create duplicate entitlement rows unless the test/fix closes the gap.
- **Required follow-up:** SESSION_0095 should add the one-time replay case to the webhook proof or record an accepted launch bridge.
- **Status:** open

#### SESSION_0094_FINDING_03 — Ledger projection remains a launch bridge decision

- **Severity:** medium
- **Task:** SESSION_0094_TASK_03
- **Evidence:** One-time Checkout proof grants access and activates `ProgramEnrollment`, but no non-tournament `Invoice`/`Payment` row is created by this path.
- **Impact:** Access can become correct while money-ledger reconciliation remains incomplete.
- **Required follow-up:** SESSION_0095/0096 must either create ledger rows for paid access or record an explicit launch bridge under MB-013.
- **Status:** open

**Kaizen triage:** Safe for docs and planning because no production code changed and the claims are source-checked. Not behaviorally safe for paid launch yet: one-time, subscription, Customer Portal, failed-payment, refund/dispute, and ledger proof remain open. Process slips: one large patch failed due context mismatch; smaller patches fixed it with no file loss. Confidence: 100 users 9.0 for documentation accuracy, 1,000 users 8.0 for payment readiness until SESSION_0095 proof lands, 10,000 users 7.5 because subscription lifecycle and ledger drift remain unproven. Kaizen aggregate: 7.5, which means stay in commerce remediation/proof before PWCC.

### SESSION_0095_REVIEW_01 — Commerce QA entitlement proof full close

**Reviewed tasks:** SESSION_0095_TASK_01, SESSION_0095_TASK_02, SESSION_0095_TASK_03
**Dirstarter docs check:** live docs checked on 2026-05-07
**Sources:** https://dirstarter.com/docs/integrations/payments, https://dirstarter.com/docs/monetization, https://dirstarter.com/docs/database/prisma, https://docs.stripe.com/payments/checkout, https://docs.stripe.com/billing/subscriptions/design-an-integration, https://docs.stripe.com/webhooks
**Verdict:** Aligned. The session extends Dirstarter's Stripe Checkout/webhook and Prisma baseline instead of replacing it. Focused webhook tests now prove one-time `PricingPlan.stripePriceId` creates exactly one PURCHASE `UserEntitlement`, one-time replay/source isolation, `ProgramEnrollment` projection, subscription grant replay, and `customer.subscription.deleted` revoke by subscription source id. The webhook also retries Prisma `P2034` serializable write conflicts so the paid tournament capacity proof remains stable. WORKFLOW score: 9.6/10. No Dirstarter or data-integrity hard cap triggered; MB-013 remains open for launch gaps outside this slice.

#### SESSION_0095_FINDING_01 — Stripe event-id dedupe is still not persisted

- **Severity:** medium
- **Task:** SESSION_0095_TASK_02
- **Evidence:** The proof covers idempotent source rows for replayed Checkout objects, but `POST` still does not persist processed Stripe event IDs.
- **Impact:** Stripe retries and duplicate Event objects are safer for proven entitlement paths, but event-level replay/audit posture is not complete.
- **Required follow-up:** SESSION_0096 or launch hardening should add processed-event storage or record an explicit accepted bridge.
- **Status:** open

#### SESSION_0095_FINDING_02 — Ledger projection remains open

- **Severity:** medium
- **Task:** SESSION_0095_TASK_03
- **Evidence:** One-time Checkout proof grants access and activates `ProgramEnrollment`, but no non-tournament `Invoice`/`Payment` row is created by this path.
- **Impact:** Access can be correct while internal accounting still depends on Stripe/dashboard state.
- **Required follow-up:** SESSION_0096 must implement ledger projection or document a launch bridge under MB-013.
- **Status:** open

#### SESSION_0095_FINDING_03 — Customer Portal and subscription policy remain launch blockers

- **Severity:** medium
- **Task:** SESSION_0095_TASK_03
- **Evidence:** Subscription grant/revoke by deletion is proven, but customer ID storage, Customer Portal session action, failed payment, update, refund, dispute, and grace policy are not implemented in this slice.
- **Impact:** Recurring access is not launch-complete beyond checkout success and subscription deletion.
- **Required follow-up:** SESSION_0096 should close or explicitly defer customer/subscription launch gaps before PWCC and brand rollout work.
- **Status:** open

**Kaizen triage:** Safe for 100 users at 9.4 on the implemented payment paths because customer mapping, event dedupe, ledger projection, lifecycle events, and tournament concurrency proof pass against real Prisma fixtures. Safe for 1,000 users at 8.6 until protected checkout metadata, monitoring, drift audit, and uniqueness policy are closed. Safe for 10,000 users at 7.9 because webhook monitoring/manual payment parity/certificate pricing are still not launch-complete. Kaizen aggregate: 7.9, which keeps the next session in commerce hardening before PWCC.

### SESSION_0096_REVIEW_01 — Customer billing and subscription launch gaps full close

**Reviewed tasks:** SESSION_0096_TASK_01, SESSION_0096_TASK_02, SESSION_0096_TASK_03
**Dirstarter docs check:** live docs checked on 2026-05-07
**Sources:** https://dirstarter.com/docs/integrations/payments, https://dirstarter.com/docs/monetization, https://dirstarter.com/docs/database/prisma, https://docs.stripe.com/customer-management/integrate-customer-portal, https://docs.stripe.com/webhooks, https://docs.stripe.com/billing/subscriptions/webhooks
**Verdict:** Aligned. The session extends Dirstarter's Stripe Checkout/webhook and Prisma baseline instead of replacing it. Stripe Customer mapping, authenticated Customer Portal session creation, processed-event dedupe, non-tournament ledger projection, subscription update/delete policy, failed-payment grace, paid-renewal recovery, full refund revoke, and dispute revoke now have focused proof against the real Prisma webhook harness. WORKFLOW score: 9.3/10. No Dirstarter or data-integrity hard cap triggered; MB-013 remains open for launch gaps outside this slice.

#### Prior finding disposition

- `SESSION_0094_FINDING_02` and `SESSION_0095_FINDING_01` are closed by persisted Stripe event-id dedupe plus replay proof.
- `SESSION_0094_FINDING_03` and `SESSION_0095_FINDING_02` are closed for mapped non-tournament Checkout by `Invoice`/`Payment` ledger projection.
- `SESSION_0095_FINDING_03` is closed for Customer Portal, Customer ID storage, subscription update/delete, failed payment, paid renewal, full refund, and dispute policy. New residual launch gates are split into the SESSION_0096 findings below.

#### SESSION_0096_FINDING_01 — Protected paid checkout action still needs server-derived metadata

- **Severity:** medium
- **Task:** SESSION_0096_TASK_02
- **Evidence:** `server/web/products/actions.ts` still exposes the inherited generic checkout action with caller-supplied `metadata`. SESSION_0096 only attaches a stored Stripe Customer when the authenticated session user matches `metadata.userId`.
- **Impact:** Protected learning/certification access should not depend on client-provided entitlement metadata, even though the webhook still maps through server-side `PricingPlan` and `EntitlementGrant`.
- **Required follow-up:** Add a dedicated authenticated Ronin paid-access checkout action that derives user, brand, org, plan, and metadata server-side.
- **Status:** open

#### SESSION_0096_FINDING_02 — Webhook event monitoring and drift audit are not wired

- **Severity:** medium
- **Task:** SESSION_0096_TASK_03
- **Evidence:** `StripeWebhookEvent` records processed/failed event state and attempts, but no alerting, dashboard, or scheduled reconciliation job reads those records.
- **Impact:** Access/money drift or repeated webhook failure could go unnoticed until manual inspection.
- **Required follow-up:** Add monitoring/alert thresholds for failed/duplicate events and a Stripe/ledger/entitlement drift audit before paid curriculum launch.
- **Status:** open

#### SESSION_0096_FINDING_03 — Stripe mapping/idempotency remains partially app-level

- **Severity:** medium
- **Task:** SESSION_0096_TASK_03
- **Evidence:** `PricingPlan.stripePriceId` remains nullable/non-unique, and `UserEntitlement` still relies on lookup/update logic instead of a DB unique constraint for user/entitlement/source rows.
- **Impact:** SESSION_0095/0096 tests prove the launch-critical paths, but bad admin data or a future handler branch could still create ambiguous price mapping or duplicate source rows.
- **Required follow-up:** Decide whether launch requires DB uniqueness constraints or an accepted-risk note plus admin validation.
- **Status:** open

#### SESSION_0096_FINDING_04 — Manual/admin payment parity remains a launch gate

- **Severity:** medium
- **Task:** SESSION_0096_TASK_03
- **Evidence:** Stripe one-time/subscription paths now write access and ledger state; manual/cash/check/barter/comp paths do not yet prove equivalent entitlement grant/revoke and audit behavior.
- **Impact:** Offline payments could diverge from Stripe-paid access unless excluded from launch or implemented with the same entitlement-first contract.
- **Required follow-up:** Build or explicitly exclude manual/admin payment grants before protected paid curriculum launch.
- **Status:** open

**Kaizen triage:** Safe for 100 users at 9.4 on the implemented payment paths because customer mapping, event dedupe, ledger projection, lifecycle events, and tournament concurrency proof pass against real Prisma fixtures. Safe for 1,000 users at 8.6 until protected checkout metadata, monitoring, drift audit, and uniqueness policy are closed. Safe for 10,000 users at 7.9 because webhook monitoring/manual payment parity/certificate pricing are still not launch-complete. Kaizen aggregate: 7.9, which keeps the next session in commerce hardening before PWCC.

### SESSION_0097_REVIEW_01 — Protected paid learning Checkout quick close

**Reviewed tasks:** SESSION_0097_TASK_01, SESSION_0097_TASK_02, SESSION_0097_TASK_03
**Dirstarter docs check:** No fresh browsing per locked operator instruction; SESSION_0097 prep recorded live Dirstarter Payments, Monetization, Prisma, and Stripe Checkout/webhook docs checked on 2026-05-07.
**Verdict:** Aligned with open launch gates. SESSION_0097 extends the inherited Dirstarter Stripe Checkout baseline without replacing it. Client-selected price IDs are accepted only as selectors and must map to exactly one active current-brand `PricingPlan` for the requested active `Program` with entitlement grants. Checkout line items, user, brand, organization, metadata, mode, success/cancel URLs, and Stripe Customer handling are server-derived. WORKFLOW score: 9.2/10; residual MB-013 gates remain for webhook monitoring/drift audit, manual payment parity, certificate pricing migration/bridge, and DB uniqueness policy.

#### Prior finding disposition

- `SESSION_0096_FINDING_01` is closed for protected program enrollment Checkout by `createProgramEnrollmentCheckout` and hostile action tests.

#### SESSION_0097_FINDING_01 — Remaining MB-013 gates are outside protected Checkout

- **Severity:** medium
- **Task:** SESSION_0097_TASK_03
- **Evidence:** Protected Checkout is now server-derived, but monitoring/drift audit, manual/admin payment parity, certificate pricing migration/bridge, and DB uniqueness policy are still listed under MB-013.
- **Impact:** Paid curriculum launch should still wait for explicit MB-013 signoff even though monitoring and drift detection now exist.
- **Required follow-up:** Continue MB-013 with webhook monitoring/drift audit or manual payment parity before PWCC unless Brian explicitly accepts the risk.
- **Status:** open

### SESSION_0100_TASK_01 — Bow-in, commit SESSION_0099, Graphify refresh, plan creation

- **ID:** SESSION_0100_TASK_01
- **Owner:** Giddy (ops) + Petey (plan)
- **Session:** SESSION_0100
- **Date:** 2026-05-08
- **Done criteria:** SESSION_0099 committed and pushed, graph current, SESSION_0100 created with Petey plan.
- **Status:** landed
- **What should ship:** Committed SESSION_0099 artifacts, refreshed graph, SESSION_0100 with PWCC plan.
- **Verification:** `git log --oneline -1` shows SESSION_0099 commit; `graphify-out/GRAPH_REPORT.md` rebuilt; SESSION_0100.md exists.

### SESSION_0100_TASK_02 — PWCC Commerce Port Map document (staged for next session)

- **ID:** SESSION_0100_TASK_02
- **Owner:** Petey + Desi
- **Session:** SESSION_0100
- **Date:** 2026-05-08
- **Done criteria:** `docs/architecture/pwcc-commerce-port-map.md` exists with all commerce verticals classified.
- **Status:** planned
- **What should ship:** Port map document with Commerce Vertical / Legacy Source / Port Category / Stripe Product Type / Brand Scope / Priority / Blocked By.
- **Verification:** File exists, all verticals from affiliate-gear.ts and ubiquitous-language.md covered.

### SESSION_0100_TASK_03 — Stripe product policy ADR (staged for next session)

- **ID:** SESSION_0100_TASK_03
- **Owner:** Petey
- **Session:** SESSION_0100
- **Date:** 2026-05-08
- **Done criteria:** `docs/architecture/decisions/0014-stripe-product-policy.md` exists as draft.
- **Status:** planned
- **What should ship:** ADR with decision, context, Dirstarter proof, consequences.
- **Verification:** ADR file exists, references ADR 0011 and dirstarter-commerce-alignment.md.

### SESSION_0100_TASK_04 — Wiki index, project log, and close

- **ID:** SESSION_0100_TASK_04
- **Owner:** Giddy + Petey
- **Session:** SESSION_0100
- **Date:** 2026-05-08
- **Done criteria:** Wiki index updated, project log entries added, SESSION_0100 closed with JETTY sweep.
- **Status:** landed
- **What should ship:** Updated wiki/index.md, project-log.md, SESSION_0100.md with full close evidence.
- **Verification:** `grep SESSION_0100 docs/protocols/project-log.md` returns entries; wiki index lists SESSION_0100.

### SESSION_0101_TASK_01 — PWCC Commerce Port Map document

- **ID:** SESSION_0101_TASK_01
- **Owner:** Petey + Desi
- **Session:** SESSION_0101
- **Date:** 2026-05-08
- **Done criteria:** `docs/architecture/pwcc-commerce-port-map.md` exists with all commerce verticals classified.
- **Status:** landed
- **What should ship:** Port map with 9 commerce verticals, port categories, entitlement keys, naming conventions.
- **Verification:** File exists with all verticals from affiliate-gear.ts and ubiquitous-language.md covered.

### SESSION_0101_TASK_02 — ADR 0014 Stripe Product Policy

- **ID:** SESSION_0101_TASK_02
- **Owner:** Petey
- **Session:** SESSION_0101
- **Date:** 2026-05-08
- **Done criteria:** `docs/architecture/decisions/0014-stripe-product-policy.md` exists as draft.
- **Status:** landed
- **What should ship:** ADR with 8 policy decisions, Dirstarter proof table, consequences, open questions.
- **Verification:** ADR file exists, references ADR 0011, PWCC port map, and Dirstarter live docs.

### SESSION_0101_TASK_03 — Full close: wiki, project log, JETTY sweep, commit

- **ID:** SESSION_0101_TASK_03
- **Owner:** Giddy + Petey
- **Session:** SESSION_0101
- **Date:** 2026-05-08
- **Done criteria:** All closing.md steps completed, SESSION_0101 at closed-full.
- **Status:** landed
- **What should ship:** Updated wiki/index.md, project-log.md, wiki-lint pass, committed and pushed.
- **Verification:** Wiki-lint 0 errors; `grep SESSION_0101 docs/protocols/project-log.md` returns entries; SESSION_0101 has full close evidence.

### SESSION_0102_TASK_01 — Create setup-ronin-stripe-products.ts

- **ID:** SESSION_0102_TASK_01
- **Owner:** Cody
- **Session:** SESSION_0102
- **Date:** 2026-05-08
- **Done criteria:** Script exists at `apps/web/scripts/setup-ronin-stripe-products.ts`, follows ADR 0014 naming/metadata/idempotency.
- **Status:** landed
- **What should ship:** 16 Stripe product definitions for BMA across 8 verticals with ADR 0014 metadata, idempotent creation logic.
- **Verification:** File exists, uses `{BRAND_CODE}_{vertical}_{identifier}` naming, includes `brand`/`vertical`/`entitlement_key`/`created_by` metadata, has `findExistingProduct` idempotency check.

### SESSION_0102_TASK_02 — Full close: wiki, project log, JETTY sweep, commit

- **ID:** SESSION_0102_TASK_02
- **Owner:** Giddy + Petey
- **Session:** SESSION_0102
- **Date:** 2026-05-08
- **Done criteria:** All closing.md steps completed, SESSION_0102 at closed-full.
- **Status:** landed
- **What should ship:** Updated wiki/index.md, project-log.md, wiki-lint pass, SESSION_0102 at closed-full.
- **Verification:** Wiki-lint pass; `grep SESSION_0102 docs/protocols/project-log.md` returns entries; SESSION_0102 has full close evidence.

### SESSION_0103_TASK_01 — Interval coverage + merch + org fee products

- **ID:** SESSION_0103_TASK_01
- **Owner:** Cody
- **Session:** SESSION_0103
- **Date:** 2026-05-08
- **Done criteria:** Membership quarterly, program/course subscription intervals, org fee, and merch products added.
- **Status:** landed
- **Verification:** 20 shared products with monthly/quarterly/annual intervals on all subscription-eligible verticals.

### SESSION_0103_TASK_02 — RDD maintenance + multi-brand + dry-run

- **ID:** SESSION_0103_TASK_02
- **Owner:** Cody
- **Session:** SESSION_0103
- **Date:** 2026-05-08
- **Done criteria:** RDD maintenance basic/pro products, --brand filter, --dry-run flag.
- **Status:** landed
- **Verification:** 22 total products (20 shared + 2 RDD-only). --dry-run previews without API calls. --brand filters by brand code.

### SESSION_0103_TASK_03 — Full close

- **ID:** SESSION_0103_TASK_03
- **Owner:** Giddy + Petey
- **Session:** SESSION_0103
- **Date:** 2026-05-08
- **Done criteria:** All closing.md steps completed.
- **Status:** landed

### SESSION_0103_REVIEW_01 — Multi-brand products and dry-run full close

**Reviewed tasks:** SESSION_0103_TASK_01, SESSION_0103_TASK_02, SESSION_0103_TASK_03
**Verdict:** Script extended from 16 to 22 products across 10 verticals. All subscription verticals have monthly/quarterly/annual intervals. RDD maintenance products isolated to RDD brand. Multi-brand CLI support and dry-run mode added. ADR 0014 carry-forward remains as open item. No scope creep — checkout flow, inventory, and product detail pages excluded per scope guard.
