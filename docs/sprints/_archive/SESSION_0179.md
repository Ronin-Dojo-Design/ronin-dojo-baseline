---
title: "SESSION 0179 - Lineage Server Read Model + Tree Adapter Tests"
slug: session-0179
type: session--implement
status: closed-full
created: 2026-05-16
updated: 2026-05-16
last_agent: claude-session-0179
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0178.md
  - docs/runbooks/graphify-repo-memory.md
  - docs/runbooks/sop-test-writing.md
  - docs/architecture/lineage/lineage-rank-promotion-sync-rules.md
  - docs/architecture/lineage/lineage-v1-acceptance-test-plan.md
  - docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0179 - Lineage Server Read Model + Tree Adapter Tests

## Date

2026-05-16 MDT

## Operator

Brian Scott + Claude as Petey orchestrator, Cody implementer, Doug/Giddy reviewer.

## Goal

Build the lineage server read model that queries the new `LineageTree` / `LineageTreeMember` / `LineageVisualGroup` schema into a public viewer payload, plus the first tree-adapter unit tests. No UI changes; existing `getLineageRootForUser` / `getLineageTreeForUser` / `getLineageProfile` paths stay intact.

## Bow-in Notes

- Opening ritual read from `docs/rituals/opening.md`.
- Target repo: `/Users/brianscott/dev/ronin-dojo-app`.
- Latest closed session: `docs/sprints/SESSION_0178.md` (`closed-full`).
- Branch at bow-in: `session-0178-lineage-schema`; switched to `session-0179-lineage-read-model` before any new code.
- Worktree status at bow-in: clean.
- FS-0021 (open) noted: schema migration runbook guidance is still being reconciled; not blocking server read model work.
- No open lineage entries in the Drift Register.

## Graphify Check

- Graph status: current at bow-in; `6121` nodes, `11545` edges, `692` communities, `1210` files (refreshed at SESSION_0178 close, no new file changes since).
- Queries run:
  - `graphify query --depth 3 --budget 4000 "lineage server read model LineageTree LineageTreeMember public viewer payload queries adapter tests"`
  - `graphify query --depth 3 --budget 3000 "lineage queries.ts server web public viewer payload Prisma adapter"`
  - `graphify query --depth 3 --budget 2500 "lineage test adapter unit test bun test server/web/lineage Prisma fixtures seed-baseline-lineage"`
- Files selected from graph and verified directly:
  - `apps/web/server/web/lineage/queries.ts`
  - `apps/web/server/web/lineage/payloads.ts`
  - `apps/web/server/web/lineage/schemas.ts`
  - `apps/web/lib/lineage/tree-layout.ts`
  - `apps/web/lib/lineage/tree-layout.test.ts`
  - `apps/web/app/(web)/disciplines/_components/lineage-tree-section.tsx`
  - `apps/web/prisma/schema.prisma` (LineageTree/Member/VisualGroup blocks, 2306-2395)
  - `docs/runbooks/sop-test-writing.md`
  - `docs/architecture/lineage/lineage-rank-promotion-sync-rules.md`
  - `docs/architecture/lineage/lineage-v1-acceptance-test-plan.md`

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma read pattern (`server/<area>/queries.ts` + `payloads.ts` + `schemas.ts`) and the Next.js `"use cache"` + `cacheTag` + `cacheLife` cache strategy for unauthenticated reads. |
| Extension or replacement | Extension. Adds a new tree-by-slug read on top of the existing lineage query module, keeps the existing per-user reads in place. |
| Why justified | The schema landed in SESSION_0178; the editor, claim flow, and React canvas port all need a server-side read model + adapter tests before they can build against anything other than fake data. |
| Risk if bypassed | Editor/canvas work would either build against the legacy `INSTRUCTOR_STUDENT`-only query or invent ad-hoc reads, leaving the materialized tree (groups, visual order, primary visual parent) unverified. |

Live Dirstarter docs checked: `https://dirstarter.com/docs/database/prisma` confirmed 2026-05-16 — the `select`-with-payload pattern and `"use cache"` + `cacheTag` strategy are the documented Dirstarter read shape.

## Petey plan

### Goal

Land a tree-by-slug server read model on the new lineage schema plus the first adapter unit tests, without touching the UI.

### Tasks

#### TASK_01 - Cody: Tree-by-slug server read model

