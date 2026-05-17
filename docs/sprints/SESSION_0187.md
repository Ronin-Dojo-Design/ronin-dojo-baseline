---
title: "SESSION 0187 — Safe-Action Test Harness"
slug: session-0187
type: session--implement
status: closed-full
created: 2026-05-17
updated: 2026-05-17
last_agent: claude-session-0187
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0186.md
  - docs/sprints/SESSION_0184.md
  - docs/runbooks/sop-test-writing.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0187 — Safe-Action Test Harness

## Date

2026-05-17 MDT

## Operator

Brian Scott + Claude as Petey orchestrator, Cody implementer, Doug reviewer.

## Goal

Add a small reusable test helper that exercises lineage server actions through the real `next-safe-action` middleware chain (not just the exported helpers), close SESSION_0184_FINDING_02, and update `sop-test-writing.md` to describe when each pattern applies.

## Bow-in Notes

- Opening ritual read from `docs/rituals/opening.md`.
- Latest session read: `docs/sprints/SESSION_0186.md`; status `closed-full`.
- Branch at bow-in: `session-0186-lineage-placeholder-archival` clean at `7e724b6`; created `session-0187-safe-action-test-harness`.
- FAILED_STEPS scan: FS-0021 (schema migration) open but unrelated to this test lane. Patterns 1–4 reviewed.
- Drift Register scan: D-007 deferred and unrelated. No test-harness drift entries.
- Graphify update completed (post-SESSION_0186 was missed): `graphify update .` returned zero-node delta (graph still at 6244 nodes / 11827 edges / 749 communities / 1232 files tracked from SESSION_0186 commit).
- Graphify queries used:
  - `safe action test harness userActionClient adminActionClient lineage`
  - `lineage claim review action test invocation`
  - `safe action middleware authActionClient action client wrapper`
  - `lead actions test mock session brand action client invocation pattern`
- Files selected from Graphify and verified by direct reads:
  - `apps/web/lib/safe-actions.ts`
  - `apps/web/server/admin/lineage/claim-review-actions.ts`
  - `apps/web/server/admin/lineage/claim-review-actions.test.ts`
  - `apps/web/server/web/lineage/node-profile-actions.ts`
  - `apps/web/server/web/lineage/node-profile-actions.test.ts`
  - `apps/web/server/web/lead/actions.test.ts` (working safe-action-invocation reference)
  - `docs/runbooks/sop-test-writing.md`

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Test infrastructure layer adjacent to `next-safe-action` (Dirstarter primitive); no schema, no auth, no payments. |
| Extension or replacement | Extension. Adds a thin local test helper that wraps the `next-safe-action` mock seams documented in `sop-test-writing.md` §3. No change to `lib/safe-actions.ts` itself. |
| Why justified | SESSION_0184_FINDING_02 explicitly recorded that the wrapped action middleware is not exercised; SESSION_0186 next-session goal asks for this harness. Helper-only tests cannot prove the auth/admin/brand gates of the action client. |
| Risk if bypassed | Regressions in the action client chain (auth requirement, role check, brand injection, error normalization) would not be caught by the existing helper-only tests. |

**Live Dirstarter docs checked on 2026-05-17:** N/A — this lane edits only local test code and a local runbook. `next-safe-action` is a Dirstarter-owned primitive whose behavior is treated as upstream truth; the harness exercises it rather than reimplementing it.

## Petey plan

### Goal

Prove the lineage safe-action client chain (auth → admin → brand → revalidate) end-to-end by invoking the wrapped action exports through a small reusable mock harness, and document the pattern.

### Tasks

#### TASK_01 — Cody: Reusable safe-action mock helper

- **Agent:** Cody (test infra worker)
- **What:** Create `apps/web/lib/test/safe-action-env.ts` that exports a `installSafeActionMocks({ brand, session })` helper installing the standard `next/headers`, `next/cache`, `~/lib/auth`, and `next/server` mocks per `sop-test-writing.md` §3, plus a `setTestSession({ id, role })` mutator.
- **Steps:**
  1. Read `sop-test-writing.md` §3 and `lead/actions.test.ts` mock block as the canonical pattern.
  2. Author the helper so callers invoke it before any action import.
  3. Keep the file under ~100 lines; no Prisma touches, no fixtures.
  4. Export typed mutators for session id/role and brand override.
