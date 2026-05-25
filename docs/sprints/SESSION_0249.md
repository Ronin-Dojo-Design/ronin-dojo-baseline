---
title: "SESSION 0249 - Lineage public lifecycle E2E"
slug: session-0249
type: session--implement
status: closed
created: 2026-05-25
updated: 2026-05-25
last_agent: codex-session-0249
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0248.md
  - docs/runbooks/sop-e2e-user-lifecycle.md
  - docs/runbooks/lineage-listing-runbook.md
  - docs/runbooks/graphify-repo-memory.md
  - docs/runbooks/sop-test-writing.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0249 - Lineage public lifecycle E2E

## Date

2026-05-25

## Operator

Brian + codex-session-0249 (Petey orchestration; Cody implementation; Doug/Giddy E2E review sidecars)

## Goal

Implement the staged lineage lifecycle coverage from `SESSION_0247_TASK_03`, starting with the smallest Playwright/user-lifecycle suite that proves anonymous `/lineage` listing and detail reads do not leak `UNLISTED`, `RESTRICTED`, or `PRIVATE` members.

## Bow-in

### Previous session

- SESSION_0248 landed searchable, paginated public `/lineage` listing.
- Remaining next staged task: lifecycle E2E coverage around public, authenticated, owner, claim, profile, and visibility paths.
- First slice for this session: prove anonymous listing/detail reads are public-only and do not expose hidden member names or counts.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Bow-in status: clean against `origin/main`
- HEAD at bow-in: `b6e496d`
- Confirmed this session is not running in `dirstarter_template`.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Test harness, public content/listing reads, Prisma fixture setup, and Better Auth helper patterns. |
| Extension or replacement | Extension. Add Playwright coverage using the existing `apps/web/e2e` harness and Prisma fixture helpers. |
| Why justified | `/lineage` is BBL launch-critical and now has search/pagination; browser-level no-leak coverage is the next proof target. |
| Risk if bypassed | Query unit tests could stay green while the public route, metadata, structured data, or client drawer leaks hidden lineage data. |

### Dirstarter docs checked

- Local alignment inventory checked: `docs/knowledge/wiki/dirstarter-docs-inventory.md`.
- No live Dirstarter behavior is being changed this session; this is coverage around the existing Next/Prisma/Playwright stack.

### Graphify check

- Graph status: available; `graphify stats --graph .` returned 6941 nodes / 10788 edges / 1097 communities / 1347 files tracked at HEAD `b6e496d`.
- Query used:
  - `graphify query --graph . --depth 3 --budget 8000 "lineage Playwright e2e lifecycle public authenticated owner claim profile visibility anonymous listing detail tests fixtures"`
  - `graphify query --graph . --depth 3 --budget 8000 "playwright tests auth fixtures users prisma seed login page lineage visibility"`
  - `graphify query --graph . --depth 3 --budget 8000 "lineage queries visibility PUBLIC UNLISTED RESTRICTED PRIVATE detail summary tree test"`
  - `graphify query --graph . --depth 4 --budget 10000 "playwright config e2e spec test page goto expect browser fixtures"`
  - `graphify query --graph . --depth 4 --budget 10000 "tests e2e playwright user lifecycle auth login anonymous public page fixture"`
  - `graphify query --graph . --depth 3 --budget 10000 "LineageClaimPage EditLineageNodeProfilePage findEditableLineageTrees accessGrants owner claimRequest visibility"`
