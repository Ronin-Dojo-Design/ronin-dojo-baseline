---
title: "SESSION 0327 — Promotion-events next/cache test shim"
slug: session-0327
type: session--open
status: closed
created: 2026-06-02
updated: 2026-06-02
last_agent: codex-session-0327
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0326.md
  - docs/petey-plan-0305.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0327 — Promotion-events next/cache test shim

## Date

2026-06-02

## Operator

Brian + codex-session-0327

## Goal

Fix the pre-existing Bun test-environment fragility around `next/cache` resolution in
`promotion-events/editor-actions.test.ts`, so the promotion-events server test suite can run green as a
directory. The larger lineage animation epic remains staged in `docs/petey-plan-0305.md` for the next
frontend session.

## Status

### Status: closed

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0326.md`
- Carryover: SESSION_0326 completed avatar-projection consumption across genuinely public avatar surfaces
  and left two clean options: resume `petey-plan-0305` Lineage phases 2-4, or fix the known
  `next/cache` `revalidatePath` Bun test fragility in the promotion-events editor-action suite.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `ec9536f`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Test harness resolution for Next.js cache/action dependencies; no product-facing Dirstarter layer changed at plan-lock. |
| Extension or replacement | Extension: keep the existing promotion-events server-action contract and align Bun's local test resolution around it. |
| Why justified | The suite already mocks `next/cache`; this session makes that mock reliable enough to test the Ronin promotion-event editor logic. |
| Risk if bypassed | The editor-action suite remains runnable only as individual files or fails before assertions, hiding regressions in event creation and rank-award authorization. |

Live docs checked during planning: not applicable — no live Dirstarter integration boundary, schema, auth model, storage, payment, media, or hosting behavior changes at plan-lock.

### Graphify check

- Graph status: current enough for bow-in; stats at bow-in: 8973 nodes, 13809 edges, 1379 communities, 1542 files tracked.
- Queries used:
  - `petey plan 0305 lineage phase 2 tree animations belt rail trophy`
  - `grill me Petey mutual understanding open decisions planning questions`
  - `promotion events editor actions test revalidatePath next cache bun SyntaxError`
  - `autonomous sessions codex unattended run N sessions next session setup`
  - `codex auto run autonomous codex sessions graphify query auto-session`
- Files selected from graph:
  - `docs/petey-plan-0305.md`
  - `docs/protocols/petey-plan.md`
  - `apps/web/server/web/promotion-events/editor-actions.test.ts`
  - `apps/web/server/web/promotion-events/editor-actions.ts`
  - `apps/web/server/web/promotion-events/editor-queries.ts`
  - `apps/web/server/web/promotion-events/editor-authorization.ts`
  - `docs/runbooks/dev-environment/autonomous-sessions.md`
  - `scripts/auto-session-codex.sh`
- Verification note: exact files opened after Graphify; Graphify used as navigation, not proof.

### Grill outcome

- **Fork chosen:** option (b), fix the promotion-events `next/cache` Bun test fragility this session.
- **Why this task now:** it is bounded, already called out as pre-existing fragility, and unblocks a server-action suite before the next broader lineage/UI lane.
- **Deferred fork:** option (a), `petey-plan-0305` continuation, remains the recommended next frontend session after this harness fix.
- **Subagents:** no separate subagent worktree for implementation; the files overlap tightly, so Petey -> Cody -> Doug sequential handoff is more token-efficient than parallel agents.
- **Autonomous continuation grill:** operator answered round 1 during close — resume from the already-landed Phase 2 work, use the default Phase 3 utility path, and use the existing Codex auto-run script surfaced by Graphify.

## Petey plan

### Goal

Make the promotion-events server test directory run green under Bun by reproducing and fixing the `next/cache`
resolution failure without changing production editor behavior.

### Tasks

#### SESSION_0327_TASK_01 — Reproduce the directory failure

- **Agent:** Doug
- **What:** Run the promotion-events test suite as a directory and capture the exact `next/cache` failure mode.
- **Steps:**
  1. Run the focused promotion-events Bun test command from `apps/web`.
  2. Record whether the failure is import-time `SyntaxError`, mock-hoisting order, or alias-resolution drift.
  3. Identify the smallest file or test setup surface that owns the shim.
- **Done means:** SESSION task log records the failing command and observed failure before any code change.
- **Depends on:** nothing.

#### SESSION_0327_TASK_02 — Align Bun `next/cache` resolution

- **Agent:** Cody
- **What:** Apply the smallest mock/import shim so `editor-actions.test.ts` and its promotion-events sibling tests can run together.
- **Steps:**
  1. Inspect current Bun mock order and any existing local test setup helpers.
  2. Prefer a test-local shim if the fragility is isolated; use a shared test mock only if multiple promotion-events files need it.
  3. Preserve production `userActionClient` and `revalidate` behavior.
  4. Run the promotion-events directory test and any directly affected focused tests.
- **Done means:** `bun test server/web/promotion-events` passes from `apps/web` with no production behavior change.
- **Depends on:** SESSION_0327_TASK_01.

#### SESSION_0327_TASK_03 — Full close, graph refresh, commit, push

- **Agent:** Petey + Doug
- **What:** Run close gates, update session evidence, refresh Graphify, then stage, commit, and push to `main`.
- **Steps:**
  1. Run focused tests plus appropriate changed-file/type/wiki gates.
  2. Complete full `docs/rituals/closing.md`, including optional deep items, hostile close review, ADR check, memory sweep, and component/ADR inventory checks.
  3. Run `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` before final git hygiene so close stays one commit.
  4. Stage, commit with a conventional message, and push to `origin/main`.
- **Done means:** SESSION_0327 is closed-full, Graphify is refreshed, and one commit is pushed to `main`.
- **Depends on:** SESSION_0327_TASK_02.

### Parallelism

No parallel subagents for implementation. TASK_01 and TASK_02 touch the same test/import surface and must be
sequential. TASK_03 waits for test evidence. Personas are assigned sequentially on the shared `main` worktree.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0327_TASK_01 | Doug | Reproduce first; classify the failure before Cody edits. |
| SESSION_0327_TASK_02 | Cody | Focused test-harness implementation with no production behavior changes. |
| SESSION_0327_TASK_03 | Petey + Doug | Full close, evidence, graph refresh, and git hygiene. |

### Open decisions

None at plan-lock. Petey selected option (b) per the previous session's operator-choice handoff.

### Risks

- Bun may not hoist `mock.module("next/cache")` early enough if the module is imported by a transitive dependency before the test file body runs.
- A shared shim could accidentally hide production `revalidate` behavior if it leaks outside test scope.
- FS-0024 applies: every mutating git/tool call must stay rooted in `/Users/brianscott/dev/ronin-dojo-app`.

### Scope guard

- Do not resume `petey-plan-0305` Phase 2 in this session.
- Do not refactor promotion-events editor actions beyond the minimum needed for test resolution.
- Do not alter production cache invalidation semantics or action-client contracts.
- Do not introduce Docker; this task does not require it.

### Dirstarter implementation template

- **Docs read first:** not applicable for live Dirstarter docs; local sources read were `CLAUDE.md`, `opening.md`, `WORKFLOW_5.0.md`, `cody-preflight.md`, and the promotion-events editor files.
- **Baseline pattern to extend:** Bun test `mock.module` around Next.js cache dependencies; existing Dirstarter-style `userActionClient` revalidation stays intact.
- **Custom delta:** Ronin promotion-event editor tests need deterministic local cache no-ops while exercising authorization and audit logic.
- **No-bypass proof:** The change is test-only; production `next/cache` and action-client revalidation wiring remains unchanged.

## Cody pre-flight

### Pre-flight: Promotion-events `next/cache` test shim

#### 1. Existing component scan

- Graphify query used: `promotion events editor actions test revalidatePath next cache bun SyntaxError`
- Found: `editor-actions.test.ts`, `editor-actions.ts`, `editor-queries.ts`, `editor-authorization.ts`.
- UI components: none; this is a server-action test harness change.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: no — no live Dirstarter L1 integration boundary changes.
- Consulted live alignment URLs: no — test-only local shim; no storage/payment/media/auth/schema/hosting change.
- Closest L1 pattern: existing `userActionClient` action/revalidate contract in `editor-actions.ts`.
- Primitive API spot-check: not applicable; no component primitives used.

#### 3. Composition decision

- Extending existing test file/setup only.
- Production composition preserved: `userActionClient.inputSchema(...).action(...)` still receives `ctx.revalidate`.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes, `docs/sprints/SESSION_0326.md`.
- ADR read: none required; no architecture or schema decision.
- Runbook consulted: `docs/runbooks/dev-environment/graphify-repo-memory.md`.

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo` if needed; not needed for focused Bun tests.
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`
- Brand/host for testing: not applicable.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0006/FS-0007 (Petey/governance), FS-0020 (Graphify-first), FS-0024 (cwd guard), FS-0025 (single close commit).
- Mitigation acknowledged: Petey plan exists before edits, Graphify queries ran before repo-wide search, cwd/remote verified, and Graphify refresh will run before the final commit.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0327_TASK_01 | landed | Reproduced with `bun test server/web/promotion-events` from `apps/web`: `queries.test.ts` passes, then `editor-actions.test.ts` throws `SyntaxError: Export named 'revalidatePath' not found in module .../next/cache.js` between tests. |
| SESSION_0327_TASK_02 | landed | Expanded both promotion-events `next/cache` mocks to the full no-op seam (`cacheLife`, `cacheTag`, `revalidatePath`, `revalidateTag`, `updateTag`); the same directory command now passes 6 tests / 16 assertions. |
| SESSION_0327_TASK_03 | landed | Full close evidence written; final wiki-lint, Graphify refresh, git commit, and push handled in close. |

## What landed

- Reproduced the exact promotion-events directory failure before edits:
  `bun test server/web/promotion-events` failed after `queries.test.ts` passed because
  `editor-actions.test.ts` could not import named `revalidatePath` from `next/cache.js`.
- Brought both promotion-events `next/cache` mocks into the repo's standard no-op cache seam:
  `cacheLife`, `cacheTag`, `revalidatePath`, `revalidateTag`, and `updateTag`.
- Confirmed the same directory command now passes in sequential and `--parallel` modes.
- Added SESSION_0327 to the wiki index and completed the close review/evidence trail.

## Decisions resolved

- Petey selected option (b) from SESSION_0326's handoff: fix promotion-events test fragility now,
  then resume `docs/petey-plan-0305.md` in the next lineage/frontend session.
- Operator asked during close to begin planning the `petey-plan-0305` continuation as an autonomous
  Codex run for about 3 sessions. Grill outcome: resume from the already-landed Phase 2 work, keep the
  default Phase 3 utility path, and use the existing Codex runner Graphify surfaced.
- No ADR or ubiquitous-language update is needed; this was a test-harness alignment, not a new architecture
  or domain-language decision.
- No component inventory update is needed; no UI component or component contract changed.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/web/promotion-events/queries.test.ts` | Expanded the `next/cache` mock from query-only exports to the full standard no-op seam. |
| `apps/web/server/web/promotion-events/editor-actions.test.ts` | Expanded the `next/cache` mock to include query-cache exports and Biome-wrapped two long fake-DB lines. |
| `docs/sprints/SESSION_0327.md` | Created and maintained the session bow-in, plan, task log, review, and close evidence. |
| `docs/knowledge/wiki/index.md` | Added SESSION_0327 and updated index frontmatter for the JETTY sweep. |
| `docs/runbooks/dev-environment/autonomous-sessions.md` | Added the existing Codex `auto-session-codex.sh` variant so the next handoff has the right runner. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `cd apps/web && bun test server/web/promotion-events` before fix | Failed as expected: `SyntaxError: Export named 'revalidatePath' not found in module .../next/cache.js`. |
| `cd apps/web && bun test server/web/promotion-events` after fix | Pass: 6 tests, 16 assertions. |
| `cd apps/web && bun test --parallel server/web/promotion-events` | Pass: 6 tests, 16 assertions. |
| `cd apps/web && bun run typecheck` | Pass: `next typegen` completed and `tsc --noEmit --pretty false` exited 0. |
| `cd apps/web && bun biome check server/web/promotion-events/queries.test.ts server/web/promotion-events/editor-actions.test.ts` | Pass after one targeted `--write` format pass on `editor-actions.test.ts`. |
| `git diff --check` | Pass. |
| `bun run wiki:lint` | Pass: 0 errors, 3 pre-existing stale-frontmatter warnings (`architecture/data-model.md`, `knowledge/wiki/aliases-and-canonical-ids.md`, `knowledge/wiki/repo-truth-index.md`). |