- **Done means:** New helper exists, exports `installSafeActionMocks` + `setTestSession`, and does not import any action module.
- **Depends on:** nothing.

#### TASK_02 — Cody: Invoke `reviewLineageClaim` through the safe-action wrapper

- **Agent:** Cody (backend test worker)
- **What:** Add `apps/web/server/admin/lineage/claim-review-actions.safe-action.test.ts` that imports the wrapped export `reviewLineageClaim` (not the helper) and proves the admin gate, brand, and successful approve path.
- **Steps:**
  1. Install mocks via the TASK_01 helper.
  2. Reuse fixture creators from the existing `claim-review-actions.test.ts` (factor minimally; copy if simpler — this is a parallel proof, not a refactor).
  3. Cases: (a) unauthenticated → serverError; (b) non-admin role → serverError; (c) admin approve happy path → result.data with `placeholderArchivedUserId`.
  4. Assert via `result?.data` / `result?.serverError` (the `SafeActionResult` shape), not via throw.
- **Done means:** Test invokes `reviewLineageClaim` (the `adminActionClient`-wrapped export) and the 3 cases pass.
- **Depends on:** TASK_01.

#### TASK_03 — Cody: Invoke `updateLineageNodeProfile` through the safe-action wrapper

- **Agent:** Cody (backend test worker, parallel to TASK_02)
- **What:** Add `apps/web/server/web/lineage/node-profile-actions.safe-action.test.ts` that imports the wrapped export `updateLineageNodeProfile` and proves the auth gate and an authorized happy path.
- **Steps:**
  1. Install mocks via the TASK_01 helper.
  2. Reuse fixture creators from `node-profile-actions.test.ts` minimally.
  3. Cases: (a) unauthenticated → serverError; (b) authenticated claimant with active LineageTreeAccess → result.data containing `treeSlug` and `nodeId`.
- **Done means:** Test invokes `updateLineageNodeProfile` (the `userActionClient`-wrapped export) and both cases pass.
- **Depends on:** TASK_01. Can run in parallel with TASK_02 (disjoint files).

#### TASK_04 — Doug + Petey: Verification, sop-test-writing update, full close

- **Agent:** Doug (verification) + Petey (close)
- **What:** Run focused tests, append a "Wrapped action invocation pattern" section to `sop-test-writing.md`, run wiki lint + scoped typecheck, then full close.
- **Steps:**
  1. Run new safe-action tests + existing lineage regression to confirm no regression.
  2. Run scoped typecheck filter on touched files.
  3. Append §5b "Wrapped action invocation" to `sop-test-writing.md` describing when to test the wrapper vs the helper.
  4. Wiki lint + diff whitespace check.
  5. Update `docs/protocols/project-log.md` and `docs/knowledge/wiki/index.md`.
  6. Resolve SESSION_0184_FINDING_02 in the project log.
  7. Git hygiene + post-commit Graphify update.
- **Done means:** Full close evidence recorded; SESSION_0184_FINDING_02 marked resolved; branch committed and pushed.
- **Depends on:** TASK_01, TASK_02, TASK_03.

### Parallelism

TASK_01 is the blocking dependency (small helper module). TASK_02 and TASK_03 operate on disjoint test files (admin lineage vs web lineage) and can be implemented by parallel subagents once TASK_01 lands. TASK_04 is sequential after all three.

### Agent assignments

| Task | Agent | Rationale |
|---|---|---|
| TASK_01 | Cody test-infra worker | Single tiny module; main thread to avoid mock-ordering subtleties bleeding into subagent work. |
| TASK_02 | Cody backend worker (subagent A) | Admin lineage claim review; isolated to admin lineage test file. |
| TASK_03 | Cody backend worker (subagent B) | Web lineage node profile; isolated to web lineage test file; safe to run in parallel with subagent A. |
| TASK_04 | Doug + Petey | Verification, doc update, full close. |

### Open decisions

- No user sign-off required. SESSION_0186 Next-session goal explicitly authorized this work.
- The harness intentionally does not abstract fixture creation. Fixtures stay per-test for clarity (matches `sop-test-writing.md` §4 tagging convention).

### Risks

