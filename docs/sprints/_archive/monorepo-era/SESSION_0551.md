---
title: "SESSION 0551 — Test Infrastructure Hardening"
slug: session-0551
type: session--implement
status: closed
created: 2026-07-16
updated: 2026-07-16
last_agent: codex-session-0551
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0547.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0551 — Test Infrastructure Hardening

## Date

2026-07-16

## Operator

Brian + codex-session-0551

## Goal

Harden test infrastructure for Lane C from SESSION_0547: introduce the G-012 reusable fixture-ownership module, migrate the six copied rollback helpers plus a representative subset of tagged-cleanup tests, and close TFF-008, TFF-010, and TFF-011 without touching the excluded billing lane.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest numbered session read: `docs/sprints/SESSION_0547.md`
- Carryover: SESSION_0547 persisted the fan-out map. Lane C is the test-infrastructure lane: G-012 fixture ownership plus TFF-008/010/011, explicitly excluding TFF-006.

### Branch and worktree

- Branch: `session-0551-test-infra`
- Worktree: `/Users/brianscott/dev/ronin-0551`
- Status at bow-in: clean before creating this SESSION file
- Current HEAD at bow-in: `ae79db18`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma, Better Auth test setup, Playwright e2e |
| Extension or replacement | Extension: add repo-local fixture ownership utilities on top of Prisma/e2e patterns |
| Why justified | DB-backed tests currently duplicate rollback and cleanup ownership patterns, creating flake risk |
| Risk if bypassed | More count leaks, FK-order teardown bugs, and load-sensitive e2e flakes |

Live docs checked during planning: not applicable; test infrastructure only.

### Graphify check

- Graph status: unavailable in fresh worktree; stats at bow-in: 0 nodes, 0 edges, 0 communities, 0 files tracked.
- Queries used:
  - `G-012 fixture ownership rollback tagged cleanup count-neutral TFF-008 TFF-010 TFF-011 e2e flake`
- Files selected from graph: none; Graphify returned no nodes, so direct source inspection was used.
- Verification note: exact files opened after Graphify; Graphify used as navigation, not proof.

### Grill outcome

- Scope locked by operator brief: do not rewrite all DB-backed tests; migrate six rollback copy-sites plus a representative tag-cleanup subset.
- TFF-006 billing flakes are excluded because they collide with live SESSION_0545 billing work.
- Production code remains untouched except for the optional test-env email seam if all required gates are green.

## Petey plan

### Goal

Make DB-backed test ownership reusable and close three named flakes with repeat-run evidence.

### Tasks

#### SESSION_0551_TASK_01 — Bootstrap and session ledger

- **Agent:** Codex/Cody
- **What:** Complete fresh-worktree bootstrap and record the session plan.
- **Steps:** Copy env files, install dependencies, generate Prisma, migrate and seed `ronindojo_e2e`, create this SESSION file.
- **Done means:** Bootstrap commands pass and `SESSION_0551.md` exists with task IDs.
- **Depends on:** nothing

#### SESSION_0551_TASK_02 — G-012 fixture ownership module

- **Agent:** Codex/Cody
- **What:** Add one reusable rollback/tagged-cleanup/run-identity/count-neutral helper module and migrate scoped call-sites.
- **Steps:** Find rollback copies, design minimal API, add FK-safe teardown ordering, migrate six rollback copy-sites and a representative tagged-cleanup subset, document the migration recipe.
- **Done means:** Copied rollback implementations are gone from migrated tests; docs explain how to migrate remaining ad-hoc cleanup tests.
- **Depends on:** SESSION_0551_TASK_01

#### SESSION_0551_TASK_03 — Named flake fixes

- **Agent:** Codex/Cody
- **What:** Fix TFF-008, TFF-010, and TFF-011.
- **Steps:** Add readiness/warm-up to authenticated lifecycle e2e, preserve the paywall seed unique suffix, and bound or serialize the Stripe webhook concurrency test.
- **Done means:** Each affected spec passes repeatedly with the e2e DB.
- **Depends on:** SESSION_0551_TASK_02

#### SESSION_0551_TASK_04 — Verification gates

- **Agent:** Codex/Doug
- **What:** Run required focused, repeat, and full gates.
- **Steps:** Run touched e2e specs repeatedly, then `bun run typecheck`, `bun run test`, `bun run lint:check`, and repo-wide `bun run format:check` if files were added.
- **Done means:** Verification table records pass/fail evidence and repeat-run counts.
- **Depends on:** SESSION_0551_TASK_03

