---
title: "SESSION 0085 — Paid-path capacity oversubscription fix (Petey plan + Cody implementation)"
slug: session-0085
type: session
status: in-progress
created: 2026-05-06
updated: 2026-05-06
last_agent: claude-session-0085
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0084.md
backlinks:
  - docs/knowledge/wiki/index.md
---

## SESSION 0085 — Paid-path capacity oversubscription fix (Petey plan + Cody implementation)

### Date

2026-05-06

### Operator

Brian Scott + Claude (Petey → Cody)

### Status

in-progress

### Goal

Close the paid-path capacity oversubscription window confirmed in SESSION_0084. Webhook must enforce division capacity before writing a Registration; if the slot is gone by the time payment confirms, the loser's payment is refunded and no slot is consumed. The SESSION_0084 oversubscription test flips from `expect(activeEntries).toBe(2)` (BUG) to `toBe(1)` (FIXED) and a new parallel-race variant proves the fix under concurrency.

### Context read

- ✅ `docs/rituals/opening.md`
- ✅ `docs/sprints/SESSION_0084.md` (P0 confirmed; 5-task suggested breakdown queued)
- ✅ `docs/protocols/WORKFLOW_5.0.md` (S3 Tournament Operations completion lane; max 3 deliverables)
- ✅ `docs/protocols/failed-steps-log.md` (no open entries in payments/tournament lane; pattern 4 mitigated)
- ✅ `docs/knowledge/wiki/drift-register.md` (D-001/D-002 resolved; no open drift in payments)
- ✅ `docs/runbooks/graphify-repo-memory.md`
- ✅ `docs/agents/petey.md` + `docs/protocols/petey-plan.md`
- ✅ `apps/web/server/web/tournaments/register.ts` (paid path L78–179; capacity check inside Serializable transaction; refund pattern at L219)
- ✅ `apps/web/app/api/stripe/webhooks/route.ts` (`fulfillTournamentRegistration` L45–117; no capacity re-check; no transaction)
- ✅ `apps/web/app/api/stripe/webhooks/route.test.ts` (current test asserts the bug; comment names the SESSION_0085 flip target)
- ✅ `apps/web/prisma/schema.prisma` enums (RegistrationStatus / PaymentStatus / EntryStatus)
- ✅ `docs/protocols/project-log.md` — prior findings F-01 (Stripe refund lookup fragile, **resolved** SESSION_0046.5 via `stripePaymentIntentId`) and F-02 (capacity check application-level only, **resolved on free path** SESSION_0046.5+0083; **paid path is the still-open half**)

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Monetization (Stripe webhook fulfillment); database (Serializable transaction inside webhook) |
| Extension or replacement | Extension — adds capacity-enforcement transaction to the existing webhook handler; reuses existing Stripe refund pattern from `cancelRegistration` |
| Why justified | SESSION_0084 confirmed P0 oversubscription on paid divisions; without the fix, May 18 launch ships a tournament that will overcommit paid slots and refund-storm at the gate |
| Risk if bypassed | Payment integrity failure: customer pays, slot is double-booked, manual ops must reconcile by inspecting Stripe + Postgres after the fact. Reputational risk on a public WEKAF tournament. |

### Graphify check