- `next-safe-action` v8 may surface `serverError` as a thrown rejection vs `result.serverError` in newer adapters. Tests should branch on which one the existing `lead/actions.test.ts` uses to stay aligned. Validate by reading first.
- Parallel subagents must each install mocks BEFORE any action import. Documented in the helper module and the SOP update.
- App-wide typecheck baseline remains nonzero; scoped filter is the honest gate.

### Scope guard

No middleware refactor, no Prisma changes, no admin UI changes. If the wrapped action surfaces a bug, file in `Open decisions / blockers` and triage in a follow-up session.

### Dirstarter implementation template

- **Docs read first:** `next-safe-action` behavior is referenced through the existing `lib/safe-actions.ts` and `lead/actions.test.ts`; no live Dirstarter URL touched this lane.
- **Baseline pattern to extend:** `lib/safe-actions.ts` action client chain, `sop-test-writing.md` mock seam pattern.
- **Custom delta:** Ronin gains a reusable test seam for safe-action invocation across lineage and future action lanes.
- **No-bypass proof:** Helper installs mocks for the same four modules `sop-test-writing.md` already prescribes; it does not replace or wrap the action client itself.

## Pre-flight: Test infra — safe-action mock harness

### 1. Petey invocation

- [x] Petey plan exists in SESSION file with task IDs.
- [ ] Petey waived: N/A.

### 2. Design doc check

- Design doc consulted: `docs/runbooks/sop-test-writing.md` §3 (mock surface), §5 (action test pattern).
- Pattern match: Helper mirrors §3 mock registration order exactly.

### 3. Existing action scan

- Wrapped exports verified by direct read:
  - `reviewLineageClaim = adminActionClient.inputSchema(...).action(...)` in `apps/web/server/admin/lineage/claim-review-actions.ts:249-260`.
  - `updateLineageNodeProfile = userActionClient.inputSchema(...).action(...)` in `apps/web/server/web/lineage/node-profile-actions.ts:129-145`.
- Helpers `applyLineageClaimReview` and `applyLineageNodeProfileUpdate` already covered by existing tests; not retouched.
- L1 pattern: `lead/actions.test.ts` is the working precedent.

### 4. Runbook consulted

- [x] `docs/runbooks/sop-test-writing.md` read in full.
- [x] `docs/runbooks/sop-data-and-wiring-flows.md` — flow: Auth + brand context flow.

### 5. FAILED_STEPS check

- Prior failures in this area: none specific. FS-0008 (primitive/enum spot-check) does not apply — no schema or component primitive changes.
- Manual Boundary Registry: MB-002 (brand scope) and MB-008 (docs/wiki quality) are globally open; this session's wrapper test happens to exercise brand-injection from `next/headers` mock, which strengthens MB-002 indirectly.

## Task Log

SESSION_0187_TASK_01, SESSION_0187_TASK_02, SESSION_0187_TASK_03, SESSION_0187_TASK_04

## What landed

1. **TASK_01 — Reusable safe-action mock helper:** Added `apps/web/lib/test/safe-action-env.ts` exporting `installSafeActionMocks({ brand })` and `setTestSession({ id, role })`. The helper installs the standard `next/headers`, `next/cache`, `~/lib/auth`, `~/lib/brand-context`, `next/server`, and `~/lib/rate-limiter` mocks documented in `sop-test-writing.md` §3. Callers invoke it once at the top of a test file before any `~/server`/`~/lib/auth` import.
2. **TASK_02 — `reviewLineageClaim` wrapper test:** Added `apps/web/server/admin/lineage/claim-review-actions.safe-action.test.ts` (parallel Cody subagent). Imports the wrapped `reviewLineageClaim` export (not `applyLineageClaimReview`) and proves three middleware gates: unauthenticated → `serverError === "User not authenticated"`, non-admin → `serverError === "User not authorized"`, admin approve → `result.data.status === "APPROVED"` with placeholder archival side effects verified directly in the DB. Uses Prisma `@default(cuid())` to satisfy the schema's `claimId` cuid validation.
3. **TASK_03 — `updateLineageNodeProfile` wrapper test:** Added `apps/web/server/web/lineage/node-profile-actions.safe-action.test.ts` (parallel Cody subagent). Imports the wrapped `updateLineageNodeProfile` export and proves: unauthenticated → `serverError === "User not authenticated"`, authorized claimant with active NODE_EDITOR access → `result.data` populated and passport/lineageNode side effects committed.
4. **TASK_04 — Verification + docs:** Combined lineage regression (45 pass / 0 fail / 153 expect across 7 files), scoped typecheck filter clean, wiki-lint 0 errors / 501 warnings (unchanged baseline), `git diff --check` clean. Appended `sop-test-writing.md` §5b "Wrapped action invocation pattern" documenting when to use helper vs wrapper tests. Updated `docs/protocols/project-log.md` with SESSION_0187 task plan + review + finding-status block. Resolved SESSION_0184_FINDING_02. Added SESSION_0187 row to `docs/knowledge/wiki/index.md`.

