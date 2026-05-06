---
title: "Petey Plan — SESSION 0082"
slug: petey-plan-0082
type: plan
status: active
created: 2026-05-06
updated: 2026-05-06
last_agent: claude-session-0082
pairs_with:
  - docs/sprints/SESSION_0082.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Petey Plan — SESSION 0082

## Goal

Add integration tests proving tournament registration capacity handling under concurrent load, ensuring fail-closed behavior (no oversubscription).

## Context

SESSION_0081 deferred TASK_02 (registration capacity race tests) per Petey scope guard. Current session is dedicated to implementing those tests.

### Code analysis findings

**File:** `apps/web/server/web/tournaments/register.ts`

**Existing protection mechanism:**
- Lines 78-144: `db.$transaction(..., { isolationLevel: "Serializable" })`
- Lines 80-87: Fetch divisions with ACTIVE entry count
- Lines 89-93: Capacity check loop — throws if `div._count.entries >= div.capacity`
- Lines 117-138: Free registration creation (fully inside transaction)

**Two registration paths:**
1. **Free (totalFeeCents === 0):** Registration + entries created inside transaction → fully atomic, capacity-safe
2. **Paid (totalFeeCents > 0):** Capacity check passes, Stripe session created, actual registration happens in webhook → **outside test scope** (webhook mocking deferred to future session)

**Test strategy:**
- Focus on **free registrations only** (end-to-end transactional)
- Parallel calls to `createRegistrationCheckout` with `divisionIds` pointing to capacity-constrained division
- Assert: one succeeds, one fails with "Division ... is at capacity"
- Assert: total ACTIVE entries === division.capacity (no oversubscription)

## Tasks

### TASK_01 — Create test file with fixtures

**Agent:** Cody

**What:** Create `apps/web/server/web/tournaments/register.concurrency.test.ts` with test fixtures (user, passport, tournament, discipline, role, division).

**Steps:**
1. Copy skeleton from `materialize.concurrency.test.ts` (module mocks, beforeAll/afterAll structure)
2. Create test-specific tag function: `registration-test-${TS}`
3. **Fixtures:**
   - User with email + name tagged
   - Passport for user
   - Tournament (PUBLISHED status, BASELINE_MARTIAL_ARTS brand)
   - TournamentDiscipline linked to system discipline
   - TournamentRole (system COMPETITOR role or create tagged one)
   - Division with `capacity: 1`, `feeCents: 0` (free registration), linked to tournament discipline + role
4. Set `sessionUserState.id` to created user
5. Teardown: delete in reverse dependency order (registrationEntry → registration → division → tournamentDiscipline → tournament → passport → user)
6. Zombie sweep: find all `registration-test-` prefixed fixtures and delete

**Done means:**
- Test file compiles
- `beforeAll` creates all fixtures successfully
- `afterAll` cleans up without constraint violations
- `bun test apps/web/server/web/tournaments/register.concurrency.test.ts` runs (no tests yet, just fixture lifecycle)

**Depends on:** nothing

---

### TASK_02 — Implement capacity race test (1 slot remaining)

**Agent:** Cody

**What:** Test parallel registration when division has exactly 1 slot remaining.

**Steps:**
1. In `beforeAll`, create one ACTIVE registration entry to consume capacity-1 slots (so `_count.entries === capacity - 1`)
2. Add test: "two parallel registrations when division has 1 slot remaining"
3. Fire two parallel `createRegistrationCheckout` calls with same `divisionIds: [divisionId]`, `roleCode: "COMPETITOR"`, `tournamentId`, no `representingMembershipId`
4. Assert: exactly one call succeeds (`data.type === "free"`)
5. Assert: exactly one call fails with `serverError` containing "at capacity"
6. Query `registrationEntry` table: count ACTIVE entries for division
7. Assert: `_count.entries === division.capacity` (no oversubscription)

**Done means:**
- Test passes consistently (run 5+ times)
- No flakiness
- Proves Serializable transaction prevents oversubscription

