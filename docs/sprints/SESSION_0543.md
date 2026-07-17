---
title: "SESSION 0543 — PR #210 merge-readiness + architecture routing"
slug: session-0543
type: session--review
status: closed
created: 2026-07-16
updated: 2026-07-16
last_agent: claude-recovery-of-codex-session-0543
sprint: S12
pairs_with:

  - docs/sprints/SESSION_0542.md
  - docs/architecture/decisions/0047-promoter-as-placeholder-recruited-coach-identity.md
  - docs/knowledge/wiki/wiring-ledger.md
  - docs/protocols/pr-review-score-fix-loop.md
  - docs/protocols/hostile-close-review.md
  - docs/runbooks/dev-environment/verification-and-testing.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0543 — PR #210 merge-readiness + architecture routing

## Date

2026-07-16

## Operator

Brian + codex-session-0543

## Goal

Make draft PR #210 merge-ready through the ordered review/score/fix, hostile-close, fallow, and code-quality
passes; hold at every new-push, merge, deploy, and data-mutation gate; then grill and route one architecture
deepening direction without duplicating an existing epic or goal.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md). Do
not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0542.md`.
- Carryover: SESSION_0542 integrity-hardened the belt promoter-review and local database-safety slice, pushed nine
  earlier commits under a now-spent authorization, and opened draft PR #210. Its final local handoff commit
  `c36b6d0c` preloaded this session's five-task order and architecture shortlist but deliberately did not start or
  bow in SESSION_0543.
- Live PR snapshot at bow-in: remote head `0732d81a`; draft, open, mergeable/clean; all CI, three Playwright jobs,
  Vercel, and CodeRabbit status checks green. CodeRabbit skipped its review because the PR is draft; no human
  reviews are present.

### Branch and worktree

- Branch: `session-0542-belt-review-remediation`.
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`.
- Status at bow-in: clean committed tree, one local docs-only handoff commit ahead of
  `origin/session-0542-belt-review-remediation`; no uncommitted carryover.
- Current HEAD at bow-in: `c36b6d0c`.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Authentication/server-action boundary, Prisma/database workflow, and Vercel hosting/deploy behavior |
| Extension or replacement | Extension: review and harden the existing Dirstarter-derived auth, Prisma, test, and deploy seams; no baseline capability is being replaced |
| Why justified | Credential provenance and database-target safety require stricter domain and execution guards while retaining the purchased framework shape |
| Risk if bypassed | A client-callable trust helper, stale review mutation, wrong effective database target, or unsafe migration order could pass shallow review and corrupt identity or local data |

Live docs checked during planning on 2026-07-16: Dirstarter Authentication, Prisma Setup, Postgres Hosting, and
Deployment pages all returned HTTP 200 with their current titles. Exact implementation alignment will be
rechecked before any confirmed fix is written.

### Graphify check

- Graph status: current for the application diff; the only post-refresh HEAD delta is the docs-only SESSION_0542
  handoff commit. Stats at bow-in: 17,418 nodes, 34,230 edges, 2,253 communities, 2,683 files tracked.
- Query used:
  - `RankEntry promoter proposal review database verification target` (`--budget 1500`)
- Files selected from graph and then confirmed on disk:
  - `apps/web/server/belt/promoter-proposal-core.ts`
  - `apps/web/server/identity/repoint-promoter-identity.ts`
  - `apps/web/server/admin/rank-reviews/**`
  - `apps/web/app/app/belt-reviews/**`
  - `apps/web/scripts/e2e-db-env.ts`
  - `apps/web/scripts/seed-target-guard.ts`
- Verification note: the graph traversal was broad, so Graphify is navigation only; the PR diff, exact source,
  current SoT set, ADR 0047, and runtime/test evidence remain authoritative.

### Grill outcome

- Tasks 1–4 retain SESSION_0542's locked order and have no bow-in fork: PR review → hostile residuals → fallow →
  code-quality.
- Task 5 retains the explicit operator fork. The completed architecture report is input only; the scan will not be
  rerun, and no Goals Ledger edit occurs until Brian selects a direction after the shortlist is grilled.
- The prior push authorization is spent. Local review, tests, edits, staging, and commit are allowed; push, merge,
  deploy, PR-state mutation, WL-P1-9 contract deployment, and D-047 cleanup are not authorized.

## Petey plan

### Goal

Produce three reviewable deliverables: a merge-readiness verdict for PR #210, evidence-backed fallow/code-quality
results with only confirmed local fixes, and one operator-selected architecture route.

### Tasks

#### SESSION_0543_TASK_01 — PR review → score → fix loop on PR #210

- **Agent:** Petey orchestrator with independent Cody, Doug, Giddy, and Desi lenses.
- **What:** Refresh every live check, review, and comment; review the full `origin/main...HEAD` intent/diff; score
  correctness, security, architecture, UX, runtime evidence, and merge shape; apply only confirmed PR-owned fixes.
- **Steps:**
  1. Inventory the live PR head, checks, reviews, comments, and local-vs-remote ancestry.
  2. Dispatch independent read-only review lenses and reconcile their evidence against exact source.
  3. Fill Cody pre-flight before any code edit, make only confirmed fixes, and re-run affected gates.
  4. Emit the strict binary accelerator, reviewer scores, top-three improvements, Petey triage, and Giddy gate.
- **Done means:** `READY (pending operator go)` or `KEEP_AS_IS` with a named blocker is recorded. The PR is not pushed,
  merged, deployed, or changed from draft without separate authorization.
- **Depends on:** nothing.

#### SESSION_0543_TASK_02 — Hostile-close residual audit

- **Agent:** Giddy + Doug, orchestrated by Petey.
- **What:** Rerun the hostile-close questions on the live PR/local head and reconcile every SESSION_0542 residual.
- **Steps:** preserve WL-P1-9 behind expand-deploy/old-writer drain; keep D-047 backup-first and scratch-proven;
  leave WL-P2-51 with its existing owner; retain Graphify ghost nodes as tool-index debt until supported prune.
- **Done means:** every confirmed residual is fixed, explicitly accepted, or routed to its canonical existing owner;
  no code or data mutation is inferred from a ledger note.
