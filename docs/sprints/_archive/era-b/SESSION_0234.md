---
title: "SESSION 0234 — Course detail page uplift to listing parity"
slug: session-0234
type: session--implement
status: closed-full
created: 2026-05-24
updated: 2026-05-24
last_agent: copilot-session-0234
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0233.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0234 — Course detail page uplift to listing parity

## Date

2026-05-24

## Operator

Brian + copilot-session-0234 (Petey orchestrating, Cody executing)

## Goal

Uplift public course detail page (`/courses/[slug]`) to discipline-detail-page parity: fix entitlement UI gap from SESSION_0233, add structured data (JSON-LD), instructor/school section, "courses in this program" section, and related courses section. All using L1 Dirstarter components.

## Status

### Status: closed-full

## Bow-in

### Previous session

- SESSION_0233 (`closed-full`) — Added COURSE_ACCESS entitlement OR gate to enrollment + 17 test cases. Suite: 290/290 green.

### Branch and worktree

- Branch: `main`, clean tree

### Pre-implementation discovery

- Course detail page exists with enrollment panel + curriculum list but lacks: entitlement UI awareness, structured data, instructor info, program siblings, related courses.
- Enrollment panel shows "Membership required" for non-members even if they have COURSE_ACCESS entitlement (server allows it, UI blocks it).
- No `prerequisite` relation on Course model. Courses connect via `ProgramCourse` join table (no order column — flat set).
- Instructors are members with `MembershipRoleAssignment` where `role.code === "INSTRUCTOR"` on the course's organization.
- Structured data pattern established on discipline, blog, and about pages via `StructuredData` component + `lib/structured-data.ts` helpers.

## Petey plan

### Tasks

#### SESSION_0234_TASK_01 — Query layer: add entitlement check + instructors + program courses + related courses

- **Agent:** Cody
- **What:** (a) Add `hasCourseAccessEntitlement` to `getCurrentCourseEnrollmentState` return. (b) Expand `courseOnePayload` to include `programs` with sibling courses. (c) Add `findCourseInstructors` query. (d) Add `findRelatedCourses` query.
- **Done means:** All four data sources available for the detail page.

#### SESSION_0234_TASK_02 — Fix CourseEnrollmentPanel entitlement awareness

- **Agent:** Cody
- **What:** Pass `hasCourseAccessEntitlement` to panel. Show "Your course access entitlement grants enrollment" with enroll button instead of "Membership required" dead end.
- **Done means:** Non-member with COURSE_ACCESS entitlement sees enroll button.

#### SESSION_0234_TASK_03 — Course detail page: instructors section

- **Agent:** Cody
- **What:** New Section showing instructors from the course's organization (members with INSTRUCTOR role). Use Avatar, Badge, Stack, Card, Link.
- **Done means:** Instructors listed with name, rank badge, avatar fallback. Empty state if none.

#### SESSION_0234_TASK_04 — Course detail page: "Courses in this Program" section

- **Agent:** Cody
- **What:** New Section showing sibling courses from shared Program(s). Reuse CourseCard. Exclude current course.
- **Done means:** Program sibling courses shown. Empty state if course not in any program.

#### SESSION_0234_TASK_05 — Course detail page: related courses + structured data

- **Agent:** Cody
- **What:** (a) "Related Courses" section — other published courses in same discipline or org, excluding current + program siblings already shown. Reuse CourseCard. (b) StructuredData with Course schema.org type.
- **Done means:** Related courses shown (up to 6). JSON-LD in page source.

#### SESSION_0234_TASK_06 — Verification + bow-out

- **Agent:** Petey
- **What:** typecheck + biome + full test suite + build gate.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0234_TASK_01 | landed | Query layer: entitlement check + instructors + program courses + related courses |
| SESSION_0234_TASK_02 | landed | Enrollment panel entitlement awareness — new COURSE_ACCESS state |
| SESSION_0234_TASK_03 | landed | Instructors section with Avatar, Badge, Card grid |
| SESSION_0234_TASK_04 | landed | Courses in this Program section with CourseCard grid |
| SESSION_0234_TASK_05 | landed | Related courses section + StructuredData JSON-LD |
| SESSION_0234_TASK_06 | landed | Verification: typecheck ✓, biome ✓, 290/290 pass ✓, build ✓ |

## What landed