## Open decisions / blockers

- Petey grill locked the next autonomous `petey-plan-0305` run defaults:
  1. Resume from the already-landed Phase 2 work and move into the current Phase 3 continuation.
  2. Optimize the 3-session run for Phase 3 public/editor lineage utility, with trophy.so proof in Run 3.
  3. Use `scripts/auto-session-codex.sh 3` as the local Codex stacked-PR runner.
- Trophy.so is allowed and in play. Specifics grill outcome so far: add a lightweight persistence model for
  achievements/points, kept intentionally simple. Because this introduces Prisma work, Run 3 must perform Cody
  schema pre-flight and its stacked PR needs human review before merge.

## Next session

### Goal

Set up or begin a 3-session autonomous Codex continuation of `docs/petey-plan-0305.md`, resuming from the
already-landed Phase 2 motion work and targeting Phase 3 lineage utility slices.

### Inputs to read

- `docs/petey-plan-0305.md`
- `docs/runbooks/design/motion-system.md`
- `docs/runbooks/dev-environment/autonomous-sessions.md`
- `scripts/auto-session-codex.sh`
- `apps/web/components/web/lineage/lineage-tree-canvas.tsx`
- `apps/web/components/web/lineage/lineage-profile-drawer.tsx`
- `docs/knowledge/wiki/custom-component-inventory.md`

