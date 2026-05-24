---
title: "SESSION 0245 - Lineage privacy and SEO hardening"
slug: session-0245
type: session--implement
status: closed
created: 2026-05-24
updated: 2026-05-24
last_agent: codex-session-0245
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0244.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0245 - Lineage privacy and SEO hardening

## Date

2026-05-24

## Operator

Brian + codex-session-0245 (Petey orchestrating; Cody implementation; Doug/Giddy close review)

## Goal

Fix the `/lineage` review findings that are privacy-sensitive or cheap launch hardening: public card counts, lineage detail query shape, metadata payload weight, generic structured data, and empty-tree structured-data parity.

## Bow-in

### Previous session

- SESSION_0244 was a planning-only baseline-content waterfall session with a larger execution queue.
- User override for this session: execute the `/lineage` findings supplied at bow-in. The SESSION_0244 baseline-content queue remains deferred.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Bow-in status: clean against `origin/main`
- HEAD at bow-in: `f335e34`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma/database query shape and SEO/structured data. |
| Extension or replacement | Extension - hardens Ronin lineage-specific queries and JSON-LD helpers without replacing Dirstarter patterns. |
| Why justified | Public lineage pages are launch-facing; one finding is privacy-sensitive because hidden member counts leak through the listing card. |
| Risk if bypassed | Non-public lineage membership is inferred from public counts; metadata and profile reads become expensive as BBL lineage trees grow; JSON-LD misclassifies martial arts pages as software. |

### Dirstarter docs checked

- 2026-05-24: <https://dirstarter.com/docs/database/prisma> - Prisma client and query usage.
- 2026-05-24: <https://dirstarter.com/docs/content> - published content visibility/status model.
- 2026-05-24: <https://dirstarter.com/docs/seo> - dynamic metadata and structured-data expectations.

### Failed-steps + drift register check

- `failed-steps-log.md`: no open entries found in the lineage/SEO slice; relevant mitigations are FS-0001, FS-0006, FS-0007, and FS-0008, so Petey plan + pre-flight are recorded before code edits.
- `drift-register.md`: no open drift entries affect this session.

### Graphify check

- Graph status: 6921 nodes / 10764 edges / 1029 communities; current local graph available at bow-in.
- Queries used:
  - `graphify query "lineage public tree member count visibility getLineageTreeBySlug getLineageProfile structured data collection page" --graph . --budget 5000`
  - `graphify query "server web lineage queries findPublishedLineageTrees getLineageProfile findPublishedLineageTreeSlugs" --graph . --budget 5000`
  - `graphify query "structured-data generateCollectionPageWithItems SoftwareApplication programs organizations lineage" --graph . --budget 4000`
- Files selected from graph and exact reads:
  - `apps/web/server/web/lineage/queries.ts`
  - `apps/web/server/web/lineage/payloads.ts`
  - `apps/web/app/(web)/lineage/page.tsx`
  - `apps/web/app/(web)/lineage/[treeSlug]/page.tsx`
  - `apps/web/lib/structured-data.ts`
  - `apps/web/app/(web)/programs/page.tsx`
  - `apps/web/app/(web)/organizations/page.tsx`
  - `apps/web/app/(web)/courses/page.tsx`
- Verification note: Graphify identified the lineage route/query cluster; exact symbol usage was confirmed after graph narrowing.

## Petey plan

### Goal

Close the privacy-sensitive and launch-facing `/lineage` findings while keeping pagination/search as a follow-up product slice.

### Tasks

#### SESSION_0245_TASK_01 - Public member count privacy

- **Agent:** Cody
- **What:** Ensure `/lineage` listing cards count only PUBLIC member nodes.
- **Steps:**
  1. Replace unfiltered `_count.members` with a visibility-filtered relation count.
  2. Add/adjust test coverage so hidden members do not affect public card count.
- **Done means:** `findPublishedLineageTrees()` returns `memberCount` from PUBLIC node members only.
- **Depends on:** nothing

#### SESSION_0245_TASK_02 - Lineage detail query efficiency

- **Agent:** Cody
- **What:** Remove the N+1 profile load and avoid full tree payload in metadata.
- **Steps:**
  1. Add a batch profile query for visible node ids.
  2. Switch detail page drawer data to the batch query.
  3. Add a lightweight metadata summary query and use it in `generateMetadata`.
- **Done means:** Detail page uses one profile query and metadata fetches only summary fields.
- **Depends on:** SESSION_0245_TASK_01

#### SESSION_0245_TASK_03 - Structured data correctness

- **Agent:** Cody + Doug
- **What:** Stop using SoftwareApplication JSON-LD for non-tool listing items and keep empty lineage trees emitting JSON-LD.
- **Steps:**
  1. Add generic/type-aware collection/list helpers.
  2. Update `/lineage`, `/programs`, `/organizations`, and `/courses` non-tool listings.
  3. Move lineage detail structured data ahead of the empty-members branch.