## Files touched

- `apps/web/lib/test/safe-action-env.ts` — new reusable safe-action mock helper.
- `apps/web/server/admin/lineage/claim-review-actions.safe-action.test.ts` — new wrapper test exercising `adminActionClient` chain.
- `apps/web/server/web/lineage/node-profile-actions.safe-action.test.ts` — new wrapper test exercising `userActionClient` chain.
- `docs/runbooks/sop-test-writing.md` — added §5b "Wrapped action invocation pattern"; bumped frontmatter `updated`/`last_agent`.
- `docs/protocols/project-log.md` — SESSION_0187 task/review/finding entries; resolved SESSION_0184_FINDING_02; bumped frontmatter.
- `docs/knowledge/wiki/index.md` — added SESSION_0187 row; bumped frontmatter.
- `docs/sprints/SESSION_0187.md` — current session record and full-close artifact.

## Decisions resolved

- Helper-level tests (existing pattern) and wrapped-action tests (new pattern) coexist as complementary proofs: helper for transaction/SQL/edge cases, wrapper for auth/admin/brand/schema/serverError gates. Documented in `sop-test-writing.md` §5b.
- The harness installs the brand mock via `~/lib/brand-context` (the import path used inside `lib/safe-actions.ts`) rather than re-deriving from `next/headers` alone. Both are still mocked for completeness, but `~/lib/brand-context` is the authoritative seam.
- Claim ids in wrapper tests must pass `z.string().cuid()` — use Prisma `@default(cuid())` or `createId()`, never `tag(...)` prefix strings. Recorded as a rule in the SOP.

## Open decisions / blockers

- Wrapper harness covers only lineage today. Rollout to other action lanes (lead, schedule, attendance, billing) is a future task, not a regression.
- App-wide typecheck baseline remains nonzero (carried from SESSION_0178_FINDING_01); scoped filter is the honest gate this session.

## Verification

| Check | Command | Result |
| --- | --- | --- |
| New wrapper tests | `cd apps/web && bun test --timeout 120000 server/admin/lineage/claim-review-actions.safe-action.test.ts server/web/lineage/node-profile-actions.safe-action.test.ts` | 5 pass / 0 fail / 21 expect() in 1.71s |
| Combined lineage regression | `cd apps/web && bun test --timeout 120000 server/web/lineage server/admin/lineage server/admin/users/queries.test.ts` | 45 pass / 0 fail / 153 expect() across 7 files in 3.21s |
| Scoped typecheck filter | `cd apps/web && set -o pipefail; bunx tsc --noEmit 2>&1 \| awk 'BEGIN{found=0} /safe-action-env\|claim-review-actions\.safe-action\|node-profile-actions\.safe-action\|lib\/test\// { found=1; print } END { if (!found) print "NO_MATCHING_ERRORS" }'` | `NO_MATCHING_ERRORS`; full command exited 2 because broader app typecheck baseline remains nonzero |
| Diff whitespace | `git diff --check` | pass |
| Wiki lint | `bun run wiki:lint` | 0 errors / 501 warnings; identical to SESSION_0186 baseline — no new warnings introduced |

## Review log

- SESSION_0187_REVIEW_01 — safe-action wrapper harness landed, recorded in `docs/protocols/project-log.md`.
- SESSION_0184_FINDING_02 — resolved this session.

## Hostile close review

