---
title: Test Fail Fix Ledger
slug: test-fail-fix-ledger
type: reference
status: active
created: 2026-06-04
updated: 2026-07-08
last_agent: claude-session-0511
pairs_with:
  - docs/sprints/SESSION_0341.md
  - docs/sprints/SESSION_0342.md
  - docs/sprints/SESSION_0343.md
  - docs/runbooks/sops/sop-test-writing.md
  - docs/knowledge/wiki/wiring-ledger.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md
---

# Test Fail Fix Ledger

## Summary

Canonical pointer ledger for expensive or recurring test failures. Use this when the full suite is red and
the failure output is too large to rediscover each bow-in. Keep entries clustered by likely shared cause,
not one row per assertion.

This ledger complements the [Wiring Ledger](wiring-ledger.md):

- `wiring-ledger.md` tracks product wiring, handroll slips, and incomplete plumbing.
- `test-fail-fix-ledger.md` tracks failing test clusters, smallest useful reproduction commands, and fix
  status.

> **Read this first when the suite is red:** the runner mechanics that explain most full-suite failures
> (mock-module leakage vs. Postgres over-subscription) live in
> [`sop-test-writing.md`](../../runbooks/sops/sop-test-writing.md) **§2 (runner)** and the test catalog in
> **§12 (inventory)**. SESSION_0341 clustered 21 failures here *without* consulting §2 and re-derived the
> runner behavior from scratch; SESSION_0342 found the answer was already documented. Start from §2.

## How To Use

- Add a stable ID (`TFF-001`, `TFF-002`, ...).
- Record the last observed run and exact failing count.
- Prefer one focused command that reproduces the cluster.
- Link the fixing session or commit when resolved.
- Keep status terse: `open`, `investigating`, `fixed`, `accepted-risk`.

Single-file reproduction needs no `--parallel` (a lone file is already isolated):

```bash
cd apps/web && bun test <test-file>
```

Full-suite gate is `bun run test` (= `bun test --parallel=1 --path-ignore-patterns='e2e/**'`). Do **not**
reproduce a full-suite cluster with bare `bun test` (mock leak) or unbounded `--parallel` (over-subscription)
— see `sop-test-writing.md` §2.

## Active Clusters

### TFF-006 — billing portal/checkout cluster flakes in the full suite *under `--parallel=1`* (105-file scale)

- **Status:** `open` (needs local repro — see below).
- **Last observed:** 2026-06-17. PR #89 CI (`bun run test`, `--parallel=1`) — `1 fail / 620 pass`:
  `createBillingPortalSession - safe-action wrapper > redirects to a Stripe Customer Portal session`.
  The **sibling** cluster (`createProgramEnrollmentCheckout`, `createLineageMembershipCheckout` in
  `checkout-actions.test.ts`, plus `createBillingPortalSession` in `actions.test.ts`) is the same family.
- **Intermittent, not deterministic:** PR #90 CI ran the identical suite **green**; PR #89 and the (now
  closed) PR #91 ran it **red**. Single-file runs pass:
  `cd apps/web && bun test server/web/billing/actions.safe-action.test.ts`.