- **Depends on:** SESSION_0543_TASK_01.

#### SESSION_0543_TASK_03 — Fallow-fix loop on the PR diff

- **Agent:** Cody + Giddy.
- **What:** Baseline `origin/main...HEAD`, separate introduced from inherited debt, measure dead code, duplication,
  complexity/CRAP, and render/runtime coverage, then fix only confirmed PR-owned regressions.
- **Done means:** no introduced dead code or duplication remains without an accepted reason; complexity is no worse;
  touched behavior is proven; the before→after fallow delta is recorded.
- **Depends on:** SESSION_0543_TASK_02.

#### SESSION_0543_TASK_04 — Code-quality matrix on the PR diff

- **Agent:** Giddy + Cody + Doug + Desi.
- **What:** Score promoter workflow, belt-review queue, and database-safety work separately against D1–D7, apply
  matrix caps, remediate the smallest confirmed gaps, and reverify/rescore.
- **Done means:** each unit has an evidence-backed composite and Apple/Facebook verdict; every sub-9.5 gap is fixed
  or routed; headless and runtime proof is current.
- **Depends on:** SESSION_0543_TASK_03.

#### SESSION_0543_TASK_05 — Select and route the architecture deepening candidate

- **Agent:** Petey + Giddy, with Brian selecting the direction.
- **What:** Use `/tmp/architecture-review-20260716-113052.html` and the durable SESSION_0542 shortlist; grill the
  RankEntry epic projection, count-neutral DB verification goal, promoter-law consolidation, database-target
  routing, and promoter-review state consolidation without rerunning the scan.
- **Done means:** Brian selects a direction and the session either writes the correctly scoped canonical ledger row
  or records why no Goals Ledger change is warranted.
- **Depends on:** SESSION_0543_TASK_04.

### Parallelism

The task order is sequential because each pass consumes the prior pass's exact head and evidence. Within TASK_01,
the Cody, Doug, Giddy, and Desi review lenses are genuinely disjoint and may run concurrently as read-only reviews;
Petey reconciles them before any shared-file edit. Any fixes are serialized in this canonical worktree. There is
only one open PR, so the per-PR worktree fan-out rule does not apply.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0543_TASK_01 | Petey + Cody/Doug/Giddy/Desi | Cross-cutting schema, authz, UI, test, and merge-readiness review requires independent lenses |
| SESSION_0543_TASK_02 | Giddy + Doug | Adversarial architecture and release/data residual ownership |
| SESSION_0543_TASK_03 | Cody + Giddy | Measured implementation cleanup plus structural scope control |
| SESSION_0543_TASK_04 | Giddy + Cody/Doug/Desi | D1–D7 architecture, correctness, runtime, and UX scoring |
| SESSION_0543_TASK_05 | Petey + Giddy + Brian | Architecture direction is an operator decision after evidence-backed grilling |

### Open decisions

- Whether PR #210 should be converted from draft and CodeRabbit/human review triggered after the local verdict.
- Which architecture deepening direction, if any, should enter the Goals Ledger in TASK_05.
- Every push, merge, deploy, or external PR-state mutation requires a fresh explicit operator authorization.

### Risks

- Remote PR checks prove `0732d81a`, while local HEAD also contains the docs-only handoff commit `c36b6d0c` and
  will gain SESSION_0543 work; any local fix invalidates the remote-green snapshot until a separately authorized
  push reruns CI.
- DB-backed tests must remain count-neutral on `ronindojo_prodsnap`; destructive/adversarial database proof belongs
  only on a literally named guarded scratch/E2E target. FS-0032's effective-child-target failure is acknowledged.
- The GAP_MATRIX and parts of the older lineage hub are point-in-time/stale; current SoT set + accepted ADR 0047 +
  live code/app win.

### Scope guard

- Do not push, merge, deploy, mark the PR ready, trigger external reviews, or mutate external PR state without the
  operator's separate word.
- Do not execute WL-P1-9, clean D-047 fixture rows, mutate prodsnap, or convert Graphify ghosts into recreated docs.
- Do not rerun the architecture scan or create a new goal before TASK_05's grill and operator selection.
- Do not pull unrelated board/ledger items into this PR lane; the explicit SESSION_0542 handoff has precedence.

### Dirstarter implementation template

- **Docs read first:** live Dirstarter Authentication, Prisma Setup, Postgres Hosting, and Deployment pages checked
  2026-07-16; BBL SoT set, ADR 0047, schema-migration runbook, and verification runbook loaded.
- **Baseline pattern to extend:** Better-Auth/oRPC permission boundary, server-only domain cores, Prisma versioned
  expand/contract migrations, guarded Bun/Prisma launchers, and Vercel prebuild deploy ordering.
- **Custom delta:** immutable promoter proposals, atomic Passport→Award→Review locking, count-neutral DB-backed
  fixtures, and literal effective-target guards for BBL verification work.
- **No-bypass proof:** no baseline layer is replaced; confirmed fixes must preserve the existing action/auth chain,
  Prisma migration discipline, and deploy gate.

## Cody pre-flight

### Pre-flight: BeltReviews moderation queue

#### 1. Existing component scan

- Searched `components/web/`, `components/common/`, `components/data-table/`, and `components/admin/` for
  `AdminCollection`, `DataTableColumnHeader`, `DataTableSkeleton`, column visibility, and view options.