- **Entitlement UI fix (P0):** `getCurrentCourseEnrollmentState` now returns `hasCourseAccessEntitlement`. `CourseEnrollmentPanel` shows a new "Course Access" state with enroll button for non-members who have `COURSE_ACCESS` entitlement. Previously showed a dead-end "Membership required" message.
- **Instructors section:** New grid of instructor cards showing Avatar, name, role badges, rank, and discipline for all INSTRUCTOR-role members of the course's organization.
- **Courses in this Program section:** Shows sibling courses from shared Program(s) using `CourseCard`. Excludes current course.
- **Related Courses section:** Shows up to 6 published courses in the same discipline or organization, excluding current + program siblings. Uses `CourseCard`.
- **Structured data (JSON-LD):** `StructuredData` component with `CollectionPage` schema.org type matching discipline detail page pattern.
- **Breadcrumbs:** Added `Breadcrumbs` component matching discipline detail page pattern.
- **3 new queries:** `findCourseInstructors`, `findProgramSiblingCourses`, `findRelatedCourses` in `server/web/courses/queries.ts`. All cached with `"use cache"`.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/app/(web)/courses/[slug]/page.tsx` | Added breadcrumbs, instructors section, program courses section, related courses section, structured data. Wired entitlement prop. |
| `apps/web/components/web/courses/course-enrollment-panel.tsx` | Added `hasCourseAccessEntitlement` prop. New entitlement-only enrollment state with enroll button. |
| `apps/web/server/web/course-enrollment/queries.ts` | Added entitlement query to `getCurrentCourseEnrollmentState`, returns `hasCourseAccessEntitlement`. |
| `apps/web/server/web/courses/queries.ts` | Added `findCourseInstructors`, `findProgramSiblingCourses`, `findRelatedCourses` queries. |
| `docs/sprints/SESSION_0234.md` | New: this session record. |

## Verification

| Command | Result |
| --- | --- |
| `pnpm --filter @ronin-dojo/web typecheck` | Pass |
| `bun biome check --write` | Pass — 4 files, 3 auto-fixed |
| `bun test --parallel --path-ignore-patterns='e2e/**'` | 290 pass, 0 fail, 967 expect() calls, 58 files |
| `pnpm --filter @ronin-dojo/web build` | Pass — 152/152 static pages |

## Decisions resolved

- **Entitlement UI pattern:** Non-members with `COURSE_ACCESS` entitlement see a green "Course Access" badge and active enroll button. Three-way gate: membership, entitlement, or neither.
- **"Prerequisites" → "Courses in this Program":** Course has no prerequisite relation. Sibling courses via `ProgramCourse` join table shown instead. Unordered (no order column).
- **Instructors:** Members with `INSTRUCTOR` role assignment on the course's organization. Surfaced via `MembershipRoleAssignment` → `Role(code=INSTRUCTOR)`.
- **Related courses:** Same discipline OR same organization, excluding current + program siblings. Limited to 6.

## Open decisions / blockers

- None.

## Next session

### Goal (SESSION_0235)

Continue S6 content engine per operator direction. Potential: course admin dashboard enhancements, test coverage for new queries, or next content module.

### First task

SESSION_0235_TASK_01: TBD — await operator direction.

## Review log

### SESSION_0234_REVIEW_01 — Full-close review

- **Reviewed tasks:** All 6 tasks landed.
- **Verdict:** Pass. Course detail page now at parity with discipline detail page: breadcrumbs, structured data, instructor section, related content sections. Entitlement UI gap from SESSION_0233 fully closed.
- **Score:** 9.5/10. Half-point off because no new test coverage was added for the 3 new queries (existing 290 tests still pass; new query tests are a follow-up candidate).

## Hostile close review

- **Giddy:** Pass. All UI uses L1 components: Avatar, AvatarImage, AvatarFallback, Badge, Card, CardHeader, Stack, H4, H5, Note, Link, Breadcrumbs, Section, Intro, CourseCard, StructuredData. No raw HTML violations.
- **Doug:** Pass. Typecheck green. Biome green. Full suite 290/290. Build 152/152 pages. No schema changes.
- **Kaizen aggregate:** 9.5/10 — code quality ~10 (L1 compliant, cached queries, proper brand scoping), discovery ~9 (good instructor path via MembershipRoleAssignment), verification ~10 (all gates green including build).

## ADR / ubiquitous-language check

- ADR update **not required.** All changes use existing patterns (entitlement layer from SESSION_0036, role-based queries, cached queries, StructuredData component).
- No new domain terms.

## Reflections

- The entitlement UI gap was a genuine bug class — SESSION_0233 wired the server but the client still gatekept on membership alone. This session closes that loop end-to-end.
- The instructor query via `MembershipRoleAssignment` is reusable — any page showing an org's staff can use `findCourseInstructors` with minor generalization (rename to `findOrgInstructors`).
- The `ProgramCourse` join table lacks an `order` column, so "courses in this program" is unordered. If sequencing matters in the future, adding `order Int` to `ProgramCourse` is a one-field migration.
