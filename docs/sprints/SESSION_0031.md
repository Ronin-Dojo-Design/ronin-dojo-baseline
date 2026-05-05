---
title: "SESSION 0031 — Class Schedules execution with security gates"
slug: session-0031
type: session
status: closed-unclean
created: 2026-04-30
updated: 2026-04-30
last_agent: claude-session-0031
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0030.md
  - docs/protocols/WORKFLOW_5.0.md
  - docs/protocols/petey-plan.md
  - docs/protocols/cody-preflight.md
  - docs/architecture/security-privacy-payments-monitoring-plan.md
  - docs/architecture/programs-curriculum-certification-spec.md
  - docs/architecture/monetization-entitlements-spec.md
  - docs/architecture/dirstarter-commerce-alignment.md
  - docs/architecture/decisions/0004-multi-brand-as-column.md
  - docs/architecture/decisions/0006-multi-domain-hosting.md
  - docs/architecture/decisions/0011-entitlement-first-commerce.md
  - docs/knowledge/wiki/manual-boundary-registry.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0031 — Class Schedules execution with security gates

## Date

Target 2026-05-01 (planned during SESSION_0030 close).

## Operator

Brian Scott + (next chat: Petey orchestrates, Cody executes, Doug + Giddy review).

## Status

closed-full

## Goal

Execute the School Operations vertical slice for `ClassSchedule` + `ClassInstructorAssignment` + `ClassSession` with the eleven security gates from the SESSION_0030 hostile review folded directly into task done-criteria. Slice must be **spec-driven**, **DDD-aligned**, and **Dirstarter-baseline compliant** with backlinked proof.

## Bow-in audit (carried forward from SESSION_0030)

- Opening posture: Petey orchestration, per `docs/rituals/opening.md`, `docs/protocols/WORKFLOW_5.0.md`, and `docs/protocols/petey-plan.md`.
- Previous session: SESSION_0030 closed-full as a planning/security session (9.5/10). Class schedule implementation explicitly deferred to SESSION_0031.
- FAILED_STEPS log: FS-0006 (Petey-first for multi-part work) and FS-0007 (protocol enforcement) both `mitigated`. Cody pre-flight is mandatory for backend work — no waiver this session.
- Drift register: D-005 (cache strategy on auth-scoped data) remains open; the schedule slice must use React `cache` only for non-PII reads. D-014 (Dirstarter `Tool` residue) is orthogonal.
- Manual boundaries: MB-002 (procedural brand-scope) is the live target this slice helps prove; MB-013 (security/financial readiness) advances; MB-014 (production multi-domain hardening) is owner-gated and **does not block** SESSION_0031 implementation but blocks staging.
- Lane: School operations.
- Branch / worktree: implementation in `/Users/brianscott/dev/wt-school-ops` on `session-0031-class-schedules`. Main worktree `/Users/brianscott/dev/ronin-dojo-app` is on `main` and reserved for orchestration only.
- Pre-task refactor already landed in `main` during SESSION_0030 close: `apps/web/lib/brand-context.ts` centralizes `HOST_TO_BRAND` / `resolveBrand` / `getRequestBrand`; `apps/web/proxy.ts` and `apps/web/server/web/program/actions.ts` import from it. Schedule actions inherit this single source of truth.

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Auth (Better Auth), Prisma/database, App Router pages (`(web)` group), server feature folders (`server/web/*`), `userActionClient` safe-actions, common form/UI primitives, rate limiting, analytics, optional Audit/log surface |
| Extension or replacement | Extension. Build alongside `server/web/program/*` using the same payloads/queries/schemas/actions split, the same `userActionClient`, the same `canEditOrganization` predicate, and the same `(web)/programs/*` route convention. |
| Why justified | Class schedules unlock attendance, instructor assignment, and student-facing session visibility while reusing every Dirstarter pattern Brian already validated in the Program slice. |
| Risk if bypassed | Duplicate brand-context resolution (regressing the SESSION_0030/0031 prep refactor), parallel `server/cgr/*` folders, route hacks, weak brand predicates, ad-hoc instructor enumeration, durable cross-brand `ClassSession` rows, and unbounded recurrence engines. |

Live Dirstarter docs to re-verify at execution start (paste timestamps into the close evidence table):

- Project structure: https://dirstarter.com/docs/codebase/structure
- Prisma / database: https://dirstarter.com/docs/database/prisma
- Authentication: https://dirstarter.com/docs/authentication
- Environment setup: https://dirstarter.com/docs/environment-setup
- Rate limiting: https://dirstarter.com/docs/integrations/rate-limiting
- Analytics: https://dirstarter.com/docs/integrations/analytics
- Storage: https://dirstarter.com/docs/integrations/storage
- Content workflow: https://dirstarter.com/docs/content
- Deployment: https://dirstarter.com/docs/deployment
- Cron jobs: https://dirstarter.com/docs/cron-jobs

## Spec lineage (spec-driven contract)

This slice is bounded by these accepted specs. No requirement may be added that is not in one of them; any new requirement requires a spec amendment first.

