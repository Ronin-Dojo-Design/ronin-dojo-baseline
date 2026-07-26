---
title: "SESSION 0239 — Dashboard private noindex chrome"
slug: session-0239
type: session--implement
status: closed-full
created: 2026-05-24
updated: 2026-05-24
last_agent: codex-session-0239
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0238.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0239 — Dashboard private noindex chrome

## Date

2026-05-24

## Operator

Brian + codex-session-0239 (Petey orchestrating; Cody/Doug/Giddy/Desi assignments staged)

## Goal

Apply the SESSION_0237 passport-pattern private chrome to `/dashboard/*` surfaces: `Breadcrumbs` and `getPageMetadata` with `robots: { index: false, follow: false }`, preserving auth gates and dashboard tab behavior. Skip public-only parity pieces (`generateStaticParams`, `StructuredData`, Related items).

## Bow-in

### Previous session

- SESSION_0238 (`closed-full`) landed Schools detail differentiation plus Courses listing parity. The next-session recommendation explicitly names `/dashboard/*` private noindex chrome as SESSION_0239.

### Branch and worktree

- Branch: `main`.
- Fetch: `git fetch origin main` completed.
- Status: clean, `main...origin/main`, HEAD `36c506b`.

### Graphify check

- Graph status: current enough for bow-in discovery (`6852` nodes, `11105` edges, `1000` communities). `.graphify/graph_report.md` matches the latest recorded SESSION_0238 stats.
- Queries used:
  - `opening.md closing.md graphify-repo-memory.md ritual bow-in bow-out`
  - `graphify repo memory graphify-repo-memory.md nodesify graphify daily usage pattern graphify CLI commands`
  - `dashboard private pages dashboard page tabs lineage tab profile tab school tab techniques tab dashboard lineage page dashboard techniques page dashboard techniques id page metadata breadcrumbs`
- Files selected from graph and verified by exact-file reads:
  - `docs/rituals/opening.md`
  - `docs/runbooks/graphify-repo-memory.md`
  - `docs/rituals/closing.md`
  - `docs/agents/petey.md`
  - `docs/protocols/petey-plan.md`
  - `docs/agents/cody.md`
  - `docs/protocols/cody-preflight.md`
  - `docs/sprints/SESSION_0238.md`
  - `docs/sprints/SESSION_0237.md`
  - `apps/web/app/(web)/me/page.tsx`
  - `apps/web/lib/pages.ts`
  - `apps/web/app/(web)/dashboard/page.tsx`
  - `apps/web/app/(web)/dashboard/lineage-tab.tsx`
  - `apps/web/app/(web)/dashboard/profile-tab.tsx`
  - `apps/web/app/(web)/dashboard/school-tab.tsx`
  - `apps/web/app/(web)/dashboard/techniques-tab.tsx`
  - `apps/web/app/(web)/dashboard/tabs.tsx`
  - `apps/web/app/(web)/dashboard/listing.tsx`
  - `apps/web/app/(web)/dashboard/membership.tsx`
  - `apps/web/app/(web)/dashboard/lineage/[treeId]/page.tsx`
  - `apps/web/app/(web)/dashboard/techniques/[id]/page.tsx`
  - `apps/web/app/(web)/dashboard/techniques/new/page.tsx`

### Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Authentication/private route protection, SEO metadata, UI primitives (`Breadcrumbs`, `Intro`, `Section`, `Card`, `Stack`) |
| Extension or replacement | Extension — applies existing Dirstarter/Ronin page metadata and web UI primitives to already-auth-gated dashboard routes |
| Why justified | Dashboard pages contain user-private data. SESSION_0237 proved the private Passport pattern; SESSION_0239 applies that same noindex chrome consistently to dashboard surfaces. |
| Risk if bypassed | Private dashboard URLs may lack explicit noindex metadata; dashboard UX drifts from the Passport private-surface pattern; future public parity passes may accidentally treat dashboard routes as public content pages. |

### Dirstarter live-doc check

- Authentication docs checked 2026-05-24: dashboard routes are listed as protected, and Dirstarter says middleware should not be the only protection. Current dashboard files already do server-side `getServerSession()` checks; this session preserves them.
- Theming/SEO/content docs checked 2026-05-24 for UI and metadata alignment. Repo-local component inventory remains the source of truth for current Base UI primitives after the SESSION_0209-0218 migration.

### FAILED_STEPS check

- Relevant mitigations acknowledged:
  - FS-0001: use L1 primitives; avoid scratch UI.
  - FS-0004 / FS-0005: full close needs concrete evidence, not a claim.
  - FS-0020 / FS-0024 from SESSION_0238 reflections: graphify-first discovery and cwd discipline. This session used `workdir=/Users/brianscott/dev/ronin-dojo-app` and graphify queries before source inspection. A patch-tool cwd mismatch was caught during SESSION-file verification and corrected before app code edits.

