---
title: "SESSION 0350 — First faceted /directory browse slice (people, schools/orgs, lineage trees)"
slug: session-0350
type: session--implement
status: closed
created: 2026-06-06
updated: 2026-06-06
last_agent: claude-session-0350
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0349.md
  - docs/product/black-belt-legacy/GAP_MATRIX.md
  - docs/runbooks/domain-features/lineage-listing-runbook.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0350 — First faceted /directory browse slice (people, schools/orgs, lineage trees)

## Date

2026-06-06

## Operator

Brian + claude-session-0350

## Goal

Build the first read-only faceted `/directory` browse slice across three result groups — people
(`DirectoryProfile`), schools/organizations (`Organization`), and published lineage trees
(`LineageTree`) — behind a result-type segmented control, reusing the existing `search*` query family,
the shared `FiltersProvider`/`Filters` (nuqs) primitive, and the SESSION_0349 trust badges, while
preserving each source model's privacy/brand-scope rules and without restoring `/members` as a
duplicate public list.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md).
Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0349.md` (closed, 9.7/10).
- Carryover: SESSION_0349 shipped shared trust badges across directory + lineage surfaces, added limited
  `LINEAGE_LEGEND` policy support, retired `BASIC` from the tier ladder (D-019), and **planned but did not
  build** the first faceted `/directory` slice. This session implements that slice.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean before creating `docs/sprints/SESSION_0350.md`.
- Current HEAD at bow-in: `02d90b9`
- Remote guard: `origin` is `https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline.git`; cwd is
  `/Users/brianscott/dev/ronin-dojo-app` (not `dirstarter_template`). FS-0024 guard passed.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Public web feature folders (`components/web/*`), Prisma `select` read payloads, the `nuqs` filter/sort primitive, brand-scoped public queries. |
| Extension or replacement | Extension: assemble existing `search*` read models + the shared `FiltersProvider`/`Filters` primitive behind one faceted shell; add a presentation-only `DirectoryFacetResult` adapter and `FacetResultCard`. No new substrate. |
| Why justified | BBL-DISCOVER-001/002 require faceted people/schools/lineage-tree browse; SESSION_0349 left it planned. The work is assembly + a presentation adapter, not a new query or schema layer. |
| Risk if bypassed | Re-inventing filter UI (see FS-0001) or duplicating people/org/tree queries; leaking privacy-gated fields across surfaces; resurrecting a `/members` duplicate. |

Live docs checked during planning on 2026-06-06: Dirstarter Project Structure, Prisma Setup, UI
primitives (via SESSION_0349 alignment, re-confirmed for filter/card primitives).

### Graphify check

- Graph status: current (refreshed at SESSION_0349 close). `graphify stats` at bow-in: 9395 nodes,
  14688 edges, 1376 communities, 1595 files tracked.
- Queries used:
  - `faceted directory people schools organizations lineage trees filters`
  - `public lineage trees index list published summary cards schools page organization filters`
  - `DirectoryFacetResult member listing search profiles organizations lineage trees card adapter pagination filters`
- Files selected from graph (then opened directly):
  - `apps/web/contexts/filter-context.tsx`, `apps/web/components/web/filters/filters.tsx`
  - `apps/web/server/web/directory/queries.ts` (`getDirectoryProfiles`),
    `apps/web/server/web/directory/search-profiles.ts` (`searchDirectoryProfiles`),
    `apps/web/server/web/directory/search-organizations.ts` (`searchOrganizations`)
  - `apps/web/components/web/directory/directory-query.tsx`,
    `apps/web/components/web/directory/directory-list.tsx`
  - `apps/web/app/(web)/organizations/page.tsx`, `apps/web/server/web/organization/queries.ts`
  - `apps/web/app/(web)/schools/page.tsx`, `apps/web/components/web/schools/school-query.tsx`
  - `apps/web/app/(web)/lineage/page.tsx`, `apps/web/server/web/lineage/queries.ts`
    (`searchPublishedLineageTrees` / `findPublishedLineageTrees`),
    `apps/web/components/web/lineage/lineage-query.tsx`
  - `apps/web/components/web/members/member-query.tsx` (orphaned; consumes `searchDirectoryProfiles`)
- Verification note: exact files opened after Graphify; Graphify used as navigation, not proof.

### Grill outcome

Two grill rounds with the operator. Decisions locked:

Round 1 (scope/shape):

- Slice width: **all three groups, thin** — card-header fields only, reuse existing queries, minimal filters.
- Presentation: **result-type segmented control** (`?type=`), one active group at a time.
- Orchestration: **inline, baton discipline** (Petey → Cody → Desi → Doug); files overlap, subagents not worth it.
- Governance: **trial `fallow` (read-only) at bow-out**; keep grill/petey-plan as parlance (no skill this session).

Round 2 (DRY + schema/enum):

- People query path: **reuse `getDirectoryProfiles` now** (already has trust+tier; no pagination yet).
  Convergence onto the paginated `search*` family is a follow-up.
- Dedupe: **delete the orphaned `components/web/members/*`** (provably behind the `/members → /directory`
  redirect); **do NOT redirect `/organizations`** — it is intentionally distinct (affiliations / groups of
  schools / tournament bodies like WEKAF), to be repurposed/refocused later, not deduped into `/schools`.
- Enum/schema: **document only** — record the three redundancies (visibility triple, ACTIVE/EXPIRED/CANCELLED
  status sprawl, `ToolTier` vs profile-tier dualism) as drift + a consolidation note; no migration.
  `DirectoryFacetResult` is a TS discriminated union, not a new enum.
- Shared card blast radius: **`/directory` only** — `FacetResultCard` used inside `/directory`; leave
  `/schools` and `/lineage` cards untouched this slice.

### Drift logged

- `D-020` (to record at close): schema enum redundancies — `DirectoryVisibility` vs `LineageVisibility`
  vs org (none); ~6 `ACTIVE/EXPIRED/CANCELLED`-shaped status enums; `ToolTier` vs `free|premium|elite|legend`
  profile-tier dualism. Document-only this session; consolidation deferred.
- `/organizations` is an unfiltered redundant-looking twin of `/schools` at the data layer (both
  `Organization`), but is intentionally distinct by purpose (affiliations/federations). Refocus is a follow-up,
  not a redirect.

## Petey plan

### Goal

Ship a read-only faceted `/directory` across people, schools/organizations, and published lineage trees with
a result-type segmented control and a shared `FacetResultCard`, reusing existing read models and the shared
filter primitive, then clean up the orphaned members UI and document enum-consolidation findings.

### Tasks

#### SESSION_0350_TASK_01 — DirectoryFacetResult read model + facet dispatcher (server)

- **Agent:** Petey → Cody
- **What:** Add a presentation-only `DirectoryFacetResult` discriminated union and a server adapter that
  dispatches the active result type to the right existing query and normalizes only card header fields.
- **Steps:**
  1. Define `DirectoryFacetResult` (`type: "person" | "organization" | "lineageTree"`) with shared header
     fields (title, href, image/initials, subtitle/meta, badges) plus a small per-type detail bag.
  2. Add `getDirectoryFacets({ brand, type, filters, viewer })` that calls `getDirectoryProfiles` (people),
     `searchOrganizations` (schools/orgs), and `searchPublishedLineageTrees` (trees) and maps each row to
     `DirectoryFacetResult` — reusing the SESSION_0349 trust/claim resolver for people and trees.
  3. Preserve privacy floors: people keep tier/trust projection + per-field flags; orgs stay brand-scoped;
     trees stay published/visibility-scoped.
  4. Unit tests: per-type mapping shape + no-leak (no private claim evidence / hidden fields in the result).
- **Done means:** `DirectoryFacetResult` + `getDirectoryFacets` exist with passing mapping/no-leak tests.
- **Depends on:** nothing.

#### SESSION_0350_TASK_02 — Faceted /directory UI: segmented control + shared FacetResultCard

- **Agent:** Cody → Desi → Doug
- **What:** Render the three groups under a result-type segmented control on `/directory`, using a shared
  `FacetResultCard`, reusing `FiltersProvider`/`Filters` (FS-0001 mitigation).
- **Steps:**
  1. Add a `type` param to the directory filter schema/param cache (default `people`).
  2. Build a result-type segmented control wired through the shared nuqs filter context.
  3. Build `FacetResultCard` composing existing primitives (`Card`, `Avatar`, `Badge`, `Link`) +
     `LineageTrustBadge`/`LineageClaimBadge`; it consumes `DirectoryFacetResult`.
  4. Refactor the `/directory` People list onto `FacetResultCard`; render schools/orgs and lineage-tree groups.
     Keep SESSION_0348 tier gating + SESSION_0349 trust badges intact for people.
  5. Desi: cross-surface card/empty-state/heading consistency. Doug: typecheck + targeted tests + browser smoke
     (`/directory` people/schools/trees, mobile 390px overflow).
- **Done means:** `/directory` renders all three groups via the segmented control + shared card; gates green;
  smoke proves rendering with no overflow/console errors.
- **Depends on:** SESSION_0350_TASK_01.

#### SESSION_0350_TASK_03 — Cleanup, enum documentation, and full close

- **Agent:** Giddy → Doug → Petey
- **What:** Delete the orphaned members UI, document enum findings, update product/runbook/wiki, trial `fallow`,
  and run full bow-out.
- **Steps:**
  1. Prove no live consumers of `components/web/members/*` (only the `/members → /directory` redirect remains),
     then delete it; remove `searchDirectoryProfiles`/member schema only if fully unused afterward.
  2. Record drift `D-020` + a short enum-consolidation note; note `/organizations` refocus-to-affiliations.
  3. Update `GAP_MATRIX.md` (BBL-DISCOVER-001/002, BBL-PROFILE-001), the lineage listing runbook, and
     `custom-component-inventory.md` (`FacetResultCard`, `getDirectoryFacets`).
  4. Trial `npx fallow` (read-only spike) and record whether it earns a future close/CI role.
  5. Run full `closing.md` (optional deep items), Graphify refresh, single commit + push to `main`, CI/deploy green.
- **Done means:** members UI removed with proof; enum findings documented; docs updated; fallow assessed; gates
  pass; session closed, committed, pushed, CI/deploy green.
- **Depends on:** SESSION_0350_TASK_02.

### Parallelism

Inline with baton handoffs (Petey → Cody → Desi → Doug → Petey). The facet read model, UI shell, and card all
touch the same `/directory` + `server/web/directory` files, so subagents/worktrees would add coordination cost.
Graphify is the discovery accelerator instead.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0350_TASK_01 | Petey → Cody | Read-model shape + privacy-safe dispatch is the core design fork. |
| SESSION_0350_TASK_02 | Cody → Desi → Doug | Shared UI card + segmented control + reuse audit + no-overflow verification are coupled. |
| SESSION_0350_TASK_03 | Giddy → Doug → Petey | Dead-code deletion proof, enum docs, and close gates need architecture/process review. |

### Open decisions

- None at plan-lock. Both grill rounds resolved.

### Risks

- People still uses non-paginated `getDirectoryProfiles`; large brands could render long people lists until the
  search-family convergence follow-up lands.
- Deleting `components/web/members/*` must be proven dead first (the `/members` redirect route stays).
- The three `search*` payloads differ in shape; the adapter must normalize without widening any private field.

### Scope guard

- No `/members` public list restoration; `/members` stays a redirect.
- No `/organizations` redirect; its affiliation refocus is a follow-up.
- No enum/schema migration — document only.
- No people-search convergence onto `searchDirectoryProfiles` this session (follow-up).
- `FacetResultCard` stays inside `/directory`; do not refactor `/schools` or `/lineage` cards.
- No heavy client-side search app — server-rendered grouped results behind the segmented control.

### Dirstarter implementation template

- **Docs read first:** Dirstarter Project Structure + Prisma Setup + UI primitives (2026-06-06, building on
  SESSION_0349 alignment).
- **Baseline pattern to extend:** feature-foldered public reads under `server/web/*` with Prisma `select`
  allowlists; the shared `nuqs` `FiltersProvider`/`Filters` primitive; common `Card`/`Avatar`/`Badge`/`Link`
  primitives; the `search*` paginated query family.
- **Custom delta:** a presentation-only `DirectoryFacetResult` adapter + `FacetResultCard` + a result-type
  segmented control unifying three existing read models on one canonical `/directory` URL.
- **No-bypass proof:** no new query substrate, no duplicate directory/members surface, no parallel trust/tier
  system — the slice reuses existing queries, filters, and the SESSION_0349 trust resolver.

## Cody pre-flight

### Pre-flight: SESSION_0350_TASK_01/02 — facet read model + UI

#### 1. Existing component scan

- Graphify queries: see Graphify check above.
- Found (reuse, do not rebuild):
  - `FiltersProvider` (`contexts/filter-context.tsx`) + `Filters` (`components/web/filters/filters.tsx`) — nuqs
    search/reset primitive (FS-0001 mitigation: never hand-roll filter HTML).
  - `getDirectoryProfiles` (people, trust+tier), `searchOrganizations` (schools/orgs),
    `searchPublishedLineageTrees` (trees) — the read models to dispatch to.
  - `LineageTrustBadge` / `LineageClaimBadge` + `resolveLineageTrustStatus` (SESSION_0349) — reuse for badges.
  - `Card`/`CardHeader`/`CardDescription`, `Avatar`, `Badge`, `Link`, `Grid` — primitives for the card.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: yes.
- Closest L1 pattern: public feature-folder components composing common primitives; server reads via Prisma
  `select` payloads; nuqs filter context for URL-synced facets.
- Primitive API spot-check: `Badge` variants `primary|soft|outline|...`; `Card` `hover|isRevealed|render`;
  `Avatar`/`AvatarImage`/`AvatarFallback`; `Filters` takes `placeholder` + children + uses `useFilters().q`.

#### 3. Composition decision

- New: `DirectoryFacetResult` type + `getDirectoryFacets` server adapter + `FacetResultCard` component +
  result-type segmented control.
- Composing existing: `FiltersProvider`/`Filters`, `Card`/`Avatar`/`Badge`/`Link`/`Grid`, trust badges.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes (SESSION_0349).
- ADR read: `docs/architecture/decisions/0012-tier-auto-grant.md` (tier ladder); listing strategy via runbook.
- Runbook consulted: `docs/runbooks/domain-features/lineage-listing-runbook.md`.

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo` (FS-0002).
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`.
- Brand/host for testing: `http://localhost:3000/directory` (`?type=people|organizations|lineageTree`).

#### 6. FAILED_STEPS check

- Prior failures in this area: **FS-0001** (directory-filters built from scratch instead of reusing
  `FiltersProvider`/`Filters`+nuqs), FS-0008 (skip primitive scan), FS-0002 (dev server cmd), FS-0024 (git cwd).
- Mitigation acknowledged: reuse the shared filter primitive and existing `search*` queries; primitive
  API spot-check above; known dev server command; FS-0024 git guard passed at bow-in.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0350_TASK_01 | complete | `DirectoryFacetResult` adapter + pure mappers + `getDirectoryFacets` dispatcher; extended `getDirectoryProfiles` (working `q` + discipline-by-slug) and the tree summary (`isClaimable`); 7 mapper/no-leak tests. |
| SESSION_0350_TASK_02 | complete | `type` segmented control, shared `FacetResultCard`, results grid + reused `Pagination`; rewired `/directory`; removed dead `directory-list.tsx`/`directory-filters.tsx`; desktop+mobile smoke PASS. |
| SESSION_0350_TASK_03 | complete | Deleted orphaned `components/web/members/*`; logged drift `D-020`; updated GAP_MATRIX/runbook/component-inventory; wrote `lineage-data-wiring-flow.md`; trialed `fallow` (caught + fixed real dead code). |

## What landed

- `/directory` is now a **faceted browse** across three result groups behind a result-type segmented control
  (People / Schools & Orgs / Lineage Trees), preserving `/directory` as the single public discovery URL.
- Presentation-only `DirectoryFacetResult` adapter (`lib/directory/facet-result.ts`) + shared `FacetResultCard`
  normalize people, organizations, and lineage-tree rows to one card shape — **no schema/enum added** (TS union
  discriminator).
- `getDirectoryFacets` dispatcher reuses existing privacy-aware queries: `getDirectoryProfiles` (people, trust + tier),
  `searchOrganizations` (schools/orgs), `searchPublishedLineageTrees` (trees).
- The shared directory search box now actually filters people — `getDirectoryProfiles` gained a `q` filter (was a no-op
  before) and a discipline-by-slug path.
- Card contract: slim person cards (avatar, name, location, trust + claimable, top rank, paid tier); school/org cards
  (name, type, location, disciplines) routed **by type** (DOJO/SCHOOL/CLUB → `/schools`, LEAGUE/federation →
  `/organizations`); tree cards (name, discipline, owning org, `Claimable`) → `/lineage/[treeSlug]`. Tree summary gained
  `isClaimable`.
- Cleanup: deleted the orphaned `components/web/members/*` browse UI (dead behind the `/members → /directory` redirect)
  and the dead `directory-list.tsx` + FS-0001 `directory-filters.tsx`; net **−597 / +86** lines. The paginated
  `searchDirectoryProfiles` is retained as the people-pagination convergence seed.
- Docs: drift `D-020` (enum-redundancy consolidation backlog, document-only), new
  `docs/runbooks/sops/lineage-data-wiring-flow.md` (lineage + directory flow map), GAP_MATRIX / lineage runbook /
  component-inventory updates.
- `fallow` introduced as a **read-only bow-out spike** (not a CI gate): it flagged dead code from this refactor
  (`getDirectoryFilterOptions`, `DIRECTORY_FACET_TABS`) which were removed.

## Decisions resolved

- Slice width: all three facets, thin (card-header fields, reuse queries). Presentation: result-type segmented control.
  Orchestration: inline baton. (Grill round 1.)
- People reuse `getDirectoryProfiles` now; converge onto the paginated `search*` family later. Delete dead
  `members/*` now; keep `searchDirectoryProfiles` until convergence. **Do not redirect `/organizations`** — it is for
  affiliations / governing bodies (e.g. WEKAF), distinct from `/schools`. Enum redundancy: document-only. Shared card:
  `/directory` only. (Grill round 2.)
- Card contract per facet (slim person / school-org / tree) + route-by-type links. (Grill round 3.)
- `fallow` trialed at bow-out and judged useful as an optional spike; not adopted as a CI gate this session.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/lib/directory/facet-result.ts` | New presentation-only `DirectoryFacetResult` + pure mappers (person/org/tree) + `organizationHref` route-by-type + `initialsOf`. |
| `apps/web/lib/directory/facet-result.test.ts` | New 7 mapper/no-leak/route tests (43 assertions). |
| `apps/web/server/web/directory/facets.ts` | New `getDirectoryFacets` dispatcher + `normalizeDirectoryFacetTab`. |
| `apps/web/server/web/directory/queries.ts` | `getDirectoryProfiles` gained `q` + `disciplineSlug`; removed dead `getDirectoryFilterOptions` + orphaned `cacheLife/cacheTag` + filter-payload imports. |
| `apps/web/server/web/directory/payloads.ts` | Removed dead filter-options payloads. |
| `apps/web/server/web/directory/schema.ts` | Added `type` (segmented-control) param. |
| `apps/web/server/web/lineage/queries.ts` | Tree summary + `LineageTreeCardRow` now include `isClaimable`. |
| `apps/web/components/web/directory/directory-query.tsx` | Rewired to compose segmented control + facet results. |
| `apps/web/components/web/directory/directory-facet-tabs.tsx` | New client segmented control via shared filter context. |
| `apps/web/components/web/directory/directory-facet-results.tsx` | New count + grid + reused `Pagination`. |
| `apps/web/components/web/directory/facet-result-card.tsx` | New shared `FacetResultCard`. |
| `apps/web/components/web/directory/directory-list.tsx` | Deleted (replaced by `FacetResultCard`). |
| `apps/web/components/web/directory/directory-filters.tsx` | Deleted (dead FS-0001 raw-HTML artifact). |
| `apps/web/components/web/members/*` (6 files) | Deleted (orphaned behind `/members → /directory` redirect). |
| `docs/runbooks/sops/lineage-data-wiring-flow.md` | New lineage + directory data/wiring flow SOP (peer to `sop-data-and-wiring-flows.md`). |
| `docs/knowledge/wiki/drift-register.md` | Added `D-020` (enum-redundancy consolidation backlog, document-only). |
| `docs/product/black-belt-legacy/GAP_MATRIX.md` | Updated BBL-DISCOVER-001/002 + BBL-PROFILE-001 + next-task recommendation. |
| `docs/runbooks/domain-features/lineage-listing-runbook.md` | Added SESSION_0350 faceted `/directory` section. |
| `docs/knowledge/wiki/custom-component-inventory.md` | Faceted directory entry; members entry marked removed; avatar note updated. |
| `docs/knowledge/wiki/index.md` | Added SESSION_0350 + new component/doc discoverability. |
| `docs/sprints/SESSION_0350.md` | This session file. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `graphify stats` at bow-in | Passed — 9395 nodes, 14688 edges, 1376 communities, 1595 files tracked. |
| `cd apps/web && bun test lib/directory/facet-result.test.ts` | Passed — 7 tests, 43 assertions (mapping + no-leak + route-by-type). |
| `cd apps/web && bun test server/web/directory/profile-tier-policy.integration.test.ts lib/lineage/trust-status.test.ts lib/entitlements/lineage-tier-policy.test.ts` | Passed — 20 tests, 67 assertions (tier gating + trust priority unaffected). |
| `cd apps/web && bun run typecheck` | Passed — 0 errors. |
| `cd apps/web && bun run lint` | Passed — Biome checked 1196 files. |
| `bun run wiki:lint` | Passed — 605 markdown files, 0 violations. |
| Local Playwright smoke (fresh Chromium) — `/directory` people/organizations/trees + `?q=a`, desktop 1280 + mobile 390 | PASS — all 200, segmented control active per tab, no horizontal overflow, 0 console/page errors; `q=a` narrows people 4→3 (search now works). |
| `npx fallow audit` (trial) | Useful — flagged dead `getDirectoryFilterOptions` + `DIRECTORY_FACET_TABS` (removed); remaining flags are pre-existing exported-payload conventions + out-of-scope deps. |

## Open decisions / blockers

- No blockers.
- People facet is unpaginated (`getDirectoryProfiles`); converge onto the paginated `search*` family next.
- Cross-facet discipline/rank/school/location filter dropdowns deferred (standardize `discipline` on slug; reuse the
  `FiltersProvider` Select; a slug-aware filter-options query replaces the deleted `getDirectoryFilterOptions`).
- Org-logo avatars on org/tree cards deferred.
- A true Verified/Disputed *tree* badge needs aggregated member verification (deferred; trees expose only `Claimable`).
- Enum consolidation (`D-020`) deferred; `RankAward` dispute status remains `BBL-RANK-004`.
- `/organizations` refocus to affiliations / governing bodies is a follow-up (no redirect).

## Next session

### Goal

Add the cross-facet filter set to `/directory` (discipline + rank + school/org + location dropdowns) and converge the
People facet onto the paginated `search*` family, without regressing tier gating or trust badges.

### First task

Standardize the directory `discipline` param on slug, add a slug-aware filter-options query (replacing the removed
`getDirectoryFilterOptions`), and render a shared discipline `Select` in the faceted shell via the existing
`FiltersProvider`. Then move People onto `searchDirectoryProfiles` (lift the trust/tier projection from
`getDirectoryProfiles`) so all three facets paginate consistently, and retire `getDirectoryProfiles`.

## Review log

### SESSION_0350_REVIEW_01 — Faceted /directory browse slice

- **Reviewed tasks:** SESSION_0350_TASK_01, SESSION_0350_TASK_02, SESSION_0350_TASK_03
- **Dirstarter docs check:** cached docs sufficient (Project Structure / Prisma / UI primitives re-confirmed from
  SESSION_0349; this slice is assembly over existing patterns).
- **Verdict:** Pass. The slice reuses the existing `search*` query family + shared `FiltersProvider`/`Pagination`
  primitives behind one presentation adapter; adds no schema/enum; preserves people tier gating + trust badges (proven by
  the real-DB integration test); deletes more code than it adds; and was proven on the live DOM (3 facets, desktop +
  mobile, no overflow, no console errors). The previously-dead people search box now works.
- **Score:** 9.5/10
- **Follow-up:** people pagination convergence + cross-facet filter dropdowns; enum consolidation (`D-020`).

## Hostile close review

| Check | Verdict |
| --- | --- |
| Giddy / architecture | Pass. Reuses feature-folder reads, Prisma select payloads, the shared nuqs filter primitive, and the `search*` family. `DirectoryFacetResult` is presentation-only (no parallel substrate, no schema/enum). |
| Doug / QA | Pass. Pure mapper tests prove shape + no-leak + route-by-type; real-DB integration test proves tier gating intact; typecheck/lint/wiki-lint green; Playwright desktop+mobile smoke proves all 3 facets render with working search, no overflow, 0 console errors. |
| Desi / UX | Pass. One shared card across facets, consistent trust/rank/discipline badges, segmented control, per-facet empty states. Slim person cards keep the mixed grid readable. |
| Security/privacy | Pass. Mappers read only already-public/already-projected fields; no claim evidence / reviewer notes / hidden fields reachable (asserted by the no-leak test). Tree summary excludes member names. |
| Data integrity | Pass. No new schema invariant; `isClaimable` is an additive read field; trust badges present existing state. |
| Dead-code hygiene | Pass. Deleted orphaned `members/*` + dead directory components with grep + fallow proof; retained `searchDirectoryProfiles` deliberately as the convergence seed. |
| Verification honesty | Pass. Smoke ran against the live dev server with a fresh Chromium (MCP profile locked); results reported verbatim. |
| Workflow honesty | Pass. Bow-in, Graphify-first discovery, 3 grill rounds, Cody pre-flight, task IDs, fallow trial, and close evidence recorded. |
| Score cap | No cap. |

### Findings (severity ≥ medium)

None.

### Kaizen triage

- **Safe/security proof:** the no-leak test asserts `DirectoryFacetResult` exposes exactly its allowed keys, so a private
  field on any source row cannot reach a card. The real-DB integration test proves people tier gating is unchanged.
- **Failed-step prevention:** FS-0001 (hand-rolled filter HTML) was avoided by reusing `FiltersProvider`/`Filters`; the
  dead FS-0001 artifact (`directory-filters.tsx`) was itself deleted. `fallow` proved a useful second pair of eyes on
  dead code introduced by the refactor.
- **Scale confidence:** people 1k: 8.8 (unpaginated until convergence); orgs/trees: 9.5 (already paginated). Aggregate
  9.3 for this read-only slice; pagination convergence is the next lever.

## ADR / ubiquitous-language check

- ADR update not required. The slice is presentation over existing read models; `DirectoryFacetResult` adds no schema and
  no new domain term (it composes existing `DirectoryProfile` / `Organization` / `LineageTree` reads).
- Ubiquitous language update not required. No new domain noun introduced; "facet" is a UI/presentation term, documented in
  the component inventory + the new wiring-flow SOP.
- Enum consolidation recorded as drift `D-020` rather than an ADR (no decision forced this session).

## Reflections

- The biggest win was discovering that `/schools` is already the faceted `Organization` browse (`searchOrganizations`)
  and `/lineage` already has `searchPublishedLineageTrees` — so the slice was assembly + a thin adapter, not new search
  infra. Graphify pointed straight at the `search*` family and the shared filter context.
- The operator's correction that `/organizations` is for affiliations / governing bodies (not a `/schools` twin) changed
  the dedupe decision from "redirect" to "route-by-type + keep both" — a reminder to grill domain intent before deduping.
- `fallow` earned its bow-out trial: it flagged `getDirectoryFilterOptions` as dead the moment its only consumer
  (`directory-filters.tsx`) was deleted — exactly the residue a manual sweep can miss. Recommend keeping it as an optional
  bow-out spike, not yet a CI gate.
- The previously-dead directory search box (bound to `q` but ignored by `getDirectoryProfiles`) is the kind of latent gap
  that a faceted rebuild surfaces; wiring `q` was a small, high-value fix.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Updated `updated`/`last_agent` on touched docs (drift register, GAP_MATRIX, lineage runbook, component inventory, wiki index) + this SESSION; new `lineage-data-wiring-flow.md` carries full frontmatter. |
| Backlinks/index sweep | Added SESSION_0350 + faceted-directory components + the new SOP to `docs/knowledge/wiki/index.md`; `lineage-data-wiring-flow.md` pairs with `sop-data-and-wiring-flows.md` + the lineage runbook. |
| Wiki lint | `bun run wiki:lint` passed — 605 markdown files, 0 violations. |
| Kaizen reflection | Present in `## Reflections` + `### Kaizen triage`. |
| Hostile close review | Present in `## Hostile close review`; no medium+ findings. |
| Review & Recommend | Next-session goal + first task written (cross-facet filters + people pagination convergence). |
| Memory sweep | No durable operator-memory update needed; facts live in the SOP / runbook / drift register / component inventory. |
| Next session unblock check | Unblocked; first task is slug-standardized discipline filter + people-search convergence. |
| fallow trial | `npx fallow audit` run; caught + fixed real dead code; recorded as optional bow-out spike (not a CI gate). |
| Git hygiene | Branch `main`; single push at close — hash reported in chat after push. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` run before commit; final stats reported in chat. |