- **What it is NOT:** *not* a cross-file `mock.module` clobber. Per
  [`sop-test-writing.md`](../../runbooks/sops/sop-test-writing.md) **§2**, `--parallel=1` uses bun's
  isolate path with **per-file module isolation**, so the three billing test files do **not** clobber each
  other's `next/navigation`/`~/services/stripe` mocks. PR #91 tried two structural mock fixes on that wrong
  premise; the second (a shared mock installed via import side-effect) **violated §3** ("install mocks via a
  call *before* the action import"), bound the action to the *real* `redirect`/`stripe`, and turned 1
  failure into 7. **#91 was reverted and closed — do not retry a mock-isolation fix.**
- **Likely cause:** the **shared-`brand` `StripeCustomer` contention** SOP §2 already flags for
  `createProgramEnrollmentCheckout` (it flaked ~1/3 under `--parallel=2`), now surfacing **even under
  `--parallel=1`** as the suite grew 75 → 105 files. All billing tests use `brand = "BASELINE_MARTIAL_ARTS"`
  and create/delete `StripeCustomer` rows; a cross-file ordering/leftover-state interaction is the prime
  suspect. The TFF-001..005 `--parallel=1` fix (proven green at 75 files) no longer fully holds for this
  cluster at 105 files.
- **Repro (needs local Postgres — not available in the cloud sandbox):**

  ```bash
  cd apps/web && for i in 1 2 3 4 5; do bun run test 2>&1 | grep -E "fail\)|fail$"; done
  ```

  The CI summary does **not** print which assertion fails (`serverError` vs empty `redirectState.url`) —
  the local run's full output is needed to pinpoint it before fixing.
- **Fix direction (for the local session):** scope each billing test's `StripeCustomer` lookup/cleanup to
  its own `{userId, brand}` (or give each billing test file a unique brand/customer) so suite ordering can't
  leak state between them. Validate by reproducing red locally, applying the fix, then `bun run test` green
  several times consecutively (mirroring SESSION_0342's 4× proof). The proper long-term lever SOP §2 names
  is **per-worker DB isolation**.

### TFF-007 — flaky `tools` TIER_TRANSITION audit test: unawaited `after()` deferred write

- **Status:** `fixed` (branch `fix/flaky-tools-after-flush`, post-#170-merge; SESSION_0454 follow-up).
- **Last observed:** 2026-06-27. `cd apps/web && bun run test server/admin/tools` in isolation →
  `1 pass / 2 fail`: `admin tool actions > writes a TIER_TRANSITION audit row when an admin changes
  listing tier` + an `(unnamed)` teardown failure. Surfaced reviewing PR #170 (WL-P2-17) against a
  persistent local `prodsnap` DB; **passes on CI's fresh seeded DB** (so #170 CI stayed green).
- **Root cause (NOT pollution / FK-order — those red herrings were ruled out):** `upsertTool` writes
  the audit inside `after()` (Next.js post-response hook). The `next/server` `after` mock in
  `lib/test/safe-action-env.ts` was **fire-and-forget** (`void Promise.resolve().then(() => fn())`), so
  the deferred async `db.auditLog.create` was never awaited. The test's `setTimeout(0)` raced it →
  `findFirst` returned `null` (`Expected {tier:Free}` vs `Received undefined`), and the late write
  raced teardown → `delete User violates AuditLog_userId_fkey`. The test already used unique per-run
  ids + FK-ordered teardown, so the "fixed-id pollution" hypothesis was wrong.
- **Fix:** made `after()` flushable — the mock now also tracks each callback's promise, and
  `installSafeActionMocks` returns `flushAfter()`; the test awaits `env.flushAfter()` in place of
  `setTimeout(0)`. Additive (callbacks still auto-run → the other safe-action tests are unaffected).
- **Verified:** typecheck 0; tools test `2/0` twice in isolation; full `bun run test server/admin`
  `118/0`; oxlint/oxfmt clean.
- **Reusable pattern:** any test asserting on `after()`-deferred work should `await env.flushAfter()`,
  not a `setTimeout` hack. Relates to FS-0027 / SOP §3.

### TFF-008 — `e2e/lineage/authenticated-lifecycle.spec.ts:88` flakes on a hammered/cold dev server (JIT-compile timing)

- **Status:** `open` (diagnosed, not code-fixed — env/harness, not a product bug; SESSION_0504).
- **Last observed:** 2026-07-06. During SESSION_0504's close, after 3 agents (Cody build + Doug verify +
  Petey) pounded ONE shared local `:3004` dev server through repeated full-suite runs + 2 system kills/
  restarts, `authenticated-lifecycle:88` ("anonymous claim and edit routes redirect to the real login
  route") failed with a 40s `toHaveURL(/auth/login)` timeout on the **edit route**
  (`/lineage/[slug]/edit/[nodeId]`, the second of its two assertions).
- **Root cause (NOT a regression):** dev-server Turbopack **JIT-compile delay** on the dynamic
  `/lineage/[slug]/edit/[nodeId]` route — the exact failure the spec's own comment documents (timeout was
  bumped 20s→40s at SESSION_0267 for this). Under accumulated server load + a cold route, first-compile
  exceeds even 40s. Proven independent of the session's refactor: (a) the whole-session diff touches ZERO
  auth/edit/middleware files and the edit route imports NONE of the changed files (byte-identical to
  baseline); (b) it passed the full suite 34/34 on a fresh server earlier; (c) **re-ran 5/5 green on a
  fresh unloaded `:3004` server** (first-hand).
- **Fix (recommended, not done — out of SESSION_0504's page-pass scope):** harden the harness — pre-warm
  the `/lineage/[slug]/edit/[nodeId]` route with a fetch before the assertion, and/or raise the timeout
  for that specific redirect, and/or give parallel worktree sessions **separate dev-server ports** so one
  suite doesn't starve another's. Do NOT read a red here as a code regression without a fresh-server re-run.
- **Reusable pattern:** a scary e2e red on a server shared by parallel agents ≠ a regression. Disambiguate
  with (1) a diff + transitive-import check that the changed files don't reach the failing route, and (2) a
  fresh-server isolated re-run. Relates to the shared-DB/one-server parallel-session trap.

### TFF-001..005 — resolved

See below.

## Resolved Clusters

### TFF-009 — two stale e2e left behind by PR #194's UI reframes (resolved SESSION_0511)

- **Status:** `resolved` (both fixed + CI-green before the #194 merge; merged to prod in #194).
- **What broke:** (1) `e2e/lineage/authenticated-lifecycle.spec.ts:362` `expect(updatedState.nodeBio).toBe(updatedBio)` failed on firefox+webkit — bio Slice A folded the bio write onto `Passport.bio` and deleted the `LineageNode.bio` write, so the read-model read a stale column. (2) `e2e/admin/brand-settings.spec.ts` (3 tests) hung to a 24m chromium timeout — the page was reframed `Brand Settings`→`Appearance` (h2), the per-brand `Black Belt Legacy` card collapsed to one `Theme` fieldset, route `/admin`→`/app`, toast `"…settings saved"`→`"Appearance saved"`; the spec still asserted every old string.
- **NOT flakes — real stale tests from intentional UI-contract changes.** #2 was **chromium-only** because firefox/webkit are scoped `testDir: ./e2e/lineage` (the admin suite runs chromium-only) — invisible to 2 of 3 browsers.
- **Fix:** repoint the lineage-lifecycle read-model at `passport.bio` (`nodeBio`→`passportBio`, `37f438ce`); rewrite the 3 brand-settings tests against the new DOM (`abbad2db`, verified locally on an isolated `:3100` server → 3 pass, then chromium CI green).
- **Reusable pattern (→ memory `operating-loop-needs-e2e-for-ui-contracts`):** any UI reframe (renamed heading, moved route, restructured form) MUST run its affected e2e — incl. the **chromium-only admin suite** — before the SHIP/merge verdict. Source review + unit + `next build` + two fresh 9+ hostile reviews all missed both; only CI e2e caught them.

**TFF-001..005 — all one root cause: full-suite runner concurrency, not test logic.** Resolved by
SESSION_0342.

| ID | Cluster | Verdict |
| --- | --- | --- |
| TFF-001 | DB/integration hook timeouts across domains | Concurrency artifact. Postgres over-subscription under the default unbounded `--parallel` (8 workers) at 75-file scale. |
| TFF-002 | Cleanup-after-failed-setup FK / undefined-ID traces | Same. The "errors" were teardown running after a hook timed out mid-setup — no real FK bug. |
| TFF-003 | Dev-login production-mode route timeout | Same. Passes isolated. |
| TFF-004 | Billing drift-audit timeout + "deterministic mismatch" | Same. The mismatch was a timeout-truncated assertion, **not** a real issue-code bug; passes 3 pass / 0 fail isolated. |
| TFF-005 | Lineage server tests timed out | Same DB-lifecycle class. Passes isolated. Lineage logic is sound for PORTMAP-0006. |

**Diagnosis (SESSION_0342):** every representative file passes in its own process
(`bun test <file>` — course-enrollment 10/0, drift-audit 3/0, lineage queries 33/0, dev-login 3/0, stripe
webhooks 10/0, courses-integration 11/0, node-profile-actions 5/0). The failures only appear in the full
suite, and the trigger is the runner config, not the fixtures:

- Bare `bun test` (no `--parallel`) → shared module registry → ~63 `mock.module()` leak failures (`db.x is
  not a function`). Not the gate.
- Unbounded `--parallel` (default 8 workers) → over-subscribes one Postgres.app instance → the 21
  hook-timeout / FK-race failures above.
- `--parallel=2` → ~30s but flakes ~1/3 on `checkout-actions::createProgramEnrollmentCheckout`
  (two concurrent files contend on the shared-`brand` `StripeCustomer` lookup).

**Fix:** `apps/web/package.json` `test` script pinned to `--parallel=1` (per-file isolation + sequential).
Proven green 4× consecutively: **418 pass / 0 fail across 75 files, ~67s**. Mechanics now documented in
[`sop-test-writing.md`](../../runbooks/sops/sop-test-writing.md) §2. Future speed-up path (per-worker DB
isolation) noted there too.

## Relationships

- [SOP — Test Writing Patterns](../../runbooks/sops/sop-test-writing.md) — **§2 (runner) explains most
  full-suite failures; §12 is the test inventory. Read first.**
- [SESSION_0341](../../sprints/SESSION_0341.md) — created this ledger from the first 21-failure clustered
  full-suite run (without consulting SOP §2).
- [SESSION_0342](../../sprints/SESSION_0342.md) — root-caused and resolved TFF-001..005 (`--parallel=1`).
- [Wiring Ledger](wiring-ledger.md) — companion ledger for product wiring and handroll gaps.

## Sources

- SESSION_0341 close verification: `bun run test` from `apps/web` ended with 309 pass, 21 fail, 1 error
  across 75 files in 110.44s.
- SESSION_0342 fix verification: `bun test --parallel=1 --path-ignore-patterns='e2e/**'` ended with
  418 pass / 0 fail across 75 files in ~67s, reproduced green 4× consecutively.

## Open Questions

- ~~Should this ledger become a close-router destination in `docs/rituals/closing.md`?~~ **Yes (decided
  SESSION_0342).** Test-stability findings route here; this ledger should be the canonical pointer the
  next agent reads before re-triaging a red suite.
