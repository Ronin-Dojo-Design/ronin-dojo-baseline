---
title: "SESSION 0030 — Class Schedules and Sessions"
slug: session-0030
type: session
status: closed-full
created: 2026-04-30
updated: 2026-04-30
last_agent: codex-session-0030
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0029.md
  - docs/protocols/WORKFLOW_5.0.md
  - docs/protocols/petey-plan.md
  - docs/architecture/programs-curriculum-certification-spec.md
  - docs/architecture/monetization-entitlements-spec.md
  - docs/architecture/dirstarter-commerce-alignment.md
  - docs/architecture/security-privacy-payments-monitoring-plan.md
  - docs/architecture/source/raw/SESSION_0030_cgr_file_system_wiring_map_chatgpt_raw.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0030 — Class Schedules and Sessions

## Date

2026-04-30

## Operator

Brian Scott + Codex acting as Petey

## Status

closed-full

## Goal

Implement the next School Ops vertical slice: recurring ClassSchedule management, basic ClassSession visibility/materialization, and ClassInstructorAssignment support using the existing Program CRUD and Dirstarter patterns.

## Bow-in audit

- Opening posture: Petey orchestration, per `docs/protocols/WORKFLOW_5.0.md` and `docs/protocols/petey-plan.md`.
- Previous session: `docs/sprints/SESSION_0029.md` closed-full at 9.6/9.7, with entitlement-first commerce accepted and class schedules moved to SESSION_0030.
- Raw CGR source preserved: `docs/architecture/source/raw/SESSION_0030_cgr_file_system_wiring_map_chatgpt_raw.md`.
- Petey ruling on CGR map: source material and scope guard, not a literal implementation plan for SESSION_0030.
- Lane: School operations.
- Dependent sub-lane: Core platform governance only for CGR DRY conflict checking.
- Critical rule retained: entitlements must land before Stripe UI. SESSION_0030 does not touch Stripe UI, checkout, or paid CGR access.
- Scope pivot: Brian requested hostile close review, security/privacy/financial hardening, wireframes, Dirstarter references, and a full close before code execution. Class schedule implementation is therefore deferred to the next execution session.

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Auth, Prisma/database, App Router pages, server feature folders, safe-actions, common form/UI primitives |
| Extension or replacement | Extension. Build on `server/web/program/*`, Better Auth, `userActionClient`, `services/db`, `components/common`, and existing `apps/web/app/(web)` route conventions. |
| Why justified | Schedules unlock attendance/check-in, staff class control, and school operations without forcing premature CGR commerce or LMS UI. |
| Risk if bypassed | Duplicate CGR/domain folders, route hacks, weak brand predicates, duplicated `Program`/`PricingPlan` models, and attendance work without a schedule backbone. |

Live Dirstarter docs to verify again at execution start:

- `https://dirstarter.com/docs/codebase/structure`
- `https://dirstarter.com/docs/database/prisma`
- `https://dirstarter.com/docs/authentication`
- `https://dirstarter.com/docs/content`

## Cross-review of CGR raw map

### Accepted as future direction

- Entitlement-first paid access remains accepted for future CGR commerce.
- Public program slug routes, dashboard learning path, course/curriculum access, and certificate verification are valid future surfaces.
- CGR seed needs are useful, but only after the target slice decides whether seed data belongs in `seed.ts`, a helper import, or a separate command.

### Rejected for SESSION_0030 execution

| Raw map item | Existing repo truth | SESSION_0030 ruling |
| --- | --- | --- |
| New `apps/web/app/(public)` / `(dashboard)` / `(admin)` groups | Current app uses `apps/web/app/(web)` for public/dashboard surfaces and `apps/web/app/admin` for admin. | Do not create new route groups. |
| `apps/web/server/cgr/*` | Current feature folders live under `apps/web/server/web/*` and `apps/web/server/admin/*`; Program CRUD is `server/web/program`. | Do not add a parallel top-level CGR server stack. |
| `apps/web/components/cgr/*` | Current UI primitives live in `components/common`, `components/web/*`, and `components/admin/*`. | Do not add generic CGR components in this slice. |
| New CGR auth/db/action helpers | Current actions use `lib/authz.ts`, `lib/safe-actions.ts`, and `services/db.ts`. | Reuse and extend existing helpers. |
| Raw `Program`, `ProgramEnrollment`, `PricingPlan` models | These models already exist in `apps/web/prisma/schema.prisma`. | Do not duplicate or replace. |
| Raw `Product`, `Entitlement`, `UserEntitlement` | Product is deferred by ADR 0011; entitlements are accepted but scheduled for the commerce slice. | Do not add in SESSION_0030. |
| Raw `CourseModule` / `Lesson` routes | Current MVP curriculum unit is `CurriculumItem`; progress is `CurriculumItemCompletion`. | Defer course/lesson UI. |
| Certificate verification route | `CertificateIssuance.qrVerificationCode` exists and is the likely verification lookup. | Defer to certificate slice. |

