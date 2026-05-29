---
title: "SESSION 0139 — Petey Plan: Course + Program Admin CRUD Gap Analysis & Task Staging"
slug: session-0139
type: session--plan
status: closed-full
created: 2026-05-12
updated: 2026-05-12
last_agent: copilot-session-0139
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0138.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/project-log.md
---

# SESSION 0139 — Petey Plan: Course + Program Admin CRUD Gap Analysis & Task Staging

## Date

2026-05-12

## Operator

Brian Scott + Copilot (Petey)

## Goal

Act as Petey to plan the next implementation tasks: Course admin CRUD completeness check, Program admin CRUD build-out, and task staging for Cody execution.

## Status

closed-full

## Failed Steps / Drift Check

- FS-0001 (component inventory gate): acknowledged — will apply if any UI tasks are planned.
- Drift register: no open entries. D-007 (deferred), D-008 (deferred) — neither affects this session.
- Carried blocker: 🔴 Resend domain DNS pending verification — 27th session carried.
- 🟡 Docker Desktop not running — MinIO untested (carried from 0131).
- 🟡 `cuid()` vs `cuid2()` whole-schema migration deferred (finding 0136-02).

## Graphify Check

- Graph status: **current** (rebuilt end of SESSION_0138, HEAD `29d8b53`)
- `.graphify/` — Nodes: 5394, Edges: 10283, Communities: 643
- Query 1: `"Course CurriculumItem admin CRUD program curriculum"` — surfaced existing admin courses files (7 components, server layer with schema/queries/actions), web courses pages, programs-curriculum-certification-spec.md
- Query 2: `"program admin CRUD enrollment schedule"` — surfaced feature-data-prerequisites.md, ADR 0012, ubiquitous-language.md. Confirmed: **no `apps/web/app/admin/programs/` directory exists**.
- Query 3: `"drift register open blockers failed steps"` — confirmed no open drift entries.
- Files selected from graph: see Petey Plan below.

## Dirstarter Alignment Table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Yes — admin CRUD routing pattern (ADR 0012) |
| Extension or replacement | Extension — adding new admin section following existing pattern |
| Why justified | Courses admin already follows the L1 pattern; Programs admin replicates it |
| Risk if bypassed | Inconsistent admin routing; non-standard CRUD pages |

---

## Petey Plan

### Goal

Assess Course admin CRUD completeness, then plan Program admin CRUD build-out following the same L1 pattern.

### Discovery Summary

**Course admin CRUD — ALREADY EXISTS:**

- `apps/web/app/admin/courses/page.tsx` — list page
- `apps/web/app/admin/courses/new/page.tsx` — create page
- `apps/web/app/admin/courses/[id]/page.tsx` — edit page
- `apps/web/app/admin/courses/_components/` — 6 components (table, columns, toolbar, delete dialog, form, actions, curriculum-items-editor)
- `apps/web/server/admin/courses/` — schema.ts, queries.ts, actions.ts, technique-search-action.ts
- **Web-facing:** `apps/web/app/(web)/courses/page.tsx`, `[slug]/page.tsx`

**Program admin CRUD — DOES NOT EXIST:**

- Web-facing pages exist: `apps/web/app/(web)/programs/` (list, detail, edit, new, enroll, schedules)
- Web server layer exists: `apps/web/server/web/program/` (queries, actions, schemas, payloads)
- **No `apps/web/app/admin/programs/` directory** — no admin list, create, edit, or delete
- **No `apps/web/server/admin/programs/` directory** — no admin queries/actions

**Schema models (all exist in Prisma):**

- `Program`, `ProgramCourse`, `ProgramWaiver`, `ProgramEnrollment`
- `Course`, `CurriculumItem`, `CourseEnrollment`, `CurriculumItemCompletion`

### Tasks

#### SESSION_0139_TASK_01 — Petey Plan: Gap analysis & task decomposition (this plan)