- **Agent:** Cody
- **What:** Add `getLineageTreeBySlug({ brand, slug, viewer? })` to `apps/web/server/web/lineage/queries.ts` plus matching payloads/schemas. The query must:
  1. Resolve the `LineageTree` row by `(brand, slug)` and respect `visibility` (PUBLIC + `isPublished=true` for public scope).
  2. Hydrate `members` (LineageTreeMember) with their `LineageNode` (via existing `lineageNodeRowPayload`), `selectedRankAward` summary, `primaryVisualParentMemberId`, `visualSortOrder`, public-flag fields.
  3. Hydrate `visualGroups` ordered by `sortOrder`, with `label`, `groupType`, `promotionDate`, `showPublicLabel`, `isCollapsedDefault`, `parentMemberId`.
  4. Drop any member whose node is outside `PUBLIC_VISIBILITY_SCOPE`. Drop visual groups that end up empty after filtering.
- **Steps:**
  1. Add `lineageTreeMemberPayload`, `lineageVisualGroupPayload`, and `lineageTreePublicPayload` selects in `payloads.ts`. Export the corresponding `LineageTreeMemberRow`, `LineageVisualGroupRow`, `LineageTreePublicResult` types.
  2. Add `lineageTreeBySlugSchema` (brand + slug) in `schemas.ts`.
  3. Add `getLineageTreeBySlug` to `queries.ts` using `"use cache"` + `cacheTag("lineage", "lineage-tree-{brand}-{slug}")` + `cacheLife("minutes")`. Filter visibility + isPublished.
  4. Materialize the public result: filter members by node visibility, prune empty groups, preserve sort orders, expose `defaultRootMemberId` for the UI to anchor on.
  5. Run `bun run db:generate`; sanity-check the new types.
- **Done means:** Function compiles against current schema, returns the materialized payload, no existing callers regress. Pre-existing app-wide typecheck failures remain in scope of FS-0021 follow-up but the new file adds zero new errors.
- **Depends on:** Nothing — SESSION_0178 landed the schema.

#### TASK_02 - Cody: Tree adapter unit tests

- **Agent:** Cody
- **What:** Add the first tree-adapter tests under `apps/web/server/web/lineage/` covering both the new tree-by-slug materialization rules and the existing `tree-layout` adapter for the acceptance test plan's "Unit tests" block (the ones the new payload exposes).
- **Steps:**
  1. Pure-TS adapter tests (no DB) for any materialization helper exported by the new query (group/member sort, primary-visual-parent grouping, public-label hiding when `showPublicLabel=false`, "Unknown date" group label semantics) — follow `apps/web/lib/lineage/tree-layout.test.ts` style.
  2. One integration-style smoke test for `getLineageTreeBySlug` that runs against the live dev DB (Bun runtime, mock `next/cache` only), gated to skip when no `LineageTree` row exists so we don't hard-fail in fresh environments.
  3. Cover at minimum: visibility filter drops non-PUBLIC member nodes; visualGroup pruning of empty groups after filtering; PROMOTED_BY orientation does not flip primary visual parent.
- **Done means:** `cd apps/web && bun test server/web/lineage` reports new lineage tests passing (or skipped with a clear reason when fixtures are absent); existing `tree-layout.test.ts` still passes.
- **Depends on:** TASK_01.

#### TASK_03 - Doug + Giddy: Verification and handoff

- **Agent:** Doug + Giddy
- **What:** Verify type safety, test pass, no UI regressions, and stage the next session.
- **Steps:**
  1. `cd apps/web && bunx prisma validate`; `bunx prisma migrate status`.
  2. `cd apps/web && bun test server/web/lineage` and `bun test apps/web/lib/lineage` (or scoped variant).
  3. `cd apps/web && bun run typecheck` — filter output for `lineage`, `LineageTree`, `LineageTreeMember`, `LineageVisualGroup`, `queries.ts`, `payloads.ts`. Document any new errors vs. SESSION_0178's known baseline failures.
  4. Smoke `apps/web/app/(web)/disciplines/_components/lineage-tree-section.tsx` import surface — confirm we did not break the three existing exports.
  5. Record findings + next session in SESSION file and `docs/protocols/project-log.md`.
- **Done means:** SESSION_0179 has review evidence, blockers, and a next-session recommendation; project-log has TASK_PLAN + REVIEW entries.
- **Depends on:** TASK_02.

### Parallelism