- Graph status: refreshed at bow-in. `/tmp/graphify-venv/bin/graphify update .` from repo root: **4767 nodes / 8534 edges / 360 communities** (vs. SESSION_0084's docs-only 3088/2952/274). The new test `app/api/stripe/webhooks/route.test.ts` is now a code node, so the test surface is navigable.
- Queries used (3, priority order):
  1. `"Registration paymentStatus status division capacity entries ACTIVE"` — **low signal.** Tokens like "Status"/"Entries" are too generic; the BFS expanded into wiki structure nodes (`repo-truth-index.md`, `manual-boundary-registry.md`, `incidents.md`) instead of code consumers. **Verdict: graph cannot answer "which readers branch on Registration.status / paymentStatus" on its current edge set; consumer surface confirmed by reading the schema enum + the admin registrations table directly.**
  2. `"Stripe refund paymentIntent webhook"` — **high signal.** Surfaced the entire community 138 (route.ts + route.test.ts + every helper: `fulfillTournamentRegistration`, `fulfillProgramEnrollment`, `grantEntitlementsFromCheckout`, `revokeEntitlementsFromSubscription`, `postWebhook`, `makeTournamentRegistrationCheckoutSession`, `makeCheckoutSessionCompletedEvent`, `buildRacer`, `tag`, `utc`). Also surfaced two prior findings worth knowing: `SESSION_0042_0046_FINDING_01` (Stripe refund lookup fragile — already resolved by `stripePaymentIntentId` storage) and `SESSION_0042_0046_FINDING_02` (capacity check application-level only — paid-path half is what this session closes).
  3. `"Serializable transaction isolationLevel \$transaction"` — **low signal.** Surfaced 8 nodes, all wiki findings (SESSION_0030/0033 finance + waitlist findings). The graph did not surface code-side `$transaction` callsites; existing usages confirmed by direct read: `register.ts:78–144` (capacity transaction) is the only Serializable usage in the tournament lane. `materialize.concurrency` is referenced in the user's prompt but not located in the current code graph traversal — flagged for verification during pre-flight.
- Verification note: the user's instruction to run from repo root (not `docs/`) is honored — the SESSION_0084 graphify-out artifact was deleted before this run; output landed in `graphify-out/` next to `docs/`, outside wiki-lint scope. Files selected for the plan: route.ts, route.test.ts, register.ts (refund pattern at L219), schema.prisma (enums). UI consumer (registrations-table.tsx) is a thin DataTable wrapper that renders status via `getRegistrationColumns()`; the column file is the actual reader and is read inline by Cody at pre-flight if strategy (a) introduces no enum changes.

### Branch + tree state

- Branch: `main`
- Tree: clean (HEAD `f175418`)
- Worktree: `wt-tournaments` lane, **primary repo, no worktree split required.** The fix is one production-code file (route.ts) plus its colocated test (route.test.ts). Both live in community 138; there is no parallel work that benefits from isolation. (Per `feedback_subagent_dispatch`: budget is per-window; a single coupled change on two files does not justify worktree overhead.)

---

## Petey plan

### Goal

Enforce division capacity at webhook fulfillment time. If the slot has been consumed between checkout-create (where capacity was last verified) and `checkout.session.completed`, the registration is rejected at the webhook: the Registration is created with `status = "CANCELLED"` and `paymentStatus = "REFUNDED"`, the entries are marked `CANCELLED` (so they do not count toward ACTIVE capacity), and `stripe.refunds.create` issues the refund using the session's `payment_intent`.

### Strategy choice — recommendation: **(a) Webhook re-check + refund**

Strategy (a) wins on three independent axes for the May 18 launch (12 days out):

| Axis | (a) Webhook re-check + refund | (b) Up-front slot reservation |
|---|---|---|
| Schema impact | None — `RegistrationStatus.CANCELLED` + `PaymentStatus.REFUNDED` already exist | New enum value (`RESERVED` on `RegistrationStatus` and/or `EntryStatus`) → migration |
| New surfaces | Webhook only (route.ts + its test) | register.ts (move Registration creation in) + webhook (flip-only) + `checkout.session.expired` handler + cleanup cron + every consumer of `EntryStatus`/`RegistrationStatus` |
| Refund pattern | Already wired at `register.ts:219` — copy with `session.payment_intent` instead of `registration.stripePaymentIntentId` | Not needed in the happy path, but bad-path TTL still requires expiry tracking |
| Existing test reuse | SESSION_0084's `route.test.ts` flips `toBe(2)` → `toBe(1)` and asserts one Registration ends `CANCELLED`/`REFUNDED`; mock `stripe.refunds.create` to assert it was called once with the loser's `payment_intent` | Test must be rewritten — assertion shifts from "webhook outcome" to "register.ts outcome", and a new path needed for the expiry flow |
| Failure mode if shipped buggy | Customer charged → slot goes to first webhook → loser sees CANCELLED + Stripe refund (visible in their statement) | Customer charged → slot already reserved by their own register.ts call → flip to PAID. But if RESERVED rows leak (cleanup cron fails), slots become permanently unavailable until manual ops |
| Ops surface for May 18 | Sentry alert on refund failure + manual ops escape valve | Sentry alert on stuck RESERVED rows + cron monitoring + manual ops escape valve |
| Schema-decision-cost reversibility | Trivial — strategy (a) lives entirely inside one function | Adding `RESERVED` is reversible but consumers must be re-audited if removed |

The trade-off Brian flagged in SESSION_0084's open question — *"is there any business reason for the current behavior? (e.g., we'd rather oversell paid divisions than reject paid customers)"* — is answered by strategy (a)'s UX: **the customer is never silently oversold a slot.** They are charged, then immediately refunded, and shown a "division filled before payment confirmed" message in TASK_05's UI smoke (deferred). Strategy (a) makes the bad path transparent and auditable.