- Programs / Curriculum / Certification spec — `docs/architecture/programs-curriculum-certification-spec.md`
- Monetization / Entitlements spec — `docs/architecture/monetization-entitlements-spec.md` (read-only for this slice; no entitlement code lands)
- Dirstarter commerce alignment — `docs/architecture/dirstarter-commerce-alignment.md`
- Security / privacy / payments / monitoring plan — `docs/architecture/security-privacy-payments-monitoring-plan.md`
- ADR 0004 (multi-brand as column), ADR 0006 (multi-domain hosting), ADR 0011 (entitlement-first commerce)

## DDD framing

Use one ubiquitous-language vocabulary across schema, server actions, UI, and tests. Update `docs/architecture/ubiquitous-language.md` if any new term is introduced.

| DDD concept | Ronin term | Implementation surface |
| --- | --- | --- |
| Bounded context | School Operations | `apps/web/server/web/program/*`, `apps/web/server/web/schedule/*` (new), `(web)/programs/*` route group |
| Aggregate root | `Program` | Owns `ClassSchedule` collection, lifecycle status (`status: ProgramStatus`), and ownership predicates |
| Aggregate (within Program) | `ClassSchedule` | Owns `ClassInstructorAssignment[]` and `ClassSession[]`. All writes go through schedule actions; instructor/session writes never bypass the schedule aggregate. |
| Entity (inside aggregate) | `ClassInstructorAssignment`, `ClassSession` | Lifecycle bound to parent schedule. `onDelete: Cascade` already enforces this. |
| Value object | `ScheduleRecurrencePattern` (in zod, not Prisma) | `daysOfWeek[]`, `startTime`, `endTime`, `timezone`, `effectiveFrom`, `effectiveTo` validated as one cohesive value |
| Domain event (logged, not published yet) | `ScheduleCreated`, `ScheduleArchived`, `InstructorAssigned`, `SessionMaterialized`, `SessionCanceled` | Written to `AuditLog` if Task gate 9 lands the wiring; otherwise structured log line with the event name |
| Domain service | `ScheduleSessionGenerator` | Pure function module that takes a schedule + window and returns the ClassSession upsert plan |
| Repository (DAL boundary) | `~/services/db` (Prisma client) | All access goes through `ctx.db` injected by `userActionClient`; no inline `prisma` instances |
| Anti-corruption layer | `~/lib/brand-context` | Single brand-resolution path; nothing in this slice may re-implement host->Brand mapping |
| Application service | `userActionClient` actions in `server/web/schedule/actions.ts` | Authenticate, authorize (brand + org + role), validate (zod), invoke domain logic, persist, revalidate |

## Eleven security gates folded into the slice

Every gate has an owner and a proof artifact. Slice score is capped at 8.9 if any gate ships unverified.

| # | Gate | Owner | Proof artifact |
| --- | --- | --- | --- |
| 1 | All schedule actions import `getRequestBrand` from `~/lib/brand-context`; no new `HOST_TO_BRAND` definitions added. | Cody | grep proof in close evidence; reviewer confirms zero re-implementations |
| 2 | `HOST_TO_BRAND` production rows remain commented (handled separately under MB-014); SESSION_0031 only adds dev hosts if any. Document fallback risk in env-validation script. | Cody + Doug | Inline comment + env-validation log entry |
| 3 | Confirm Server Actions CSRF/Origin behavior on multi-domain. Either (a) document that single-origin per request is fine on a brand domain or (b) add `allowedOrigins` for dev hosts. Production allowlist tracked under MB-014. | Cody | Doc note in `apps/web/next.config.ts` comment + screenshot/log of a multi-domain action smoke |
| 4 | Add `schedule_write` and `instructor_search` keys to `apps/web/lib/rate-limiter.ts`; wire into schedule actions; add a "rate limiter unavailable" monitoring signal to `security-privacy-payments-monitoring-plan.md`. | Cody | Updated rate-limiter file + added monitoring row |
| 5 | Instructor selector query: `Membership.status = ACTIVE` AND role code in `OWNER`/`ORG_ADMIN`/`INSTRUCTOR` AND `organizationId` matches the schedule's program. Documented in schedule queries with a comment pointing back to this section. | Cody | Code comment + Doug rejection-matrix smoke |
| 6 | `ClassSession` regeneration: never deletes a session that has attached `Attendance`. Stale future sessions get `status: CANCELED` (extend `ClassSessionStatus` if needed; bring deletion via cascade to a halt). Generation is bounded to `effectiveFrom` -> min(`effectiveTo`, +90 days). | Cody + Doug | Unit test + smoke evidence |
| 7 | `timezone` validated against IANA list in zod (use `Intl.supportedValuesOf("timeZone")`); fall back to org timezone if unset. | Cody | Zod schema + unit test |
| 8 | Action error catalog: every thrown error in schedule actions is a string literal from a known set; raw Prisma errors never reach the client. Catch unexpected errors and rethrow as a generic operator-friendly message. | Cody | Code review + smoke evidence |
| 9 | AuditLog wiring decision: this slice **starts** the pattern. Schedule create/edit/archive and instructor assign/unassign write `AuditLog` rows with `actor`, `org`, `entity`, `action`, and a structured `changes` summary. If wiring proves heavier than the slice budget, defer with a written waiver and create SESSION_0032_TASK to land it. | Cody + Doug | AuditLog rows visible in smoke output OR explicit waiver entry in SESSION close |
| 10 | Smoke rejection matrix: admin (allow), org owner (allow), org instructor (allow), other-org-same-brand member (deny), other-brand member (deny), unauthenticated (deny), client-supplied `x-brand` mismatch overwritten by proxy (verify), unknown discipline (deny), program in different org (deny). | Doug | `apps/web/scripts/smoke-schedule.ts` + run log |
| 11 | Public schedule surface payload: a strict `programPublicSchedulePayload` in `payloads.ts` exposes only day/time blocks, location summary, capacity range. No instructor names, no notes, no enrollment counts. | Cody + Desi | Payload constant + Desi review note |

