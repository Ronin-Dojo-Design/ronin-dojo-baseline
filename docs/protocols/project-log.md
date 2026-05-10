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
| SESSION_0100_TASK_01 | SESSION_0100 | Bow in + planning | Giddy + Petey | SESSION_0099 commit, Graphify refresh, SESSION_0100 creation | SESSION_0099 committed and pushed, graph current, SESSION_0100 created with Petey plan | landed | SESSION_0100_REVIEW_01 |
| SESSION_0100_TASK_02 | SESSION_0100 | Planning | Petey + Desi | PWCC Commerce Port Map document | `docs/architecture/pwcc-commerce-port-map.md` exists with all commerce verticals classified | planned | — |
| SESSION_0100_TASK_03 | SESSION_0100 | Planning | Petey | Stripe product policy ADR | `docs/architecture/decisions/0014-stripe-product-policy.md` exists as draft | planned | — |
| SESSION_0100_TASK_04 | SESSION_0100 | Closing | Giddy + Petey | Wiki index, project log, and close | Wiki index updated, project log entries added, SESSION_0100 closed with JETTY sweep | landed | — |
| SESSION_0101_TASK_01 | SESSION_0101 | PWCC Commerce Port Map document
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

### SESSION_0106_TASK_01 — Gear page caching (FINDING_01 fix)

- **ID:** SESSION_0106_TASK_01
- **Owner:** Cody
- **Session:** SESSION_0106
- **Date:** 2026-05-08
- **Done criteria:** `export const revalidate = 3600` added to gear page.
- **Status:** landed
- **Verification:** Line added to `apps/web/app/(web)/gear/page.tsx`.

### SESSION_0106_TASK_02 — Metadata JSON editor in admin form

- **ID:** SESSION_0106_TASK_02
- **Owner:** Cody
- **Session:** SESSION_0106
- **Date:** 2026-05-08
- **Done criteria:** TextArea field for metadata JSON in pricing-plan-form.tsx, Zod schema accepts string→JSON transform.
- **Status:** landed
- **Verification:** TextArea added with `font-mono` styling. Schema updated with `z.union` to accept string or record. Zero type errors.

### SESSION_0106_TASK_03 — Hardcoded catalog removal plan

- **ID:** SESSION_0106_TASK_03
- **Owner:** Cody
- **Session:** SESSION_0106
- **Date:** 2026-05-08
- **Done criteria:** Dependency audit documented. Removal plan written.
- **Status:** landed
- **Verification:** Audit shows `tuffBuffsAffiliateGearCollections` still needed by gear page, `tuffBuffsAffiliateGearProducts` needed by seed script + storage monitoring, `merch-catalog.ts` needed by storage monitoring. Cannot remove yet.

### SESSION_0106_TASK_04 — ADR 0014 upgrade

- **ID:** SESSION_0106_TASK_04
- **Owner:** Cody
- **Session:** SESSION_0106
- **Date:** 2026-05-08
- **Done criteria:** ADR 0014 status changed from `proposed` to `accepted` with implementation notes.
- **Status:** landed
- **Verification:** Frontmatter `status: accepted`, body updated with accepted date and session references.

### SESSION_0106_REVIEW_01 — Full close review

**Reviewed tasks:** SESSION_0106_TASK_01, SESSION_0106_TASK_02, SESSION_0106_TASK_03, SESSION_0106_TASK_04
**Verdict:** All tasks landed. Gear page caching added (ISR 1hr). Metadata JSON editor uses Dirstarter TextArea component with JSON parse/validate. Catalog removal audited — dependencies documented, cannot remove yet. ADR 0014 accepted with implementation provenance. No scope creep. No new security surfaces. No cross-brand leakage risk.

---

## SESSION_VIDEO_R001 — Video Components System: Review & Recommend (off-number planning session)

### VIDEO_R001_TASK_PLAN_01 — Petey Plan: Video System Architecture

- **ID:** VIDEO_R001_TASK_PLAN_01
- **Owner:** Petey
- **Session:** SESSION_VIDEO_R001
- **Date:** 2026-05-10
- **Done criteria:** Complete plan with schema design, player stack decision, component architecture, admin routes, 7 tasks defined.
- **Status:** landed
- **Verification:** SESSION_VIDEO_R001.md created with full Petey plan block. framecn research complete. Schema designs documented. All 7 execution tasks defined with agent assignments and parallelism map. Pending user sign-off on schema before TASK_01 execution.

### VIDEO_R001_REVIEW_01 — Hostile Close Review (planning session)

**Reviewed tasks:** VIDEO_R001_TASK_PLAN_01
**Verdict:** Planning session only — no code executed. Plan is aligned to Dirstarter Gold Standard (§9), uses existing Entitlement system for gating, follows ADR 0004 brand column convention. framecn correctly identified as wrong tool. Open decisions documented. Schema sign-off gated before execution. Safe to proceed.
