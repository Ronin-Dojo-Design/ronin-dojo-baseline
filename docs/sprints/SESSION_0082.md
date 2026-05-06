---
title: "SESSION 0082 — Tournament registration capacity race condition tests"
slug: session-0082
type: session
status: closed-quick
created: 2026-05-06
updated: 2026-05-06
last_agent: claude-session-0082
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0081.md
backlinks:
  - docs/knowledge/wiki/index.md
---

## SESSION 0082 — Tournament registration capacity race condition tests

### Date

2026-05-06

### Operator

Brian Scott + Claude (Petey → Cody)

### Status

closed-quick

### Goal

Add integration tests proving tournament registration capacity handling under concurrent load, ensuring fail-closed behavior (no oversubscription).

### Context read

- ✅ `docs/rituals/opening.md`
- ✅ `docs/sprints/SESSION_0081.md` (deferred TASK_02 to this session)
- ✅ `apps/web/server/web/tournaments/register.ts` (registration flow with Serializable transaction)
- ✅ `apps/web/server/web/schedule/materialize.concurrency.test.ts` (concurrency test pattern reference)
- ✅ `apps/web/server/admin/tournaments/schema.ts` (division capacity field)

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Testing patterns (integration tests) |
| Extension or replacement | Extension (add tournament-specific concurrency tests following existing patterns) |
| Why justified | Tournament registration capacity violations are a critical data integrity risk; must prove fail-closed behavior |
| Risk if bypassed | Race conditions could allow oversubscription, creating legal/operational issues at tournaments |

## Petey plan

See `docs/sprints/petey-plan-0082.md` for detailed task breakdown and implementation strategy.

### Summary

Implement integration tests for tournament registration capacity race conditions following the `materialize.concurrency.test.ts` pattern. Tests will use real Postgres with Serializable transaction isolation to prove the existing implementation in `register.ts:78-144` prevents oversubscription under concurrent load.

### Key observations from code review

1. **Existing protection:** `createRegistrationCheckout` uses `db.$transaction(..., { isolationLevel: "Serializable" })` at lines 78-144
2. **Capacity check:** Lines 89-93 check `div.capacity` vs `div._count.entries` (ACTIVE entries only)
3. **Free registration fast path:** Lines 117-138 create registration + entries inside the transaction (capacity-safe)
4. **Paid registration:** Returns division data for Stripe checkout; actual registration creation happens in webhook (outside current test scope)

### Test scope

- **In scope:** Free registrations (fully transactional, can test end-to-end)
- **Out of scope:** Paid registration webhook flow (requires Stripe webhook mocking, deferred to future session)
- **Focus:** Prove Serializable transaction prevents duplicate ACTIVE entries beyond capacity

### Decisions

- Use Bun test framework (matches existing pattern)
- Real Postgres dev DB with timestamp-tagged fixtures (`registration-test-${TS}`)
- Two-phase teardown (targeted + zombie sweep)
- Mock same modules as `materialize.concurrency.test.ts` (next/headers, next/cache, auth, rate-limiter)

## What landed

- ✅ **SESSION_0082 created** — Session file with JETTY 3.0 frontmatter, context read, Dirstarter alignment table
- ✅ **Petey plan created** — `docs/sprints/petey-plan-0082.md` with 4 tasks:
  - TASK_01: Create test file with fixtures (user, passport, tournament, discipline, role, division with capacity=1, feeCents=0)
  - TASK_02: Implement capacity race test (1 slot remaining) — parallel calls, assert one succeeds/one fails
  - TASK_03: Implement capacity race test (at capacity) — parallel calls, assert both fail
  - TASK_04: Verification + session close
- ✅ **Code review findings documented:**
  - Existing Serializable transaction protection in `register.ts:78-144`
  - Free registration fully atomic (inside transaction)
  - Paid registration deferred (requires Stripe webhook mocking)
  - Test pattern based on `materialize.concurrency.test.ts`
- ✅ **Scope guard defined** — escalation path if capacity bugs found, or paid registration testing requested

## Files touched

| File | Note |
| --- | --- |
| `docs/sprints/SESSION_0082.md` | Session file — created with bow-in context, closed with quick-close |
| `docs/sprints/petey-plan-0082.md` | Petey plan — 4 tasks for capacity race testing |

## Decisions resolved

- **Test scope:** Free registrations only (fully transactional); paid registration capacity tests deferred to future session (requires Stripe webhook mocking)
- **Test pattern:** Follow `materialize.concurrency.test.ts` — Bun test, real Postgres, module mocks, timestamp-tagged fixtures, two-phase teardown
- **Fixture strategy:** Division with `capacity: 1`, `feeCents: 0` for deterministic race scenarios

## Open decisions / blockers

None — plan is complete and ready for Cody execution in SESSION_0083 or follow-on session.

## Next session

- **Goal:** Implement capacity race tests per petey-plan-0082.md
- **Inputs to read:**
  - `docs/sprints/petey-plan-0082.md` (task breakdown)
  - `apps/web/server/web/schedule/materialize.concurrency.test.ts` (pattern reference)
  - `apps/web/server/web/tournaments/register.ts` (action under test)
- **First task:** TASK_01 — Create test file with fixtures, run fixture lifecycle validation

## Task log

SESSION_0082_TASK_01, SESSION_0082_TASK_02, SESSION_0082_TASK_03

## Review log

SESSION_0082_REVIEW_01 — Self-review by Petey (Claude)

- **Planning completeness:** All 4 tasks defined with clear done criteria, dependencies, agent assignments
- **Scope guard active:** Escalation paths documented for capacity bugs or paid registration testing
- **Code review depth:** Read `register.ts` lines 78-144, identified Serializable transaction protection, free vs paid paths
- **Pattern fidelity:** `materialize.concurrency.test.ts` pattern analysis complete, fixture strategy defined
- **Dirstarter alignment:** Test-only session, no L1 violations, extends existing test patterns

## Hostile close review

- **Dirstarter alignment:** Planning session only — no code changes, no L1 violations
- **Data integrity:** Plan addresses critical capacity race risk per SESSION_0081 recommendation
- **Security/tenancy:** No auth or brand scoping changes planned
- **Verification honesty:** Plan includes scoped typecheck + full test suite run in TASK_04

## ADR / ubiquitous-language check

No ADRs needed. No new domain terms. Planning-only session.