## Petey plan

### Goal

Land class scheduling without expanding into attendance, billing, entitlements, or CGR learning-path UI.

### Tasks

#### SESSION_0030_TASK_01 — ClassSchedule CRUD substrate

- **Agent:** Cody, reviewed by Giddy
- **What:** Add schedule payloads, queries, schemas, actions, and UI using the Program CRUD pattern.
- **Steps:**
  1. Re-read `server/web/program/*`, `components/web/programs/create-program-form.tsx`, `apps/web/app/(web)/programs/*`, and `apps/web/prisma/schema.prisma`.
  2. Create the schedule feature folder under the existing `server/web` convention.
  3. Add create/edit/archive actions with `userActionClient`, `canEditOrganization`, brand scope, program ownership, and discipline linkage checks.
  4. Add list/detail/create/edit pages under existing route groups, favoring program-adjacent URLs before inventing new dashboard structure.
- **Done means:** An authorized org editor can create, edit, and archive schedules for an existing Program; unauthorized/cross-brand attempts fail server-side.
- **Depends on:** nothing

#### SESSION_0030_TASK_02 — Instructor assignments and session basics

- **Agent:** Cody + Desi, reviewed by Doug
- **What:** Support basic ClassInstructorAssignment and ClassSession display/materialization without touching attendance.
- **Steps:**
  1. Query eligible instructors from ACTIVE org memberships with instructor/owner/admin roles.
  2. Allow primary/assistant assignment on a schedule.
  3. Show upcoming sessions or create a bounded batch of `ClassSession` rows from `daysOfWeek`, `startTime`, `endTime`, effective dates, and timezone.
  4. Keep recurrence MVP narrow; do not build a full calendar engine.
- **Done means:** A schedule shows assigned instructors and upcoming sessions; attendance/check-in remains untouched.
- **Depends on:** SESSION_0030_TASK_01

#### SESSION_0030_TASK_03 — Fixtures, smoke proof, and close evidence

- **Agent:** Doug + Cody
- **What:** Add targeted fixtures/proof for the schedule slice and record close evidence.
- **Steps:**
  1. Add or update seed fixtures only for schedules, instructors, and sessions.
  2. Add a targeted smoke script following `apps/web/scripts/smoke-program.ts` style.
  3. Run Prisma validation, touched-slice checks, smoke proof, and `git diff --check`.
  4. Record review score, blockers, and next-session handoff in this file.
- **Done means:** The schedule slice has credible proof and the session can close honestly under WORKFLOW 5.0.
- **Depends on:** SESSION_0030_TASK_01 and SESSION_0030_TASK_02

### Parallelism

Use read-only sidecars before edits:

- **Fermat:** compare CGR raw map against current schema/specs and list forbidden duplicates.
- **Pauli:** map Program CRUD patterns to schedule target files and smoke-test shape.

No parallel write worktrees at the start. Schedule actions, forms, and smoke data touch overlapping schema/server/UI contracts. Split only after TASK_01 lands cleanly.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0030_TASK_01 | Cody + Giddy | Implementation plus brand/Dirstarter/DRY guardrails. |
| SESSION_0030_TASK_02 | Cody + Desi + Doug | Instructor/session UI needs existing component discipline and QA review. |
| SESSION_0030_TASK_03 | Doug + Cody | Proof, smoke, and close evidence. |
| Session gate | Petey | Keep CGR as source guard and stop scope creep. |
| Deferred | Brandon | No launch copy or brand marketing in this slice. |

### Worktree plan