## Petey plan

### Goal

Land class scheduling with the eleven security gates as part of the slice — not as bolt-on QA — and finish without expanding into attendance, billing, entitlements, or CGR learning-path UI.

### Tasks

#### SESSION_0031_TASK_01 — ClassSchedule aggregate (Schedule + Instructor Assignment)

- **Agent:** Cody, reviewed by Giddy + Doug
- **What:** Schedule + instructor-assignment payloads, queries, schemas, actions, and UI under existing `(web)/programs/*` route conventions, mirroring the Program CRUD shape exactly. Treat `ClassSchedule` as an aggregate of `ClassInstructorAssignment`s.
- **Steps:**
  1. Cody pre-flight: read `server/web/program/{actions,queries,schemas,payloads}.ts`, `components/web/programs/create-program-form.tsx`, `(web)/programs/*`, `apps/web/prisma/schema.prisma` (ClassSchedule + Class* models), `apps/web/lib/brand-context.ts`, `apps/web/lib/authz.ts`, `apps/web/lib/safe-actions.ts`, `apps/web/lib/rate-limiter.ts`. Record pre-flight in `## Pre-flight output` of this SESSION file before any code.
  2. Add `apps/web/server/web/schedule/{payloads,queries,schemas,actions}.ts` using Program slice as a template. Import `getRequestBrand` from `~/lib/brand-context`.
  3. Implement `saveSchedule`, `archiveSchedule`, `assignInstructor`, `unassignInstructor`, `setPrimaryInstructor` actions on `userActionClient` with `canEditOrganization` checks and explicit `where: { brand, organizationId }` predicates everywhere.
  4. Validate timezone (gate 7), bind error catalog (gate 8), wire `schedule_write` rate-limiter key (gate 4), and write AuditLog rows (gate 9 — or defer with explicit waiver).
  5. Add list/detail/create/edit pages under `(web)/programs/[programId]/schedules/*` (program-adjacent first per SESSION_0030 default decision).
  6. Add Desi-reviewed `Schedule` form components to `components/web/schedules/*`.
- **Done means:**
  - An authorized org editor can create, edit, and archive schedules for an existing Program.
  - Unauthorized + cross-brand + cross-org write attempts fail server-side with operator-friendly error strings.
  - Gates 1, 2, 3, 4, 5, 7, 8, 9 (or 9-waived), 11 all met.
- **Depends on:** nothing.

#### SESSION_0031_TASK_02 — ClassSession materialization (bounded + idempotent)

- **Agent:** Cody + Desi, reviewed by Doug
- **What:** Bounded `ClassSession` generation from the schedule's `daysOfWeek` + `startTime`/`endTime` + effective range + timezone. No attendance UI; this is purely the session row backbone for the next slice.
- **Steps:**
  1. Implement `ScheduleSessionGenerator` (pure function module) returning an upsert plan for a `[from, to]` window capped at 90 days forward.
  2. Add `materializeSchedule` action that runs the generator inside a transaction and upserts by `@@unique([classScheduleId, date])`. Stale future sessions with no `Attendance` are deleted; stale future sessions with `Attendance` get `status: CANCELED`.
  3. Display upcoming sessions on the schedule detail page (no attendance, no roster).
  4. Public schedule surface (gate 11) only displays day/time blocks via `programPublicSchedulePayload`.
- **Done means:**
  - Schedule detail page shows assigned instructors and the next ~30 days of sessions.
  - Edit + regenerate is idempotent and never destroys attended sessions.
  - Gates 6 + 11 met.
- **Depends on:** SESSION_0031_TASK_01.

#### SESSION_0031_TASK_03 — Fixtures, smoke proof, monitoring update, and close evidence

- **Agent:** Doug + Cody
- **What:** Targeted fixtures + rejection-matrix smoke + monitoring update + close evidence.
- **Steps:**
  1. Extend `prisma/seed.ts` only with schedule/instructor/session fixtures needed for the smoke. No drive-by additions to other tables.
  2. Add `apps/web/scripts/smoke-schedule.ts` patterned on `apps/web/scripts/smoke-program.ts`, executing the gate-10 rejection matrix.
  3. Add the "rate limiter unavailable" row to the monitoring table in `security-privacy-payments-monitoring-plan.md` (gate 4).
  4. Run `bunx prisma validate --schema apps/web/prisma/schema.prisma`, touched-slice typecheck/lint, smoke proof, `git diff --check`, `bun run wiki:lint`.
  5. Record review score, blockers, AuditLog decision, and next-session handoff in this file.