### Autonomous Codex draft

Stage the next run as 3 sessions:

1. **Run 1 — Phase 3c actions menu + browser proof:** Add or finish capability-gated per-card/row
   `LineageMemberActionsMenu` affordances where they are still absent; verify public read-only behavior and
   dashboard/editor behavior separately.
2. **Run 2 — Phase 3d persistent profile panel:** Convert the lineage profile drawer into mobile bottom-sheet
   plus desktop persistent side panel, including promotion-history visibility and belt-rail Mode B.
3. **Run 3 — Trophy.so gamification proof:** Install isolated trophy.so/shadcn vendor components per
   `docs/petey-plan-0305.md` Phase 4 strategy, vet imports against Base UI/Dirstarter primitives, add a simple
   achievements/points persistence model, and wire the first rank-progression proof into the lineage profile
   panel/persistent drawer. Keep the model minimal and backed by existing `RankAward`/lineage facts; do not
   invent a broad gamification engine.

### First task

Run a quick preflight on `scripts/auto-session-codex.sh 3` inputs. The first autonomous session should bow in
against `docs/petey-plan-0305.md`, run Graphify queries over lineage canvas/drawer/action-menu/panel terms, and
create task IDs before any UI edits. Run 3 must re-read schema migration runbooks and treat the trophy.so
persistence slice as schema work, not just UI.

