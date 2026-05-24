---
title: "SESSION 0140 — Cody: Program Admin CRUD Server Layer + Pages"
slug: session-0140
type: session--implement
status: closed-full
created: 2026-05-12
updated: 2026-05-12
last_agent: copilot-session-0140
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0139.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/project-log.md
---

# SESSION 0140 — Cody: Program Admin CRUD Server Layer + Pages

## Date

2026-05-12

## Operator

Brian Scott + Copilot (Petey → Cody)

## Goal

Execute SESSION_0139 plan TASK_02–05: Course admin smoke test, Program admin server layer, Program admin pages + components, brand filter test.

## Status

closed-full

## Failed Steps / Drift Check

- FS-0001 (component inventory gate): acknowledged — mandatory pre-flight before TASK_04.
- FS-0020 (grep-first navigation): acknowledged — using Graphify queries this session.
- Drift register: no open entries affecting this session. D-007, D-008 deferred.
- Carried blockers:
  - 🔴 Resend domain DNS pending verification — 28th session carried
  - 🟡 Docker Desktop not running — MinIO untested (carried from 0131)
  - 🟡 `cuid()` vs `cuid2()` whole-schema migration deferred (finding 0136-02)

## Graphify Check

- Graph status: one commit behind HEAD (`298bc9c`), was rebuilt at end of SESSION_0139 (`29d8b53`). Close enough — no update needed.
- Query 1: `"program admin CRUD server queries actions schema"` — confirmed no `server/admin/programs/` exists; surfaced Course admin pattern files as expected.
- Query 2: `"admin sidebar navigation menu links config"` — surfaced `components/admin/sidebar.tsx` + `config/links.ts`. Confirmed Courses is in sidebar nav; Programs is not.
- **Open decision resolved:** Programs admin SHOULD be added to sidebar nav (Courses is present → replicate).
- Files selected from graph: `server/admin/courses/{schema,queries,actions}.ts`, `components/admin/sidebar.tsx`, `app/admin/courses/page.tsx`

## Dirstarter Alignment Table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Yes — admin CRUD routing pattern, sidebar nav |
| Extension or replacement | Extension — new admin section + sidebar entry |
| Why justified | Courses admin follows L1; Programs replicates it |
| Risk if bypassed | Inconsistent admin routing; missing admin nav entry |

---

## Petey Orchestration

### Execution Plan (from SESSION_0139)

| Task | Agent | Status | Notes |
| --- | --- | --- | --- |
| TASK_02 — Course admin CRUD smoke test | Cody | ⏳ | Verify pattern source works |
| TASK_03 — Program admin server layer | Cody | ⏳ | schema + queries + actions |
| TASK_04 — Program admin pages + components | Cody | ⏳ | UI build, pre-flight required |
| TASK_05 — Brand filter test | Cody | ⏳ | Can parallel with TASK_04 |

### Decisions Resolved (Petey)

1. **Program admin in sidebar nav?** → YES. Courses is present at line ~97 of `sidebar.tsx`. Add Programs after Courses with `LayoutGridIcon` or similar.
2. **ProgramCourse join management?** → Defer to separate sub-page. Keep TASK_04 form scoped to core Program fields only.

### Handoff to Cody

Cody: execute TASK_02 → TASK_03 → TASK_04 → TASK_05 in order. Pre-flight component inventory before TASK_04. One task at a time, type-check between tasks.

---

## Task Log

- SESSION_0139_TASK_02 — ✅ done. Course admin smoke test passed. Brand filter verified in queries + actions. Route loads (auth-gated 307).
- SESSION_0139_TASK_03 — ✅ done. `server/admin/programs/{schema,queries,actions}.ts` created. Brand filter applied. Type-checks clean.
- SESSION_0139_TASK_04 — ✅ done. `app/admin/programs/` — 3 pages + 6 components created. Sidebar nav wired (`BoxIcon`). Type-checks clean.
- SESSION_0139_TASK_05 — ✅ done. `queries.test.ts` — 3 tests pass (brand filter, name+brand merge, status+brand merge).

## What Landed

- **Program admin CRUD — full stack:** server layer (schema + queries + actions), 3 pages (list, new, edit), 6 components (table, columns, toolbar actions, delete dialog, form, row actions)
- **Admin sidebar nav:** Programs entry added after Courses
- **Brand filter integration test:** 3 tests proving brand isolation
- **All from SESSION_0139 plan** — TASK_02 through TASK_05 complete in one session

## Files Touched

