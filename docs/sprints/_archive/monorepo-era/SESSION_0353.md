---
title: "SESSION 0353 — Directory location + org/school filters and per-facet filter visibility"
slug: session-0353
type: session--implement
status: closed
created: 2026-06-06
updated: 2026-06-06
last_agent: claude-session-0353
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0352.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0353 — Directory location + org/school filters and per-facet filter visibility

## Date

2026-06-06

## Operator

Brian + claude-session-0353

## Goal

Continue cross-facet `/directory` filter depth after the SESSION_0352 discipline slug filter: add a structured location filter (Region + City selects) and an organization/school slug filter (searchable combobox), threaded through the existing `FiltersProvider` and the People/Organizations/Trees facet dispatcher, hidden per-facet where they do not apply, without weakening the shared DirectoryProfile privacy/projection/brand-scope contract. Prove cross-brand/invalid filter params return zero results and leak no private fields via a pure where-builder + projection test, then a Desi design/responsiveness pass on touched surfaces plus capped site-wide quick wins.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0352.md`.
- Carryover: SESSION_0352 shipped the first shared cross-facet filter (discipline `Discipline.slug` Select) and moved People onto the paginated, privacy-aware `searchDirectoryProfiles` via the shared `projectDirectoryProfileListItem`. It explicitly handed off the next filters (org/school slug, rank/location) plus a cross-brand DB/fixture test as the SESSION_0353 first task. No higher-priority blocker superseded it.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean before creating `docs/sprints/SESSION_0353.md`.
- Current HEAD at bow-in: `f46e6fd`
- Remote guard: `origin` is `https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline.git`; cwd is `/Users/brianscott/dev/ronin-dojo-app`, not `dirstarter_template`. FS-0024 guard passed.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Public App Router page/component structure, `components/common/{select,command,popover,button}` primitives, `combobox-selector` (admin → promoted to common), `FiltersProvider`/nuqs filter state, `server/web/directory/**` queries + Prisma read shape. |
| Extension or replacement | Extension: keep the Ronin `server/web/directory` + `components/web/directory` feature folders and compose existing common primitives/filter context; promote the existing generic `ComboboxSelector` from `admin/` to `common/` rather than handrolling a typeahead. |
| Why justified | `/directory` is the canonical public discovery surface; structured location + org/school filters are the next high-value discovery facets, and they must share the existing privacy/brand-scope substrate. |
| Risk if bypassed | Hand-rolled filters/combobox would repeat FS-0001/FS-0014, and bypassing the shared projection/brand-scope could leak private DirectoryProfile fields or allow cross-brand discovery. |

Live docs checked during planning: local Dirstarter component/docs inventories (`dirstarter-component-inventory.md`, `dirstarter-docs-inventory.md`) on 2026-06-06; SESSION_0352 active directory source files verified by direct read.

### Graphify check

- Graph status: current (built at end of SESSION_0352); `graphify stats` at bow-in: 9610 nodes, 15100 edges, 1392 communities, 1606 files tracked.
- Queries used:
  - `directory filter options organization school slug rank location Select FiltersProvider searchDirectoryProfiles brand scope`
- Files selected from graph / bounded follow-up (verified by direct read):
  - `apps/web/server/web/directory/{filter-options,facets,search-profiles,search-organizations,profile-projection,schema,member-schema,school-schema}.ts`
  - `apps/web/components/web/directory/{directory-filters,directory-listing,directory-query,directory-facet-tabs}.tsx`
  - `apps/web/contexts/filter-context.tsx`
  - `apps/web/components/common/{select,command}.tsx`, `apps/web/components/admin/combobox-selector.tsx`
  - `apps/web/prisma/schema.prisma` (RankSystem/Rank/Membership/Discipline/Organization/DirectoryProfile)
- Verification note: Graphify is navigation only; the directory schema already declares `org`/`rank`/`city`/`region` params, and `searchDirectoryProfiles` already supports `city`/`region` — confirmed by exact source reads, not the graph.

### Grill outcome

Petey grilled two rounds (operator answered via AskUserQuestion):

1. **Filter scope** — Round 1: operator chose all of location + org/school + rank. Round 2 (after schema proof that `RankSystem` is per-`discipline`+`brand`, so there is no global rank): operator **deferred rank** → ship **location + org/school slug** this session.
2. **Location UX** — Two selects: **Region then City**, options sourced from PUBLIC, brand-scoped locations (DirectoryProfile + Organization), with City narrowing to the chosen Region.
3. **Org/school filter control** — **Searchable combobox** (promote the existing generic `ComboboxSelector`).
4. **Cross-facet visibility** — **Hide non-applicable filters per facet** (no dead/greyed controls). People: discipline + org + region + city; Orgs: discipline + region + city; Trees: discipline + org.
5. **Test approach** — **Pure where-builder unit test + extend projection test** (runs clean locally and in CI; CI Postgres remains the DB-backed verifier).
6. **Desi/mobile scope** — Fix touched pages (`/directory`, facet bar, cards) **+ capped site-wide quick wins (≤3)**; catalog the rest to the wiring-ledger.

### Drift logged

- No new drift discovered at bow-in. D-? directory enum-consolidation note (SESSION_0350, document-only) acknowledged; this session adds no new enums. Fallow dependency candidates already tracked as **WL-P2-10** (see below) — folding triage there per operator request, not opening a new finding.

## Petey plan

### Goal

Ship structured location (Region + City) and org/school slug (combobox) `/directory` filters that reuse the shared projection/brand-scope contract, hidden per-facet where inapplicable, with a pure cross-brand/leak regression test and a Desi responsiveness pass.

### Tasks

#### SESSION_0353_TASK_01 — Promote ComboboxSelector to a common primitive

- **Agent:** Cody
- **What:** Move the generic `ComboboxSelector` from `components/admin/` to `components/common/` and repoint existing admin import sites.
- **Steps:**
  1. Move `combobox-selector.tsx` to `components/common/`; keep the API identical (`options`, `value`, `onValueChange`, `clearable`, placeholders).
  2. Update all current admin consumers' import paths.
  3. Typecheck/lint to confirm no broken imports.
- **Done means:** `ComboboxSelector` lives in `components/common/` and all existing consumers compile; public directory can compose it without importing from `admin/`.
- **Depends on:** nothing.

#### SESSION_0353_TASK_02 — Location + org filter query support (server)

- **Agent:** Cody
- **What:** Extend the directory query family to filter People/Orgs/Trees by location and org slug, with brand always server-derived.
- **Steps:**
  1. Extract a pure `buildDirectoryProfileWhere({ search, brand, viewerUserId })` from `searchDirectoryProfiles` (so the where clause is unit-testable) and add `org` (membership → `organization.slug` within the existing brand-scoped `some`).
  2. Add `city`/`region`/`org`-equivalent support to `searchOrganizations` (`org.city`/`org.state`) — location only; org-slug filter does not apply to the Orgs facet.
  3. Thread `org`/`city`/`region` through `getDirectoryFacets` per facet: People (org+location+discipline), Orgs (location+discipline), Trees (`organization`=org + discipline; no location).
  4. Extend `getDirectoryFilterOptions` to return brand-scoped `organizations: {slug,name}[]` and location options (`regions: string[]`, `cities: {region,city}[]`) from PUBLIC profiles ∪ organizations.
  5. Thread the new params from `DirectoryQuery` into the dispatcher.
- **Done means:** `/directory?org=<slug>&region=<r>&city=<c>` filters the correct facets server-side; brand stays server-derived; filter-options returns org + location lists.
- **Depends on:** nothing (parallel-safe with TASK_01; merges before TASK_03 UI).

#### SESSION_0353_TASK_03 — Per-facet filter UI (client)

- **Agent:** Cody
- **What:** Render the new controls in `DirectoryFilters`, reading the active facet from `filters.type` and showing only applicable filters.
- **Steps:**
  1. Add Region + City `Select`s (City options narrow to selected Region) and an org `ComboboxSelector` writing `filters.org`.
  2. Compute active tab from `filters.type` (same `normalizeDirectoryFacetTab` logic) and conditionally render: People → discipline+org+region+city; Orgs → discipline+region+city; Trees → discipline+org.
  3. Ensure the filter bar wraps responsively (Stack `flex-wrap`, controls `flex-1`/`min-w-0` on small screens) and the combobox popover is mobile-friendly.
- **Done means:** the right filters appear per tab, write the right URL params, and the bar is responsive with no overflow.
- **Depends on:** SESSION_0353_TASK_01, SESSION_0353_TASK_02.

#### SESSION_0353_TASK_04 — Cross-brand / leak regression test

- **Agent:** Cody (verified by Doug)
- **What:** Pure unit test proving cross-brand/invalid filter params yield a brand-pinned (zero-result) where clause and no private-field leak.
- **Steps:**
  1. Unit-test `buildDirectoryProfileWhere`: a foreign-brand org slug / bad discipline / bad city/region keeps `organization: { brand }` server-derived (→ matches nothing across brands), never trusts the URL alone.
  2. Extend `profile-projection.test.ts` to assert free public cards still redact email/location/org/rank-history under the new filter inputs.
- **Done means:** `bun test` passes locally for the new/extended pure tests; CI Postgres covers DB-backed paths.
- **Depends on:** SESSION_0353_TASK_02.

#### SESSION_0353_TASK_05 — Desi review + responsiveness + fallow/WL-P2-10 triage

- **Agent:** Desi (review) → Cody (fixes)
- **What:** Design/responsiveness review of touched surfaces + capped (≤3) site-wide quick wins; triage the WL-P2-10 fallow dependency candidates.
- **Steps:**
  1. Desi reviews `/directory` filter bar, facet tabs, and cards for micro/macro motion delight, mobile optimization, and consistency; returns a prioritized fix list.
  2. Cody fixes touched-page issues + ≤3 highest-impact site-wide quick wins; catalog the rest to the wiring-ledger.
  3. Run `npx fallow audit --changed-since HEAD`; verify each WL-P2-10 dependency (`@ai-sdk/google`, `github-slugger`, `tailwind-merge`, `@react-email/preview-server`) against real/dynamic usage; resolve or update WL-P2-10 with the decision.
- **Done means:** touched surfaces pass Desi; WL-P2-10 updated with a clear keep/remove decision per dependency; remaining site-wide issues catalogued.
- **Depends on:** SESSION_0353_TASK_03.

### Parallelism

TASK_01 and TASK_02 are disjoint (admin imports vs directory server) and can run concurrently; TASK_03 depends on both; TASK_04 depends on TASK_02; TASK_05 depends on TASK_03. Doing these inline sequentially (single coherent change), not via sub-agents, since they share the directory feature folder.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0353_TASK_01 | Cody | Mechanical primitive promotion + import repoint. |
| SESSION_0353_TASK_02 | Cody | Privacy/brand-scope query extension; the risk surface. |
| SESSION_0353_TASK_03 | Cody | UI composition on existing primitives + per-facet logic. |
| SESSION_0353_TASK_04 | Cody/Doug | Pure regression proof of the brand-scope/leak contract. |
| SESSION_0353_TASK_05 | Desi/Cody | Design/responsiveness + dependency hygiene triage. |

### Open decisions

- None at plan-lock. Rank deferred by operator decision (round 2).

### Risks

- Promoting `ComboboxSelector` could touch several admin import sites; mitigate by repointing imports + typecheck before further work.
- `searchDirectoryProfiles` location/org filtering must keep `organization: { brand }` server-derived inside the membership `some` — a slip could allow cross-brand discovery; the where-builder extraction + test is the guard.
- Location-option sourcing must use PUBLIC, brand-scoped rows only (no leaking that a private profile exists in a city); free-text contains-match stays case-insensitive.
- Local DB-heavy tests are flaky in this shell (SESSION_0352); pure tests are the local signal, CI Postgres is authoritative.

### Scope guard

- Do **not** build rank, sort, or org-type dropdowns this session (rank deferred; org-type UI stays deferred).
- Do not add schema, migrations, new public models, or new tier semantics.
- Do not change `/members` compatibility redirects or the `/directory/[slug]` detail policy.
- Do not broaden public DirectoryProfile payloads beyond existing allowlisted fields.
- Site-wide Desi fixes capped at ≤3 quick wins; everything else is catalogued, not fixed.

### Dirstarter implementation template

- **Docs read first:** local Dirstarter component/docs inventories + SESSION_0352 active source verified 2026-06-06.
- **Baseline pattern to extend:** Next.js App Router public page → feature-scoped `components/web/directory` + `server/web/directory`; Prisma reads via `~/services/db`; common `Select`/`Command`/`Popover`/`Button` + `ComboboxSelector`; `FiltersProvider` + nuqs params.
- **Custom delta:** Ronin-specific structured location + org/school slug filters across People/Orgs/Trees with shared privacy/tier/brand-scope projection and per-facet visibility.
- **No-bypass proof:** Reuses the directory feature folder and promotes an existing generic combobox primitive; no parallel filter system, no duplicate public model.

## Cody pre-flight

### Pre-flight: Directory location + org/school filters

#### 1. Existing component scan

- Graphify query used: `directory filter options organization school slug rank location Select FiltersProvider searchDirectoryProfiles brand scope`
- Found: `DirectoryFilters`, `DirectoryListing`, `DirectoryQuery`, `DirectoryFacetTabs`, `getDirectoryFacets`, `getDirectoryFilterOptions`, `searchDirectoryProfiles`, `searchOrganizations`, `searchPublishedLineageTrees`, `projectDirectoryProfileListItem`, common `Select`, `Command`, `Popover`, `Button`, admin `ComboboxSelector`, `useFilters`/`FiltersProvider`.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: yes.
- Consulted live alignment URLs: cached/local inventories sufficient for this composition-only change.
- Closest L1 pattern: public listing/query/filter composition under `components/web/*` + feature-scoped `server/**/queries.ts`.
- Primitive API spot-check:
  - `Select`/`SelectTrigger`/`SelectValue`/`SelectContent`/`SelectItem`: Base UI; `value` + `onValueChange`, trigger `size`.
  - `ComboboxSelector`: `options: {id,name}[]`, `value`, `onValueChange`, `clearable`, placeholders; composes `Command` + `Popover` + `Button`.
  - `useFilters<DirectoryFilterSchema>()`: exposes `filters` (incl. `type`) + `updateFilters`.

#### 3. Composition decision

- Extending existing component: `DirectoryFilters`, `getDirectoryFilterOptions`, `searchDirectoryProfiles`, `searchOrganizations`, `getDirectoryFacets`, `DirectoryQuery`.
- Composing existing components: `Select`, `ComboboxSelector` (promoted), `Stack`.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes (`SESSION_0352.md`).
- ADR read: not required; no schema/architecture decision. Brand-column doctrine (ADR 0004) honored via server-derived `brand`.
- Runbook consulted: `graphify-repo-memory.md`, `verification-and-testing.md`; `docs/security/*` privacy/brand-scope docs (read as needed).

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo`.
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`; gates from `apps/web`.
- Brand/host for testing: local Next app host, `http://localhost:3000/directory`.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001, FS-0008, FS-0014 (handroll-instead-of-L1 cluster), FS-0024 (git cwd guard).
- Mitigation acknowledged: compose `Select` + promote/reuse `ComboboxSelector` (no scratch typeahead); read primitive APIs before use; verified cwd/remote before any git.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0353_TASK_01 | complete | Promoted `ComboboxSelector` admin→common, repointed 11 imports (incl. one public consumer). |
| SESSION_0353_TASK_02 | complete | Added location + org-slug query support; extracted testable `buildDirectoryProfileWhere`; threaded per-facet; new filter-options (orgs + region/city). |
| SESSION_0353_TASK_03 | complete | Per-facet `DirectoryFilters` UI (People: discipline+org+region+city; Orgs: discipline+region+city; Trees: discipline+org); responsive, verified 390px. |
| SESSION_0353_TASK_04 | complete | `profile-where.test.ts` (cross-brand/leak/visibility) + projection test — 20 pure tests pass. |
| SESSION_0353_TASK_05 | complete | Desi review → applied 3 top fixes (combobox size parity, accessible clear button, site-wide `motion-reduce`); WL-P2-10 dep triage (2 keep / 2 removable). |
| SESSION_0353_TASK_06 | complete | Bug A: Base UI Select `items` label fix (directory discipline + lineage selected-rank); systemic ~17 cataloged (WL-P1-7). |
| SESSION_0353_TASK_07 | complete | Investigated prod lineage: Bug B (drawer = tier-gated, not code) + Bug C (17v12 = visibility-by-design). No code change. |

## What landed

- Promoted `ComboboxSelector` from `components/admin/` to `components/common/` (generic Command+Popover+Button primitive); repointed all 11 imports including the public `invite/[code]/claim-form`.
- Added structured location filtering: `Region` + `City` selects (City narrows to chosen Region), options sourced from PUBLIC, brand-scoped DirectoryProfiles ∪ Organizations.
- Added organization/school slug filtering via a searchable combobox; People filter on brand-scoped membership org slug, Trees on tree org slug; Orgs facet location-only.
- Extracted pure `buildDirectoryProfileWhere` so the brand-pinned privacy where-clause is unit-testable; `searchOrganizations` gained city/state filtering.
- Per-facet filter visibility: People = discipline+org+region+city; Organizations = discipline+region+city; Trees = discipline+org (filters hidden where inapplicable).
- Desi design review applied: combobox trigger now matches the Select triggers (38px / 8px radius), accessible labeled clear button (≥full-height target), and a site-wide `motion-reduce:animate-none` on `popoverAnimationClasses`.
- Fixed Bug A (Base UI Select rendered raw id/slug on preset): added `items` to the directory discipline Select and the lineage "selected rank" Select; verified the discipline trigger now shows the name.
- Cleanups (fallow on changed files): removed dead `member-schema` exports + the unused `ClassValue` re-export; changed-file dead-code now clean.
- Diagnosed two prod lineage reports as non-code: drawer is tier-gated (Bug B); 12-vs-17 is visibility-by-design (Bug C).

## Decisions resolved

- Rank filter **deferred** (round-2 grill): `RankSystem` is per discipline+brand, so a flat global rank select is misleading; ship location + org/school only.
- Location UX = two selects (Region → City); org picker = searchable combobox; non-applicable filters **hidden** per facet.
- Cross-brand/leak proof = pure where-builder + projection unit tests (CI Postgres remains the DB-backed verifier).
- WL-P2-10 dependency triage: **keep** `tailwind-merge` (runtime peer of `tailwind-variants`, shipped in `.next` chunks) and `@react-email/preview-server` (the `email dev` script); **`@ai-sdk/google` + `github-slugger` confirmed unused** — removal deferred to a deps session because three lockfiles (`bun.lock`, `package-lock.json`, root `pnpm-lock.yaml`) must be regenerated together or the Vercel/pnpm deploy breaks.
- Lineage profile drawer is a paid feature (`canOpenProfileDrawer` false on FREE) — enabling it on prod is an entitlement/billing action, not a code change; not altered this session.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/common/combobox-selector.tsx` | Moved from `admin/`; added `size`/`clearLabel` props + accessible sibling clear button. |
| `apps/web/app/**/_components/*.tsx` (+ `invite/[code]/claim-form.tsx`, `walk-in-registration-dialog.tsx`) | Repointed 11 `ComboboxSelector` imports admin→common. |
| `apps/web/components/web/directory/directory-filters.tsx` | Per-facet Region/City selects + org combobox; `items` on discipline Select; `size="lg"` combobox. |
| `apps/web/components/web/directory/directory-query.tsx` | Thread `org`/`city`/`region` params into the facet dispatcher. |
| `apps/web/server/web/directory/facets.ts` | `DirectoryFacetParams` += org/city/region; per-facet threading. |
| `apps/web/server/web/directory/filter-options.ts` | Added org + region/city option lists; sequential reads (pg-adapter safe). |
| `apps/web/server/web/directory/profile-where.ts` | New pure brand-pinned where-builder (`buildDirectoryProfileWhere`). |
| `apps/web/server/web/directory/profile-where.test.ts` | New cross-brand/leak/visibility unit tests. |
| `apps/web/server/web/directory/search-profiles.ts` | Use `buildDirectoryProfileWhere`; accept `org`. |
| `apps/web/server/web/directory/search-organizations.ts` | Add city/state (region) filtering. |
| `apps/web/server/web/directory/member-schema.ts` | Add `org`; trim dead `cache`/`Schema` exports. |
| `apps/web/server/web/directory/school-schema.ts` | Add `city`/`region` params. |
| `apps/web/app/admin/lineage/_components/lineage-selected-rank-select.tsx` | Bug A: `items` so the trigger shows the rank label, not the id. |
| `apps/web/lib/utils.ts` | `popoverAnimationClasses` += `motion-reduce:animate-none`; drop unused `ClassValue` re-export. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `cd apps/web && bun run typecheck` | Pass. |
| `cd apps/web && bun run lint` | Pass (Biome, no fixes on final run). |
| `cd apps/web && bun test server/web/directory/profile-where.test.ts profile-projection.test.ts lib/directory/` | Pass — 20 tests / 89 expects. |
| `npx fallow audit --changed-since HEAD` | Changed-file dead code clean after cleanup; only WL-P2-10 deps + inherited admin-form duplication remain. |
| Live Playwright `/directory` | Per-facet filters correct (People 4 / Orgs 3 / Trees 2 controls); Region writes `?region=`, City narrows to region, `?city=` writes; console errors `[]`. |
| Live Playwright tamper `?org=__cross-brand__&type=trees&...` | "No lineage trees found", no leak, console `[]`. |
| Live Playwright combobox | Trigger 38px/8px = Selects; clear button labeled + clears `?org=`. |
| Mobile 390px | No horizontal overflow; controls wrap (disciplines/schools full-width, region+city paired). |
| Bug A repro | `/directory?discipline=<slug>` preset showed slug before fix → shows name after `items` fix. |
| Bug B/C prod probe | Drawer gated by FREE-tier `canOpenProfileDrawer=false` (not code); 12 vs 17 = PUBLIC-visibility filter (not code). |

## Open decisions / blockers

- **WL-P1-7 (new):** Base UI `Select` shows the raw id/slug on preset for ~17 id-valued consumers (only directory discipline + lineage selected-rank fixed). Systemic sweep needed — pass `items` (or a `DataSelect` wrapper).
- **WL-P2-10:** `@ai-sdk/google` + `github-slugger` confirmed removable, but the triple-lockfile reconciliation must be a dedicated deps session to keep the deploy green.
- **Bug B (prod):** enabling the Rigan tree drawer = grant the tree owner a lineage PREMIUM/ELITE entitlement (operator/billing), or a deliberate policy change. Not a code task.
- **Bug C (prod):** show all 17 publicly = set the 5 non-PUBLIC members' node visibility to PUBLIC in admin (data task).
- **Directory discipline-filter bug (fixed):** `/directory` showed schools/region/city but not the discipline filter. Root cause: the 12 disciplines are **system rows** (`isSystem: true`, `brand: null`), but `getDirectoryFilterOptions` queried strict `where: { brand }`, excluding every system discipline. Fixed to match the `/disciplines` page scope (`OR: [{ isSystem: true }, { brand }]`). (Pre-existing in the SESSION_0352 filter; this session also added `items`.) **Note:** prod has all 12 disciplines (an earlier "10" reading was a `curl | head` truncation artifact — `comm` confirmed zero missing); no discipline seed gap.

## Next session

### Goal

Systemically fix the Base UI Select id/slug-label bug (WL-P1-7) across the remaining id-valued Select consumers, and run the WL-P2-10 deps-hygiene + triple-lockfile reconciliation.

### First task

Introduce a small `items`-aware select pattern (either pass `items` to each `Select.Root` or a `DataSelect` wrapper that takes `options: {value,label}[]`), migrate the ~17 enumerated id-valued consumers (rank/org/user/tier/technique/discipline/mat/fight/schedule/program/content selects), and add a focused render test asserting a preset value shows the label, not the id.

## Review log

### SESSION_0353_REVIEW_01 — Directory location/org filters + Select label fix

- **Reviewed tasks:** SESSION_0353_TASK_01..07
- **Dirstarter docs check:** local component/docs inventories; composition-only change on existing primitives.
- **Verdict:** Pass. Filters reuse the shared projection/brand-scope contract, per-facet visibility is correct, and the cross-brand/leak risk is covered by the pure where-builder test. The live smoke caught and fixed a real pg-concurrency regression and confirmed the combobox parity + Bug A fix. Prod lineage reports were correctly classified as non-code (tier/visibility).
- **Score:** 9.3/10 locally; rises after pushed CI + deploy green.
- **Follow-up:** WL-P1-7 systemic Select sweep + WL-P2-10 deps session.

## Hostile close review

- **Giddy:** Pass — extends the directory feature folder + promotes an existing primitive; no parallel system, no schema/route fork.
- **Doug:** Pass — pure tests green locally (20/89); CI Postgres remains the DB-backed verifier; live smoke honest about the pg-adapter warning that was found and fixed.
- **Desi:** Pass — combobox now matches Select height/radius, accessible clear button, reduced-motion guarded; remaining polish cataloged to WL.
- **Security risk review:** (1) cross-brand filter leakage — mitigated, `buildDirectoryProfileWhere` always ANDs server-derived `brand` (tested); (2) projection downgrade — People still routed through `projectDirectoryProfileListItem` (tested no email/location/org/rank leak); (3) location-option leakage — sourced from PUBLIC profiles only, so MEMBERS_ONLY/HIDDEN profiles don't reveal a city.
- **Kaizen aggregate:** 9.3/10.

### Findings (severity ≥ medium)

#### SESSION_0353_FINDING_01 — Base UI Select renders raw id/slug on preset

- **Severity:** medium
- **Task:** SESSION_0353_TASK_06
- **Evidence:** `components/common/select.tsx` (no `items` forwarded by default); reproduced on `/directory?discipline=<slug>`.
- **Impact:** Any id/slug-valued Select shows a cuid/slug until the popup is opened (rank, org, user, tier selects, etc.).
- **Required follow-up:** Systemic `items` pass — see WL-P1-7.
- **Status:** open (2 highest-value consumers fixed this session).

## ADR / ubiquitous-language check

- ADR update not required. No new architecture decision, schema, or Dirstarter replacement; brand-scope honored via server-derived `brand` (ADR 0004).
- Ubiquitous language update not required. No new domain terms; the lineage drawer tier-gate (`canOpenProfileDrawer`) is existing tier-policy behavior, not a new term.

## Reflections

- The grill paid off twice: schema proof killed a misleading global rank filter, and forcing the location/org decisions early kept the build coherent.
- The live smoke earned its keep — it caught a pg-adapter concurrency regression my `$transaction([])` introduced (cleared by sequential reads) that typecheck/lint/tests all missed.
- The operator's "rank shows a cuid" report led to a genuinely systemic Base UI footgun (Select needs `items`); resisting the urge to patch 17 files right before a push (lockfile/CI risk) and instead fixing the 2 named + cataloging the rest was the right altitude.
- Two "bugs" were not bugs: the lineage drawer is tier-gated and the 12-vs-17 is visibility-by-design. Driving prod read-only to classify them prevented a wrong code change. The seed-vs-prod gap (local trees are seeded premium/claimed) is why local "worked".

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0353 + touched wiki docs stamped `updated: 2026-06-06` / `last_agent: claude-session-0353`. |
| Backlinks/index sweep | `wiki/index.md` row + `wiki/log.md` entry for SESSION_0353; `custom-component-inventory.md` ComboboxSelector + directory filters. |
| Wiki lint | `bun run wiki:lint` — pass, 613 files, 0 violations (after bumping 3 touched wiki docs to 2026-06-07). |
| Kaizen reflection | Reflections section present. |
| Hostile close review | SESSION_0353_REVIEW_01 + Giddy/Doug/Desi/security present. |
| Review & Recommend | Next session goal + first task written. |
| Memory sweep | Added memory for Base UI Select `items` footgun + lineage drawer tier-gate. |
| Next session unblock check | Unblocked: WL-P1-7 sweep is self-contained. |
| Git hygiene | Branch `main`; FS-0024 guard passed; single push — hash reported at bow-out / see git log. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` — 9623 nodes, 15150 edges, 1416 communities, 1608 files tracked. |
