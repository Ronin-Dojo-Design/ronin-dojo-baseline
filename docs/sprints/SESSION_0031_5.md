---
title: "SESSION 0031.5 — Schedule slice hardening before SESSION_0032 attendance"
slug: session-0031-5
type: session
status: planned
created: 2026-05-01
updated: 2026-05-01
last_agent: claude-session-0031
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

planned

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

## Pre-flight (filled by Cody at session start)

To be filled when next chat opens with `/bow-in`:

- Files inspected (must include `cody-preflight.md` *post* TASK_03 if running
  out of sequence)
- Existing components reused vs. created (must list pagination primitives
  pulled from directory feature)
- Brand-context import confirmed
- Rate-limiter keys plan (no new keys this session — reusing
  `schedule_write` for the test)
- Audit-log testing plan

## Task log

| Task ID | Status |
| --- | --- |
| SESSION_0031_5_TASK_01 | planned |
| SESSION_0031_5_TASK_02 | planned |
| SESSION_0031_5_TASK_03 | planned |
| SESSION_0031_5_TASK_04 | planned |
| SESSION_0031_5_TASK_05 | planned (instrumentation-only default) |
| SESSION_0031_5_TASK_06 | planned (promoted to required) |

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
