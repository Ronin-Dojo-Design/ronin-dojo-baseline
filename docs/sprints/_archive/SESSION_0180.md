---
title: "SESSION 0180 - Lineage Materializer Hardening + ACL Viewer Scope"
slug: session-0180
type: session--implement
status: closed-full
created: 2026-05-16
updated: 2026-05-16
last_agent: claude-session-0180
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0179.md
  - docs/runbooks/graphify-repo-memory.md
  - docs/architecture/lineage/lineage-v1-acceptance-test-plan.md
  - docs/architecture/lineage/lineage-public-viewer-editor-routes.md
  - docs/architecture/decisions/0010-cache-strategy.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0180 - Lineage Materializer Hardening + ACL Viewer Scope

## Date

2026-05-16 MDT

## Operator

Brian Scott + Claude as Petey orchestrator, Cody implementer, Doug/Giddy reviewer.

## Goal

Close SESSION_0179_FINDING_01 + FINDING_02 by hardening `materializeLineageTreeResult` so it never emits dangling `primaryVisualParentMemberId` or dangling `visualGroup.parentMemberId` references after visibility pruning. Then add the ACL viewer-scope helper (deferred from SESSION_0176) that widens `PUBLIC_VISIBILITY_SCOPE` to a viewer-aware predicate so authenticated viewers can see UNLISTED/RESTRICTED nodes they own. No UI changes; existing `getLineageRootForUser` / `getLineageTreeForUser` / `getLineageProfile` / `getLineageTreeBySlug` callers stay intact.

## Bow-in Notes

- Opening ritual read from `docs/rituals/opening.md`.
- Target repo: `/Users/brianscott/dev/ronin-dojo-app`.
- Latest closed session: `docs/sprints/SESSION_0179.md` (`closed-full`).
- Branch at bow-in: `session-0179-lineage-read-model` (clean tree). Will cut `session-0180-lineage-materializer-hardening` before any new code (matches the SESSION_0178 → 0179 pattern).
- FAILED_STEPS scan: only FS-0021 is open (schema-migration runbook gap) — not in scope for this session (no schema changes planned).
- Drift Register scan: no open lineage entries.
- `petey-plan-0082.md` reviewed and confirmed stale (SESSION_0082 tournament-ops planning). Current Petey plan lives in this file; the staged next-session block in SESSION_0179 is authoritative.

## Graphify Check

- Graph status: current at bow-in; `6184` nodes, `11628` edges, `720` communities, `1212` files (refreshed at SESSION_0179 close).
- Queries run:
  - `graphify query --depth 3 --budget 4000 "materializeLineageTreeResult primaryVisualParentMemberId visibility prune dangling parent reference lineage queries materializer harden"`
  - `graphify query --depth 2 --budget 2000 "ACL visibility helper viewer scope PUBLIC_VISIBILITY_SCOPE lineage queries"`
- Files selected from graph and verified directly:
  - `apps/web/server/web/lineage/queries.ts` (materializer + scope constant + four exported reads)
  - `apps/web/server/web/lineage/queries.test.ts` (existing fixtures to extend)
  - `apps/web/server/web/lineage/payloads.ts`
  - `apps/web/server/web/lineage/schemas.ts`
  - `apps/web/app/(web)/disciplines/_components/lineage-tree-section.tsx` (consumer surface)
  - `docs/architecture/lineage/lineage-v1-acceptance-test-plan.md` (ACL test rows)
  - `docs/architecture/lineage/lineage-public-viewer-editor-routes.md` (route plan that depends on this helper)
  - `docs/architecture/decisions/0010-cache-strategy.md` (cache rules for viewer-keyed reads)

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma read pattern (`server/<area>/queries.ts` + `payloads.ts` + `schemas.ts`) and the Next.js `"use cache"` + `cacheTag` + `cacheLife` cache strategy for unauthenticated reads. The ACL helper touches Dirstarter auth boundary (`auth()` session resolution + per-viewer scope). |
| Extension or replacement | Extension. Hardens an existing pure helper and adds a viewer-aware predicate alongside the existing constant scope; existing PUBLIC-only callers keep working unchanged. |
| Why justified | SESSION_0179 hostile review surfaced two concrete data-shape defects (dangling parent ids after pruning) that would break the upcoming editor / viewer routes silently. The ACL helper is the documented prerequisite for the dashboard editor route in `lineage-public-viewer-editor-routes.md`. |
| Risk if bypassed | Editor / viewer UI built on the current materializer would see `undefined` lookups when dereferencing `primaryVisualParentMemberId` into the survivor set; ACL helper deferred a second time would force the viewer route to hard-code PUBLIC scope and re-open the gap when private trees ship. |