**Depends on:** TASK_01

---

### TASK_03 — Implement capacity race test (at capacity)

**Agent:** Cody

**What:** Test parallel registration when division is already at full capacity.

**Steps:**
1. In test setup, create ACTIVE registration entries to consume all capacity slots
2. Add test: "two parallel registrations when division is at capacity"
3. Fire two parallel `createRegistrationCheckout` calls
4. Assert: both calls fail with `serverError` containing "at capacity"
5. Query `registrationEntry` table: count ACTIVE entries for division
6. Assert: `_count.entries === division.capacity` (capacity unchanged)

**Done means:**
- Test passes consistently
- Proves both callers see capacity violation (fail-closed)

**Depends on:** TASK_01

---

### TASK_04 — Verification + session close

**Agent:** Petey

**What:** Run quick close protocol per `docs/rituals/closing.md`.

**Steps:**
1. Run scoped typecheck on test file: `cd apps/web && bun tsc --noEmit server/web/tournaments/register.concurrency.test.ts`
2. Run full test suite: `bun test apps/web/server/web/tournaments/register.concurrency.test.ts`
3. Update SESSION_0082 file with `What landed`, `Files touched`, `Decisions resolved`, `Open decisions / blockers`, `Next session`
4. JETTY sweep if needed
5. Git hygiene: commit with message `test: add tournament registration capacity race condition tests`
6. Bow-out line

**Done means:** SESSION_0082.md complete with `closed-quick` status

**Depends on:** TASK_02, TASK_03

## Parallelism

TASK_01 must complete first. TASK_02 and TASK_03 can run sequentially (same file, same fixtures). TASK_04 runs last.

## Agent assignments

| Task | Agent | Rationale |
|---|---|---|
| TASK_01 | Cody | Fixture setup following existing patterns |
| TASK_02 | Cody | Test implementation, clear success/fail criteria |
| TASK_03 | Cody | Test implementation, clear success/fail criteria |
| TASK_04 | Petey | Session management + bow-out |

## Open decisions

None — all work is scoped based on SESSION_0081 deferral and code review findings.

## Risks

- **Free-only scope limitation:** Paid registration capacity races require Stripe webhook mocking (deferred to future session if needed)
- **Transaction isolation flakiness:** Serializable isolation on Postgres dev DB may occasionally fail with serialization errors (retry logic exists in action client, should surface as clean failure not test flake)

## Scope guard

If tests reveal actual capacity bugs (e.g., oversubscription occurs):
1. Stop test implementation
2. Note findings in SESSION_0082 `Open decisions / blockers`
3. Escalate to Petey for schema/logic fix planning
4. Defer test completion to post-fix session

If paid registration capacity testing is requested mid-session:
1. Note in `Open decisions / blockers`
2. Defer to SESSION_0083 (requires Stripe webhook mock infrastructure)

## Dirstarter implementation template

- **Docs read first:** `apps/web/server/web/schedule/materialize.concurrency.test.ts` (existing concurrency test pattern)
- **Baseline pattern to extend:** Bun test + real Postgres + module mocks + fixture tagging + two-phase teardown
- **Custom delta:** Tournament-specific fixtures (tournament, discipline, role, division), registration action invocation
- **No-bypass proof:** Not applicable (test-only session, no Dirstarter baseline modified)

## Expected outcomes

- ✅ 2+ capacity race scenarios tested
- ✅ Tests pass consistently (no flakiness)
- ✅ Proof that Serializable transaction prevents oversubscription
- ✅ Documentation of test patterns for future tournament tests

## Next session recommendations

If tests pass → SESSION_0083: Return to tournament operations lane (bracket generation, match scheduling, or admin UI)

If tests reveal bugs → SESSION_0083: Fix capacity race bugs, re-run tests, then return to tournament ops

If paid registration testing is needed → SESSION_0084: Stripe webhook mock infrastructure + paid registration capacity tests
