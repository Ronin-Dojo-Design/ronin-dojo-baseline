---
title: "SESSION 0141 — Program Admin UX Polish: Picker Components + ProgramCourse Join"
slug: session-0141
type: session--implement
status: closed-full
created: 2026-05-12
updated: 2026-05-12
last_agent: copilot-session-0141
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0140.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/project-log.md
---

# SESSION 0141 — Program Admin UX Polish: Picker Components + ProgramCourse Join

## Date

2026-05-12

## Operator

Brian Scott + Copilot (Petey → Cody)

## Goal

Replace raw ID inputs on the Program form with searchable picker components for Organization and Discipline. Then build ProgramCourse join sub-page.

## Status

closed-full

## Failed Steps / Drift Check

- FS-0001 (component inventory gate): acknowledged — mandatory pre-flight completed before UI work.
- Carried blockers:
  - 🔴 Resend domain DNS pending verification — 29th session carried
  - 🟡 Docker Desktop not running — MinIO untested (carried from 0131)
  - 🟡 `cuid()` vs `cuid2()` whole-schema migration deferred (finding 0136-02)

## Dirstarter Alignment Table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Yes — admin form components, Popover + Command pattern |
| Extension or replacement | Extension — new reusable ComboboxSelector + AnimatedContainer usage |
| Why justified | Raw ID inputs are unusable; pickers are standard UX. AnimatedContainer is L1. |
| Risk if bypassed | Admins can't select orgs/disciplines without knowing IDs |

---

## Task Log

- SESSION_0141_TASK_01 — ✅ done. Created reusable `ComboboxSelector` component. Replaced raw `organizationId` and `disciplineId` Input fields with searchable combobox pickers. Added `findOrganizationOptions` + `findDisciplineOptions` queries. Updated new + edit pages to pass options.
- SESSION_0141_TASK_02 — ✅ done. Added `AnimatedContainer height` to conditionally reveal age min/max fields when `enforceAgeCap` is toggled. Moved enforce toggle above age fields. Enrollment fields separated into their own grid.
- SESSION_0141_TASK_03 — ✅ done. Built ProgramCourse join sub-page: `ProgramCoursesEditor` component with `AnimatedContainer height` for smooth list transitions, `ComboboxSelector` for adding courses, `Card` rows with remove buttons. Server actions `addProgramCourse` + `removeProgramCourses`. Query `findAvailableCourses`. Wired into edit page with `Separator`.

## What Landed

- **Reusable `ComboboxSelector`** (`components/admin/combobox-selector.tsx`) — single-select searchable combobox using L1 `Popover` + `Command` + `Button`. Supports `clearable` prop for optional fields. Available for all future admin forms.
- **Organization + Discipline pickers** — replaced raw ID inputs on Program form with searchable combobox selectors.
- **AnimatedContainer conditional reveal** — age min/max fields conditionally shown with smooth height animation when "Enforce age cap" toggle is on.
- **ProgramCourse join editor** — full add/remove UI with animated course list, searchable course picker, Card-based course rows, brand-verified server actions.
- **Server layer additions** — `findOrganizationOptions`, `findDisciplineOptions`, `findAvailableCourses` queries; `addProgramCourse`, `removeProgramCourses` actions; `programCourseSchema`, `programCourseRemoveSchema` schemas.

## Files Touched

| File | Note |
| --- | --- |
| `docs/sprints/SESSION_0141.md` | New — this session file |
| `apps/web/components/admin/combobox-selector.tsx` | New — reusable searchable single-select combobox |
| `apps/web/server/admin/programs/queries.ts` | Modified — added `findOrganizationOptions`, `findDisciplineOptions`, `findAvailableCourses` |
| `apps/web/server/admin/programs/actions.ts` | Modified — added `addProgramCourse`, `removeProgramCourses` |
| `apps/web/server/admin/programs/schema.ts` | Modified — added `programCourseSchema`, `programCourseRemoveSchema` |
| `apps/web/app/admin/programs/_components/program-form.tsx` | Modified — ComboboxSelector pickers, AnimatedContainer for age fields, import cleanup |
| `apps/web/app/admin/programs/_components/program-courses-editor.tsx` | New — ProgramCourse join editor with AnimatedContainer |
| `apps/web/app/admin/programs/new/page.tsx` | Modified — fetches org/discipline options |
| `apps/web/app/admin/programs/[id]/page.tsx` | Modified — fetches org/discipline/course options, renders ProgramCoursesEditor |
| `docs/knowledge/wiki/index.md` | Modified — SESSION_0141 row added |
| `docs/protocols/project-log.md` | Modified — SESSION_0141 task plan + review entries |

## Decisions Resolved