- **Agent:** Petey
- **What:** Analyze existing Course admin CRUD, identify gaps, plan Program admin CRUD build-out.
- **Steps:**
  1. Graphify queries for Course/Program/CurriculumItem admin files
  2. Read existing admin courses pattern for replication
  3. Read programs-curriculum-certification-spec.md for business rules
  4. Produce task list for Cody execution
- **Done means:** This plan block is complete with actionable tasks.
- **Depends on:** nothing

#### SESSION_0139_TASK_02 — Course admin CRUD smoke test

- **Agent:** Cody
- **What:** Verify existing Course admin CRUD is functional — start dev server, hit `/admin/courses`, create/edit/delete a course.
- **Steps:**
  1. Read `apps/web/server/admin/courses/queries.ts` and `actions.ts` — verify brand filter is applied
  2. Start dev server, navigate to `/admin/courses`
  3. Test create, edit, delete flows
  4. Note any bugs or missing brand filtering
- **Done means:** Course admin pages load and CRUD operations work, or bugs are logged.
- **Depends on:** TASK_01

#### SESSION_0139_TASK_03 — Program admin CRUD: server layer (queries + actions + schema)

- **Agent:** Cody
- **What:** Create `apps/web/server/admin/programs/` with `schema.ts`, `queries.ts`, `actions.ts` following the Course admin pattern.
- **Steps:**
  1. **Pre-flight:** Read `docs/knowledge/wiki/dirstarter-component-inventory.md` (mandatory)
  2. Read `apps/web/server/admin/courses/queries.ts` as the pattern source
  3. Create `apps/web/server/admin/programs/schema.ts` — Zod schema for Program create/update
  4. Create `apps/web/server/admin/programs/queries.ts` — `findPrograms` (paginated, brand-filtered), `findProgramById`
  5. Create `apps/web/server/admin/programs/actions.ts` — `createProgram`, `updateProgram`, `deletePrograms`
  6. Run type checker: `cd apps/web && bunx tsc --noEmit`
- **Done means:** Server layer compiles. Brand filter applied in queries. Follows Course admin pattern.
- **Depends on:** TASK_01

#### SESSION_0139_TASK_04 — Program admin CRUD: pages + components

- **Agent:** Cody
- **What:** Create `apps/web/app/admin/programs/` with list, create, edit pages and components following Course admin pattern.
- **Steps:**
  1. **Pre-flight:** Confirm component inventory read (from TASK_03)
  2. Create `apps/web/app/admin/programs/page.tsx` — list page with DataTable
  3. Create `apps/web/app/admin/programs/new/page.tsx` — create page with form
  4. Create `apps/web/app/admin/programs/[id]/page.tsx` — edit page
  5. Create `_components/` — programs-table.tsx, programs-table-columns.tsx, programs-table-toolbar-actions.tsx, programs-delete-dialog.tsx, program-form.tsx, program-actions.tsx
  6. Wire into admin nav (if applicable)
  7. Run type checker + dev server verification
- **Done means:** `/admin/programs` renders with list/create/edit/delete. Brand-scoped. Uses L1 components only.
- **Depends on:** TASK_03

#### SESSION_0139_TASK_05 — Integration test for Program admin brand filtering

- **Agent:** Cody
- **What:** Write `apps/web/server/admin/programs/queries.test.ts` following the Course admin test pattern from SESSION_0138.
- **Steps:**
  1. Copy pattern from `apps/web/server/admin/posts/queries.test.ts`
  2. Mock `db.$transaction`, call `findPrograms` with brand filter
  3. Assert brand is forwarded to Prisma `where` clause
  4. Run: `cd apps/web && bun test server/admin/programs/queries.test.ts`
- **Done means:** Test passes. Brand filter proven.
- **Depends on:** TASK_03

### Parallelism

- TASK_01: first (this plan — already done)
- TASK_02: can run independently (smoke test existing Course admin)
- TASK_03: after TASK_01 (needs plan)
- TASK_04: after TASK_03 (needs server layer)
- TASK_05: after TASK_03, parallel with TASK_04

Execution order: TASK_01 → (TASK_02 ∥ TASK_03) → (TASK_04 ∥ TASK_05)