- **Done means:** Non-tool listing JSON-LD is not emitted as SoftwareApplication; empty lineage tree detail pages still include CollectionPage JSON-LD.
- **Depends on:** SESSION_0245_TASK_02

### Parallelism

- Boole subagent: read-only Cody review of lineage query changes.
- Hubble subagent: read-only Doug review of structured-data use sites.
- Implementation is local/sequential after the session ledger because touched files overlap at the route/query boundary.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0245_TASK_01 | Cody | Clear query hardening with privacy impact. |
| SESSION_0245_TASK_02 | Cody | Query/page integration with typecheck proof. |
| SESSION_0245_TASK_03 | Cody + Doug | Helper semantics plus SEO correctness review. |

### Open decisions

- Pagination/search for `/lineage` remains out of scope for this session and should be staged as product work later.

### Risks

- Prisma filtered relation counts must typecheck against the installed client.
- JSON-LD helper changes must preserve tool listing structured data behavior.

### Scope guard

- Do not build `/lineage` search/pagination in this session.
- Do not widen lineage visibility semantics beyond existing PUBLIC-only unauthenticated behavior.

### Dirstarter implementation template

- **Docs read first:** Prisma, Content, and SEO docs checked live on 2026-05-24.
- **Baseline pattern to extend:** Dirstarter Prisma client query helpers, Next.js `generateMetadata`, JSON-LD structured data helpers.
- **Custom delta:** Ronin lineage tree read models and martial-arts-specific listing JSON-LD.
- **No-bypass proof:** Changes keep existing Dirstarter-style query/page helpers and narrow custom behavior to Ronin lineage surfaces.

## Pre-flight: Backend - lineage public queries

### 1. Auth predicates planned

- [x] Session auth required: no, public reads only.
- [x] Org membership verified: no, public listing/detail reads only.
- [x] Brand column filtered: yes, `brand` remains in lineage listing/detail queries.
- Authorization approach: unauthenticated paths remain PUBLIC-only via `PUBLIC_VISIBILITY_SCOPE`.

### 2. Existing action scan

- Consulted `docs/architecture/dirstarter-baseline-index.md`: not needed; no actions created.
- Searched via Graphify for: lineage queries, public member count, getLineageProfile, structured data.
- Related existing queries: `findPublishedLineageTrees`, `getLineageProfile`, `getLineageTreeBySlug`, `findPublishedLineageTreeSlugs`.
- L1 pattern match: Dirstarter Prisma client reads from `~/services/db`, Next.js dynamic metadata from Dirstarter SEO docs.

### 3. Data flow reference

- [x] `docs/runbooks/sop-data-and-wiring-flows.md`: public query -> route render.
- [x] `docs/runbooks/sop-e2e-user-lifecycle.md`: public discovery/listing lifecycle.

### 4. FAILED_STEPS check

- Prior failures in this area: FS-0001, FS-0006, FS-0007, FS-0008.
- Manual Boundary Registry entries: none checked yet for this exact slice.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0245_TASK_01 | done | `/lineage` listing `memberCount` now uses a Prisma filtered relation count against PUBLIC node visibility only; regression coverage asserts 2 PUBLIC members are counted while RESTRICTED/UNLISTED fixture members are not. |
| SESSION_0245_TASK_02 | done | Added batch profile loading, lightweight metadata summary lookup, and a nested instructor-relationship visibility guard for public profile payloads. |
| SESSION_0245_TASK_03 | done | Added generic structured-data helpers for non-tool listings, moved `/lineage`, `/programs`, `/organizations`, and `/courses` off SoftwareApplication JSON-LD, and emits detail structured data for empty lineage trees. |

## What landed

- `/lineage` card counts no longer leak hidden tree membership. `findPublishedLineageTrees()` filters `_count.members` through `members.node.visibility in PUBLIC_VISIBILITY_SCOPE`.
- `/lineage/[treeSlug]` now uses `getLineageProfilesByIds()` instead of per-node `Promise.all(getLineageProfile)`.
- `generateMetadata()` for lineage detail now uses `findPublishedLineageTreeSummaryBySlug()` instead of loading members and visual groups.
- Public lineage profile payloads now filter `relationshipsTo.fromNode` to PUBLIC nodes so a visible profile does not reveal a non-public instructor node through the drawer.
- Non-tool listing structured data now uses generic/type-aware helpers:
  - `/lineage`: `CreativeWork`
  - `/programs`: `Course`
  - `/organizations`: `Organization`
  - `/courses`: `Course`
- Tool listing helpers keep explicit SoftwareApplication behavior for actual tool listings.

## Files touched