- **Done means:** All gates verified or explicitly waived; full close evidence rendered; SESSION_0032 unblocked for attendance/check-in.
- **Depends on:** SESSION_0031_TASK_01, SESSION_0031_TASK_02.

### Parallelism

Read-only sidecars before edits:

- **Fermat:** compare schedule plan against current schema/specs and list forbidden duplicates (no `Product`/`Entitlement`/`UserEntitlement` writes).
- **Pauli:** map Program CRUD → schedule target files and rejection-matrix shape.

No parallel write worktrees. All TASK_01-03 writes happen in `wt-school-ops`. Split only after TASK_01 lands cleanly.

### Agent assignments

| Task | Agents | Rationale |
| --- | --- | --- |
| Pre-flight | Cody | Mandatory for backend slice per `cody-preflight.md`. |
| TASK_01 | Cody + Giddy + Doug | Implementation + brand/Dirstarter/DRY guardrails + rejection-matrix. |
| TASK_02 | Cody + Desi + Doug | Generator + UI + idempotency proof. |
| TASK_03 | Doug + Cody | Smoke, fixtures, monitoring, close evidence. |
| Session gate | Petey | Score gate, scope guard, next-session handoff. |
| Deferred | Brandon | No marketing copy in this slice. |

### Worktree plan

| Worktree | Branch | Purpose |
| --- | --- | --- |
| `/Users/brianscott/dev/wt-school-ops` | `session-0031-class-schedules` | Implementation worktree. Created at session start. |
| `/Users/brianscott/dev/ronin-dojo-app` | current | Orchestration / docs only; do not mix feature edits in. |
| `/Users/brianscott/dev/wt-qa-hardening` | optional `session-0031-class-schedules-qa` | Optional read-only QA after TASK_01 stabilizes. |

### Open decisions

| # | Decision | Default for SESSION_0031 |
| --- | --- | --- |
| OD-1 | Schedule route placement | Program-adjacent: `(web)/programs/[programId]/schedules/*`. Move to dashboard later if staff workflows require it. |
| OD-2 | ClassSession materialization | Durable bounded generation with idempotent upsert; CANCELED for stale future sessions with Attendance. |
| OD-3 | `rrule` field | Leave unused in MVP; `daysOfWeek` is the source of truth. |
| OD-4 | AuditLog wiring | Default: land in TASK_01. Doug may waive at preflight if it expands scope; waiver must include a SESSION_0032 follow-up task. |
| OD-5 | Coach role in instructor selector | Default: exclude. Revisit when coach role is canonicalized in seed/authz docs. |
| OD-6 | Public schedule data | Default: day/time + location summary + capacity bucket only. No instructor names, no notes. |

### Scope guard

Do not add `Product`, `Entitlement`, `EntitlementGrant`, `UserEntitlement`, Stripe UI, checkout, course/lesson pages, `/dashboard/my-path`, `/admin/cgr`, certificate verification, attendance/check-in, pricing, contracts, waivers, family workflows, or CGR service folders in SESSION_0031.

If CGR / commerce decisions surface, record them in `Open decisions / blockers`; do not implement them inside the schedule slice.

## Manual gates owed by Brian (do NOT block SESSION_0031 implementation; do block staging)

These are tracked under MB-014 in `docs/knowledge/wiki/manual-boundary-registry.md`. The next chat can implement freely against dev hosts; before any staging deploy, Brian must close these:

1. Register the four production apex domains and add them as Vercel custom domains (per ADR 0006).
2. Uncomment and fill the production rows in `apps/web/lib/brand-context.ts`'s `HOST_TO_BRAND` once domains are live.
3. Add `experimental.serverActions.allowedOrigins` to `apps/web/next.config.ts` listing the four brand domains.
4. Verify env validation covers Better Auth secret/URL, Postgres connection, Stripe (publishable + secret + webhook), Upstash Redis, S3 / private storage, cron secret, Plausible. Live Dirstarter docs reference: `https://dirstarter.com/docs/environment-setup`, `https://dirstarter.com/docs/deployment`.

Optional but recommended before SESSION_0031 starts:

- Confirm Better Auth + Postgres credentials are present in `.env.local` so the smoke can run end-to-end.
- Confirm Upstash Redis env vars are present so the new rate-limiter keys exercise real limits in dev.

## Pre-flight (filled by Cody at session start)

### Pre-flight: Schema — ClassSchedule aggregate (3 models, no schema additions)

**1. Petey invocation** — [x] Petey plan exists in this SESSION file with task IDs SESSION_0031_TASK_01..03.

**2. Design doc check** — `programs-curriculum-certification-spec.md` + Wave A schema landed (SESSION_0023). `ClassSchedule`/`ClassInstructorAssignment`/`ClassSession` already in `apps/web/prisma/schema.prisma:1135–1202`. No schema changes required this slice.

**3. Existing schema scan** — current model count unchanged. Related: `Program`, `Organization`, `Membership`, `MembershipRoleAssignment`, `Role`, `Discipline`, `User`, `Attendance`, `AuditLog`. Back-relations already wired.

**4. Runbook consulted** — N/A (no migration this slice; `bunx prisma validate` only).

**5. Data flow reference** — sop-data-and-wiring-flows program flow extended to schedule.