- Files selected from graph:
  - `apps/web/playwright.config.ts`
  - `apps/web/e2e/global-setup.ts`
  - `apps/web/e2e/global-teardown.ts`
  - `apps/web/e2e/helpers/auth.ts`
  - `apps/web/e2e/helpers/seed-tournament.ts`
  - `apps/web/e2e/helpers/seed-membership.ts`
  - `apps/web/e2e/smoke.spec.ts`
  - `apps/web/e2e/tournaments/list.spec.ts`
  - `apps/web/e2e/tournaments/results.spec.ts`
  - `apps/web/e2e/admin/membership-list.spec.ts`
  - `apps/web/server/web/lineage/queries.ts`
  - `apps/web/server/web/lineage/queries.test.ts`
  - `apps/web/server/web/lineage/queries.visibility.test.ts`
  - `apps/web/server/web/lineage/payloads.ts`
  - `apps/web/app/(web)/lineage/[treeSlug]/page.tsx`
  - `apps/web/components/web/lineage/lineage-tree-board.tsx`
  - `apps/web/components/web/lineage/lineage-tree-canvas.tsx`
  - `apps/web/components/web/lineage/lineage-node-card.tsx`
  - `apps/web/components/web/lineage/lineage-profile-drawer.tsx`
  - `apps/web/components/web/lineage/lineage-list.tsx`
  - `apps/web/components/web/lineage/lineage-card.tsx`
- Verification note: Direct reads confirmed existing Playwright specs use real Postgres fixtures, anonymous tests need no auth helper, and current query tests already cover materialization/query no-leak rules. The uncovered risk is route-level/browser rendering of the public listing/detail surface.

## Petey plan

### SESSION_0249_TASK_01 - Add public lineage no-leak E2E coverage

- **Agent:** Cody implements; Doug/Giddy review fixture isolation and no-leak assertions.
- **What:** Add a focused Playwright fixture/spec for anonymous `/lineage` listing and `/lineage/[treeSlug]` detail reads.
- **Why now:** SESSION_0248 changed the public listing path; this is the next staged proof from SESSION_0247 before privacy implementation.
- **Done means:** Playwright creates a lineage tree with one `PUBLIC`, one `UNLISTED`, one `RESTRICTED`, and one `PRIVATE` member, proves anonymous listing shows the tree with only the public member count, proves hidden member names do not appear in listing/search/detail/profile drawer, and cleans up its fixture.
- **Status:** complete

### Steps

1. Add a reusable E2E lineage seed helper using the same standalone Prisma pattern as existing Playwright helpers.
2. Add `apps/web/e2e/lineage/public-visibility.spec.ts` for anonymous listing/detail no-leak assertions.
3. Keep authenticated owner/claim/profile action paths out of this first Playwright slice when existing safe-action/query tests already cover them.
4. Run targeted Playwright and lineage query tests.
5. Bow out with full-close evidence, Graphify refresh, commit, and push to `main`.

### Open decisions

- None for the first slice. Authenticated listing expansion and `PRIVATE` owner-only read paths remain separate product/architecture work.

## Pre-flight: E2E - Lineage public visibility lifecycle

### 1. Existing test harness scan

- Consulted `docs/runbooks/sop-test-writing.md`: yes.
- Existing Playwright harness:
  - `apps/web/playwright.config.ts` uses `testDir: "./e2e"`, global tournament setup/teardown, `bun run dev`, and `baseURL: "http://localhost:3000"`.
  - Existing specs use `page.goto(...)`, `waitForLoadState("networkidle")`, and real browser assertions.
  - Existing helpers use standalone Prisma via `PrismaPg` and `../../.generated/prisma/client`.
- Found no existing lineage E2E spec.

### 2. Fixture/data scan

- Related query fixtures: `apps/web/server/web/lineage/queries.test.ts` creates public, unlisted, restricted, and unpublished lineage rows.
- Related pure visibility fixtures: `apps/web/server/web/lineage/queries.visibility.test.ts` protects materializer and payload allowlists.
- Related Playwright fixture helpers: `apps/web/e2e/helpers/seed-tournament.ts`, `apps/web/e2e/helpers/seed-membership.ts`.
- Schema spot-check:
  - `LineageVisibility` enum: `PUBLIC`, `UNLISTED`, `RESTRICTED`, `PRIVATE`.
  - `LineageTreeAccessRole` enum: `TREE_ADMIN`, `TREE_EDITOR`, `BRANCH_EDITOR`, `NODE_EDITOR`.
  - `LineageClaimStatus` enum: `PENDING`, `APPROVED`, `DENIED`, `NEEDS_INFO`, `CANCELLED`.
  - `LineageTree` uniqueness: `@@unique([brand, slug])`.
  - `LineageTreeMember` uniqueness: `@@unique([treeId, nodeId])`.

