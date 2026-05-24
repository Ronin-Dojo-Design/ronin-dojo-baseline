---
title: "SESSION 0236 — Organization detail page deep uplift to tool-listing parity"
slug: session-0236
type: session--implement
status: closed-quick
created: 2026-05-24
updated: 2026-05-24
last_agent: copilot-session-0236
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0235.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0236 — Organization detail page deep uplift to tool-listing parity

## Date

2026-05-24

## Operator

Brian + copilot-session-0236 (Petey orchestrating, Cody executing)

## Goal

Deep uplift of Organization detail page (`/organizations/[slug]`) to Dirstarter tool-listing gold standard: Breadcrumbs, StructuredData, Section.Sidebar, related organizations, `generateStaticParams`, OG metadata via `getPageMetadata`, `getRequestBrand` replacing raw `headers()`. Same pattern as SESSION_0235 did for Program.

## Bow-in

### Previous session

- SESSION_0235 (`closed-full`) — Program detail page uplifted to parity. 299/299 tests. Score 9.5/10.

### Branch and worktree

- Branch: `main`, clean tree

### Graphify check

- Graph status: current (6837 nodes, 11044 edges, 992 communities)
- Query used: `organization detail page slug queries payloads breadcrumbs structured data section sidebar`
- Files selected from graph: `organizations/[slug]/page.tsx`, `server/web/organization/queries.ts`, `server/web/organization/payloads.ts`

### Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Content (detail page pattern), structured data |
| Extension or replacement | Extension — applying existing L1 patterns to Organization entity |
| Why justified | Organization detail page is public-facing content; parity with tool listing pattern improves SEO + UX consistency |
| Risk if bypassed | Inconsistent page structure, missing structured data, no SSG for org pages |

## Petey plan

### Goal

Uplift Organization detail page to tool-listing parity using Program detail page (SESSION_0235) as the template.

### Tasks

#### SESSION_0236_TASK_01 — New queries: `findOrganizationSlugs` + `findRelatedOrganizations`

- **Agent:** Cody
- **What:** Add `findOrganizationSlugs` (for `generateStaticParams`) and `findRelatedOrganizations` (same discipline or city, excluding current, take 6) to `server/web/organization/queries.ts`.
- **Steps:**
  1. Add `findOrganizationSlugs` returning all org slugs+brands for SSG
  2. Add `findRelatedOrganizations` with brand filter, same discipline OR same city, exclude current, limit 6
- **Done means:** Both queries export, typecheck passes.
- **Depends on:** nothing

#### SESSION_0236_TASK_02 — Organization detail page: Breadcrumbs + StructuredData + Intro uplift + `getRequestBrand`

- **Agent:** Cody
- **What:** Replace `headers()` brand resolution with `getRequestBrand()`. Add `Breadcrumbs`, `StructuredData` (CollectionPage). Improve `generateMetadata` to use `getPageMetadata`. Add discipline badges in Intro with links.
- **Done means:** Breadcrumbs render, JSON-LD in source, OG metadata present, no raw `headers()` call.
- **Depends on:** TASK_01

#### SESSION_0236_TASK_03 — Organization detail page: Section.Sidebar + related organizations

- **Agent:** Cody
- **What:** Restructure layout to `Section.Content` + `Section.Sidebar` (sidebar = Join buttons + member count card). Add "Related Organizations" section using `findRelatedOrganizations`. Add `generateStaticParams`.
- **Done means:** Sidebar layout, related orgs shown, SSG wired.
- **Depends on:** TASK_01, TASK_02

#### SESSION_0236_TASK_04 — Verification + bow-out

- **Agent:** Petey
- **What:** typecheck + biome + full test suite + build gate.
- **Done means:** All gates green.
- **Depends on:** TASK_01–03

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Cody | Clear server-layer execution |
| TASK_02 | Cody | Page uplift following established pattern |
| TASK_03 | Cody | Page uplift continuation |
| TASK_04 | Petey | Verification and closing |

### Open decisions

- None. Pattern established in SESSION_0235.

### Risks

- Org detail page has membership management UI (JoinOrganizationButton, MembershipActions) — must preserve all auth-gated functionality while restructuring layout.

### Scope guard

If additional work surfaces, note it — do NOT expand scope.

### Dirstarter implementation template