**Realistic scope for this session:** TASK_01 (done) + TASK_02 + TASK_03. TASK_04 and TASK_05 may spill to SESSION_0140 depending on time.

### Agent Assignments

| Task | Agent | Rationale |
|---|---|---|
| TASK_01 | Petey | Planning and gap analysis — done |
| TASK_02 | Cody | Smoke test — clear execution |
| TASK_03 | Cody | Server layer — follows established pattern |
| TASK_04 | Cody | UI build — follows established pattern, needs pre-flight |
| TASK_05 | Cody | Test — follows SESSION_0138 test pattern |

### Open Decisions

1. Should Program admin pages be added to the admin sidebar nav? (Check if Course admin is in nav — if yes, replicate.)
2. Should ProgramCourse join management be part of the Program form or a separate sub-page?

### Risks

- Course admin CRUD may have bugs (untested until TASK_02).
- Program model has many relations (ProgramCourse, ProgramWaiver, ProgramEnrollment, schedules) — the form may need to be scoped to core fields first, with relation management added later.
- `cuid()` vs `cuid2()` deferred — Program IDs will use current `cuid()` convention.

### Scope Guard

Do NOT:

- Modify existing Course admin code (unless TASK_02 finds a critical bug)
- Build ProgramEnrollment admin (future session)
- Add Stripe/payment integration to Programs
- Touch Schedule admin (already has its own page at `/admin/schedule`)
- Build CurriculumItem admin as a standalone (it's managed within Course form via curriculum-items-editor.tsx)

### Dirstarter Implementation Template

- **Docs read first:** dirstarter-component-inventory.md (mandatory pre-flight for TASK_04)
- **Baseline pattern to extend:** `apps/web/app/admin/courses/` + `apps/web/server/admin/courses/`
- **Custom delta:** Program-specific fields (status, capacity, age range, pricing plan link)
- **No-bypass proof:** Component inventory gate will be enforced — no raw HTML

---

## Task Log

- SESSION_0139_TASK_01 — ✅ done. Petey plan complete.
- SESSION_0139_TASK_02 — ⏳ staged for Cody
- SESSION_0139_TASK_03 — ⏳ staged for Cody
- SESSION_0139_TASK_04 — ⏳ staged for Cody (may spill to SESSION_0140)
- SESSION_0139_TASK_05 — ⏳ staged for Cody (may spill to SESSION_0140)

## What Landed

- **Petey plan for Program admin CRUD** — full gap analysis via Graphify, discovered Course admin CRUD already exists (7 components + server layer), Program admin is the real gap (no admin directory at all despite web-facing pages existing)
- **5 tasks staged** for Cody execution: Course smoke test, Program server layer, Program pages + components, Program brand filter test
- **FS-0020 logged** — grep-first navigation pattern identified and corrective action recorded
- **Session type convention adopted** — `session--open/plan/implement/review` added to `opening.md` (SESSION_0139+)

## Files Touched

| File | Note |
| --- | --- |
| `docs/sprints/SESSION_0139.md` | New — this session file with Petey plan |
| `docs/protocols/project-log.md` | Modified — SESSION_0139 task plan + review |
| `docs/protocols/failed-steps-log.md` | Modified — FS-0020 (grep-first instead of Graphify) |
| `docs/rituals/opening.md` | Modified — added `session--plan/implement/review` type convention |
| `docs/knowledge/wiki/index.md` | Modified — added SESSION_0139 entry |

## Decisions Resolved

- Course admin CRUD: confirmed already built — not a gap. SESSION_0138 next-session suggestion was slightly misframed.
- Program admin CRUD: confirmed as the real S6 gap. 5 tasks decomposed.

## Open Decisions / Blockers

- 🔴 Resend domain DNS pending verification — 27th session carried
- 🟡 Docker Desktop not running — MinIO untested (carried from 0131)
- 🟡 `cuid()` vs `cuid2()` whole-schema migration deferred (finding 0136-02)
- 🟡 Tiptap rich text editor deferred (future session)
- 🟡 Should ProgramCourse join management be part of Program form or separate sub-page? (decision for TASK_04)
- 🟡 Should Program admin appear in admin sidebar nav? (check Course admin nav presence first)

## Reflections

Pure Petey session — no code written, all planning. The key insight was that SESSION_0138's "next session" suggestion of "Course + CurriculumItem admin CRUD" was based on the program-plan S6 label, not on what actually exists in the repo. Graphify queries in under 30 seconds revealed that Course admin CRUD is already fully built (7 components, 4 server files, 3 pages), while Program admin has zero admin presence despite having a full web-facing stack. This is exactly the kind of discovery that saves a session from building something that already exists. The 5-task decomposition for Program admin CRUD follows the proven Course admin pattern — Cody should be able to replicate it mechanically.

## Hostile Close Review (SESSION_0139)

### Scope: This session only

**Findings:** None.

| # | Severity | Finding | Status |
| --- | --- | --- | --- |
| — | — | No findings | — |

**ADR Compliance:**

| ADR | Compliance | Notes |
| --- | --- | --- |
| 0004 (brand column) | ✅ | Plan requires brand filter in Program admin queries (TASK_03) |
| 0012 (admin CRUD routing) | ✅ | Plan follows flat admin routing pattern |

**L1 Pattern Compliance:**

| Pattern | Compliance | Notes |
| --- | --- | --- |
| Admin CRUD pattern | ✅ | TASK_03/04 explicitly copy Course admin structure |
| Component inventory gate | ✅ | Pre-flight required in TASK_03/04 steps |

**Dirstarter docs check:** not applicable — planning-only session
**Verdict:** Clean. No findings.

### Kaizen Reflection Triage

1. **Is this safe and secure?** Yes. No code changes. Plan enforces brand filter.
2. **How many failed steps could we have prevented?** Zero — no execution this session.
3. **Confidence 1–10:**
   - 100 users: 9
   - 1,000 users: 9
   - 10,000 users: 9
   - **Aggregate: 9** (maintained)

## Full Close Evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `failed-steps-log.md`, `opening.md`, `wiki/index.md`: `updated` → 2026-05-12, `last_agent` → copilot-session-0139. `project-log.md`: already current. |
| Backlinks/index sweep | `failed-steps-log.md`: added SESSION_0139 backlink. `wiki/index.md`: SESSION_0139 row added. Spot-checked SESSION_0134–0139: all present. |
| Wiki lint | `bun run wiki:lint` → ✅ No lint violations found. 290 files scanned. |
| Kaizen reflection | Reflections section present: yes |
| Hostile close review | SESSION_0139_REVIEW_01 in project-log.md + hostile close section above. Kaizen aggregate: 9. |
| Review & Recommend | Next session goal written: yes |
| Memory sweep | Session type convention (`session--open/plan/implement/review`) added to `opening.md`. FS-0020 logged in `failed-steps-log.md`. No operator memory update needed. |
| Next session unblock check | Unblocked — Cody can begin TASK_02 immediately |
| Git hygiene | Branch: main. Worktrees: 1 (main only). 5 files changed (4M + 1new). No secrets. User to authorize commit. |
| Graphify update | `graphify update .` → 223 nodes, 458 edges, 629 communities. |

## Next Session

- **Goal:** SESSION_0140 — Program admin CRUD: server layer + pages (Cody execution of TASK_02–05 from SESSION_0139 plan)
- **Inputs to read:** `docs/sprints/SESSION_0139.md` (this plan), `docs/knowledge/wiki/dirstarter-component-inventory.md` (mandatory pre-flight for TASK_04), `apps/web/server/admin/courses/queries.ts` (pattern source), `apps/web/app/admin/courses/page.tsx` (pattern source)
- **First task:** TASK_02 — Course admin CRUD smoke test (verify the pattern source works before replicating it)
- **Execution order:** TASK_02 → TASK_03 → (TASK_04 ∥ TASK_05)