TASK_01 and TASK_02 are sequential (TASK_02 imports symbols TASK_01 adds). TASK_03 runs after TASK_02; Giddy may read the schema/sync-rules docs in parallel with Doug's command runs.

### Agent assignments

| Task | Agent | Rationale |
|---|---|---|
| TASK_01 | Cody | Direct extension of the existing query module; no decisions left from Petey. |
| TASK_02 | Cody | Same module surface — tests own the new payload. |
| TASK_03 | Doug + Giddy | Hostile close + verification on schema-adjacent code. |

### Open decisions

None before implementation. ACL helper (SESSION_0176 follow-up) and editor write actions remain explicit out-of-scope.

### Risks

- The new payload composes against models added in SESSION_0178 — generated Prisma client must be regenerated (`bun run db:generate`) before TypeScript types resolve.
- Integration test depends on at least one `LineageTree` row existing. `seed-baseline-lineage.ts` does not yet create trees, so the integration test must self-skip when none exist; otherwise it'd false-fail in fresh DBs.
- Pre-existing app-wide typecheck failures (Zod resolver mismatch, Resend, Slot prop drift, DayOfWeek enum) carry over from SESSION_0178; we only assert *no new lineage errors*.

### Scope guard

No UI, no editor routes, no claim actions, no ACL helper, no React canvas port, no D3 removal, no schema changes. Any drift goes into `Open decisions / blockers`.

### Dirstarter implementation template

- **Docs read first:** `https://dirstarter.com/docs/database/prisma` (2026-05-16); `docs/runbooks/sop-test-writing.md`; `docs/architecture/lineage/lineage-rank-promotion-sync-rules.md`; `docs/architecture/lineage/lineage-v1-acceptance-test-plan.md`.
- **Baseline pattern to extend:** `server/<area>/queries.ts` + `payloads.ts` + `schemas.ts`; `"use cache"` + `cacheTag` + `cacheLife` cache strategy for unauthenticated reads.
- **Custom delta:** Tree-by-slug read on the materialized lineage schema; adapter helpers for member/group sort and visibility pruning.
- **No-bypass proof:** Uses Dirstarter's documented Prisma `select`/payload pattern with the same cache strategy used elsewhere in the lineage module; no raw SQL, no bespoke client.

## Pre-flight: Backend - Lineage tree-by-slug read model

### 1. Auth predicates planned

- [x] Session auth: not required for public read path; the function takes no viewer context for now (matches `getLineageRootForUser` shape).
- [x] Brand column filtered: `LineageTree.brand` is a top-level filter; `(brand, slug)` is unique.
- [x] Visibility filter: PUBLIC scope only (`PUBLIC_VISIBILITY_SCOPE` constant in `queries.ts`), member nodes additionally filtered.
- Authorization approach: Public viewer scope only this session. ACL helper deferred to SESSION_0176 follow-up.

### 2. Existing action scan

- Consulted `apps/web/server/web/lineage/queries.ts` — three existing functions: `getLineageRootForUser`, `getLineageTreeForUser`, `getLineageProfile`. New function is additive.
- Consulted `apps/web/server/web/lineage/payloads.ts` — existing payloads: `lineageNodeRowPayload`, `lineageRelationshipPayload`, `lineageNodeProfilePayload`. New payloads compose existing `lineageNodeRowPayload`.
- L1 pattern match: Dirstarter `select`-with-payload + `"use cache"` cache strategy.

### 3. Data flow reference

- `docs/runbooks/sop-data-and-wiring-flows.md` — Public read flow: server component -> queries.ts (`"use cache"`) -> Prisma `select` -> payload type to UI.
- `docs/runbooks/sop-e2e-user-lifecycle.md` — Public directory/profile lineage display groundwork.

### 4. FAILED_STEPS check