**Open architectural question that gates strategy (a):** none that block implementation. UX for the rejected-paid customer is deferred to TASK_05 (the deferred-from-SESSION_0083 Registration UI smoke). Refund-failure handling is named below and chosen pragmatically inside this session.

### Tasks

#### TASK_01 — Petey plan (this artifact)
- **Agent:** Petey (Claude)
- **What:** Decide strategy + decompose into Cody-executable steps; surface open decisions for Brian's go.
- **Steps:** (1) read context, (2) verify with graphify, (3) write Petey plan inline in SESSION_0085, (4) append task plan rows to project-log, (5) surface decisions, (6) wait for explicit "go" before TASK_02.
- **Done means:** This SESSION_0085 file with `## Petey plan` block landed; project-log task plan rows for SESSION_0085_TASK_01–03 appended; user has explicit decision points to approve.
- **Depends on:** nothing.

#### TASK_02 — Cody implementation: webhook capacity re-check + refund
- **Agent:** Cody (Claude, sequential — no subagent fan-out)
- **What:** Wrap `fulfillTournamentRegistration` in a Serializable transaction that re-checks each requested division's `ACTIVE` entry count against `capacity` before creating the Registration. If any division would exceed capacity, create the Registration with `status = "CANCELLED"` and `paymentStatus = "REFUNDED"` and `entries.status = "CANCELLED"`, then call `stripe.refunds.create({ payment_intent: <session.payment_intent> })`. The success path stays unchanged.
- **Steps:**
  1. **Pre-flight (Schema/Backend track per `cody-preflight.md`):** paste `RegistrationStatus`, `PaymentStatus`, `EntryStatus` enum values from `prisma/schema.prisma` (already done in this Petey plan — Cody re-paste at execution); read `register.ts` cancelRegistration L185–241 and copy the refund call shape; confirm `stripe.refunds.create` signature in `~/services/stripe`.
  2. Edit `apps/web/app/api/stripe/webhooks/route.ts` `fulfillTournamentRegistration`: wrap the divergent paths (existing-Registration upsert vs. new-create) in a single `db.$transaction(async (tx) => { ... }, { isolationLevel: "Serializable" })`. Inside the transaction, after parsing `divisionIds`, count `ACTIVE` `RegistrationEntry` rows per division and compare to `Division.capacity`; if any over, branch to the rejected-create path (Registration with CANCELLED status + REFUNDED payment + CANCELLED entries) and queue the refund call for after the transaction commits (refund is a network call — never inside a transaction).
  3. After the transaction: if the rejected path ran, call `stripe.refunds.create({ payment_intent })` and log via `console.log` (existing pattern in this file). Wrap in try/catch; if refund fails, log the failure with the registrationId and payment_intent and **do not throw** (would cause Stripe to retry the webhook, double-creating the rejected Registration). Final response stays `200`.
  4. The existing-Registration-found branch (when a Registration row was somehow already written for this `(tournamentId, userId)` — should be impossible given upstream guard, but the upsert exists for race tolerance) keeps the current upsert behavior. No capacity check there — the upsert assumes the prior write went through capacity already.
  5. Edge case: same user, two Stripe sessions (impossible via UI but defensible). The `(tournamentId, userId)` uniqueness constraint catches this — the second webhook hits the existing-Registration branch and just re-flips paymentStatus.
- **Done means:** route.ts updated; `bun tsc --noEmit` clean for the file; no new errors elsewhere.
- **Depends on:** TASK_01 approved.

#### TASK_03 — Cody implementation: flip the SESSION_0084 oversubscription test + add parallel-race variant
- **Agent:** Cody (Claude, same agent as TASK_02 — they share the same file)
- **What:** Update `apps/web/app/api/stripe/webhooks/route.test.ts` to assert the fix:
  - Flip `expect(activeEntries).toBe(2)` → `toBe(1)` for the existing sequential oversubscription test.
  - Add `expect(...registration with paymentStatus: "REFUNDED" and status: "CANCELLED"...).toBeDefined()` for one of the two registrations.
  - Add an assertion that `stripe.refunds.create` was called exactly once with the loser's `payment_intent`. The mock at L65–67 (`refunds.create: async () => ({})`) becomes a `mock.fn()` so calls can be inspected — or use Bun's `spyOn`. Assert call count and `payment_intent` argument.
  - Add a NEW test `it("two parallel webhooks ... → 1 ACTIVE entry, exactly one refund")`: synthesize both events, post via `Promise.all([postWebhook(...), postWebhook(...)])`, assert: total registrations = 2, ACTIVE entries on division = 1, exactly one Registration is CANCELLED/REFUNDED, `stripe.refunds.create` called exactly once.
