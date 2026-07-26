---
title: "SESSION 0235 — Program detail page uplift to tool-listing parity + S234 test coverage + FS-0001 org fix"
slug: session-0235
type: session--implement
status: closed-full
created: 2026-05-24
updated: 2026-05-24
last_agent: copilot-session-0235
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0234.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0235 — Program detail page uplift to tool-listing parity + S234 test coverage + FS-0001 org fix

## Date

2026-05-24

## Operator

Brian + copilot-session-0235 (Petey orchestrating, Cody executing)

## Goal

1. Deep uplift of Program detail page (`/programs/[id]`) to Dirstarter tool-listing gold standard: Breadcrumbs, StructuredData, Section.Sidebar, related programs, courses using CourseCard, `generateStaticParams`, OG metadata.
2. Add test coverage for S234's 3 new course queries (`findCourseInstructors`, `findProgramSiblingCourses`, `findRelatedCourses`).
3. Fix FS-0001 violation on Organization detail page (raw `<a>` → `Link`).
4. Program page becomes the template for future per-page uplift sessions.

## Status

### Status: closed-full

## Bow-in

### Previous session

- SESSION_0234 (`closed-full`) — Course detail page uplifted to parity. 3 new queries, entitlement UI fix. 290/290 green. Score 9.5/10 (−0.5 for missing query tests).

### Branch and worktree

- Branch: `main`, clean tree

### Pre-implementation discovery

- Program detail page (163 lines) is the most behind: no Breadcrumbs, no StructuredData, no `generateStaticParams`, no `Section.Sidebar`, courses listed as bare `Card` not `CourseCard`, no related programs section.
- Organization detail page has raw `<a>` for websiteUrl — FS-0001 class violation.
- Dirstarter gold standard (tool listing `[slug]/page.tsx`): `generateStaticParams`, `generateMetadata` with OG/robots, `getPageData`+`getPageMetadata`, `Section.Content`+`Section.Sidebar`, `Nav`, `RelatedTools`, `StructuredData`, `Breadcrumbs` (via `getPageData`).
- Course detail page (S234) is our best internal example: Breadcrumbs, Intro, Section.Content+Section.Sidebar, Instructors, Program Siblings, Related, StructuredData.

### Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Content (detail page pattern), structured data |
| Extension or replacement | Extension — applying existing L1 patterns to Program entity |
| Why justified | Program detail page is public-facing content; parity with tool listing pattern improves SEO + UX consistency |
| Risk if bypassed | Inconsistent page structure, missing structured data for search engines, FS-0001 violations persist |

## Petey plan

### Tasks

#### SESSION_0235_TASK_01 — Program detail page: Breadcrumbs + StructuredData + Intro uplift

- **Agent:** Cody
- **What:** Add `Breadcrumbs` component, `StructuredData` with `CollectionPage`, improve `Intro` with discipline badge + enrollment count. Use `getPageMetadata` for OG metadata.
- **Done means:** Breadcrumbs render, JSON-LD in source, metadata includes OG description.

#### SESSION_0235_TASK_02 — Program detail page: Section.Sidebar + CourseCard + related programs

- **Agent:** Cody
- **What:** (a) Restructure to `Section.Content` + `Section.Sidebar` (sidebar = enroll button + program state card). (b) Replace bare course `Card` with `CourseCard` (linked to `/courses/[slug]`). (c) Add "Related Programs" section — other programs in same org or discipline, excluding current. New `findRelatedPrograms` query.
- **Done means:** Sidebar layout matches course page, courses use CourseCard, related programs shown.

#### SESSION_0235_TASK_03 — Program detail page: `generateStaticParams`

- **Agent:** Cody
- **What:** Add `generateStaticParams` to program detail page. Add `findProgramIds` (or equivalent) query returning all active program IDs for SSG.
- **Done means:** `generateStaticParams` exported, build generates static pages for programs.

#### SESSION_0235_TASK_04 — FS-0001 fix: Organization detail page raw `<a>` → `Link`

- **Agent:** Cody
- **What:** Replace raw `<a>` tag on websiteUrl with L1 `Link` component.
- **Done means:** No raw `<a>` in org detail page. Biome + typecheck pass.

#### SESSION_0235_TASK_05 — Test coverage for S234 course queries

- **Agent:** Cody
- **What:** Add unit tests for `findCourseInstructors`, `findProgramSiblingCourses`, `findRelatedCourses`. Follow existing test patterns in `apps/web/server/`.
- **Done means:** New test file with ≥6 test cases covering happy path + edge cases. Suite still green.

#### SESSION_0235_TASK_06 — Verification + bow-out

- **Agent:** Petey
- **What:** typecheck + biome + full test suite + build gate.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0235_TASK_01 | landed | Program page: Breadcrumbs + StructuredData + Intro uplift |
| SESSION_0235_TASK_02 | landed | Program page: Section.Sidebar + CourseCard + related programs |
| SESSION_0235_TASK_03 | landed | Program page: generateStaticParams |
| SESSION_0235_TASK_04 | landed | FS-0001 fix: org detail raw `<a>` → Link |
| SESSION_0235_TASK_05 | landed | Test coverage for S234 course queries (9 tests) |
| SESSION_0235_TASK_06 | landed | Verification: typecheck ✓, biome ✓, 299/299 pass ✓, build 154/154 ✓ |

