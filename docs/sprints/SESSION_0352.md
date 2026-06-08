---
title: "SESSION 0352 — Directory cross-facet filters and People pagination"
slug: session-0352
type: session--implement
status: closed
created: 2026-06-06
updated: 2026-06-06
last_agent: codex-session-0352
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0351.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0352 — Directory cross-facet filters and People pagination

## Date

2026-06-06

## Operator

Brian + codex-session-0352

## Goal

Resume the SESSION_0350 planned implementation by adding the first shared cross-facet `/directory` filter and moving the People facet onto the paginated `search*` query family without weakening DirectoryProfile privacy, lineage trust badges, tier policy, or brand scoping.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0351.md`.
- Carryover: SESSION_0351 was a cleanup/doc-alignment pass and explicitly preserved the SESSION_0350 `/directory` continuation for SESSION_0352. No higher-priority blocker superseded the directory work.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean before creating `docs/sprints/SESSION_0352.md`.
- Current HEAD at bow-in: `122b21c`
- Remote guard: `origin` is `https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline.git`; cwd is `/Users/brianscott/dev/ronin-dojo-app`, not `dirstarter_template`. FS-0024 guard passed.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Public App Router page/component structure, `components/common/Select`, `FiltersProvider`/nuqs filter state, `server/**/queries.ts` + Prisma read shape. |
| Extension or replacement | Extension: keep the Ronin `server/web/directory` feature folder and compose existing common primitives/filter context. |
| Why justified | `/directory` is the canonical public discovery surface and needs cross-facet filters plus paginated People results to match the already-paginated Organizations and Trees facets. |
| Risk if bypassed | Hand-rolled filters or duplicate query substrates could repeat FS-0001, leak private DirectoryProfile fields, or create inconsistent discipline semantics across facets. |

Live docs checked during planning: Dirstarter Project Structure and Prisma Setup on 2026-06-06; local component/docs inventories also checked.

### Graphify check

- Graph status: current enough for planning; `graphify stats` at bow-in: 9602 nodes, 15084 edges, 1427 communities, 1602 files tracked.
- Queries used:
  - `directory filters discipline slug FilterProvider searchDirectoryProfiles DirectoryProfile trust tier projection`
  - `searchDirectoryProfiles getDirectoryProfiles directory People facet profile directory page filters`
  - `directory privacy DirectoryProfile security SOP data wiring lifecycle verification filters user lifecycle`
- Files selected from graph / bounded follow-up:
  - `apps/web/contexts/filter-context.tsx`
  - `apps/web/components/common/select.tsx`
  - `apps/web/components/web/directory/directory-query.tsx`
  - `apps/web/components/web/directory/directory-listing.tsx`
  - `apps/web/components/web/directory/directory-facet-tabs.tsx`
  - `apps/web/components/web/directory/directory-facet-results.tsx`
  - `apps/web/components/web/directory/facet-result-card.tsx`
  - `apps/web/server/web/directory/schema.ts`
  - `apps/web/server/web/directory/facets.ts`
  - `apps/web/server/web/directory/filter-actions.ts`
  - `apps/web/server/web/directory/payloads.ts`
  - `apps/web/server/web/directory/queries.ts`
  - `apps/web/server/web/directory/search-profiles.ts`
  - `apps/web/lib/directory/facet-result.ts`
- Verification note: Graphify's component path for the removed SESSION_0350 `directory-filters.tsx` was stale; exact source reads verified the current active files above.

### Grill outcome

- No user grill needed. The task was already scoped in SESSION_0351 and the first implementation step is concrete.
- People pagination must preserve the existing trust/tier projection from `getDirectoryProfiles`; if `searchDirectoryProfiles` lacks that projection, update it rather than downgrading the People cards.
- `discipline` remains the URL param, but its value is standardized to `Discipline.slug`.
- Broader rank/school/location filter dropdowns stay out of scope unless they are mechanically unlocked by the shared discipline filter.

## Petey plan

### Goal

Ship the first cross-facet `/directory` filter and converge People onto a paginated, privacy-aware search query.

### Tasks

#### SESSION_0352_TASK_01 — Shared directory discipline filter

- **Agent:** Cody
- **What:** Add a slug-aware directory filter-options query/action and render a shared discipline `Select` inside the existing `FiltersProvider` UI.
- **Steps:**
  1. Reintroduce a directory-specific filter options query that returns `Discipline.slug` + `name`, scoped to disciplines represented on the current brand's public discovery surfaces where practical.
  2. Add a `DirectoryFilters` client component that composes the existing `Select` primitive and writes `filters.discipline`.
  3. Wire the component into `DirectoryListing` inside the existing `Filters` slot.
- **Done means:** `/directory?discipline=<slug>` can be selected from the shared filter bar and feeds the existing People/Organizations/Trees facet dispatcher.
- **Depends on:** nothing.

#### SESSION_0352_TASK_02 — People facet pagination convergence

- **Agent:** Cody
- **What:** Move the People facet from `getDirectoryProfiles` to `searchDirectoryProfiles` while preserving trust badges, claim badge status, tier badge, avatar preference, and privacy/tier field gating.
- **Steps:**
  1. Update `searchDirectoryProfiles` to return the same person facet projection used by `mapPersonToFacet`.
  2. Keep brand scoping and DirectoryProfile visibility rules server-side.
  3. Have `getDirectoryFacets` call `searchDirectoryProfiles` for People and return a real `total`, `page`, and `perPage`.
  4. Add focused tests for discipline slug filtering and People pagination/projection if existing fixtures make that practical.
- **Done means:** People results use the paginated `search*` family and `DirectoryFacetResults` renders Pagination for all three facets.
- **Depends on:** SESSION_0352_TASK_01.

### Parallelism

Sequential. Both tasks touch the same directory query/component files.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0352_TASK_01 | Cody | Clear implementation on existing UI/filter primitives. |
| SESSION_0352_TASK_02 | Cody | Backend/query refactor with privacy and projection constraints. |

### Open decisions

- None at plan-lock.

### Risks

- `searchDirectoryProfiles` currently lacks the trust/tier projection needed by `mapPersonToFacet`; updating it must avoid selecting or leaking private claim evidence or contact fields.
- Local DB-dependent tests may fail without a reachable Postgres shell; verification must characterize environment failures honestly.

### Scope guard

- Do not build rank, org, city, or region dropdowns unless required for the shared discipline filter.
- Do not add schema, migrations, new public models, or new tier semantics.
- Do not change `/members` compatibility redirects or the `/directory/[slug]` detail policy.
- Do not broaden public DirectoryProfile payloads beyond existing allowlisted fields.

### Dirstarter implementation template

- **Docs read first:** Dirstarter Project Structure and Prisma Setup live docs checked 2026-06-06; `docs/knowledge/wiki/dirstarter-component-inventory.md`, `docs/knowledge/wiki/dirstarter-docs-inventory.md`, `docs/architecture/dirstarter-baseline-index.md`, `docs/security/*` relevant privacy/security docs, `docs/runbooks/sops/*` lifecycle/data docs, and `docs/runbooks/domain-features/*` listing/lineage docs checked locally.
- **Baseline pattern to extend:** Next.js App Router public page → feature-scoped `components/web/directory` + `server/web/directory`, Prisma reads through `~/services/db`, common `Select`, `FiltersProvider` and nuqs query params.
- **Custom delta:** Ronin-specific `DirectoryProfile` privacy/tier/trust projection across People/Organizations/Lineage Trees.
- **No-bypass proof:** Reuses existing directory feature folder and Dirstarter primitives; no parallel filter system or duplicate public directory model.

## Cody pre-flight

### Pre-flight: Directory cross-facet filters and People pagination

#### 1. Existing component scan

- Graphify query used: `directory filters discipline slug FilterProvider searchDirectoryProfiles DirectoryProfile trust tier projection`
- Bounded source scan used after Graphify: `rg --files apps/web | rg 'directory|Directory|filter-context|search'` and targeted source reads.
- Found: `DirectoryListing`, `DirectoryQuery`, `DirectoryFacetTabs`, `DirectoryFacetResults`, `FacetResultCard`, `FiltersProvider`, `Filters`, common `Select`, existing school/technique discipline filter patterns, `searchDirectoryProfiles`, `getDirectoryProfiles`, `getDirectoryFacets`.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: yes.
- Consulted live alignment URLs: yes — Project Structure and Prisma Setup.
- Closest L1 pattern: public listing/query/filter composition under `components/web/*` + feature-scoped `server/**/queries.ts`.
- Primitive API spot-check:
  - `Select`: Root wraps Base UI `SelectPrimitive.Root`; accepts `value` and `onValueChange`.
  - `SelectTrigger`: accepts Base UI trigger props + `size` from `inputVariants`; current filters use `size="lg"` and responsive width classes.
  - `SelectValue`: Base UI value, used with `placeholder`.
  - `SelectContent`: accepts popup props plus `align`, `side`, `sideOffset`, `alignItemWithTrigger`.
  - `SelectItem`: accepts Base UI item props; `value` string and optional `label`, renders children with `ItemText`.
  - `Stack`: used by existing school filters for wrapped filter rows.

#### 3. Composition decision

- Extending existing component: `DirectoryListing`.
- Composing existing components: `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `Stack`, `FiltersProvider`, `Filters`, `Pagination`.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes, `SESSION_0351.md`.
- ADR read: not required; no schema or architecture decision planned. ADR 0004 brand-column doctrine represented via security docs and existing brand param.
- Runbooks consulted: `docs/runbooks/dev-environment/graphify-repo-memory.md`, `docs/runbooks/dev-environment/verification-and-testing.md`, `docs/runbooks/sops/sop-data-and-wiring-flows.md`, `docs/runbooks/sops/sop-e2e-user-lifecycle.md`, `docs/security/privacy-data-classification.md`, `docs/security/security-test-plan.md`, `docs/security/brand-scope-hardening-plan.md`, `docs/runbooks/domain-features/lineage-listing-runbook.md`, `docs/runbooks/domain-features/baseline-listings-runbook.md`.

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo`.
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`; app working directory for gates: `/Users/brianscott/dev/ronin-dojo-app/apps/web`.
- Brand/host for testing: local Next app host, preferably `http://localhost:3000/directory` or alternate port if occupied.
- Verification commands confirmed: `bun run typecheck`, `bun run lint`, focused `bun test` from `apps/web`; `bun run wiki:lint` from repo root.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001, FS-0008, FS-0024.
- Mitigation acknowledged: read existing primitives and prop APIs before adding UI; read exact query/payload files before changing projection; verified cwd/remote before mutating git.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0352_TASK_01 | complete | Added slug-aware directory filter options plus shared `DirectoryFilters` Select inside the existing `FiltersProvider` filter bar. |
| SESSION_0352_TASK_02 | complete | Moved People onto paginated `searchDirectoryProfiles`, preserved trust/tier/privacy projection through `projectDirectoryProfileListItem`, and deleted the dead unpaginated list query after fallow flagged it. |

