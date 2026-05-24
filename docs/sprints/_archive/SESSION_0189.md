---
title: "SESSION 0189 — Schedule Safe-Action Wrapper"
slug: session-0189
type: session--implement
status: closed-full
created: 2026-05-17
updated: 2026-05-17
last_agent: claude-session-0189
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0188.md
  - docs/runbooks/sop-test-writing.md
  - docs/protocols/petey-plan.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0189 — Schedule Safe-Action Wrapper

## Date

2026-05-17 MDT

## Operator

Brian Scott + Claude as Petey orchestrator, Cody implementer (subagent), Doug reviewer.

## Goal

Roll the SESSION_0187/0188 safe-action wrapper test pattern to the schedule lane: invoke `saveSchedule` through the full `userActionClient` chain via the existing `installSafeActionMocks` harness, and prove three middleware gates — unauthenticated short-circuit, Zod validation-error surfacing, and authorized happy-path schedule create through the wrapper.

## Bow-in Notes

- Opening ritual read from `docs/rituals/opening.md`.
- Latest session read: `docs/sprints/SESSION_0188.md`; status `closed-full` (with continuation arc capturing PR #14–#17 deploy chain repair).
- Branch at bow-in: `main` clean at `d24a2bf` (post-merge of PR #17, SESSION_0188 bow-out addendum); created `session-0189-schedule-safe-action-test`.
- FAILED_STEPS scan: FS-0022 (pnpm pre/post hooks) + FS-0023 (Vercel env var Preview scope) are the most recent additions; neither touches the schedule wrapper lane. No `open` entries blocking this work.
- Drift Register scan: no open drift items touching the schedule action lane or the safe-action harness.
- Graphify update completed at bow-in (was skipped at SESSION_0188 close per user note). `graphify update .` → `Nodes: 0, Edges: 0, Communities: 0` delta (graph already current with main HEAD `d24a2bf`). Current `graphify stats` = 6276 nodes / 11300 edges / 781 communities / 1237 files.
- Graphify queries used:
  - `schedule action safe-action wrapper test validation error rate limit`
  - `schedule actions program schedule materialize crud`
- Files selected from Graphify and verified by direct reads:
  - `apps/web/server/web/schedule/actions.ts` (saveSchedule + 5 sibling actions)
  - `apps/web/server/web/schedule/schemas.ts` (saveScheduleSchema, validation surfaces)
  - `apps/web/server/web/schedule/errors.ts` (SCHEDULE_ERROR catalog)
  - `apps/web/server/web/schedule/actions.test.ts` (helper-level precedent — gates 4+9 proof)
  - `apps/web/server/web/lineage/node-profile-actions.safe-action.test.ts` (wrapper precedent)
  - `apps/web/server/web/enrollment/actions.safe-action.test.ts` (wrapper precedent w/ rate-limit toggle)
  - `apps/web/lib/test/safe-action-env.ts` (harness)
  - `docs/runbooks/sop-test-writing.md` §5b + §12

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Test infrastructure layer adjacent to `next-safe-action` (Dirstarter primitive); no schema, no auth, no payments changes. |
| Extension or replacement | Extension. Adds one new test file using the SESSION_0187 harness; no harness changes — `installSafeActionMocks` already exposes everything the schedule lane needs. |
| Why justified | SESSION_0188 Next-session goal explicitly authorized rolling the wrapper pattern to the schedule lane with a validation-error case to prove `result.validationErrors` surfaces correctly. Helper-level test (`actions.test.ts`) proves gates 4+9; wrapper test proves the full `userActionClient` chain including Zod's input parsing. |
| Risk if bypassed | A regression in the wrapper's Zod input parse or in the auth short-circuit would only surface in production. Wrapper test closes that proof gap for the schedule CRUD lane. |

**Live Dirstarter docs checked on 2026-05-17:** N/A — this lane edits only local test code and a local SOP inventory entry. `next-safe-action` is Dirstarter-owned upstream; the harness exercises it rather than reimplementing it.

## Petey plan

### Goal

Prove the schedule safe-action client chain (auth → brand → rate-limit → revalidate) end-to-end by invoking the wrapped `saveSchedule` export through the existing harness with three cases: unauthenticated short-circuit, Zod validation error (`result.validationErrors`), and authorized happy path returning a created `ClassSchedule` row with the matching audit log.

### Tasks

#### TASK_01 — Cody: Wrapped schedule action test

- **Agent:** Cody (backend test worker, run as Agent subagent for context isolation).
- **What:** Add `apps/web/server/web/schedule/actions.safe-action.test.ts` that imports the wrapped `saveSchedule` export and proves three middleware gates through the harness.
- **Steps:**
  1. Install mocks via `installSafeActionMocks({ brand: "BASELINE_MARTIAL_ARTS" })` at the top of the file before any `~/server` import.
  2. Build minimal fixtures in `beforeAll`: owner user (with passport not required for this test), org-level OWNER role (reuse if present), organization (DOJO), organization↔discipline link, owner membership with OWNER role assignment, program. Tag everything with `session-0189-<TS>-`.
  3. Cases:
     - **(a) Unauthenticated:** `setTestSession(null)` → `result.serverError === "User not authenticated"`; verify no `ClassSchedule` row created for the fixture org (`db.classSchedule.count({ where: { organizationId } }) === 0`).
     - **(b) Validation error:** `setTestSession({ id: ownerId })`, submit a payload that fails the Zod schema (e.g., `daysOfWeek: []` — violates `.min(1, "Select at least one day")`, or `startTime: "25:99"` — violates HHMM regex). Expect `result.validationErrors` defined and `result.data` undefined; verify no `ClassSchedule` row created.
     - **(c) Happy path:** `setTestSession({ id: ownerId })`, submit a full valid payload (`name`, `daysOfWeek: ["MON","WED","FRI"]`, `startTime: "18:00"`, `endTime: "19:30"`, `timezone: "America/Denver"`). Expect `result.serverError` undefined; `result.data.id` exists; `result.data.status === "ACTIVE"`; an `AuditLog` row exists with `action: "schedule.created"` and `entityType: "ClassSchedule"`.
  4. Tear down all created rows in `afterAll` (assignments → schedules → memberships → role assignments → org-disciplines → program → organization → roles-if-created → discipline → user → audit logs).
- **Done means:** Test file invokes the wrapped `saveSchedule` export, all three cases pass, no DB drift.
- **Depends on:** nothing (harness already exists; `lib/test/safe-action-env.ts` exposes `setTestSession` + `setRateLimited`).

#### TASK_02 — Doug + Petey: Verify, append inventory, full close

- **Agent:** Doug (verification) + Petey (close).
- **What:** Run the new wrapper test alongside existing safe-action wrapper regression, append schedule lane entry to `sop-test-writing.md` §12 inventory, update project log + wiki index, full close ritual.
- **Steps:**
  1. Run new wrapper test in isolation: `cd apps/web && bun test --timeout 120000 server/web/schedule/actions.safe-action.test.ts`.
  2. Run combined wrapper + schedule helper regression to confirm no fixture collision: include claim-review-actions.safe-action.test.ts, node-profile-actions.safe-action.test.ts, enrollment actions.safe-action.test.ts, schedule actions.test.ts, and the new schedule actions.safe-action.test.ts.
  3. Scoped typecheck filter on touched files (per SESSION_0178_FINDING_01 carry-over closure pattern; full app baseline now zero post-SESSION_0188).
  4. Append SESSION_0189 entry under `sop-test-writing.md` §12 "Wrapped safe-action tests" list.
  5. Wiki lint + `git diff --check`.
  6. Update `docs/protocols/project-log.md` (SESSION_0189 task plan + review block + kaizen) and `docs/knowledge/wiki/index.md` (SESSION_0189 row).
  7. Git hygiene + post-commit Graphify update.
- **Done means:** Full close evidence recorded; branch committed and pushed; PR opened.
- **Depends on:** TASK_01.

### Parallelism

TASK_01 is a single test file — no parallelism gain from splitting cases across subagents. Cody runs as one subagent with context isolation around mock-ordering and fixture-tagging. TASK_02 is sequential after TASK_01 and runs on the main thread because it touches shared non-isolated docs.

### Agent assignments

| Task | Agent | Rationale |
|---|---|---|
| TASK_01 | Cody backend test worker (general-purpose subagent) | Isolated to one test file. Harness contract + SOP §5b skeleton + two precedent wrapper tests give the subagent everything needed to operate independently. Subagent insulates the orchestrator from mock-ordering, fixture-tagging, and teardown-order noise. |
| TASK_02 | Doug + Petey | Verification, inventory, full close. Runs on main thread because the touched docs/log files are non-isolated. |

### Open decisions

- None. SESSION_0188 Next-session goal explicitly authorized this work; harness and SOP section are stable.

### Risks

- Schedule helper test (`actions.test.ts`) and new wrapper test (`actions.safe-action.test.ts`) both create fixtures in the same DB. Distinct tag prefixes (`actions-test-` vs `session-0189-`) prevent collision; verified by reading the helper test's two-phase teardown logic.
- Role table: helper test reuses canonical OWNER/INSTRUCTOR rows if present. Wrapper test should do the same (`role.findUnique({ code_brand })` → reuse, else create + tag). Confirmed pattern in `actions.test.ts:120-141`.
- `saveSchedule` calls `revalidate({ paths })` after success. Harness mocks `next/cache.revalidatePath/revalidateTag` to no-ops; happy-path case must not assert on `revalidate` behavior beyond "no thrown error."

### Scope guard

No changes to `lib/test/safe-action-env.ts`. No changes to schedule action code. No changes to schedule schemas, payloads, errors, or queries. If the wrapper test surfaces a bug in schedule code, file under `Open decisions / blockers` and triage next session.

### Dirstarter implementation template

- **Docs read first:** `next-safe-action` behavior referenced through existing `lib/safe-actions.ts` and `schedule/actions.test.ts`; no live Dirstarter URL touched this lane.
- **Baseline pattern to extend:** `lib/test/safe-action-env.ts` harness + `sop-test-writing.md` §5b skeleton + `enrollment/actions.safe-action.test.ts` (closest precedent — same `userActionClient`, similar gate shape).
- **Custom delta:** Adds schedule-lane wrapper coverage and adds the first `result.validationErrors` proof to the wrapper inventory (prior wrapper tests only exercised auth and rate-limit gates).
- **No-bypass proof:** Test uses the harness as-is; does not wrap or replace the `next-safe-action` action client.

## Pre-flight: Test infra — schedule wrapper

### 1. Petey invocation

- [x] Petey plan exists in SESSION file with task IDs.
- [ ] Petey waived: N/A.

### 2. Design doc check

- Design doc consulted: `docs/runbooks/sop-test-writing.md` §5b (wrapped invocation pattern), §3 (mock seams), §12 (inventory).
- Pattern match: New test mirrors the §5b skeleton with a validation-error case added — the first wrapper test that proves `result.validationErrors` surfaces correctly.

### 3. Existing action scan

- Wrapped exports verified by direct read:
  - `saveSchedule = userActionClient.inputSchema(saveScheduleSchema).action(...)` in `apps/web/server/web/schedule/actions.ts:50`.
  - Five sibling actions also wrapped: `archiveSchedule:166`, `assignInstructor:215`, `unassignInstructor:313`, `setPrimaryInstructor:366`, `materializeSchedule:429`. All share the same `userActionClient` + rate-limit gate. Wrapper test on `saveSchedule` covers the chain shape for the lane.
- Helpers: `saveScheduleSchema`, `archiveScheduleSchema`, `assignInstructorSchema`, `setPrimaryInstructorSchema`, `unassignInstructorSchema`, `materializeScheduleSchema` (all in `schemas.ts`).
- L1 pattern: `enrollment/actions.safe-action.test.ts` is the closest precedent (same userActionClient chain shape). `schedule/actions.test.ts` is the helper-level precedent for fixture lifecycle.

### 4. Runbook consulted

- [x] `docs/runbooks/sop-test-writing.md` read in full (§5b, §3, §12).
- [x] Brand/auth flow confirmed via `lib/safe-actions.ts` middleware chain.

### 5. FAILED_STEPS check

- Prior failures in this area: none specific to schedule wrapper testing. FS-0022 + FS-0023 are deploy-infrastructure failures unrelated to this lane.
- Manual Boundary Registry: MB-002 (brand scope) indirectly strengthened by harness brand-mock; MB-008 (docs/wiki quality) addressed by §12 inventory backfill.

## Task Log

SESSION_0189_TASK_01, SESSION_0189_TASK_02

## What landed

1. **TASK_01 — Schedule wrapper test:** Added `apps/web/server/web/schedule/actions.safe-action.test.ts` exercising the wrapped `saveSchedule` export through the existing `installSafeActionMocks` harness. Three cases prove the `userActionClient` chain: (a) unauthenticated → `serverError === "User not authenticated"` with zero `ClassSchedule` writes; (b) Zod validation error via `daysOfWeek: []` → `result.validationErrors.daysOfWeek` defined, `result.data` undefined, zero writes; (c) authorized owner creating a MON/WED/FRI 18:00–19:30 America/Denver schedule → `result.data.status === "ACTIVE"` with exactly one `schedule.created` audit row on `entityType: "ClassSchedule"`. Fixture set is a single owner/discipline/organization/program triple under the `session-0189-<TS>-` tag prefix.
2. **TASK_02 — Verification + docs + close:** Combined regression (new wrapper + schedule helper + all three SESSION_0187/0188 wrapper tests) returned 17 pass / 0 fail / 84 expect() across 5 files in 1.91s. Scoped typecheck filter returned `NO_MATCHING_ERRORS` with full `bunx tsc --noEmit` exit-0 (post-SESSION_0188 baseline reset holds clean). Wiki lint held at 501 warnings (identical to SESSION_0187/0188 baseline). Appended SESSION_0189 entry under `sop-test-writing.md` §12. Updated `project-log.md` with SESSION_0189 task + review + kaizen blocks. Added SESSION_0189 row to `wiki/index.md`. Bumped `last_agent` to `claude-session-0189` on all three touched docs.

## Files touched

- `apps/web/server/web/schedule/actions.safe-action.test.ts` — new wrapper test (276 lines) exercising `userActionClient` chain with unauth, validationErrors, and happy-path + audit cases.
- `docs/runbooks/sop-test-writing.md` — appended schedule entry to §12 "Wrapped safe-action tests" inventory; bumped frontmatter `last_agent`.
- `docs/protocols/project-log.md` — SESSION_0189 task plan + review + kaizen block; bumped frontmatter `last_agent`.
- `docs/knowledge/wiki/index.md` — added SESSION_0189 row; bumped frontmatter `last_agent`.
- `docs/sprints/SESSION_0189.md` — current session record and full-close artifact.

## Decisions resolved

- Chose `daysOfWeek: []` as the validation-error trigger (clean `.min(1, "Select at least one day")` violation) over time-format violations. Reason: array-min-length is the simplest shape for asserting on `result.validationErrors.daysOfWeek` without coupling to next-safe-action's per-field `_errors` array internals.
- Reused the existing harness as-is rather than adding a `setValidationFailure` toggle. The harness's job is to mock dependencies, not bypass Zod; submitting an invalid payload IS the validation proof.
- Single-fixture owner-only test (no instructor user/role) — `saveSchedule` only touches `canEditOrganization` on the owner side, so the helper test's `instructor` fixtures are not needed here. Reduced teardown surface meaningfully.

## Open decisions / blockers

- Two more wrappable action lanes remain (`attendance`, `billing`) with no wrapper coverage. Not a regression — staged for future sessions.
- Two SESSION_0188 continuation-arc follow-ups remain: `_-prefixed-prop-audit` (nine `_`-prefixed unused param locations from PR #16 — see SESSION_0188.md "Unused-parameter audit") and `prod-seed-audit-and-deploy` (foundational vs demo seed taxonomy from SESSION_0188.md "Production seed inventory"). Neither blocks SESSION_0189's wrapper rollout.

## Verification

| Check | Command | Result |
| --- | --- | --- |
| New wrapper test (isolated) | `cd apps/web && bun test --timeout 120000 server/web/schedule/actions.safe-action.test.ts` | 3 pass / 0 fail / 16 expect() in 1.38s |
| Combined wrapper + helper regression | `cd apps/web && bun test --timeout 120000 server/web/schedule/actions.safe-action.test.ts server/web/schedule/actions.test.ts server/web/enrollment/actions.safe-action.test.ts server/web/lineage/node-profile-actions.safe-action.test.ts server/admin/lineage/claim-review-actions.safe-action.test.ts` | 17 pass / 0 fail / 84 expect() across 5 files in 1.91s |
| Scoped typecheck filter | `cd apps/web && set -o pipefail; bunx tsc --noEmit 2>&1 \| awk 'BEGIN{found=0} /schedule\/actions\.safe-action\|lib\/test\/safe-action-env/ { found=1; print } END { if (!found) print "NO_MATCHING_ERRORS" }'` | `NO_MATCHING_ERRORS`; full command exit-0 (app-wide tsc baseline holds clean post-SESSION_0188 reset) |
| Wiki lint | `bun run wiki:lint` | 0 errors / 501 warnings; identical to SESSION_0187/0188 baseline |
| Diff whitespace | `git diff --check` | reported in bow-out evidence after staging |

## Review log

- SESSION_0189_REVIEW_01 — schedule wrapper coverage + validationErrors proof landed, recorded in `docs/protocols/project-log.md`.

## Hostile close review

- **Giddy verdict:** The change is additive and Dirstarter-aligned. It uses the SESSION_0187 harness without modification and adds one test file that mirrors `sop-test-writing.md` §5b verbatim with a validation-error case substituted for the role-gated case. No harness drift, no parallel test framework, no schedule runtime touched.
- **Doug verdict:** The critical proofs are present: the unauthenticated path returns `serverError === "User not authenticated"` and writes zero `ClassSchedule` rows (confirmed via `db.classSchedule.count`); the validation-error path returns `result.validationErrors.daysOfWeek` with `result.data` undefined and zero writes; the happy path returns `result.data.status === "ACTIVE"` with exactly one `schedule.created` audit row keyed to `entityType: "ClassSchedule"` and `entityId === result.data.id`. Combined regression including the prior three wrapper tests and the schedule helper test remained green at 17 pass / 0 fail / 84 expect(). The app-wide tsc baseline that SESSION_0188 PR #16 reset to zero still holds — `bunx tsc --noEmit` exits clean.
- **Dirstarter docs check:** N/A — this lane only adds local test code and a local SOP inventory entry.
- **Sources:** `apps/web/server/web/schedule/actions.ts`, `apps/web/server/web/schedule/schemas.ts`, `apps/web/server/web/schedule/actions.test.ts` (fixture/teardown precedent), `apps/web/server/web/enrollment/actions.safe-action.test.ts` (closest wrapper precedent), `apps/web/lib/test/safe-action-env.ts` (harness), `docs/runbooks/sop-test-writing.md` §5b/§12.
- **WORKFLOW score:** 9.7/10. Lifecycle, test-evidence proof, and docs alignment are solid. Added the first `result.validationErrors` proof to the wrapper inventory — a real new coverage delta, not just a copy-paste rollout. Held below 10 because two more wrappable lanes (`attendance`, `billing`) still lack wrapper coverage.

## ADR / ubiquitous-language check

No ADR or ubiquitous-language update needed. This session executed the pre-approved SESSION_0188 next-session goal with the existing harness; it did not introduce a new architectural decision or domain term. The `result.validationErrors` proof is a test-coverage extension, not an architectural choice — `next-safe-action`'s output shape is upstream Dirstarter-owned and unchanged.

## Next session

- **Goal:** Roll the wrapper pattern to the `attendance` action lane (the next-highest-risk surface after schedule, with similar auth + rate-limit shape). Add `apps/web/server/web/attendance/actions.safe-action.test.ts` covering at minimum: unauthenticated short-circuit, validation-error case if the lane's schemas admit one cleanly, and an authorized attendance check-in happy path with audit proof.
- **Inputs to read:** `apps/web/server/web/attendance/actions.ts`, `apps/web/server/web/attendance/actions.test.ts` (helper-level precedent), `apps/web/lib/test/safe-action-env.ts`, `docs/runbooks/sop-test-writing.md` §5b, `apps/web/server/web/schedule/actions.safe-action.test.ts` (this session's precedent, especially the `daysOfWeek: []` validationErrors pattern if a similar shape applies).
- **First task:** Cody — add the attendance wrapper test using the existing harness; no harness changes expected.

## Reflections

- The validation-error case slotted in cleanly without harness changes. `installSafeActionMocks` doesn't need to know anything about Zod — submitting an invalid payload IS the proof, and `result.validationErrors` surfaces through the `userActionClient` chain unmodified. This means future wrapper tests for `attendance`, `billing`, etc. can mechanically add a validation case for ~5 lines of code, raising the floor of coverage with negligible cost.
- The auth middleware short-circuits BEFORE Zod parses input. Test case (a) submits a valid payload while unauthenticated and gets `serverError`, not `validationErrors`. Worth remembering for future wrapper authors: if you want to prove validation, you must be authenticated first. Captured in the inline test comments.
- The fixture-shape minimization (owner-only, no instructor) paid off — teardown is ~25 lines lighter than the helper test, and the zombie-sweep by `session-0189-` tag prefix is fully orthogonal to `actions-test-` and `session-0188-` prefixes. Combined regression ran 1.91s with no fixture collision; the wrapper-test family parallelizes cleanly across distinct prefixes.
- Cody (subagent) followed the precedent verbatim — no surprises in the diff, no harness change requests, no scope creep. The SESSION_0187/0188 pattern is now stable enough that wrapper test rollouts to the remaining lanes are near-mechanical work.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Bumped `last_agent: claude-session-0189` on `sop-test-writing.md`, `project-log.md`, and `wiki/index.md`. `SESSION_0189.md` frontmatter set to `status: closed-full`, `type: session--implement`. |
| Backlinks/index sweep | SESSION_0189 row added to `docs/knowledge/wiki/index.md`. SESSION_0189 frontmatter `pairs_with` SESSION_0188 + `sop-test-writing.md` + `petey-plan.md`. No new wiki pages created this session, so no further backlink work needed. |
| Wiki lint | `bun run wiki:lint` returned 0 errors / 501 warnings — identical to SESSION_0187/0188 baseline. |
| Kaizen reflection | Reflections section present above. |
| Hostile close review | SESSION_0189_REVIEW_01 recorded in project log; hostile close review section present above. |
| Review & Recommend | Next session goal written above: roll harness to attendance lane. |
| Memory sweep | No operator memory update needed; the harness pattern and validationErrors surface remain documented in `sop-test-writing.md` §5b and this session's test file inline comments. |
| Next session unblock check | Unblocked: attendance action file and its helper test exist; harness and SOP section are stable. |
| Git hygiene | Branch: `session-0189-schedule-safe-action-test`. Final commit hash, push status, and worktree list reported in the bow-out response after git hygiene. |
| Graphify update | Final node/edge/community count reported in bow-out response after post-commit Graphify update. |

## Status

closed-full