Live Dirstarter docs check: deferred to close (re-checked against `https://dirstarter.com/docs/database/prisma` at SESSION_0179 bow-in 2026-05-16; this session reuses the same documented pattern with no new dependency surface).

## Petey plan

### Goal

Harden the materializer so the public tree-by-slug payload contains zero dangling member/group ids after visibility pruning, then add a viewer-aware visibility predicate that the upcoming dashboard editor route can call without re-implementing the scope rule.

### Tasks

#### TASK_01 - Cody: Materializer hardening (close FINDING_01 + FINDING_02)

- **Agent:** Cody
- **What:** Update `materializeLineageTreeResult` in `apps/web/server/web/lineage/queries.ts:241-267` so that after visibility pruning:
  1. For every surviving member whose `primaryVisualParentMemberId` points at a dropped member, set that field to `null`.
  2. For every surviving visual group whose `parentMemberId` points at a dropped member, set that field to `null` (do not drop the group; the group still scopes its own members).
  3. Confirm `defaultRootMemberId` still resolves to a surviving member; if it doesn't, set it to `null` so the UI falls back to its own root-selection logic.
- **Steps:**
  1. Compute `survivingMemberIds = new Set(visibleMembers.map(m => m.id))` once.
  2. Map `visibleMembers` to clear `primaryVisualParentMemberId` when not in the set.
  3. Map `visibleGroups` to clear `parentMemberId` when not in the set.
  4. Guard `defaultRootMemberId` against the same set.
  5. No payload type changes — `primaryVisualParentMemberId` / `parentMemberId` / `defaultRootMemberId` are already nullable in `payloads.ts`.
- **Done means:** Helper compiles unchanged in signature, produces zero dangling references, existing PUBLIC-only callers see the same surviving members + groups (only id-fields nulled where they previously dangled).
- **Depends on:** Nothing — SESSION_0179 landed the helper export and the test harness.

#### TASK_02 - Cody: Materializer unit tests for dangling-reference cases

- **Agent:** Cody
- **What:** Extend `apps/web/server/web/lineage/queries.test.ts` with pure-TS materializer assertions covering the two FINDING cases plus the `defaultRootMemberId` guard.
- **Steps:**
  1. Add fixture builder for a tree where `memberB.primaryVisualParentMemberId === memberA.id` and `memberA.node.visibility === RESTRICTED`. Assert `memberA` is dropped and `memberB.primaryVisualParentMemberId === null`.
  2. Add fixture for a visual group whose `parentMemberId` points at a RESTRICTED member. Assert the group survives (its own members are PUBLIC) and `group.parentMemberId === null`.
  3. Add fixture where `tree.defaultRootMemberId` points at a RESTRICTED member. Assert the materialized `defaultRootMemberId === null`.
  4. Update the SESSION_0179_FINDING_03 test name (`"preserves primaryVisualParentMemberId so PROMOTED_BY orientation survives"`) — drop the `PROMOTED_BY` overclaim; rename to reflect that this asserts id survival in the all-PUBLIC case.
- **Done means:** `cd apps/web && bun test server/web/lineage/queries.test.ts` reports the original 7 still passing plus the 3 new pure-TS assertions; renamed test reflects actual coverage.
- **Depends on:** TASK_01.

#### TASK_03 - Cody: ACL viewer-scope helper (close SESSION_0176 deferred)

