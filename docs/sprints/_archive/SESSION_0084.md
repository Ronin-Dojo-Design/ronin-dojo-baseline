---
title: "SESSION 0084 — Stripe webhook test harness + paid-path capacity oversubscription proof"
slug: session-0084
type: session
status: closed-full
created: 2026-05-06
updated: 2026-05-06
last_agent: claude-session-0084
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0083.md
backlinks:
  - docs/knowledge/wiki/index.md
---

## SESSION 0084 — Stripe webhook test harness + paid-path capacity oversubscription proof

### Date

2026-05-06

### Operator

Brian Scott + Claude (Cody → Petey)

### Status

closed-full

### Goal

Build the Stripe webhook test harness and use it to prove (or disprove) the paid-path capacity oversubscription window flagged in SESSION_0083: two paid checkouts can both pass the create-time capacity check, then both webhooks fire and both write Registrations against a `capacity=1` division.

### Context read

- ✅ `docs/rituals/opening.md`
- ✅ `docs/sprints/SESSION_0083.md` (previous session — free-path concurrency tests; flagged paid path P3 finding)
- ✅ `docs/protocols/WORKFLOW_5.0.md` (S3 Tournament Operations completion lane)
- ✅ `docs/protocols/failed-steps-log.md` (FS-0014 L1 component inventory pattern; not relevant to test-only work)
- ✅ `docs/knowledge/wiki/drift-register.md` (no open drift in payments/tournament lanes)
- ✅ `docs/runbooks/graphify-repo-memory.md`
- ✅ `apps/web/app/api/stripe/webhooks/route.ts` (L1–120 read; `fulfillTournamentRegistration` confirmed does NOT re-check division capacity)
- ✅ `apps/web/server/web/tournaments/register.ts` (L1–80 read; capacity check is in `db.$transaction` at checkout-create time only)
- ✅ `apps/web/server/web/tournaments/register.concurrency.test.ts` (pattern reference from SESSION_0083)

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Testing patterns + monetization (Stripe webhook integration) |
| Extension or replacement | Extension — adds first paid-path concurrency proof; reuses SESSION_0083 fixture/teardown pattern |
| Why justified | The webhook does not re-check capacity; without a test, oversubscription on paid divisions is silent |
| Risk if bypassed | Live tournament could oversubscribe paid divisions and refund-storm at the gate |

### Graphify check

- Graph status: refreshed at bow-in. Wiki-only update (`graphify update docs/`) ran cleanly: 3088 nodes, 2952 edges, 274 communities. Code graph still on commit `af7d2e8e` (HEAD `efeb3ab`); refresh did not include the SESSION_0083 test file as a new code node — acceptable since the file is already known and `register.concurrency.test.ts` is the pattern reference, not the target.
- Query used: `graphify query "Stripe webhook checkout.session.completed registration" --budget 2000`
- Files selected from graph (high-signal, community 157 = stripe + webhooks cluster):
  - `apps/web/app/api/stripe/webhooks/route.ts` (POST handler at L190; `fulfillTournamentRegistration` at L45)
  - `apps/web/services/stripe.ts` (Stripe SDK singleton — must be mocked at module load)
  - `apps/web/components/admin/tournaments/registrations-table.tsx` (community 29 — registration display surface; not under test but confirms the action is wired into admin UI)
- Verification note: graph confirmed there are **no existing Stripe webhook tests** (only `register.concurrency.test.ts` matched on `stripe`). Webhook test infrastructure is greenfield. The shared mock surface from SESSION_0083 (`db`, `auth`, `stripe`, `headers`, `next/cache`, `rate-limiter`, `brand-context`) is portable.

### Task plan

- SESSION_0084_TASK_01 — Stripe webhook test harness: build `apps/web/app/api/stripe/webhooks/route.test.ts` (or a colocated helper + first test) that mocks `stripe.webhooks.constructEvent` to bypass signature verification, mocks `stripe.checkout.sessions.create` for the upstream `register.ts` call, and exposes a helper `makeTournamentRegistrationCheckoutSession(metadata)` that synthesizes a `Stripe.Checkout.Session` matching the metadata shape `register.ts` writes (`tournamentId`, `userId`, `divisionIds`, `roleId`, `representingMembershipId`). Smoke test: one POST → one PAID Registration row.
- SESSION_0084_TASK_02 — Paid capacity oversubscription proof: race two paid checkouts for the last slot of a `capacity=1` division. Drive both through to checkout-create (parallel) and then synthesize both `checkout.session.completed` POSTs (also parallel) against the webhook route. Assert what the system actually does and record it. Expected outcome from code reading: oversubscription (2 ACTIVE entries on the capacity=1 division). If confirmed, this is a P0 architectural finding requiring a Petey plan in SESSION_0085 — the test ships as red until the fix lands.
- SESSION_0084_TASK_03 — Verification + bow-out: scoped typecheck (`bun tsc --noEmit`), scoped test run (5/5 stable), wiki-lint, full close evidence, project-log review block.