| Worktree | Branch | Purpose |
| --- | --- | --- |
| `/Users/brianscott/dev/wt-school-ops` | `session-0030-class-schedules` | Implementation worktree for schedules/sessions/instructors. |
| `/Users/brianscott/dev/ronin-dojo-app` | current branch | Orchestration/docs review; avoid mixing feature edits into the dirty main worktree. |
| `/Users/brianscott/dev/wt-qa-hardening` | optional `session-0030-class-schedules-qa` | Optional read-only/touched-slice QA after TASK_01 stabilizes. |

### Open decisions

- Should schedule pages live under `/programs/[id]/schedules` first, or under `/dashboard/schedules`?
- Should ClassSession rows be materialized on schedule save, generated by a smoke/admin action, or displayed virtually until attendance requires durable rows?
- Should `rrule` remain unused in MVP while `daysOfWeek` drives session generation?

### Risks

- CGR map conflicts with SESSION_0029 if followed literally by adding duplicate `Program`, `PricingPlan`, `ProgramEnrollment`, or `Product`.
- MB-002 brand-scope risk remains; every schedule query/action needs explicit brand/org predicates.
- Brand resolution already appears in `proxy.ts` and `server/web/program/actions.ts`; centralize or reuse request-brand behavior before adding more action files.
- Recurrence can balloon; MVP must stay bounded to `daysOfWeek`, `startTime`, `endTime`, effective dates, and timezone.
- Full app typecheck/lint baseline may be noisy; require touched-slice checks plus targeted smoke proof.
- Existing main worktree is dirty; implementation should use `wt-school-ops` after Giddy confirms branch/worktree posture.

### Scope guard

Do not add `Product`, `Entitlement`, `EntitlementGrant`, `UserEntitlement`, Stripe UI, checkout, course/lesson pages, `/dashboard/my-path`, `/admin/cgr`, certificate verification, attendance/check-in, pricing, contracts, waivers, family workflows, or CGR service folders in SESSION_0030.

If CGR decisions surface, record them in `Open decisions / blockers`; do not implement them inside the schedule slice.

## Review pass plan

| Pass | Reviewers | Gate |
| --- | --- | --- |
| Pass 1 | Giddy + Cody | Dirstarter/DRY and server/action/schema review. Score capped at 8.9 if duplicate CGR nouns or weak brand predicates land. |
| Pass 2 | Doug + Desi | Schedule UX, instructor assignment behavior, smoke proof, and auth/brand failure modes. |
| Pass 3 | Petey + Doug | Scope guard, docs/readiness, next-session split if score remains under 9.5. |

## Expected verification

- `bunx prisma validate --schema apps/web/prisma/schema.prisma`
- Targeted schedule smoke script
- Permission/brand failure-case review for schedule actions
- Touched-slice lint/type checks where available
- `git diff --check`

## Next sessions queued

| Session | Target |
| --- | --- |
| SESSION_0031 | Attendance/check-in flows and staff class-control surface. |
| SESSION_0032 | Program enrollments, family groups, waivers, trial lifecycle. |
| SESSION_0033 | Entitlement layer, pricing plans, contracts, invoices, and Stripe account wiring, honoring the CGR entitlement-first rule before any Stripe UI. |

## Task log

| Task ID | Status |
| --- | --- |
| SESSION_0030_TASK_00 | landed |
| SESSION_0030_TASK_01 | planned |
| SESSION_0030_TASK_02 | planned |
| SESSION_0030_TASK_03 | planned |

## What landed

- Preserved the pasted CGR file system and wiring map source at `docs/architecture/source/raw/SESSION_0030_cgr_file_system_wiring_map_chatgpt_raw.md`.
- Staged the class schedule/session/instructor assignment execution plan using WORKFLOW 5.0.
- Ran hostile close review on the SESSION_0030 plan before implementation.
- Created `docs/architecture/security-privacy-payments-monitoring-plan.md`.
  - Adds private-data and financial-transaction threat findings.
  - Adds low-fidelity wireframes for public program, staff schedule manager, schedule edit, payment/entitlement admin, and security monitor surfaces.
  - Adds security gates for class schedules and future CGR commerce.
  - Adds monitoring and test plans for auth failures, brand-scope rejects, rate limits, Stripe webhooks, entitlement drift, certificate verification abuse, cron failures, env validation, and private storage.
- Updated Dirstarter docs references with live 2026-04-30 source links for structure, Prisma, auth, environment secrets, payments, monetization, rate limiting, analytics, storage, deployment, cron jobs, and content.
- Added MB-013 for security and financial transaction readiness.
- Closed SESSION_0030 as a full planning/security-review session; class schedule implementation did not execute in this session.

