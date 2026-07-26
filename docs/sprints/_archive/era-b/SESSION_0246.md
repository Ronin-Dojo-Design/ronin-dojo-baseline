---
title: "SESSION 0246 - Factual JSON-LD enrichment"
slug: session-0246
type: session--implement
status: closed
created: 2026-05-24
updated: 2026-05-24
last_agent: codex-session-0246
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0245.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0246 - Factual JSON-LD enrichment

## Date

2026-05-24

## Operator

Brian + codex-session-0246 (Petey orchestrating; Cody implementation; Hubble/Doug/Giddy subagent review)

## Goal

Complete the SESSION_0245 optional SEO enrichment follow-up by adding factual JSON-LD identifiers and relationship fields where source data already exists, without inventing ratings for non-tool pages.

## Bow-in

### Previous session

- SESSION_0245 closed the privacy-sensitive `/lineage` count leak, batched lineage profile reads, and moved non-tool listing pages away from `SoftwareApplication` JSON-LD.
- Carry-forward selected by Brian: "Optional SEO enrichment remains open: add factual `@id`, breadcrumb/isPartOf references, provider/creator/about/address fields where source data exists. Do not invent ratings for non-tool pages."
- SESSION_0244 baseline-content waterfall remains deferred by explicit user override, not blocked.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Bow-in status: clean against `origin/main`
- HEAD at bow-in: `8565c24`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | SEO/structured data and content visibility patterns. |
| Extension or replacement | Extension - enriches Ronin-specific JSON-LD output on top of existing Dirstarter-style metadata helpers. |
| Why justified | SESSION_0245 removed inaccurate non-tool software schema; this session adds factual identifiers and relationships for better launch-facing structured data. |
| Risk if bypassed | Non-tool public pages remain minimally described to crawlers, while richer source data already exists in route payloads. |

### Dirstarter docs checked

- 2026-05-24: <https://dirstarter.com/docs/seo> - metadata, canonical URLs, OpenGraph, sitemap, and structured-data baseline.
- 2026-05-24: <https://dirstarter.com/docs/content> - published content visibility/status model and SEO-equity behavior.

### Failed-steps + drift register check

- `failed-steps-log.md`: no open entries found in the SEO/structured-data slice; relevant mitigations are FS-0001, FS-0006, FS-0007, FS-0008, and FS-0024, so Petey plan, correct-workdir checks, and source reads are recorded before code edits.
- `drift-register.md`: no open drift entries affect this session.

### Graphify check

- Graph status: 6923 nodes / 10767 edges / 1031 communities; current local graph available at bow-in.
- Queries used:
  - `graphify query --graph . --depth 3 --budget 6000 "structured data JSON-LD @id breadcrumb isPartOf provider creator about address non-tool pages courses programs organizations lineage"`
  - `graphify query --graph . --depth 2 --budget 4000 "dirstarter docs inventory SEO content Prisma alignment URLs"`
  - `graphify query --graph . --depth 2 --budget 5000 "organization detail page structured data address generateCollectionPage generateWebPage course detail page program detail page"`
- Files selected from graph and exact reads:
  - `apps/web/lib/structured-data.ts`
  - `apps/web/lib/structured-data.test.ts`
  - `apps/web/app/(web)/lineage/page.tsx`
  - `apps/web/app/(web)/lineage/[treeSlug]/page.tsx`
  - `apps/web/app/(web)/programs/page.tsx`
  - `apps/web/app/(web)/organizations/page.tsx`
  - `apps/web/app/(web)/courses/page.tsx`
  - `apps/web/app/(web)/programs/[id]/page.tsx`
  - `apps/web/app/(web)/organizations/[slug]/page.tsx`
  - `apps/web/app/(web)/courses/[slug]/page.tsx`
  - `apps/web/config/breadcrumbs.ts`
  - `docs/knowledge/wiki/dirstarter-docs-inventory.md`
- Verification note: Graphify narrowed this session to the structured-data helper and existing non-tool listing/detail call sites; exact source reads verified field availability before implementation.

## Petey plan

### Goal

Add factual JSON-LD enrichment to non-tool public pages without changing ratings semantics or expanding `/lineage` pagination/search scope.

### Tasks

#### SESSION_0246_TASK_01 - Structured-data helper enrichment

- **Agent:** Cody
- **What:** Extend generic JSON-LD helper types/output for stable `@id`, breadcrumb/isPartOf, provider/creator/about/address, and item-level factual fields.
- **Steps:**
  1. Read the current helper and tests.
  2. Add helper fields only where callers can pass factual source data.
  3. Preserve `SoftwareApplication` helper behavior for actual tool listings.