- **Giddy verdict:** The change is additive and Dirstarter-aligned: it adds a thin local test seam that mirrors the `sop-test-writing.md` §3 mock surface and exercises the `next-safe-action` primitive rather than wrapping or replacing it. The harness path (`apps/web/lib/test/`) sits next to existing repo conventions and does not introduce a parallel test framework.
- **Doug verdict:** The critical proof is present: middleware short-circuits before the helper for both unauthenticated and unauthorized cases; happy path returns `result.data` and the expected DB side effects (placeholder archival timestamp, passport/bio writes). Combined regression suite is green and the scoped typecheck filter has no matching errors. The honest caveat — full-app typecheck baseline remains nonzero — is recorded.
- **Dirstarter docs check:** N/A — this lane only adds local test code and a local runbook section.
- **Sources:** `apps/web/lib/safe-actions.ts`, `apps/web/server/admin/lineage/claim-review-actions.ts`, `apps/web/server/web/lineage/node-profile-actions.ts`, `apps/web/server/web/lead/actions.test.ts` (working precedent), `docs/runbooks/sop-test-writing.md`.
- **WORKFLOW score:** 9.7/10. Held below 10 because the harness only covers two action lanes this session; broader rollout is a follow-up rather than a regression.

## ADR / ubiquitous-language check

No ADR or ubiquitous-language update needed. This session implemented an already-named gap (SESSION_0184_FINDING_02) with a small reusable test seam and a documented pattern; it did not introduce a new architectural decision or domain term.

## Next session

- **Goal:** Roll the safe-action wrapper harness pattern to one additional action lane (suggest: `server/web/enrollment/actions.ts`, since enrollment is the next-highest-risk surface with both auth gate and rate-limiter middleware), and confirm the `~/lib/rate-limiter` mock in the harness behaves correctly under a `rateLimited: true` toggle.
- **Inputs to read:** `apps/web/lib/test/safe-action-env.ts` (this session's harness), `apps/web/server/web/enrollment/actions.ts`, `apps/web/server/web/lead/actions.test.ts` (rate-limit toggle precedent), `docs/runbooks/sop-test-writing.md` §5b.
- **First task:** Cody — add `apps/web/server/web/enrollment/actions.safe-action.test.ts` exercising at least one rate-limited path through the harness.

## Reflections

- The parallel-subagent split was correct: TASK_02 and TASK_03 operate on disjoint files and disjoint database fixtures (distinct prefixes), so they wrote and verified independently with no merge conflict and no fixture collision. Total wall-clock for the two tests was ~95s including each subagent's read-verify-write-run cycle.
- The non-obvious failure mode caught by TASK_02's subagent was cuid validation. `tag(...)` ids passed the helper-level test for SESSION_0186 because that test bypasses the wrapper's Zod schema, but they would fail through `reviewLineageClaim`. Documenting it in §5b means future wrapper tests skip that landmine.
- Keeping the harness brand-mock at `~/lib/brand-context` (not just `next/headers`) matched the actual import inside `lib/safe-actions.ts` — `getRequestBrand` is called directly. Mocking only `next/headers` would have left the brand seam half-stubbed.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Bumped `updated: 2026-05-17` and `last_agent: claude-session-0187` on `sop-test-writing.md`, `project-log.md`, and `wiki/index.md`. `SESSION_0187.md` frontmatter set to `status: closed-full`, `type: session--implement`. |
| Backlinks/index sweep | SESSION_0187 row added to `docs/knowledge/wiki/index.md`. SESSION_0187 frontmatter `pairs_with` SESSION_0186, SESSION_0184, and `sop-test-writing.md`. No new wiki pages created this session, so no further backlink work needed. |
| Wiki lint | `bun run wiki:lint` returned 0 errors / 501 warnings — identical count to SESSION_0186 baseline; warnings are repo-wide pre-existing docs debt, not introduced by this session. |
| Kaizen reflection | Reflections section present above. |
| Hostile close review | SESSION_0187_REVIEW_01 recorded in project log; hostile close review section present above. |
| Review & Recommend | Next session goal written above: roll harness to enrollment lane with rate-limiter coverage. |
| Memory sweep | No operator memory update needed; the harness pattern is documented in `sop-test-writing.md` §5b which is the canonical source for future sessions. |
| Next session unblock check | Unblocked: enrollment action file, lead test precedent, harness, and SOP section are all in place. |
| Git hygiene | Branch: `session-0187-safe-action-test-harness`. Final commit hash, push status, and worktree list reported in the bow-out response after git hygiene. |
| Graphify update | Final node/edge/community count reported in bow-out response after post-commit Graphify update. |

## Status

closed-full
