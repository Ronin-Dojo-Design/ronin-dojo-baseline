---
title: Test Fail Fix Ledger
slug: test-fail-fix-ledger
type: reference
status: active
created: 2026-06-04
updated: 2026-06-04
last_agent: codex-session-0341
pairs_with:
  - docs/sprints/SESSION_0341.md
  - docs/knowledge/wiki/wiring-ledger.md
backlinks:
  - docs/knowledge/wiki/index.md
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

## How To Use

- Add a stable ID (`TFF-001`, `TFF-002`, ...).
- Record the last observed run and exact failing count.
- Prefer one focused command that reproduces the cluster.
- Link the fixing session or commit when resolved.
- Keep status terse: `open`, `investigating`, `fixed`, `accepted-risk`.

Focused commands assume this package script shape from `apps/web/package.json`:

```bash
bun test --parallel --path-ignore-patterns='e2e/**' <test-file>
```

## Active Clusters

| ID | Last seen | Cluster | Representative files | Focused command | Suspected root | Status | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TFF-001 | SESSION_0341, `bun run test`: 309 pass / 21 fail / 1 error | DB/integration `beforeEach` / `afterEach` hook timeouts across unrelated domains | `server/web/course-enrollment/actions.safe-action.test.ts`, `server/web/lineage/queries.test.ts`, `server/web/lead/actions.test.ts`, `server/web/attendance/actions.test.ts`, `server/web/organization/org-management.safe-action.test.ts`, `server/web/schedule/materialize.concurrency.test.ts` | `cd apps/web && bun test --parallel --path-ignore-patterns='e2e/**' server/web/course-enrollment/actions.safe-action.test.ts` | Shared DB fixture lifecycle, cleanup ordering, or parallel connection contention. Not caused by SESSION_0341 carousel files. | open | Reproduce one focused timeout, then compare parallel vs isolated behavior and identify shared setup/cleanup helper. |
| TFF-002 | SESSION_0341, `bun run test`: 1 error plus cleanup traces | Fixture cleanup runs after failed setup and dereferences missing IDs or violates FK order | `server/web/course-enrollment/actions.safe-action.test.ts`, `server/web/courses/queries.integration.test.ts`, `server/admin/tools/actions.safe-action.test.ts`, `app/api/stripe/webhooks/route.test.ts` | `cd apps/web && bun test --parallel --path-ignore-patterns='e2e/**' server/web/courses/queries.integration.test.ts` | Cleanup assumes fully-created fixtures; failed setup leaves undefined IDs or still-linked FK rows. | open | Add defensive cleanup only after locating the owning fixture helper; do not mask real setup failure. |
| TFF-003 | SESSION_0341, `bun run test`: production dev-login test timed out | Dev-login production-mode route test timeout | `app/api/auth/dev-login/route.test.ts` | `cd apps/web && bun test --parallel --path-ignore-patterns='e2e/**' app/api/auth/dev-login/route.test.ts` | Unknown; likely environment branch or route setup hang. | open | Reproduce focused, then inspect env mocking and route handler import side effects. |
| TFF-004 | SESSION_0341, `bun run test`: billing audit timeout + deterministic expectation mismatch | Billing drift audit both times out and reports an expectation mismatch in deterministic issue codes | `server/web/billing/drift-audit.test.ts` | `cd apps/web && bun test --parallel --path-ignore-patterns='e2e/**' server/web/billing/drift-audit.test.ts` | Mix of DB fixture slowness plus possible changed issue-code ordering/fixture data. | open | Separate timeout from expectation by running the file focused, then isolate the deterministic code assertion. |
| TFF-005 | SESSION_0341, `bun run test`: lineage server tests timed out | Lineage server tests timed out outside the touched UI components | `server/web/lineage/node-profile-actions.test.ts`, `server/web/lineage/queries.test.ts`, `server/admin/lineage/claim-review-actions.test.ts` | `cd apps/web && bun test --parallel --path-ignore-patterns='e2e/**' server/web/lineage/queries.test.ts` | Likely same DB lifecycle class as TFF-001, but tracked separately because Slice 5 will touch lineage behavior. | open | Reproduce before PORTMAP-0006 so new connector work is not evaluated against an ambiguous lineage test baseline. |

## Resolved Clusters

None yet.

## Relationships

- [SESSION_0341](../../sprints/SESSION_0341.md) — created this ledger from the first 21-failure clustered
  full-suite run.
- [Wiring Ledger](wiring-ledger.md) — companion ledger for product wiring and handroll gaps.
- [SOP — Test Writing Patterns](../../runbooks/sops/sop-test-writing.md) — test-authoring guidance.

## Sources

- SESSION_0341 close verification: `bun run test` from `apps/web` ended with 309 pass, 21 fail, 1 error
  across 75 files in 110.44s.

## Open Questions

- Should this ledger become a close-router destination in `docs/rituals/closing.md`, or stay a lightweight
  wiki reference until it proves useful?