- **Steps:**
  1. Convert the `~/services/stripe` mock's `refunds.create` to a tracked function so call count + arguments can be inspected. Bun's `mock()` returns a callable with `.mock.calls`.
  2. Flip the existing sequential test's final assertion + add the new Registration/refund assertions.
  3. Add the parallel-race test using the same fixture set (different `sessionId`/`paymentIntentId` per racer).
  4. Run `bun test app/api/stripe/webhooks/route.test.ts` 5× consecutively; confirm zero flake.
- **Done means:** Both tests pass; refunds-tracked mock asserts call count = 1; 5/5 runs stable.
- **Depends on:** TASK_02 (test asserts behavior the fix produces).

#### TASK_04 — Verification + bow-out
- **Agent:** Cody → Petey (Claude)
- **What:** Scoped typecheck, full test re-run, wiki-lint, project-log review block, full-close evidence per `closing.md`.
- **Steps:**
  1. `bun tsc --noEmit` (scoped to changed files) — assert zero new errors; same 3 pre-existing unrelated errors as SESSION_0083/0084 stay unchanged.
  2. `bun test app/api/stripe/webhooks/route.test.ts` — 5/5 stable.
  3. `bun test apps/web/server/web/tournaments/register.concurrency.test.ts` — confirm SESSION_0083 free-path tests still pass (no regression in the shared transaction surface; webhook fix is webhook-local but worth confirming).
  4. `bun run wiki:lint` — 0 errors, ≤ 3 pre-existing warnings.
  5. Append `SESSION_0085_REVIEW_01` to project-log task review log.
  6. Update memory: `project_paid_registration_oversubscription_window` flips from "P0 confirmed unfixed" to "resolved SESSION_0085 via webhook re-check + refund."
  7. Confirm `docs/graphify-out/` was not regenerated under `docs/` (no `graphify update docs/` in this session).
  8. Bow-out.
- **Done means:** SESSION_0085 closed-full with full close evidence; memory updated; next session staged.
- **Depends on:** TASK_03 green.

### Parallelism

**No subagent fan-out, no worktree.** TASK_02 and TASK_03 touch the same two files (route.ts, route.test.ts) and share the same Serializable transaction reasoning. Splitting them across parallel agents would force one to wait for the other's edits to land. Per `feedback_subagent_dispatch`: a coupled two-file change with one decision surface does not amortize the per-window subagent overhead. **Sequential, single Cody session.**

What WOULD parallelize (deferred to SESSION_0086+ if scope opens):
- TASK_05 (deferred): cancel/refund flow tests + Registration UI smoke. UI work + backend tests are disjoint surfaces — split across two Cody agents in worktrees if SESSION_0086 picks them up.

### Agent assignments

| Task | Agent | Rationale |
|---|---|---|
| TASK_01 | Petey (Claude — this artifact) | Strategy decision + decomposition; no code |
| TASK_02 | Cody (Claude, sequential) | Single-file production change; coupled to TASK_03's test |
| TASK_03 | Cody (Claude, same agent as TASK_02) | Test flip + parallel-race variant; reads the same file Cody just edited |
| TASK_04 | Cody → Petey (Claude) | Verification gates and bow-out |

### Open decisions (need Brian's sign-off before TASK_02)

1. **Strategy choice — confirm (a) webhook re-check + refund.** Recommendation above; trade-off table covers (b). If Brian wants (b) for a different reason (e.g., "we're going to need RESERVED for waitlist promotion in SESSION_0086 anyway"), say so before TASK_02 starts and the plan rewrites.
2. **Refund-failure policy.** Recommendation: log + continue; do NOT throw inside the webhook; surface via Sentry/console for ops follow-up. Alternative: throw → Stripe retries → eventual consistency at cost of duplicate-write risk (which the `(tournamentId, userId)` upsert protects against, but ops gets noisier). **Recommended: log + continue.**
3. **No schema migration.** Strategy (a) reuses existing enum values (`RegistrationStatus.CANCELLED`, `PaymentStatus.REFUNDED`, `EntryStatus.CANCELLED`). No new enum values, no Prisma migration. **Confirm: schema is unchanged in this session.**
4. **TASK_05 (cancel/refund flow tests + Registration UI smoke) stays deferred** to SESSION_0086 per WORKFLOW 5.0 max-3-deliverables rule. SESSION_0085 ships TASK_01–04 only.
5. **No new memory updates this turn** (Petey plan only). At bow-out, the existing `project_paid_registration_oversubscription_window` memory flips from "confirmed P0" → "resolved SESSION_0085."