**Scope discipline:** End-to-end paid happy path is folded into TASK_01's smoke + TASK_02's setup. Cancel/refund flow + Registration UI smoke are deferred to SESSION_0085 (per WORKFLOW 5.0 max-3-deliverables rule). The headline architectural question — does the webhook re-check capacity? — is the centerpiece.

### Petey plan note

Petey waived for this session: scope is two related test deliverables sharing a single fixture surface (paid-path Stripe webhook). SESSION_0083 already produced the broader `petey-plan-0082`-equivalent breakdown in its `Next session` block (5 tasks); this session takes the first 2 + verification. If TASK_02 confirms the P0 oversubscription, **SESSION_0085 must invoke Petey** to plan the fix (webhook capacity re-check vs. moving Registration creation into the checkout-create transaction vs. some other strategy).

### Branch + tree state

- Branch: `main`
- Tree: clean (last commit `efeb3ab` — `docs: full-close SESSION_0083`)
- Worktree: `wt-tournaments` lane, primary repo (no worktree shift required for test-only changes that pair with SESSION_0083's tests already on main)

### Pre-flight (Cody — Schema/Backend track)

This is test-only work touching no schema and no production code. Pre-flight focuses on the existing module surfaces:

- **Existing-schema spot-check (none touched):** No models or enums modified. `Registration`, `RegistrationEntry`, `Division` already verified in SESSION_0083 fixtures; reusing the same shapes.
- **Module-import spot-check (mock plan):** `apps/web/app/api/stripe/webhooks/route.ts` imports `next/cache.revalidateTag`, `next/server.after`, `stripe` (type-only `Stripe`), `~/env`, `~/lib/notifications` (`notifyAdminOfPremiumTool`, `notifySubmitterOfPremiumTool`), `~/services/db`, `~/services/stripe`. Mock surface: `~/services/stripe` (constructEvent + sessions.create + refunds.create), `~/lib/notifications` (no-op the two notify exports — they fire on premium tool fulfillment, not relevant to tournament path), `next/cache` (no-op `revalidateTag`), `next/server.after` (run inline). `~/env` real. `~/services/db` real (we want hits against dev DB, same as SESSION_0083).
- **Pattern fidelity check:** Reusing the SESSION_0083 mock surface (db real, auth mocked via ALS where needed, headers/cache mocked, rate-limiter mocked) and two-phase teardown (targeted + zombie sweep on tagged fixtures).

## What landed

- ✅ **`apps/web/app/api/stripe/webhooks/route.test.ts`** — Stripe webhook integration test harness against the real dev Postgres DB:
  - **Module mocks (registered before route import):** `~/env` (Proxy that delegates to `process.env` and stubs the empty Stripe secrets — t3-env's `emptyStringAsUndefined` was caching the empty `STRIPE_WEBHOOK_SECRET` from `.env`), `~/services/stripe` (signature bypass + no-op outbound calls), `next/cache`, `next/server.after` (runs inline), `~/lib/notifications`.
  - **Helpers:** `makeTournamentRegistrationCheckoutSession({...})` builds a `Stripe.Checkout.Session` with metadata mirroring `register.ts` exactly (`type: "tournament_registration"`, JSON-stringified `divisionIds`, etc.); `makeCheckoutSessionCompletedEvent(session)` wraps it as a `Stripe.Event`; `postWebhook(event)` synthesizes a `Request` and calls the real `POST` handler.
  - **Fixtures:** Reuse SESSION_0083's pattern (real users A/B/C with Passport + Membership + UserEntitlement; real Tournament + Discipline + Role + Division). One difference: `feeCents = 5000` so the paid path is exercised. Two-phase teardown (targeted + zombie sweep on `webhook-test-*` tag prefix).
- ✅ **TASK_01 smoke test** — one synthesized `checkout.session.completed` → `200` response, exactly one PAID Registration with `paymentStatus = "PAID"`, `status = "SUBMITTED"`, `totalFeeCents = 5000`, `stripePaymentIntentId` matching `^pi_test_`, one ACTIVE entry on the division.
- ✅ **TASK_02 P0 oversubscription proof** — two sequential webhook POSTs for users B and C against the same `capacity = 1` division both return `200` and write Registrations. **Final state: 2 ACTIVE entries on a `capacity = 1` division.** The webhook is fail-open by design — `fulfillTournamentRegistration` only checks Registration uniqueness on `(tournamentId, userId)`, not division capacity. **This is a confirmed P0 architectural finding.**
- ✅ **Stability** — 5/5 consecutive runs pass with no flakiness.
- ✅ **Scoped typecheck** — `bun tsc --noEmit` produces zero errors in the new file. Same 3 pre-existing unrelated errors as SESSION_0083 (`app/admin/tournaments/roles/[id]/page.tsx`, `app/admin/tournaments/rule-sets/_components/rule-set-form.tsx`, `server/web/categories/queries.ts`); none introduced.
- ✅ **Wiki-lint** — 0 errors, 3 pre-existing orphan warnings (same as SESSION_0083: `topic-index.md`, `concepts/tournament-ops.md`, `dirstarter-uplift-backlog.md`). Note: bow-in's `graphify update docs/` wrote a `docs/graphify-out/` artifact whose auto-generated report introduced 4 broken-link errors; deleted before close (graphify-out is a navigation aid, not authored wiki content; runbook explicitly says "Do not commit `graphify-out/`").

## Files touched

| File | Note |
| --- | --- |
| `apps/web/app/api/stripe/webhooks/route.test.ts` | New — webhook test harness + smoke + P0 oversubscription proof |
| `docs/sprints/SESSION_0084.md` | New — session file |
| `docs/protocols/project-log.md` | Edited — appended SESSION_0084 task plan rows + review block |

## Decisions resolved

- **Mock `~/env` instead of mutating `process.env`.** t3-env caches the resolved value on first access; `emptyStringAsUndefined: true` plus the empty `STRIPE_WEBHOOK_SECRET=""` in `.env` resolved to `undefined` and stayed there. A Proxy mock that delegates to `process.env` (with stubs only for the two empty Stripe keys) keeps the rest of the env functional (notably `DATABASE_URL` for the real `db` import) without re-implementing t3-env validation. **New feedback memory.**
- **Sequential webhooks are sufficient proof.** Race timing isn't required to demonstrate the architectural defect — the webhook does not re-check capacity, so each call independently writes a Registration regardless of order. Adding parallel POSTs would prove the same fact with more flakiness risk.
- **Test asserts current (broken) behavior, not the intended fix.** `expect(activeEntries).toBe(2)` documents what the system does today. SESSION_0085's fix flips this to `toBe(1)` and asserts that one of the two POSTs surfaces a rejected registration (or that one Registration ends up REJECTED/REFUNDED). Comment in the test names the flip.
- **Webhook test file lives next to the route**, not under `__tests__/`. Bun's test runner discovers any `*.test.ts`; colocation matches the existing pattern (`register.concurrency.test.ts` lives next to `register.ts`).

## Open decisions / blockers

- **P0 confirmed: Stripe webhook does not enforce tournament division capacity.** `fulfillTournamentRegistration` (route.ts L45–117) checks `(tournamentId, userId)` Registration uniqueness only; division capacity is checked solely at checkout-create time inside `register.ts`'s Serializable transaction. The window between "checkout-create capacity check" and "webhook writes Registration" is unbounded — Stripe can hold a checkout for hours, and any concurrent paid checkouts during that window can both fulfill. **Resolution required in SESSION_0085 (Petey plan).**

## Next session

**Goal:** Petey plan + Cody fix for the paid-path capacity oversubscription window (P0).

**Inputs to read:**

- `apps/web/app/api/stripe/webhooks/route.ts` (especially `fulfillTournamentRegistration` L45–117)
- `apps/web/server/web/tournaments/register.ts` (paid path L141–179, especially the metadata write at L166–173)
- `apps/web/app/api/stripe/webhooks/route.test.ts` (the test currently asserts the bug; flip to assert the fix)
- `apps/web/server/web/tournaments/register.concurrency.test.ts` (free-path pattern)

**Suggested task breakdown (to be confirmed by Petey):**

1. **TASK_01 — Petey plan:** decide between (a) re-check capacity inside `fulfillTournamentRegistration` under Serializable isolation, with one of the parallel webhooks rejected (Registration created with status `REJECTED` + a Stripe refund issued), or (b) move Registration creation into `register.ts`'s checkout-create transaction (reserve the slot up front; webhook flips paymentStatus only). Trade-offs: (a) is webhook-local but requires Stripe refund logic in the webhook; (b) creates Registrations that may never be paid (need TTL/expiry).
2. **TASK_02 — Cody implementation** of the chosen strategy.
3. **TASK_03 — Flip the existing test** from `expect(activeEntries).toBe(2)` to `toBe(1)` and assert one of the two POSTs surfaces a rejection (and any state — Registration status, Stripe refund call — that the chosen strategy implies).
4. **TASK_04 — Add a parallel-race variant** (`Promise.all` of two `postWebhook` calls) once the fix is in place — strengthens the proof with concurrency coverage.
5. **TASK_05 — Cancel/refund flow tests + Registration UI smoke** (deferred from SESSION_0083's plan).

**First task:** TASK_01 — Petey plan for the capacity-enforcement strategy.

**Open architectural question:** is there any business reason for the current behavior? (e.g., "we'd rather oversell paid divisions than reject paid customers — refund post-hoc.") The answer affects the strategy choice. Likely no — but worth confirming with Brian before SESSION_0085 commits to a path.

## Task log

SESSION_0084_TASK_01, SESSION_0084_TASK_02, SESSION_0084_TASK_03

## Review log

SESSION_0084_REVIEW_01 — Self-review by Cody (Claude)

- **Test correctness:** 2/2 pass; 5/5 reruns confirm no flakiness
- **Architectural finding:** code-reading-confirmed (route.ts L45–117 has no division-capacity check) and test-confirmed (2 ACTIVE entries on capacity=1 division)
- **Mock surface honesty:** `~/services/stripe` mocked (signature bypass + outbound no-ops) and `~/env` mocked to defeat t3-env's value caching; `db` is real, all fixtures are real
- **Scope discipline:** Did not extend into the fix (correctly deferred to SESSION_0085 Petey plan); cancel/refund + UI smoke deferred per WORKFLOW 5.0 max-3-deliverables rule
- **Pattern fidelity:** matches SESSION_0083's mock surface, fixture tagging, two-phase teardown

## Hostile close review

- **Dirstarter alignment:** Test-only addition; no L1 baseline files modified
- **Data integrity:** Test proves a P0 oversubscription bug exists on the paid path. Cannot be marked "data integrity proven" — the opposite. Honest assertion of current state.
- **Security/tenancy:** Real entitlement + brand-membership guards exercised at fixture setup; webhook itself runs without auth (Stripe-signature-validated in prod) — correct.
- **Verification honesty:** "Pass" claim is backed by 5 consecutive successful runs against the real dev DB. The TASK_02 test's PASSING means the bug is reproducible — explicitly named in the test description. Once SESSION_0085 fix lands, the test must flip and the post-fix run is the new ground truth.
- **Scope discipline:** Did not edit `route.ts` or `register.ts`; the session intentionally produced a test, not a fix.

## ADR / ubiquitous-language check

No ADRs needed for this session — no architectural decision was made (only a finding documented). SESSION_0085 Petey plan will likely produce one (capacity-enforcement strategy: webhook re-check vs. up-front reservation).

No new domain terms introduced.

## Reflections

**Surprises:**

- **t3-env caches resolved values.** The `env` Proxy reads from `process.env` lazily, but once the Zod schema produces a value (including `undefined` from an empty string with `emptyStringAsUndefined: true`), it stays. Setting `process.env.STRIPE_WEBHOOK_SECRET` *after* the module loaded had zero effect. Confirmed via direct repro: `import("./env")` → access → mutate `process.env` → re-access → still `undefined`. The fix is a `mock.module("~/env", ...)` Proxy that delegates everything else to `process.env` so we don't have to stub every transitive env access.
- **`docs/graphify-out/` poisons wiki-lint.** Running `graphify update docs/` writes the GRAPH_REPORT.md inside `docs/`, where wiki-lint scans it and trips on auto-generated cross-references to non-wiki files. Pre-existing graphify runs were from repo root (output at `graphify-out/` next to `docs/`), so they didn't appear in lint scope. Going forward, run from repo root unless lint excludes `docs/graphify-out/`.
- **Sequential webhooks were enough.** Initially I considered building a parallel-race test mirroring SESSION_0083's `Promise.all` pattern. Reading the webhook code carefully showed each call is independent — different `userId` means no contention on the existing-Registration check. Sequential proves the defect more cleanly; parallel only adds noise.

**Things that almost broke (and what saved them):**

- **Implicit assumption that `bun test` would inherit `.env`.** It does — for `DATABASE_URL`. But the empty Stripe secrets meant the value reached t3-env and got dropped to `undefined`. Without the `~/env` mock, the test would have been chasing a 400-only-in-tests bug.
- **Could have written the test as a "TODO — flip when fixed"**, leaving an `it.skip()` placeholder. That's worse: it ships a test that doesn't run, and SESSION_0085 has no proof to verify the fix against. Writing the asserting-the-bug test means SESSION_0085 immediately gets a red signal once the fix lands (test fails because behavior changed) — far better failure mode.
- **Almost left the `console.log` diagnostic in the final test.** Caught at close.

**Patterns to reuse:**

- **Mock `~/env` with a Proxy delegating to `process.env`** — saved as feedback memory. This pattern works for any test that needs to override env values t3-env would otherwise cache.
- **Webhook test harness shape:** `mock.module("~/services/stripe", ...)` for SDK + signature bypass; helpers to synthesize Stripe payloads (`makeTournamentRegistrationCheckoutSession`, `makeCheckoutSessionCompletedEvent`); `postWebhook(event)` to drive the real `POST` handler with a synthesized `Request`. Generalizes to any other webhook the route handles (program enrollment, subscription deletion, premium tool fulfillment).
- **Document-the-bug-then-flip-it test pattern.** When a session uncovers a defect but doesn't fix it, ship a passing test that asserts the broken behavior with a comment naming the assertion to flip on fix. SESSION_0085 inherits an immediate red→green proof harness.

**What I'd tell myself starting over:**

- **Audit env-access in the route module path BEFORE writing the test.** I would have caught the t3-env caching issue at pre-flight if I'd traced `env.STRIPE_WEBHOOK_SECRET` from the route to env.ts to the actual `.env` content (`STRIPE_WEBHOOK_SECRET=""`). Three minutes of code-reading would have saved a debug loop.
- **Run graphify from repo root by default**, not from `docs/`. If you specifically want a doc-graph, redirect output via flag (or delete the artifact at close). The rule: anything that lands inside `docs/` shows up in wiki-lint.

**Graphify takeaway:** The `graphify update docs/` enrichment ran cleanly (3088 nodes / 2952 edges / 274 communities) but produced no high-leverage discovery for this session — code-reading the webhook + register paths gave the entire signal in <5 minutes. Graphify pays off when the search surface is wide and unfamiliar; for a known 300-line file, raw read still wins. The query did confirm there were no existing webhook tests, which framed the harness as greenfield — modest value.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0084.md frontmatter present (title, slug, type=session, status=closed-full, created/updated 2026-05-06, last_agent=claude-session-0084, sprint=S3, pairs_with SESSION_0083, backlinks wiki/index). Test file is code (no JETTY frontmatter expected). project-log.md edited but not a JETTY-frontmatter doc. |
| Backlinks/index sweep | No new wiki pages created. No `pairs_with`/`backlinks` updates required on existing pages. `wiki/index.md` not affected. |
| Wiki lint | `bun run wiki:lint` → 0 errors, 3 warnings (orphans: `topic-index.md`, `concepts/tournament-ops.md`, `dirstarter-uplift-backlog.md`) — all **pre-existing**, unchanged from SESSION_0083. The 4 broken-link errors introduced by `docs/graphify-out/GRAPH_REPORT.md` were resolved by deleting the directory before close (graphify-out is a navigation artifact, not authored wiki). |
| Kaizen reflection | Reflections section present above (surprises, near-misses, patterns, retrospective notes). |
| Hostile close review | `SESSION_0084_REVIEW_01` appended to `docs/protocols/project-log.md` covering all 3 tasks; one P0 (paid-path oversubscription) explicitly handed to SESSION_0085. |
| Review & Recommend | Next session goal written: Petey plan + fix for the paid-path oversubscription. 5 suggested tasks queued in `Next session` block. |
| Memory sweep | Updated project memory: `project_paid_registration_oversubscription_window` now reflects "confirmed via TASK_02 webhook test, 2 ACTIVE entries on capacity=1 division" (was: "unproven"). New feedback memory: t3-env caches resolved env values; mock `~/env` with a Proxy that delegates to `process.env` and stubs only the keys you need to override. |
| Next session unblock check | Unblocked. First task (Petey plan) requires no user input; the test, the webhook code, and the architectural question are all in-repo. |
| Git hygiene | Branch `main`, working tree before close: 1 modified (`docs/protocols/project-log.md`), 2 untracked (`apps/web/app/api/stripe/webhooks/route.test.ts`, `docs/sprints/SESSION_0084.md`). Commit deferred to user authorization (per session protocol — push not authorized). |