## What landed

- Added `getDirectoryFilterOptions(brand)` returning `Discipline.slug` + name options and wired it through `DirectoryQuery`.
- Added `DirectoryFilters`, a client component that composes the common `Select` primitive and writes the shared `discipline` URL param.
- Moved the People facet in `getDirectoryFacets` from the unpaginated `getDirectoryProfiles` path to `searchDirectoryProfiles`.
- Added `projectDirectoryProfileListItem` as the shared People card projection, preserving avatar preference, trust/claim badges, listing tier, and DirectoryProfile privacy/tier field gates.
- Added `profile-projection.test.ts` to prove free public People cards do not leak email/location/org details/rank history while premium cards surface allowed fields.
- Removed the dead `getDirectoryProfiles` list query and its unused `DirectoryFilters` type after the requested `fallow` spike found them.
- Added glossary terms for slug, cross-facet filter, pagination, projection, and penetration test.
- Updated wiki index/log and the custom component inventory for SESSION_0352 and `DirectoryFilters`.

## Decisions resolved

- `discipline` remains the public URL param and is standardized on `Discipline.slug`.
- People facet count/pagination now uses real `total`, `page`, and `perPage`, matching Organizations and Trees.
- Free-tier listing cards keep free feature limits even when the viewer owns the profile; the full owner preview remains a detail-route behavior, not a list-card widening.
- No ADR was needed: this was convergence on the existing directory/listing/query architecture, not a new architectural decision.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/web/directory/directory-filters.tsx` | New shared discipline Select component for `/directory`. |
| `apps/web/components/web/directory/directory-listing.tsx` | Renders `DirectoryFilters` inside the existing `FiltersProvider`/`Filters` slot. |
| `apps/web/components/web/directory/directory-query.tsx` | Loads directory facets and filter options, sequentially to avoid the local pg adapter concurrency warning. |
| `apps/web/components/web/directory/directory-facet-results.tsx` | Treats all facets as paginated and always renders `Pagination`. |
| `apps/web/server/web/directory/filter-options.ts` | New slug-aware filter-options query. |
| `apps/web/server/web/directory/facets.ts` | People facet now calls `searchDirectoryProfiles` and returns real pagination metadata. |
| `apps/web/server/web/directory/search-profiles.ts` | Projects People results through the shared trust/tier/privacy helper and includes region in free-text search parity. |
| `apps/web/server/web/directory/profile-projection.ts` | New shared People projection helper for list/search paths. |
| `apps/web/server/web/directory/profile-projection.test.ts` | New pure security/projection regression tests. |
| `apps/web/server/web/directory/queries.ts` | Removed the dead unpaginated list query; kept `findProfileBySlug`. |
| `docs/knowledge/wiki/repo-code-glossary.md` | Added slug, cross-facet filter, pagination, projection, and pen-test glossary entries. |
| `docs/knowledge/wiki/custom-component-inventory.md` | Documented `DirectoryFilters` and People pagination convergence. |
| `docs/knowledge/wiki/index.md` | Added SESSION_0352 and updated glossary/component rows. |
| `docs/knowledge/wiki/log.md` | Appended SESSION_0352 wiki log entry. |
| `docs/sprints/SESSION_0352.md` | Session ledger, pre-flight, verification, and close evidence. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `cd apps/web && bun run typecheck` | Pass. |
| `cd apps/web && bun run lint` | Pass; Biome fixed formatting once, final run no fixes. |
| `cd apps/web && bun test server/web/directory/profile-projection.test.ts lib/directory/facet-result.test.ts` | Pass — 10 tests / 67 expects. |
| `bun run wiki:lint` | Pass — 612 markdown files, no violations. |
| Headless Playwright smoke: `/directory` | Pass — Directory heading/tabs visible, discipline Select visible, selecting a slug writes `?discipline=...`, tab changes preserve discipline, browser console errors `[]`. |
| Headless Playwright tamper smoke: `/directory?discipline=__tampered-other-brand-slug__&type=__bad_type__&page=1&perPage=3` | Pass — invalid `type` normalizes to People, invalid discipline slug does not error, no obvious server/private text rendered, browser console errors `[]`. |
| `npx fallow audit --changed-since HEAD --format human` | First run found dead `getDirectoryProfiles` + type; fixed. Final run: no changed-file issues; inherited dependency/complexity warnings remain excluded by the audit gate. |
| `cd apps/web && bun test` | Not a valid verifier as raw command: it pulled in `e2e/**` and failed on Playwright test-runner loading plus DB-unavailable failures. |
| `cd apps/web && bun run test` | Attempted configured command with `e2e/**` ignored; terminated after it hung in local DB-heavy lineage fixture area. Focused pure tests passed; CI Postgres job remains the DB-backed verifier. |

## Open decisions / blockers

- No blocker for the shipped directory slice.
- Local full unit suite was not a clean local signal in this shell because DB-heavy tests hung or hit `db.<model>` undefined; CI with Postgres should be treated as authoritative for DB-backed behavior.
- Fallow inherited findings remain: dependency candidates (`@ai-sdk/google`, `github-slugger`, `tailwind-merge`, `@react-email/preview-server`) and directory complexity hotspots. No changed-file dead-code issue remains.

## Next session

### Goal

Continue cross-facet `/directory` filter depth after this first slug-based discipline filter: add the next high-value filters without weakening the shared projection/privacy contract.

### First task

Add the next shared `/directory` filters in order of product value: organization/school slug and rank/location options, using the same `FiltersProvider` + common `Select` pattern, then add a DB-backed integration test or CI-only fixture that proves invalid/cross-brand filter params return zero results without leaking private fields.

## Review log

### SESSION_0352_REVIEW_01 — Directory filter and People search convergence

- **Reviewed tasks:** SESSION_0352_TASK_01, SESSION_0352_TASK_02
- **Dirstarter docs check:** live Project Structure and Prisma Setup checked 2026-06-06; local Dirstarter component/docs inventories checked.
- **Verdict:** Pass with local-test caveat. The UI composes existing primitives, People now uses the paginated search path, and the projection test covers the main privacy regression risk. The local full unit suite was not usable as a complete signal in this shell; CI must verify DB-backed paths.
- **Score:** 9.4/10 locally; can rise after pushed CI and deploy are green.
- **Follow-up:** Add remaining filters and a DB-backed/cross-brand filter test.

## Hostile close review

- **Giddy:** Pass — extends the existing directory feature folder and Dirstarter-style component/query pattern; no schema, route, or architecture fork.
- **Doug:** Pass with caveat — focused privacy/projection tests and browser tamper smoke passed; local full unit suite was inconclusive due DB/test-runner environment.
- **Desi:** Pass — `DirectoryFilters` composes the common `Select` and stays in the existing filter bar; no raw controls or new shell.
- **Security risk review:** Top 3 failure modes considered:
  1. Cross-brand filter leakage: a manually supplied discipline slug from another brand could reveal People/Orgs/Trees if the server trusted the URL alone. Mitigation: all facet queries retain server-derived `brand`; tamper smoke with an invalid slug returned a safe page.
  2. Projection downgrade leak: moving People to `searchDirectoryProfiles` could have bypassed `DirectoryProfile` flags or listing-tier policy. Mitigation: `projectDirectoryProfileListItem` is shared and tested to redact free public email/location/org/rank-history fields.
  3. Param/type injection or query crash: invalid `type`, `discipline`, `page`, or `perPage` values could crash SSR or expose errors. Mitigation: `normalizeDirectoryFacetTab` keeps bad type values on People; tamper smoke found no server/private text or console errors.
- **Pen tests worth keeping:** cross-brand slug test with seeded other-brand discipline; unauthenticated public payload scan for emails/phones/private evidence; authenticated-vs-anonymous MEMBERS_ONLY comparison to ensure public visitors cannot infer restricted profiles by count deltas.
- **Kaizen aggregate:** 9.4/10 — implementation and focused proof are strong; full DB proof depends on CI.

## ADR / ubiquitous-language check

- ADR update not required. No new architecture decision, schema policy, or Dirstarter replacement was introduced.
- Ubiquitous language update not required. No new domain model terms were introduced; glossary updated for technical/session terms.

## Reflections

- The risky part of this task was not the Select; it was keeping People cards on the exact same privacy/tier/trust projection after changing the query family. Pulling that projection into one helper made the risk explicit and testable.
- The local browser smoke caught a useful driver warning: running filter options and facets concurrently produced a local pg adapter concurrency warning. Sequential reads are a better tradeoff here.
- Fallow was useful in exactly the intended way this session: it identified the now-dead unpaginated People list query after convergence, and removing it reduced future confusion.
- Local full test behavior remains noisy when DB-heavy tests run from this shell. Focused pure tests plus CI's Postgres service are the practical split until the local DB/test environment is repaired.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `repo-code-glossary.md`, `custom-component-inventory.md`, `wiki/index.md`, and SESSION_0352 stamped with `updated: 2026-06-06` / `last_agent: codex-session-0352` where applicable. |
| Backlinks/index sweep | `wiki/index.md` row added for SESSION_0352; custom component inventory pairs with SESSION_0352; `wiki/log.md` appended SESSION_0352. |
| Wiki lint | `bun run wiki:lint` passed — 612 markdown files, no violations. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | SESSION_0352_REVIEW_01 plus Giddy/Doug/Desi/security review present. |
| Review & Recommend | Next session goal and first task written. |
| Memory sweep | No operator memory update needed; durable facts are in SESSION/wiki/component inventory. |
| Next session unblock check | Unblocked: remaining `/directory` filters can build on the same filter/options/projection pattern. |
| Git hygiene | Branch `main`; FS-0024 remote/cwd guard passed; commit hash reported at bow-out — see git log. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` completed; `graphify stats`: 9610 nodes, 15100 edges, 1392 communities, 1606 files tracked. |