#### SESSION_0551_TASK_05 — Bow-out and local commit

- **Agent:** Codex/Giddy
- **What:** Close the session, route findings, commit locally, and hold at the push gate.
- **Steps:** Fill close sections, skip Graphify refresh because this is a worktree, run FS-0024 guard, commit locally, do not push.
- **Done means:** Local commit SHA recorded; no push/PR/deploy.
- **Depends on:** SESSION_0551_TASK_04

### Parallelism

Single coherent inline lane. The fixture module and flake fixes may touch shared test helpers, so implementation is sequential; verification follows the final diff.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0551_TASK_01 | Codex/Cody | Bootstrap and session setup are direct execution |
| SESSION_0551_TASK_02 | Codex/Cody | Clear build task against existing tests |
| SESSION_0551_TASK_03 | Codex/Cody | Clear flake fixes with named specs |
| SESSION_0551_TASK_04 | Codex/Doug | Verification and repeat-run proof |
| SESSION_0551_TASK_05 | Codex/Giddy | Close, git hygiene, push gate |

### Open decisions

None at plan-lock.

### Risks

- E2E dev server readiness can dominate repeat-run time.
- The main seed is non-idempotent; bootstrap required a guarded `ronindojo_e2e` table teardown before `db:seed`.

### Scope guard

- Do not touch `../ronin-dojo-monorepo`.
- Do not touch TFF-006 or billing checkout/portal tests.
- Do not migrate all DB-backed tests in this lane.
- Do not run `prisma migrate dev`.
- Do not push, open a PR, merge, or deploy.

### Dirstarter implementation template

- **Docs read first:** opening/closing ritual excerpts, WORKFLOW 5.0, agent-systems router.
- **Baseline pattern to extend:** Prisma-backed tests and Playwright e2e setup.
- **Custom delta:** fixture ownership module for Ronin DB-backed tests.
- **No-bypass proof:** no Dirstarter test fixture ownership layer exists to replace.

## Cody pre-flight

### Pre-flight: Test infrastructure hardening

#### 1. Existing component scan

- Graphify query used: `G-012 fixture ownership rollback tagged cleanup count-neutral TFF-008 TFF-010 TFF-011 e2e flake`
- Found: Graphify has no fresh-worktree index; direct source scan follows.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: no
- Consulted live alignment URLs: no
- Closest L1 pattern: Prisma client plus Better Auth/e2e helpers.
- Primitive API spot-check: not applicable.

#### 3. Composition decision

