---
title: "SESSION 0237 — Discipline + Passport detail pages deep uplift to tool-listing parity"
slug: session-0237
type: session--implement
status: closed-full
created: 2026-05-24
updated: 2026-05-24
last_agent: claude-session-0237
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0236.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0237 — Discipline + Passport detail pages deep uplift to tool-listing parity

## Date

2026-05-24

## Operator

Brian + claude-session-0237 (Petey orchestrating, Cody executing via subagents)

## Goal

Deep uplift two more detail pages to the Dirstarter tool-listing gold standard set in SESSION_0235/0236:

- **Discipline** (`/disciplines/[slug]`) — Breadcrumbs already present; add `getRequestBrand` (drop raw `headers()`), `getPageMetadata`, `generateStaticParams`, `Section.Sidebar`, Related Disciplines.
- **Passport** (`/me`) — auth-gated private page; apply the *applicable* parity bits only: Breadcrumbs, `getPageMetadata` with `noindex`, `Section.Sidebar` (profile completeness + quick links). Skip SSG / public structured data / related-items (private page).

## Bow-in

### Previous session

- SESSION_0236 (`closed-full`) — Organization detail page uplifted to parity. 299/299 tests, 158/158 build, score 9.5/10.

### Branch and worktree

- Branch: `main`, clean tree

### Graphify check

- Graph status: current (6839 nodes, 11051 edges, 973 communities)
- Query used: `discipline detail page slug passport page breadcrumbs structured data section sidebar related`
- Files selected from graph:
  - `apps/web/app/(web)/disciplines/[slug]/page.tsx`
  - `apps/web/app/(web)/me/page.tsx`
  - `apps/web/server/web/disciplines/queries.ts`
  - `apps/web/server/web/passport/queries.ts`
  - `apps/web/app/(web)/organizations/[slug]/page.tsx` (reference / gold standard from SESSION_0236)

### Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Content (detail page pattern), structured data, page metadata helper |
| Extension or replacement | Extension — applying existing L1 patterns to Discipline + Passport entities |
| Why justified | Public discipline page needs SEO + SSG parity; passport page needs consistent chrome (breadcrumbs, sidebar) so the auth-gated UX matches public-page polish |
| Risk if bypassed | Inconsistent page structure, missing SSG for disciplines, missing noindex on private passport, drift from SESSION_0235/0236 pattern |

## Petey plan

### Goal