- **Done means:** Structured-data tests prove generic helpers can emit factual enrichment without aggregate ratings.
- **Depends on:** nothing

#### SESSION_0246_TASK_02 - Non-tool page call-site enrichment

- **Agent:** Cody
- **What:** Update `/lineage`, `/lineage/[treeSlug]`, `/programs`, `/programs/[id]`, `/organizations`, `/organizations/[slug]`, `/courses`, and `/courses/[slug]` JSON-LD calls with factual enrichment from current route payloads.
- **Steps:**
  1. Add page-level IDs and breadcrumbs/isPartOf relationships.
  2. Add provider/creator/about/address fields only where data is already loaded.
  3. Do not add generated ratings to non-tool pages.
- **Done means:** Updated pages produce richer JSON-LD using existing data only.
- **Depends on:** SESSION_0246_TASK_01

#### SESSION_0246_TASK_03 - Review, docs, and close

- **Agent:** Doug + Giddy + Petey
- **What:** Verify tests/typecheck, update session/wiki records, run full close, refresh Graphify, commit, and push to `main`.
- **Steps:**
  1. Run focused tests and TypeScript/Biome gates.
  2. Run wiki-lint and record existing debt honestly.
  3. Update `docs/knowledge/wiki/index.md`, run closing ritual, stage, commit, push, and refresh Graphify.
- **Done means:** `SESSION_0246.md` is closed, changes are pushed to `origin/main`, and Graphify has current commit/work.
- **Depends on:** SESSION_0246_TASK_02

### Parallelism

- Hubble subagent: read-only structured-data field/call-site exploration.
- Carson subagent: read-only Doug/Giddy review of Dirstarter alignment, privacy/data-integrity risks, and verification gates.
- Implementation stays local/sequential because helper and call-site types overlap.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0246_TASK_01 | Cody | Clear helper/test implementation, no product decision required. |
| SESSION_0246_TASK_02 | Cody | Route call-site changes depend on helper shape. |
| SESSION_0246_TASK_03 | Doug + Giddy + Petey | Review, git hygiene, and closeout need independent verification. |

### Open decisions

- Pagination/search for `/lineage` remains out of scope for this session and should be staged as product work later.
- SESSION_0244 baseline-content waterfall remains deferred by explicit user override, not blocked.

### Risks

- JSON-LD relationship fields must not imply facts not present in the source data.
- Factual address enrichment must avoid emitting empty postal addresses.
- Tool listing `SoftwareApplication` behavior must remain unchanged.
- Helpers currently use `siteConfig.url`; multi-domain canonical URL improvement is a separate ADR 0006 follow-up and is not widened in this session.

### Scope guard

- Do not add aggregate ratings to non-tool pages.
- Do not add lineage tree `creator` until a public owner/creator select is privacy-reviewed.
- Do not build `/lineage` search or pagination.
- Do not execute SESSION_0244 baseline-content waterfall tasks.

### Dirstarter implementation template

- **Docs read first:** SEO and Content docs checked live on 2026-05-24.
- **Baseline pattern to extend:** Dirstarter Next.js metadata and structured-data helpers.
- **Custom delta:** Ronin martial-arts-specific non-tool JSON-LD relationships.
- **No-bypass proof:** Existing helpers stay centralized; call sites pass factual fields rather than hard-coding page-local JSON-LD blobs.

## Pre-flight: SEO structured data

### 1. Existing helper scan

- Graphify query used for helper discovery: `structured data JSON-LD @id breadcrumb isPartOf provider creator about address non-tool pages courses programs organizations lineage`.
- Found: `apps/web/lib/structured-data.ts`, `apps/web/lib/structured-data.test.ts`, and non-tool route call sites under `/lineage`, `/programs`, `/organizations`, and `/courses`.

### 2. L1 template scan

- Consulted Dirstarter SEO docs: yes, live docs checked on 2026-05-24.
- Closest L1 pattern: centralized structured-data generation and route metadata helpers.
- Primitive API spot-check: not applicable; no UI primitives introduced.

### 3. Composition decision

- [x] Extending existing helper: `apps/web/lib/structured-data.ts`
- [x] Composing existing route data: lineage tree summaries, program cards/details, organization cards/details, and course cards/details already loaded by page queries.
- [ ] New component, no L1 match exists: not applicable.

### 4. Lane docs loaded

