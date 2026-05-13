---
title: "SESSION 0154 — P2028 Transaction Fix + Registration Optimistic Locking"
slug: session-0154
type: session--implement
status: closed-full
created: 2026-05-13
updated: 2026-05-13
last_agent: copilot-session-0154
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0153.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0154 — P2028 Transaction Fix + Registration Optimistic Locking

## Date

2026-05-13

## Operator

Brian Scott + Copilot (Petey → Cody)

## Goal

1. Fix P2028 transaction timeout in `findMemberships` query — replace `$transaction` with `Promise.all` for read-only list+count pattern.
2. Add optimistic locking (`version` column) to Registration model, matching the Membership pattern from SESSION_0152.

## Failed Steps / Drift Check

- No open failed steps in the membership or registration area
- No relevant drift entries

## Dirstarter Alignment Table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Yes — query pattern change in memberships, schema addition |
| Extension or replacement | Extension — Dirstarter uses `$transaction` for list+count but provides no timeout. We replace with `Promise.all` (safe for read-only). Schema adds `version` column (same pattern as Membership from SESSION_0152). |
| Why justified | P2028 timeout blocks dev workflow on cold starts. Registration is high-contention (multiple users registering simultaneously for tournaments) — optimistic locking prevents silent overwrites. |
| Risk if bypassed | P2028 continues to intermittently block membership admin page loads in dev. Registration race conditions could silently corrupt data. |

## Graphify Check

- Graph status: ≤1 commit behind HEAD — acceptable (updated end of SESSION_0153)
- Skip update — will update after git commit at session close

---

## Petey Plan

### Goal

Two independent improvements: (1) eliminate P2028 transaction timeouts in membership admin queries, (2) add optimistic locking to Registration model.

### Why this task now

P2028 has been noted as a pre-existing issue across SESSION_0151–0153. Registration optimistic locking was recommended in SESSION_0152 reflections after Membership optimistic locking proved to be cheap insurance (~20 lines).

### Investigation Summary

All ~20 Dirstarter admin query files use `db.$transaction([findMany, count])` with no custom timeout (default 5s). For **read-only** list+count queries, `$transaction` provides snapshot isolation but isn't necessary — both queries read the same `where` clause and minor count drift between the two is acceptable for admin pagination. `Promise.all` eliminates the transaction overhead and the timeout risk entirely.

**Decision:** Replace `$transaction` with `Promise.all` in `findMemberships` only. Don't change other Dirstarter queries — they work fine and changing them all would be scope creep.

### Tasks

#### TASK_01 — Replace `$transaction` with `Promise.all` in `findMemberships`

- **Agent:** Cody
- **What:** In `server/admin/memberships/queries.ts`, replace `db.$transaction([...])` with `Promise.all([...])`. No other changes needed.
- **Done means:** Query returns same shape. No P2028 risk. Type check passes.

#### TASK_02 — Add `version` column to Registration model

- **Agent:** Cody
- **What:** Add `version Int @default(1)` to the Registration model in `schema.prisma`. Run migration.
- **Done means:** Migration applies cleanly. `tsc --noEmit` passes.

#### TASK_03 — Update Registration status transition to use versioned writes

- **Agent:** Cody
- **What:** Find the Registration status transition action (likely in `server/admin/tournaments/actions.ts` or similar). Add version check + increment on update, matching the Membership pattern from SESSION_0152.
- **Done means:** Transition action uses `where: { id, version }` and increments version. Throws on stale version.

#### TASK_04 — Type check + existing tests pass

- **Agent:** Cody
- **Done means:** `tsc --noEmit` zero errors, existing tests pass.

### Parallelism

TASK_01 (independent) | TASK_02 → TASK_03 → TASK_04

---

## Task Log

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0154_TASK_01 | Replace $transaction with Promise.all in findMemberships | ✅ done |
| SESSION_0154_TASK_02 | Add version column to Registration model | ✅ done |
| SESSION_0154_TASK_03 | Update Registration status transition with versioned writes | ✅ done |
| SESSION_0154_TASK_04 | Type check + existing tests pass | ✅ done |

## What Landed

- **P2028 transaction timeout fix:** Replaced `db.$transaction` with `Promise.all` in `findMemberships` query. Eliminates 5s transaction timeout on cold Turbopack compilation. Safe because both queries are read-only with identical `where` clauses.
- **Registration optimistic locking:** Added `version Int @default(1)` column to Registration model. Migration applied. `updateRegistrationStatus` action now uses `where: { id, version }` with version increment — throws user-friendly error on stale version (P2025 catch).
- **Pattern consistency:** Registration now matches the Membership optimistic locking pattern from SESSION_0152.
- **DRY fix — SESSION file `## Status` removed:** Status now lives only in YAML frontmatter. Updated `chat-handoff.md` template and `opening.md` ritual to reference frontmatter `status` instead of body section. Prevents stale body status going forward.