### 3. Data flow reference

- [x] `docs/runbooks/sop-e2e-user-lifecycle.md` - visitor/account/directory/content visibility stages.
- [x] `docs/runbooks/lineage-listing-runbook.md` - public listing/detail/claim lifecycle framing.
- [x] `docs/runbooks/sop-test-writing.md` - Playwright and fixture cleanup conventions.

### 4. Auth predicates planned

- [ ] Session auth required
- [ ] Org membership verified
- [x] Brand column filtered
- Authorization approach: anonymous browser read only; route must use public `getRequestBrand()` and public lineage query paths. The fixture uses `BASELINE_MARTIAL_ARTS` and test assertions prove non-public members stay absent from route-rendered HTML and visible text.

### 5. FAILED_STEPS check

- Prior failures in this area: FS-0001, FS-0005, FS-0007, FS-0008, FS-0024.
- Mitigation acknowledged: yes. Existing harness/helpers/schema were read before adding a new helper/spec; exact Ronin repo paths are used for all edits; full-close evidence will be concrete.

## Task log

### SESSION_0249_TASK_01

- **Status:** complete
- **Started:** 2026-05-25
- **Completed:** 2026-05-25
- **Notes:** Scope narrowed by Petey `/grill-me`: route-level anonymous no-leak proof first; do not fake unimplemented owner/private lifecycle behavior. Doug/Giddy sidecars confirmed a spec-local lineage fixture/helper was preferred over global setup and recommended hidden visual-group sentinels.

## What landed

- Added a lineage Playwright fixture that creates a published `PUBLIC` tree with one public member and one `UNLISTED`, `RESTRICTED`, and `PRIVATE` member.
- Added anonymous browser coverage for:
  - `/lineage?q=<tree-token>` showing the tree with `1 member`, not `4 members`.
  - `/lineage?q=<hidden-member-name>` returning no matching tree.
  - `/lineage/[treeSlug]` rendering only the public member and opening only the public profile drawer.
  - visible body text and serialized page HTML excluding hidden member names and hidden visual-group labels where the query input is not expected to echo the submitted value.
- Fixed the existing Playwright global setup/teardown runtime mismatch by moving Prisma fixture execution behind Bun CLI wrappers. Playwright's Node process no longer imports the generated Prisma TS client directly for global tournament setup.
- Documented the Playwright/Bun Prisma fixture bridge in `docs/runbooks/sop-test-writing.md`.
- Installed the local Playwright Chromium bundle needed to run E2E on this machine.

## Files touched

| File | Note |
| --- | --- |
| `apps/web/e2e/global-setup.ts` | Switched tournament fixture seeding to invoke Bun CLI wrapper instead of importing generated Prisma client in Playwright's Node runtime. |
| `apps/web/e2e/global-teardown.ts` | Switched tournament fixture cleanup to invoke Bun CLI wrapper. |
| `apps/web/e2e/helpers/seed-tournament-cli.ts` | New Bun CLI bridge for existing tournament fixture seed/cleanup. |
| `apps/web/e2e/helpers/seed-lineage.ts` | New Node-side Playwright wrapper for lineage fixture seed/cleanup. |
| `apps/web/e2e/helpers/seed-lineage-db.ts` | New Bun-side lineage Prisma fixture helper. |
| `apps/web/e2e/lineage/public-visibility.spec.ts` | New anonymous public listing/detail/profile-drawer no-leak E2E spec. |
| `docs/runbooks/sop-test-writing.md` | Documented the E2E Prisma fixture bridge and added the lineage spec to inventory. |
| `docs/knowledge/wiki/index.md` | Added SESSION_0249 and bumped `last_agent`. |
| `docs/sprints/SESSION_0249.md` | Current session audit and closeout. |

## Decisions resolved

- First lifecycle E2E slice is anonymous public no-leak coverage. Authenticated/owner listing expansion remains separate because the route currently calls public reads without viewer context.
- No ADR needed: the Playwright fixture bridge is an implementation/runbook adjustment for test runtime compatibility, not a product or architecture decision.
- No ubiquitous-language update needed: no domain term changed.