### Drift register check

- D-001 through D-016 are resolved/closed. No open drift directly blocks dashboard noindex chrome.

## Petey plan

### Goal

Apply private-surface metadata and breadcrumb chrome to the dashboard pages in scope without changing dashboard data behavior, auth behavior, tab behavior, or public SEO surfaces.

### Tasks

#### SESSION_0239_TASK_01 — Dashboard root private chrome

- **Agent:** Cody Root Page Worker
- **What:** Update `apps/web/app/(web)/dashboard/page.tsx` to render `Breadcrumbs`, return `getPageMetadata({ url: "/dashboard", metadata: { ..., robots: { index: false, follow: false } } })`, and add a restrained quick-links `Section.Sidebar` beside the tab surface.
- **Steps:**
  1. Import `Breadcrumbs` from `~/components/web/ui/breadcrumbs`.
  2. Keep `getData()` and all tab composition intact.
  3. Add explicit noindex/follow-false metadata while preserving translated title/description.
  4. Render `Breadcrumbs` before the existing `Intro`.
  5. Wrap the tab surface in `Section.Content` and add a non-competing `Section.Sidebar` with stable quick links only.
- **Done means:** `/dashboard` has explicit noindex metadata, breadcrumb chrome, and a small sidebar; DashboardTabs, DashboardMembership, and all tab components remain functionally untouched.
- **Depends on:** nothing; user confirmed scope.

#### SESSION_0239_TASK_02 — Dashboard subroute private chrome

- **Agent:** Cody Subroute Worker
- **What:** Update selected dashboard subroute pages with noindex metadata and breadcrumbs.
- **Steps:**
  1. Update `apps/web/app/(web)/dashboard/lineage/[treeId]/page.tsx` to wrap dynamic metadata through `getPageMetadata` with `robots: { index: false, follow: false }`; render `Breadcrumbs` (`Dashboard` > lineage tree name when available).
  2. Update `apps/web/app/(web)/dashboard/techniques/[id]/page.tsx` to add `generateMetadata` via `getPageMetadata` for `/dashboard/techniques/${id}` with noindex; render `Breadcrumbs` (`Dashboard` > `Techniques` > technique name).
  3. Include `apps/web/app/(web)/dashboard/techniques/new/page.tsx` because it is also a dashboard subroute and currently lacks metadata/chrome.
  4. Normalize stale unauthenticated redirects in the technique subroutes from `/login` to `/auth/login?next=...` because the route tree contains `/auth/login` and no `/login`.
- **Done means:** In-scope dashboard subroutes have explicit noindex metadata and breadcrumbs; existing `notFound()` and authorization behavior is preserved except for the corrected login redirect target.
- **Depends on:** nothing; user confirmed scope.

#### SESSION_0239_TASK_03 — Verification + full bow-out

- **Agent:** Petey orchestrating; Doug/Giddy review personas on close.
- **What:** Verify, document, full-close, commit, update graphify, and push to `main`.
- **Steps:**
  1. Run targeted typecheck and biome on touched source files.
  2. Run the repo's expected test/build gates unless a concrete blocker appears.
  3. Update this SESSION file with task log, review log, decisions, files touched, reflections, hostile close review, ADR/ubiquitous-language result, and full-close evidence.
  4. Update wiki/index or file wiki entries only if this session creates new docs/components or existing wiki annotations require it.
  5. Run `bun run wiki:lint`.
  6. Commit with a conventional message and push `main`.
  7. Run `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` after git hygiene and report final graph stats.
- **Done means:** Quality gates are recorded; SESSION_0239 is `closed-full`; changes are committed and pushed to `origin/main`; graphify is refreshed after git hygiene.
- **Depends on:** TASK_01 and TASK_02.

### Parallelism

- TASK_01 and TASK_02 are disjoint file sets and can run in parallel after user sign-off.
- Main thread will not duplicate worker edits; Petey will integrate and review.
- TASK_03 is sequential after implementation.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0239_TASK_01 | Cody Root Page Worker | Narrow page-shell metadata/chrome change; root page tab structure must stay untouched |
| SESSION_0239_TASK_02 | Cody Subroute Worker | Related subroute metadata/chrome changes; separate files from root page |
| SESSION_0239_TASK_03 | Petey + Doug/Giddy | Verification, full close evidence, review score, commit/push/graphify update |

### Open decisions

