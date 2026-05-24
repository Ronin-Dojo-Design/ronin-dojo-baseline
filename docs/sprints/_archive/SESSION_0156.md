---
title: "SESSION 0156 — Course Enrollment + Completion Server Layer"
slug: session-0156
type: session--implement
status: closed-full
created: 2026-05-13
updated: 2026-05-13
last_agent: copilot-session-0156
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0155.md
  - docs/runbooks/course-curriculum-runbook.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0156 — Course Enrollment + Completion Server Layer

## Date

2026-05-13

## Operator

Brian Scott + Copilot (Petey → Cody)

## Goal

Implement Course Enrollment + Curriculum Completion server layer per SESSION_0155 TASK_02 plan:

1. Seed data: 1 Course + 3 CurriculumItems + 1 CourseEnrollment + 1 CurriculumItemCompletion in `prisma/seed.ts`
2. Server actions for CourseEnrollment: `enrollInCourse`, `unenrollFromCourse` with entitlement gating
3. Server actions for CurriculumItemCompletion: `markItemComplete`, `markItemIncomplete`
4. Admin queries for enrollment list (per-course) and completion progress (per-user-per-course)

## Dirstarter Alignment Table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | No — new server actions following existing L1 patterns |
| Extension or replacement | Extension — new domain actions for CourseEnrollment/CurriculumItemCompletion |
| Why justified | Course enrollment is the next S6 deliverable per WORKFLOW 5.0 NOW column |
| Risk if bypassed | Content + Curriculum lane blocked; can't build public course pages (SESSION_0157) without server layer |

## Graphify Check

- Graph status: current (updated end of SESSION_0155)
- Skip graphify update — will update after git commit at session close

## Open Decisions / Blockers

- **Tiered course access (member-free / public-paid)** — deferred to Stripe wiring sprint. Current gate: active membership required. Future: add `accessMode` enum on Course + pricing plan linkage. Will cross this bridge when Stripe payment pipeline is built.
- 🔴 Resend domain DNS pending verification — carried
- 🟡 Docker Desktop not running — MinIO untested (carried from 0131)

---

## Task Log

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0156_TASK_01 | Seed data: 218 courses (Safety + Fundamentals per rank + Coaches) × 12 disciplines + enrollment/completion fixtures | ✅ done |
| SESSION_0156_TASK_02 | Server actions: `enrollInCourse`, `unenrollFromCourse` with membership gate | ✅ done |
| SESSION_0156_TASK_03 | Server actions: `markItemComplete`, `markItemIncomplete` with auto-completion detection | ✅ done |
| SESSION_0156_TASK_04 | Admin queries: `getCourseEnrollments`, `getEnrollmentProgress`, `getCourseEnrollmentStats` | ✅ done |
| SESSION_0156_TASK_05 | Course + Curriculum Runbook with mermaid charts, ASCII flows, seed SOP, cross-references | ✅ done |

## What Landed

- **218 courses seeded across 12 disciplines:** 12 Safety School courses, ~194 Fundamentals courses (1 per rank per rank system), 12 Coaches Certification courses. Each course has 3 curriculum items. Eskrima gets separate courses per rank system (PIMA Denver + PIMA Jersey).
- **654 curriculum items seeded:** 3 per course with discipline-appropriate content (techniques, concepts, assessment for BELT_RANK; etiquette, injury prevention, emergency for SAFETY; teaching methodology, student safety, curriculum delivery for COACH).
- **1 test enrollment + 1 completion:** Sensei enrolled in BJJ Safety School, first item completed.
- **4 server actions created** in `server/web/course-enrollment/actions.ts`: `enrollInCourse` (membership gate + brand scope + rate limit), `unenrollFromCourse` (cascade delete), `markItemComplete` (auto-completion detection when all items done), `markItemIncomplete` (transaction: delete completion + clear course completedAt).
- **3 admin queries created** in `server/web/course-enrollment/queries.ts`: `getCourseEnrollments` (per-course enrollment list), `getEnrollmentProgress` (per-enrollment curriculum progress), `getCourseEnrollmentStats` (enrolled/completed counts).
- **Error catalog, schemas, payloads** created following L1 pattern from `server/web/enrollment/`.
- **Course + Curriculum Runbook** created with full data model, seed SOP, enrollment/completion flows (ASCII + mermaid), admin queries, entitlement gate, certification readiness, rate limiting, troubleshooting, and cross-references to 6 existing runbooks.

## Files Touched

| Path | Note |
| --- | --- |
| `apps/web/prisma/seed.ts` | Added ~130 lines: programmatic course generation loop (Safety + Fundamentals per rank + Coaches per discipline), enrollment + completion fixtures |
| `apps/web/server/web/course-enrollment/actions.ts` | New — 4 server actions (enrollInCourse, unenrollFromCourse, markItemComplete, markItemIncomplete) |
| `apps/web/server/web/course-enrollment/errors.ts` | New — 12 error codes |
| `apps/web/server/web/course-enrollment/schemas.ts` | New — 4 Zod input schemas |
| `apps/web/server/web/course-enrollment/payloads.ts` | New — Prisma select payloads + TS types for CourseEnrollment and CurriculumItemCompletion |
| `apps/web/server/web/course-enrollment/queries.ts` | New — 3 admin read queries (brand-scoped) |
| `docs/runbooks/course-curriculum-runbook.md` | New — operational SOP for course system |
| `docs/runbooks/sop-data-and-wiring-flows.md` | Markdown lint auto-fix (blank lines) |
| `docs/runbooks/sop-e2e-user-lifecycle.md` | Markdown lint fix (heading level jumps h1→h3 → h1→h2) |
| `docs/runbooks/sop-agent-workflows-and-rituals.md` | Markdown lint auto-fix (blank lines) |
| `docs/runbooks/stripe-setup-runbook.md` | Fixed corrupted frontmatter opener (`-re--` → `---`) |
| `docs/knowledge/wiki/index.md` | Added SESSION_0156 + course-curriculum-runbook entries, bumped last_agent |
| `docs/sprints/SESSION_0156.md` | This file |