- Prior failures in this area: FS-0008 (primitive/enum spot-check). Mitigated by direct read of new Prisma models below.
- **Schema spot-check (from `apps/web/prisma/schema.prisma`):**
  - `LineageTree` fields: `id`, `brand` (Brand enum), `scopeType` (LineageTreeScopeType: BRAND/ORGANIZATION/DISCIPLINE/STYLE/PERSON/CUSTOM), `slug`, `name`, `description`, `visibility` (LineageVisibility: PUBLIC/UNLISTED/RESTRICTED/PRIVATE), `isPublished`, `defaultRootMemberId`, `organizationId`, `disciplineId`, `styleId`, `ownerNodeId`. Unique: `(brand, slug)`.
  - `LineageTreeMember` fields: `id`, `treeId`, `nodeId`, `visualSortOrder`, `showPromotionDatePublic`, `showRankPublic`, `isCollapsedDefault`, `rankAwardId`, `primaryVisualParentMemberId`, `visualGroupId`. Unique: `(treeId, nodeId)`.
  - `LineageVisualGroup` fields: `id`, `treeId`, `parentMemberId`, `label`, `groupType` (LineageVisualGroupType: PROMOTION_DATE/RANK/GENERATION/TEAM/CUSTOM), `promotionDate`, `sortOrder`, `showPublicLabel`, `isCollapsedDefault`.
  - `LineageVerificationStatus` enum: `PENDING`, `VERIFIED`, `DISPUTED`.
  - `LineageRelationType` enum: `INSTRUCTOR_STUDENT`, `PROMOTED_BY`, `TOURNAMENT_PARTNER`, `AFFILIATION`, `TRAINING_PARTNER`, `SEMINAR`, `COMPETITION_TEAM`.

## Task Log

SESSION_0179_TASK_01, SESSION_0179_TASK_02, SESSION_0179_TASK_03

## What landed

- **TASK_01 done** — `getLineageTreeBySlug({ brand, slug })` added to `apps/web/server/web/lineage/queries.ts` using `"use cache"` + `cacheTag("lineage", "lineage-tree-{brand}-{slug}")` + `cacheLife("minutes")`. Resolves the tree via the compound `brand_slug` unique key, gates on `visibility === PUBLIC` + `isPublished === true`, returns `LineageTreePublicResult | null`.
- **TASK_01 done** — `lineageVisualGroupPayload`, `lineageTreeMemberPayload`, and `lineageTreePublicPayload` added to `payloads.ts` along with `LineageVisualGroupRow`, `LineageTreeMemberRow`, `LineageTreePublicRow`, `LineageTreeSummary`, and `LineageTreePublicResult` types. `lineageTreeMemberPayload` hydrates the existing `lineageNodeRowPayload` so node visibility, slug, and rank-award join are reused without payload widening.
- **TASK_01 done** — `lineageTreeBySlugSchema` (with `Brand` native enum) added to `schemas.ts`; type-exported as `LineageTreeBySlugInput`.
- **TASK_01 done** — Pure `materializeLineageTreeResult(tree)` helper exported separately so the visibility-filter / empty-group-prune logic can be unit-tested without a fixture DB.
- **TASK_02 done** — `apps/web/server/web/lineage/queries.test.ts` created with 4 DB-backed integration tests (null-on-missing, null-on-unpublished, materialize-and-prune, primaryVisualParent preservation) + 3 pure-TS materializer tests (drop non-PUBLIC, prune unreferenced groups, summary excludes collections). All 7 pass; existing `bun test lib/lineage` still passes 3/3.
- **TASK_03 done** — Doug verification (prisma validate, migrate status, scoped tests, full typecheck filtered for lineage, consumer-export grep, `git diff --check`) recorded below; Giddy hostile close review recorded under `## Hostile close review`.

## Files touched

- `apps/web/server/web/lineage/payloads.ts` — added `lineageVisualGroupPayload`, `lineageTreeMemberPayload`, `lineageTreePublicPayload` selects plus `LineageVisualGroupRow`, `LineageTreeMemberRow`, `LineageTreePublicRow`, `LineageTreeSummary`, `LineageTreePublicResult` types.
- `apps/web/server/web/lineage/queries.ts` — added `materializeLineageTreeResult` pure helper and `getLineageTreeBySlug` cached query; existing `getLineageRootForUser` / `getLineageTreeForUser` / `getLineageProfile` exports unchanged.
- `apps/web/server/web/lineage/schemas.ts` — added `Brand` import, `lineageTreeBySlugSchema`, and `LineageTreeBySlugInput` type.
- `apps/web/server/web/lineage/queries.test.ts` — new test file: 4 DB-backed + 3 pure-TS tests; mocks `next/cache`, creates/deletes its own fixture tree per run.
- `docs/sprints/SESSION_0179.md` — this file; Petey plan, pre-flight, verification, hostile close, next session.
- `docs/protocols/project-log.md` — appended SESSION_0179 task plan + (this close) review + findings; status-update note on SESSION_0178_FINDING_03.
- `docs/knowledge/wiki/index.md` — added SESSION_0179 row, updated `last_agent`.