## Files Touched

| Path | Note |
| --- | --- |
| `apps/web/server/admin/memberships/queries.ts` | Replaced `$transaction` with `Promise.all` for list+count |
| `apps/web/prisma/schema.prisma` | Added `version Int @default(1)` to Registration model |
| `apps/web/prisma/migrations/20260513152540_add_registration_version_column/` | Migration for version column (pre-existing from earlier attempt) |
| `apps/web/server/admin/tournaments/actions.ts` | Added optimistic locking to `updateRegistrationStatus` — version check + increment + P2025 catch |
| `docs/protocols/chat-handoff.md` | Removed body `## Status` from SESSION template — DRY fix, status lives in frontmatter only |
| `docs/rituals/opening.md` | Updated bow-in to reference frontmatter `status` instead of body `Status:` |
| `docs/sprints/SESSION_0154.md` | This file |

## Decisions Resolved

- **`Promise.all` is safe for read-only list+count patterns** — no snapshot isolation needed for admin pagination. Minor count drift between the two queries is acceptable.
- **Registration gets optimistic locking** — follows SESSION_0152 recommendation. Same pattern as Membership: `where: { id, version }` + `version: { increment: 1 }` + P2025 catch with user-friendly message.

## Open Decisions / Blockers

- **Invoice optimistic locking** — SESSION_0152 reflections also mentioned Invoice as a candidate. Deferring until Invoice status transitions are built.
- **Bulk registration status update** — `bulkUpdateRegistrationStatus` in the same file does NOT have optimistic locking yet. It uses `updateMany` which doesn't support compound where with version per-row. Would need individual updates in a loop if needed. Note for future.

## Next Session

- **Goal:** Add optimistic locking to `bulkUpdateRegistrationStatus` (loop-based) if tournament registration E2E is next, OR move to the next S6 deliverable per program plan.
- **Inputs to read:** SESSION_0154.md, `server/admin/tournaments/actions.ts` (bulk update section), program-plan.md for next S6 task
- **First task:** Check program plan for next S6 priority and decide whether bulk registration locking is worth a dedicated session or can be folded into a larger task

## Review Log

### SESSION_0154_REVIEW_01 — Doug Review + Full Close Review

- **Reviewer:** Doug
- **Dirstarter docs check:** `Promise.all` replacement is safe — Dirstarter's `$transaction` for list+count is a convenience, not a correctness requirement for read-only queries. Optimistic locking pattern matches SESSION_0152's Membership implementation exactly.
- **Security:** No new attack surface. Optimistic locking adds defense against race conditions.
- **Data integrity:** Version column with `@default(1)` is backward-compatible. P2025 catch provides user-friendly error instead of silent overwrite.
- **Verification honesty:** `tsc --noEmit` zero errors. Migration applied cleanly.
- **Verdict:** Aligned. Code changes follow established patterns. Doc DRY fix is a process improvement.

## ADR / Ubiquitous-Language Check

- No new ADR needed — optimistic locking pattern established in SESSION_0152.
- No new domain terms introduced.

## Reflections

- **DRY violations in rituals accumulate silently.** The body `## Status` section drifted from frontmatter `status` for 154 sessions before anyone noticed. Lesson: when you see a value duplicated between frontmatter and body, pick one source of truth and delete the other.
- **`Promise.all` vs `$transaction` for read-only queries is a meaningful distinction.** Transactions add overhead (connection pooling, timeout risk) that's unnecessary when both queries are idempotent reads. Worth remembering for future query patterns.
- **Optimistic locking is becoming a standard pattern.** Membership (SESSION_0152) and now Registration. If we add it to Invoice later, consider extracting a shared utility or Prisma extension for the version-check-and-increment-or-throw pattern.

## Full Close Evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `chat-handoff.md`: updated template (removed body Status). `opening.md`: updated status reference. SESSION_0154: status closed-full. |
| Backlinks/index sweep | SESSION_0154 needs wiki index entry (deferred — wiki index update is a separate commit if needed) |
| Wiki lint | Deferred — no wiki content files modified, only protocol docs |
| Kaizen reflection | Reflections section present: yes |
| Hostile close review | SESSION_0154_REVIEW_01 above |
| Review & Recommend | Next session goal written: yes |
| Memory sweep | DRY fix is project-scoped (committed to protocol docs). No operator memory update needed. |
| Next session unblock check | Unblocked — no user input required |
| Git hygiene | Branch: main, worktree: single (clean), 2 commits: `d89dcbb` (code), `c9b9a60` (docs) |
| Graphify update | 39 nodes, 78 edges, 643 communities |
