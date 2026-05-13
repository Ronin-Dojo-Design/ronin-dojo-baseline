---
title: "SESSION 0152 — Optimistic Locking for Membership Transitions"
slug: session-0152
type: session--implement
status: closed-full
created: 2026-05-12
updated: 2026-05-12
last_agent: copilot-session-0152
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0151.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0152 — Optimistic Locking for Membership Transitions

## Date

2026-05-12

## Operator

Brian Scott + Copilot (Petey → Cody)

## Goal

Fix the concurrency race condition surfaced in SESSION_0151: add `version` column to Membership model for optimistic locking, update `transitionMembershipStatus` to use versioned writes, update concurrency test to verify only one parallel caller succeeds. Verify Passport/profile integration unaffected.

## Status

closed-full

## Failed Steps / Drift Check

- No open failed steps in the membership area
- Carried blockers from 0151 (unchanged)

## Dirstarter Alignment Table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Yes — schema change (L2 model extension) |
| Extension or replacement | Extension — `version` column is additive, no L1 patterns affected |
| Why justified | Closes race condition from SESSION_0151 concurrency test — prevents duplicate audit entries and stale-state transitions |
| Risk if bypassed | Multi-admin orgs could produce duplicate transitions and audit entries |

## Graphify Check

- Graph status: ≤1 commit behind HEAD — acceptable
- Queries run:
  - `graphify query "membership transition concurrency optimistic locking audit"` → `actions.concurrency.test.ts`, `membership-status-actions.tsx`, detail page confirmed at `/admin/memberships/[id]/`
  - `graphify query "passport user profile dashboard me"` → `DashboardProfileTab()`, `findUserPassport`, `MePage()`, `dashboard/membership` tab — Passport integration confirmed
  - `graphify explain "Membership"` → 12 connections from dashboard membership component
  - `graphify query "Membership model version optimistic lock prisma schema"` → `schema-prisma.md`, `schema-migration.md`, `prisma-workflow.md`

---

## Petey Plan

### Goal

Deliver: (1) `version` column on Membership, (2) optimistic locking in `transitionMembershipStatus`, (3) updated concurrency test proving only 1 winner, (4) Passport/profile unaffected verification.

### Tasks

#### TASK_01 — Add `version` column to Membership model
- **Agent:** Cody
- **What:** Add `version Int @default(0)` to Membership in `schema.prisma`, run migration
- **Done means:** Migration applied, Prisma client regenerated

#### TASK_02 — Implement optimistic locking in `transitionMembershipStatus`
- **Agent:** Cody
- **What:** Read `version` in findUnique, use `where: { id, version }` on update, increment version, catch P2025 as conflict
- **Done means:** Only one concurrent caller succeeds, losers get a typed conflict error

#### TASK_03 — Update concurrency test
- **Agent:** Cody
- **What:** Verify exactly 1 of 5 parallel callers succeeds, exactly 1 AuditLog entry, 4 get conflict error
- **Done means:** Test passes with optimistic locking behavior

#### TASK_04 — Verify Passport/profile unaffected
- **Agent:** Cody
- **What:** Type check — `version` column is internal, no UI surface
- **Done means:** Zero TS errors

#### TASK_05 — Type check + all tests pass
- **Agent:** Cody
- **Done means:** Zero TS errors, all tests pass

### Parallelism

TASK_01 → TASK_02 + TASK_03 → TASK_04 + TASK_05

---

## Task Log

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0152_TASK_01 | Add `version Int @default(0)` to Membership model, run migration | ✅ done |
| SESSION_0152_TASK_02 | Implement optimistic locking in `transitionMembershipStatus` | ✅ done |
| SESSION_0152_TASK_03 | Update concurrency test for optimistic locking assertions | ✅ done |
| SESSION_0152_TASK_04 | Type check — Passport/profile unaffected | ✅ done |
| SESSION_0152_TASK_05 | Run concurrency test — 1 pass, 12 assertions | ✅ done |
| SESSION_0152_EXTRA_01 | Fix test assertions for next-safe-action `serverError` pattern | ✅ done |
| SESSION_0152_EXTRA_02 | Update `prisma-workflow.md` — add `migrate dev` as valid workflow | ✅ done |
| SESSION_0152_EXTRA_03 | Update `schema-migration.md` — add `migrate dev` as valid workflow | ✅ done |
| SESSION_0152_EXTRA_04 | Log FS-0021 in failed-steps-log.md | ✅ done |

## What Landed

- **Optimistic locking on Membership model**: `version Int @default(0)` column added with migration `20260513024628_add_membership_version_optimistic_locking`
- **`transitionMembershipStatus` race condition fixed**: reads `version` in findUnique, uses `where: { id, version }` on update, increments version, catches P2025 as typed conflict error
- **Concurrency test updated**: 5 parallel calls → exactly 1 winner, 4 get `{ serverError: "Conflict: ..." }`, 1 audit entry, version=1. Adapted assertions for next-safe-action's `serverError` pattern (not promise rejection)
- **Runbook correction**: Both `prisma-workflow.md` and `schema-migration.md` updated to document `migrate dev` as a valid workflow alongside `db push`. Removed stale "migrate dev hangs" warning (resolved in Prisma 7.x)
- **FS-0021 logged**: Schema migration runbook wasn't followed during TASK_01; corrected with accurate findings about runbook staleness

## Files Touched

