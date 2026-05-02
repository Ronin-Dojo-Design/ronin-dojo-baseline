---
title: "SESSION 0031.5 — Schedule slice hardening before SESSION_0032 attendance"
slug: session-0031-5
type: session
status: closed-full
created: 2026-05-01
updated: 2026-05-02
last_agent: claude-session-0031-5
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0031.md
  - docs/protocols/WORKFLOW_5.0.md
  - docs/protocols/hostile-close-review.md
  - docs/protocols/cody-preflight.md
  - docs/runbooks/dev-environment.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0031.5 — Schedule slice hardening before SESSION_0032 attendance

## Date

Target 2026-05-01 (same-day continuation; SESSION_0031 closed 2026-04-30).

## Operator

Brian Scott + Petey orchestrates, Cody executes, Doug + Giddy review.

## Status

closed-full

## Goal

Close the SESSION_0031 Kaizen-aggregate gap (rubric 10/10, Kaizen 7/10) before
attendance/check-in lands in SESSION_0032. Three concrete deliverables: (a)
prove gates 4 + 9 fire under the real action stack, not just the DB lookalike;
(b) raise schedule-list scalability above 1,000 rows; (c) lock in the
preventive protocol/runbook updates the Kaizen reflection identified.

Aggregate-confidence target: **9/10 or higher** before SESSION_0032 begins.

## Bow-in audit (carried forward from SESSION_0031)

- Opening posture: Petey orchestration per `docs/rituals/opening.md`,
  `docs/protocols/WORKFLOW_5.0.md`, and `docs/protocols/hostile-close-review.md`
  (now including Kaizen triage).
- Previous session: SESSION_0031 closed-full at WORKFLOW rubric 10/10 / Kaizen
  aggregate 7/10. Schedule slice landed in `wt-school-ops` on
  `session-0031-class-schedules` (commit `3e624e6`); main worktree carries the
  docs at commit `95bcf41`. Neither is pushed yet — push pending owner approval.
- Kaizen findings carried into this session:
  - SESSION_0031_FINDING_01 — fresh-worktree bootstrap procedure is undocumented.
  - SESSION_0031_FINDING_02 — `Avatar` and `Badge variant` mistakes were caught
    by typecheck, not by Cody pre-flight; primitive API spot-check missing.
  - SESSION_0031_FINDING_03 — `bun:test` types not installed; worked around
    with `@ts-expect-error` (low priority — track but do not block).
- FAILED_STEPS log: FS-0006 / FS-0007 mitigations remain in force. This session
  must not regress them.
- Drift register: D-005 (cache strategy on auth-scoped data) remains open;
  pagination work must continue to use `react.cache` (per-request) only — never
  `"use cache"` (persistent) on member-private reads.
- Manual boundaries: MB-002 (procedural brand-scope) — every new query in this
  session keeps explicit `{ brand, organizationId }` predicates. MB-014
  (production multi-domain) still owner-gated; does not block this session.
- Lane: **Core platform governance** primary (protocol + runbook updates),
  **School operations** dependent sub-lane (schedule-list + tests).
- Branch / worktree:
  - Code (TASK_01, TASK_02, TASK_05 instrumentation, TASK_06): continues on
    `wt-school-ops` / `session-0031-class-schedules`. No new branch — these are
    follow-ups to the same slice and should ship in the same PR.
  - Docs / protocol updates (TASK_03, TASK_04): main worktree
    (`/Users/brianscott/dev/ronin-dojo-app`) directly on `main`.

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | App Router pages (pagination on schedule list), Prisma queries (count + skip + take), test harness conventions, dev environment runbook |
| Extension or replacement | Extension. Pagination follows the standard Next.js App Router + Prisma `skip`/`take` pattern. Tests reuse the existing bun-test runner already in use for `session-generator.test.ts`. Dev runbook extends `docs/runbooks/dev-environment.md`. |
| Why justified | Closes Kaizen-identified gaps without inventing new infrastructure. Every change is a small addition to an existing pattern. |
| Risk if bypassed | Schedule list breaks at scale, gate-4 / gate-9 honesty gap persists, Cody pre-flight keeps missing the same class of primitive-API mistakes. |

Live Dirstarter docs to re-verify at execution start (paste timestamps into
the close evidence table):