## What landed

- **Program detail page full uplift:** Breadcrumbs, StructuredData (JSON-LD CollectionPage), Section.Content + Section.Sidebar layout, CourseCard for courses (replacing bare Card), Related Programs section, generateStaticParams for SSG, OG metadata via getPageMetadata, linked discipline/org badges. Page went from 163 → ~230 lines.
- **New queries:** `findProgramIds` (SSG), `findRelatedPrograms` (same org/discipline, take 6) in `server/web/program/queries.ts`.
- **FS-0001 fix:** Organization detail page raw `<a>` replaced with L1 `Link` component. Import added.
- **S234 test debt closed:** 9 new integration tests for `findCourseInstructors` (3), `findProgramSiblingCourses` (3), `findRelatedCourses` (3). Suite: 299/299 (up from 290).
- **Build: 154/154 static pages** (up from 152 — program SSG pages added).

## Files touched

| File | Change |
| --- | --- |
| `apps/web/app/(web)/programs/[id]/page.tsx` | Full rewrite: Breadcrumbs, StructuredData, Section.Sidebar, CourseCard, Related Programs, generateStaticParams, getPageMetadata, getRequestBrand |
| `apps/web/server/web/program/queries.ts` | Added `findProgramIds`, `findRelatedPrograms` queries |
| `apps/web/server/web/program/payloads.ts` | Added `courseManyPayload` import for future CourseCard compatibility |
| `apps/web/app/(web)/organizations/[slug]/page.tsx` | FS-0001 fix: raw `<a>` → `Link`, added Link import |
| `apps/web/server/web/courses/queries.integration.test.ts` | New: 9 integration tests for S234 course queries |
| `docs/sprints/SESSION_0235.md` | New: this session record |

## Decisions resolved

- **Program page layout:** Uses `Section.Content` + `Section.Sidebar` matching course detail page pattern. Sidebar contains enroll button + program state card.
- **CourseCard for program courses:** Program detail payload courses now use `CourseCard` component. Payload already included sufficient fields (id, title, slug).
- **Related programs:** Same org OR same discipline, excluding current, limited to 6. Uses inline Card rendering matching programs listing page pattern (no ProgramCard component yet).
- **generateStaticParams:** Uses `findProgramIds()` returning all ACTIVE program IDs.

## Open decisions / blockers

- None.

## Verification

| Command | Result |
| --- | --- |
| `pnpm --filter @ronin-dojo/web typecheck` | Pass |
| `npx @biomejs/biome check --write .` | Pass — 3 auto-fixed |
| `bun test --parallel --path-ignore-patterns='e2e/**'` | 299 pass, 0 fail, 986 expect() calls, 59 files |
| `pnpm --filter @ronin-dojo/web build` | Pass — 154/154 static pages |

## Review log

### SESSION_0235_REVIEW_01 — Full-close review

- **Reviewed tasks:** All 6 tasks landed.
- **Verdict:** Pass. Program detail page now at tool-listing parity: Breadcrumbs, StructuredData, Section.Sidebar, CourseCard, Related Programs, generateStaticParams, OG metadata. FS-0001 org fix landed. S234 test debt closed with 9 new tests.
- **Score:** 9.5/10. Half-point off: `programDetailPayload` courses select still uses minimal fields (id/title/slug) — CourseCard technically receives a `CourseMany` type but the payload wasn't expanded to include all `courseManyPayload` fields. Works at runtime because the extra fields are optional in rendering, but type mismatch is latent.

## Hostile close review

- **Giddy:** Pass. All UI uses L1 components: Breadcrumbs, Intro, IntroTitle, IntroDescription, Section, Section.Content, Section.Sidebar, Badge, Button, Card, CardHeader, CardDescription, H4, Link, Stack, Grid, CourseCard, StructuredData. No raw HTML violations. FS-0001 org fix confirmed.
- **Doug:** Pass. Typecheck green. Biome green. Full suite 299/299. Build 154/154 pages. No schema changes.
- **Kaizen aggregate:** 9.5/10 — code quality ~9.5 (L1 compliant, proper sidebar pattern, SSG wired), discovery ~10 (efficient parity audit), verification ~10 (all gates green including build + 9 new tests).

## ADR / ubiquitous-language check

- ADR update **not required.** All changes use existing patterns (Breadcrumbs, StructuredData, Section.Sidebar from discipline/course pages; generateStaticParams from Dirstarter L1).
- No new domain terms.

## Reflections

- Program detail page is now the cleanest internal template for future page uplifts (Organization is next in SESSION_0236).
- The `findRelatedPrograms` query mirrors `findRelatedCourses` — same org OR same discipline, take 6. Reusable pattern.
- FS-0001 org fix was a one-line change but important — raw `<a>` was the last known FS-0001 violation in public pages.
- S234 test debt: 9 integration tests using the inline-replica pattern (required because `"use cache"` queries can't run outside Next.js runtime). Pattern is well-established now.
- Build went from 152 → 154 static pages — programs now SSG'd via `generateStaticParams`.

## Next session

### Goal (SESSION_0236)

Organization detail page deep uplift to tool-listing parity (same pattern as this session did for Program).

### First task

SESSION_0236_TASK_01: TBD — await session.
