---
title: "SESSION 0181 — Lineage Public Viewer Route + Viewer Integration Test"
slug: session-0181
type: session--implement
status: closed-quick
created: 2026-05-16
updated: 2026-05-16
last_agent: copilot-session-0181
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0180.md
  - docs/architecture/lineage/lineage-public-viewer-editor-routes.md
  - docs/architecture/decisions/0010-cache-strategy.md
  - docs/runbooks/graphify-repo-memory.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0181 — Lineage Public Viewer Route + Viewer Integration Test

## Date

2026-05-16 MDT

## Operator

Brian Scott + Copilot as Petey orchestrator, Cody implementer.

## Goal

Land the read-only `/lineage/[treeSlug]/page.tsx` public viewer route on top of the hardened materializer + ACL helper from SESSION_0180, and add integration coverage for the viewer-scoped read path (close SESSION_0180_FINDING_03). Park the `sop-e2e-user-lifecycle.md` §9 Lineage lifecycle section for a future docs session (after viewer + claim + editor routes have all landed).

## Bow-in Notes

- Opening ritual read from `docs/rituals/opening.md`.
- Latest closed session: `docs/sprints/SESSION_0180.md` (`closed-full`).
- Branch at bow-in: `session-0180-lineage-materializer-hardening` (clean tree). Cut `session-0181-lineage-public-viewer-route`.
- FAILED_STEPS scan: only FS-0021 open (schema-migration runbook gap) — not in scope (no schema changes).
- Drift Register scan: no open lineage entries.
- Alignment verification: cross-checked `listing-pattern-repurposing.md`, `lineage-listing-runbook.md`, `baseline-listings-runbook.md`, `sop-data-and-wiring-flows.md`, `sop-e2e-user-lifecycle.md`, `directory-monetization-roadmap.md` — all aligned, no contradictions, lineage viewer route is step 2 of the documented rollout order.

## Graphify Check

- Graph status: 6187 nodes, 11634 edges, 712 communities, 1212 files (1 commit behind HEAD; updated at SESSION_0180 close — acceptable).
- Queries run:
  - `graphify query "lineage public viewer route page.tsx getLineageTreeBySlug lineage-tree-section slug brand app/(web)/lineage" --budget 3000` → 17 nodes; key files: `lineage-public-viewer-editor-routes.md`, `lineage-listing-runbook.md`.
  - `graphify explain "apps/web/server/web/lineage/queries.ts"` → confirmed connections (db, payloads, prisma client, react, next/cache).
  - `graphify explain "apps/web/app/(web)/disciplines/_components/lineage-tree-section.tsx"` → confirmed imports (queries, payloads, tree-layout, lineage-tree-board, Stack, Note, Heading).
- Files selected from graph:
  - `apps/web/server/web/lineage/queries.ts` (getLineageTreeBySlug + materializer)
  - `apps/web/server/web/lineage/payloads.ts` (LineageTreePublicResult type)
  - `apps/web/app/(web)/disciplines/_components/lineage-tree-section.tsx` (reference consumer)
  - `apps/web/components/web/lineage/lineage-tree-board.tsx` (client island to reuse)
  - `docs/architecture/lineage/lineage-public-viewer-editor-routes.md` (route spec)
  - `docs/architecture/decisions/0010-cache-strategy.md` (cache rules)

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Next.js App Router page pattern (`app/(web)/` route + `generateMetadata` + server component data fetch). Reuses the existing `"use cache"` + `cacheTag` public read from `queries.ts`. |
| Extension or replacement | Extension. Adds a new public route that calls the existing `getLineageTreeBySlug` query — no new server layer, no new cache strategy. |
| Why justified | Step 2 of the documented rollout order in `lineage-public-viewer-editor-routes.md`. The materializer + ACL helper landed in SESSION_0180; this route is the first consumer of the public path in a standalone context. |
| Risk if bypassed | Editor route would have no proven public read surface to test against; the embedded viewer in `lineage-tree-section.tsx` uses the older `getLineageTreeForUser` BFS path, not the tree-by-slug materializer. |

## Petey plan

### Goal

Ship a public-only server-component page at `/lineage/[treeSlug]` that renders the materialized tree payload through existing primitives, then add an integration test proving the viewer-scoped path resolves correctly for authenticated/owner/non-owner cases.

### Tasks

#### TASK_01 — Cody: Public lineage viewer route

- **Agent:** Cody
- **What:** Create `apps/web/app/(web)/lineage/[treeSlug]/page.tsx` as a server component that:
  1. Resolves `brand` from middleware/host context (use `getBrand()` or equivalent existing pattern from the discipline page).
  2. Calls `getLineageTreeBySlug({ brand, slug: treeSlug })` (no viewer — PUBLIC path).
  3. Returns `notFound()` if null.
  4. Renders the materialized payload using `bucketByDepth` + `LineageTreeBoard` (same as `lineage-tree-section.tsx`).
  5. Exports `generateMetadata` with tree name + brand for SEO.
- **Done means:** `apps/web/app/(web)/lineage/[treeSlug]/page.tsx` compiles, type-checks, and renders a published PUBLIC tree at `/lineage/<slug>`. Non-published or non-PUBLIC trees return 404.
- **Depends on:** Nothing.

#### TASK_02 — Cody: Viewer-scoped integration test (close SESSION_0180_FINDING_03)