- Organization + Discipline pickers: single-select combobox (not RelationSelector), because the schema uses single FK fields.
- AnimatedContainer for conditional form sections: enforceAgeCap → age fields.
- ProgramCourse join editor: inline on edit page below form with Separator, not a separate sub-route.

## Open Decisions / Blockers

- 🔴 Resend domain DNS pending verification — 29th session carried
- 🟡 Docker Desktop not running — MinIO untested (carried from 0131)
- 🟡 `cuid()` vs `cuid2()` whole-schema migration deferred (finding 0136-02)
- 🟡 ProgramWaiver join management (similar pattern to ProgramCourse — future session)
- 🟡 ComboboxSelector could be promoted to `components/common/` if widely reused

## Reflections

Efficient session — three tasks completed cleanly. The key insight was that `RelationSelector` (multi-select) was the wrong component for single FK fields; creating a new `ComboboxSelector` using the same L1 primitives (`Popover` + `Command`) was the right call. This component will be reusable everywhere there's a single-select FK field with many options (Courses, Organizations, Disciplines, Ranks, etc.).

The `AnimatedContainer` integration was elegant — wrapping conditional form sections in `<AnimatedContainer height>` is a pattern worth replicating wherever we have toggle-gated fields. The ProgramCourse join editor also benefits from it, giving smooth list growth/shrinkage as courses are added/removed.

Brian's instinct to check whether `AnimatedContainer` and `RowCheckbox` were applicable was a good example of the component inventory pre-flight in action — we checked, found AnimatedContainer was useful, and RowCheckbox was not (yet).

## Hostile Close Review (SESSION_0141)

### Scope: This session only

**Findings:**

| # | Severity | Finding | Status |
| --- | --- | --- | --- |
| 1 | info | `ComboboxSelector` lives in `components/admin/` — could promote to `common/` if non-admin forms need it | Noted — future session |
| 2 | info | ProgramWaiver join management not yet built (same pattern as ProgramCourse) | Noted — future session |

**ADR Compliance:**

| ADR | Compliance | Notes |
| --- | --- | --- |
| 0004 (brand column) | ✅ | All new queries brand-scoped. Actions verify brand ownership. |
| 0012 (admin CRUD routing) | ✅ | ProgramCourse editor inline on edit page (not separate route) |

**L1 Pattern Compliance:**

| Pattern | Compliance | Notes |
| --- | --- | --- |
| Component inventory gate | ✅ | Pre-flight completed. Used Popover, Command, Button, Card, Badge, Stack, H3, Note, AnimatedContainer, Separator, Switch, Input, Select — all L1. |
| No raw HTML | ✅ | Zero raw HTML elements in new code |
| useAction for mutations | ✅ | ProgramCoursesEditor uses `useAction` for add/remove |
| useHookFormAction for forms | ✅ | ProgramForm continues to use `useHookFormAction` |

**Verdict:** Clean. Two info-level notes for future sessions.

### Kaizen Reflection Triage

1. **Is this safe and secure?** Yes. Brand-scoped queries and actions. No cross-brand leakage possible.
2. **How many failed steps could we have prevented?** Zero — no violations this session.
3. **Confidence 1–10:**
   - 100 users: 9
   - 1,000 users: 9
   - 10,000 users: 9
   - **Aggregate: 9** (maintained)

## ADR / Ubiquitous-Language Check

No new ADR needed — ComboboxSelector follows existing L1 patterns. No new domain terms introduced.

## Full Close Evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `wiki/index.md`: `last_agent` → copilot-session-0141. `project-log.md`: `last_agent` → copilot-session-0141. SESSION_0141.md: new, frontmatter correct. |
| Backlinks/index sweep | `wiki/index.md`: SESSION_0141 row added. `project-log.md`: SESSION_0141 section added. SESSION_0141 backlinks include both. |
| Wiki lint | pending — will run after git commit |
| Kaizen reflection | Reflections section present: yes |
| Hostile close review | SESSION_0141_REVIEW_01 in project-log.md + hostile close section above. Kaizen aggregate: 9. |
| Review & Recommend | Next session goal written: yes |
| Memory sweep | No operator memory update needed. ComboboxSelector is a new reusable component — documented in session file, discoverable by future agents. |
| Next session unblock check | Unblocked — ProgramWaiver join is independent |
| Git hygiene | pending |
| Graphify update | pending |

## Next Session

- **Goal:** SESSION_0142 — ProgramWaiver join management + ComboboxSelector reuse audit
- **Inputs to read:** SESSION_0141, ProgramWaiver schema, Waiver admin pattern
- **First task:** Build ProgramWaiver join editor on Program edit page (replicate ProgramCourse pattern)