- **Docs read first:** Program detail page (SESSION_0235) as internal gold standard; Dirstarter tool listing pattern.
- **Baseline pattern to extend:** Section.Content + Section.Sidebar, Breadcrumbs, StructuredData, generateStaticParams, getPageMetadata, getRequestBrand.
- **Custom delta:** Membership management UI in sidebar, discipline join buttons, related orgs by discipline/city.
- **No-bypass proof:** All components are L1 primitives already used in Program/Course detail pages.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0236_TASK_01 | landed | New queries: findOrganizationSlugs + findRelatedOrganizations |
| SESSION_0236_TASK_02 | landed | Breadcrumbs + StructuredData + Intro + getRequestBrand |
| SESSION_0236_TASK_03 | landed | Section.Sidebar + related orgs + generateStaticParams |
| SESSION_0236_TASK_04 | landed | Verification: typecheck ✓, biome ✓, 299/299 pass ✓, build 158/158 ✓ |

## What landed

- **Organization detail page full uplift:** Breadcrumbs, StructuredData (JSON-LD CollectionPage), Section.Content + Section.Sidebar layout, linked discipline badges in Intro, Related Organizations section, generateStaticParams for SSG, OG metadata via getPageMetadata, getRequestBrand replacing raw `headers()`.
- **New queries:** `findOrganizationSlugs` (SSG), `findRelatedOrganizations` (same discipline or city, take 6) in `server/web/organization/queries.ts`.
- **Sidebar:** Invite link card (owner-only) + Organization Info card (type, member count, discipline count).
- **Related Organizations:** Same discipline OR same city, excluding current, limited to 6. Uses Card rendering matching programs pattern.
- **Build: 158/158 static pages** (up from 154 — org SSG pages added via generateStaticParams).

## Files touched

| File | Change |
| --- | --- |
| `apps/web/app/(web)/organizations/[slug]/page.tsx` | Full rewrite: Breadcrumbs, StructuredData, Section.Sidebar, Related Orgs, generateStaticParams, getPageMetadata, getRequestBrand |
| `apps/web/server/web/organization/queries.ts` | Added `findOrganizationSlugs`, `findRelatedOrganizations` queries |
| `docs/sprints/SESSION_0236.md` | New: this session record |

## Decisions resolved

- **Organization page layout:** Uses `Section.Content` + `Section.Sidebar` matching program/course detail page pattern. Sidebar contains invite link card (owner-only) + org info card.
- **Related organizations:** Same discipline OR same city, excluding current, limited to 6. Mirrors `findRelatedPrograms` pattern.
- **generateStaticParams:** Uses `findOrganizationSlugs()` returning all org slugs for SSG.
- **Brand resolution:** Replaced raw `headers()` + `Brand` cast with `getRequestBrand()` — single source of truth per `lib/brand-context.ts`.

## Open decisions / blockers

- None.

## Verification

| Command | Result |
| --- | --- |
| `pnpm --filter @ronin-dojo/web typecheck` | Pass |
| `biome check --write` | Pass — 1 auto-fixed |
| `bun test --parallel --path-ignore-patterns='e2e/**'` (from `apps/web/`) | 299 pass, 0 fail, 986 expect() calls, 59 files |
| `pnpm --filter @ronin-dojo/web build` | Pass — 158/158 static pages |

## Hostile close review

- **Giddy:** Pass. All UI uses L1 components: Breadcrumbs, Intro, IntroTitle, IntroDescription, Section, Section.Content, Section.Sidebar, Badge, Card, CardHeader, CardDescription, H4, Link, Stack, Grid, StructuredData, JoinOrganizationButton, MembershipActions. No raw HTML violations.
- **Doug:** Pass. Typecheck green. Biome green. Full suite 299/299. Build 158/158 pages. No schema changes.

## ADR / ubiquitous-language check

- ADR update **not required.** All changes use existing patterns (Breadcrumbs, StructuredData, Section.Sidebar, generateStaticParams, getRequestBrand from program/course/discipline pages).
- No new domain terms.

## Next session

### Goal (SESSION_0237)

TBD — candidates: Discipline detail page uplift to parity, or Passport page uplift.

### Inputs to read

- `apps/web/app/(web)/disciplines/[slug]/page.tsx` — current discipline detail page
- `apps/web/app/(web)/passport/page.tsx` — current passport page
- SESSION_0236 `What landed` section

### First task

SESSION_0237_TASK_01: TBD — await session.