- **Agent:** Cody
- **What:** Add integration test coverage for `getLineageTreeBySlugForViewer` wire-up in `apps/web/server/web/lineage/queries.test.ts`:
  1. Fixture: a published tree with one PUBLIC member and one UNLISTED member, owned by a specific user.
  2. Test: unauthenticated call → only PUBLIC member visible.
  3. Test: authenticated non-owner call → PUBLIC + UNLISTED members visible.
  4. Test: authenticated owner call → PUBLIC + UNLISTED + RESTRICTED members visible.
  5. Test: non-published tree → null for all callers.
- **Done means:** `bun test server/web/lineage/queries.test.ts` passes with the new integration tests; SESSION_0180_FINDING_03 can be marked closed.
- **Depends on:** TASK_01 (route proves the public path works; test then extends to viewer path).

#### TASK_03 — Doug: Verification

- **Agent:** Doug
- **What:** Run typecheck, test suite, confirm no consumer regression, verify the route compiles and the existing `lineage-tree-section.tsx` is unchanged.
- **Steps:**
  1. `cd apps/web && bun test server/web/lineage`
  2. `cd apps/web && bun run typecheck` — filter for lineage symbols.
  3. Confirm `lineage-tree-section.tsx` imports unchanged.
  4. Record findings in this SESSION file.
- **Done means:** Verification section filled, no new lineage-scoped typecheck errors.
- **Depends on:** TASK_02.

### Parallelism

TASK_01 → TASK_02 → TASK_03 sequential (layered).

### Open decisions

- ~~Brand resolution in the new route~~ **RESOLVED:** `getRequestBrand()` from `~/lib/brand-context` is the canonical server-component helper (reads `x-brand` header injected by middleware). The discipline page uses raw `headers().get("x-brand")` directly — both work, but `getRequestBrand()` is the single-source-of-truth pattern. Use that.
- Profile eager-loading: the embedded viewer pre-fetches profiles for drawer. The standalone viewer should do the same. `getLineageProfile` is reusable.
- **Data shape adapter (new):** The materializer returns `LineageTreePublicResult` (members + `primaryVisualParentMemberId` parent pointers + visual groups). `LineageTreeBoard` expects `LineageRow[]` (from `bucketByDepth`) + `LineageRelationshipRow[]` edges. TASK_01 must include a small adapter (`membersToBoardData`) that: (a) extracts `member.node` into `LineageNodeRow[]`, (b) derives synthetic edges from `primaryVisualParentMemberId` pointers, (c) calls `bucketByDepth` on the result. This keeps `LineageTreeBoard` unchanged.
- **Passport drives display:** Confirmed. `lineageUserPayload` → `user.passport.displayName` is the canonical display name path. The adapter preserves this; no additional passport query needed.

### Scope guard

No editor route, no dashboard, no claim flow, no monetization, no schema changes, no new payload types. If brand resolution requires new middleware or layout changes, stop and re-plan.

## Task Log

SESSION_0181_TASK_01, SESSION_0181_TASK_02, SESSION_0181_TASK_03

## What landed

1. **TASK_01 — Public lineage viewer route:** `apps/web/app/(web)/lineage/[treeSlug]/page.tsx` — server component with `generateMetadata`, brand resolution via `getRequestBrand()`, `membersToBoardData()` adapter converting materializer output to `LineageTreeBoard` props.
2. **TASK_02 — Viewer-scoped integration tests:** 4 new tests in `queries.test.ts` proving unauthenticated/authenticated-non-owner/authenticated-owner/non-published visibility paths. Closes SESSION_0180_FINDING_03.
3. **TASK_03 — Doug verification:** Zero lineage typecheck errors, 21/21 tests pass, no consumer regressions.

## Files touched

- `apps/web/app/(web)/lineage/[treeSlug]/page.tsx` (created)
- `apps/web/server/web/lineage/queries.test.ts` (extended — 4 new tests, UNLISTED fixture)
- `docs/sprints/SESSION_0181.md` (created + closed)
- `docs/protocols/project-log.md` (appended task plan entries)

## Decisions resolved

- Brand resolution in standalone route: `getRequestBrand()` from `~/lib/brand-context` (canonical pattern).
- Data shape adapter: `membersToBoardData()` converts `primaryVisualParentMemberId` parent pointers → synthetic `LineageRelationshipRow[]` edges + `bucketByDepth` → `LineageRow[]`.
- Passport drives display: confirmed — `user.passport.displayName` via `lineageUserPayload`, no extra query.

## Open decisions / blockers

- Carried forward: SESSION_0178_FINDING_01 (app-wide typecheck baseline), SESSION_0178_FINDING_02 (seed idempotency), SESSION_0180_FINDING_01 (sequential DB reads in viewer path), SESSION_0180_FINDING_02 (LineageTreeAccess unused).
- SESSION_0180_FINDING_03 (viewer wire-up no integration test) — target for closure this session (TASK_02).
- Future docs task: add §9 Lineage lifecycle to `sop-e2e-user-lifecycle.md` once viewer + claim + editor routes have all landed.

## Verification

- Typecheck: zero lineage-scoped errors (`bunx tsc --noEmit | grep lineage` → empty).
- Tests: 21 pass, 0 fail, 48 expect() calls across `server/web/lineage/queries.test.ts`.
- `lineage-tree-section.tsx` unchanged (only new consumer added).

## Next session

- **Goal:** Lineage claim route (`/lineage/[treeSlug]/claim`) — lets an authenticated user claim a node on a published tree.
- **Inputs to read:** `lineage-public-viewer-editor-routes.md` §3 (claim flow spec), ADR 0016 (RankAward canonical promotion), SESSION_0181.md.
- **First task:** Petey plan for claim action + route + integration test.

## Status

closed-quick
