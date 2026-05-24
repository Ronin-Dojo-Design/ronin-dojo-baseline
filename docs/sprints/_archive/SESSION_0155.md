---
title: "SESSION 0155 — Bulk Registration Optimistic Locking + Course CRUD Planning"
slug: session-0155
type: session--implement
status: closed-full
created: 2026-05-13
updated: 2026-05-13
last_agent: copilot-session-0155
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0154.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0155 — Bulk Registration Optimistic Locking + Course CRUD Planning

## Date

2026-05-13

## Operator

Brian Scott + Copilot (Petey → Cody → Petey)

## Goal

1. Add optimistic locking to `bulkUpdateRegistrationStatus` (loop-based individual updates replacing `updateMany`).
2. Petey plan for Course + CurriculumItem admin CRUD — the next S6 deliverable per WORKFLOW 5.0 launch board.

## Failed Steps / Drift Check

- No open failed steps in tournament registration or course areas
- No relevant drift entries

## Dirstarter Alignment Table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Yes — server action pattern change (updateMany → loop of update) |
| Extension or replacement | Extension — Dirstarter has no optimistic locking pattern. We add version-check writes to the existing bulk action. Course CRUD planning only (no code). |
| Why justified | Bulk registration status updates are high-contention (admin approving multiple registrations simultaneously with concurrent user cancellations). Course CRUD is the next S6 deliverable per WORKFLOW 5.0 launch board. |
| Risk if bypassed | Silent overwrites on concurrent bulk registration status changes. Course CRUD delayed further. |

## Graphify Check

- Graph status: ≤1 commit behind HEAD — acceptable (updated end of SESSION_0154)
- Queries used: `"bulk registration status update optimistic locking tournament"`, `"S6 sprint deliverable course curriculum content"`, `"WORKFLOW 5.0 session calendar S6 lane"`
- Files selected from graph: `server/admin/tournaments/actions.ts` (bulk update), `feature-data-prerequisites.md` (Course prereqs)
- Skip graphify update — will update after git commit at session close

---

## Petey Plan

### Goal

Two deliverables: (1) close the bulk registration optimistic locking gap from SESSION_0154, (2) produce a Petey plan for Course + CurriculumItem admin CRUD.

### Why this task now

SESSION_0154 identified `bulkUpdateRegistrationStatus` as lacking optimistic locking — it uses `updateMany` which can't do per-row version checks. This is a ~30-line fix. Course CRUD is the next WORKFLOW 5.0 launch board item in the NEXT column.

### Tasks

#### TASK_01 — Add optimistic locking to `bulkUpdateRegistrationStatus`

- **Agent:** Cody
- **What:** Replace `updateMany` with a loop of individual `update` calls using `where: { id, version }` + `version: { increment: 1 }`. Wrap in `$transaction` for atomicity. Include the existing cancelled-entries logic per registration.
- **Done means:** Bulk action uses versioned writes. Stale version on any row throws before any updates commit. Type check passes.

#### TASK_02 — Petey plan for Course + CurriculumItem admin CRUD

- **Agent:** Petey
- **What:** Read existing Course/CurriculumItem models in schema, existing admin course pages, feature-data-prerequisites.md. Produce a multi-task plan for Course + CurriculumItem admin CRUD (server actions + admin pages + seed data).
- **Done means:** Plan written in SESSION file with tasks, agents, done criteria, and parallelism notes. Ready for Cody execution in SESSION_0156+.

#### TASK_03 — Type check

- **Agent:** Cody
- **Done means:** `tsc --noEmit` zero errors.

### Parallelism

TASK_01 → TASK_03 | TASK_02 (independent)

---

## Task Log

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0155_TASK_01 | Add optimistic locking to bulkUpdateRegistrationStatus | ✅ done |
| SESSION_0155_TASK_02 | Petey plan for Course + CurriculumItem admin CRUD | ✅ done |
| SESSION_0155_TASK_03 | Type check | ✅ done |

## TASK_02 Output — Petey Plan: Course Enrollment + Curriculum Completion

### Investigation Summary

Course + CurriculumItem admin CRUD already landed in SESSION_0040. The WORKFLOW 5.0 launch board's "Course + CurriculumItem admin CRUD" item is **already done** and should be moved to READY. What's actually missing from the Content + Curriculum lane (per `feature-data-prerequisites.md` and calendar rows 0140–0141) is:

1. **CourseEnrollment** — users enrolling in courses (distinct from ProgramEnrollment which is program-level). No server actions, no UI, no seed data.
2. **CurriculumItemCompletion** — tracking user progress through curriculum items. No server actions, no UI, no seed data.
3. **Public course pages** — `apps/web/app/(web)/courses/page.tsx` exists (list) but no detail page or enrollment flow.
4. **Seed data** — `feature-data-prerequisites.md` marks Course seed as ❌ "Not yet seeded."