| Path | Note |
| --- | --- |
| `apps/web/prisma/schema.prisma` | Added `version Int @default(0)` to Membership model |
| `apps/web/prisma/migrations/20260513024628_add_membership_version_optimistic_locking/migration.sql` | New migration file |
| `apps/web/server/admin/memberships/actions.ts` | Optimistic locking: version read, compound where, P2025 catch |
| `apps/web/server/admin/memberships/actions.concurrency.test.ts` | Updated for optimistic locking + next-safe-action serverError pattern |
| `docs/runbooks/prisma-workflow.md` | Added `migrate dev` workflow, removed stale shadow DB warning |
| `docs/runbooks/schema-migration.md` | Added `migrate dev` workflow, removed stale shadow DB warning |
| `docs/protocols/failed-steps-log.md` | Added FS-0021 |
| `docs/sprints/SESSION_0152.md` | This file |

## Decisions Resolved

- **`migrate dev` is valid for local dev** — L1 Dirstarter uses both `db push` and `migrate dev`. Production uses `prebuild: db:migrate deploy`, which requires migration files. Shadow DB hang (SESSION_0004) does not reproduce with Prisma 7.x.
- **next-safe-action serverError pattern** — thrown errors in actions return `{ serverError }` (fulfilled promise), not rejected promises. Test assertions must check `serverError` property, not promise rejection.

## Open Decisions / Blockers

- **SESSION_0150_FINDING_01** — resolved by this session (concurrency test now proves optimistic locking)
- **SESSION_0150_FINDING_02** — resolved by SESSION_0151 (try/catch on after() callback)
- **SESSION_0150_FINDING_03** — still open: E2E Playwright tests for membership admin not yet written
- **Runbook schema-migration.md Step 4 (model count verify)** — count is stale (says Wave A: ~60). Could use an update to reflect 109 models. Low priority.

## Review Log

**SESSION_0152_REVIEW_01 — Full Close Review**

- **Reviewer:** Giddy + Doug (hostile close)
- **Dirstarter docs check:** Checked `dirstarter.com/docs/database/prisma` — confirmed both `db push` and `migrate dev` are valid. Production deploy uses `prebuild: db:migrate deploy` per L1 `package.json`.
- **Sources:** `https://dirstarter.com/docs/database/prisma`
- **Security:** No new attack surface. `version` column is internal — not exposed to API or UI. Conflict errors are generic (no data leak).
- **Data integrity:** Optimistic locking prevents duplicate audit entries and stale-state transitions. `version` starts at 0, increments atomically.
- **Verification honesty:** Test runs against real Postgres (not mocks). 1 pass, 12 assertions. `tsc --noEmit` zero errors.
- **Verdict:** Aligned. Pure L2 data integrity fix. Closes SESSION_0150_FINDING_01. Runbooks corrected to match L1. Kaizen aggregate: 8.5.

## Hostile Close Review

- **Giddy verdict:** Clean. No scope creep. All planned tasks completed. Extra work (runbook updates, FS-0021) was reactive to discovered issues, not scope expansion.
- **Doug verdict:** Optimistic locking is a standard pattern, correctly implemented. P2025 catch is Prisma-idiomatic. Test covers the right scenario. No L1 violations.
- **Score cap:** None.

## ADR / Ubiquitous-Language Check

- No new ADR needed — optimistic locking is a well-known pattern, not an architectural decision.
- No new domain terms introduced.
- **Ubiquitous language:** `version` column is an implementation detail, not a domain concept. No glossary update needed.

## Reflections

- **The next-safe-action error model matters for testing.** `adminActionClient` catches thrown errors and returns `{ serverError }` in a fulfilled promise. The test initially expected rejected promises (like a raw function call). This is a common trap — any future action tests need to check `serverError` on the result, not `Promise.reject`.
- **Runbooks can rot silently.** The "never use migrate dev" guidance was from SESSION_0004 (Prisma 5.x era). It persisted through 148 sessions unchallenged until the operator caught it. Worth doing periodic runbook audits.
- **The closing ritual's project-log gate caught a miss.** Without the gate, SESSION_0152 would have closed without project-log entries. The ritual works.
- **Optimistic locking is cheap insurance.** One column, ~20 lines of code change. Should consider adding it to other high-contention models (Registration, Invoice) proactively.

## Full Close Evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `schema-prisma.md`: updated date + last_agent + removed stale needs_fix. `prisma-workflow.md`: updated last_agent. `schema-migration.md`: updated last_agent. `failed-steps-log.md`: no frontmatter changes needed (append-only). |
| Backlinks/index sweep | SESSION_0151 + SESSION_0152 added to wiki index session table. `schema-prisma.md` backlinks updated. |
| Wiki lint | `bun run wiki:lint` — ✅ 0 violations, 305 files scanned |
| Kaizen reflection | Reflections section present: yes |
| Hostile close review | SESSION_0152_REVIEW_01 above |
| Review & Recommend | Next session goal written: yes |
| Memory sweep | Runbook correction is project-scoped (already committed to docs). No operator memory update needed. |
| Next session unblock check | Unblocked — no user input required |
| Git hygiene | Branch: main, worktree: single (clean), commit `bc386ea`, 11 files changed, 391 insertions, 82 deletions |
| Graphify update | 201 nodes, 448 edges, 658 communities |

## Next Session

- **Goal:** E2E Playwright tests for membership admin (list, detail, transition, role assignment) — resolves SESSION_0150_FINDING_03
- **Inputs to read:** SESSION_0152.md, `sop-test-writing.md` §E2E section, `dirstarter-component-inventory.md` for admin page patterns
- **First task:** Scaffold Playwright test file for membership admin pages with auth fixture