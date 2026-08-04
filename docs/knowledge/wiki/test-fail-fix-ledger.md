---
title: Test Fail Fix Ledger
slug: test-fail-fix-ledger
type: reference
status: active
created: 2026-06-04
updated: 2026-08-04
last_agent: claude-fable-session-0745
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

### TFF-013 — lineage cross-suite P2002/P2034 pair: find-then-create race + Serializable SSI aborts

- **Status:** `fixed` (SESSION_0748, PR #425 — test-only; applied SESSION_0745 AM sweep).
- **What broke (SESSION_0725 pair, full-suite only):** (a) `reconcile-pending-claims.test.ts` P2002 —
  find-then-create on the shared `{BBL, LINEAGE_PREMIUM/ELITE}` entitlement **definitions** raced a
  sibling file creating the same `brand_key`, and its afterAll deleted the shared rows out from under
  later files; (b) `lineage-member-placement.test.ts` P2034 — `applyLineageMemberPlacementUpdate` runs a
  Serializable tx; cross-file SSI aborts surfaced as victim-side P2034.
- **Fix:** (a) atomic flat `upsert` on `brand_key` (Prisma native `INSERT … ON CONFLICT`, mirrors
  `e2e/helpers/seed-lineage-lifecycle-db.ts:54-76`) and **definitions kept** — no afterAll delete of
  shared rows; (b) bounded ×3 **P2034-only** victim-side retry
  (`lineage-member-placement.test.ts:42-57` — rethrows any other code, warns loudly; 0 retries fired in
  3× proof runs = dormant guards); (c) run-scoped `shortCode()` in `fixture-ownership.ts:43-56` kills the
  time-invariant Discipline-code truncation (the TFF-010 class). No assertion weakened (AM Doug audit:
  every `expect` byte-identical to main).
- **Reusable patterns:** find-then-create on a shared unique key is a cross-suite race — **upsert it**;
  a Serializable-tx call in a test needs a **bounded P2034-only retry** on a shared DB; shared
  entitlement **definitions are never deleted** by a test's cleanup.
- **Follow-ups routed:** `editor-actions.test.ts:788` same-bug `shortCode()` move (see TFF-010
  recurrence); `sweepStaleLifecycleRows` in `seed-lineage-lifecycle-db.ts` not run-scoped — cross-lane
  live-fixture deletion hazard (MEMBER_NOT_FOUND signature, distinct from P2034), flagged-only.
- **Closes:** issue #378.

### TFF-014 — pre-commit-format-guard harness hangs at its 30s ceiling (environmental, machine-state)

- **Status:** `open` (environmental — machine-state class, NOT a code defect; first sighting
  SESSION_0745 AM sweep, Doug verification of PR #425).
- **What broke:** `apps/web/scripts/pre-commit-format-guard.test.ts:20` ("defeats partial staging
  without mutating the index or worktree") timed out at 30000ms during a local full-suite run
  (1971 pass / 1 fail / 247 files), `error: pre-commit integration harness failed`, 1 dangling process.
- **Disambiguation chain (reusable recipe):** (a) structurally unreachable from the reviewed diff
  (git-hook harness, no shared code); (b) reproduces in isolation (30.06s); (c) hung subprocess via `ps`
  = `oxfmt` on the harness's deliberate spaced-filename fixture (`member ranks.ts`,
  `pre-commit.test.sh:126-128`); (d) `oxfmt` on the same spaced file directly = 33ms OK — filename not
  the trigger; (e) **decisive:** the identical harness hangs ≥25s run from the untouched canonical
  `main` checkout, while CI `Unit tests (bun test)` at the same head SHA is green → environmental.
- **Machine-state suspects at capture:** a stale `oxfmt --lsp` from the canonical checkout running
  since 2026-08-01 (PID 94233); sandboxed review shell as a second variable.
- **Fix direction:** kill the stale `oxfmt --lsp` and re-run the harness in a clean shell; if it still
  hangs, instrument `pre-commit.test.sh` with a per-step timeout to pin which step wedges. CI remains
  the authoritative gate for this file until closed.

### TFF-015 — schedule safe-action hook timeout under full-suite load (environmental/load class)

- **Status:** `open` (first sighting SESSION_0745 merged-tree rerun; environmental/load class,
  machine-state sibling of TFF-014).
- **What broke:** `server/web/schedule/actions.safe-action.test.ts` — an "(unnamed)" fail at 5011ms,
  "a beforeEach/afterEach hook timed out for this test", under the full `bun run test` suite
  (run 2: 1968 pass / 2 fail — the other fail was TFF-014). **Passes isolated 3/3 in 2.5s.**
- **Context:** two consecutive uncontended merged-tree runs produced SHIFTING failure sets
  (run 1: 7 fail + 1 error, 1922 ran — failing names lost to a `| tail` capture miss, the PL-010
  trap, recorded honestly; run 2: 2 fail, 1970 ran). CI green at every merged PR head + main tip
  `7ccf9392` (CI + Playwright success). Same machine-state suspects as TFF-014 (stale `oxfmt --lsp`
  PID 94233 since 2026-08-01).
- **Fix direction:** clear the stale `oxfmt --lsp` / clean-shell rerun; if it recurs cleanly, raise
  or instrument the hook timeout and check schedule-fixture cross-suite contention. CI authoritative
  meanwhile.

### TFF-010 — paywall e2e seed: unique `code` derived by truncating OFF the unique suffix (P2002 under parallel workers)

- **Status:** `fixed` (SESSION_0551).
- **What broke:** first FI-024 round-trip run hit a P2002 on `Discipline @@unique([code, brand])`.
  `apps/web/e2e/helpers/seed-directory-paywall-db.ts` (~lines 30, 136): `makeRunId()` appends a UUID for
  uniqueness, but `code = slugify('dp-' + runId).slice(0, 16)` truncates to exactly `dp-{13-digit-ms}` —
  **dropping the UUID**. Two seeds in the same millisecond (parallel Playwright workers) collide.
- **Repro:** run `e2e/directory/profile-paywall.spec.ts` with >1 worker so two seeds land in the same ms;
  single-worker (`--workers=1`) clears it (how Doug disambiguated the false-red, SESSION_0521).
- **Fix:** `seed-directory-paywall-db.ts` now uses
  `createFixtureRunIdentity(TAG_PREFIX).shortCode("dp")`, preserving the UUID suffix inside the
  16-character `Discipline.code` budget. The entitlement seed also switched to `upsert` so parallel
  workers do not race the shared `{brand,key}` entitlement.
- **Verified:** direct parallel seed proof 2/2 with two simultaneous `seedDirectoryPaywallFixture()` calls
  against `ronindojo_e2e`, plus the full unit gate `bun run test` green in SESSION_0551.
- **Reusable pattern:** a "unique" key derived from a **truncated non-unique prefix** of a unique value is
  a collision class, not uniqueness — check what the `slice()` actually keeps.
- **Recurrence (SESSION_0709, cross-run flavor):** `server/web/lineage/node-profile-actions.test.ts:110`
  — `code: tag("DISC").slice(0, 16)` truncates the tag's ms-timestamp to its first 3 digits (stable for
  ~3 years), so the code is **constant across runs of the same file**. Invisible normally (afterAll
  cleanup deletes the row) — but a suite run KILLED mid-file (this session: lane crashes on the shared
  prodsnap DB) strands the row, and every later run of that file P2002s at setup. Fixed-by-cleanup
  (stranded `session-0184-1785005311040-*` fixture rows deleted; file 6/6 green after). The code fix —
  same `createFixtureRunIdentity(...).shortCode()` move as above — **fixed for
  `node-profile-actions.test-fixture.ts` (SESSION_0748, PR #425)**; remaining `slice(0, 16)` site =
  `apps/web/server/web/lineage/editor-actions.test.ts:788` (same-bug follow-up, routed via TFF-013).

### TFF-006 — billing portal/checkout cluster flakes in the full suite *under `--parallel=1`* (105-file scale)

- **Status:** `open` — **not reproduced at 247-file scale (SESSION_0749: 3× consecutive full-suite
  green, 1972 pass / 0 fail each, local prodsnap).** Row facts below are stale: brand is now **BBL**
  (not BASELINE_MARTIAL_ARTS), suite is **247** files (not 105), portal action routes via
  `getStripeClient(Brand.BBL)`. Kept open as a **monitor** (operator call, SESSION_0745): next
  escalation = N≥10 local loop or **CI rerun-until-fail** (both historical reds were CI); prophylactic
  candidate = de-literalize the 3 fixed `cus_test_*` IDs (`actions.test.ts:110`,
  `checkout-actions.test.ts:495,607`) — deliberately NOT applied cold (the reverted-#91 trap below).
  Latent-coupling notes (SESSION_0749 forensics + AM Doug review): the fixed literals coexist with
  globally-unique `stripeCustomerId` (`schema.prisma:1961`) + the webhook test's `cus_test_` prefix
  sweeps (`route.test.ts:414,446,593`) — stranded-row mechanism = the TFF-010 recurrence class; AND an
  env-dependent mock bypass: if `STRIPE_SECRET_KEY_BBL` is ever set in a test/CI env, `stripeBBL`
  becomes a real client and `getStripeClient(Brand.BBL)` (`services/stripe.ts:82-83`) bypasses the
  mocked platform `stripe` key → deterministic breakage or live API calls.
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

- **Status:** `fixed-with-local-browser-waiver` (SESSION_0551).
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
- **Fix:** `expectAnonymousLoginRedirect()` now pre-hits the target route through Playwright's request
  context with `maxRedirects: 0` before the browser `goto`, warming the dynamic edit route before the
  assertion clock starts.
- **Verified:** code path covered by the affected spec setup, but local browser repeat proof was blocked in
  SESSION_0551 by Chromium `SIGTRAP` before assertions and Turbopack `EMFILE` when Playwright tried to
  spawn a second web server. Keep CI Playwright as the final browser proof for this row.
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

### TFF-011 — stripe webhook concurrency test is load-sensitive under the full suite (fixed SESSION_0551)

- **Symptom:** `apps/web/app/api/stripe/webhooks/route.test.ts:1384` (parallel-webhook capacity race) fails
  under a full `bun run test` run (400 vs 200) but passes 10/10 isolated. Observed once in three full-suite
  runs during SESSION_0529 (Doug's first run red; builder's + delta runs green).
- **Diagnosis (probable):** timing/capacity assumption in the parallel-webhook test breaks under suite-wide
  load; not diff-related (SESSION_0529 touched no stripe/webhook code).
- **Fix:** SESSION_0551 kept the duplicate-capacity proof but serialized the two webhook posts, removing the
  suite-wide Postgres scheduling assumption while still asserting one active entry and one refunded loser.
- **Status:** `fixed`.
- **Verified:** `bun run test app/api/stripe/webhooks/route.test.ts` 2/2 isolated, plus full `bun run test`
  green after the change: 1532 pass / 0 fail across 204 web files.

## Relationships

- [SOP — Test Writing Patterns](../../runbooks/sops/sop-test-writing.md) — **§2 (runner) explains most
  full-suite failures; §12 is the test inventory. Read first.**
- [SESSION_0341](../../sprints/_archive/era-b/SESSION_0341.md) — created this ledger from the first 21-failure clustered
  full-suite run (without consulting SOP §2).
- [SESSION_0342](../../sprints/_archive/era-b/SESSION_0342.md) — root-caused and resolved TFF-001..005 (`--parallel=1`).
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