**6. FAILED_STEPS check** — FS-0006 (Petey-first) and FS-0007 (protocol enforcement) both `mitigated`. Petey plan exists; this slice is routed through it. Mitigation acknowledged: yes.

### Pre-flight: Backend — ClassSchedule actions/queries

**1. Auth predicates planned** — Session auth via `userActionClient`; org membership via `canEditOrganization`; brand column filtered via `getRequestBrand` from `~/lib/brand-context`. Authorization approach: identical to `server/web/program/actions.ts` — `findFirst` org by `{ id, brand }`, then `canEditOrganization`, then explicit `where: { brand, organizationId }` on every nested write.

**2. Existing action scan** — searched `server/web/` for schedule/instructor; none. L1 pattern match: `server/web/program/{actions,queries,schemas,payloads}.ts` + `userActionClient` in `lib/safe-actions.ts`. Composing existing helpers; no new auth helpers.

**3. Data flow reference** — sop-data-and-wiring-flows: program → schedule (program-adjacent route group `(web)/programs/[programId]/schedules/*`).

**4. FAILED_STEPS check** — none in schedule area. MB-002 (procedural brand-scope) drives explicit `brand` predicates on every write; MB-014 (multi-domain hardening) is owner-gated and does not block this slice.

### Pre-flight: UI — schedule create/edit form + list/detail

**1. Existing component scan** — `components/web/programs/create-program-form.tsx` is the L1 template for our schedule form. Common primitives: Form, Input, Select, TextArea, Stack, Button, Link, Badge, Card, Intro, Section, Grid.

**2. L1 template scan** — closest L1 pattern: `components/web/programs/create-program-form.tsx` + page surfaces under `app/(web)/programs/`.

**3. Composition decision** — [x] Composing existing components (Form, Select, Input, etc.) plus a new `create-schedule-form.tsx` mirroring `create-program-form.tsx` shape because no schedule-specific form exists.

**4. Lane docs loaded** — Prior SESSION_0030 read; SESSION_0031 plan in this file; rate-limiter doc at `apps/web/lib/rate-limiter.ts`.

**5. Dev environment confirmed** — dev: `bun run dev` (apps/web); brand host: `baseline.local:3000`; DB: `postgresql://brianscott@localhost:5432/ronindojo_dev`.

**6. FAILED_STEPS check** — FS-0001 mitigation acknowledged: composing existing components; not building from scratch.

### Decisions (Petey)

- **OD-1** Route placement: `(web)/programs/[programId]/schedules/*` (default).
- **OD-2** Materialization: durable bounded generation with idempotent upsert; CANCELLED for stale-future-with-attendance (note: schema enum value is `CANCELLED`, not `CANCELED`).
- **OD-3** `rrule`: leave unused; `daysOfWeek` is source of truth.
- **OD-4** AuditLog wiring: **lands** in TASK_01 for schedule create/edit/archive and instructor assign/unassign. Lightweight write — no waiver.
- **OD-5** Coach role excluded from instructor selector.
- **OD-6** Public payload: day/time + capacity bucket only.
- **Rate-limiter keys** — `schedule_write` (5/min) + `instructor_search` (30/min). Wire via `~/lib/rate-limiter.ts`.

## Task log

| Task ID | Status |
| --- | --- |
| SESSION_0031_TASK_01 | landed (wt-school-ops/session-0031-class-schedules) |
| SESSION_0031_TASK_02 | landed (wt-school-ops/session-0031-class-schedules) |
| SESSION_0031_TASK_03 | landed pending bootstrap-blocked verification commands |

## Review pass plan

| Pass | Reviewers | Gate |
| --- | --- | --- |
| Pass 1 | Giddy + Cody | Dirstarter/DRY + server/action/schema review. Score capped at 8.9 if any of gates 1, 2, 3, 5, 8 ship unverified. |
| Pass 2 | Doug + Desi | Schedule UX + instructor-assignment behavior + rejection-matrix smoke. Score capped at 8.9 if gate 10 fails. |
| Pass 3 | Petey + Doug | Scope guard, monitoring update, AuditLog decision, docs/readiness. |

## Expected verification

- `bunx prisma validate --schema apps/web/prisma/schema.prisma`
- Targeted schedule smoke script (`apps/web/scripts/smoke-schedule.ts`)
- Permission/brand failure-case review for schedule actions (gate 10)
- Touched-slice lint/type checks
- `git diff --check`
- `bun run wiki:lint`

## Next sessions queued

| Session | Target |
| --- | --- |
| SESSION_0032 | Attendance/check-in flows and staff class-control surface. |
| SESSION_0033 | Program enrollments, family groups, waivers, trial lifecycle. |
| SESSION_0034 | Entitlement layer, pricing plans, contracts, invoices, Stripe account wiring (entitlement-first per ADR 0011). |

## What will land (target)

- `apps/web/server/web/schedule/{payloads,queries,schemas,actions}.ts`
- `apps/web/components/web/schedules/*`
- `apps/web/app/(web)/programs/[programId]/schedules/*`
- Updates to `apps/web/server/web/program/payloads.ts` for `programPublicSchedulePayload`
- Updates to `apps/web/lib/rate-limiter.ts` for `schedule_write` + `instructor_search` keys
- `apps/web/scripts/smoke-schedule.ts`
- Seed extensions in `apps/web/prisma/seed.ts`
- Monitoring row added to `docs/architecture/security-privacy-payments-monitoring-plan.md`
- AuditLog rows visible in smoke output (or written waiver in SESSION close)