## Files touched

- `docs/sprints/SESSION_0030.md` — staged plan, hostile review, close evidence, and next-session handoff.
- `docs/architecture/source/raw/SESSION_0030_cgr_file_system_wiring_map_chatgpt_raw.md` — verbatim CGR raw source.
- `docs/architecture/security-privacy-payments-monitoring-plan.md` — security, privacy, payment, wireframe, monitoring, and test gates.
- `docs/architecture/README.md` — added the new security/monitoring architecture doc.
- `docs/knowledge/wiki/index.md` — indexed SESSION_0030 and the new architecture doc/raw source.
- `docs/knowledge/wiki/log.md` — recorded SESSION_0030 staging and hostile close update.
- `docs/knowledge/wiki/dirstarter-docs-inventory.md` — added SESSION_0030 security-review Dirstarter docs references.
- `docs/knowledge/wiki/manual-boundary-registry.md` — added MB-013.
- `docs/protocols/project-log.md` — added SESSION_0030 task/review entries.

## Decisions resolved

- CGR raw map is preserved as source material and a scope guard, not a literal implementation plan.
- SESSION_0030 does not add CGR folders, Stripe UI, entitlements, product catalog, course/lesson UI, certificate verification, attendance, or billing.
- Class schedule implementation must pass security gates before it can score above 9.5.
- Future CGR commerce must land entitlement services before Stripe UI or paid access screens.
- "Hacker proof" is not a guaranteeable state. The accepted posture is defense-in-depth, explicit monitoring, proof gates, and no known unaddressed security issue at release gates.

## Open decisions / blockers

- BLOCKED for implementation until the next execution session creates `wt-school-ops` or otherwise confirms branch/worktree posture.
- MB-002 remains open: brand-scope enforcement is still procedural until a code-level guard lands.
- MB-013 is open: security and financial transaction readiness requires implementation proof, not just the plan.
- Schedule route placement still needs execution-time choice: program-adjacent `/programs/[id]/schedules` first, or dashboard schedule route.
- ClassSession materialization still needs execution-time choice: durable bounded generation vs. virtual display until attendance needs rows.
- Payment/entitlement drift audit is required before paid CGR launch.
- Private certificate/media storage policy is required before certificate PDFs or private student media launch.

## Next session

- **Goal:** Execute the class schedule vertical slice with security gates from `security-privacy-payments-monitoring-plan.md`.
- **Inputs to read:**
  - `docs/sprints/SESSION_0030.md`
  - `docs/architecture/security-privacy-payments-monitoring-plan.md`
  - `docs/protocols/WORKFLOW_5.0.md`
  - `apps/web/server/web/program/*`
  - `apps/web/prisma/schema.prisma`
- **First task:** Create/confirm `/Users/brianscott/dev/wt-school-ops` on a `session-0031-class-schedules` branch, then implement `SESSION_0030_TASK_01` with explicit brand/org/role rejection tests.

## Review log

- `SESSION_0030_REVIEW_01` recorded in `docs/protocols/project-log.md`.

## Hostile close review

### SESSION_0030_REVIEW_01 — Plan security and Dirstarter compliance

**Reviewed tasks:** SESSION_0030_TASK_00, SESSION_0030_TASK_01, SESSION_0030_TASK_02, SESSION_0030_TASK_03

**Dirstarter docs check:** live docs checked on 2026-04-30.

**Sources:** `https://dirstarter.com/docs/codebase/structure`, `https://dirstarter.com/docs/database/prisma`, `https://dirstarter.com/docs/authentication`, `https://dirstarter.com/docs/environment-setup`, `https://dirstarter.com/docs/integrations/payments`, `https://dirstarter.com/docs/monetization`, `https://dirstarter.com/docs/integrations/rate-limiting`, `https://dirstarter.com/docs/integrations/analytics`, `https://dirstarter.com/docs/integrations/storage`, `https://dirstarter.com/docs/deployment`, `https://dirstarter.com/docs/cron-jobs`, `https://dirstarter.com/docs/content`