## Decisions Resolved

- **Course seed is programmatic, not hardcoded:** Loop over disciplines + rank systems generates all courses. Adding a new discipline auto-generates Safety + Fundamentals + Coaches courses.
- **Eskrima gets per-rank-system fundamentals:** Since PIMA Denver and PIMA Jersey have genuinely different curricula, fundamentals courses are generated per rank system with slug prefix disambiguation.
- **CourseEnrollment uses membership gate, not full entitlement:** Simpler than `checkEntitlement()`. Active membership in the course's org = can enroll. Sufficient for Baseline launch.
- **Auto-completion detection:** When all curriculum items are completed, `courseEnrollment.completedAt` is set automatically. `markItemIncomplete` clears it via `$transaction`.
- **Tiered access deferred:** Member-free / public-paid course access deferred to Stripe wiring sprint. Current gate is membership-only.
- **Runbook cross-references existing flows:** Course runbook links to §12/§13/§15 of data-wiring-flows, e2e lifecycle §4, stripe runbook, and invites runbook rather than duplicating.

## Review Log

### SESSION_0156_REVIEW_01 — Doug Review + Full Close Review

- **Reviewer:** Doug
- **Dirstarter docs check:** Server actions follow L1 `userActionClient` chain pattern. Error catalog, schemas, payloads, queries match `server/web/enrollment/` structure. No Dirstarter baseline divergence — this is a pure extension.
- **Security:** Brand scoping enforced via `getRequestBrand()` + `course.brand` filter on all queries. Rate limiting uses existing `enrollment_write` limiter. No cross-brand data leakage vectors.
- **Data integrity:** Enrollment uniqueness constraint (`userId_courseId`), completion uniqueness (`enrollmentId_curriculumItemId`). Auto-completion uses count comparison. `markItemIncomplete` uses `$transaction` to atomically clear both completion and course completedAt.
- **Verification honesty:** `tsc --noEmit` zero errors confirmed. Seed runs cleanly: 218 courses, 654 items, 1 enrollment, 1 completion.
- **WORKFLOW 5.0 compliance:** Course enrollment server layer was NOW column item. Delivered.
- **Verdict:** Aligned. Clean extension of L1 patterns. No scope creep.

## ADR / Ubiquitous-Language Check

- No new ADR needed — course enrollment follows existing membership gate pattern. Tiered access (future) may warrant an ADR when designed.
- No new domain terms introduced. CourseEnrollment, CurriculumItemCompletion, CertificationType already in schema and ubiquitous language.

## Reflections

- **Programmatic seeding scales well.** Instead of hardcoding 218 courses, the loop-over-disciplines pattern means adding a 13th discipline auto-generates all its courses. This is the right pattern for seed data that tracks rank systems.
- **ProgramEnrollment vs CourseEnrollment naming could confuse.** The codebase has `server/web/enrollment/` (ProgramEnrollment) and `server/web/course-enrollment/` (CourseEnrollment). These are genuinely different models but the directory names are close. A future cleanup could rename `enrollment/` to `program-enrollment/` for clarity.
- **The membership gate is the right call for now.** The tiered access discussion was a good sign — it means we're thinking about the business model — but building it before Stripe wiring exists would be premature. The deferred decision is logged and won't be lost.

## Full Close Evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `course-curriculum-runbook.md`: created 2026-05-13, last_agent copilot-session-0156. SESSION_0156.md: updated, status closed-full. |
| Backlinks/index sweep | SESSION_0156 pairs_with updated to include runbook. Runbook backlinks include SESSION_0156 + wiki index. |
| Wiki lint | `markdownlint-cli2`: 0 errors on 7 files (SESSION_0156.md, course-curriculum-runbook.md, 5 referenced runbooks). `bun run wiki:lint`: 0 errors, 530 warnings (all pre-existing). |
| Kaizen reflection | Reflections section present: yes (3 items) |
| Hostile close review | SESSION_0156_REVIEW_01 above |
| Review & Recommend | Next session goal written: yes (SESSION_0157 — Public course pages + enrollment UI) |
| Memory sweep | No operator memory update needed. Course runbook is the project-scoped artifact. |
| Next session unblock check | Unblocked — server layer complete, seed data in place, no user input required |
| Git hygiene | Branch: main, worktree: single (clean), 1 commit: `3e14452` (code + docs) |
| Graphify update | 282 nodes, 816 edges, 661 communities |

## Next Session

- **Goal:** SESSION_0157 — Public Course Pages + Enrollment UI (per SESSION_0155 TASK_02 plan)
- **Inputs to read:** SESSION_0156.md, `course-curriculum-runbook.md`, `dirstarter-component-inventory.md` (G6 gate), `server/web/course-enrollment/actions.ts`
- **First task:** Public course detail page `app/(web)/courses/[slug]/page.tsx` with curriculum items list