- Extending existing helpers where available; otherwise adding one test-only fixture ownership helper.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes, `docs/sprints/SESSION_0547.md`
- ADR read: none
- Runbook consulted: `docs/rituals/opening.md`, `docs/rituals/closing.md`

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo` / repo e2e runner
- Working directory: `/Users/brianscott/dev/ronin-0551`
- Brand/host for testing: local e2e app host

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0031 acknowledged from opening/closing ritual.
- Mitigation acknowledged: e2e setup is migrate-only; seed was run separately against guarded `ronindojo_e2e`.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0551_TASK_01 | landed | Bootstrap completed; e2e DB migrated and seeded after guarded local table teardown. |
| SESSION_0551_TASK_02 | landed | Added one fixture-ownership module and migrated all six rollback copy-sites plus representative e2e seed cleanups. |
| SESSION_0551_TASK_03 | landed | Fixed TFF-010 and TFF-011; landed the TFF-008 route warm-up harness change. |
| SESSION_0551_TASK_04 | landed-with-waiver | Unit/type/lint/format gates run; local browser repeat proof blocked by Chromium `SIGTRAP` before assertions. |
| SESSION_0551_TASK_05 | landed | Session closed, findings routed, local commit made, push held for explicit authorization. |

## What landed

- `apps/web/lib/test/fixture-ownership.ts` centralizes DB-backed test ownership:
  - rollback adapter: `inRolledBackTx(body)`
  - run identity: `createFixtureRunIdentity(prefix)`
  - FK-safe cleanup: `cleanupOwnedTestRows(db, ownership)`
  - tagged lineage stale sweep: `cleanupTaggedLineageFixtures(db, tag)`
  - count-neutral proof: `readFixtureCounts(db, counters)` and `expectCountNeutral(counters, body)`
- The six copied `inRolledBackTx` implementations were removed and replaced with the shared helper.
- Representative tagged/exact cleanup migrations landed in the directory paywall and authenticated lineage e2e seed helpers.
- TFF-010 fixed by preserving the unique suffix inside bounded `Discipline.code` values and making the shared entitlement seed an `upsert`.
- TFF-011 fixed by serializing the duplicate-capacity webhook posts while keeping the assertion that one entry wins and one is refunded.
- TFF-008 warm-up landed by pre-hitting the unauth route through Playwright request context before the browser redirect assertion.
- Stretch landed: `sendEmail` now refuses real Resend sends in `NODE_ENV=test` unless the Resend sender is explicitly mocked by the test.
- Migration recipe added at `docs/runbooks/sops/test-fixture-ownership.md`.

## Decisions resolved

- G-012 should migrate remaining ad-hoc DB cleanup tests in small batches, not as a single 71-test rewrite.
- The paywall seed's unique bounded code should be derived from the UUID suffix, not from the timestamp prefix.
- The webhook capacity test should be deterministic under full-suite load; a serialized duplicate-webhook proof is sufficient for the behavior under test.
- The email seam should allow explicit mocks to exercise email rendering while blocking accidental live Resend sends in unit tests.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/lib/test/fixture-ownership.ts` | New DB-backed test ownership module. |
| `apps/web/server/admin/claims/promotion-claim-resource.test.ts` | Migrated local rollback helper to shared `inRolledBackTx`. |
| `apps/web/server/admin/lineage/claim-finalize.test.ts` | Migrated local rollback helper to shared `inRolledBackTx`. |
| `apps/web/server/admin/lineage/finalize-rank-promotion.test.ts` | Migrated local rollback helper to shared `inRolledBackTx`. |
| `apps/web/server/admin/lineage/place-lead-core.test.ts` | Migrated local rollback helper to shared `inRolledBackTx`. |
| `apps/web/server/web/promotion-events/editor-authorization.security.test.ts` | Migrated local rollback helper to shared `inRolledBackTx`. |
| `apps/web/server/web/promotion-events/editor-authorization-equivalence.test.ts` | Migrated local rollback helper to shared `inRolledBackTx`. |
| `apps/web/e2e/helpers/seed-directory-paywall-db.ts` | Migrated to run identity + FK-safe cleanup; fixed bounded unique code and entitlement race. |
| `apps/web/e2e/helpers/seed-lineage-lifecycle-db.ts` | Migrated exact cleanup and stale sweep to shared ownership helpers. |
| `apps/web/e2e/lineage/authenticated-lifecycle.spec.ts` | Added TFF-008 request-context route warm-up before redirect assertion. |
| `apps/web/app/api/stripe/webhooks/route.test.ts` | Serialized TFF-011 duplicate-capacity webhook proof. |
| `apps/web/lib/email.ts` | Added test-env no-live-send guard that preserves explicit Resend mocks. |
| `docs/runbooks/sops/test-fixture-ownership.md` | New migration recipe for remaining DB-backed test cleanup work. |
| `docs/runbooks/README.md` | Indexed the new SOP runbook. |
| `docs/knowledge/wiki/test-fail-fix-ledger.md` | Routed TFF-008/010/011 outcomes. |
| `docs/knowledge/wiki/goals-ledger.md` | Marked G-012 landed and linked the migration recipe. |
| `docs/knowledge/wiki/index.md` | Indexed SESSION_0547, SESSION_0551, and the new runbook. |
| `docs/sprints/SESSION_0551.md` | Session plan, verification, and close evidence. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `TMPDIR=/private/tmp/codex-bun-tmp BUN_INSTALL_CACHE_DIR=/private/tmp/codex-bun-cache command bun install` | Passed |
| `command bunx prisma generate --no-hints` from `apps/web` | Passed |
| `command bun --env-file=.env.e2e run e2e:db:setup` from `apps/web` | Passed; no pending migrations |
| Guarded e2e-only table teardown | Passed; cleared 145 public tables in `ronindojo_e2e` |
| `command bun --env-file=.env.e2e run db:seed` from `apps/web` | Passed |
| `bun run test server/admin/claims/promotion-claim-resource.test.ts server/admin/lineage/claim-finalize.test.ts server/admin/lineage/finalize-rank-promotion.test.ts server/admin/lineage/place-lead-core.test.ts server/web/promotion-events/editor-authorization.security.test.ts server/web/promotion-events/editor-authorization-equivalence.test.ts` | Passed: 70 pass / 0 fail / 216 expects |
| `bun run test app/api/stripe/webhooks/route.test.ts` | Passed 2/2 after serialization: 10 pass / 0 fail / 91 expects |
| Direct parallel `seedDirectoryPaywallFixture()` script against `ronindojo_e2e` | Passed 2/2; two concurrent seeds created distinct bounded codes and cleaned up |
| `bun run test lib/notifications-feedback.test.ts server/web/organization/org-management.safe-action.test.ts` | Passed: 19 pass / 0 fail / 43 expects; mocked Resend still exercised, unmocked sends logged `[email:test:no-send]` |
| `bun run test` | Passed after stretch: ui-kit 30/30; web 1532 pass / 0 fail / 4361 expects across 204 files |
| `bun run --filter @ronin-dojo/web typecheck` | Passed |
| `bun run typecheck` | Failed in unrelated `apps/baseline` package: missing `../.generated/prisma/client`; `@ronin-dojo/web` typecheck passed |
| `bun run lint:check` | Root script missing; package gate used instead |
| `bun run --filter @ronin-dojo/web lint:check` | Passed with existing warnings |
| `bun run format:check` | Root script missing; package gate used instead |
| `bun run --filter @ronin-dojo/web format:check` | Passed |
| Affected Playwright specs against `ronindojo_e2e` | Blocked locally: Playwright web-server spawn hit `EMFILE`, and manual no-webserver Chromium launches exited with `SIGTRAP` before assertions. CI Playwright remains required for browser proof. |
| `bun run --filter @ronin-dojo/web e2e:evidence:check --waiver="..."` | Passed with FS-0031 waiver for the local Chromium `SIGTRAP` / Turbopack `EMFILE` blocker. |
| `bun run wiki:lint` | Passed with 0 errors / 54 warnings; warnings are pre-existing R8 markdown formatting warnings outside touched files. |
| `git diff --check` | Passed |

