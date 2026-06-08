---
title: Test Fail Fix Ledger
slug: test-fail-fix-ledger
type: reference
status: active
created: 2026-06-04
updated: 2026-06-04
last_agent: codex-session-0343
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

None. TFF-001..005 are resolved — see below.

## Resolved Clusters

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