**Verdict:** The plan is now sound as a staged planning/security artifact, not as an implementation close. The original staged plan was too thin on privacy, payment, and monitoring gates; that gap is addressed by `security-privacy-payments-monitoring-plan.md` and MB-013. No code path exposes private data or payment state because no feature implementation landed. The next implementation session is not merge-ready until it proves server-side auth, brand/org predicates, instructor enumeration protection, bounded session generation, and smoke tests.

**Score: 9.5/10 for planning close** — No Dirstarter or data-integrity hard cap triggered for docs/planning work. Future implementation score is capped at 8.9 if it omits the security gates or brand-scope proof.

### SESSION_0030_FINDING_01 — Security gates were missing from the staged plan

- **Severity:** high
- **Task:** SESSION_0030_TASK_00
- **Evidence:** `docs/sprints/SESSION_0030.md` initially staged class schedule tasks without a dedicated private-data/payment/monitoring gate.
- **Impact:** Cody could implement schedule or later CGR surfaces with route-level protection but no explicit server-side privacy proof.
- **Required follow-up:** Treat `docs/architecture/security-privacy-payments-monitoring-plan.md` as required input before class schedule implementation.
- **Status:** addressed

### SESSION_0030_FINDING_02 — Financial transaction leak-proofing was only implied

- **Severity:** high
- **Task:** SESSION_0030_TASK_00
- **Evidence:** Raw CGR source required entitlements before Stripe UI; the staged plan banned Stripe work but did not define payment monitoring or refund/revoke proof.
- **Impact:** Future checkout could grant access directly from Stripe metadata and fail refund/cancel/revoke behavior.
- **Required follow-up:** Entitlement-first services plus Stripe webhook idempotency, refund/revoke tests, and entitlement drift monitoring before paid UI.
- **Status:** addressed in plan; implementation open under MB-013

### SESSION_0030_FINDING_03 — Private-data monitoring was not explicit

- **Severity:** medium
- **Task:** SESSION_0030_TASK_03
- **Evidence:** Original expected verification listed smoke checks but not monitoring signals or alert thresholds.
- **Impact:** Auth/brand failures, certificate verification abuse, webhook failures, and cron failures could go unnoticed.
- **Required follow-up:** Add structured monitoring hooks during implementation and verify them before staging.
- **Status:** addressed in plan; implementation open under MB-013

## ADR / ubiquitous-language check

- ADR: no new ADR needed. ADR 0011 already governs entitlement-first commerce. SESSION_0030 adds a security gate plan, not a final architecture decision that supersedes ADR 0011.
- Ubiquitous language: no new domain term required. "Security gate", "brand-scope reject", and "entitlement drift" are operational terms documented in `security-privacy-payments-monitoring-plan.md` and MB-013 for now.

## Reflections

- The useful correction was rejecting the idea that a strong CGR plan should automatically become SESSION_0030 implementation scope.
- The uncomfortable gap was security: the staged plan had auth and brand-scope words, but no concrete leak-proofing gates, wireframes, or monitoring plan.
- The phrase "hacker proof" has to be translated into engineering gates. The repo can enforce no known unaddressed security issue at release gates; it cannot promise impossibility of compromise.
- Future Cody sessions should treat route placement and UI components as secondary to server-side predicates, auditability, and smoke proof.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Checked touched docs; new security plan and raw source include frontmatter; SESSION_0030 status set to `closed-full`; existing touched docs kept current `updated: 2026-04-30`. |
| Backlinks/index sweep | Added security plan to architecture README and wiki index; added SESSION_0030 backlinks to architecture README, Dirstarter inventory, and manual boundary registry. |
| Wiki lint | `bun run wiki:lint` passed with 123 markdown files and no lint violations. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | `SESSION_0030_REVIEW_01` added here and to `docs/protocols/project-log.md`. |
| Review & Recommend | Next session goal written: execute class schedule vertical slice with security gates. |
| Memory sweep | Project-scoped memory captured as MB-013 and the security/monitoring architecture doc; no operator memory write needed. |
| Next session unblock check | Unblocked after branch/worktree confirmation; first task is explicit. |
| Git hygiene | Branch `main`; `git worktree list` shows only `/Users/brianscott/dev/ronin-dojo-app`; `git diff --check` passed; `git status --short` shows uncommitted docs/spec changes from SESSION_0029/0030; no commit/push requested or authorized. |

## Bow-out line

Bowed out — SESSION_0030 closed-full. Next session goal: execute class schedule CRUD/session/instructor implementation with the security gates loaded first.