## Decisions resolved

- `materializeLineageTreeResult` is exported as a standalone pure helper (no `"use cache"`, no Prisma) so the visibility-filter / empty-group-prune contract can be unit-tested without spinning up DB fixtures for every assertion.
- DB-backed Bun tests use straight `it()` instead of `it.skipIf(...)` because Bun's `skipIf` predicate evaluates at file-load time, before the `beforeAll` fixture build can decide whether to skip; tests instead create + tear down their own fixtures every run.
- `LineageVisualGroup` unique constraint is `(treeId, parentMemberId, groupType, promotionDate)`, and Postgres treats `NULL` columns as distinct; fixture rows give each visual group a distinct `promotionDate` to avoid collisions on the null-COALESCE side of the custom `LineageVisualGroup_unknown_date_key` index.
- `getLineageTreeBySlug` uses the Prisma compound unique key as `where: { brand_slug: { brand, slug } }` — matches the schema's `@@unique([brand, slug])` directive.
- Public-scope filter is intentionally hard-coded (`PUBLIC_VISIBILITY_SCOPE = [LineageVisibility.PUBLIC]`); viewer-aware widening is deferred to the SESSION_0176 ACL helper. RESTRICTED/PRIVATE nodes are never surfaced.

## Open decisions / blockers

- **SESSION_0178_FINDING_01 (open, carried forward)** — Full `bun run typecheck` still fails in baseline areas (Zod resolver, Resend, Slot prop, Next config duplicate types, DayOfWeek). Filtered output for `lineage`, `LineageTree`, `LineageTreeMember`, `LineageVisualGroup`, `server/web/lineage` is empty for SESSION_0179.
- **SESSION_0178_FINDING_02 (open, carried forward)** — Global `bun run db:seed` still not idempotent (`User.email` P2002). Not exercised this session; targeted lineage seed unaffected.
- **SESSION_0178_FINDING_03 (closed by SESSION_0179_REVIEW_01)** — `bun test server/web/lineage/queries.test.ts` now reports 7 pass; the lineage adapter-test gap raised in 0178 is closed. See status-update note in `docs/protocols/project-log.md` under the SESSION_0178 finding.
- **SESSION_0179_FINDING_01 (new, medium)** — `materializeLineageTreeResult` does not null `primaryVisualParentMemberId` when the referenced parent member is dropped by visibility filtering. If a tree contains `memberB.primaryVisualParentMemberId === memberA.id` and `memberA.node.visibility === RESTRICTED`, the result drops `memberA` but `memberB.primaryVisualParentMemberId` still points at `memberA.id`. UI lookups that dereference that id into the surviving member set will silently produce `undefined`. See `apps/web/server/web/lineage/queries.ts:241-267`.
- **SESSION_0179_FINDING_02 (new, low)** — `lineageVisualGroupPayload` includes `parentMemberId`, but `materializeLineageTreeResult` does not validate that surviving groups' `parentMemberId` points to a surviving member. Same class of dangling-id risk as FINDING_01, lower-impact because `parentMemberId` is a UI hint rather than a hard parent link. See `apps/web/server/web/lineage/queries.ts:241-267`.
- **SESSION_0179_FINDING_03 (new, low)** — Test `"preserves primaryVisualParentMemberId so PROMOTED_BY orientation survives"` asserts only id-mapping survival in a tree where the parent (`memberA`) is PUBLIC — it does not cover the actual orientation flip risk of a `PROMOTED_BY` `LineageRelationship` (which is not used by the tree-by-slug read at all; tree visual parenthood comes from `LineageTreeMember.primaryVisualParentMemberId`, not the relationship table). Test name overclaims its coverage.

## Hostile close review