- **Agent:** Cody
- **What:** Add a `resolveLineageVisibilityScope(viewer?)` helper to `apps/web/server/web/lineage/queries.ts` (or a sibling `acl.ts` module if Giddy prefers separation at the architecture pass) that returns the `LineageVisibility[]` array to use as the read scope:
  - No viewer → `[PUBLIC]` (matches today's constant).
  - Authenticated viewer → `[PUBLIC, UNLISTED]` baseline.
  - Viewer is the tree owner (matched via `LineageTree.ownerNodeId` resolving through their passport / membership) → `[PUBLIC, UNLISTED, RESTRICTED]`.
  - `PRIVATE` is never returned (reserved for owner-only read paths, future session).
- **Steps:**
  1. Wire `getLineageTreeBySlug` to accept an optional `viewer` arg and call the helper for both the tree-level visibility gate and the per-member filter. Default behavior (no viewer) stays identical.
  2. Keep `materializeLineageTreeResult` agnostic — it accepts a scope array now instead of using the module-level constant. PUBLIC callers pass `[PUBLIC]` explicitly.
  3. Add pure-TS unit tests for the helper: no viewer, viewer-not-owner, viewer-is-owner. Mock the owner-resolution boundary so the test does not require a DB fixture.
  4. Do NOT widen the cache tag yet — viewer-scoped reads will need a separate `"use cache: private"` variant (ADR 0010) and that lands with the editor route in a later session. For this session, when a `viewer` is passed, fall back to React `cache()` and skip the `"use cache"` block to avoid keying a public cache on viewer identity.
- **Done means:** Helper exists, is unit-tested for the three scope cases, and `getLineageTreeBySlug({brand, slug})` (no viewer) behaves bit-for-bit identical to SESSION_0179 (same cache tag, same payload, same null cases).
- **Depends on:** TASK_02 (avoids merge churn in the same test file).

#### TASK_04 - Doug + Giddy: Verification and handoff

- **Agent:** Doug + Giddy
- **What:** Verify the materializer guarantees, run the existing typecheck filter for lineage symbols, confirm no consumer regression, stage the next session.
- **Steps:**
  1. `cd apps/web && bunx prisma validate`; `bunx prisma migrate status`.
  2. `cd apps/web && bun test server/web/lineage` and `bun test lib/lineage`.
  3. `cd apps/web && bun run typecheck` — filter for `lineage`, `LineageTree`, `LineageTreeMember`, `LineageVisualGroup`, `materialize`, `resolveLineageVisibilityScope`. Document any new errors vs. the SESSION_0179 baseline.
  4. Grep `lineage-tree-section.tsx` and any other `getLineageTreeBySlug` callers to confirm the no-viewer default still compiles unchanged.
  5. Giddy: confirm ACL helper placement (in-module vs. sibling `acl.ts`); confirm cache-tag boundary call-out (no viewer-scoped data goes into the public `"use cache"` block).
  6. Record findings + next session in this SESSION file and `docs/protocols/project-log.md`.
- **Done means:** SESSION_0180 has review evidence, blockers, and a next-session recommendation; project-log has TASK_PLAN + REVIEW entries.
- **Depends on:** TASK_03.

### Parallelism

TASK_01 → TASK_02 → TASK_03 are sequential (same file, layered guarantees). TASK_04 runs after TASK_03; Giddy may read the route plan + ADR 0010 in parallel with Doug's command runs.

### Agent assignments

| Task | Agent | Rationale |
|---|---|---|
| TASK_01 | Cody | Direct edit of an existing pure helper; no architecture decisions left from Petey. |
| TASK_02 | Cody | Extends the test file Cody just authored in SESSION_0179. |
| TASK_03 | Cody | Helper has a documented contract (PUBLIC/UNLISTED/RESTRICTED ladder); Giddy reviews placement at TASK_04. |
| TASK_04 | Doug + Giddy | Hostile close + verification; Giddy owns the cache-tag boundary call-out. |

### Open decisions

- Placement of `resolveLineageVisibilityScope`: in-module (`queries.ts`) vs. sibling `acl.ts`. **Provisional:** in-module — single small function, the existing module is already the lineage read-path entry point. Giddy reverses at TASK_04 review if the helper grows.
- Owner-resolution boundary: how `viewer → ownerNodeId` is matched. **Provisional:** `viewer.passportId === tree.ownerNodeId` direct match for this session; org-/role-mediated ownership deferred to the editor-route session.

### Risks

- Cache tag widening: if Cody accidentally lets a viewer-scoped read enter the existing `"use cache"` block, the public cache will be poisoned with private data. TASK_03 step 4 makes this explicit; TASK_04 step 5 is the verification gate.
- Test fixture rebuild cost: `LineageVisualGroup` NULL-distinct gotcha (recorded in SESSION_0179 Reflections + Decisions resolved) — new fixtures touching visual groups must give each group a distinct `promotionDate` to avoid the unique-index collision.
- Pre-existing app-wide typecheck failures (Zod resolver, Resend, Slot prop, DayOfWeek, Next config duplicate types) carry over from SESSION_0178. We continue to assert *no new lineage errors* only.

### Scope guard

No UI, no editor routes, no claim actions, no React canvas port, no D3 removal, no schema changes, no new payload types. Any drift goes into `Open decisions / blockers`. If the ACL helper begins to require schema changes (e.g., owner-resolution needs a new join), stop and re-plan at the schema-change layer instead.

### Dirstarter implementation template

- **Docs read first:** SESSION_0179 (close), `docs/architecture/lineage/lineage-v1-acceptance-test-plan.md`, `docs/architecture/lineage/lineage-public-viewer-editor-routes.md`, `docs/architecture/decisions/0010-cache-strategy.md`, `docs/runbooks/sop-test-writing.md`.
- **Baseline pattern to extend:** `server/<area>/queries.ts` pure-helper export pattern; `"use cache"` + `cacheTag` + `cacheLife` for unauthenticated reads; React `cache()` for viewer-scoped reads.
- **Custom delta:** Materializer survives all id-references; viewer-aware visibility predicate replaces the constant scope.
- **No-bypass proof:** ACL helper uses the same `LineageVisibility` enum + Brand filter pattern; the cache-strategy split (public vs. private) follows ADR 0010 explicitly.

## Pre-flight: Backend - Lineage materializer hardening + ACL helper

> Cody fills this in at preflight before writing any code. Skeleton below; populate from `docs/protocols/cody-preflight.md`.

### 1. Auth predicates planned

- [ ] Materializer: pure helper, no auth (visibility scope is the only filter, passed in by caller).
- [ ] ACL helper: takes optional `viewer` (`Session` or `null`), returns `LineageVisibility[]`.
- [ ] Cache boundary: public `getLineageTreeBySlug({brand, slug})` keeps `"use cache"`; viewer-scoped variant uses React `cache()`.

### 2. Existing action scan

- To consult: `apps/web/server/web/lineage/queries.ts` (4 existing exports + materializer), `apps/web/server/web/lineage/payloads.ts` (nullable id fields confirmed), `apps/web/lib/auth.ts` (viewer / session shape).

### 3. Data flow reference

- `docs/runbooks/sop-data-and-wiring-flows.md` — viewer-aware read flow.
- `docs/architecture/decisions/0010-cache-strategy.md` — `"use cache"` vs. `cache()` for viewer-keyed reads.

### 4. FAILED_STEPS check

- FS-0008 (primitive/enum spot-check): re-confirm `LineageVisibility` enum values before widening (`PUBLIC | UNLISTED | RESTRICTED | PRIVATE`).
- FS-0021 (schema migration runbook): not in scope; no schema change planned. Stop and replan if ACL helper demands a new join.

## Task Log

SESSION_0180_TASK_01, SESSION_0180_TASK_02, SESSION_0180_TASK_03, SESSION_0180_TASK_04

## What landed

- **TASK_01 done** — `materializeLineageTreeResult` in `apps/web/server/web/lineage/queries.ts` now normalizes every id reference after visibility pruning:
  - `member.primaryVisualParentMemberId` set to `null` when the referenced parent was dropped from the surviving set (closes SESSION_0179_FINDING_01).
  - `visualGroup.parentMemberId` set to `null` when the referenced member was dropped (closes SESSION_0179_FINDING_02).
  - `defaultRootMemberId` (both top-level and inside the `tree` summary) set to `null` when the chosen root is outside the scope. Was previously a latent third dangling-id risk; surfaced and closed proactively.
  - Helper also took an optional `scope` arg defaulting to `PUBLIC_VISIBILITY_SCOPE`, so viewer-aware callers can pass their resolved scope without the helper depending on the module-level constant.
- **TASK_02 done** — `apps/web/server/web/lineage/queries.test.ts` extended with 4 pure-TS materializer tests for the new guarantees: dropped-parent → null, dropped-group-parent → null, dropped-root → null + summary mirror, and an explicit "preserves root when it survives" positive case. SESSION_0179_FINDING_03 test rename applied (`"preserves primaryVisualParentMemberId so PROMOTED_BY orientation survives"` → `"preserves primaryVisualParentMemberId when the parent member survives the scope filter"`) to remove the `PROMOTED_BY` overclaim. One additional helper test confirms a non-PUBLIC scope surfaces UNLISTED for authenticated readers.
- **TASK_03 done** — `resolveLineageVisibilityScope({ authenticated, isOwner })` pure helper exported from `queries.ts`. Returns `[PUBLIC]` for unauthenticated, `[PUBLIC, UNLISTED]` for authenticated non-owner, `[PUBLIC, UNLISTED, RESTRICTED]` for owner; never returns `PRIVATE`. Five new unit tests cover the three scope cases, the never-PRIVATE invariant, and the "isOwner ignored when unauthenticated" precondition.
- **TASK_03 done** — `getLineageTreeBySlug` refactored into a thin dispatcher with two private implementations:
  - `getLineageTreeBySlugPublic` (no viewer) keeps the existing `"use cache"` + `cacheTag` + `cacheLife` shared-cache fast path, scoped to PUBLIC only.
  - `getLineageTreeBySlugForViewer` (viewer present) uses React `cache()` for request-scoping, resolves the viewer's `LineageNode.id`, compares to `tree.ownerNodeId` for owner status, then materializes against the resolved scope. UNLISTED and RESTRICTED enter the result only through this path.
  - Public signature is fully backward-compatible: the optional `viewer?: { userId: string } | null` argument is omittable; existing callers see identical behavior.
- **TASK_04 done** — Doug verification (prisma validate, prisma migrate status, scoped + pure helper tests, full typecheck filtered for `lineage|LineageTree|LineageTreeMember|LineageVisualGroup|materialize|resolveLineageVisibilityScope`, consumer-export grep, `git diff --check`) all clean. Giddy boundary verdict: the cache split is sound — shared `"use cache"` never sees viewer-scoped data; viewer-scoped `cache()` never enters the shared store.

## Files touched

- `apps/web/server/web/lineage/queries.ts` — TASK_01 (materializer reference hardening + optional `scope` arg) + TASK_03 (`resolveLineageVisibilityScope` helper, public/viewer dispatcher split, viewer-scoped path with owner resolution).
- `apps/web/server/web/lineage/queries.test.ts` — TASK_02 (4 new materializer tests + 1 scope-widening test + SESSION_0179_FINDING_03 rename) + TASK_03 (5 new `resolveLineageVisibilityScope` tests).
- `docs/sprints/SESSION_0180.md` — this file; Petey plan, pre-flight skeleton, verification, hostile close, next session.
- `docs/protocols/project-log.md` — appended SESSION_0180 task plan + review entries.
- `docs/knowledge/wiki/index.md` — added SESSION_0180 row; bumped `last_agent` and `updated`.

## Decisions resolved

- Materializer accepts a `scope` arg with a `PUBLIC_VISIBILITY_SCOPE` default rather than reading the module constant directly. Keeps the helper pure and lets the viewer path inject the resolved scope; existing PUBLIC callers see no behavior change.
- `getLineageTreeBySlug` split into two private cached implementations instead of one function with a runtime branch. Next.js `"use cache"` is a function-level directive; runtime branching would either poison the shared cache key with viewer identity or silently drop the cache. Splitting makes the boundary explicit and auditable.
- `resolveLineageVisibilityScope` takes pre-resolved booleans (`authenticated`, `isOwner`) rather than a `Session` / `LineageTree` pair. Keeps the helper pure and unit-testable without DB or auth mocks; the wire-up function (`getLineageTreeBySlugForViewer`) owns the DB lookup for owner status.
- Owner resolution this session is direct: `viewerNode.id === tree.ownerNodeId`. Org-mediated / role-mediated ownership and `LineageTreeAccess` ACL grants are deferred to the editor-route session, per the Petey plan's open-decisions note.
- `defaultRootMemberId` normalization (top-level + summary) added as a third hardening case. The Petey plan called it out as a TASK_01 step; the implementation also mirrored the null into `tree.defaultRootMemberId` inside the summary so the consumer can read either path safely.
- Helper placement: stayed in `queries.ts` rather than a sibling `acl.ts`. Single ~20-line helper, already imports the same enum; promoting to its own module without a second consumer would be premature.

## Open decisions / blockers

- Carried forward from SESSION_0178/0179:
  - SESSION_0178_FINDING_01 (open) — app-wide typecheck baseline failures (Zod resolver, Resend, Slot prop, Next config duplicate types, DayOfWeek enum). Filtered lineage scope is empty this session; baseline failures are unchanged.
  - SESSION_0178_FINDING_02 (open) — global `bun run db:seed` still not idempotent (`User.email` P2002). Not exercised.
- Closed-on-land:
  - SESSION_0179_FINDING_01 → closed by SESSION_0180_TASK_01 + TASK_02.
  - SESSION_0179_FINDING_02 → closed by SESSION_0180_TASK_01 + TASK_02.
  - SESSION_0179_FINDING_03 → closed by SESSION_0180_TASK_02 (test rename + scoped coverage).
- **SESSION_0180_FINDING_01 (new, medium)** — `getLineageTreeBySlugForViewer` issues two sequential DB reads (tree + viewer node) instead of one combined query. For an editor route on a deep tree this is fine; for a hot list view that calls the function in a loop it would compound. Future optimization: include `lineageNodes` filtered by `userId` in the same query, or pre-resolve the viewer's node id at the page boundary. Not blocking for the editor route.
- **SESSION_0180_FINDING_02 (new, low)** — `LineageTreeAccess` table is in the schema but unused by this read path. RESTRICTED visibility currently means "owner only," not "owner + explicit access grants." Closing this requires consulting `LineageTreeAccess` rows in `getLineageTreeBySlugForViewer`; deferred to the editor-route session when the access-grant admin UI lands together.
- **SESSION_0180_FINDING_03 (new, low)** — Viewer path is not integration-tested against a real DB. Pure-helper tests cover the scope contract, but the wire-up function (owner resolution + scope dispatch + materializer call) has no end-to-end fixture. Acceptable for this session: the unit tests + the diff are small and the upcoming editor-route session will exercise the wire-up. Promotion to integration coverage queued for SESSION_0181.

## Hostile close review

- **Review log:** `SESSION_0180_REVIEW_01` (appended to `docs/protocols/project-log.md`).
- **Dirstarter docs check:** No re-check needed at close. Re-verified against `https://dirstarter.com/docs/database/prisma` at SESSION_0179 bow-in 2026-05-16; this session reuses the same documented Prisma `select`-with-payload + `"use cache"` + `cacheTag` + `cacheLife` patterns. The viewer-scoped path uses React `cache()`, which is governed by `docs/architecture/decisions/0010-cache-strategy.md` and is itself documented in Next.js / Better-Auth flows already used by this codebase.
- **Sources:** `docs/architecture/decisions/0010-cache-strategy.md`, `docs/architecture/lineage/lineage-public-viewer-editor-routes.md`, `docs/architecture/lineage/lineage-v1-acceptance-test-plan.md`, `docs/runbooks/sop-test-writing.md`.
- **Verdict:** Aligned. The change set is two layered guarantees against the SESSION_0175 lineage query module: a pure-helper hardening pass that removes the dangling-id defect surfaced by SESSION_0179, and a viewer-aware scope helper that the upcoming editor route can call without re-implementing the visibility ladder. The cache split is the strict-correct read of ADR 0010 (shared cache never sees viewer-scoped data). Three new findings are honest follow-ups — none reverse a guarantee, none block the editor route. Score gate: WORKFLOW 5.0 rubric 9.6 (verification honesty cap at 9.6 because the viewer wire-up has only pure-helper coverage; FINDING_03). Hard caps: data-integrity cap not triggered (RESTRICTED never leaks; owner check requires exact id match); Dirstarter-compliance cap not triggered.

### Hostile-review axis scores

- **Plan sanity (10/10):** Petey plan matched the diff exactly. No scope drift. The TASK_01 `defaultRootMemberId` guard was anticipated in the plan and landed.
- **Dirstarter alignment (10/10):** Same Prisma select + payload pattern, same cache tags. The viewer path explicitly avoids the `"use cache"` block — that is the documented Dirstarter / ADR 0010 boundary.
- **Security/data integrity (9/10):** Public path is unchanged in behavior (regression-tested via existing 7 SESSION_0179 cases). Viewer path enforces `isOwner` via exact id match before widening to RESTRICTED; PRIVATE never returned. Minor: FINDING_02 means owner-only RESTRICTED is correct but explicit-access-grant RESTRICTED is still not honored — the table exists, the code doesn't read it yet. Documented, not silently dropped.
- **Verification honesty (8/10):** 10 new unit tests (4 materializer hardening + 1 scope-widening + 5 ACL helper) prove the contracts. Viewer wire-up (`getLineageTreeBySlugForViewer`) has zero integration coverage this session (FINDING_03). Honest write-up of the gap in `Open decisions / blockers`.
- **WORKFLOW 5.0 compliance (10/10):** Petey plan with stable task IDs, dedicated branch, Graphify-first discovery, full-close evidence artifact below, pre-flight section, hostile review run.

## ADR / ubiquitous-language check

- No new ADR. The public/viewer cache split is explicitly the resolution path described in `docs/architecture/decisions/0010-cache-strategy.md`; this session is an implementation of that decision, not a new one.
- Ubiquitous Language: no new terms. `LineageVisibility`, `LineageTree`, `LineageNode`, and `LineageTreeAccess` are all pre-existing; the helper name `resolveLineageVisibilityScope` mirrors the established `resolve*Scope` predicate naming used elsewhere.

## Verification

| Check | Command | Result |
| --- | --- | --- |
| Prisma validate | `cd apps/web && bunx prisma validate` | passed (`The schema at prisma/schema.prisma is valid`) |
| Migration status | `cd apps/web && bunx prisma migrate status` | passed (`Database schema is up to date!`, 32 migrations) |
| Lineage queries test | `cd apps/web && bun test server/web/lineage/queries.test.ts` | 17 pass / 0 fail / 31 expect (~629ms) |
| Lib lineage test | `cd apps/web && bun test lib/lineage` | 3 pass / 0 fail (~54ms) |
| Scoped typecheck (filtered) | `bunx tsc --noEmit -p . 2>&1 \| grep -iE "lineage\|LineageTree\|LineageTreeMember\|LineageVisualGroup\|materialize\|resolveLineageVisibilityScope\|server/web/lineage"` | zero hits — no regression. |
| Full typecheck baseline | `bunx tsc --noEmit -p . 2>&1 \| wc -l` | 908 lines (SESSION_0179 baseline; unchanged). |
| Consumer export check | `grep` of `lineage-tree-section.tsx` for `getLineageRootForUser`, `getLineageTreeForUser`, `getLineageProfile` | all three exports preserved; consumer imports unchanged. |
| `getLineageTreeBySlug` call sites | repo grep | only the test file (`queries.test.ts`); production callers land with the editor route in a later session. |
| Diff hygiene | `git diff --check` | passed (exit 0) |

## Reflections

- The cache split (`Public` + `ForViewer` sibling functions dispatched by an outer thin function) was forced by Next.js semantics: `"use cache"` is a function-level directive, you cannot conditionally bypass it inside one function body. The pattern is reusable for every future query that has both a public and a viewer-scoped variant — worth lifting into the ADR 0010 implementation rules section as a concrete pattern next time the ADR is revised.
- Pre-resolving booleans (`authenticated`, `isOwner`) instead of passing a `Session` to the scope helper kept the test suite zero-mock. Lesson: scope helpers should accept the smallest decision-relevant inputs, not framework objects. Same shape applies to the next ACL helper variants (`canEditLineageTree`, `canPublishLineageTree`).
- `defaultRootMemberId` normalization was a third dangling-id risk that hostile review on SESSION_0179 did not surface. Found at plan-time when re-reading the materializer — the lesson is to scan *every* nullable id field on the payload, not just the ones the prior findings called out.
- Owner-resolution doing two sequential DB reads (FINDING_01) was the right tradeoff today (one shared query risks Prisma's `findFirst`-with-relation N+1 surprises against the materialized payload), but future hot paths should batch.
- The `LineageTreeAccess` table is sitting unused (FINDING_02). Calling it out in `Open decisions / blockers` keeps it from quietly becoming dead schema; the next editor-route session is the right place to wire it in.

## Next session

- **Goal:** Land the read-only `/lineage/[brand]/[slug]` public viewer route on top of the now-hardened materializer + ACL helper, and add integration coverage for the viewer-scoped read path (close SESSION_0180_FINDING_03). Optionally start the `LineageTreeAccess` consultation path (close SESSION_0180_FINDING_02) if scope allows.
- **Inputs to read:** `docs/sprints/SESSION_0180.md` (this file, especially Open decisions / blockers + Verification), `docs/architecture/lineage/lineage-public-viewer-editor-routes.md` (route plan), `apps/web/server/web/lineage/queries.ts` (the two dispatched implementations), `apps/web/app/(web)/disciplines/_components/lineage-tree-section.tsx` (the existing consumer surface to mirror), `docs/architecture/decisions/0010-cache-strategy.md` (the cache split contract this route consumes).
- **First task:** Cody adds `apps/web/app/(web)/lineage/[brand]/[slug]/page.tsx` calling `getLineageTreeBySlug({ brand, slug })` (unauthenticated PUBLIC path) and renders the materialized payload through the existing tree section primitives. Server-component only; no editor UI; no client-side state. The second task widens to the viewer-scoped path (`getServerSession` → pass viewer) and pre-stages an integration test fixture against a published tree with one UNLISTED member and one owner-viewer scenario.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Touched docs: `SESSION_0180.md` (frontmatter created with JETTY 3.0, `status: closed-full`, `type: session--implement` set at close), `docs/knowledge/wiki/index.md` (`last_agent` → `claude-session-0180`, `updated` bumped, SESSION_0180 row added), `docs/protocols/project-log.md` (append-only, no frontmatter change). Code files (`queries.ts`, `queries.test.ts`) carry inline `Author: ... SESSION_0180` tags on the new helpers — no wiki frontmatter required. |
| Backlinks/index sweep | SESSION_0180 row added to `wiki/index.md` session table; SESSION_0180 frontmatter `pairs_with` lists SESSION_0179 + graphify runbook + the two lineage spec docs + ADR 0010. SESSION_0179 not amended (closed-full, append-only). No new wiki pages, so no other bidirectional updates needed. |
| Wiki lint | `bun run wiki:lint` → final response will report; expected baseline unchanged from SESSION_0179 (501 warnings, 0 errors). |
| Kaizen reflection | `## Reflections` present: yes (5 bullets — cache-split pattern, pre-resolved-booleans helper shape, third-dangling-id discovery, owner-resolution batching note, `LineageTreeAccess` dead-schema callout). |
| Hostile close review | `SESSION_0180_REVIEW_01` appended to `docs/protocols/project-log.md`; verdict "aligned"; rubric 9.6 (verification honesty cap from FINDING_03); 3 new findings + 3 SESSION_0179 findings closed. |
| Review & Recommend | Next session goal written: yes — Goal + 5 input files + concrete first task (route landing + viewer integration coverage) recorded above. |
| Memory sweep | No operator-memory update required: ADR 0010 already governs the cache split (no new philosophy); the FINDING list is concrete code follow-ups, not durable preferences. Lessons live in `## Reflections` / `## Decisions resolved`. |
| Next session unblock check | Unblocked: SESSION_0181 first task touches a new file (`app/(web)/lineage/[brand]/[slug]/page.tsx`) on top of the shipped read API — no user input required. SESSION_0178_FINDING_01 / SESSION_0180_FINDING_02 / SESSION_0180_FINDING_03 remain explicit non-blockers for the slice. |
| Git hygiene | Branch `session-0180-lineage-materializer-hardening` (one commit ahead of `session-0179-lineage-read-model` from SESSION_0179); single commit covering this session's code + docs; commit hash + push status reported in bow-out response. No `git push` issued — branch stays local pending user direction. |
| Graphify update | Post-commit graph refresh queued; final node/edge/community count reported in bow-out response. |

## Status

closed-full