## Open decisions / blockers

- Push is intentionally held for explicit per-push authorization.
- Local browser e2e repeat proof is blocked by this machine's Chromium `SIGTRAP` / `EMFILE` failure before test assertions. The code changes are covered by unit/full-suite gates and direct e2e seed proof, but CI Playwright should be treated as the final browser proof for TFF-008 and e2e helper changes.
- Root `bun run typecheck` is blocked by unrelated `apps/baseline` generated Prisma client absence. The touched package's typecheck passes.

## Next session

Goal: finish CI/browser validation after push authorization, then migrate the next small batch of ad-hoc DB cleanup tests using `docs/runbooks/sops/test-fixture-ownership.md`.

Inputs to read:

- `docs/runbooks/sops/test-fixture-ownership.md`
- `docs/knowledge/wiki/test-fail-fix-ledger.md`
- `docs/knowledge/wiki/goals-ledger.md` G-012

First task: run CI Playwright on the held branch; if green, choose the next 3-5 ad-hoc cleanup tests and migrate them to fixture ownership.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Updated touched docs/runbooks/ledgers with current `updated`/`last_agent` where needed. |
| Backlinks/index sweep | Added the fixture-ownership runbook to `docs/runbooks/README.md` and `docs/knowledge/wiki/index.md`; added SESSION_0551 index row. |
| Wiki lint | `bun run wiki:lint` passed with 0 errors / 54 pre-existing R8 warnings outside touched files. |
| Kaizen reflection | See Reflections below. |
| Hostile close review | Scope respected: no TFF-006/billing checkout/portal edits; only permitted production touch was the test-env email seam guard. |
| Code-quality gate (Class-A) | No user-facing feature/custom UI surface. |
| Runtime verification (Doug) | Unit/full-suite gates green; FS-0031 evidence guard waived with local Chromium `SIGTRAP` / Turbopack `EMFILE` reason. |
| Review & Recommend | Next session goal written. |
| Memory sweep | G-012 and TFF ledger rows routed; no operator memory update needed. |
| Next session unblock check | Unblocked after push authorization and CI browser proof. |
| Git hygiene | Branch `session-0551-test-infra`; commit local only; no push/PR/deploy. |
| Graphify update | Skipped by operator instruction for this worktree lane; canonical-only refresh. |

## Reflections

- The fixture-ownership module removed real duplication without trying to rewrite every DB-backed test in one pass.
- The e2e helpers need exact ownership first; stale sweeps must be narrow enough not to delete a parallel worker's live rows.
- The unit suite was green before the email seam but still attempted unmocked Resend sends; the seam-level guard is the right blast radius.
- Local browser e2e is still fragile in this worktree setup. The useful evidence from this lane is the deterministic seed proof plus the full unit gate; CI should provide the browser runner proof.