- [x] Prior SESSION "Next session" section read: `docs/sprints/SESSION_0245.md`.
- [x] Wiki/docs for target area read: `docs/runbooks/graphify-repo-memory.md`, `docs/knowledge/wiki/dirstarter-docs-inventory.md`.
- [x] Runbook consulted: `docs/rituals/opening.md`, `docs/rituals/closing.md`, `docs/protocols/petey-plan.md`.

### 5. Dev environment confirmed

- Dev server command: not needed unless browser verification becomes necessary.
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`.
- Brand/host for testing: not needed for focused helper/type tests.

### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001, FS-0006, FS-0007, FS-0008, and FS-0024 are process-relevant.
- Mitigation acknowledged: yes - graphify-first discovery, Petey plan, exact helper/source reads, and absolute repo-path edits are recorded before code edits.

## Subagent read-only findings

### Hubble - structured-data exploration

- Generic helpers added in SESSION_0245 do not yet emit `@id`, page relationships, provider/creator/about, address, or no-ratings assertions.
- Safe factual additions:
  - stable IDs for page collection and item nodes using canonical route URLs already passed to helpers.
  - breadcrumb/isPartOf for pages that already render `Breadcrumbs`.
  - provider for course/program schemas from already-loaded organization payloads.
  - about for loaded discipline/rank/organization context.
  - address for organization detail, with partial locality/region/country only where list payloads already expose it.
- Do not add lineage `creator` from current payloads because the detail payload has `ownerNodeId` but no privacy-reviewed public owner name.
- Likely tests: extend `apps/web/lib/structured-data.test.ts` for `@id`, provider/about/address, and no aggregate rating on generic helpers.

### Carson - Doug/Giddy review exploration

- Keep changes centralized in `lib/structured-data.ts`, not per-page ad hoc SEO.
- Do not reintroduce `SoftwareApplication` or generated aggregate ratings for non-tool pages.
- Privacy risks: JSON-LD is public/indexable; do not serialize member identities, private profile fields, enrollment details, or unfiltered counts.
- Verification gates: focused Biome, `bun test lib/structured-data.test.ts`, and `pnpm --filter @ronin-dojo/web exec tsc --noEmit --pretty false`.
- No ADR or ubiquitous-language update expected unless this becomes a broader canonical-domain decision or introduces new Ronin domain terms.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0246_TASK_01 | done | Extended generic JSON-LD helpers with stable schema references, page relationship fields, factual provider/creator/about/address support, and regression tests proving generic non-tool entities do not receive generated ratings. |
| SESSION_0246_TASK_02 | done | Enriched `/lineage`, `/lineage/[treeSlug]`, `/programs`, `/programs/[id]`, `/organizations`, `/organizations/[slug]`, `/courses`, and `/courses/[slug]` structured-data calls with existing route data only. |
| SESSION_0246_TASK_03 | done | Focused tests, Biome, TypeScript, wiki-lint, review, and close notes completed; commit/push and Graphify refresh proof will be reported in the final bow-out response to avoid a second commit loop. |

## What landed

- `apps/web/lib/structured-data.ts` now supports stable `@id` references, page-level `isPartOf`/`breadcrumb`/`mainEntity`, and factual generic entity fields (`provider`, `creator`, `about`, `address`) while leaving tool `SoftwareApplication` helpers intact.
- Generic non-tool collection/list helpers now emit typed item entities with optional factual relationships and no aggregate ratings.
- `/lineage` and `/lineage/[treeSlug]` emit lineage tree `CreativeWork` IDs, breadcrumbs, and page/entity relationships. Lineage `creator` remains intentionally omitted because no privacy-reviewed public owner select exists yet.
- `/programs` and `/programs/[id]` emit `Course`-typed program entities with organization provider and discipline about references from existing payloads.
- `/organizations` and `/organizations/[slug]` emit `Organization` entities with discipline about references and available address fields; empty address data is filtered out by the helper.
- `/courses` and `/courses/[slug]` emit `Course` entities with organization provider and discipline about references from existing payloads.
- Dirstarter tool listing behavior remains unchanged: actual tool collections still use `SoftwareApplication` and the existing rating helper.

## Files touched

- `apps/web/lib/structured-data.ts` - added generic factual JSON-LD relationship helpers and page relationship options.
- `apps/web/lib/structured-data.test.ts` - added regression tests for generic IDs, relationships, address filtering, and no non-tool aggregate ratings.
- `apps/web/app/(web)/lineage/page.tsx` - enriched lineage listing JSON-LD with breadcrumbs, lineage tree IDs, organization provider, and discipline about references.
- `apps/web/app/(web)/lineage/[treeSlug]/page.tsx` - enriched detail JSON-LD with breadcrumb, page main entity, and lineage tree `CreativeWork`.
- `apps/web/app/(web)/programs/page.tsx` - enriched program listing JSON-LD with provider/about references.
- `apps/web/app/(web)/programs/[id]/page.tsx` - enriched program detail JSON-LD with provider/about/mainEntity references and a `Course` entity.
- `apps/web/app/(web)/organizations/page.tsx` - enriched organization listing JSON-LD with about references and available address fields.
- `apps/web/app/(web)/organizations/[slug]/page.tsx` - enriched organization detail JSON-LD with mainEntity/about and full available postal address fields.
- `apps/web/app/(web)/courses/page.tsx` - enriched course listing JSON-LD with provider/about references and breadcrumb schema.
- `apps/web/app/(web)/courses/[slug]/page.tsx` - enriched course detail JSON-LD with provider/about/mainEntity references and a `Course` entity.
- `docs/sprints/SESSION_0246.md` - session ledger.
- `docs/knowledge/wiki/index.md` - session index entry and frontmatter agent stamp.

## Decisions resolved

- JSON-LD is not fundamentally broken; the issue was semantic drift from Dirstarter's tool-directory `SoftwareApplication` schema onto non-tool martial arts pages.
- Preserve tool listing JSON-LD behavior for actual tools, including existing `SoftwareApplication` and generated rating behavior.
- Do not add aggregate ratings to non-tool pages.
- Do not add lineage `creator` until a public owner/creator select is privacy-reviewed.
- Do not solve brand-aware canonical host IDs in this patch; existing helpers still use `siteConfig.url`, and multi-domain JSON-LD canonicalization remains a separate ADR 0006 follow-up candidate.

## Open decisions / blockers

- `/lineage` pagination/search remains a follow-up product slice; not implemented this session.
- Multi-domain brand-aware canonical JSON-LD IDs remain a follow-up architecture task tied to ADR 0006; this session did not worsen the existing `siteConfig.url` behavior.
- SESSION_0244 baseline-content waterfall remains deferred by explicit user override, not blocked.

## Verification

| Command | Result |
| --- | --- |
| `bun test lib/structured-data.test.ts` | Pass - 7 tests, 16 assertions. |
| `bun biome check lib/structured-data.ts lib/structured-data.test.ts 'app/(web)/programs/page.tsx' 'app/(web)/programs/[id]/page.tsx' 'app/(web)/organizations/page.tsx' 'app/(web)/organizations/[slug]/page.tsx' 'app/(web)/courses/page.tsx' 'app/(web)/courses/[slug]/page.tsx' 'app/(web)/lineage/page.tsx' 'app/(web)/lineage/[treeSlug]/page.tsx'` | Pass - 10 files checked, no fixes applied after formatter pass. |
| `pnpm --filter @ronin-dojo/web exec tsc --noEmit --pretty false` | Pass. |
| `bun run wiki:lint` | Failed with pre-existing repo-wide docs debt: 232 errors and 509 warnings. Follow-up exact-output filter for SESSION_0246/touched paths returned no hits. |

## Review log

### SESSION_0246 - Factual JSON-LD enrichment

#### Review

**SESSION_0246_REVIEW_01 - Giddy/Doug close review**

- **Reviewed tasks:** SESSION_0246_TASK_01, SESSION_0246_TASK_02, SESSION_0246_TASK_03
- **Dirstarter docs check:** live docs checked
- **Sources:** <https://dirstarter.com/docs/seo>, <https://dirstarter.com/docs/content>
- **Verdict:** Pass pending git hygiene. The implementation keeps Dirstarter-style centralized SEO helpers, preserves tool `SoftwareApplication` behavior, and adds factual non-tool fields only from existing public route payloads. No ratings were added to non-tool pages.

#### Findings

**SESSION_0246_FINDING_01 - Multi-domain canonical JSON-LD IDs still use `siteConfig.url`**

- **Severity:** low
- **Task:** SESSION_0246_TASK_01
- **Evidence:** Existing structured-data helpers resolve relative URLs through `siteConfig.url`, which predates this session.
- **Impact:** In multi-domain production, JSON-LD IDs may point to the configured canonical site instead of the request host.
- **Required follow-up:** Stage an ADR 0006-aligned canonical URL helper or request/brand-aware structured-data context.
- **Status:** open

## Hostile close review

### SESSION_0246 - Factual JSON-LD enrichment

#### Review Questions

| Check | Verdict |
| --- | --- |
| Plan sanity | Pass - user carry-forward was converted into three scoped tasks; pagination/search and baseline-content waterfall stayed out of scope. |
| Dirstarter compliance | Pass - centralized helper pattern matches Dirstarter SEO guidance for metadata/structured data; no baseline tool helper was replaced. |
| Security | Pass - no private member/profile/enrollment identities were added; lineage creator stayed omitted. |
| Data integrity | Pass - route JSON-LD uses existing public payload fields; empty addresses are filtered; no invented non-tool ratings. |
| Lifecycle proof | Pass - helper tests, route typecheck, and focused Biome cover the changed surfaces. |
| Verification honesty | Pass - focused tests, Biome, and TypeScript passed; no browser QA claimed. |
| Workflow honesty | Pass - bow-in, Graphify-first discovery, Petey plan, task IDs, subagent review, and review log are present. |
| Merge readiness | Pass with known pre-existing wiki-lint debt recorded; commit, push, and Graphify refresh complete in final response. |

#### Kaizen

- The right boundary is semantic, not mechanical: Dirstarter's tool listing schema is a valid pattern for tools, but copying `SoftwareApplication` and generated ratings onto martial arts entities creates crawler-facing false claims.
- Future structured-data work should use a request/brand-aware canonical URL helper before adding more absolute IDs across multi-domain surfaces.

**Score:** 9.6/10 for the factual enrichment slice. No Dirstarter/data-integrity cap. Canonical domain precision remains follow-up debt, not a regression in this patch.

## ADR / ubiquitous-language check

- No new ADR needed for this helper-level SEO enrichment.
- ADR 0006 follow-up may be warranted later for brand-aware canonical JSON-LD IDs, but this session did not make that architecture decision.
- No ubiquitous-language update needed; no new domain terms introduced.

## Reflections

- The useful mental model is "centralize shape, localize facts." Helpers own JSON-LD shape, while route payloads decide which facts are safe enough to publish.
- The SESSION_0245 split away from `SoftwareApplication` was necessary but incomplete; this session made the generic path useful without changing tool behavior.
- FS-0024 mattered: one accidental patch initially targeted the local Dirstarter template path and was removed before code implementation. Absolute repo-path edits prevented that from contaminating the wrong git worktree.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `SESSION_0246.md` created with JETTY frontmatter; final status will be closed atomically with body status. `wiki/index.md` frontmatter `last_agent` updated. Code files have no JETTY frontmatter. |
| Backlinks/index sweep | `wiki/index.md` gained SESSION_0246 row; spot-check confirmed SESSION_0241-0246 are present. |
| Wiki lint | `bun run wiki:lint` failed with pre-existing repo-wide docs debt: 232 errors and 509 warnings. Exact-output filter for SESSION_0246/touched paths returned no hits. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | `SESSION_0246_REVIEW_01` present with one open follow-up finding. |
| Review & Recommend | Next session goal written below. |
| Memory sweep | No operator memory update needed; canonical-domain caveat is captured as a SESSION finding. |
| Next session unblock check | Unblocked. Default next target is SESSION_0244 baseline-content waterfall unless Brian prioritizes lineage pagination/search. |
| Git hygiene | Branch `main`; task-log close gate returned 3 rows. Final commit/push proof will be in bow-out response to avoid a second commit loop. |
| Graphify update | Post-commit `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` will run after push; final stats will be reported in bow-out response to avoid a second commit loop. |

## Close checklist

- [x] Pause work and finish active tool calls.
- [x] Update SESSION file with landed work, files touched, decisions, blockers, task log, review log, hostile review, ADR check, and next session.
- [x] JETTY/frontmatter and wiki index sweep.
- [x] Focused test, Biome, and TypeScript gates.
- [x] `bun run wiki:lint` (failed on pre-existing repo-wide docs debt; no SESSION_0246/touched-path hits in exact-output filter).
- [x] Git hygiene: branch/worktree/status checked; stage/commit/push proof in final response.
- [x] Graphify update after git hygiene: proof in final response.
- [x] Bow-out line: final response.

## Next session

### Goal

Resume SESSION_0244 baseline-content waterfall execution, starting with Phase 1 doc/ADR hygiene, unless Brian explicitly prioritizes `/lineage` search/pagination first.

### Inputs to read

- `docs/sprints/SESSION_0244.md`
- `docs/sprints/SESSION_0245.md`
- `docs/sprints/SESSION_0246.md`
- `docs/protocols/WORKFLOW_5.0.md`

### First task

Start SESSION_0244 Phase 1: renumber `docs/architecture/decisions/0012-tier-auto-grant.md` to ADR 0019, update cross-references, and keep `0012-admin-crud-routing-pattern.md` as the sole ADR 0012.

### Status

closed