### Recommended Multi-Session Plan

This is a 2-session effort (matching calendar rows 0138–0141 scope):

#### SESSION_0156 — Course Enrollment + Completion Server Layer

| Task | Agent | What | Done means |
| --- | --- | --- | --- |
| TASK_01 | Cody | Seed data: 1 Course + 3 CurriculumItems + 1 CourseEnrollment + 1 CurriculumItemCompletion in `prisma/seed.ts` | Seed runs cleanly, `feature-data-prerequisites.md` updated to ✅ |
| TASK_02 | Cody | Server actions for CourseEnrollment: `enrollInCourse`, `unenrollFromCourse` with entitlement gating (check user has active membership or paid enrollment) | Actions compile, brand-scoped, entitlement-checked |
| TASK_03 | Cody | Server actions for CurriculumItemCompletion: `markItemComplete`, `markItemIncomplete` | Actions compile, user-scoped |
| TASK_04 | Cody | Admin queries for enrollment list (per-course) and completion progress (per-user-per-course) | Queries return correct shape, type check passes |

#### SESSION_0157 — Public Course Pages + Enrollment UI

| Task | Agent | What | Done means |
| --- | --- | --- | --- |
| TASK_01 | Cody | Public course detail page `app/(web)/courses/[slug]/page.tsx` with curriculum items list | Page renders, uses Dirstarter components (per inventory gate) |
| TASK_02 | Cody | Enroll button component with entitlement check | Button renders conditionally, calls `enrollInCourse` action |
| TASK_03 | Cody | Curriculum progress UI — checkboxes for item completion | Completion state persists, optimistic UI updates |
| TASK_04 | Cody | Admin enrollment list page `app/admin/courses/[id]/enrollments/page.tsx` | DataTable with enrollment status, uses L1 patterns |

### Dependencies

- Course/CurriculumItem models ✅ exist in schema
- CourseEnrollment/CurriculumItemCompletion models ✅ exist in schema
- Entitlement layer ✅ landed (SESSION_0036)
- Dirstarter component inventory ✅ must be consulted before UI work (G6 gate)

## What Landed

- **Bulk registration optimistic locking:** Replaced `updateMany` with loop-based individual `update` calls inside a `$transaction` in `bulkUpdateRegistrationStatus`. Each update uses `where: { id, version }` with version increment. P2025 catch provides per-registration error message. Entire batch is atomic — if any row is stale, no updates commit.
- **Course CRUD Petey plan:** Investigated existing code — Course + CurriculumItem admin CRUD already landed in SESSION_0040. Produced 2-session plan (0156–0157) for the remaining gap: CourseEnrollment + CurriculumItemCompletion server layer + public pages + enrollment UI.
- **WORKFLOW 5.0 launch board update:** Moved "Course + CurriculumItem admin CRUD" from NEXT to READY. Added all S6 actuals (0140–0155) to session calendar. Updated NOW/NEXT with current priorities.
- **Wiki index update:** Added SESSION_0154 and SESSION_0155 entries.
- **Session lint fixes:** Fixed markdown lint issues across SESSION_0144–0155 (12 files): heading spacing, list spacing, bare URLs, emphasis-as-heading, trailing spaces, trailing newline.
- **SESSION_0146 frontmatter repair:** Fixed corrupted `last_agent` field that had table content spliced into YAML.
- **SESSION_0146 body Status removed:** DRY fix per SESSION_0154 pattern — status lives in frontmatter only.

## Files Touched

| Path | Note |
| --- | --- |
| `apps/web/server/admin/tournaments/actions.ts` | Replaced `updateMany` with loop-based versioned updates in `bulkUpdateRegistrationStatus` |
| `docs/sprints/SESSION_0155.md` | This file |
| `docs/sprints/SESSION_0146.md` | Fixed corrupted frontmatter, removed body Status, fixed lint |
| `docs/sprints/SESSION_0144.md` | Fixed markdown lint (blanks-around-lists) |
| `docs/sprints/SESSION_0145.md` | No lint issues found |
| `docs/sprints/SESSION_0147.md` | Fixed markdown lint (heading spacing) |
| `docs/sprints/SESSION_0148.md` | Fixed markdown lint (heading spacing) |
| `docs/sprints/SESSION_0149.md` | Fixed markdown lint (trailing spaces, blanks-around-lists) |
| `docs/sprints/SESSION_0150.md` | Fixed markdown lint (blanks-around-lists) |
| `docs/sprints/SESSION_0152.md` | Fixed emphasis-as-heading, trailing newline |
| `docs/sprints/SESSION_0153.md` | Fixed emphasis-as-heading |
| `docs/sprints/SESSION_0154.md` | Fixed emphasis-as-heading |
| `docs/protocols/WORKFLOW_5.0.md` | Updated launch board (READY/NOW/NEXT), added S6 actuals to session calendar, bumped frontmatter |
| `docs/knowledge/wiki/index.md` | Added SESSION_0154 + SESSION_0155, bumped last_agent |