### Risks

- **Refund call inside transaction is a footgun.** Solved at TASK_02 step 3: refund happens AFTER the transaction commits. If refund fails, Registration is already marked CANCELLED/REFUNDED in DB; ops can replay manually.
- **Parallel-race test (TASK_03) flake.** The Serializable transaction is the protection; if the fix is correct, both POSTs serialize and only one wins. If flakes appear, the fix is wrong — that's the test's job.
- **Bun mock function reset between tests.** Need to clear `stripe.refunds.create` call history in `beforeEach` so the count assertion is per-test. TASK_03 step 1 names this.
- **Wiki-lint poison from `docs/graphify-out/`.** SESSION_0084 lesson honored — graphify ran from repo root this session; artifact is at `graphify-out/`, outside wiki-lint scope. No action needed at close.

### Scope guard

If TASK_02 surfaces a constraint that requires schema work (e.g., adding a `REJECTED` status because CANCELLED conflates manual-cancel with payment-rejection), **STOP and re-Petey.** Do NOT introduce a Prisma migration in TASK_02. The current enum reuse (CANCELLED + REFUNDED) is the explicit decision; if it doesn't fit, that's a new architectural decision that needs a fresh Petey turn, not an inline pivot.

If TASK_03's parallel-race test reveals a different concurrency defect (e.g., the existing-Registration upsert branch races with itself), log to `Open decisions / blockers` and complete TASK_03 against the documented behavior — do not extend scope inside this session.

### Dirstarter implementation template

- **Docs read first:** N/A — no Dirstarter L1/L2 primitive surfaces touched. The fix is server-side webhook + integration test against the real DB. No UI primitives, no auth chain change, no Prisma model change. (TASK_05's deferred UI smoke would consult Dirstarter UI docs — not this session.)
- **Baseline pattern to extend:** `apps/web/server/web/tournaments/register.ts` cancelRegistration L185–241 — the canonical Stripe-refund-on-cancel pattern. The webhook's rejection path is the same shape (`stripe.refunds.create({ payment_intent })`) with the only difference being the source of `payment_intent` (session vs. stored Registration field).
- **Custom delta:** the rejection path itself — Registration created in CANCELLED+REFUNDED state on first write, rather than being mutated from a prior PAID state.
- **No-bypass proof:** Dirstarter does not own webhook capacity-check logic. This is Ronin-specific tournament division capacity policy, not a Dirstarter monetization layer extension. The Stripe refund SDK call is the Dirstarter-shape operation we extend.

---

## Pre-flight (Cody — to be filled at TASK_02 start)

Cody must produce a `## Pre-flight output` block here before editing route.ts. Required fields per `cody-preflight.md` Schema/Backend track:

- **Existing-schema spot-check:** paste from `prisma/schema.prisma` — `RegistrationStatus`, `PaymentStatus`, `EntryStatus` enum values verbatim.
- **Module-import spot-check:** paste the actual signature of `stripe.refunds.create` from `~/services/stripe` (or its type from `@types/stripe`).
- **Pattern fidelity check:** paste lines `register.ts:219–222` (the canonical refund call) to confirm the shape is being reused, not reinvented.

This block stays empty until Cody starts TASK_02.

## What landed

(Fills in during/after TASK_02–04.)

## Files touched

(Fills in during TASK_04.)

## Decisions resolved

(Fills in as work proceeds.)

## Open decisions / blockers

- **TASK_01 awaiting Brian's go on:** strategy (a) confirmation + refund-failure policy + schema-unchanged confirmation + TASK_05 deferral. See `## Petey plan → Open decisions` above.

## Next session

Filled at bow-out via Review & Recommend protocol. Likely staging:
- TASK_05 (deferred): cancel/refund flow tests + Registration UI smoke for the rejected-paid customer experience.
- Any P2/P3 findings surfaced during SESSION_0085 hostile close.

## Task log

SESSION_0085_TASK_01 (Petey plan, in this turn), SESSION_0085_TASK_02, SESSION_0085_TASK_03, SESSION_0085_TASK_04 (queued, gated on Brian's go).

## Review log

(Filled at TASK_04 — `SESSION_0085_REVIEW_01` will live in project-log.md.)