## Open decisions / blockers

- Root `bun run typecheck` is still blocked by an unrelated pre-existing `packages/api-client/src/auth.ts` TS2742 inferred-type portability issue. `apps/web` typecheck passes.
- Authenticated non-owner, owner, claim, and node-profile edit browser journeys are still the next lifecycle coverage layer. Existing safe-action/query tests cover parts of those contracts, but there is not yet browser-level proof for all of them.
- Product/legal privacy wording remains a blocker for the separate GDPR-like privacy implementation from SESSION_0247.

## Verification

| Check | Result |
| --- | --- |
| `bun biome check --write e2e/global-setup.ts e2e/global-teardown.ts e2e/helpers/seed-tournament-cli.ts e2e/helpers/seed-lineage.ts e2e/helpers/seed-lineage-db.ts e2e/lineage/public-visibility.spec.ts` | Pass; no fixes after final patch. |
| `bunx playwright install chromium` | Pass; installed Chromium/headless shell bundle required by local Playwright. |
| `bunx playwright test e2e/lineage/public-visibility.spec.ts` | Pass; 3 tests. |
| `bunx playwright test e2e/tournaments/results.spec.ts` | Pass; 2 tests, verifies global tournament fixture bridge still works. |
| `bun test server/web/lineage/queries.test.ts server/web/lineage/schema.test.ts server/web/lineage/queries.visibility.test.ts` | Pass; 42 tests, 103 expectations. |
| `bun run typecheck` in `apps/web` | Pass. |
| Root `bun run typecheck` | Fails in unrelated `packages/api-client/src/auth.ts` TS2742 inferred-type portability issue. |
| `git diff --check` | Pass. |

## Review log

### SESSION_0249 - Lineage public lifecycle E2E

#### Review

**SESSION_0249_REVIEW_01 - Public lineage no-leak E2E review**

- **Reviewed tasks:** SESSION_0249_TASK_01
- **Dirstarter docs check:** cached docs sufficient
- **Sources:** `docs/knowledge/wiki/dirstarter-docs-inventory.md`, `docs/runbooks/sop-test-writing.md`, `docs/runbooks/sop-e2e-user-lifecycle.md`, `docs/runbooks/lineage-listing-runbook.md`
- **Verdict:** Aligned. The session extended the existing Playwright/Prisma fixture pattern, added browser-level no-leak proof for the exact public listing/detail surfaces changed in SESSION_0248, and did not widen any public query or route visibility. The only material risk is that authenticated/owner browser journeys remain unproven, but that is outside this first no-leak slice and is explicitly staged next.

#### Findings

**SESSION_0249_FINDING_01 - Authenticated lineage lifecycle browser proof remains open**

- **Severity:** medium
- **Task:** SESSION_0249_TASK_01
- **Evidence:** `apps/web/app/(web)/lineage/[treeSlug]/page.tsx` calls `getLineageTreeBySlug({ brand, slug })` without a viewer; safe-action tests cover claim/profile gates but not browser journeys.
- **Impact:** Anonymous no-leak is proven, but authenticated non-owner, owner/editor, claim, and profile edit lifecycle paths still lack browser-level regression coverage.
- **Required follow-up:** Add the next lifecycle suite around authenticated viewer/owner/claim/profile paths, only where existing implementation supports real assertions.
- **Status:** open

## Hostile close review

### SESSION_0249 - Lineage public lifecycle E2E

#### Review Questions

1. **Plan sanity:** Good. Petey narrowed the request to the first actual risk: anonymous public listing/detail leakage after pagination/search.
2. **Dirstarter compliance:** Extended the existing Playwright and fixture approach; no Dirstarter baseline was replaced.
3. **Security:** Strengthened proof for public lineage privacy. No hidden rows were exposed; no route auth behavior was widened.
4. **Data integrity:** The DB does not enforce public-only rendering by itself; this remains query/materializer/route behavior. The new browser test catches regressions at the rendered route layer.
5. **Lifecycle proof:** Serves visitor -> public listing/detail/profile-drawer discovery lifecycle. It does not claim authenticated lifecycle coverage yet.
6. **Verification honesty:** Strong for the anonymous no-leak claim: query tests plus real browser route assertions. Honest gap remains for auth/owner/claim/profile browser paths.
7. **Workflow honesty:** WORKFLOW 5.0 followed: bow-in, Graphify-first discovery, task ID, pre-flight, focused implementation, review log, and close evidence.
8. **Merge readiness:** Ready to merge. Follow-up remains staged, not hidden debt.