## Review log

### SESSION_0327_REVIEW_01 — Promotion-events test shim close review

- **Reviewed tasks:** SESSION_0327_TASK_01, SESSION_0327_TASK_02, SESSION_0327_TASK_03
- **Dirstarter docs check:** not applicable
- **Sources:** local SOP `docs/runbooks/sops/sop-test-writing.md` section 3b; local source files listed in
  the Graphify check.
- **Verdict:** Pass. The failure was not production cache behavior; it was a partial test mock colliding with
  Bun's shared directory-run module resolution. The fix aligns both promotion-events tests to the documented
  full `next/cache` mock seam and proves the directory command that previously failed.
- **Score:** 9.7/10
- **Follow-up:** Complete the trophy.so specifics grill, then preflight or launch `scripts/auto-session-codex.sh 3`.

## Hostile close review

### SESSION_0327 — Promotion-events next/cache test shim

#### Review

**SESSION_0327_REVIEW_01 — Promotion-events test shim close review**

- **Reviewed tasks:** SESSION_0327_TASK_01, SESSION_0327_TASK_02, SESSION_0327_TASK_03
- **Dirstarter docs check:** not applicable
- **Sources:** `docs/runbooks/sops/sop-test-writing.md`, `apps/web/lib/safe-actions.ts`,
  `apps/web/server/web/promotion-events/queries.test.ts`,
  `apps/web/server/web/promotion-events/editor-actions.test.ts`