- Found and will extend/combine the existing `AdminCollection`, `DataTableColumnHeader`, and
  `DataTableSkeleton`; no new component is warranted.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md` and
  `docs/knowledge/wiki/dirstarter-docs-inventory.md`: yes.
- Searched the read-only Dirstarter checkout for `data-table-column-header` and `data-table-skeleton`.
- Closest L1 patterns:
  - `components/data-table/data-table-column-header.tsx` — the header becomes plain text only when both
    `column.getCanSort()` and `column.getCanHide()` are false.
  - `components/data-table/data-table-skeleton.tsx` — the caller must describe its real column/filter/view-option
    surface through props.
- Primitive/API spot-check:
  - `DataTableColumnHeader(column, title, ...DropdownMenuTrigger props including className)`; behavior is driven by
    the column definition's `enableSorting` and `enableHiding` flags.
  - `DataTableSkeleton(title?, columnCount?, rowCount?, searchableColumnCount?, filterableColumnCount?,
    showViewOptions?, cellWidths?, withPagination?, shrinkZero?, ...div props)`.
  - `AdminCollection(title, total?, callToAction?, data, columns, pageCount, filterFields?, sorting?, pageSize,
    initialState?, getRowId?, enableRowSelection?, children?, emptyState?, floatingBar?)`.

#### 3. Composition decision

- [x] Extending existing components: set the fixed queue's four column capabilities explicitly and configure the
  existing skeleton to match the settled four-column, no-filter, no-view-options surface.
- [ ] New component.

#### 4. Lane docs loaded

- [x] SESSION_0542 `Next session`, current BBL SoT set, ADR 0045, ADR 0047, and the current queue/detail source.
- [x] Dirstarter component/docs inventories and the local read-only L1 component implementations.
- [x] `docs/runbooks/sops/sop-test-writing.md` before modifying tests.

#### 5. Dev environment confirmed

- Dev server: `npx next dev --turbo` from `apps/web`; test host is BBL on `localhost:3000`.
- Canonical verification is `bun run typecheck`, `bun run lint:check`, `bun run format:check`, and `bun run test`
  from `apps/web`.
- A pre-flight focused probe incorrectly invoked six files through one bare `bun test` command. Although it was
  20/20 green, FS-0027 says multi-file/mock isolation evidence must use the package's `--parallel=1` path. That
  probe is non-canonical and will be superseded by `bun run test`; no conclusion depends on it.

#### 6. FAILED_STEPS check

- Relevant failures: FS-0027 (Bun mock leakage / bounded parallelism) and WL-P2-51's inherited shell hydration
  warning.
- Mitigation: use the canonical full-suite runner and do not claim a clean console for the inherited warning.

### Pre-flight: Backend — review decisions, review-history deletion, and DB target guards

#### 1. Auth predicates and destructive-boundary policy

- [x] Review decisions require an authenticated session.
- [x] Review decisions use the same global `can(user, APP_AREA_PERMISSIONS.beltReviews)` predicate as the
  `/app/belt-reviews` layout and sidebar; no organization membership applies to this platform-level permission.
- [x] Brand is server-fixed to `Brand.BBL`; RankEntry/RankAward/RankEntryReview are not tenant-filtered models.
- [x] Local E2E/seed execution must parse a PostgreSQL URL, require an approved loopback authority, require the
  exact disposable database, and require `DATABASE_URL`/`DIRECT_URL` to resolve to the same effective target.
- [x] Raw Playwright entry must fail before global fixture setup; CI may use only its explicitly pinned local
  `ronindojo_test` target.

#### 2. Existing implementation scan

- Consulted `docs/architecture/dirstarter-baseline-index.md`: yes; retain the existing next-safe-action and Prisma
  shapes rather than mass-migrating this PR.
- Searched `lib/safe-actions.ts`, `server/orpc/{permissions,roles}.ts`, `server/belt/router.ts`,
  `server/belt/promoter-proposal-core.ts`, `scripts/e2e-db-env.ts`, `scripts/seed-target-guard.ts`, and
  `e2e/{global-setup,helpers/**}`.
- Related seams:
  - `userActionClient` + the repo-extended `can()` permission matcher (including FI-019 `extraGrants`).
  - `lockRankAward` / `hasLockedRankEntryReviewHistory` under the ADR 0047 Passport→Award→Review law.
  - `assertLiteralLocalE2eUrls` / `e2ePrismaChildEnv` and the Playwright global fixture boundary.
- L1 match: Dirstarter's action-client chain and oRPC permission matcher remain the baseline; Ronin's existing
  extra-grant and fixed-BBL extensions are reused. No fifth auth system and no second database policy are added.

#### 3. Data/lifecycle references

- [x] `sop-data-and-wiring-flows.md`: browser → Better Auth session → role/`can()` scope → transaction core →
  Prisma/Postgres; brand remains server-resolved BBL.
- [x] `sop-e2e-user-lifecycle.md`: authenticated operator decision and member credential lifecycle. Its older rank
  prose is subordinate to the loaded BBL SoT set and ADR 0047 for this promoter-proposal slice.
- [x] `sop-test-writing.md`: pure adversarial validator tables, wrapped safe-action auth gates, deterministic
  concurrency schedules, and count-neutral/rolled-back DB proof where the seam permits it.

#### 4. FAILED_STEPS and manual boundaries

- Relevant failures: FS-0024 (git target guard), FS-0027 (test runner isolation), FS-0031 (local/CI E2E parity),
  and FS-0032 (Prisma effective-child-target drift).
- Mitigation: no destructive DB command; pure guards first; all DB-backed verification count-neutral; inspect both
  effective URLs; `pwd` + remote guard before any later mutating git; canonical full-suite runner.
- Manual Boundary Registry entries: none directly govern this local DB/review slice; MB-007 remains the separate
  staging-deploy proof boundary and is not changed.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0543_TASK_01 | completed | All-hands loop reached `INTEGRATE_PASS`; local verdict is READY pending operator go, fresh push authorization, and CI on the pushed head |
| SESSION_0543_TASK_02 | completed | Hostile audit accepted or routed every residual; Kaizen aggregate 9.0 permits the fallow pass |
| SESSION_0543_TASK_03 | completed | Introduced dead code reached zero; confirmed lock/recovery/state defects were fixed; current-head Chromium was infrastructure-blocked and is recorded without a false pass |
| SESSION_0543_TASK_04 | completed | Code-quality matrix scored the three units at 9.05 / 9.1 / 9.4 (all Strong, no capped failure); no sub-9.5 fix warranted — residual complexity is tooling-script or documented essential orchestration already routed by TASK_03 |
| SESSION_0543_TASK_05 | parked | Architecture-route selection deferred to a later session by operator (recovery-pass decision); no Goals-Ledger edit this session |

## What landed

### TASK 01 — review/score/fix loop

- Hardened the local E2E and seed target boundary to accept only PostgreSQL loopback authorities, reject endpoint
  overrides, require normalized `DATABASE_URL`/`DIRECT_URL` parity, and pin local/CI to the exact disposable
  database names. Raw Playwright setup and the legacy auth/tournament bridges now fail before Prisma-backed work.
- Closed the RankEntry deletion race by locking the parent RankEntry before reading immutable review history.
- Aligned review actions with the layout/sidebar permission contract: `belt.admin` can arrive through the normal
  role grants or FI-019 `extraGrants`, while the server still pins `Brand.BBL`.
- Corrected the fixed queue surface: non-hideable/non-sortable relation columns render honestly, and the loading
  skeleton now matches the real four-column/no-filter/no-view-options collection.
- Replaced the queue's unnecessary read-only list/count transaction with the existing SESSION_0154 parallel-read
  helper after cold E2E exposed `P2028` transaction acquisition; pagination drift remains acceptable by the
  ratified admin-list policy.
- Added a guarded, cleanup-owned Chromium lifecycle proving queue → detail → confirmation cancel/no-write →
  approve/apply/verify → terminal state plus the three audit actions. Both coaches are account-backed established
  identities, matching ADR 0047 rather than bypassing the domain with placeholder Passports.
- Corrected one inherited onboarding fixture discriminator whose first-16-character truncation discarded all
  timestamp entropy and made interrupted runs collide for months.

### TASK 02 — hostile residual audit

- Reconciled every known residual with its canonical owner without executing rollout or cleanup work. WL-P1-9
  remains rollout-gated, D-047 owns exact tagged local residue, WL-P2-51 retains the inherited shell warning,
  Graphify ghosts remain tool-index debt, database-target consolidation routes to G-002/wiring, promoter lock law
  routes to the RankEntry epic/quality lane, and promoter-review state routes to fallow/code-quality.
- Updated D-047 with the exact interrupted-run state: 41 Users / 22 Organizations / 138 Passports / 0 reviews,
  including the four tagged fixture families. No prodsnap cleanup occurred.

### TASK 03 — fallow-fix loop

- Removed the unused `PromoterReviewDetail` export and centralized open-review/trust-state law in
  `lib/belt/review-state.ts`.
- Closed the direct Verify bypass: standalone verification now locks the canonical promoter workflow and refuses
  an open promoter proposal before changing the entry, award, review, or audit trail.
- Added exact promoter-identity merge manifests, lock-only preflight, count-checked repointing, captured-only
  rollback restoration, and versioned migration recovery evidence. The older lineage cleanup now fails closed
  instead of repointing promoter edges without recoverable proof.
- Closed the Passport-claim versus user-deletion deadlock by acquiring the full sorted Passport→User merge scope
  before claim writes and revalidating identity ownership under the locks.
- Extracted promoter-reference and sibling-fact helpers, split the router's registered/named promoter and school
  resolvers without changing the transaction boundary, made the promoter selector non-clearable, and moved detail
  branching into a six-case pure state classifier.
- Fallow delta over `origin/main`: introduced dead code **1→0**, introduced duplication groups **27→25**, and
  introduced complexity findings **10→8**. Total clone groups fell **111→106** and total complexity findings
  **41→39**. Remaining DB-target parser duplication stays under G-002/wiring; transaction/page orchestration and
  test/CLI clones are accepted or inherited with focused proof.

## Decisions resolved

- **Recovery-session operator decisions (salvage of crashed codex-session-0543):** (1) the uncommitted 0543
  diff is the salvage target — no further crash-hunting; (2) adopt-and-finish `SESSION_0543.md` rather than mint a
  0544; (3) the 0541 lane is done — `session-0542` (PR #210) is the umbrella carrying 0541+0542+0543, `ronin-0541`
  left untouched; (4) finish TASK_04 code-quality, park TASK_05 architecture route; (5) **push authorized** — the
  3 salvage commits were pushed to update draft PR #210 and re-run CI on head `562b9607`. PR #210 stays draft;
  mark-ready/merge/deploy remain separate operator decisions.
- **Local PR verdict:** `READY (pending operator go)`. No push, draft-state change, review trigger, merge, deploy,
  or external mutation occurred.
- **Review gate mode:** `all_hands` because the branch contains schema/migration, auth, database-safety, concurrency,
  and UI work.
- **Final binary accelerator:** `right_code_for_intent=yes`, `code_cleanliness=yes`,
  `performs_intended_function=yes`.
- **Final scores:** Cody 9.8, Doug 9.8, Giddy 9.7, Desi 9.6; mean **9.725/10**.
- **Giddy decision:** `INTEGRATE_PASS`; strict gate status `PASS` locally. Fresh remote CI remains mandatory after
  an authorized push because the remote checks cover `0732d81a`, not this worktree.
- **Required top three:** (1) output type — no correction, `doc_and_code` is correct; (2) intent alignment — resolved
  by making the browser fixture use established coaches; (3) functional/correctness — resolved by guarding the
  direct auth bridge and completing focused final-path verification.
- **Petey triage:** yes, this is the intended promoter-review/database-safety slice; yes, the code/docs/ADR live on
  the correct branch and canonical seams; the confirmed PR-owned gaps were improvable and are now fixed, while
  architecture-scale consolidation is routed rather than pulled into the merge lane.
- **Hostile residual routing:** WL-P1-9 remains blocked behind the expand deploy and old-writer drain; WL-P2-51
  retains its existing shell owner; Graphify ghosts remain tool-index debt until supported pruning exists; D-047
  now records the exact 41/22/138 local residue state and keeps cleanup authorization separate. Database-target
  parser consolidation belongs under G-002/wiring, promoter lock-law consolidation belongs in the RankEntry epic or
  a quality pass, and review-state consolidation belongs in `/code-quality` or `/fallow-fix-loop`.

## Files touched

- `apps/web/server/admin/rank-reviews/**` and `app/app/belt-reviews/**` — permission parity, honest table/skeleton,
  parallel read-only pagination, and full browser lifecycle proof.
- `apps/web/server/belt/promoter-proposal-core{,.test}.ts` — RankEntry-before-review lock regression.
- `apps/web/scripts/{e2e-db-env,seed-target-guard,run-e2e-dev}*`, `e2e/global-setup.ts`, and E2E DB bridges — exact
  target authority and direct-entry refusal.
- `apps/web/lib/test/safe-action-env.ts` plus focused authorization/guard tests — FI-019 grant propagation and
  pre-Prisma adversarial proof.
- `apps/web/server/web/onboarding/actions.safe-action.test.ts` — entropy-preserving fixture code.
- `docs/sprints/SESSION_0543.md` — bow-in, evidence, review gate, and routing record.

## Verification

| Command / proof | Result |
| --- | --- |
| `bun run typecheck` | exit 0 on the final source shape |
| `bun run lint:check` | exit 0; only the known repository warning baseline |
| `bun run format:check` | 1,964/1,964 files formatted |
| `bunx prisma validate` | schema valid |
| `git diff --check` | exit 0 |
| canonical `bun run test` on prodsnap | 1,519 pass / 0 fail / 4,334 expectations; before/after counts held 34 users / 18 orgs / 134 Passports / 0 reviews |
| guarded `ronindojo_e2e` setup | exact local target; 79 migrations, none pending |
| final cold Chromium belt-review lifecycle | 1/1 pass after guard/fixture/P2028 fixes; tagged users/Passports/disciplines all returned to zero |
| late affected fixture owners | onboarding 3/3; lineage queries 33/33; lineage editor actions 17/17; isolated scratch runs restored their exact starting counts |
| direct raw `auth-db.ts` under default env | refused `ronindojo_prodsnap` before Prisma construction, as required |
| TASK_03 selected unit suites | 35 pass / 0 fail / 49 expectations; focused identity-helper/claim proof 5 pass / 0 fail / 9 expectations |
| TASK_03 targeted `oxlint`, `oxfmt --check`, and `git diff --check` | clean |
| TASK_03 full `bun run typecheck` retry | inconclusive: remained CPU-active for more than 21 minutes with no diagnostic and was interrupted; TASK_01's earlier final-head-at-that-time typecheck remains green but is not relabeled as current-head proof |
| TASK_03 current-head Chromium reruns | infrastructure-blocked before a product assertion: Playwright web-server gate timed out after a 12.7-minute cold `/`; a retry expired the 30-second fixture transaction after 48.6 seconds; a third run seeded and authenticated but the 90-second total expired during a route that returned 200 in 52 seconds; final `/cookies` prewarm produced no bytes in 300 seconds |
| guarded E2E residue after blocked reruns | fixture-owned cleanup on literal `ronindojo_e2e`; tagged Users / Passports / Disciplines all read back as 0 / 0 / 0 |
| **recovery pass** `bun run typecheck` on `3b6a800a` | **exit 0 — no hang this run** (resolves TASK_03's 21-min inconclusive typecheck) |
| **recovery pass** `format:check` | 1969/1969 files formatted |
| **recovery pass** `lint:check` (`oxlint .`) | exit 0; baseline warnings only, none in any belt-review / rank-reviews / promoter file |
| **recovery pass** `next build` | ✓ compiled in 2.4min; 207/207 static pages generated; no RSC/`"use server"` boundary error |
| **recovery pass** isolated `--parallel=1` pure tests | 21 pass / 0 fail / 61 expect across e2e-db-env, seed-target-guard, playwright-global-setup, belt-review-detail-state, rank-reviews authorization |
| **recovery pass** DB-concurrency + live e2e | deferred to CI on the eventual authorized push (local Chromium infra-block persists; count-mutating DB suites not re-run locally under the no-mutation rule) |

Two supplemental full-suite attempts on a disposable scratch clone hit unrelated default-five-second setup hooks at
5.27s and 5.07s. Each owning file passed immediately in isolation and was count-neutral; the scratch database was
dropped. The clean canonical suite predates only the later queue-read/E2E/test-fixture edits, each of which has direct
focused proof above. Fresh CI on the eventual pushed head remains the authoritative remote rerun.

The overloaded aborted prodsnap attempt left clearly tagged test residue: +7 Users, +4 Organizations, and +4
Passports relative to the 34/18/134 baseline. Per the verification runbook this was **not** deleted ad hoc; TASK_02
routes it to D-047's backup-first, prefix-scoped cleanup lane.

## Open decisions / blockers

- Local commit remains allowed under the session workflow, but has not been performed; a fresh, explicit
  per-push authorization is required before any push.
- PR #210 remains draft. Mark-ready, CodeRabbit review trigger, human review request, merge, and deploy are all
  separate operator decisions.
- Remote PR snapshot after the local gate: open draft, mergeable, remote head `0732d81a`; all nine reported status
  contexts/checks green, no reviews, no inline review comments, and CodeRabbit intentionally skipped the draft.
- D-047 owns the interrupted-test residue; no cleanup is authorized in this session.

## Next session

### Goal

Disposition draft PR #210 and run the parked TASK_05 architecture-route grill. Once CI is green on head
`562b9607`, decide with the operator whether to mark PR #210 ready (→ CodeRabbit/human review) and merge
(merge = prod-deploy trigger — held separately). Then grill the SESSION_0542 architecture shortlist and route
at most one Goals-Ledger direction.

### Inputs to read

- This file (`SESSION_0543.md`) — the salvaged review/fallow/code-quality record and the recovery close.
- PR #210 CI result on head `562b9607` (the authoritative e2e + DB-concurrency gate deferred locally).
- `/tmp/architecture-review-20260716-113052.html` (if still present) + the SESSION_0542 architecture shortlist.
- ADR 0047 (promoter-as-placeholder) and `SESSION_0542.md`.

### First task

Confirm PR #210 CI is green on `562b9607`. If green and the operator gives the word: mark PR #210 ready, trigger
review, and decide the merge (prod deploy). If CI is red, triage the failing check on the branch (Playwright e2e /
unit-test / typecheck) before any state change. Do NOT rerun the architecture scan — grill the existing shortlist.

## Review log

### TASK 01 — all-hands pass 1

- Cody 8.2: found remote/split DB authority acceptance, the RankEntry/review deletion race, and action/layout RBAC
  mismatch.
- Doug 8.1: independently confirmed raw Playwright target risk, RBAC mismatch, and missing durable browser proof.
- Giddy 9.3 / Desi 9.2: found misleading table capabilities and a five-column/filter/view-options skeleton for a
  four-column fixed queue. Mean 8.7; Giddy chose `KEEP_AS_IS_AND_IMPROVE`.

### TASK 01 — final all-hands pass

- Cody 9.8: no P0–P3 findings; all binaries yes; `INTEGRATE_PASS`.
- Doug 9.8: no P0–P3 findings; rollout/migrations remain expand-safe; READY pending operator authorization, push,
  and fresh CI.
- Giddy 9.7 / Desi 9.6: no integration blocker; responsive/semantic detail and confirmation are sound; final exact
  Giddy decision `INTEGRATE_PASS`.
- Accepted routed improvements: project RankEntry unification into the Goals Ledger; place DB-target consolidation
  under G-002/wiring; keep promoter lock-law and review-state consolidation in their existing architecture/quality
  lanes.

### TASK 02 — hostile residual pass

- Giddy found no architectural bypass: the implementation extends the existing Dirstarter auth, Prisma,
  component, and deploy seams. The durable database contract remains deliberately owned by WL-P1-9, not hidden in
  application prose.
- Doug accepted the lifecycle and focused proof while recording two external gates as unproven on this local head:
  the eventual contract migration after old-writer drain and fresh remote CI after an authorized push.
- Residuals were routed without executing them: D-047 owns local fixture cleanup, WL-P2-51 owns the inherited shell
  hydration warning, and unsupported Graphify ghost pruning remains tool-index debt. Hostile/Kaizen aggregate: 9.0,
  proceed.

### TASK 03 — fallow pass

- Baseline separated introduced from inherited debt before edits. The confirmed introduced dead export, direct
  Verify workflow bypass, unrecoverable promoter-edge migration path, claim/delete lock inversion, duplicated
  review-state law, oversized router resolver, clearable promoter UI, and detail-page branch state were fixed at
  their canonical seams.
- Objective delta: introduced dead 1→0, duplication 27→25, complexity 10→8; total clone groups 111→106 and total
  complexity findings 41→39. Accepted remainder is explicitly routed rather than scored away.
- Current-head focused behavior is green. Headless reruns did not reach a product assertion because this machine's
  Next/Turbopack filesystem and local DB latency exceeded three independent harness limits; the exact timings and
  zero-residue cleanup proof are recorded above. The earlier cold lifecycle remains 1/1 green, but it is not
  misrepresented as a post-fallow run.

### TASK 04 — code-quality matrix (completed in the Claude recovery/salvage pass)

Scored the three units against `code-quality-matrix` §2 on the freshly re-verified head (`3b6a800a`).
Evidence base: `bun run typecheck` exit 0 (no hang this run), `format:check` 1969/1969, `lint:check`
exit 0 (baseline warnings only), `next build` compiled 2.4min / 207 static pages, isolated
`--parallel=1` pure guard + classifier + authorization tests 21 pass / 0 fail. CRAP figures were read
complexity-only (no `--coverage` supplied → cyclomatic is the real signal; raw CRAP is inflated).

#### Unit 1 — Promoter workflow (Class B, ref ADR 0047 + belt-verification subsystem)

| Dim | Score | Note |
| --- | ---: | --- |
| D1 Correctness | 9 | lock-before-read race closed, fail-closed re-reads, manifest-verified rollback; typecheck/build green; DB-concurrency re-run deferred to CI |
| D2 Security/integrity | 9 | Passport→Award→Review lock law, count-checked repoint, immutable snapshot; WL-P1-9 DB contract rollout-gated + owned (no undocumented invariant) |
| D3 Simplicity | 9 | essential complexity only; extractable resolvers already split (TASK_03); the 91-line/10-cyclo tx callback is irreducible + fully invariant-commented |
| D4 Readability | 10 | exemplary lock-order / TOCTOU narration, `@why`/`@wired` headers |
| D5 Maintainability | 9 | structural tx port, small pure manifest helpers, testable |
| D6 Scalability | 8 | sorted sequential per-tier locks (pg adapter can't multiplex) — fine for a small promoter graph; 10k-row merge scope improbable |
| D7 Convention/reuse | 9 | extends belt/identity seams, ADR 0047 aligned, no unrecorded primitive |

**Weighted average:** 9.05 · **Cap applied:** none · **Composite: 9.05 / 10** · **Verdict:** Strong — ship with CI as the closing concurrency/e2e gate.

#### Unit 2 — Belt-review queue (Class B, ref belt subsystem + AdminCollection law)

| Dim | Score | Note |
| --- | ---: | --- |
| D1 Correctness | 9 | pure detail-state classifier + auth tests green this run; pages static-built; `belt-reviews.spec.ts` e2e → CI (local Chromium infra-blocked) |
| D2 Security/integrity | 9 | `belt.admin` permission parity, server-pinned `Brand.BBL`, authorization test green |
| D3 Simplicity | 9 | `review-state.ts` + `belt-review-detail-state.ts` extraction removed duplicated branching; honest columns/skeleton; residual detail-page JSX is essential multi-state render |
| D4 Readability | 9 | pure classifiers, `@why`/`@wired`, clear names |
| D5 Maintainability | 9 | centralized trust-state law, exhaustively tested pure classifier, parallel read-only pagination |
| D6 Scalability | 9 | parallel-read pagination (fixed P2028), small admin-queue N |
| D7 Convention/reuse | 9 | conforms AdminCollection law, reuses DataTableColumnHeader/Skeleton, no new component |

**Weighted average:** 9.1 · **Cap applied:** none · **Composite: 9.1 / 10** · **Verdict:** Strong — CI e2e closes it toward gold.

#### Unit 3 — Database safety (Class A, extends Dirstarter Prisma/hosting + test tooling)

| Dim | Score | Note |
| --- | ---: | --- |
| D1 Correctness | 10 | guard + parser tests ran green this run (21/21), pure and fully exercised |
| D2 Security/integrity | 10 | rejects non-Postgres, `?host=`/`?port=` overrides, non-loopback, non-literal DB name, and DATABASE_URL/DIRECT_URL divergence before Prisma construction; adversarially tested |
| D3 Simplicity | 9 | small clean guard functions; `run-e2e-dev.mjs localE2eTarget` launcher 10 cyclo is essential |
| D4 Readability | 10 | explicit rationale comments (the pg-connection-string authority-override bypass) |
| D5 Maintainability | 9 | `parseLocalPostgresTarget` / `assert*` / `e2ePrismaChildEnv` well-factored |
| D6 Scalability | 9 | pure string parsing, no runtime cost |
| D7 Convention/reuse | 8 | extends Prisma/test seams (no bypass); residual DB-target parser duplication routed to G-002/wiring |

**Weighted average:** 9.43 · **Cap applied:** none · **Composite: 9.4 / 10** · **Verdict:** Strong (near-gold) — only the routed DB-target parser duplication keeps it from clean gold.

#### Roll-up

| Unit | Composite | Verdict |
| --- | ---: | --- |
| Database safety | 9.4 | Strong (near-gold) |
| Belt-review queue | 9.1 | Strong |
| Promoter workflow | 9.05 | Strong |

**Mean 9.2 · no capped failure** (no regression; security proven + adversarially tested; verification
credible via green static gates + pure tests + prior all-hands render, live e2e → CI). **Fixes applied:
none.** Every residual is either essential documented complexity or already-routed duplication
(RankEntry epic = promoter lock-law; G-002/wiring = DB-target parser; fallow/code-quality = review-state).
Manufacturing an extraction from the concurrency-critical tx callback or the picker-options twin would
risk a behavior regression for no real gain — out of scope per the matrix's no-regression rule.

## Hostile close review

### SESSION_0543 — PR #210 merge-readiness + architecture routing

#### Review

**SESSION_0543_REVIEW_02 — Hostile residual reconciliation**

- **Reviewed tasks:** SESSION_0543_TASK_01, SESSION_0543_TASK_02
- **Dirstarter docs check:** live docs checked
- **Sources:** `https://dirstarter.com/docs/authentication`, `https://dirstarter.com/docs/prisma-setup`,
  `https://dirstarter.com/docs/postgres-hosting`, `https://dirstarter.com/docs/deployment`, the local Dirstarter
  inventories, ADR 0047, and the verification/schema-migration runbooks
- **Verdict:** aligned. This is locally merge-ready application work, not permission to merge. The slice extends the
  purchased auth, Prisma, server-action, component, and deployment seams; it neither replaces them nor pretends the
  deferred database contract has shipped. The remaining release gates are an authorized push with fresh CI and,
  later, WL-P1-9 only after the expand deploy and old writers have drained.

#### Eight hostile questions

1. **Plan sanity:** sound. Bow-in loaded the live baseline docs, current domain sources, exact diff, and known
   failure ledger before edits. The plan's only weak assumption—that direct helper entrypoints were already guarded—
   was falsified by review and fixed before the final score.
2. **Dirstarter compliance:** extension, not bypass. Better-Auth grants still enter through the existing safe-action
   chain; Prisma remains behind server-only transactional cores and guarded launchers; the deploy ordering is
   unchanged.
3. **Security:** authorization and target provenance are behaviorally proven. The queue uses the canonical
   `belt.admin` permission path with server-pinned BBL brand, and every known raw E2E DB bridge now refuses a
   non-literal, non-loopback, split, or protected target before Prisma construction.
4. **Data integrity:** application law is strong: immutable captured proposals, parent-before-child locks,
   conditional decision claims, and transaction-folded consequences are proven. The durable database constraint is
   intentionally not claimed; WL-P1-9 owns it after the compatibility window closes.
5. **Lifecycle proof:** yes. The cold Chromium path proves queue, detail, cancel/no-write, approval, promoter apply,
   verification, terminal UI, and all three audit records using established account-backed coach identities.
6. **Verification honesty:** credible, with failures exposed. Static gates, 1,519 canonical tests, focused late
   owners, adversarial guards, migration validation, and cold browser proof support the claim. Two scratch-suite
   five-second hook timeouts and one overloaded aborted prodsnap attempt are recorded, not laundered into a green
   statement; fresh remote CI is still required.
7. **Workflow honesty:** substantially followed, with three preventable process slips: one noncanonical bare
   multi-file probe, allowing reviewer workloads to overlap a canonical DB suite, and attempting a loaded prodsnap
   rerun instead of reserving an exclusive scratch verifier. The smallest prevention is one exclusive DB-verification
   lock/launcher that always provisions a disposable target and emits before/after counts.
8. **Merge readiness:** READY locally, pending operator go. It is not remotely merge-ready until a fresh push is
   explicitly authorized, CI runs on that head, and the operator separately changes draft/review/merge state.

#### Findings

**SESSION_0543_FINDING_01 — Contract invariant waits for the rollout gate**

- **Severity:** medium
- **Task:** SESSION_0543_TASK_02
- **Evidence:** `docs/knowledge/wiki/wiring-ledger.md` (`WL-P1-9`); ADR 0047
- **Impact:** until the expand release is live and old writers drain, the database cannot reject every invalid
  legacy promoter-proposal shape independently of the application.
- **Required follow-up:** execute WL-P1-9 as a separate authorized contract deployment after the recorded rollout
  preconditions are true.
- **Status:** accepted-risk

**SESSION_0543_FINDING_02 — Interrupted local fixtures reduce mirror fidelity**

- **Severity:** medium
- **Task:** SESSION_0543_TASK_02
- **Evidence:** `docs/knowledge/wiki/drift-register.md` (`D-047`); read-only count 41 Users / 22 Organizations / 138
  Passports / 0 reviews
- **Impact:** tagged fixture residue can skew future local integration queries even though production is untouched.
- **Required follow-up:** retain D-047's reviewed dependency inventory and backup-first, prefix-scoped, scratch-proven
  cleanup; obtain explicit data-mutation authorization before changing prodsnap.
- **Status:** open

**SESSION_0543_FINDING_03 — Architecture cleanup stays out of the merge lane**

- **Severity:** low
- **Task:** SESSION_0543_TASK_02
- **Evidence:** SESSION_0542 architecture shortlist; G-002; WL-P2-51; RankEntry unification epic
- **Impact:** duplicated DB-target parsing and dispersed lock/review-state law add maintenance cost but do not break
  the verified slice.
- **Required follow-up:** route DB-target consolidation under G-002/wiring, promoter lock law under RankEntry or a
  quality pass, and review-state consolidation through fallow/code-quality. Keep WL-P2-51 and Graphify ghosts with
  their existing owners.
- **Status:** accepted-risk

#### Kaizen reflection triage

1. **Safety and proof:** auth scope, effective DB target refusal, lock ordering, atomic review decisions, and the
   user lifecycle are behaviorally proven. The post-drain database contract and CI on the eventual pushed head are
   only documented gates; WL-P1-9 migration verification and the normal remote CI matrix close them respectively.
2. **Preventable failures:** three process slips were preventable: the noncanonical probe, concurrent reviewer/DB
   load, and a prodsnap rerun where an exclusive scratch target was safer. A single count-neutral verification
   launcher with an exclusive lock, scratch provisioning, target attestation, and automatic count deltas would
   prevent all three classes without reducing proof.
3. **Scale confidence:** 100 users **9.8/10**; 1,000 users **9.4/10**; 10,000 users **9.0/10**. Aggregate **9.0/10**,
   limited by the deferred contract constraint and absence of production-scale queue load evidence. The protocol
   permits proceeding to the fallow/code-quality passes.

#### Score caps

- Dirstarter compliance failure: not triggered.
- Data-integrity failure: not triggered; the deferred contract is explicitly rollout-gated and owned, while current
  application invariants are proven.
- Missing credible verification: not triggered.
- Missing security proof: not triggered.

## ADR / ubiquitous-language check

- **No new ADR.** ADR 0047 (promoter-as-placeholder recruited-coach identity) already governs this slice; the
  salvaged work extends its lock/immutability law without changing a ratified decision. The deferred database
  contract remains owned by WL-P1-9, not a new ADR.
- **No new ubiquitous-language term.** `trust state` (verified / unverified / pending_review) and the belt-review
  detail-state classifier are code-internal projections of existing terms, centralized in `lib/belt/review-state.ts`
  and traced via `@wired`; no glossary change warranted.

## Reflections

- **The crashed Codex work was not in a worktree — it was uncommitted in the canonical checkout.** The known
  `.codex/worktrees/b717` was empty; `ronin-0539` was a `.git`-less husk already on origin. The real at-risk asset
  was a 41-file + 11-untracked diff sitting on the `session-0542` branch in the canonical checkout. First move on
  any crashed-session salvage: `git status` the canonical checkout, not just the worktree list.
- **A recovery chain hides how much is already safe.** `fb41acdf` ("recover interrupted 0541 and bow in 0542")
  showed 0541→0542→0543 was a chain of interrupted sessions. Only 0543's output was uncommitted; 0541 (owned by the
  live lane) and 0542 (pushed as PR #210) were already protected. Classifying each layer against origin/main kept
  the salvage from re-landing already-safe work.
- **Commit before you gate or dispatch.** The whole lane exists because crashes lose *uncommitted* work — so the
  first action after confirming the target was to commit (protecting the asset and neutralizing the
  `workflow-over-dirty-tree-clobbers-edits` subagent-stash risk), then gate.
- **The crash's worst gap was verification, not code.** The doc's own table admitted an inconclusive 21-min
  typecheck and infra-blocked Chromium. The code was ~90% done and 9.7-reviewed; what a crash-salvage most needed
  was a *fresh* green gate — which this run re-established (typecheck exit 0, build 207/207, pure tests 21/21).
- **Don't manufacture churn to "finish" a quality task.** TASK_04's honest outcome was zero fixes: the residual
  complexity was essential concurrency orchestration (documented) or already-routed duplication. Extracting from the
  race-proof `$transaction` callback would have risked a regression for no gain.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0543 `last_agent` → `claude-recovery-of-codex-session-0543`; new `lib/belt/*` + detail-state helpers carry `@added/@why/@wired`; no wiki page frontmatter otherwise changed |
| Backlinks/index sweep | wiki `index.md` SESSION_0543 row flipped in-progress → closed; no new cross-refs |
| Wiki lint | `bun run wiki:lint` via gate runner — 0 err / 53 warn (all pre-existing baseline) |
| Kaizen reflection | Reflections section present: yes |
| Hostile close review | codex TASK_02 hostile residual pass (8 questions, aggregate 9.0 proceed) retained + this recovery pass confirms it on the re-verified head; no new blocker |
| Code-quality gate (Class-A/B) | TASK_04 matrix: 3 units 9.05 / 9.1 / 9.4 (mean 9.2, all Strong, no capped failure); 0 fixes |
| Runtime verification (Doug) | static gates green (typecheck/format/lint/build/pure-tests 21/21); live e2e + DB-concurrency → CI on PR #210 head `562b9607` (authoritative) |
| Review & Recommend | Next session goal written: yes (PR #210 disposition + TASK_05 architecture grill) |
| Memory sweep | 1 durable recovery gotcha captured (crashed-Codex work lives uncommitted in the canonical checkout, not the worktree) |
| Next session unblock check | unblocked — first task (confirm PR #210 CI green) is doable; merge/mark-ready held on operator word |
| Git hygiene | branch `session-0542-belt-review-remediation`; 3 code/doc commits pushed under this session's authorization (`3b6a800a`/`1fccbb7b`/`562b9607`); this close-doc commit held for a separate (free, docs-only) push go |
| Graphify update | nodes=17477 edges=34357 communities=2294 (refreshed pre-commit by the gate runner) |

## Close notes

**Unclean-recovery close.** This session adopted and finished the interrupted `codex-session-0543`, whose bow-out
never ran (crash during TASK_04). Incident logged in `docs/knowledge/wiki/incidents.md`. No data was lost — the
crashed diff was recovered from the canonical working tree, committed, re-verified green, and pushed to PR #210.

**Deferral-guard dismissals (all justified — no un-ledgered lost work):** TASK_05 parked → captured in the
Next-session block (next bow-in read-path) and operator explicitly declined a Goals-Ledger edit; "DB-concurrency
/ live e2e deferred to CI" and "PR #210 CI result" → verification-locus scope notes (CI is the authoritative
gate), not tracked future work; the two hostile-review "deferred contract" lines → WL-P1-9, already ledgered and
cited in SESSION_0543_FINDING_01.