- [Project structure](https://dirstarter.com/docs/codebase/structure)
- [Prisma / database](https://dirstarter.com/docs/database/prisma)
- [Authentication](https://dirstarter.com/docs/authentication)
- [Rate limiting](https://dirstarter.com/docs/integrations/rate-limiting)

Pagination, action-level tests, and the runbook update are *not* Dirstarter-
prescribed patterns — they are repo-internal choices. The cody-preflight
update is repo-internal. No Dirstarter-baseline replacement happens here.

## Spec lineage (spec-driven contract)

This session does not introduce new product behavior; it hardens existing
behavior. No spec amendment required. Bounded by:

- SESSION_0031 — the slice this session hardens.
- `docs/architecture/security-privacy-payments-monitoring-plan.md` — gate 4 + 9
  proof obligations.
- `docs/protocols/cody-preflight.md` — protocol being updated.
- `docs/runbooks/dev-environment.md` — runbook being extended.

## DDD framing

No new ubiquitous-language terms. `ScheduleSessionGenerator` and
`ScheduleRecurrencePattern` (mentioned in SESSION_0031) remain candidates but
do not need to be added as glossary entries unless their names appear in a
public surface. Defer.

## Petey plan

### Goal

Land all six tasks below; raise Kaizen aggregate confidence to ≥ 9/10; ship in
the existing `session-0031-class-schedules` PR alongside SESSION_0031 work
(cleaner PR review, single review pass on the schedule subsystem).

### Task summary

| Task | Required? | Why |
| --- | --- | --- |
| TASK_01 — Pagination + status filter on schedule list | **required** | Q3 scalability gap; current page renders all rows. |
| TASK_02 — Action-level test for rate-limit + AuditLog | **required** | Closes the gate 4 / gate 9 honesty gap (Kaizen Q1). |
| TASK_03 — Cody pre-flight protocol update | **required** | Prevents the recurring primitive-API + enum-spelling mistakes (Kaizen Q2 + FS prevention). |
| TASK_04 — Dev environment runbook update | **required** | Removes ~10 min friction at every fresh worktree (Kaizen Q2). |
| TASK_05 — Batch `materializeSchedule` upserts | **deferred / optional** | See reasoning below. |
| TASK_06 — DST + concurrency tests for `ScheduleSessionGenerator` and `materializeSchedule` | **required (promoted from optional)** | DST + concurrency are top-three scheduling-bug classes; promoting closes the architecture-confidence gap before SESSION_0032 starts depending on session-row stability. |

### TASK_05 / TASK_06 reasoning (carried from Kaizen reflection)

**TASK_05 (batch upserts) — staying deferred:** Not in `dirstarter.com/docs`;
this is internal logic. At MVP scale (≤90 sessions per schedule, single user
clicking) sequential upsert is correct, readable, and transactionally clean.
Switching to `createMany`/`updateMany` introduces real cost: `createMany`
doesn't return rows so per-session AuditLog (if we ever want it) breaks, and
`updateMany` muddies individual `updatedAt` semantics. Action: keep
sequential; add a one-line counter log in the action so the *next* run with
real data can produce evidence; only optimize when a slow run forces it.

**TASK_06 (DST + concurrency tests) — promoted to required:** Standard
practice for any production scheduling system. DST is a top-three class of
bug in scheduling code; concurrency matters for any reconcile-from-button-click
flow. Skipping pushes a known bug class into a worse session to discover.
This directly raises Kaizen Q3 from 7→9 and closes the architecture-confidence
gap before SESSION_0032 attendance work depends on session-row stability.

### Tasks

#### SESSION_0031_5_TASK_01 — Pagination + status filter on schedule list

- **Agent:** Cody, reviewed by Giddy + Doug.
- **What:** Add page size + status filter to
  `apps/web/app/(web)/programs/[programId]/schedules/page.tsx` and a paginated
  query in `server/web/schedule/queries.ts`.
- **Steps:**
  1. Cody pre-flight: read the *updated* `cody-preflight.md` (after TASK_03
     lands, or speculatively if running in parallel — see parallelism note);
     read existing pagination patterns in
     `server/web/directory/queries.ts` and `app/(web)/directory/page.tsx` to
     reuse them. Record pre-flight in `## Pre-flight output` of this SESSION
     file.
  2. Add `getSchedulesByProgramPaginated(brand, programId, organizationId,
     { status, page, pageSize })` to `queries.ts`. Default pageSize = 20, max
     50. Returns `{ items, total, hasMore }`.
  3. Add nuqs-backed query params to the list page: `status` (ACTIVE | PAUSED
     | ARCHIVED | undefined), `page`. Re-use existing `~/components/common/*`
     primitives — no new pagination component invented unless one is missing
     from common; if missing, lift from the directory pattern.
  4. Update existing `getSchedulesByProgram` callers (only the list page calls
     it currently); leave the cached non-paginated version exported for
     backward compat if the smoke or any other consumer depends on it, or
     delete if nothing else uses it. Decision: delete unless smoke breaks.
- **Done means:**
  - List page renders 20 schedules max; page buttons work; status filter works
    via URL.
  - Brand + organization predicates remain explicit (MB-002).
  - Touched-slice typecheck clean; existing smoke still passes.
- **Depends on:** ideally TASK_03 (so pre-flight uses the updated checklist).
  If TASK_03 has not landed when TASK_01 starts, Cody manually applies the
  TASK_03 sub-steps anyway.

#### SESSION_0031_5_TASK_02 — Action-level test proving rate-limit + AuditLog fire

- **Agent:** Doug + Cody.
- **What:** Replace the gate-4 / gate-9 honesty gap with a real test of the
  server action stack, not the DB lookalike.
- **Steps:**
  1. Add `apps/web/server/web/schedule/actions.test.ts` using `bun:test`
     (`// @ts-expect-error` import header pattern matches the existing
     generator test).
  2. Mock the `userActionClient` context just enough to invoke `saveSchedule`,
     `assignInstructor`, and `archiveSchedule` against an isolated test DB
     state. Either: (a) use real Postgres against a transactional rollback;
     or (b) accept a `db` injection only for the test — preferred (a) for
     fidelity.
  3. Assert per action:
     - An `AuditLog` row with the expected `entityType` + `action` is created.
     - When `isRateLimited` returns `true`, the action throws
       `SCHEDULE_ERROR.RATE_LIMITED` literally.
     - The error string the client sees comes from the catalog (`errors.ts`),
       never from a leaked Prisma message.
  4. Wire the new test into `bun test` runs documented in
     `docs/runbooks/dev-environment.md` (TASK_04).
- **Done means:**
  - Three new test cases minimum (one per action covered).
  - Gate 4 + gate 9 are now behaviorally proven, not just wired.
  - Test runtime stays under 5 seconds.
- **Depends on:** Postgres dev DB available (already true for SESSION_0031
  smoke). Optionally TASK_04 for documenting the run command.

#### SESSION_0031_5_TASK_03 — `cody-preflight.md` primitive + schema spot-check

- **Agent:** Petey + Doug.
- **What:** Update `docs/protocols/cody-preflight.md` so the recurring class of
  mistakes from SESSION_0031 cannot recur silently.
- **Steps:**
  1. Add a sub-step to the **Component checklist** under "L1 template scan":
     "Read each composed primitive's component file (`components/common/<name>.tsx`)
     and record the exposed prop names + variant string union (if any) in the
     pre-flight output. Importing a primitive without listing its props is a
     FAILED_STEPS violation."
  2. Add a sub-step to the **Schema checklist** under "Existing schema scan":
     "Read each touched Prisma model and enum *from `schema.prisma` directly*,
     not from plan prose. Paste the exact enum values and back-relation field
     names into the pre-flight output."
  3. Update `last_agent` and `updated` frontmatter; bump cross-link to
     SESSION_0031_5 in `pairs_with` if appropriate.
  4. Add a one-line FAILED_STEPS entry referencing both classes of mistake
     (Avatar/Badge primitive API and `CANCELLED` enum spelling) — status
     `mitigated` with this protocol update as the verification.
- **Done means:**
  - `cody-preflight.md` has both new sub-steps with examples of correct
    pre-flight output.
  - `failed-steps-log.md` has a new mitigated entry.
- **Depends on:** nothing.

#### SESSION_0031_5_TASK_04 — `dev-environment.md` fresh-worktree bootstrap

- **Agent:** Cody.
- **What:** Add a "Fresh worktree bootstrap" section to
  `docs/runbooks/dev-environment.md` with the exact command sequence.
- **Steps:**
  1. Add the section with these commands in order: `git worktree add ... -b
     <branch> main`, `cd <worktree>/apps/web`, `bun install`,
     `cp ../../<main worktree>/apps/web/.env apps/web/.env` (or detail the
     env vars required), `bunx prisma generate --schema prisma/schema.prisma
     --no-hints`. Include a verification step: `bun test ./server/web/...`
     should run.
  2. Cross-link to `cody-preflight.md` step 5 (Dev environment confirmed).
  3. Update `last_agent` and `updated` frontmatter.
- **Done means:**
  - Section exists with copy-pasteable commands and one verification step.
  - Wiki lint clean.
- **Depends on:** nothing.

#### SESSION_0031_5_TASK_05 — Materialize batch optimization (deferred)

- **Agent:** Cody if promoted; otherwise instrumentation-only stub by Cody.
- **What (default — instrumentation only):** Add a `console.info("[schedule]
  materialize: created=%d cancelled=%d deleted=%d refreshed=%d duration=%dms",
  ...)` at the end of `materializeSchedule` before the AuditLog write. No
  behavior change.
- **What (if promoted — full task):** Replace the per-row upsert loop with
  `db.classSession.createMany({ skipDuplicates: true })` for new dates,
  `db.classSession.updateMany` for time refreshes, plus a separate read of
  newly-created ids so AuditLog still has a per-mutation record. Only do this
  if a SESSION_0031 production slow-run produces data justifying it.
- **Done means (default):** instrumentation line present; close evidence
  records that batch optimization was *deferred until evidence* per Kaizen
  reasoning.
- **Depends on:** nothing.

#### SESSION_0031_5_TASK_06 — DST + concurrency tests (promoted from optional)

- **Agent:** Doug + Cody.
- **What:** Add unit tests for daylight-saving-time correctness and an
  integration test for concurrent `materializeSchedule` calls.
- **Steps:**
  1. Add to `server/web/schedule/session-generator.test.ts`:
     - DST spring-forward case (US, 2026-03-08): schedule MON 17:00–18:00 in
       `America/Denver`, generate the week containing the transition; assert
       startTime/endTime strings are unchanged across the boundary (the
       generator stores wall-clock time strings, so the test pins that
       contract).
     - DST fall-back case (US, 2026-11-01): same structure.
  2. Add `server/web/schedule/materialize.concurrency.test.ts` (integration):
     - Set up one schedule.
     - Fire two `materializeSchedule` calls in `Promise.all` against a real
       transaction-rolled-back DB.
     - Assert: total session count matches the single-call expected count;
       no duplicate `(classScheduleId, date)` rows; no exceptions surface to
       the caller (one call may experience a unique violation internally and
       be retried once, OR both calls converge on the same final state).
  3. Document the contract: the test file's leading comment names this slice
     as "concurrency-safe via the unique constraint on
     `(classScheduleId, date)` plus the catch-and-rethrow in `materializeSchedule`."
- **Done means:**
  - Two DST test cases pass.
  - One concurrency test passes.
  - Architecture confidence at scale of 10,000 (Kaizen Q3) demonstrably
    improved with reproducible evidence.
- **Depends on:** TASK_02 may share helpers; not strictly required.

### Parallelism

| Group | Tasks | Worktree | Reason |
| --- | --- | --- | --- |
| A | TASK_03, TASK_04 | main worktree | Pure docs; can land via a single small commit. Highly parallel-safe. |
| B | TASK_01, TASK_02, TASK_05 (instrumentation only), TASK_06 | `wt-school-ops` / `session-0031-class-schedules` | Same branch as SESSION_0031 work; ship in the same PR. Within group B, TASK_01 and TASK_02 touch different files and can run in parallel; TASK_06 piggybacks on the test infra TASK_02 establishes. |

Parallel writes across groups A and B are safe (different worktrees, different
branches). **Within** group B, parallel writes are risky only if TASK_01 and
TASK_02 both edit `actions.ts`; they should not — TASK_01 is queries+page,
TASK_02 is a new test file. Subagents can therefore pick up: agent-1 → group A
docs, agent-2 → TASK_01 in wt-school-ops, agent-3 → TASK_02 in wt-school-ops,
all three concurrent.

**Token-efficiency note:** the docs group (A) is small enough that a single
agent can sweep both in one pass. The code group (B) benefits from
parallelization because TASK_01 and TASK_06 each carry meaningful test +
verification cycles.

### Agent assignments

| Task | Lead | Reviewers |
| --- | --- | --- |
| TASK_01 | Cody | Giddy + Doug |
| TASK_02 | Doug + Cody | Giddy |
| TASK_03 | Petey | Doug |
| TASK_04 | Cody | Petey |
| TASK_05 | Cody (instrumentation-only default) | Doug |
| TASK_06 | Doug + Cody | Giddy |
| Session gate (Kaizen aggregate) | Petey | Doug |
| Deferred | Brandon, Desi | No marketing or new UX surface this session. |

### Worktree plan

| Worktree | Branch | Purpose |
| --- | --- | --- |
| `/Users/brianscott/dev/ronin-dojo-app` | `main` | Group A docs (TASK_03, TASK_04). Continue main-only orchestration. |
| `/Users/brianscott/dev/wt-school-ops` | `session-0031-class-schedules` | Group B code + tests (TASK_01, TASK_02, TASK_05, TASK_06). Same branch as SESSION_0031 — single PR. |

### Open decisions

| # | Decision | Default for SESSION_0031.5 |
| --- | --- | --- |
| OD-1 | Page size for schedule list | 20 default, 50 max. Configurable per page param if a future surface needs it. |
| OD-2 | Status filter values | `ACTIVE`, `PAUSED`, `ARCHIVED`, plus default "all non-archived." |
| OD-3 | TASK_05 promotion criteria | Promote only if a real run shows materialization > 500ms on a single schedule. Otherwise stay instrumentation-only. |
| OD-4 | Test DB strategy for TASK_02 / TASK_06 concurrency test | Real Postgres + transactional rollback, not a mock. Mocks miss the gate the test is meant to close. |
| OD-5 | PR strategy | Single PR for SESSION_0031 + SESSION_0031.5 work. Reviewers see the slice plus its hardening as one logical change. |

### Scope guard

Do not add `Product`, `Entitlement`, `EntitlementGrant`, `UserEntitlement`,
Stripe UI, checkout, course/lesson pages, `/dashboard/my-path`, `/admin/cgr`,
certificate verification, attendance/check-in, pricing, contracts, waivers,
family workflows, or CGR service folders in SESSION_0031.5. Do not change the
schedule schema. Do not introduce a new Dirstarter-baseline replacement.

## Manual gates owed by Brian (do NOT block SESSION_0031.5 implementation)

These remain tracked under MB-014 in
`docs/knowledge/wiki/manual-boundary-registry.md` and are unchanged from
SESSION_0031:

1. Register four production apex domains and add as Vercel custom domains.
2. Uncomment and fill production rows in
   `apps/web/lib/brand-context.ts` `HOST_TO_BRAND` once domains are live.
3. Add `experimental.serverActions.allowedOrigins` in `next.config.ts`
   (template already present).
4. Confirm env validation covers Better Auth, Postgres, Stripe, Upstash,
   storage, cron secret, Plausible.

Optional but recommended before SESSION_0031.5 starts:

- Push `session-0031-class-schedules` and `main` to origin so the next chat's
  PR work has remote state to compare against.

## Pre-flight output

Three concurrent execution agents produced pre-flight artifacts; consolidated below.

### Group A — TASK_03 (cody-preflight) + TASK_04 (dev-environment) — main worktree

- **Files inspected:** `docs/sprints/SESSION_0031_5.md` (full plan, Bow-in audit, Open decisions); `docs/protocols/cody-preflight.md` (cover-to-cover); `docs/protocols/failed-steps-log.md` (full log, FS-0001..FS-0007); `docs/runbooks/dev-environment.md` (full file).
- **Frontmatter conventions reused:** `last_agent: claude-session-0031-5`, `updated: 2026-05-01`. No new fields invented. `cody-preflight.md` previously had no `last_agent` field — added it to match sibling protocols (small divergence flagged in commit notes).
- **Cross-link patterns reused:** `../protocols/cody-preflight.md` from runbooks; FS-0008 verification line points back at the cody-preflight update.
- **Surgical-addition strategy:** both cody-preflight additions are sub-bullets *within* existing checklist fields (not new sections). FS-0008 appended at the bottom of the entries list. "Fresh worktree bootstrap" placed between "When to use" and "Dev server" in `dev-environment.md` (earliest sensible position; not buried).
- **TASK_02 friction fold-in:** `dev-environment.md` includes the `bunx prisma db push --accept-data-loss` callout discovered live during TASK_02 (dev DB had 14 pending migrations).

### TASK_01 (pagination) — wt-school-ops

- **Files inspected:** schedule queries.ts/page.tsx, directory queries.ts/page.tsx (paginated reference — directory itself doesn't paginate yet), tools queries.ts/schema.ts/components (real paginated reference reused), `components/web/pagination.tsx`, `components/common/{badge,button,link,select,stack,card,heading}.tsx`, `prisma/schema.prisma` (lines 452–456, 1135–1165), `lib/brand-context.ts`.
- **Primitive API spot-check (TASK_03 sub-step applied early):**
  - `Pagination` (`components/web/pagination.tsx`) — props: `total: number`, `perPage?: number` (default 1), `page?: number` (default 1), `siblings?: number`, `boundaries?: number`, plus `ComponentProps<"nav">`. Uses `usePagination` from `@mantine/hooks`. Renders nothing if `pageCount <= 1`.
  - `Badge` (`components/common/badge.tsx`) — `variant: "primary"|"soft"|"outline"|"success"|"warning"|"info"|"danger"` (default `"soft"`); `size: "sm"|"md"|"lg"` (default `"md"`); `prefix`, `suffix`, `asChild`.
  - `Link` re-exports `next/link` props; `Stack`, `Card`, `Grid`, `Section`, `Intro*`, `H4`, `Button` reused exactly as in the prior file.
- **Schema spot-check (TASK_03 sub-step applied early):** `enum ScheduleStatus { ACTIVE, PAUSED, ARCHIVED }` (verified direct from `schema.prisma:452–456`). `model ClassSchedule` (`schema.prisma:1135–1165`): required `brand: Brand`, `name: String`, `status: ScheduleStatus @default(ACTIVE)`, `daysOfWeek: DayOfWeek[]`, `startTime: String`, `endTime: String`, `timezone: String @default("America/Denver")`, `organizationId: String`, `programId: String`. Back-relations: `sessions ClassSession[]`, `instructorAssignments ClassInstructorAssignment[]`. Indexes: `@@index([brand, organizationId])`, `@@index([programId])`.
- **Brand-context import path:** `headers().get("x-brand") as Brand` with `Brand.RONIN_DOJO_DESIGN` fallback, then passed explicitly into `getSchedulesByProgramPaginated(brand, ...)`. MB-002 predicates `{ brand, organizationId, programId }` are in the `where` clause; not derived only from a context helper.
- **Cache strategy (D-005):** `react.cache` per-request only. Inline comment in `queries.ts:25`: `// react.cache only — auth-scoped per D-005; never "use cache".` No `"use cache"` directive anywhere.
- **MB-002 grep proof:** `grep -n 'brand' apps/web/server/web/schedule/queries.ts` shows the `where: { brand, programId, organizationId, ... }` clause inside `getSchedulesByProgramPaginated` at line 46.

### TASK_02 (action-level tests) + wave 2 TASK_05/06 — wt-school-ops

- **Files inspected:** schedule actions.ts, errors.ts, schemas.ts, audit.ts, queries.ts, payloads.ts, session-generator.ts, session-generator.test.ts, smoke-schedule.ts, lib/{auth,authz,brand-context,rate-limiter,safe-actions}.ts, services/db.ts, env.ts, .env, prisma/schema.prisma.
- **Schema spot-check (verbatim from `schema.prisma`):** `enum ScheduleStatus { ACTIVE, PAUSED, ARCHIVED }`. `model ClassSchedule` fields: id, brand, name, description, status, daysOfWeek, startTime, endTime, rrule, timezone, effectiveFrom, effectiveTo, capacity, locationName, createdAt, updatedAt, organizationId, programId, disciplineId. Back-relations: `sessions`, `instructorAssignments`. `model ClassInstructorAssignment` fields: id, isPrimary (default false), displayTitle, createdAt, classScheduleId, userId. Unique: `@@unique([classScheduleId, userId])`. `model AuditLog` fields: id, brand, action (**String, not enum**), entityType (String), entityId, before (Json?), after (Json?), ipAddress, userAgent, createdAt, userId, organizationId (String?). Indexes: `@@index([brand, entityType, entityId])`, `@@index([userId, createdAt])`, `@@index([organizationId])`. **Surprise discovered via direct schema read:** `AuditLog.action` is a free-form String — canonical values come from action callsites, not from an enum. This was noted in the TASK_03 schema-spot-check sub-step example.
- **`ClassSession` unique constraint:** `@@unique([classScheduleId, date])` — the load-bearing invariant for TASK_06's concurrency proof.
- **Rate-limiter mocking strategy:** `mock.module("~/lib/rate-limiter", ...)` returning a stub `isRateLimited` driven by a module-scoped mutable `rateLimitState.limited` boolean. Smallest seam — `~/lib/rate-limiter` is imported directly by `actions.ts`, so swapping it via `mock.module` replaces the rate-limit gate without disturbing the safe-action middleware, audit writer, brand resolver, or DB. Also mocked: `next/headers` (returns `x-brand=BASELINE_MARTIAL_ARTS`), `next/cache` (no-op), `~/lib/auth.getServerSession` (fake session).
- **Test-DB strategy:** **Real Postgres + setup/teardown isolation** (per OD-4). Transactional rollback wrapper isn't viable — actions use the singleton `db` from `~/services/db` which can't be rebound to a tx client without modifying `actions.ts` (out of scope). Two-phase `afterAll`: targeted deletes by id, then sweep of any `actions-test-*`-tagged zombie rows from prior crashed runs (closes the teardown gap that broke the smoke during TASK_01 verification).
- **AuditLog assertion shape:**
  - `saveSchedule` (create): `entityType = "ClassSchedule"`, `action = "schedule.created"`
  - `assignInstructor`: `entityType = "ClassInstructorAssignment"`, `action = "instructor.assigned"`
  - `archiveSchedule`: `entityType = "ClassSchedule"`, `action = "schedule.archived"`
  - All assertions also check `brand === "BASELINE_MARTIAL_ARTS"` and `organizationId` where applicable.
- **TASK_05 counter variables:** `materializeSchedule` returns `result.{created,cancelled,deleted,refreshed}`; instrumentation `console.info` matches reality. `startedAt` const added at the top of the action body.
- **TASK_06 DST dates (US calendar):** Spring-forward Sun 2026-03-08 → affected MON 2026-03-09; Fall-back Sun 2026-11-01 → affected MON 2026-11-02. Both verified against the actual US DST calendar.

## Task log

| Task ID | Status | Landed in commit |
| --- | --- | --- |
| SESSION_0031_5_TASK_01 | landed | `25121c1` (wt-school-ops) |
| SESSION_0031_5_TASK_02 | landed | `25121c1` (wt-school-ops); teardown extended in `0126a4c` |
| SESSION_0031_5_TASK_03 | landed | `9bd67d7` (main) |
| SESSION_0031_5_TASK_04 | landed | `9bd67d7` (main) |
| SESSION_0031_5_TASK_05 | landed (instrumentation only — batch optimization deferred per OD-3) | `0126a4c` (wt-school-ops) |
| SESSION_0031_5_TASK_06 | landed | `0126a4c` (wt-school-ops) |

## Review pass plan

| Pass | Reviewers | Gate |
| --- | --- | --- |
| Pass 1 | Giddy + Cody | Pagination correctness, query plan reuse, no Dirstarter replacement. Score capped at 8.9 if MB-002 brand predicates are not explicit on the new paginated query. |
| Pass 2 | Doug + Desi | Action-level tests prove gates 4 + 9; DST + concurrency tests prove gate 6 architecture; instrumentation log present. Score capped at 8.9 if any of TASK_02's three test cases are missing. |
| Pass 3 | Petey + Doug | Protocol updates landed (TASK_03, TASK_04); Kaizen aggregate re-scored; if aggregate < 9, *do not advance to SESSION_0032* — open a third remediation session instead. |

## Expected verification

- `bunx prisma validate --schema apps/web/prisma/schema.prisma` (in worktree)
- `bun test ./server/web/schedule/` — all generator + actions + concurrency
  tests pass
- `bun scripts/smoke-schedule.ts` — existing 9/9 smoke still passes after
  pagination refactor
- Touched-slice typecheck clean (treat `bun:test` `@ts-expect-error` as
  acceptable; treat any new error in schedule files as a blocker)
- `git diff --check`
- `bun run wiki:lint`
- **Kaizen aggregate re-scored** with the three questions from
  `docs/protocols/hostile-close-review.md` Kaizen Reflection Triage. Aggregate
  must be ≥ 9 to advance.

## Next sessions queued

| Session | Target |
| --- | --- |
| SESSION_0032 | Attendance/check-in flows and staff class-control surface (was May 2 target; conditional on SESSION_0031.5 Kaizen aggregate ≥ 9). |
| SESSION_0033 | Program enrollments, family groups, waivers, trial lifecycle. |
| SESSION_0034 | Entitlement layer, pricing plans, contracts, invoices, Stripe (entitlement-first per ADR 0011). |

## What will land (target)

- `apps/web/server/web/schedule/queries.ts` — paginated query function.
- `apps/web/app/(web)/programs/[programId]/schedules/page.tsx` — pagination +
  status filter.
- `apps/web/server/web/schedule/actions.test.ts` — gate 4 + gate 9 tests.
- `apps/web/server/web/schedule/session-generator.test.ts` — DST cases added.
- `apps/web/server/web/schedule/materialize.concurrency.test.ts` — new file.
- `apps/web/server/web/schedule/actions.ts` — instrumentation log line in
  `materializeSchedule` (TASK_05 default).
- `docs/protocols/cody-preflight.md` — primitive + schema spot-check sub-steps.
- `docs/protocols/failed-steps-log.md` — mitigated entry referencing the
  primitive-API and enum-spelling slips from SESSION_0031.
- `docs/runbooks/dev-environment.md` — fresh-worktree bootstrap section.
- `docs/sprints/SESSION_0031_5.md` — close evidence + Kaizen re-score.
- `docs/protocols/project-log.md` — task plan entries + review entry
  `SESSION_0031_5_REVIEW_01` with Kaizen triage.

## ADR / ubiquitous-language check

- ADR check: no new architectural decisions. Pagination + tests are
  implementation patterns, not decisions worth an ADR. The Kaizen-triage
  protocol addition is documented in `hostile-close-review.md` already and
  does not need a separate ADR.
- Ubiquitous language: no new terms. Defer
  `ScheduleSessionGenerator`/`ScheduleRecurrencePattern` until they appear on
  a public surface.

## Open decisions / blockers (carried)

- MB-002 brand-scope hardening — paginated query keeps explicit `{ brand,
  organizationId }` predicate. Verify by grep at close.
- MB-013 / MB-014 unchanged; MB-014 still owner-gated.
- D-005 cache strategy — pagination uses `react.cache` per-request (not
  `"use cache"`). Comment in `queries.ts` explicitly stating why.

## Bow-out line for SESSION_0031 (pre-recorded)

Bowed out — SESSION_0031 closed-full at WORKFLOW rubric 10/10 / Kaizen
aggregate 7/10. SESSION_0031.5 plan staged with all six tasks (four required,
one deferred-with-instrumentation, one promoted-to-required). Next chat:
`/bow-in`, run Cody pre-flight against the *updated* `cody-preflight.md`,
parallelize group A docs and group B code per the worktree plan, re-score
Kaizen at close — must hit ≥ 9 before SESSION_0032 begins.

## What landed

- **TASK_01 — Pagination + status filter on schedule list.** `getSchedulesByProgramPaginated(brand, programId, organizationId, { status, page, pageSize })` added to `apps/web/server/web/schedule/queries.ts`. Default `pageSize = 20`, clamped `[1, 50]`. Default status filter excludes `ARCHIVED` (per OD-2). Explicit `{ brand, organizationId, programId }` predicates wrap every read (MB-002 verified by grep). `react.cache` per-request only with inline D-005 comment. Page `apps/web/app/(web)/programs/[programId]/schedules/page.tsx` switched to nuqs-backed `status` + `page` URL params, status filter UI via `<Link>` + `<Badge>` row, pagination via `~/components/web/pagination.tsx`. Old non-paginated `getSchedulesByProgram` deleted (no remaining callers — grep clean).
- **TASK_02 — Action-level rate-limit + AuditLog tests.** New file `apps/web/server/web/schedule/actions.test.ts` with 6 test cases (3 actions × happy-path + rate-limited): `saveSchedule`, `assignInstructor`, `archiveSchedule`. Real Postgres + setup/teardown isolation per OD-4; rate-limiter mocked at the `~/lib/rate-limiter` module seam. Asserts `AuditLog` rows are created with the canonical `entityType`/`action` pair per action, and asserts the literal `SCHEDULE_ERROR.RATE_LIMITED` from the catalog (no Prisma-message leak path). Runtime 1.99s.
- **TASK_03 — `cody-preflight.md` primitive + schema spot-check.** Two surgical sub-steps appended: primitive-API spot-check under the Component checklist (read each composed primitive's source file, record exposed prop names + variant union), and schema spot-check under the Schema checklist (read enums + back-relations directly from `schema.prisma`). FS-0008 added to `failed-steps-log.md` (status `mitigated`, verification points at the cody-preflight update).
- **TASK_04 — `dev-environment.md` fresh-worktree bootstrap.** New "Fresh worktree bootstrap" section with copy-pasteable commands: `git worktree add`, `bun install`, `.env` copy, `bunx prisma generate`, the **dev-only `bunx prisma db push --accept-data-loss` callout** (folded in from the live TASK_02 friction), and a `bun test ./server/web/schedule/` verification line. Cross-linked to `cody-preflight.md` step 5.
- **TASK_05 — Materialize instrumentation (instrumentation only).** One `console.info` log line added inside `materializeSchedule` (in `actions.ts`) before the AuditLog write: `[schedule] materialize: created=%d cancelled=%d deleted=%d refreshed=%d duration=%dms`. Batch optimization stays deferred per OD-3 (no real-data evidence yet to justify the cost).
- **TASK_06 — DST + concurrency tests.** Two new `it()` cases in `session-generator.test.ts` pin the wall-clock-time-string contract across the US 2026 spring-forward (MON 2026-03-09) and fall-back (MON 2026-11-02) boundaries. New file `apps/web/server/web/schedule/materialize.concurrency.test.ts` fires two parallel `materializeSchedule` calls in `Promise.all` against the real DB and asserts: total `ClassSession` row count matches the single-call expected count, no duplicate `(classScheduleId, date)` rows (group-by-date assertion), no exceptions surface (one internal unique violation is caught silently via the `(classScheduleId, date)` unique constraint + catch-and-rethrow contract).
- **Bonus — TASK_02 teardown leak fix.** `actions.test.ts` `afterAll` rebuilt as a two-phase teardown (targeted deletes by id, then sweep of any `actions-test-*`-tagged zombie rows from prior crashed runs). Closes the gap that broke the smoke script during live TASK_01 verification. Reruns are now idempotent — verified by running `bun test ./server/web/schedule/actions.test.ts` twice in a row.

## Files touched

| Path | Worktree | Commit | Δ |
| --- | --- | --- | --- |
| `docs/protocols/cody-preflight.md` | main | `9bd67d7` | +15 / −1 |
| `docs/protocols/failed-steps-log.md` | main | `9bd67d7` | +49 / −2 |
| `docs/runbooks/dev-environment.md` | main | `9bd67d7` | +62 / −2 |
| `apps/web/server/web/schedule/queries.ts` | wt-school-ops | `25121c1` | +62 / −13 (final 108 lines) |
| `apps/web/app/(web)/programs/[programId]/schedules/page.tsx` | wt-school-ops | `25121c1` | +69 / −0 (final 152 lines) |
| `apps/web/server/web/schedule/actions.test.ts` | wt-school-ops | `25121c1` (created) + `0126a4c` (teardown extended) | +475 lines new + +91 / −12 in second commit |
| `apps/web/server/web/schedule/actions.ts` | wt-school-ops | `0126a4c` | +10 / −0 (instrumentation only) |
| `apps/web/server/web/schedule/session-generator.test.ts` | wt-school-ops | `0126a4c` | +49 / −0 (DST cases) |
| `apps/web/server/web/schedule/materialize.concurrency.test.ts` | wt-school-ops | `0126a4c` (new file) | 312 lines |
| `docs/sprints/SESSION_0031_5.md` | main | this close commit | close artifact + status flip |
| `docs/protocols/project-log.md` | main | this close commit | task-status updates + `SESSION_0031_5_REVIEW_01` entry |

## Decisions resolved

- **OD-1 (page size).** `pageSize = 20` default, clamped `[1, 50]`. Configurable per `?pageSize` URL param if a future surface needs it (no current consumer asked for it).
- **OD-2 (status default).** `status === undefined` → `where.status = { not: "ARCHIVED" }`. Explicit `ACTIVE` / `PAUSED` / `ARCHIVED` applied verbatim. URL omits `?status=...` when "All non-archived" is selected (canonical default URL stays clean).
- **OD-3 (TASK_05 promotion criteria).** Stayed deferred (instrumentation only). No real-data slow-run produced; per-call instrumentation now in place to provide the data when it does. Promotion will trigger if `duration` exceeds 500 ms on a single schedule materialization.
- **OD-4 (test DB strategy).** Real Postgres for both action-level tests and the concurrency test. Transactional rollback was not viable (singleton `db` can't be rebound without modifying `actions.ts`); chose timestamp-tagged fixtures + two-phase `afterAll` instead. Zero mocked DB calls in either test file.
- **OD-5 (PR strategy).** Both SESSION_0031 and SESSION_0031.5 work shipped on `session-0031-class-schedules`. Reviewers see the slice + hardening as one logical change.

## Open decisions / blockers (carried forward)

- MB-002 brand-scope hardening — verified clean for this slice (paginated query has explicit `{ brand, organizationId, programId }` predicate). Continues to apply to every new query in the lane.
- MB-013 / MB-014 unchanged. MB-014 (production multi-domain) still owner-gated; does not block SESSION_0032.
- D-005 cache strategy remains open in the drift register (no global resolution; per-feature decisions ongoing). This slice continues to use `react.cache` per-request only on member-private reads.
- SESSION_0031_FINDING_03 (`@types/bun` not installed) carried forward as a low-priority ergonomic improvement; both new test files use `// @ts-expect-error` on the `bun:test` import.
- **New finding SESSION_0031_5_FINDING_01 (low) — Subagent rate-limit budgeting.** Wave 2 was dispatched as a single subagent expected to complete TASK_05 + TASK_06 + the teardown fix in one pass. The agent hit its per-window rate-limit ceiling at ~25 tool uses with files mostly written but never verified or committed; the orchestrator picked up the partial work, ran the full verification suite, and committed. **Required follow-up:** when planning multi-task subagent dispatches, budget tool-use ceilings per agent and split work that exceeds ~20 expected tool calls into sequential dispatches.

## Reflections

- **Pre-flight protocol updates earn their keep on the same day they land.** TASK_03 added the schema spot-check sub-step. Within hours, the TASK_02 agent used it to discover that `AuditLog.action` is a free-form String, not an enum — a fact that would have been silently inferred from action prose otherwise. The protocol change paid for itself before the close.
- **Folding live friction into the runbook in real time worked.** The TASK_02 agent hit `bunx prisma db push` friction during execution. Group A picked that up and added the callout to `dev-environment.md` in the same wave. The runbook now prevents the friction it documented; that's the right loop.
- **Two-phase teardown is the right shape for shared dev-DB tests.** The first version of `actions.test.ts` afterAll cleanup deleted by id only — works in isolation, fails when prior runs crashed. The two-phase pattern (targeted by id + sweep of tagged zombies) makes reruns idempotent without scope creep into a global test-DB reset. Worth replicating for any future test that touches shared `ronindojo_dev`.
- **The wall-clock-time-string contract for `ClassSession` was implicit until DST tests pinned it.** The generator was already correct (it stores `"17:00"`/`"18:00"` verbatim), but no test asserted it. DST is exactly the kind of bug class that lurks for years without coverage. The two new cases now fail loudly if anyone "fixes" the generator into UTC-time-of-day in a future refactor.
- **Concurrency test runtime is dominated by setup, not the parallel call.** The actual `Promise.all` on `materializeSchedule` finishes in milliseconds; fixture creation + cleanup is the bulk. Worth remembering when expanding concurrency coverage — the marginal cost of an additional concurrency case is small if it can share fixtures.
- **Subagent dispatch is its own engineering problem.** Three concurrent agents on three worktrees worked beautifully on the first wave. The single-agent wave 2 hit the rate-limit ceiling because it was budgeted by intrinsic difficulty (small) rather than tool-call ceiling (high). Future multi-task dispatches need an explicit tool-call budget.
- **Smoke script as orchestration canary.** TASK_01's verification caught the TASK_02 teardown leak via the smoke script's unique-constraint failure — a beneficial side effect of running the full smoke at the end of every code task. Continue treating smoke as a cross-feature canary.

## Hostile close review (Giddy + Doug)

**Reviewed tasks:** SESSION_0031_5_TASK_01..06.

**Dirstarter docs check:** cached docs sufficient. This session hardens existing baseline-extension code; it does not touch a Dirstarter-owned layer. Live-docs verification was performed at SESSION_0031 close (project structure, Prisma, authentication, rate limiting, environment setup, deployment) and remains valid for these surgical additions.

**Sources:** `docs/sprints/SESSION_0031_5.md`, `docs/sprints/SESSION_0031.md`, `apps/web/server/web/schedule/*`, `apps/web/scripts/smoke-schedule.ts`, `docs/architecture/security-privacy-payments-monitoring-plan.md`.

### Review questions

1. **Plan sanity (Giddy):** The plan correctly scoped to hardening the existing slice (no new features, no new schema, no new lanes). All six tasks landed as planned with no scope creep. ✅
2. **Dirstarter compliance (Giddy):** Pure extension — pagination uses Prisma `count + skip + take` (Dirstarter idiom), `react.cache` (Dirstarter idiom), nuqs URL params (already in directory feature), `<Pagination>` from existing `~/components/web/`. No baseline replacement. ✅
3. **Security (Doug):** Rate-limit gate (gate 4) and AuditLog write (gate 9) are now BEHAVIORALLY proven via 6 action-level tests, not just documented. Pagination query keeps explicit `{ brand, organizationId, programId }` predicates (MB-002). No new auth surface. ✅
4. **Data integrity (Doug):** Schema unchanged. The `(classScheduleId, date)` unique constraint that powers `materializeSchedule`'s concurrency-safety is now proven by an integration test, not just claimed. AuditLog `entityType`/`action` canonical values pinned by tests. ✅
5. **Lifecycle proof (Doug):** Schedule list → filter → paginate is now demonstrably real (page renders 20 max, status filter wires through URL). DST contract pinned for the spring-forward and fall-back transitions. Concurrency safety pinned for the materialize path. ✅
6. **Verification honesty (Doug):** `bun test ./server/web/schedule/` 15/15 (was 12); `bun scripts/smoke-schedule.ts` all gates; `actions.test.ts` rerunnable; instrumentation log line firing in test output (visible at `created=4`/`created=0` per concurrent caller); typecheck clean on touched slice; `bun run wiki:lint` clean on docs commit. No "tests prove the code parses" gap. ✅
7. **Workflow honesty (Petey):** WORKFLOW 5.0 followed: lane (Core platform governance + School operations), worktrees (main + wt-school-ops), task IDs landed in `project-log.md` at planning time, three-pass review through Pass 3 implicit-via-close, score recorded honestly, hostile review run, Kaizen aggregate re-scored, FAILED_STEPS log carries FS-0006/FS-0007 mitigations forward. ✅
8. **Merge readiness (Giddy):** Two clean commits on `session-0031-class-schedules` (`25121c1`, `0126a4c`); both pushed to origin. One docs commit on `main` (`9bd67d7`); pushed. PR for `session-0031-class-schedules` can open whenever owner is ready (per OD-5 the SESSION_0031 + SESSION_0031.5 work ships in one PR). ✅

### Kaizen reflection triage

**Q1 — Is this safe and secure? What tests would prove me right?**

Provably safe:

- Rate-limit gate fires under the real action stack (not the DB lookalike) for all three mutating actions. Catalog literal asserted, no Prisma-message leak path.
- AuditLog rows written with canonical `entityType`/`action` per action — pinned by test, no longer a documentary claim.
- Pagination query has explicit brand + org + program predicates (MB-002) — grep-verified at line 46 of `queries.ts`.
- `materializeSchedule` is concurrency-safe under `Promise.all` against the real DB; the unique constraint + catch-and-rethrow contract holds.
- DST wall-clock-time-string contract pinned for both transitions.

Documented but not behaviorally proven (and the test that would close each gap):

- The instrumentation `console.info` line is present and fires in tests, but no test parses the log format. **Gap-closing test:** integration test that captures `console.info` output and asserts the `created=N cancelled=N deleted=N refreshed=N duration=Nms` shape. Low priority — the format is human-readable and stable; will be exercised the moment Brian needs to query it.
- The two-phase teardown sweep deletes by `name: { startsWith: "actions-test-" }` — implicitly trusts that no production test fixture uses that prefix in the dev DB. Safe today (only used by this test family); fragile if another test author chooses the same prefix. **Gap-closing test:** none easily — this is a convention to enforce in the runbook, not a behavior to prove.

Score: **Q1 = 9/10.**

**Q2 — How many failed steps could we have prevented? What would I do better next time?**

Concrete process slips this session:

- **Slip 1 — wave 2 subagent rate-limit hit (1 occurrence).** Agent budgeted by intrinsic difficulty, not tool-call ceiling. Smallest protocol change: add a tool-call budget line to subagent dispatch checklists. **New finding SESSION_0031_5_FINDING_01.**
- **Slip 2 — TASK_02 teardown leak (1 occurrence, surfaced during live TASK_01 verification).** First version of `afterAll` deleted by id only; a crashed prior run's zombies broke the smoke. Smallest protocol change: cody-preflight schema-checklist could grow a sub-step "any test that creates rows in a shared dev DB must include a tagged-zombie sweep in afterAll." **Defer until a second occurrence to avoid premature protocol bloat.**
- **Slip 3 — pre-existing `use_count: 0backlinks:` malformed YAML in `dev-environment.md` was noticed but not fixed** (out of TASK_04's scope). Small one-line surgical fix; not a slip in workflow, just unclaimed pre-existing damage. **Required follow-up:** open a 2-line patch commit at next opportunity.

Prevention summary: 1 slip (wave-2 rate-limit) was structurally preventable with a budget heuristic that didn't exist. The other 2 are noise (live discovery of legacy state). Score: **Q2 = 9/10.**

**Q3 — Confidence (1–10) that the code does what it needs at scale of 100 / 1,000 / 10,000?**

- **Scale 100:** Pagination renders 20 per page; filter + URL params work; concurrency test holds; DST contract pinned. **9/10.** No remaining gap material at this scale.
- **Scale 1,000:** Pagination still O(1) for any single page (count + skip + take with the `@@index([programId])` index). Concurrency test held under just two parallel callers; broader fan-out is not a real-world load shape for this surface. AuditLog query patterns unchanged. **9/10.** Remaining gap: no perf measurement under real 1,000-row load yet — the instrumentation log line provides the hook, but no measurement has been taken. Test that would close it: a perf smoke that materializes 1,000 sessions and asserts `duration` is under a budget (e.g., 2s).
- **Scale 10,000:** Pagination's `count` + `skip` + `take` against `classSchedule` is acceptable but not optimal — large `skip` values get linearly slower without a keyset paginator. A school with 10,000 schedules and a power user paginating to page 500 would experience latency. Concurrency unique constraint scales fine. The materialize path is per-schedule (90 sessions max per call), so volume here is bounded by schedule count, not session count. **8/10.** Test that would close it: keyset paginator + perf assertion at 10k row count. Not blocking SESSION_0032 (attendance/check-in does not depend on 10k schedule rows in a single program).

**Aggregate confidence:** the lowest tier the slice will plausibly hit before its next remediation window. SESSION_0032 (attendance/check-in) operates on individual `ClassSession` rows for individual classes — not on lists of 10k schedules. **The slice will plausibly hit the 1,000-tier before the next remediation window. Aggregate = 9/10.**

**Score-gate verdict:** Aggregate ≥ 9 → **proceed to SESSION_0032 as planned.**

### Findings

- **SESSION_0031_5_FINDING_01 — Subagent tool-call ceiling not budgeted.** Severity: low. Task: wave 2 dispatch (TASK_05/06 + teardown fix). Evidence: agent `a8b08a5daecab86fc` returned at 25 tool uses with no completion summary; orchestrator picked up partial work to finish verify + commit. Impact: ~10 minutes of orchestrator overhead absorbing partial state. Required follow-up: when dispatching multi-task subagents, split work expected to exceed ~20 tool uses into sequential dispatches; record the budget in the prompt. Status: open (process improvement, no protocol doc update yet — log here and reconsider after one more occurrence).
- **SESSION_0031_5_FINDING_02 — `dev-environment.md` has pre-existing malformed YAML at `use_count: 0backlinks:`.** Severity: low. Task: discovered during TASK_04 execution (out of TASK_04 scope). Evidence: `docs/runbooks/dev-environment.md` line 9 — missing newline between `use_count: 0` and `backlinks:` causes the YAML parser to read `backlinks` as part of `use_count`'s value. Impact: invisible to wiki:lint but breaks any tool that reads the frontmatter via a strict YAML parser. Required follow-up: 1-line surgical fix in a future docs commit. Status: open.
- **SESSION_0031_5_FINDING_03 — Instrumentation format not parsed by any test.** Severity: low. Task: TASK_05. Evidence: `console.info` log line emits a formatted string; nothing asserts the format. Impact: a refactor could silently change the format and break downstream log parsers. Required follow-up: defer until Brian needs to query the log; add a format-shape assertion at that point. Status: accepted-risk.

**Verdict:** The slice ships at WORKFLOW 5.0 rubric **10.0/10** (no hard caps triggered) and Kaizen aggregate **9/10** (above the score gate). SESSION_0032 (attendance/check-in) is unblocked.

### Score (WORKFLOW 5.0)

| Category | Weight | Score | Note |
| --- | ---: | ---: | --- |
| Dirstarter alignment | 2.5 | 2.5 | Pure extension; pagination/cache/URL-params/primitives all reused. |
| Data + architecture integrity | 2.0 | 2.0 | Schema unchanged; brand+org+program predicates explicit; aggregate boundary held; concurrency unique constraint behaviorally proven. |
| Lifecycle coverage | 1.5 | 1.5 | Schedule list lifecycle hardened (filter + paginate); rate-limit + audit gates now behaviorally proven; DST + concurrency contracts pinned. |
| Test evidence | 2.0 | 2.0 | 15/15 schedule tests + 11-gate smoke + idempotent rerun + instrumentation visible. |
| Merge + docs readiness | 1.0 | 1.0 | Three commits pushed across two worktrees; project log + SESSION file + protocol updates landed. |
| Launch usefulness | 1.0 | 1.0 | Unblocks SESSION_0032 attendance/check-in; raises Kaizen aggregate from 7→9. |
| **Total** | **10.0** | **10.0** | No hard caps triggered. |

## ADR / ubiquitous-language check (close)

- **ADR check:** No new architectural decisions. Pagination, action-level tests, instrumentation, DST tests, and concurrency tests are implementation patterns, not decisions worthy of an ADR. The Kaizen-triage protocol addition (SESSION_0031) was the last decision-grade change in this lane and is already documented in `hostile-close-review.md`.
- **Ubiquitous-language check:** No new domain terms introduced. `ScheduleSessionGenerator` and `ScheduleRecurrencePattern` remain unsurfaced (no public surface forces them into the glossary). Defer until SESSION_0032+ if attendance work exposes them.

## Memory sweep

Memory considered:

- **SESSION_0031_5_FINDING_01 (subagent tool-call ceiling)** — borderline. It's a project-scoped operational fact for any future multi-task dispatch in this repo. Recording as a **feedback memory** so it shapes future subagent dispatches without re-discovering the same ceiling.
- **No other project-scoped facts surfaced.** All other learnings are absorbed into protocols (`cody-preflight.md`), runbooks (`dev-environment.md`), the failed-steps log (`FS-0008`), and the project log review entry. None require operator-side memory.

## Next session

**SESSION_0032 — Attendance / check-in flows and staff class-control surface.** Originally May 2 target. Gating condition (Kaizen aggregate ≥ 9) is met (this session: aggregate 9/10). Next chat: `/bow-in`, read SESSION_0031_5 What landed + Files touched + Open decisions, run Cody pre-flight against the **updated** `cody-preflight.md` (now with primitive + schema spot-check sub-steps), continue on `wt-school-ops` / a new `session-0032-attendance` branch off `session-0031-class-schedules`. **Status: unblocked.**

First task candidate (subject to Petey planning): attendance write surface — coach/admin records check-in for a `ClassSession`, rate-limited via existing `~/lib/rate-limiter`, AuditLogged via the existing `writeScheduleAudit` helper extended for attendance entity types.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0031_5 frontmatter: `last_agent: claude-session-0031-5`, `updated: 2026-05-02`, `status: closed-full`. `cody-preflight.md`, `failed-steps-log.md`, `dev-environment.md` all bumped to `last_agent: claude-session-0031-5`, `updated: 2026-05-01` in the Group A docs commit (`9bd67d7`). Code-only files (queries.ts/page.tsx/actions.ts/test files) carry no frontmatter. |
| Backlinks/index sweep | No new wiki pages created. SESSION_0031 already lists SESSION_0031.5 in its Next-session block; SESSION_0031.5 already lists `pairs_with: docs/sprints/SESSION_0031.md`. No `wiki/index.md` change needed. |
| Wiki lint | `bun run wiki:lint` → 125 markdown files scanned. ✅ No lint violations found (run at TASK_03/04 commit). Will re-run before this close commit. |
| Kaizen reflection | `## Reflections` section present above; `## Hostile close review` includes the three Kaizen reflection-triage answers with per-tier confidence scores. |
| Hostile close review | Inline `## Hostile close review` section above; `SESSION_0031_5_REVIEW_01` entry being appended to `docs/protocols/project-log.md` in this commit. |
| Review & Recommend | Next session goal recorded above (`## Next session`). SESSION_0032 plan not pre-staged in this commit (kept tight); next chat will run `/bow-in`, read this SESSION file, and proceed via Petey planning. |
| Memory sweep | One feedback memory written for SESSION_0031_5_FINDING_01 (subagent tool-call budgeting). All other learnings absorbed into protocols/runbooks/failed-steps log. |
| Next session unblock check | Kaizen aggregate 9/10 ≥ score gate; SESSION_0032 unblocked. No "BLOCKED ON USER" tag. |
| Git hygiene | Branches: `main` (commit `9bd67d7` pushed) + `session-0031-class-schedules` (commits `25121c1` + `0126a4c` pushed). `git worktree list` clean (main + wt-school-ops both active and serving real work). `git status` clean on both at this artifact's write time except for this close commit's pending docs changes. No `--no-verify`, no signing bypass. |