- **Verdict:** Giddy pass: scoped test-harness fix, no production action-client bypass, no schema or auth drift,
  and branch/worktree stayed on `main`. Doug pass: the exact failing command was reproduced first and then
  verified green in both sequential and parallel directory modes. Desi not applicable: no UI touched.
- **Kaizen aggregate:** 9.6/10 — test-only seam alignment with focused proof and no user-facing behavior change.

#### Findings

No findings severity >= medium.

#### Kaizen questions

- **Safe and secure?** Yes for this slice. It changes only Bun test mocks and does not expose new data,
  authorization paths, or production cache behavior. The focused directory tests prove the previously broken
  import path and the promotion-event editor assertions.
- **Failed steps prevented?** One likely FS-0020 repeat was prevented by using Graphify before search-heavy
  discovery. The main process gap was that the partial mock already contradicted the local SOP; the direct
  mitigation is to keep action/query tests on the complete `next/cache` mock seam.
- **Scale confidence:** 100: 10/10, 1,000: 9.8/10, 10,000: 9.6/10. This is a test-runner fixture seam, not a
  runtime scalability path; remaining risk is only future tests adding partial mocks again.

## Reflections

- The direct file run passing while the directory run failed was the useful signal: it pointed away from
  editor-action production code and toward Bun's shared module registry across test files.
- The local test-writing SOP already had the correct full `next/cache` mock. This was a conformance fix, not a
  new pattern.
- The next autonomous 0305 run is now materially staged: resume after Phase 2, use the Phase 3 utility path,
  run through `scripts/auto-session-codex.sh 3`, and include trophy.so in Run 3 after a short specifics grill.

## ADR / ubiquitous-language check

- ADR: not needed. No architecture decision changed; no Dirstarter baseline layer was replaced.
- Ubiquitous language: not needed. No domain term was added or redefined.
- Custom component inventory: checked; not updated because no UI component changed.
- Wiring ledger: checked; not updated because this did not surface or resolve app wiring debt beyond a local
  test mock conformance gap.

## Full close evidence

| Step | Proof |
| --- | --- |
| SESSION-file gate | Task log contains SESSION_0327_TASK_01 through SESSION_0327_TASK_03. |
| JETTY/frontmatter sweep | `docs/sprints/SESSION_0327.md` created with current frontmatter; `docs/knowledge/wiki/index.md` updated to 2026-06-02 / `codex-session-0327`; `docs/runbooks/dev-environment/autonomous-sessions.md` updated to 2026-06-02 / `codex-session-0327`. Code test files have no frontmatter. |
| Backlinks/index sweep | `docs/knowledge/wiki/index.md` now includes SESSION_0327; no new cross-reference pages were created. |
| Wiki lint | `bun run wiki:lint` passed with 0 errors and 3 pre-existing stale-frontmatter warnings (`architecture/data-model.md`, `knowledge/wiki/aliases-and-canonical-ids.md`, `knowledge/wiki/repo-truth-index.md`). |
| Kaizen reflection | Present in `## Reflections` and hostile close Kaizen questions. |
| Hostile close review | `SESSION_0327_REVIEW_01` present; no findings severity >= medium. |
| Review & Recommend | Next session goal, inputs, and first task written for the 3-session `petey-plan-0305` autonomous continuation. |
| ADR / ubiquitous-language check | No ADR, glossary, custom-component inventory, or wiring-ledger update needed; rationale recorded above. |
| Memory sweep | No operator memory update needed; the durable test-mock rule already exists in `docs/runbooks/sops/sop-test-writing.md` section 3b; Codex runner discovery is recorded in the session handoff and runbook. |
| Next session unblock check | Unblocked: `scripts/auto-session-codex.sh 3` is staged for Phase 3 utility slices with trophy.so allowed in Run 3; Run 3 includes a simple achievements/points persistence model and must trigger schema pre-flight/human PR review. |
| Git hygiene | FS-0024 guard passed: cwd `/Users/brianscott/dev/ronin-dojo-app`, remote `Ronin-Dojo-Design/ronin-dojo-baseline`, branch `main`, single worktree. Status before staging showed only the two promotion-events tests, wiki index, autonomous-sessions runbook, and SESSION_0327. Single push; hash reported at bow-out per FS-0025. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` ran before commit; `graphify stats` after refresh: 8976 nodes, 13812 edges, 1409 communities, 1542 files tracked. |