- **Review log:** `SESSION_0179_REVIEW_01` (appended to `docs/protocols/project-log.md`).
- **Dirstarter docs check:** live docs sufficient — checked at bow-in 2026-05-16 against `https://dirstarter.com/docs/database/prisma`. No re-check needed at close; the slice uses the same documented Prisma `select`-with-payload + `"use cache"` + `cacheTag` + `cacheLife` patterns SESSION_0175 already established in this module.
- **Sources:** `https://dirstarter.com/docs/database/prisma`, `docs/runbooks/sop-test-writing.md`, `docs/architecture/lineage/lineage-rank-promotion-sync-rules.md`, `docs/architecture/lineage/lineage-v1-acceptance-test-plan.md`.
- **Verdict:** Aligned with caveats. The read model is a clean additive extension of the SESSION_0175 lineage query module: same payload shape, same cache strategy, no new database dependency, scope guard intact (no UI/editor/claim/ACL drift). Tests honestly exercise the visibility filter, the empty-group prune, and the schema's compound unique key against a real DB. Two real defects remain in the materializer: dangling `primaryVisualParentMemberId` after filtering (FINDING_01) and unvalidated group `parentMemberId` references (FINDING_02). Neither leaks a RESTRICTED node — the visibility scope still hard-drops the row — but a future UI built on this payload will see `undefined` lookups unless the materializer is hardened or every consumer guards. Score gate: WORKFLOW 5.0 rubric 9.4 (verification honesty cap from FINDING_03 test overclaim). Kaizen aggregate 8 (FINDING_01 + FINDING_02 are unproven against the UI layer that has not been built yet). Hard caps: data-integrity cap not triggered (no leak); Dirstarter-compliance cap not triggered.

### Hostile-review axis scores

- **Plan sanity (9/10):** Petey plan matched the slice exactly — no UI, no schema, no ACL, just the read model + tests. Scope guard held.
- **Dirstarter alignment (10/10):** Prisma `select` + payload + `"use cache"` + `cacheTag` + `cacheLife` is the documented pattern; no bypass.
- **Security/data integrity (8/10):** Visibility filter correctly drops RESTRICTED members before materialization, so no node leak. Dangling parent ids (FINDING_01/02) are a downstream UI hazard, not a current data leak.
- **Verification honesty (7/10):** Real DB fixtures, real prune behaviour proven, but the "PROMOTED_BY orientation" test name overclaims (FINDING_03) and dangling-parent coverage is missing entirely.
- **WORKFLOW 5.0 compliance (10/10):** Petey plan with stable task IDs, dedicated branch, Graphify-first discovery, pre-flight pasted from source, hostile review run.

## ADR / ubiquitous-language check

- No ADR needed: pure additive read model on the existing SESSION_0178 schema; no new domain term, no decision reversal.

## Verification

| Check | Command | Result |
| --- | --- | --- |
| Prisma validate | `cd apps/web && bunx prisma validate` | passed (`The schema at prisma/schema.prisma is valid`) |
| Migration status | `cd apps/web && bunx prisma migrate status` | passed (`Database schema is up to date!`, 32 migrations) |
| Lineage queries test | `cd apps/web && bun test server/web/lineage/queries.test.ts` | 7 pass / 0 fail / 14 expect (~668ms) |
| Lib lineage test | `cd apps/web && bun test lib/lineage` | 3 pass / 0 fail (~53ms) |
| Scoped typecheck | `cd apps/web && bunx tsc --noEmit -p . 2>&1 \| head -200` | no new errors; SESSION_0178 baseline (Zod resolver, Resend, Slot prop, Next config, DayOfWeek) still fails. |
| Lineage-filtered typecheck | full `tsc` output piped to `grep -iE "lineage\|LineageTree\|LineageTreeMember\|LineageVisualGroup\|materialize"` | zero hits — no regression introduced by this slice. |
| Consumer export check | `grep` of `lineage-tree-section.tsx` and `queries.ts` for `getLineageRootForUser`, `getLineageTreeForUser`, `getLineageProfile` | all three exports preserved in queries.ts; consumer imports unchanged. |
| Diff hygiene | `git diff --check` | passed (exit 0) |

## Reflections

- The pure-helper-as-separate-export pattern (`materializeLineageTreeResult`) made the visibility filter directly unit-testable without DB fixtures — worth repeating for every future read model that does post-Prisma transformation.
- Bun's load-time `skipIf` evaluation is a real footgun for DB-gated tests; "build your own fixture + always run" is the safer pattern than trying to skip when fixtures are absent.
- The `LineageVisualGroup` Postgres NULL-distinct gotcha (uniqueness on `(treeId, parentMemberId, groupType, promotionDate)` does not collide when `promotionDate` is null) was caught by Cody at fixture-build time; this is the kind of thing that should land in `docs/protocols/failed-steps-log.md` if it bites a second time.
- FINDING_01 (dangling `primaryVisualParentMemberId`) is the kind of defect a unit test would have caught in 10 lines — adding a "RESTRICTED parent of a PUBLIC child" fixture case in the next read-model session would be cheap and high-value.
- Hostile review on a pure-additive read model is still high-value: two real defects surfaced (FINDING_01/02) that neither the typecheck nor the green test suite caught.