## Decisions Resolved

- **Bulk registration optimistic locking uses `$transaction` + loop:** `updateMany` can't do per-row version checks. Individual updates in a transaction ensure atomicity — all succeed or all roll back. This matches the single-update pattern from SESSION_0154.
- **Course admin CRUD is already done:** SESSION_0040 landed it. The gap is enrollment + completion (CourseEnrollment, CurriculumItemCompletion) and public pages — planned for SESSION_0156–0157.
- **WORKFLOW 5.0 launch board was stale:** Updated to reflect 16 sessions of work landed since last update (SESSION_0134).

## Open Decisions / Blockers

- **Invoice optimistic locking** — deferred until Invoice status transitions are built
- **CourseEnrollment/CurriculumItemCompletion seed data** — needed before SESSION_0156 (marked ❌ in feature-data-prerequisites.md)
- 🔴 Resend domain DNS pending verification — carried
- 🟡 Docker Desktop not running — MinIO untested (carried from 0131)

## Next Session

- **Goal:** SESSION_0156 — Course Enrollment + Completion server layer (seed data, enrollment actions, completion actions, admin queries)
- **Inputs to read:** SESSION_0155.md (TASK_02 plan), `feature-data-prerequisites.md` (Course prereqs), `server/admin/courses/actions.ts` (existing course actions)
- **First task:** Add Course seed data to `prisma/seed.ts` (1 Course + 3 CurriculumItems + 1 enrollment + 1 completion)

## Review Log

### SESSION_0155_REVIEW_01 — Doug Review + Full Close Review

- **Reviewer:** Doug
- **Dirstarter docs check:** `$transaction` with loop-based versioned updates is the correct pattern when `updateMany` lacks compound where support. Matches the single-update pattern from SESSION_0154. No Dirstarter baseline divergence.
- **Security:** No new attack surface. Optimistic locking tightens race condition defense on bulk operations.
- **Data integrity:** Transaction ensures atomicity — stale version on any row rolls back the entire batch. User-friendly error identifies the specific stale registration.
- **Verification honesty:** `tsc --noEmit` zero errors confirmed.
- **WORKFLOW 5.0 compliance:** Launch board updated, session calendar current through SESSION_0155.
- **Verdict:** Aligned. Code change is minimal and follows established patterns. WORKFLOW update was overdue.

## ADR / Ubiquitous-Language Check

- No new ADR needed — optimistic locking pattern established in SESSION_0152. Bulk variant is a natural extension.
- No new domain terms introduced.

## Reflections

- **Launch boards go stale fast.** WORKFLOW 5.0's launch board hadn't been updated since SESSION_0134 — 21 sessions ago. A quick board update at each full close would keep it current. Consider adding "update launch board" to the full-close checklist.
- **Markdown lint issues compound across sessions.** The `#### TASK` heading-to-list pattern was inconsistent across 12 sessions. A template fix (adding blank lines in `chat-handoff.md` task template) would prevent this category of drift.
- **Course CRUD was already built.** The WORKFLOW 5.0 launch board said it was in NEXT, but SESSION_0040 landed it months ago. This is the kind of stale planning data that wastes investigation time. Keeping the board current prevents this.

## Full Close Evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `WORKFLOW_5.0.md`: updated 2026-05-13, last_agent copilot-session-0155. `wiki/index.md`: updated, last_agent bumped. SESSION_0146: frontmatter repaired. 12 session files: lint fixed. |
| Backlinks/index sweep | SESSION_0154 + SESSION_0155 added to wiki index. No new cross-references needed. |
| Wiki lint | Markdown lint checked on all 12 session files (0144–0155): all introduced errors fixed. Pre-existing MD032 in wiki.index.md line 292 not introduced by this session. |
| Kaizen reflection | Reflections section present: yes |
| Hostile close review | SESSION_0155_REVIEW_01 above |
| Review & Recommend | Next session goal written: yes (SESSION_0156 — Course Enrollment server layer) |
| Memory sweep | WORKFLOW 5.0 launch board updated (project-scoped). No operator memory update needed. |
| Next session unblock check | Unblocked — no user input required |
| Git hygiene | Branch: main, worktree: single (clean), 2 commits: `afdb296` (code), `e5dffe9` (docs) |
| Graphify update | 34 nodes, 284 edges, 640 communities |
