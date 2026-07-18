---
title: Test Fixture Ownership
slug: test-fixture-ownership
type: runbook
status: active
created: 2026-07-16
updated: 2026-07-16
last_agent: codex-session-0551
pairs_with:
  - docs/runbooks/sops/sop-test-writing.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Test fixture ownership

Use `apps/web/lib/test/fixture-ownership.ts` for DB-backed tests that create rows.

## API

- `inRolledBackTx(body)` — helper-level DB tests where the code accepts a Prisma transaction client.
- `createFixtureRunIdentity(prefix)` — one per fixture seed. Use `runId`, `slug()`, `email()`, and `shortCode()` instead of hand-truncated timestamp strings.
- `cleanupOwnedTestRows(db, ownership)` — FK-safe teardown for exact owned ids plus scoped name/slug contains filters.
- `cleanupTaggedLineageFixtures(db, tag)` — stale-row sweep for lineage e2e helpers that discover rows by tag/prefix.
- `expectCountNeutral(counters, body)` — proof helper for tests that should leave selected table counts unchanged.

## Migration Recipe

1. Prefer rollback when the production helper already accepts `tx`. Replace the copied local `Rollback` class and `inRolledBackTx` with:

   ```ts
   import { inRolledBackTx, type TestTransactionClient } from "~/lib/test/fixture-ownership"

   type Tx = TestTransactionClient
   ```

2. For e2e seed helpers, create a run identity once:

   ```ts
   const identity = createFixtureRunIdentity("session-NNNN-feature-e2e")
   ```

   Use `identity.shortCode("xx")` for bounded unique fields such as `Discipline.code`; do not `slice()` a timestamp prefix that drops the UUID suffix.

3. Return exact ids from seed helpers when possible and clean them with `cleanupOwnedTestRows`.

4. If a helper needs a stale sweep before seeding, discover rows by stable tag and call `cleanupTaggedLineageFixtures`. Keep filters narrow to rows created by that helper.

5. For remaining ad-hoc tag/prefix deletion tests, migrate in small batches. Do not rewrite every DB-backed test in one lane; each migration should run its file and prove no count leak with either rollback or `expectCountNeutral`.
