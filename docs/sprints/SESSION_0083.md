---
title: "SESSION 0083 — Tournament registration capacity race tests (Cody execution)"
slug: session-0083
type: session
status: in-progress
created: 2026-05-06
updated: 2026-05-06
last_agent: claude-session-0083
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0082.md
  - docs/sprints/petey-plan-0082.md
backlinks:
  - docs/knowledge/wiki/index.md
---

## SESSION 0083 — Tournament registration capacity race tests (Cody execution)

### Date

2026-05-06

### Operator

Brian Scott + Claude (Cody → Petey)

### Status

closed-quick

### Goal

Execute petey-plan-0082: implement integration tests proving tournament registration capacity is fail-closed under concurrent load. Free-path only (paid/Stripe-webhook deferred).

### Context read

- ✅ `docs/rituals/opening.md`
- ✅ `docs/sprints/SESSION_0082.md` (planning session — produced petey-plan-0082)
- ✅ `docs/sprints/petey-plan-0082.md` (4-task plan)
- ✅ `docs/runbooks/graphify-repo-memory.md`
- ✅ `apps/web/server/web/schedule/materialize.concurrency.test.ts` (pattern reference, lines 1–60)
- ⏳ `apps/web/server/web/tournaments/register.ts` (action under test — open at TASK_01)

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Testing patterns (integration tests) |
| Extension or replacement | Extension — adds tournament-specific concurrency test alongside existing `materialize.concurrency.test.ts` |
| Why justified | Capacity oversubscription is a data-integrity risk with legal/operational exposure at live tournaments |
| Risk if bypassed | Race conditions could allow oversubscription; Serializable transaction protection would remain unproven |

### Graphify check

- Graph status: current (built `ff76c706`; HEAD `5c01b64e`; only docs commits between)
- Query used: `graphify query "createRegistrationCheckout materialize.concurrency.test"`
- Files selected from graph: `register.ts` (community 14), `materialize.concurrency.test.ts` (community 31), shared infra `db.ts`, `auth.ts`, `rate-limiter.ts`, `brand-context.ts`, `safe-actions.ts`
- Verification note: graph confirmed shared mock surface (auth, headers, cache, rate-limiter) between the two communities; pattern is portable. File targets were already explicit in the plan, so graphify served as confirmation rather than discovery.

### Task plan

Per `petey-plan-0082.md`:

- SESSION_0083_TASK_01 — Create `register.concurrency.test.ts` skeleton + fixtures (user, passport, tournament, discipline, role, division capacity=1 feeCents=0); fixture-lifecycle smoke run
- SESSION_0083_TASK_02 — Race test with 1 slot remaining (parallel calls; assert one success / one capacity failure; ACTIVE entries === capacity)
- SESSION_0083_TASK_03 — Race test at capacity (parallel calls; both fail capacity; ACTIVE entries unchanged)
- SESSION_0083_TASK_04 — Verification (typecheck + scoped test run) + bow-out

## What landed

- ✅ **`apps/web/server/web/tournaments/register.concurrency.test.ts`** — three integration tests against the real Postgres dev DB:
  - **Smoke / fixture lifecycle:** single free registration end-to-end (verifies all real fixtures + mocks work; confirms 1 ACTIVE entry created)
  - **TASK_02 — 1 slot remaining:** users B and C race for the last slot; exactly one succeeds (`data.type === "free"`), one fails with `serverError` matching `/at capacity/`; final ACTIVE count = 1
  - **TASK_03 — at capacity:** user A pre-fills the slot; users B and C race; both fail `/at capacity/`; final ACTIVE count = 1 (unchanged)
- ✅ **Real fixtures (no auth/entitlement mocks)** — Entitlement (`tournament-registration` upserted), UserEntitlement, Membership, Passport for users A/B/C; Organization, Discipline, Tournament (PUBLISHED, BASELINE_MARTIAL_ARTS), TournamentDiscipline, TournamentRole (system COMPETITOR or tagged), Division (`capacity=1`, `feeCents=0`)
- ✅ **AsyncLocalStorage auth mock** — `userIdALS.run(userId, fn)` lets two parallel `createRegistrationCheckout` invocations authenticate as different users; falls back to `sessionUserState.id` when no ALS context is set
- ✅ **Two-phase teardown** — targeted deletes for this run + zombie sweep for any prior failed runs (matches `materialize.concurrency.test.ts` pattern)
- ✅ **Stability** — 5/5 consecutive runs pass with no flakiness
- ✅ **Scoped typecheck clean** — `bun tsc --noEmit` produces 3 pre-existing errors in unrelated files (`app/admin/tournaments/roles/[id]/page.tsx`, `app/admin/tournaments/rule-sets/_components/rule-set-form.tsx`, `server/web/categories/queries.ts`); none from this work

## Files touched