| File | Note |
| --- | --- |
| `docs/sprints/SESSION_0140.md` | New — this session file |
| `apps/web/server/admin/programs/schema.ts` | New — Zod schema + table params |
| `apps/web/server/admin/programs/queries.ts` | New — findPrograms, findProgramById, findProgramList |
| `apps/web/server/admin/programs/actions.ts` | New — upsertProgram, deletePrograms |
| `apps/web/server/admin/programs/queries.test.ts` | New — brand filter integration test |
| `apps/web/app/admin/programs/page.tsx` | New — list page |
| `apps/web/app/admin/programs/new/page.tsx` | New — create page |
| `apps/web/app/admin/programs/[id]/page.tsx` | New — edit page |
| `apps/web/app/admin/programs/_components/programs-table.tsx` | New |
| `apps/web/app/admin/programs/_components/programs-table-columns.tsx` | New |
| `apps/web/app/admin/programs/_components/programs-table-toolbar-actions.tsx` | New |
| `apps/web/app/admin/programs/_components/programs-delete-dialog.tsx` | New |
| `apps/web/app/admin/programs/_components/program-form.tsx` | New |
| `apps/web/app/admin/programs/_components/program-actions.tsx` | New |
| `apps/web/components/admin/sidebar.tsx` | Modified — added Programs nav entry |

## Decisions Resolved

- Programs admin in sidebar: YES — added after Courses with `BoxIcon`
- ProgramCourse join management: deferred to separate sub-page (future session)

## Open Decisions / Blockers

- 🔴 Resend domain DNS pending verification — 28th session carried
- 🟡 Docker Desktop not running — MinIO untested (carried from 0131)
- 🟡 `cuid()` vs `cuid2()` whole-schema migration deferred (finding 0136-02)
- 🟡 ProgramCourse join management sub-page (future session)
- 🟡 Organization/Discipline picker components (currently raw ID input — improve in future session)

## Reflections

Clean Cody execution session — all 4 tasks from SESSION_0139 Petey plan completed in one session. The Course admin pattern replicated mechanically to Programs exactly as planned. Key decisions resolved: sidebar nav (yes, add it) and ProgramCourse management (defer). The form is scoped to core fields with raw ID inputs for org/discipline — a future session should add picker components. Zero type errors in new code. Brand filter proven by 3 passing tests.

## Hostile Close Review (SESSION_0140)

### Scope: This session only

**Findings:**

| # | Severity | Finding | Status |
| --- | --- | --- | --- |
| 1 | low | Org/Discipline fields use raw ID input instead of picker | Acknowledged — deferred to future session |

**ADR Compliance:**

| ADR | Compliance | Notes |
| --- | --- | --- |
| 0004 (brand column) | ✅ | Brand filter in queries + actions. Test proves isolation. |
| 0012 (admin CRUD routing) | ✅ | Flat `/admin/programs/` pattern followed |

**L1 Pattern Compliance:**

| Pattern | Compliance | Notes |
| --- | --- | --- |
| Admin CRUD pattern | ✅ | Exact replica of Course admin structure |
| Component inventory gate | ✅ | All UI uses L1 components (Form, Input, Select, Switch, Button, Stack, Badge, etc.) |
| No raw HTML | ✅ | Zero raw HTML elements |

**Verdict:** Clean. One low-severity known gap (picker components).

### Kaizen Reflection Triage

1. **Is this safe and secure?** Yes. Brand filter proven by test. Delete requires brand match.
2. **How many failed steps could we have prevented?** Zero — no violations this session.
3. **Confidence 1–10:**
   - 100 users: 9
   - 1,000 users: 9
   - 10,000 users: 9
   - **Aggregate: 9** (maintained)

## Full Close Evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `wiki/index.md`: `last_agent` → copilot-session-0140. `project-log.md`: SESSION_0140 entries added. SESSION_0140.md: new, frontmatter correct. |
| Backlinks/index sweep | `wiki/index.md`: SESSION_0140 row added. Spot-checked SESSION_0137–0140: all present. |
| Wiki lint | `bun run wiki:lint` → ✅ No lint violations found. 291 files scanned. |
| Kaizen reflection | Reflections section present: yes |
| Hostile close review | SESSION_0140_REVIEW_01 in project-log.md + hostile close section above. Kaizen aggregate: 9. |
| Review & Recommend | Next session goal written: yes |
| Memory sweep | No operator memory update needed. No new protocols or conventions introduced. |
| Next session unblock check | Unblocked — picker component work is independent |
| Git hygiene | Branch: main. Committed `b97ec68`. Pushed to origin. 17 files (14 new, 3 modified). No secrets. |
| Graphify update | `graphify update .` → 5415 nodes, 10382 edges, 632 communities. |

## Next Session

- **Goal:** SESSION_0141 — Program admin UX polish: Organization/Discipline picker components, ProgramCourse join sub-page
- **First task:** Replace raw ID inputs with searchable picker components for Organization and Discipline on the Program form
- **Execution order:** Picker components → ProgramCourse sub-page