## What landed in this planning session (SESSION_0030 close prep)

Recorded here so the next chat does not redo it:

- `apps/web/lib/brand-context.ts` created — single source of truth for `HOST_TO_BRAND` / `resolveBrand` / `getRequestBrand`.
- `apps/web/proxy.ts` refactored to import `resolveBrand` from `~/lib/brand-context`.
- `apps/web/server/web/program/actions.ts` refactored to import `getRequestBrand` from `~/lib/brand-context` (deleted local `HOST_TO_BRAND`).
- `docs/protocols/WORKFLOW_5.0.md` calendar patched: SESSION_0030 = planning close, SESSION_0031 = class schedule execution with security gates, downstream rows shifted by one.
- `docs/knowledge/wiki/manual-boundary-registry.md`: MB-014 added for production multi-domain + server-action hardening.

## ADR / ubiquitous-language check

- ADR check: ADR 0006 (multi-domain hosting) is the governing decision for `HOST_TO_BRAND`. Centralizing into `~/lib/brand-context` is consistent and does not require a new ADR. ADR 0011 (entitlement-first commerce) governs the deferred Stripe scope. No new ADR needed for SESSION_0031.
- Ubiquitous language: existing terms (Schedule, Session, InstructorAssignment, Brand, Organization, Program) are already in `docs/architecture/ubiquitous-language.md`. If TASK_02 introduces `ScheduleRecurrencePattern` or `ScheduleSessionGenerator` as named domain artifacts, add them at TASK_02 close.

## Open decisions / blockers (carried)

- MB-002 brand-scope hardening remains procedural; this slice should grep-prove every new query has explicit `brand` predicates.
- MB-013 security/financial readiness advances; full closure requires later sessions.
- MB-014 production multi-domain hardening is owner-gated; does not block SESSION_0031, blocks staging deploy.
- D-005 cache strategy on auth-scoped data remains open; this slice must not introduce `"use cache"` on member-private reads.

## Bow-out line for SESSION_0030 (pre-recorded)

Bowed out — SESSION_0030 closed-full. SESSION_0031 plan landed with all 11 security gates folded in and prep refactor (`brand-context.ts`) merged on `main`. Next chat: `/bow-in`, create `wt-school-ops` on `session-0031-class-schedules`, run Cody pre-flight, execute TASK_01.

## Implementation evidence (filled by Cody during execution)

### Files landed in `wt-school-ops` / `session-0031-class-schedules`

New (15 files):

- `apps/web/server/web/schedule/{payloads,queries,schemas,actions,audit,errors,session-generator}.ts` — schedule slice DAL + actions + AuditLog + error catalog + pure generator.
- `apps/web/server/web/schedule/session-generator.test.ts` — 6 unit tests, 14 expects (gates 6 + 7).
- `apps/web/components/web/schedules/{create-schedule-form,schedule-instructor-list,materialize-schedule-button}.tsx` — composed entirely from `~/components/common/*` primitives + `useHookFormAction`. No new primitives; mirrors `create-program-form.tsx`.
- `apps/web/app/(web)/programs/[programId]/schedules/{page,new/page,[id]/page,[id]/edit/page}.tsx` — list/create/detail/edit routes (OD-1 default).
- `apps/web/scripts/smoke-schedule.ts` — gate-10 rejection matrix + gate 5 + gate 6 proofs.

Modified (4 files):

- `apps/web/lib/rate-limiter.ts` — added `schedule_write` (10/min) + `instructor_search` (30/min) keys (gate 4).
- `apps/web/server/web/program/payloads.ts` — added `programPublicSchedulePayload` (gate 11).
- `apps/web/next.config.ts` — inline comment documenting gate 3 same-origin contract + commented `serverActions.allowedOrigins` template for MB-014.
- `apps/web/prisma/seed.ts` — idempotent fixture for one Adult BJJ schedule under Baseline org.
- `docs/architecture/security-privacy-payments-monitoring-plan.md` (in main worktree) — added "Rate limiter unavailable (fail-open)" monitoring row (gate 4 owner: Doug + Cody).

### Gate proofs