- `apps/web/server/web/lineage/queries.ts` - filtered public member counts; added batch profile and metadata summary queries.
- `apps/web/server/web/lineage/payloads.ts` - filtered public profile instructor relationships to PUBLIC source nodes.
- `apps/web/server/web/lineage/queries.test.ts` - added regression coverage for filtered counts, batch profiles, metadata summary, and non-public instructor relationship filtering.
- `apps/web/app/(web)/lineage/[treeSlug]/page.tsx` - uses lightweight metadata, batch profiles, and emits structured data in the empty-tree branch.
- `apps/web/app/(web)/lineage/page.tsx` - uses generic CreativeWork collection JSON-LD.
- `apps/web/app/(web)/programs/page.tsx` - uses generic Course collection JSON-LD.
- `apps/web/app/(web)/organizations/page.tsx` - uses generic Organization collection JSON-LD.
- `apps/web/app/(web)/courses/page.tsx` - uses generic Course ItemList JSON-LD.
- `apps/web/lib/structured-data.ts` - added generic collection/list helpers while preserving tool-specific helpers.
- `apps/web/lib/structured-data.test.ts` - added helper regression tests proving SoftwareApplication remains explicit and non-tool types are caller-controlled.
- `docs/sprints/SESSION_0245.md` - session ledger.
- `docs/knowledge/wiki/index.md` - session index entry and frontmatter agent stamp.

## Decisions resolved

- Fixed the privacy-sensitive count leak immediately rather than deferring it behind product pagination/search.
- Kept `/lineage` pagination/search out of this session; it remains product work, not a hardening patch.
- Preserved tool-oriented SoftwareApplication helpers for actual tool listings and added generic helpers for non-tool pages instead of changing existing helper semantics globally.
- Did not copy generated aggregate ratings to non-tool pages; richer factual JSON-LD enrichment is a follow-up.

## Open decisions / blockers

- `/lineage` pagination/search remains a follow-up product slice; not implemented this session.
- Optional SEO enrichment remains open: add factual `@id`, breadcrumb/isPartOf references, provider/creator/about/address fields where source data exists. Do not invent ratings for non-tool pages.
- SESSION_0244 baseline-content waterfall remains deferred by explicit user override, not blocked.

## Verification

| Command | Result |
| --- | --- |
| `bun biome check 'app/(web)/courses/page.tsx' 'app/(web)/lineage/[treeSlug]/page.tsx' 'app/(web)/lineage/page.tsx' 'app/(web)/organizations/page.tsx' 'app/(web)/programs/page.tsx' lib/structured-data.ts lib/structured-data.test.ts server/web/lineage/payloads.ts server/web/lineage/queries.ts server/web/lineage/queries.test.ts` | Pass - 10 files checked, no fixes applied. |
| `bun test lib/structured-data.test.ts server/web/lineage/queries.test.ts` | Pass - 30 tests, 60 assertions. |
| `pnpm --filter @ronin-dojo/web exec tsc --noEmit --pretty false` | Pass. |
| `bun run wiki:lint` | Failed with pre-existing repo-wide docs debt: 232 errors and 509 warnings. Follow-up filter for SESSION_0245/touched code paths returned only pre-existing lineage spec orphan/backlink warnings, not this session file. |

## Review log

### SESSION_0245 - Lineage privacy and SEO hardening

#### Review

**SESSION_0245_REVIEW_01 - Giddy/Doug close review**

- **Reviewed tasks:** SESSION_0245_TASK_01, SESSION_0245_TASK_02, SESSION_0245_TASK_03
- **Dirstarter docs check:** live docs checked
- **Sources:** <https://dirstarter.com/docs/database/prisma>, <https://dirstarter.com/docs/content>, <https://dirstarter.com/docs/seo>
- **Verdict:** Pass. The privacy-sensitive leak is closed with a filtered Prisma relation count and a regression test. The profile path now batches DB reads and metadata no longer loads the full public tree payload. Structured data no longer classifies lineage/program/org/course items as software while preserving SoftwareApplication output for real tool listings. No Dirstarter baseline was replaced.

#### Findings

**SESSION_0245_FINDING_01 - Lineage discovery still lacks pagination/search**

- **Severity:** low
- **Task:** SESSION_0245_TASK_01
- **Evidence:** `/lineage` still calls `findPublishedLineageTrees({ brand })`, whose default `take` remains 50.
- **Impact:** Acceptable for the first public directory, but BBL-sized trees will need searchable/paginated discovery.
- **Required follow-up:** Stage a dedicated product slice for `/lineage` search, filters, and pagination.
- **Status:** open

## Hostile close review

### SESSION_0245 - Lineage privacy and SEO hardening

#### Review Questions