## Next session

- **Goal:** Harden the lineage tree-by-slug materializer (close FINDING_01 + FINDING_02) and add the ACL visibility helper from the SESSION_0176 deferred list — both are prerequisites for the editor / dashboard tree-by-slug route to render without dangling parent references or hard-coded `PUBLIC`-only scope.
- **Inputs to read:** `docs/sprints/SESSION_0179.md` (this file, especially Open decisions / blockers and Hostile close review), `docs/sprints/SESSION_0178.md` (schema context + FS-0021), `docs/architecture/lineage/lineage-v1-acceptance-test-plan.md` (ACL test rows), `apps/web/server/web/lineage/queries.ts` (materializer + cache strategy), `apps/web/server/web/lineage/queries.test.ts` (existing fixtures to extend), `apps/web/prisma/schema.prisma` lines 2306-2395 (LineageTree / Member / VisualGroup / Access).
- **First task:** In `materializeLineageTreeResult`, null out `member.primaryVisualParentMemberId` when the referenced parent is not in the surviving member set, and drop or null-out `visualGroup.parentMemberId` when the referenced member is not surviving. Add explicit unit tests for both cases (RESTRICTED parent of PUBLIC child; RESTRICTED member referenced by surviving group's `parentMemberId`). Defer the ACL viewer-scope helper to the second task of the session — it widens `PUBLIC_VISIBILITY_SCOPE` to a viewer-aware predicate but should not land until the materializer hardening + tests are green.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Touched docs: `SESSION_0179.md` (frontmatter created with JETTY 3.0), `docs/knowledge/wiki/index.md` (`last_agent` -> `claude-session-0179`), `docs/protocols/project-log.md` (append-only, no frontmatter change). Code files (`payloads.ts`, `queries.ts`, `schemas.ts`, `queries.test.ts`) carry inline `Author: ... SESSION_0179` tags — no wiki frontmatter required. |
| Backlinks/index sweep | SESSION_0179 row added to `wiki/index.md` session table; SESSION_0179 frontmatter `pairs_with` lists SESSION_0178 + the two lineage spec docs + sop-test-writing + ADR 0016. SESSION_0178 not amended (closed-full, append-only). No new wiki pages, so no other bidirectional updates needed. |
| Wiki lint | `bun run wiki:lint` → 0 errors / 501 warnings (unchanged vs. SESSION_0178 baseline of 501; warnings are pre-existing R8 markdown spacing in `failed-steps-log.md` and 2 lineage spec orphans, none introduced by this session). |
| Kaizen reflection | `## Reflections` section present: yes (5 bullets covering helper-export pattern, Bun `skipIf` footgun, `LineageVisualGroup` NULL-distinct gotcha, FINDING_01 test-shape lesson, and hostile-review value on additive code). |
| Hostile close review | `SESSION_0179_REVIEW_01` appended to `docs/protocols/project-log.md`; verdict "aligned with caveats"; rubric 9.4 (verification honesty cap from FINDING_03); 3 new findings + 1 SESSION_0178 finding closed. |
| Review & Recommend | Next session goal written: yes — Goal + 6 input files + concrete first task (materializer hardening + ACL helper) recorded above. |
| Memory sweep | No operator-memory update required: ADR 0016 + ubiquitous language from SESSION_0178 still carry the lineage decisions; FINDING_01/02 are concrete code defects, not durable preferences. The Bun `skipIf` and `LineageVisualGroup` NULL-distinct gotchas live in `## Reflections` and `## Decisions resolved`; promotion to `failed-steps-log.md` is deferred until a second occurrence per `## Reflections` bullet 3. |
| Next session unblock check | Unblocked: SESSION_0180 first task touches the existing materializer + test file only; no user input required. SESSION_0178_FINDING_01/02 (full typecheck + global seed) remain explicit non-blockers for the slice. |
| Git hygiene | Branch `session-0179-lineage-read-model` (one commit ahead of `main` from SESSION_0178); single commit covering this session's code + docs; commit hash + push status reported in bow-out response. No `git push` issued — branch stays local pending user direction. |
| Graphify update | Post-commit graph refresh run; final node/edge/community count reported in bow-out response. |

## Status

closed-full