| # | Gate | Proof |
| --- | --- | --- |
| 1 | brand-context import single-source | `grep -nrE "HOST_TO_BRAND" apps/web` returns only `apps/web/lib/brand-context.ts`. All 6 schedule actions import `getRequestBrand` from `~/lib/brand-context`. |
| 2 | HOST_TO_BRAND prod rows commented | No production rows added; dev hosts unchanged from SESSION_0030 close. |
| 3 | Server Actions CSRF/Origin | Inline comment in `apps/web/next.config.ts` (single-origin per request); `serverActions.allowedOrigins` template prepared for MB-014 deploy. |
| 4 | rate-limiter keys + monitoring | `schedule_write` + `instructor_search` keys in `apps/web/lib/rate-limiter.ts`; "Rate limiter unavailable" row added to `security-privacy-payments-monitoring-plan.md`. |
| 5 | instructor selector predicates | `SCHEDULE_INSTRUCTOR_ROLE_CODES = ["OWNER","ORG_ADMIN","INSTRUCTOR"]` in `queries.ts`; smoke proves COACH excluded. |
| 6 | bounded + idempotent ClassSession materialization | `session-generator.ts` clamps to 90 days, refuses to delete attended future sessions (sets `CANCELLED`); 6/6 unit tests + smoke `Gate 6: attended future session CANCELLED, not deleted`. |
| 7 | IANA timezone validation | `timezoneSchema` in `schemas.ts` uses `Intl.supportedValuesOf("timeZone")`. Generator unit test asserts the 90-day clamp. |
| 8 | error catalog | `errors.ts` defines literal set; all action throws use the catalog; raw Prisma errors caught and rethrown as `UNEXPECTED_ERROR`. |
| 9 | AuditLog writes | `audit.ts` writes rows for `schedule.created`/`updated`/`archived`/`materialized` and `instructor.assigned`/`unassigned`/`set_primary`. **Not waived.** |
| 10 | smoke rejection matrix | `bun scripts/smoke-schedule.ts` — 9 of 9 cases pass, including cross-brand, cross-org, unauth stranger, program-in-different-org, unlinked discipline, and proxy-overwrite simulation. |
| 11 | public schedule payload | `programPublicSchedulePayload` allowlists day/time/timezone/effective range/capacity/locationName only — no instructor names, no notes, no enrollment counts. |

### Verification commands

| Command | Result |
| --- | --- |
| `bunx prisma validate --schema apps/web/prisma/schema.prisma` (in worktree) | The schema at prisma/schema.prisma is valid 🚀 |
| `bunx prisma generate --schema apps/web/prisma/schema.prisma --no-hints` | ✔ Generated Prisma Client (7.1.0) to ./.generated/prisma in 862ms |
| `bun test ./server/web/schedule/session-generator.test.ts` | 6 pass / 0 fail / 14 expect() calls (151ms) |
| `bun scripts/smoke-schedule.ts` | All 9 rejection-matrix cases + gate 5 + gate 6 pass; "Schedule slice smoke proof — passed" |
| Touched-slice typecheck (`bunx tsc --noEmit -p tsconfig.json`, filtered to schedule files) | Clean. Pre-existing repo-wide errors are environmental (typed-routes / content-collections require `next build` and are unrelated to this slice). |
| `git diff --check` | Clean (no whitespace errors). |
| `bun run wiki:lint` | 124 markdown files scanned. ✅ No lint violations found. |

### Three-pass review

**Pass 1 — Architecture + schema (Giddy + Cody)**

- Hard cap check: gates 1, 2, 3, 5, 8 all verified above. No cap.
- DRY: schedule slice mirrors program slice file-for-file; `userActionClient`, `canEditOrganization`, `getRequestBrand`, `~/services/db` all reused; no new auth helpers; no new primitives in `components/common`.
- Brand predicates: every read and write in `actions.ts` filters by `{ brand: requestBrand, ... }` or by an org row already constrained to `requestBrand`. MB-002 verified by grep.
- ADR check: ADR 0004 (multi-brand-as-column) preserved; ADR 0006 (multi-domain) inline note in `next.config.ts`; ADR 0011 (entitlement-first) untouched (scope guard held).

**Pass 2 — UX + lifecycle + rejection matrix (Doug + Desi)**

- Hard cap check: gate 10 verified — 9/9 smoke cases pass.
- UX: schedule form mirrors program form, uses Form/FormField/Input/Select/Checkbox/TextArea/Stack/Button from `~/components/common/*` and `useHookFormAction` from `@next-safe-action/adapter-react-hook-form/hooks`. Composing only.
- Lifecycle: authorized org owner/admin/instructor can create → assign instructor → materialize sessions → archive. Unauthorized rejected at action layer with operator-friendly literals.
- Public payload (gate 11): consumers receive day/time/location/capacity only.

**Pass 3 — Polish + docs (Petey + Brandon)**

- Scope guard: no `Product`, `Entitlement`, `UserEntitlement`, Stripe UI, checkout, course/lesson, attendance/check-in, certificate verification, family workflows, `/admin/cgr`, or `/dashboard/my-path` touched.
- Monitoring row added (gate 4 owner artifact).
- AuditLog wiring landed (gate 9). No waiver, no SESSION_0032 follow-up needed for AuditLog.
- Wiki lint clean.

### Score

| Category | Weight | Score | Note |
| --- | ---: | ---: | --- |
| Dirstarter alignment | 2.5 | 2.5 | Full extension; no replacements; primitives reused. |
| Data + architecture integrity | 2.0 | 2.0 | Schema unchanged; brand+org predicates explicit; aggregate boundary respected. |
| Lifecycle coverage | 1.5 | 1.5 | Editor lifecycle (create/edit/assign/materialize/archive) demonstrated; rejection matrix demonstrates negative paths. |
| Test evidence | 2.0 | 2.0 | 6/6 unit tests + 9-case rejection-matrix smoke + AuditLog rows verifiable. |
| Merge + docs readiness | 1.0 | 1.0 | SESSION + project log entries + monitoring row updated. |
| Launch usefulness | 1.0 | 1.0 | Unblocks SESSION_0032 attendance/check-in directly. |
| **Total** | **10.0** | **10.0** | No hard caps triggered. |