#### Kaizen

- **Safe and secure?** Safe for the specific anonymous public surface. Proven by route-level Playwright checks plus existing query/materializer tests. Authenticated owner/private paths still need their own browser proof.
- **Failed steps preventable?** One tooling surprise: Playwright's Node runtime could not import the generated Prisma TS client. The mitigation is now documented in `sop-test-writing.md`; future E2E DB fixtures should start with the Bun bridge pattern.
- **Confidence:** 100 rows: 9.7/10; 1,000 rows: 9.3/10; 10,000 rows: 8.8/10. Lowest-tier aggregate is 8.8 because the browser test is privacy-focused, not a pagination/performance stress suite.
- **WORKFLOW score:** 9.6/10. No score cap: Dirstarter alignment and data integrity are acceptable for the scoped claim; verification is credible for anonymous no-leak.

## Next session

- **Goal:** Add the next staged lineage lifecycle coverage for authenticated non-owner, owner/editor, claim, and profile edit paths where implementation exists.
- **Inputs to read:**
  - `docs/sprints/SESSION_0247.md`
  - `docs/sprints/SESSION_0248.md`
  - `docs/sprints/SESSION_0249.md`
  - `docs/runbooks/sop-e2e-user-lifecycle.md`
  - `docs/runbooks/lineage-listing-runbook.md`
  - `docs/runbooks/sop-test-writing.md`
  - `apps/web/server/admin/lineage/claim-review-actions.safe-action.test.ts`
  - `apps/web/server/web/lineage/node-profile-actions.safe-action.test.ts`
- **First task:** Use Graphify-first discovery on lineage claim/profile/access Playwright and safe-action coverage, then design the smallest authenticated lifecycle suite that proves implemented owner/editor/claim/profile flows without faking unimplemented `PRIVATE` owner-only reads.

## Reflections

- The key surprise was Playwright's Node runtime failing on the generated Prisma TS client while Bun imports it cleanly. The new fixture bridge is intentionally narrow and documented.
- The strongest test assertion was checking both rendered text and serialized page HTML; this catches structured-data/RSC payload leaks, not only visible cards.
- Searching by a hidden member name legitimately echoes that query in the input, so no-leak assertions must distinguish user-submitted text from data returned by the app.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `docs/sprints/SESSION_0249.md`, `docs/runbooks/sop-test-writing.md`, and `docs/knowledge/wiki/index.md` checked/updated with current date and `last_agent`; code files have no JETTY frontmatter. |
| Backlinks/index sweep | `docs/runbooks/sop-test-writing.md` backlink added to SESSION_0249; wiki index has SESSION_0249 and last 5 sessions 0245-0249 present. |
| Wiki lint | `bun run wiki:lint` executed; failed on pre-existing repo-wide docs debt: 232 broken-link errors, 4 backlink errors, and 509 markdown warnings across archived/index docs. No SESSION_0249-specific link failure was identified in the visible output. |
| Kaizen reflection | Present in `## Reflections` and `## Hostile close review`. |
| Hostile close review | `SESSION_0249_REVIEW_01` and `SESSION_0249_FINDING_01` recorded. |
| Review & Recommend | Next session goal, inputs, and first task written. |
| Memory sweep | Project-scoped test-harness gotcha documented in `docs/runbooks/sop-test-writing.md`; no operator memory update needed. |
| Next session unblock check | Unblocked; starts with Graphify-first auth/claim/profile lifecycle discovery. |
| Git hygiene | Final status/diff checked before staging; commit and push run as the final close step from `main`. Commit hash reported in bow-out response. |
| Graphify update | Runs after git hygiene per user request; final stats reported in bow-out response. |