| Check | Verdict |
| --- | --- |
| Plan sanity | Pass - user findings were converted into three scoped tasks; pagination/search was intentionally held as follow-up. |
| Dirstarter compliance | Pass - extended Prisma and SEO patterns from live Dirstarter docs; no replacement of baseline helpers. |
| Security | Pass - public lineage counts and profile relationships now respect PUBLIC visibility in the tested paths. |
| Data integrity | Pass - visibility filtering is enforced at query/payload level, not only in UI rendering. |
| Lifecycle proof | Pass - public lineage listing/detail and non-tool structured-data flows are covered. |
| Verification honesty | Pass - focused tests, Biome, and TypeScript ran successfully; no browser QA claimed. |
| Workflow honesty | Pass - bow-in, Graphify-first discovery, Petey plan, task IDs, and review log are present. |
| Merge readiness | Pass with known pre-existing wiki-lint debt recorded; commit, push, and Graphify refresh complete in final response. |

#### Kaizen

- **Safety/security:** Proven for the reported count leak and for one nested profile relationship leak discovered during close review. Not proven for every possible future lineage payload expansion; future payload widening should add visibility tests first.
- **Preventable failed steps:** None logged. The useful improvement was catching the nested `relationshipsTo.fromNode` visibility issue during close review instead of after commit.
- **Scale confidence:** 100 trees: 9/10. 1,000 trees: 8/10 because `/lineage` still lacks pagination/search. 10,000 trees: 7/10 until discovery pagination and indexes are planned. Aggregate: 7/10, with follow-up staged but no blocker for this hardening patch.

**Score:** 9.6/10 for the hardening slice. No Dirstarter/data-integrity cap. Product-scale discovery remains follow-up debt, not a regression in this patch.

## ADR / ubiquitous-language check

- No new ADR needed; this is query/SEO hardening within existing lineage visibility semantics.
- No ubiquitous-language update needed; no new domain terms introduced.

## Reflections

- The visible count leak and nested instructor relationship leak are the same class of bug: public payloads need visibility filtering at every joined edge, not only at the top-level entity.
- Tool-oriented JSON-LD had useful structure, but the fake aggregate-rating pattern should stay isolated to whatever product decision originally justified it for tools. Non-tool pages should only grow factual schema fields.
- Graphify was useful for narrowing the lineage cluster, but exact symbol checks were still needed after graph discovery to confirm helper call sites.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `SESSION_0245.md` created with JETTY frontmatter and closed atomically with body status; `wiki/index.md` frontmatter `last_agent` updated. Code files have no JETTY frontmatter. |
| Backlinks/index sweep | `wiki/index.md` gained SESSION_0245 row; spot-check confirmed SESSION_0241-0245 are present. |
| Wiki lint | `bun run wiki:lint` failed with pre-existing repo-wide docs debt: 232 errors and 509 warnings. Filtered check for SESSION_0245/touched code paths showed no new SESSION_0245 lint errors. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | `SESSION_0245_REVIEW_01` present with one open follow-up finding. |
| Review & Recommend | Next session goal written below. |
| Memory sweep | No operator memory update needed; lesson is captured in this SESSION file. |
| Next session unblock check | Unblocked. Default next target is SESSION_0244 baseline-content waterfall unless Brian prioritizes lineage pagination/search. |
| Git hygiene | Branch `main`; `git worktree list` shows only `/Users/brianscott/dev/ronin-dojo-app f335e34 [main]`; final commit/push proof will be in bow-out response to avoid a second commit loop. |
| Graphify update | Post-commit `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` will run after push; final stats will be reported in bow-out response to avoid a second commit loop. |

## Close checklist

- [x] Pause work and finish active tool calls.
- [x] Update SESSION file with landed work, files touched, decisions, blockers, task log, review log, hostile review, ADR check, and next session.
- [x] JETTY/frontmatter and wiki index sweep.
- [x] `bun run wiki:lint` (failed on pre-existing repo-wide docs debt; no SESSION_0245-specific failures found).
- [x] Git hygiene: branch/worktree/status checked; stage/commit/push proof in final response.
- [x] Graphify update after git hygiene: proof in final response.
- [x] Bow-out line: final response.

## Next session

### Goal

Resume SESSION_0244 baseline-content waterfall execution, starting with Phase 1 doc/ADR hygiene, unless Brian explicitly prioritizes `/lineage` search/pagination first.

### Inputs to read

- `docs/sprints/SESSION_0244.md`
- `docs/sprints/SESSION_0245.md`
- `docs/knowledge/wiki/dirstarter-docs-inventory.md`
- `docs/protocols/WORKFLOW_5.0.md`

### First task

Start SESSION_0244 Phase 1: renumber `docs/architecture/decisions/0012-tier-auto-grant.md` to ADR 0019, update cross-references, and keep `0012-admin-crud-routing-pattern.md` as the sole ADR 0012.

### Candidates

1. Baseline content waterfall - restores the deferred SESSION_0244 launch-content queue.
2. `/lineage` discovery pagination/search - closes the remaining low-severity scale finding from this session.

### Status

closed