Uplift Discipline and Passport detail pages to tool-listing parity (adapted for private page in Passport's case), preserving all existing functionality.

### Tasks

#### SESSION_0237_TASK_01 — Discipline queries: `findRelatedDisciplines` + reshape `findDisciplineSlugs` for SSG

- **Agent:** Cody (subagent)
- **What:** Reshape `findDisciplineSlugs(brand)` → no-arg returning `{ slug, brand }[]` for cross-brand `generateStaticParams`; add `findRelatedDisciplines({ disciplineId, brand })` — same brand or system, exclude current, take 6, alphabetical.
- **Done means:** Both queries export; typecheck passes; no callers broken.
- **Depends on:** nothing

#### SESSION_0237_TASK_02 — Discipline detail page uplift

- **Agent:** Cody (subagent)
- **What:** Replace `headers()` with `getRequestBrand()`. Upgrade `generateMetadata` via `getPageMetadata`. Add `generateStaticParams`. Restructure top section into `Section.Content` (Rank Systems) + `Section.Sidebar` (Overview stats card + History card). Add Related Disciplines. Preserve all existing rich sections.
- **Done means:** Breadcrumbs preserved, JSON-LD preserved, OG metadata via `getPageMetadata`, no raw `headers()`, Related Disciplines renders, SSG wired.
- **Depends on:** TASK_01

#### SESSION_0237_TASK_03 — Passport (`/me`) page uplift

- **Agent:** Cody (subagent)
- **What:** Add `Breadcrumbs`. Replace inline `metadata` const with `generateMetadata` using `getPageMetadata` with `robots: { index: false, follow: false }`. Restructure into `Section.Content` + `Section.Sidebar` (Profile Completeness + Quick Links). Keep `PassportEditor` untouched.
- **Done means:** Breadcrumbs render, noindex in head, sidebar renders without breaking auth redirect, PassportEditor functionality preserved.
- **Depends on:** nothing (parallel with TASK_01/02)

#### SESSION_0237_TASK_04 — Verification + bow-out

- **Agent:** Petey (me)
- **What:** typecheck + biome + full test suite + build gate; closing ritual; commit + push to main.
- **Done means:** All gates green; SESSION_0237 `closed-full`; pushed to `origin/main`.
- **Depends on:** TASK_01, TASK_02, TASK_03

### Parallelism

- TASK_01 + TASK_03 in parallel (disjoint file sets).
- TASK_02 sequential after TASK_01 (depends on new queries).
- TASK_04 sequential after all three.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Cody (subagent A) | Clear server-layer execution, SESSION_0236 template |
| TASK_02 | Cody (sequential after A) | Page uplift, depends on TASK_01 queries |
| TASK_03 | Cody (subagent B, parallel) | Private page, disjoint file set |
| TASK_04 | Petey (main thread) | Verification + closing ritual |

### Open decisions

- None. Passport-page adaptation noted explicitly above.

### Risks

- Discipline page has many composed sections (rank systems, lineage tree, member carousel, content atoms). Sidebar must be scoped to top section only — every other section stays full-width to avoid regression.
- Passport page redirects when unauthenticated. `generateMetadata` must not break the redirect path — keep redirect in page body.

### Scope guard

If additional work surfaces during execution, note it in `Open decisions / blockers` — do NOT expand scope mid-task.

### Dirstarter implementation template

- **Docs read first:** Organization detail page (SESSION_0236) + Program detail page (SESSION_0235); `apps/web/lib/pages.ts` for `getPageMetadata`; `apps/web/server/web/organization/queries.ts` for `findOrganizationSlugs` + `findRelatedOrganizations` shape.
- **Baseline pattern to extend:** `Section.Content` + `Section.Sidebar`, `Breadcrumbs`, `StructuredData`, `generateStaticParams`, `getPageMetadata`, `getRequestBrand`.
- **Custom delta:** Passport page is private → noindex + skip SSG/structured-data/related; sidebar carries profile completeness + quick links.
- **No-bypass proof:** All components are L1 primitives already used in Organization/Program/Course detail pages.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0237_TASK_01 | landed | Discipline queries: `findRelatedDisciplines` added; `findDisciplineSlugs` reshaped to no-arg returning `{ slug, brand }[]` |
| SESSION_0237_TASK_02 | landed | Discipline detail page uplifted (getRequestBrand + getPageMetadata + generateStaticParams + Section.Sidebar + Related Disciplines) |
| SESSION_0237_TASK_03 | landed | Passport (/me) page uplifted (Breadcrumbs + generateMetadata noindex + Section.Sidebar with Profile Completeness + Quick Links) |
| SESSION_0237_TASK_04 | landed | Verification: typecheck ✓, biome ✓, 299/299 tests pass, build 170/170 static pages |

## What landed

- **Discipline detail page full uplift** (`/disciplines/[slug]`):
  - Replaced raw `headers()` + manual `x-brand` parsing with `getRequestBrand()` in both `generateMetadata` and page body.
  - `generateMetadata` now flows through `getPageMetadata` (canonical URL + OG image).
  - Added `generateStaticParams` using new `findDisciplineSlugs()` — every discipline now SSG'd.
  - First `<Section>` restructured into `Section.Content` (Rank Systems grid) + `Section.Sidebar` (Overview card with programs/courses/techniques counts + History card with founder carousel / established year / history text).
  - Removed the now-redundant standalone Overview and History sections.
  - Added Related Disciplines section near the bottom (`findRelatedDisciplines`, up to 6, alphabetical, same brand or system) — matches Organization page's related pattern.
  - Preserved Breadcrumbs, Intro, Organizations grid, Styles chips, CoursesSection, SchoolsSection, BlackBeltRail, ContentAtomsSection, VideoCarousel, MemberCarouselByRank, LineageTreeSection, StructuredData JSON-LD.
- **Passport `/me` page uplift** (private, auth-gated — applied only the parity bits that make sense for a non-public page):
  - `metadata` const → `generateMetadata` via `getPageMetadata({ url: "/me", metadata: { ..., robots: { index: false, follow: false } } })`. Private user data is now explicitly noindex.
  - Added `Breadcrumbs` chrome (My Passport).
  - Restructured into `Section.Content` (PassportEditor unchanged) + `Section.Sidebar` (Profile Completeness card showing filled-vs-total passport fields and directory visibility label + Quick Links card linking to public directory, disciplines, organizations).
  - Auth-redirect chain (`getServerSession` → `/auth/login`, null-passport guard) preserved in page body — NOT in `generateMetadata`.
  - `PassportEditor` props byte-for-byte unchanged.
- **Discipline queries** (`apps/web/server/web/disciplines/queries.ts`):
  - `findDisciplineSlugs` reshaped: `(brand: Brand)` returning `{ slug }[]` → no-arg returning `{ slug, brand }[]`. Mirrors `findOrganizationSlugs`. Zero pre-existing callers.
  - New `findRelatedDisciplines({ disciplineId, brand })` returning 6 alphabetical disciplines, excluding current, same brand or system. Reuses `disciplineManyPayload`.
- **Build pages:** **170/170 static pages** (up from 158 in SESSION_0236 — +12 discipline SSG pages added via `generateStaticParams`).

## Files touched

| File | Change |
| --- | --- |
| `apps/web/app/(web)/disciplines/[slug]/page.tsx` | Full rewrite: getRequestBrand, getPageMetadata, generateStaticParams, Section.Sidebar (Overview + History), Related Disciplines |
| `apps/web/app/(web)/me/page.tsx` | Uplift: generateMetadata (noindex), Breadcrumbs, Section.Content/Sidebar (Profile Completeness + Quick Links cards) |
| `apps/web/server/web/disciplines/queries.ts` | Reshaped `findDisciplineSlugs` (no-arg, `{slug,brand}[]`); added `findRelatedDisciplines` |
| `docs/sprints/SESSION_0237.md` | New: this session record |
| `docs/knowledge/wiki/files/discipline-detail-page.md` | New: wiki entry for uplifted page |
| `docs/knowledge/wiki/files/discipline-queries.md` | Updated: corrected path, new exports listed, SSG decision documented, frontmatter refreshed |
| `docs/knowledge/wiki/index.md` | Filled missing session rows (0233–0236) + added 0237 + added discipline-detail-page entry + bumped `updated`/`last_agent` |

## Decisions resolved

- **Discipline page layout:** `Section.Content` + `Section.Sidebar` scoped to the FIRST `<Section>` only — every subsequent rich section (Organizations, Styles, Courses, Schools, BlackBeltRail, ContentAtoms, Videos, MembersByRank, Lineage) stays as its own full-width `<Section>` to avoid regressions in the dense nested components.
- **Related Disciplines:** Same brand or system, excluding current, limited to 6, alphabetical (`name` asc). Simpler than Org's discipline-OR-city heuristic because disciplines have no city / fewer overlap axes.
- **Discipline SSG slug query:** `findDisciplineSlugs` is now cross-brand (no brand arg). `generateStaticParams` returns `{slug}` tuples; brand resolution happens at request time via middleware (matches Organizations pattern).
- **Passport page parity adaptation:** Skipped `generateStaticParams` (per-user dynamic), `StructuredData` (private), and Related Items. Applied Breadcrumbs + `getPageMetadata` with `noindex` + `Section.Sidebar` only.
- **Profile completeness scope:** Counted 9 passport fields (displayName, legalFirstName, legalLastName, dob, phoneE164, avatarUrl, bio, emergencyContactName, emergencyContactPhoneE164). Intentionally omitted `gender` (sensitive default) and `socialLinks` (JSON shape). Directory visibility displayed as label (Public / Members only / Hidden), not collapsed to binary.

## Open decisions / blockers

- None.

## Verification

| Command | Result |
| --- | --- |
| `pnpm --filter @ronin-dojo/web typecheck` | Pass (after each subagent and after full integration) |
| `bun biome check --write` on the 3 touched source files | Pass — 3 files checked, 0 fixes applied |
| `bun test --parallel --path-ignore-patterns='e2e/**'` (from `apps/web/`) | **299 pass, 0 fail, 986 expect() calls, 59 files (21.82s)** |
| `pnpm --filter @ronin-dojo/web build` | Pass — **170/170 static pages** generated (158 baseline + 12 discipline SSG) |
| `bun run wiki:lint` | 0 errors, 503 warnings — all pre-existing; **0 introduced** on touched files |

## Reflections

- **Parallel subagent dispatch worked cleanly.** TASK_01 (disciplines queries) and TASK_03 (passport page) ran simultaneously on disjoint file sets and both returned green typechecks. TASK_02 then sequenced cleanly behind TASK_01. Token-efficient and zero merge conflicts.
- **The "scope the sidebar to the first Section only" guardrail was load-bearing.** The discipline page has 11+ rich nested sections. Restricting `Section.Sidebar` to the top section preserved every existing surface.
- **`findOrganizationSlugs` set a clean precedent.** The SSG slug query and related-items query were translatable to disciplines almost line-for-line.
- **Passport-as-private-page adaptation.** Resisted applying every parity bit. The `robots: { index: false, follow: false }` line in `getPageMetadata` closes a previously-implicit SEO hole.
- **`getPageMetadata` accepts arbitrary `Metadata` fields cleanly.** Worth remembering for the next private/auth-gated page uplift (`/dashboard/*` lanes).

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Updated `last_agent` on `wiki/index.md` (→ claude-session-0237) and `wiki/files/discipline-queries.md`; created `wiki/files/discipline-detail-page.md` with full JETTY frontmatter |
| Backlinks/index sweep | `discipline-detail-page` pairs_with `discipline-queries` + `organization-detail-page`; backlinks `sprints/SESSION_0237`. `discipline-queries` now lists `discipline-detail-page` in pairs_with. `wiki/index.md` rows added for SESSION_0233–0237 + discipline-detail-page entry under Components |
| Wiki lint | `bun run wiki:lint` → 0 errors, 503 warnings — all pre-existing; 0 introduced on touched files |
| Kaizen reflection | Reflections section present above: yes |
| Hostile close review | Doug + Giddy verdicts written below; both pass; no FS-NNNN entries opened |
| Review & Recommend | Next session entry written below |
| Memory sweep | No project-scoped facts added — pattern fully documented in protocol/SESSION trail |
| Next session unblock check | Unblocked — next task derivable from SESSION_0235/0236/0237 pattern |
| Git hygiene | Branch `main`, single commit covering app + queries + docs; push reported in final bow-out line |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` — final stats reported in bow-out line |

## Hostile close review

- **Giddy:** Pass. Discipline page sidebar cards use L1 primitives (`Card`, `CardHeader`, `CardDescription`, `H4`, `Stack`, `Badge`, `Link`). Related Disciplines grid matches the Organization pattern (`Grid`, `Card isRevealed`, `H4 render→h3` for SEO heading hierarchy, absolute-inset overlay link). Passport sidebar uses same primitives. No raw HTML violations.
- **Doug:** Pass. Typecheck green. Biome clean. Full test suite 299/299. Build 170/170 pages. Wiki-lint zero new warnings. No schema changes. No new server actions (only new query functions, all `"use cache"`-tagged with sensible cacheTag/cacheLife). `getRequestBrand()` replaces raw `headers()` in two more places — net reduction in brand-resolution surface area.
- **Dirstarter alignment:** Extension of existing L1 content/detail-page pattern. `Section`, `Breadcrumbs`, `StructuredData`, `getPageMetadata` are all Dirstarter-owned primitives already in use for Organization/Program/Course/Tool detail pages. No bypass.

## ADR / ubiquitous-language check

- ADR update **not required.** All changes apply existing patterns established by SESSION_0235 (Program) and SESSION_0236 (Organization). No new architectural decision.
- Ubiquitous Language update **not required.** No new domain terms introduced.

## Next session

### Goal (SESSION_0238)

TBD — candidates in the tool-listing parity track:

- **Schools detail page** (`/schools/[slug]` if exists, or list-only — verify first) — apply parity pattern.
- **Lineage detail page** (`/lineage/[slug]` or similar) — apply parity; lineage tree canvas is the heaviest custom component so scope guard is critical.
- **Courses listing page** (`/courses`) — promote the LIST page to parity (SESSION_0234 covered the detail page).
- **Dashboard pages** (`/dashboard/*`) — apply Breadcrumbs + `getPageMetadata` noindex pattern from passport uplift; user-private surfaces.

### Inputs to read

- `apps/web/app/(web)/schools/` directory tree (verify structure first).
- `apps/web/app/(web)/lineage/` directory tree.
- SESSION_0237 `What landed` + `Reflections` sections (this file).
- `apps/web/app/(web)/organizations/[slug]/page.tsx` + `apps/web/app/(web)/disciplines/[slug]/page.tsx` as gold-standard references.

### First task

SESSION_0238_TASK_01: pick a target from the candidates above (Petey decides at bow-in based on user signal), then mirror SESSION_0237_TASK_01–03 structure (queries + page uplift) on that target.