| File | Note |
| --- | --- |
| `apps/web/server/web/tournaments/register.concurrency.test.ts` | New — capacity race tests (3 cases) |
| `docs/sprints/SESSION_0083.md` | New — session file |

## Decisions resolved

- **Real fixtures over mocks** for the entitlement + brand-membership guards. The integration test's value is in hitting real Postgres precisely so we don't have to trust mocks; mocking those guards would undercut that.
- **AsyncLocalStorage for per-call user identity** — required because the auth mock is module-scoped global state; two parallel calls would otherwise share a single `sessionUserState.id` and the race would be on the `Registration` unique constraint (`tournamentId, userId`) rather than the capacity check.
- **Same-user race is a different test** — and not the one the plan needed. The plan's "exactly one succeeds, one fails 'at capacity'" assertion only holds when racing different users; same-user would fail the second attempt with a unique-constraint message, masking what we're trying to prove.
- **Slot-filler in TASK_03 uses direct Prisma write** for the pre-existing registration owned by user A — deterministic at-capacity starting state, no race.
- **Stripe service mocked** — `register.ts` imports `~/services/stripe` at the top level; even though the free path never calls it, module load needs `STRIPE_SECRET_KEY` unless the import is mocked.

## Open decisions / blockers

None.

## Next session

**Goal:** Get the whole registration flow set — paid-path capacity proofs + Stripe webhook integration tests + full registration UX validation.

**Inputs to read:**

- `apps/web/server/web/tournaments/register.ts` (free + paid paths)
- `apps/web/app/api/stripe/webhooks/route.ts` (paid registration finalization happens here)
- `apps/web/server/web/tournaments/register.concurrency.test.ts` (pattern from this session)
- `apps/web/server/web/schedule/materialize.concurrency.test.ts` (other concurrency reference)
- Any existing Stripe webhook test fixtures (search: `stripe webhook test`)

**Suggested task breakdown:**

1. **TASK_01 — Stripe webhook test infrastructure:** mock `stripe.checkout.sessions.create` to return a deterministic session; build a helper that synthesizes a `checkout.session.completed` webhook event with metadata mirroring what `register.ts` writes (`tournamentId`, `userId`, `divisionIds`, `roleId`, `representingMembershipId`); verify webhook signature mocking.
2. **TASK_02 — Paid registration capacity race:** parallel paid checkout creations for the last slot. Capacity is checked at checkout-create time but the registration row is written at webhook time — verify what happens if two checkouts succeed and both webhooks fire (does the webhook re-check capacity, or can two paid registrations consume one slot?). **This is the real failure mode to prove out.**
3. **TASK_03 — End-to-end paid flow:** capacity check → Stripe checkout → webhook → registration created. Assert `paymentStatus = "PAID"`, entries are ACTIVE, `stripePaymentIntentId` is recorded.
4. **TASK_04 — Cancellation + refund flow:** `cancelRegistration` against a paid registration triggers refund and flips status; verify entries become CANCELLED.
5. **TASK_05 — Registration UI smoke (manual or Playwright):** RegisterButton → division select → free path renders success banner; paid path redirects to Stripe checkout (mocked).

**Open architectural question for next session:** Does the webhook re-check capacity? If not (and capacity was checked only at checkout-create time), there's an oversubscription window between checkout creation and webhook arrival. This may need a Petey plan if it surfaces a schema/logic bug.

**First task:** TASK_01 — stand up the Stripe webhook test harness.

## Task log

SESSION_0083_TASK_01, SESSION_0083_TASK_02, SESSION_0083_TASK_03, SESSION_0083_TASK_04

## Review log

SESSION_0083_REVIEW_01 — Self-review by Cody (Claude)

- **Test correctness:** 3/3 pass; 5/5 reruns confirm no flakiness
- **Race semantics:** different-user races genuinely exercise the Serializable capacity check (not the Registration unique constraint)
- **Fixture realism:** no auth/entitlement mocks; real Entitlement + UserEntitlement + Membership rows
- **Cleanup:** two-phase teardown (targeted + zombie sweep) verified across 5 consecutive runs with no orphan rows
- **Typecheck:** clean for new file; 3 pre-existing unrelated errors not caused by this work
- **Pattern fidelity:** matches `materialize.concurrency.test.ts` mock surface, fixture tagging, teardown strategy

## Hostile close review

- **Dirstarter alignment:** Test-only addition; no L1 baseline files modified
- **Data integrity:** Test proves Serializable transaction prevents oversubscription on the free path (out-of-scope: paid path — flagged in next session)
- **Security/tenancy:** Real entitlement + brand-membership guards exercised; not bypassed
- **Verification honesty:** "Pass" claim is backed by 5 consecutive successful runs against the real dev DB, not a single happy-path; typecheck delta verified by file
- **Scope discipline:** Did not extend into paid-path testing (correctly deferred per petey-plan-0082's scope guard)

## ADR / ubiquitous-language check

No ADRs needed. No new domain terms introduced. Test-only session.