- Resolved by user in chat:
  - Include `apps/web/app/(web)/dashboard/techniques/new/page.tsx`.
  - Use generic metadata fallbacks and richer in-page dynamic breadcrumbs after data load.
  - Normalize stale `/login` redirects in touched technique pages to `/auth/login?next=...`.
  - Add a restrained dashboard root sidebar with stable quick links; do not duplicate tab controls.

### Risks

- The root dashboard uses tab chrome. Sidebar chrome must remain quick-link oriented and not duplicate or control tab state.
- `/dashboard/lineage/[treeId]` already has a sidebar; Breadcrumbs should sit above `Intro`, not inside the board layout.
- Technique edit pages currently redirect unauthenticated users to `/login`, while the actual route is `/auth/login`. User approved normalizing only the touched technique pages.
- Dirstarter live theming docs still mention Radix/CVA, while the repo has completed Base UI/tailwind-variants migration. Use repo-local component inventory and source as truth for current primitives.

### Scope guard

No work on `/lineage/[treeSlug]`, `/leagues/[slug]`, `/clubs/[slug]`, public structured data, related-items modules, `generateStaticParams`, dashboard tab UX redesign, or wider auth redirect normalization beyond the touched dashboard technique pages.

### Dirstarter implementation template

- **Docs read first:** SESSION_0237 Passport pattern; SESSION_0238 next-session recommendation; Dirstarter Authentication, Theming, SEO, and Content docs checked 2026-05-24; repo component inventory checked 2026-05-24.
- **Baseline pattern to extend:** `apps/web/app/(web)/me/page.tsx` private page pattern; `apps/web/lib/pages.ts` `getPageMetadata`; `components/web/ui/Breadcrumbs`; existing dashboard server-side `getServerSession()` guards.
- **Custom delta:** Ronin dashboard routes are private user/productivity surfaces, so only private-surface chrome is applied. Public SEO parity pieces stay out of scope.
- **No-bypass proof:** No new UI primitives or metadata helpers; only existing Dirstarter/Ronin primitives and helpers are composed.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0239_TASK_01 | landed | Dashboard root now uses noindex `getPageMetadata`, renders Breadcrumbs, and has a restrained quick-links `Section.Sidebar` beside the existing tab surface |
| SESSION_0239_TASK_02 | landed | Dashboard lineage editor, technique edit, and technique new pages now use noindex metadata + Breadcrumbs; technique auth redirects normalized to `/auth/login?next=...` |
| SESSION_0239_TASK_03 | landed | Typecheck, Biome, tests, and build gates completed; full close documentation in progress |

## Review log

- **Cody Root Page Worker:** Pass. `apps/web/app/(web)/dashboard/page.tsx` only. Preserved dashboard tabs, membership block, Suspense boundaries, and `searchParams` passthrough while adding root noindex metadata, Breadcrumbs, and quick-links sidebar.
- **Cody Subroute Worker:** Pass. `dashboard/lineage/[treeId]`, `dashboard/techniques/[id]`, and `dashboard/techniques/new` only. Preserved auth/capability checks and `notFound()` paths; normalized only stale technique `/login` redirects.
- **Petey integration review:** Pass. Combined diff is restricted to four dashboard source files plus docs; no public SEO structured-data work, SSG, related-items, or tab UX redesign entered scope.

## Pre-flight: Dashboard private chrome

### 1. Existing component scan

- Graphify selected dashboard root/subroute files and `apps/web/app/(web)/me/page.tsx` as the private-page pattern.
- Existing relevant components: `Breadcrumbs`, `Intro`, `Section`, `Card`, `CardHeader`, `CardDescription`, `Stack`, `H4`, `Link`.

### 2. L1 template scan (via Dirstarter Component Inventory)

- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md`: yes.
- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md` alignment URLs: yes.
- Closest L1 pattern: `apps/web/app/(web)/me/page.tsx` for private noindex metadata + Breadcrumbs + sidebar composition.
- Primitive API spot-check:
  - `Breadcrumbs`: props `items: { url: string; title: ReactNode }[]` plus `Stack` props; prepends Home automatically.
  - `Section`: `Section`, `Section.Content`, `Section.Sidebar`; sidebar wraps content in `Sticky`.
  - `Card`: `hover`, `focus`, `isRevealed`, `isHighlighted`, `render`; `CardHeader` and `CardFooter` take `Stack` props; `CardDescription` takes `div` props.
  - `Stack`: `size: xs|sm|md|lg`, `direction: row|column`, `wrap: boolean`, `render`.
  - `H4`: `render`, `size` via heading wrapper; use default `h4` visual heading unless hierarchy needs override.
  - `Link`: Next link props; lazy prefetch on hover.