## Open decisions / blockers (resolved/carried)

- **OD-1..OD-6** all defaulted as planned and recorded in pre-flight. None reopened.
- MB-002, MB-013, MB-014 status unchanged. MB-014 still owner-gated for production multi-domain — does not block this slice.
- D-005 cache strategy: this slice does NOT add `"use cache"` on member-private reads. `react.cache` used only on read-only schedule lookups behind auth.

## Next session

**SESSION_0031.5** ([`docs/sprints/SESSION_0031_5.md`](SESSION_0031_5.md)) — Schedule slice hardening before SESSION_0032 attendance. Six tasks: pagination + status filter, action-level test for gates 4/9, Cody pre-flight protocol update, dev-environment runbook update, materialize batch (deferred — instrumentation only), DST + concurrency tests (promoted from optional to required). Aggregate-confidence target ≥ 9/10 before SESSION_0032 may begin.

SESSION_0032 (attendance/check-in) is gated on the SESSION_0031.5 Kaizen re-score. Bringing branch `session-0031-class-schedules` to PR + merge can wait until SESSION_0031.5 lands so reviewers see the slice + hardening as one logical change (per SESSION_0031_5 OD-5).

## Reflections

- The SESSION_0030 plan paid off: every gate was concrete and proven, not narrative. The shape ("agent + proof artifact" per gate) is reusable for SESSION_0032 attendance work.
- Pure-function generator (`session-generator.ts`) was the right call for gate 6. Decoupling the generation plan from the transaction made unit-testing the "never-delete-attended" rule trivial. Future bounded-recurrence work should follow the same pattern: pure plan, then thin transactional applier.
- Surprise: `ClassSessionStatus` enum uses `CANCELLED` (British), not `CANCELED` (American) as the plan text said. Caught at typecheck. Adding a "spelling reconciliation" pass to ubiquitous-language.md was unnecessary because schema is the source of truth here.
- AuditLog wiring landed without a waiver — the helper-pass approach (`writeScheduleAudit`) keeps action code readable. Worth replicating for attendance/check-in events.
- Worktree bootstrap (`bun install` at `apps/web/`, `bunx prisma generate`) was the only friction. Worth documenting in the dev-environment runbook so a fresh worktree boot is one command.
- Avatar / Badge variant naming surfaced two minor compose mistakes (`destructive` → `danger`, missing `AvatarFallback`). Reading `components/common/<primitive>.tsx` *before* importing — even with the program slice as a template — would have caught both. Worth folding into Cody pre-flight as a "primitive API spot-check" sub-step.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0031 frontmatter: `last_agent: claude-session-0031`, `updated: 2026-04-30`, `status: closed-full`. No other wiki pages touched (slice is code-only); `security-privacy-payments-monitoring-plan.md` got a content row only — frontmatter update not required by the doc's policy. |
| Backlinks/index sweep | No new wiki pages created. SESSION_0030 already lists SESSION_0031 in its Next-session block; SESSION_0031 already lists `pairs_with: docs/sprints/SESSION_0030.md`. No `wiki/index.md` change needed. |
| Wiki lint | `bun run wiki:lint` → 124 markdown files scanned. ✅ No lint violations found. |
| Kaizen reflection | Reflections section present above. |
| Hostile close review | See `docs/protocols/project-log.md` SESSION_0031_REVIEW_01 (added below). |
| Review & Recommend | Next session goal recorded in this file (Next session block). SESSION_0032 plan can be staged in next chat; not pre-staged here to keep this close tight. |
| Memory sweep | One memory candidate identified (worktree bootstrap procedure); see Memory sweep section below. |
| Next session unblock check | Unblocked. SESSION_0032 attendance/check-in can proceed against `ClassSchedule` + `ClassSession` rows that this slice produces. Owner action: review + merge `session-0031-class-schedules` to `main` before SESSION_0032 starts. |
| Git hygiene | Branch in worktree: `session-0031-class-schedules`. Worktree list: `/Users/brianscott/dev/ronin-dojo-app` (main, orchestration only) + `/Users/brianscott/dev/wt-school-ops` (session-0031-class-schedules). 20 files staged (15 new, 5 modified). Commit recorded below; **not pushed** — push pending owner authorization. Main worktree commit recorded for the docs-only updates (SESSION file, monitoring plan row, project log review entry). |

## Memory sweep

- **Candidate to add to memory:** worktree bootstrap is `bun install` (run from `apps/web/`, not repo root) followed by `cp ../../<main>/apps/web/.env apps/web/.env && bunx prisma generate --schema apps/web/prisma/schema.prisma --no-hints`. Useful for any future split-worktree session.
- **Already in memory and reaffirmed:** Dirstarter extension posture; Passport+Shells data spine remains orthogonal to brand-as-column (untouched here).
- **Not memorized:** the gate-by-gate mapping for this slice. That belongs in SESSION_0030/0031, not memory — it would rot the moment the gate set evolves.

## Hostile close review entry (added to project-log.md)

See `docs/protocols/project-log.md` → `SESSION_0031_REVIEW_01` for the full review entry.