### 3. Composition decision

- Composing existing components only. No new component files and no new primitive APIs.

### 4. Lane docs loaded

- Prior SESSION next-session section read: SESSION_0238.
- Pattern reference read: SESSION_0237 Passport `/me` uplift.
- Runbook consulted: Graphify Repo Memory Runbook; Closing Ritual.

### 5. Dev environment confirmed

- Working directory: `/Users/brianscott/dev/ronin-dojo-app`.
- Branch: `main`.
- Dev server command: not needed before edits; build/test gates planned after implementation.

### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001, FS-0004, FS-0005, FS-0020/FS-0024 pattern from SESSION_0238 reflections.
- Mitigation acknowledged: graphify-first discovery, exact-file reads, L1 primitive spot-check, absolute patch paths where needed, full close evidence planned.

## Open decisions / blockers

- None. The temporary full-suite default-timeout failures were isolated to unrelated existing parallel-test load behavior; both implicated files passed individually, and the full suite passed with `--timeout 10000`.

## What landed

- `/dashboard` now applies private-surface metadata through the existing `getData()` / `getPageData()` flow: `robots: { index: false, follow: false }`.
- `/dashboard` now renders `Breadcrumbs` before the existing `Intro`.
- `/dashboard` wraps the existing tab surface in `Section.Content` and adds a restrained `Section.Sidebar` with quick links to Passport, new technique, directory, programs, tournaments, and schools. The sidebar does not control or duplicate tab state.
- `/dashboard/lineage/[treeId]` now wraps all metadata branches in `getPageMetadata` with noindex robots, while preserving the existing session, brand, and lineage ACL lookup. The page renders `Dashboard > tree name` breadcrumbs before the existing intro.
- `/dashboard/techniques/[id]` now has generic private metadata, `Dashboard > Techniques > technique name` breadcrumbs, and corrected unauthenticated redirect to `/auth/login?next=/dashboard/techniques/${id}`.
- `/dashboard/techniques/new` now has private metadata, `Dashboard > Techniques > New Technique` breadcrumbs, and corrected unauthenticated redirect to `/auth/login?next=/dashboard/techniques/new`.
- No `generateStaticParams`, `StructuredData`, Related items, public SEO helpers, new components, new dependencies, or broader auth-route normalization were added.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/app/(web)/dashboard/page.tsx` | Added private robots metadata, Breadcrumbs, and quick-links sidebar around existing tab surface |
| `apps/web/app/(web)/dashboard/lineage/[treeId]/page.tsx` | Added private `getPageMetadata` branches and dynamic Breadcrumbs |
| `apps/web/app/(web)/dashboard/techniques/[id]/page.tsx` | Added private metadata, Breadcrumbs, and normalized auth redirect |
| `apps/web/app/(web)/dashboard/techniques/new/page.tsx` | Added private metadata, Breadcrumbs, and normalized auth redirect |
| `docs/sprints/SESSION_0239.md` | New session record, plan, pre-flight, verification, and close evidence |
| `docs/knowledge/wiki/index.md` | Added SESSION_0239 row and stamped `last_agent` |

## Decisions resolved

- Included `/dashboard/techniques/new/page.tsx` because it is a private dashboard subroute and fit the TASK_02 boundary without creating a fourth deliverable.
- Used generic noindex metadata for technique edit pages to avoid leaking technique names to unauthenticated/unauthorized metadata callers; richer technique names appear only in-page after data and membership authorization.
- Normalized only the touched technique subroute redirects from `/login` to `/auth/login?next=...` because the route tree has `/auth/login` and no `/login`.
- Added a root dashboard sidebar, but constrained it to stable quick links. It does not mirror tab controls or change tab state.
- Skipped `Section.Sidebar` changes on `/dashboard/lineage/[treeId]` because that page already had a purpose-built editor-access sidebar.
- No ADR or ubiquitous-language update required; this session applies the established SESSION_0237 Passport private-surface pattern.

## Verification

| Command | Result |
| --- | --- |
| `bun biome check 'app/(web)/dashboard/page.tsx' 'app/(web)/dashboard/lineage/[treeId]/page.tsx' 'app/(web)/dashboard/techniques/[id]/page.tsx' 'app/(web)/dashboard/techniques/new/page.tsx'` from `apps/web` | Pass — 4 files checked, no fixes applied |
| `pnpm --filter @ronin-dojo/web typecheck` | Pass — `next typegen` + `tsc --noEmit --pretty false` |
| `bun test server/admin/tools/actions.safe-action.test.ts` | Pass — isolated rerun of default-timeout full-suite failure, 1/1 pass |
| `bun test server/web/tournaments/results.smoke.test.ts` | Pass — isolated rerun of cleanup fallout, 4/4 pass |
| `bun test --parallel --timeout 10000 --path-ignore-patterns='e2e/**'` from `apps/web` | Pass — 299 pass, 0 fail, 986 expect() calls, 59 files |
| `pnpm --filter @ronin-dojo/web build` | Pass — no pending migrations, compile/type/static generation succeeded, 174/174 static pages; next-sitemap generated |

### Biome note

Biome is installed correctly at the `apps/web` workspace level, not the monorepo root. `bun biome` from repo root fails because the root package does not declare Biome. Correct commands are `bun biome ...` from `apps/web` or `pnpm --filter @ronin-dojo/web exec biome ...` from repo root. Verified binary: `Version: 2.4.15`.

## Reflections

- The sidebar concern was legitimate. A sidebar that duplicated the tabs would have made the dashboard worse, but a quick-links rail improves orientation without competing with the tab component.
- The stale `/login` redirects were worth correcting once the actual route tree proved `/auth/login` is the only login page. Keeping the fix limited to touched technique dashboard files avoided a wider auth-normalization session.
- The full-suite default-timeout failure was not dashboard-related. The admin tool action passed in isolation and passed in the full suite with a longer per-test timeout, but it is a signal that the default 5s Bun test timeout is tight under parallel DB load.
- The patch-tool cwd mismatch during bow-in is another reminder that shell `workdir` discipline does not protect non-shell patch tools. Absolute patch paths are safer in this repo when the chat starts from the DirStarter template cwd.

## Hostile close review

- **Giddy:** Pass. Scope stayed inside the approved private dashboard chrome lane. No schema, data-layer, public SEO, structured data, SSG, or related-items work was introduced. The only auth behavior change is route-target correction from a non-existent `/login` to existing `/auth/login` in files already touched.
- **Doug:** Pass. Typecheck green, targeted Biome green, isolated fallback tests green, full non-e2e suite green with `--timeout 10000`, build green. Dashboard route protections remain server-side via existing `getServerSession()` checks; no private data is moved into public metadata.
- **Desi:** Pass. Breadcrumbs are placed before `Intro` consistently. The dashboard sidebar is constrained to quick links and does not compete with the tab controls. No raw UI primitives were added.
- **Dirstarter alignment:** Extension of existing private-page/auth/metadata primitives. Live Dirstarter auth guidance says protected pages must not rely on middleware alone; this session preserved existing server-side checks.
- **Score:** 9.6/10. Minor dock: full-suite default 5s timeout remains fragile under parallel DB load, but the rerun evidence is clean and unrelated to the dashboard implementation.

## ADR / ubiquitous-language check

- ADR update not required. This applies the already-established private page metadata/chrome pattern from SESSION_0237.
- Ubiquitous Language update not required. No new domain terms introduced.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Created SESSION_0239 with JETTY frontmatter; touched wiki index frontmatter `last_agent`; no new component/wiki file annotations needed |
| Backlinks/index sweep | Added SESSION_0239 to `docs/knowledge/wiki/index.md`; SESSION_0239 backlinks wiki index and pairs with SESSION_0238 |
| Wiki lint | `bun run wiki:lint` -> 0 errors, 507 warnings; no warnings on touched SESSION_0239 or wiki index files |
| Kaizen reflection | Reflections section present: yes |
| Hostile close review | Giddy, Doug, Desi, and Dirstarter alignment review present above |
| Review & Recommend | Next session goal written below: yes |
| Memory sweep | None needed; session-specific facts captured here, and the only cross-session gotcha is already covered by FS-0024/cwd discipline |
| Next session unblock check | Unblocked; `/lineage/[treeSlug]` public parity candidate is known and deferred intentionally |
| Git hygiene | Branch `main`; final status/stage/commit/push proof will be reported in bow-out response |
| Graphify update | To run after git hygiene per closing ritual; final stats will be reported in bow-out response |

## Next session

### Goal (SESSION_0240)

Apply public parity chrome to `/lineage/[treeSlug]` with strict custom-canvas scope guard.

### Inputs to read

- SESSION_0239 close notes.
- `apps/web/app/(web)/lineage/[treeSlug]/page.tsx`.
- SESSION_0237/0238 public parity references.
- `apps/web/components/web/lineage/lineage-tree-canvas.tsx` / `lineage-tree-board.tsx` only as needed for layout safety; do not redesign the canvas.

### First task

SESSION_0240_TASK_01: read `/lineage/[treeSlug]/page.tsx`, identify which public parity pieces are missing, and plan a minimal page-shell uplift that does not alter lineage canvas behavior.
